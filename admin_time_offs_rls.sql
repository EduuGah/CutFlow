-- Políticas para permitir que Administradores gerenciem (INSERT, UPDATE, DELETE) os bloqueios (time_offs)

create policy "Admins podem inserir time_offs" on public.time_offs
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem atualizar time_offs" on public.time_offs
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins podem deletar time_offs" on public.time_offs
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
  );
