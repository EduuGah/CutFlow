-- ===========================================================================
-- CutFlow -- contas de demonstração (testar sem criar conta)
--
--   usuário admin     senha admin     -> Dono (visão geral, equipe, serviços)
--   usuário barbeiro  senha barbeiro  -> Barbeiro (o dia e os bloqueios)
--   usuário cliente   senha cliente   -> Cliente (marca horário)
--
-- A tela de login aceita o usuário curto: "admin" vira admin@demo.cutflow.app
-- (src/config/demo.ts). Também tem um botão para cada conta.
--
-- Como rodar: cole no SQL Editor do Supabase e execute. Pode rodar de novo
-- quando quiser -- as senhas e os perfis voltam ao padrão.
--
-- Dono e barbeiro entram na barbearia do dono mais antigo do projeto (ou na
-- primeira barbearia; sem nenhuma, uma é criada). O barbeiro ganha grade de
-- segunda a sábado e, se a barbearia não tiver serviço ativo, dois serviços de
-- exemplo são criados -- sem isso o cliente não teria horário para marcar.
-- ===========================================================================

create or replace function pg_temp.demo_auth_user(p_email text, p_password text, p_meta jsonb)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);

  if v_id is null then
    v_id := gen_random_uuid();

    -- Tokens vazios (e não nulos) são exigidos pelo GoTrue: com NULL o login
    -- falha com "Database error querying schema".
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    )
    values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', p_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      p_meta, now(), now(),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', p_email, 'email_verified', true),
      now(), now(), now()
    );
  else
    update auth.users
    set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        banned_until = null,
        updated_at = now()
    where id = v_id;
  end if;

  return v_id;
end;
$$;

do $$
declare
  v_shop uuid;
  v_user uuid;
  v_account record;
begin
  select barbershop_id into v_shop
  from public.users
  where role = 'ADMIN'
    and barbershop_id is not null
    and email not like '%@demo.cutflow.app'
  order by created_at
  limit 1;

  if v_shop is null then
    select id into v_shop from public.barbershops order by created_at limit 1;
  end if;

  if v_shop is null then
    insert into public.barbershops (name, slug)
    values ('Barbearia CutFlow', 'barbearia-cutflow')
    returning id into v_shop;
  end if;

  for v_account in
    select * from (values
      ('admin',    'Dono (demonstração)',     'ADMIN'::public.user_role),
      ('barbeiro', 'Barbeiro (demonstração)', 'BARBER'::public.user_role),
      ('cliente',  'Cliente (demonstração)',  'CUSTOMER'::public.user_role)
    ) as t(username, full_name, role)
  loop
    v_user := pg_temp.demo_auth_user(
      v_account.username || '@demo.cutflow.app',
      v_account.username,
      jsonb_build_object('full_name', v_account.full_name, 'role', v_account.role)
    );

    -- A trigger de cadastro pode já ter criado o perfil (como CUSTOMER);
    -- aqui ele fica com o papel e a barbearia certos de qualquer forma.
    insert into public.users (id, email, full_name, role, barbershop_id)
    values (
      v_user,
      v_account.username || '@demo.cutflow.app',
      v_account.full_name,
      v_account.role,
      case when v_account.role = 'CUSTOMER' then null else v_shop end
    )
    on conflict (id) do update
    set full_name = excluded.full_name,
        role = excluded.role,
        barbershop_id = excluded.barbershop_id;

    if v_account.role = 'BARBER' then
      -- Segunda (1) a sábado (6), 9h às 19h, almoço 12h às 13h.
      insert into public.barber_schedules (barber_id, day_of_week, start_time, end_time, lunch_start, lunch_end)
      select v_user, d, '09:00', '19:00', '12:00', '13:00'
      from generate_series(1, 6) as d
      on conflict (barber_id, day_of_week) do nothing;
    end if;
  end loop;

  if not exists (
    select 1 from public.services where barbershop_id = v_shop and is_active
  ) then
    insert into public.services (name, description, price, duration_minutes, barbershop_id)
    values
      ('Corte', 'Tesoura e máquina, com acabamento', 45, 30, v_shop),
      ('Corte + Barba', 'Corte completo e barba alinhada na navalha', 70, 45, v_shop);
  end if;
end;
$$;
