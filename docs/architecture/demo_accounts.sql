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
-- Funciona com ou sem o esquema de várias barbearias. Com ele, dono e
-- barbeiro entram na barbearia do dono mais antigo (ou na primeira; sem
-- nenhuma, uma é criada). O barbeiro ganha grade de
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
  -- O esquema com várias barbearias (01_multi_tenant_migration.sql) é
  -- opcional: sem ele, public.users não tem barbershop_id e o script segue
  -- com uma barbearia só. Tudo que cita a coluna vai por SQL dinâmico.
  v_multi boolean := exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'barbershop_id'
  );
begin
  if v_multi then
    execute $q$
      select barbershop_id from public.users
      where role = 'ADMIN' and barbershop_id is not null and email not like '%@demo.cutflow.app'
      order by created_at limit 1
    $q$ into v_shop;

    if v_shop is null then
      select id into v_shop from public.barbershops order by created_at limit 1;
    end if;

    if v_shop is null then
      insert into public.barbershops (name, slug)
      values ('Barbearia CutFlow', 'barbearia-cutflow')
      returning id into v_shop;
    end if;
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
    -- aqui ele fica com o papel certo de qualquer forma.
    insert into public.users (id, email, full_name, role)
    values (v_user, v_account.username || '@demo.cutflow.app', v_account.full_name, v_account.role)
    on conflict (id) do update
    set full_name = excluded.full_name,
        role = excluded.role;

    if v_multi then
      execute 'update public.users set barbershop_id = $1 where id = $2'
      using case when v_account.role = 'CUSTOMER' then null else v_shop end, v_user;
    end if;

    if v_account.role = 'BARBER' then
      -- Segunda (1) a sábado (6), 9h às 19h, almoço 12h às 13h.
      insert into public.barber_schedules (barber_id, day_of_week, start_time, end_time, lunch_start, lunch_end)
      select v_user, d, '09:00', '19:00', '12:00', '13:00'
      from generate_series(1, 6) as d
      on conflict (barber_id, day_of_week) do nothing;
    end if;
  end loop;

  -- Sem serviço ativo o cliente não tem o que marcar.
  if v_multi then
    if not exists (select 1 from public.services where is_active and barbershop_id = v_shop) then
      execute $q$
        insert into public.services (name, description, price, duration_minutes, barbershop_id)
        values
          ('Corte', 'Tesoura e máquina, com acabamento', 45, 30, $1),
          ('Corte + Barba', 'Corte completo e barba alinhada na navalha', 70, 45, $1)
      $q$ using v_shop;
    end if;
  elsif not exists (select 1 from public.services where is_active) then
    insert into public.services (name, description, price, duration_minutes)
    values
      ('Corte', 'Tesoura e máquina, com acabamento', 45, 30),
      ('Corte + Barba', 'Corte completo e barba alinhada na navalha', 70, 45);
  end if;
end;
$$;
