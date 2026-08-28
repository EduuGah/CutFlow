# Roadmap do CutFlow

## Passo 1: Melhorias Iniciais e Design
- [x] **Novo Ícone e Identidade:** Substituir o design atual do logo (poste) por algo mais moderno (ex: ícone de tesoura elegante com tipografia ajustada).
- [x] **Correção de Bloqueio de Rotas:** Arrumar a lógica de proteção de rotas (`ProtectedRoute` / `AuthContext`) para que usuários sem permissão não vejam a tela piscar ou acessem locais indevidos.

## Passo 2: Estrutura Multi-Barbearia (Franquias)
- [x] **Nova Tabela de Barbearias:** Criar a tabela `barbershops` no banco de dados.
- [x] **Vínculo de Usuários:** Adicionar `barbershop_id` na tabela `users` (Barbeiros serão vinculados a 1 única barbearia, Admins podem acessar a que possuem).
- [x] **Isolamento de Dados (RLS):** Ajustar as regras de segurança do Supabase (Row Level Security) para que cada Admin/Barbeiro só veja agendamentos e dados de sua barbearia.

## Passo 3: Gestão de Acessos
- [x] **Criação de Admins:** Garantir que logins de Admin sejam criados apenas manualmente (removendo a opção de registro público com permissão de admin).
- [x] **Painel de Criação de Barbeiros:** Permitir que o Admin crie a conta de um barbeiro de dentro do painel (gerando e-mail corporativo ex: `joel@barbeariasaojoao.com` e definindo uma senha de acesso).

## Passo 4: Alinhamento de Regras de Negócio (Scheduling)
- [x] **Ordem Obrigatória do Agendamento (BR-01):** O fluxo de agendamento do Cliente no `CustomerDashboard` deve ser corrigido para seguir estritamente: `Data` ➔ `Serviço` ➔ `Barbeiro` ➔ `Horário` (atualmente a ordem de Serviço e Barbeiro está invertida na interface).
