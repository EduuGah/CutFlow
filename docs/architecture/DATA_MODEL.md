# Modelagem de Dados (Data Model) - CutFlow

Este documento define o esquema relacional do banco de dados (PostgreSQL), planejado para ser executado no Supabase. O Supabase cuidará da autenticação (via `auth.users`) e aplicaremos segurança a nível de linha (RLS - Row Level Security) em cima destas tabelas.

## Enums
*   `user_role`: `ADMIN`, `BARBER`, `CUSTOMER`
*   `appointment_status`: `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

## Tabelas

### 1. `users` (Perfis Públicos / RBAC)
Armazena os dados complementares dos usuários. A chave primária é ligada ao sistema de autenticação do Supabase.

*   `id` (UUID, Primary Key) - Referência a `auth.users.id`.
*   `email` (String, Unique, Not Null)
*   `full_name` (String, Not Null)
*   `role` (Enum `user_role`, Default: `CUSTOMER`)
*   `phone` (String, Nullable)
*   `created_at` (Timestamp with time zone, Default: now())

### 2. `services` (Serviços Oferecidos)
Catálogo de serviços da barbearia.

*   `id` (UUID, Primary Key, Default: uuid_generate_v4())
*   `name` (String, Not Null)
*   `description` (Text, Nullable)
*   `price` (Numeric, Not Null)
*   `duration_minutes` (Integer, Not Null) - Usado para calcular conflitos na agenda.
*   `is_active` (Boolean, Default: true) - Para "excluir" serviços sem quebrar históricos.
*   `created_at` (Timestamp with time zone, Default: now())

### 3. `barber_schedules` (Jornada de Trabalho)
Define os horários padrão de trabalho dos barbeiros por dia da semana.

*   `id` (UUID, Primary Key, Default: uuid_generate_v4())
*   `barber_id` (UUID, Foreign Key referenciando `users.id`)
*   `day_of_week` (Integer, Not Null) - (0 a 6, onde 0 = Domingo).
*   `start_time` (Time, Not Null) - Ex: `09:00:00`
*   `end_time` (Time, Not Null) - Ex: `18:00:00`
*   `lunch_start` (Time, Nullable) - Início do horário de almoço.
*   `lunch_end` (Time, Nullable) - Fim do horário de almoço.
*   *Constraint:* `UNIQUE(barber_id, day_of_week)`

### 4. `time_offs` (Folgas e Bloqueios)
Exceções à regra do `barber_schedules`. Usado para folgas, feriados ou bloqueios manuais na agenda.

*   `id` (UUID, Primary Key, Default: uuid_generate_v4())
*   `barber_id` (UUID, Foreign Key referenciando `users.id`)
*   `start_datetime` (Timestamp with time zone, Not Null)
*   `end_datetime` (Timestamp with time zone, Not Null)
*   `reason` (String, Nullable) - Ex: "Férias", "Consulta médica".

### 5. `appointments` (Agendamentos)
Registra o compromisso marcado entre cliente e barbeiro.

*   `id` (UUID, Primary Key, Default: uuid_generate_v4())
*   `customer_id` (UUID, Foreign Key referenciando `users.id`)
*   `barber_id` (UUID, Foreign Key referenciando `users.id`)
*   `service_id` (UUID, Foreign Key referenciando `services.id`)
*   `start_datetime` (Timestamp with time zone, Not Null)
*   `end_datetime` (Timestamp with time zone, Not Null) - Calculado no app (start + duration).
*   `status` (Enum `appointment_status`, Default: `CONFIRMED`)
*   `created_at` (Timestamp with time zone, Default: now())

### 6. `reviews` (Avaliações)
Avaliações vinculadas aos agendamentos concluídos.

*   `id` (UUID, Primary Key, Default: uuid_generate_v4())
*   `appointment_id` (UUID, Foreign Key referenciando `appointments.id`, Unique) - Garante apenas 1 avaliação por agendamento.
*   `customer_id` (UUID, Foreign Key referenciando `users.id`)
*   `barber_id` (UUID, Foreign Key referenciando `users.id`)
*   `rating` (Integer, Not Null) - CHECK (rating >= 1 AND rating <= 5)
*   `comment` (Text, Nullable)
*   `created_at` (Timestamp with time zone, Default: now())

## Relacionamentos Principais
- Um **Usuário (Barbeiro)** possui múltiplos `barber_schedules` e `time_offs`.
- Um **Agendamento** liga três entidades: O **Cliente** (`users`), o **Barbeiro** (`users`), e o **Serviço** (`services`).
- Uma **Avaliação** pertence estritamente a um **Agendamento**.
