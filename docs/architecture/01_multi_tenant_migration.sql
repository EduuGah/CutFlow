-- 1. Criação da tabela barbershops
create table public.barbershops (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now() not null
);

-- Habilitar RLS
alter table public.barbershops enable row level security;

-- Políticas de RLS para barbershops
create policy "Todos autenticados podem ver as barbearias" on public.barbershops
  for select using (auth.role() = 'authenticated');

-- 2. Adicionar barbershop_id nas tabelas existentes

-- Users (Admins e Barbeiros pertencem a uma barbearia; Clientes são globais e terão null)
alter table public.users 
add column barbershop_id uuid references public.barbershops(id) on delete set null;

-- Services (Serviços são específicos de cada barbearia)
alter table public.services 
add column barbershop_id uuid references public.barbershops(id) on delete cascade;

-- Appointments (Para facilitar queries, um agendamento pertence a uma barbearia)
alter table public.appointments 
add column barbershop_id uuid references public.barbershops(id) on delete cascade;

-- 3. Atualizar Políticas RLS para isolamento (Multi-tenant)

-- SERVICES
-- Remover políticas antigas de services
drop policy if exists "Todos autenticados podem ver os serviços" on public.services;
drop policy if exists "Admins podem inserir serviços" on public.services;
drop policy if exists "Admins podem atualizar serviços" on public.services;
drop policy if exists "Admins podem deletar serviços" on public.services;

-- Novas políticas de services
create policy "Todos autenticados podem ver serviços" on public.services
  for select using (auth.role() = 'authenticated'); -- ou restringir por barbearia ativa no front

create policy "Admins gerenciam serviços da sua barbearia" on public.services
  for all using (
    exists (
      select 1 from public.users 
      where id = auth.uid() 
      and role = 'ADMIN' 
      and barbershop_id = services.barbershop_id
    )
  );

-- APPOINTMENTS
-- Remover políticas antigas
drop policy if exists "Clientes veem seus próprios agendamentos" on public.appointments;
drop policy if exists "Barbeiros veem os agendamentos atribuídos a eles" on public.appointments;

-- Novas políticas de appointments
create policy "Clientes veem e criam seus próprios agendamentos" on public.appointments
  for all using (auth.uid() = customer_id);

create policy "Barbeiros veem agendamentos da sua barbearia" on public.appointments
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'BARBER'
      and barbershop_id = appointments.barbershop_id
    )
  );

create policy "Admins veem agendamentos da sua barbearia" on public.appointments
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'ADMIN'
      and barbershop_id = appointments.barbershop_id
    )
  );

-- USERS (Isolamento de listagem de barbeiros e admins)
drop policy if exists "Usuários autenticados podem ver perfis" on public.users;

create policy "Usuários podem ver seu próprio perfil e perfis da sua barbearia" on public.users
  for select using (
    auth.uid() = id -- Vê a si mesmo
    or role = 'CUSTOMER' -- Todos podem ver clientes (se necessário para agendar)
    or (
      -- Admins e Barbeiros veem outros membros da mesma barbearia
      barbershop_id in (
        select barbershop_id from public.users where id = auth.uid()
      )
    )
  );
