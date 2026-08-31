# CutFlow

**Agendar corte sem precisar mandar mensagem perguntando se tem horário.**

Plataforma de agendamento para barbearias. O cliente escolhe data, serviço, barbeiro e horário
vendo só o que está realmente livre. A barbearia administra profissionais, serviços, jornada,
folgas e bloqueios em um painel próprio.

**[Abrir o app](https://cut-flow-sandy.vercel.app)** · [Como executar](#como-executar) · [Decisões](#decisões-de-projeto)

## O que ele faz

**Cliente**

- Consulta os serviços e o que cada barbeiro atende.
- Escolhe data, serviço, barbeiro e horário, nessa ordem, vendo apenas horários livres.
- Acompanha e cancela os próprios agendamentos.
- Avalia o atendimento depois de realizado.

**Barbeiro**

- Vê a própria agenda do dia e do período.
- Registra folgas e bloqueios que saem imediatamente da disponibilidade pública.

**Administrador**

- Cadastra e edita serviços, duração e preço.
- Cria as contas dos barbeiros de dentro do painel, com e-mail e senha de acesso.
- Define jornada de trabalho por profissional.
- Acompanha a agenda da barbearia e as avaliações recebidas.

---

## Pilha

| Camada    | Escolha                                   | Por quê                                                             |
| --------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Interface | React 18 · TypeScript · Vite 5            | Tipos verificados e build rápido.                                   |
| Estilo    | Tailwind CSS 4 (plugin oficial do Vite)   | Sem passo de PostCSS separado.                                      |
| Rotas     | react-router-dom 7                        | Rotas por papel, protegidas no `AuthContext`.                        |
| Datas     | date-fns 4                                | Aritmética de agenda sem carregar biblioteca de fuso inteira.       |
| Animação  | motion                                    | Transições de estado, não decoração.                                |
| Ícones    | lucide-react                              | —                                                                    |
| Gráficos  | recharts                                  | Indicadores do painel administrativo.                               |
| Dados     | Supabase — PostgreSQL, Auth e RLS         | Autorização mora no banco, não na interface.                        |
| Testes    | Vitest 4 · Testing Library · jsdom        | Regras de agenda e comportamento de componente.                     |

Runtime: oito dependências. Não há biblioteca de formulário, de estado global nem de tabela.

---

## Decisões de projeto

**A ordem do agendamento não é preferência de layout**

O fluxo é data → serviço → barbeiro → horário, e é obrigatório nessa sequência. Cada passo
restringe o seguinte: sem data não existe disponibilidade, sem serviço não dá para saber quanto
tempo o horário ocupa, e a lista de barbeiros é a de quem atende aquele serviço naquele dia.
A primeira versão pedia barbeiro antes de serviço e produzia a situação de escolher um profissional
para descobrir depois que ele não faz aquele corte.

**Quem separa as barbearias é o banco**

Existe uma tabela `barbershops` e um `barbershop_id` no usuário. As políticas de Row Level Security
limitam agendamentos, serviços e profissionais à barbearia do usuário autenticado. A aplicação
nunca filtra por barbearia no cliente — se filtrasse, bastaria uma requisição fora da interface
para ler a agenda de outra loja.

O produto atende uma barbearia só hoje. O esquema foi feito multi-unidade desde o início porque
essa é a decisão cara de reverter depois, diferente de qualquer tela.

**Ninguém vira admin se cadastrando**

O registro público cria apenas conta de cliente. Barbeiro é criado pelo administrador de dentro do
painel, com credenciais definidas ali. Administrador é criado manualmente. Permissão que se
autoconcede por formulário é permissão que não existe.

**Folga e bloqueio entram no mesmo cálculo do horário livre**

Disponibilidade não é a jornada de trabalho: é a jornada menos os agendamentos, menos as folgas,
menos os bloqueios. Tratar folga como aviso na tela do barbeiro, e não como entrada no cálculo,
é o caminho direto para o cliente marcar em cima de um dia que não existe.

**Só a chave `anon` chega ao navegador**

Ela é pública por desenho e identifica o projeto, não o usuário. Todo o controle de acesso está nas
políticas do Postgres. A chave `service_role` ignora essas políticas e não aparece em lugar nenhum
do front-end.

---

## Como executar

Requisitos: Node.js 18 ou superior e um projeto no Supabase.

```bash
git clone https://github.com/EduuGah/CutFlow.git
cd CutFlow
npm install
cp .env.example .env
npm run dev
```

O app sobe em `http://localhost:3000`.

| Variável                 | Para quê                                                    |
| ------------------------ | ----------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL do projeto Supabase                                     |
| `VITE_SUPABASE_ANON_KEY` | Chave pública. Toda a proteção vem das políticas de RLS     |

<!-- CONFIRME: descreva aqui como aplicar o schema num projeto novo do Supabase.
     Hoje o SQL de RLS das folgas está solto na raiz (admin_time_offs_rls.sql).
     Junte os SQL em supabase/migrations/ numerados e diga em que ordem rodar,
     como o MetaFlow faz. Sem isso ninguém consegue subir o projeto do zero. -->

### Testes

```bash
npm test
```

<!-- SUBSTITUA: diga o que os testes cobrem e quantos são. Rode `npm test` e conte.
     Se ainda houver pouca coisa, os dois primeiros testes que valem existir aqui são:
     o cálculo de horários disponíveis descontando agendamento, folga e bloqueio;
     e o RLS impedindo uma barbearia de ler os agendamentos de outra. -->

---

## Estrutura

<!-- CONFIRME contra o repositório antes de publicar. -->

```
src/
├── components/   peças de interface
├── context/      AuthContext — sessão e papel do usuário
├── lib/          cliente do Supabase e regras de agenda
├── pages/        uma por rota, agrupadas por papel
└── types/        contratos das tabelas
```

A regra de disponibilidade é função pura sobre jornada, agendamentos, folgas e bloqueios: dá para
testar sem montar componente nem subir banco.

---

## Próximos passos

Ver [ROADMAP.md](ROADMAP.md).

---

Feito por [Carlos Eduardo](https://github.com/EduuGah)
