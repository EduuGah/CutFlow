-- Extensão para UUIDs (geralmente já habilitada no Supabase)
create extension if not exists "uuid-ossp";

-- 1. Criação dos Tipos ENUM
create type public.user_role as enum ('ADMIN', 'BARBER', 'CUSTOMER');
create type public.appointment_status as enum ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- 2. Tabela users
create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  role user_role default 'CUSTOMER'::user_role not null,
  phone text,
  created_at timestamp with time zone default now() not null
);

-- 3. Tabela services
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  duration_minutes integer not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null
);

-- 4. Tabela barber_schedules
create table public.barber_schedules (
  id uuid default uuid_generate_v4() primary key,
  barber_id uuid references public.users(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  lunch_start time,
  lunch_end time,
  unique(barber_id, day_of_week)
);

-- 5. Tabela time_offs
create table public.time_offs (
  id uuid default uuid_generate_v4() primary key,
  barber_id uuid references public.users(id) on delete cascade not null,
  start_datetime timestamp with time zone not null,
  end_datetime timestamp with time zone not null,
  reason text
);

-- 6. Tabela appointments
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.users(id) on delete cascade not null,
  barber_id uuid references public.users(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  start_datetime timestamp with time zone not null,
  end_datetime timestamp with time zone not null,
  status appointment_status default 'CONFIRMED'::appointment_status not null,
  created_at timestamp with time zone default now() not null
);

-- 7. Tabela reviews
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null unique,
  customer_id uuid references public.users(id) on delete cascade not null,
  barber_id uuid references public.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now() not null
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.barber_schedules enable row level security;
alter table public.time_offs enable row level security;
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;

-- Políticas de RLS Básicas (Policies)

-- USERS: Qualquer um autenticado pode ler, mas apenas a própria pessoa (ou Admin) pode atualizar
create policy "Usuários autenticados podem ver perfis" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Usuários podem atualizar o próprio perfil" on public.users
  for update using (auth.uid() = id);

-- SERVICES: Todos autenticados podem ver os serviços
create policy "Todos autenticados podem ver os serviços" on public.services
  for select using (auth.role() = 'authenticated');

create policy "Admins podem inserir serviços" on public.services
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem atualizar serviços" on public.services
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem deletar serviços" on public.services
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

-- BARBER SCHEDULES: Todos autenticados podem ver, mas Admins podem gerenciar
create policy "Todos autenticados podem ver as agendas dos barbeiros" on public.barber_schedules
  for select using (auth.role() = 'authenticated');

create policy "Admins podem inserir na agenda" on public.barber_schedules
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem atualizar a agenda" on public.barber_schedules
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem deletar a agenda" on public.barber_schedules
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

-- APPOINTMENTS: Clientes veem os seus, Barbeiros veem os seus
create policy "Clientes veem seus próprios agendamentos" on public.appointments
  for select using (auth.uid() = customer_id);

create policy "Barbeiros veem os agendamentos atribuídos a eles" on public.appointments
  for select using (auth.uid() = barber_id);

-- Notas Importantes:
-- 1. As permissões de INSERT/UPDATE completas (para Admins) ou de inserção 
-- de agendamentos precisarão ser refinadas mais tarde com base na lógica exata do app.
-- Este arquivo inicializa a estrutura base com segurança padrão ligada (RLS ativado).

-- REVIEWS: Clientes podem inserir suas próprias avaliações e todos podem ler
create policy "Todos autenticados podem ver avaliações" on public.reviews
  for select using (auth.role() = 'authenticated');

create policy "Clientes podem inserir avaliações" on public.reviews
  for insert with check (auth.uid() = customer_id);


-- TIME_OFFS: Todos podem ver, barbeiros gerenciam os seus, admins gerenciam todos
create policy "Todos autenticados podem ver as time_offs" on public.time_offs
  for select using (auth.role() = 'authenticated');

create policy "Barbeiros podem inserir time_offs" on public.time_offs
  for insert with check (auth.uid() = barber_id);

create policy "Barbeiros podem deletar time_offs" on public.time_offs
  for delete using (auth.uid() = barber_id);

