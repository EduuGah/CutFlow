# CutFlow — Product Requirements

> Especificação de requisitos do produto para o MVP.

**Status:** Draft  
**Versão:** 0.1.0  
**Fase:** Product Requirements  
**Base:** `PROJECT_BRIEF.md`  
**Última atualização:** 2026-08-27

---

# 1. Objetivo

Este documento define os requisitos funcionais e não funcionais do CutFlow para sua primeira versão funcional.

O objetivo do MVP é validar o fluxo completo de agendamento digital de uma barbearia, permitindo que clientes consultem disponibilidade, escolham serviços e profissionais e realizem agendamentos, enquanto a administração controla a agenda, profissionais, serviços e horários.

---

# 2. Escopo do MVP

O MVP será uma aplicação web responsiva contendo três tipos principais de usuários:

- Cliente.
- Barbeiro.
- Administrador.

A aplicação será inicialmente configurada para uma única barbearia.

A arquitetura, entretanto, deverá permitir futura expansão para múltiplas barbearias ou unidades sem exigir uma reconstrução completa do sistema.

---

# 3. Tipos de Usuário

## 3.1 Cliente

O cliente utiliza o sistema para realizar e acompanhar seus próprios agendamentos.

Pode:

- Criar conta.
- Entrar na plataforma.
- Gerenciar seu perfil.
- Visualizar o calendário.
- Selecionar uma data.
- Visualizar disponibilidade.
- Escolher um serviço.
- Escolher um barbeiro.
- Escolher um horário.
- Criar agendamento.
- Visualizar seus agendamentos.
- Cancelar seus agendamentos.
- Avaliar atendimentos concluídos.

---

## 3.2 Barbeiro

O barbeiro utiliza o sistema para acompanhar seus próprios atendimentos.

Pode:

- Entrar na plataforma.
- Visualizar sua agenda.
- Visualizar seus próximos atendimentos.
- Visualizar informações necessárias dos atendimentos.
- Atualizar o estado de um atendimento quando permitido.

O barbeiro não poderá acessar configurações administrativas da barbearia.

---

## 3.3 Administrador

O administrador é responsável pela configuração e operação da barbearia.

Pode:

- Gerenciar barbeiros.
- Gerenciar serviços.
- Associar serviços a barbeiros.
- Configurar horários da barbearia.
- Configurar horários individuais dos barbeiros.
- Criar folgas.
- Criar bloqueios.
- Visualizar todos os agendamentos.
- Gerenciar agendamentos.
- Marcar atendimentos como concluídos.
- Visualizar avaliações.

---

# 4. Requisitos Funcionais

## RF-001 — Cadastro de cliente

O sistema deve permitir que uma pessoa crie uma conta de cliente.

O cadastro deverá possuir:

- Nome.
- E-mail.
- Senha.
- Telefone.

### Critérios de aceite

- Todos os campos obrigatórios devem ser validados.
- O e-mail deve possuir formato válido.
- O e-mail não pode estar associado a outra conta.
- A senha deve obedecer aos requisitos mínimos definidos pela solução de autenticação.
- O telefone deve ser armazenado para utilização pela barbearia.
- A senha nunca deve ser armazenada em texto puro.

---

## RF-002 — Login

O sistema deve permitir que usuários autenticados entrem na plataforma.

### Critérios de aceite

- Credenciais válidas devem permitir acesso.
- Credenciais inválidas devem gerar uma mensagem apropriada.
- A sessão deve permanecer válida conforme a estratégia de autenticação adotada.
- O usuário deve ser direcionado para a área correspondente ao seu perfil.

---

## RF-003 — Logout

O sistema deve permitir que o usuário encerre sua sessão.

---

## RF-004 — Perfil do cliente

O cliente deve poder visualizar e editar seus dados pessoais permitidos.

Dados iniciais:

- Nome.
- E-mail.
- Telefone.

---

# 5. Serviços

## RF-005 — Listar serviços

O cliente deve conseguir visualizar os serviços oferecidos pela barbearia.

Exemplos iniciais:

| Serviço | Duração inicial |
|---|---:|
| Corte | 30 minutos |
| Barba | 20 minutos |
| Luzes | 90 minutos |

Esses valores são apenas valores iniciais.

O sistema deverá permitir que o administrador altere posteriormente os serviços e suas respectivas durações.

---

## RF-006 — Gerenciar serviços

O administrador deve poder:

- Criar serviço.
- Editar serviço.
- Ativar serviço.
- Desativar serviço.
- Definir duração.
- Definir preço.
- Definir descrição.

Um serviço desativado não poderá receber novos agendamentos.

---

## RF-007 — Associar serviços a barbeiros

O administrador deve poder definir quais serviços cada barbeiro está habilitado a realizar.

Exemplo:

```text
João
├── Corte
├── Barba
└── Luzes

Pedro
├── Corte
└── Barba
```

Um cliente somente poderá escolher um barbeiro compatível com o serviço selecionado.

---

# 6. Barbeiros

## RF-008 — Gerenciar barbeiros

O administrador deve poder:

- Cadastrar barbeiro.
- Editar barbeiro.
- Ativar barbeiro.
- Desativar barbeiro.
- Associar serviços.
- Configurar disponibilidade.

---

## RF-009 — Agenda do barbeiro

O barbeiro deve possuir uma agenda própria.

A agenda deverá apresentar seus atendimentos organizados por data e horário.

---

# 7. Calendário

## RF-010 — Visualizar calendário

O cliente deve conseguir visualizar um calendário para selecionar a data desejada.

O calendário será o primeiro passo do fluxo de agendamento.

Exemplo:

```text
Agendamento

        Agosto 2026

Seg Ter Qua Qui Sex Sáb Dom
                 1   2
3   4   5   6   7   8   9
10  11  12  13  14  15  16
17  18  19  20  21  22  23
24  25  26  27  28  29  30
31
```

O cliente seleciona uma data para continuar.

---

# 8. Disponibilidade

## RF-011 — Consultar disponibilidade

Após selecionar uma data, o sistema deve determinar quais horários e profissionais podem receber novos agendamentos.

A disponibilidade deverá considerar:

- Horário de funcionamento da barbearia.
- Horário de trabalho do barbeiro.
- Serviço escolhido.
- Duração do serviço.
- Agendamentos existentes.
- Folgas.
- Bloqueios.
- Status do barbeiro.
- Status do serviço.

---

## RF-012 — Exibir barbeiros disponíveis

O sistema deve apresentar somente barbeiros que:

1. Estejam ativos.
2. Realizem o serviço selecionado.
3. Estejam trabalhando na data selecionada.
4. Possuam pelo menos um horário disponível para a duração do serviço.

---

## RF-013 — Exibir horários disponíveis

Depois de selecionado o barbeiro, o sistema deve apresentar os horários possíveis para o serviço.

Um horário só poderá ser apresentado se houver disponibilidade durante toda a duração do serviço.

Exemplo:

```text
Serviço: Corte
Duração: 30 minutos

Horários:

10:00  Disponível
10:30  Disponível
11:00  Ocupado
11:30  Disponível
12:00  Disponível
```

---

# 9. Agendamento

## RF-014 — Criar agendamento

O cliente deve poder criar um agendamento selecionando:

- Data.
- Serviço.
- Barbeiro.
- Horário.

O agendamento deverá ser associado ao cliente autenticado.

---

## RF-015 — Confirmação de agendamento

Após a criação, o agendamento deverá possuir inicialmente o estado:

`CONFIRMED`

O sistema deverá apresentar ao cliente uma confirmação contendo:

- Serviço.
- Barbeiro.
- Data.
- Horário.
- Duração.
- Informações relevantes da barbearia.

---

## RF-016 — Impedir conflito de agendamento

O sistema não deve permitir que dois agendamentos ocupem períodos conflitantes para o mesmo barbeiro.

Essa regra deverá ser garantida pelo backend e pela persistência dos dados, e não apenas pela interface.

---

# 10. Status do Agendamento

O MVP utilizará inicialmente quatro estados:

```text
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
```

### CONFIRMED

Agendamento confirmado e aguardando atendimento.

### IN_PROGRESS

Atendimento atualmente em andamento.

### COMPLETED

Atendimento concluído.

### CANCELLED

Agendamento cancelado.

As transições válidas entre estados serão definidas na documentação de regras de negócio.

---

# 11. Cancelamento

## RF-017 — Cancelar agendamento

O cliente poderá cancelar seus próprios agendamentos.

No MVP não haverá uma janela mínima de cancelamento.

O cancelamento poderá ocorrer a qualquer momento.

Após o cancelamento:

- O agendamento deverá assumir o estado `CANCELLED`.
- O horário deverá voltar a ser elegível para novos agendamentos, desde que não existam outros bloqueios.
- O histórico do agendamento deverá ser preservado.

---

# 12. Gerenciamento de Agenda

## RF-018 — Visualizar agenda administrativa

O administrador deverá conseguir visualizar os agendamentos da barbearia.

A agenda deverá permitir consulta por:

- Data.
- Barbeiro.
- Status.

---

## RF-019 — Horário geral da barbearia

O administrador deverá conseguir definir os horários de funcionamento da barbearia.

Exemplo:

```text
Segunda
10:00 → 19:00

Terça
10:00 → 19:00

Quarta
10:00 → 19:00
```

Os horários poderão variar entre os dias da semana.

---

## RF-020 — Horário individual do barbeiro

O administrador deverá conseguir configurar a disponibilidade individual de cada barbeiro.

Exemplo:

```text
Barbearia
10:00 → 21:00

João
10:00 → 18:00

Pedro
12:00 → 21:00
```

A disponibilidade efetiva deverá respeitar tanto as regras gerais da barbearia quanto as regras individuais do profissional.

---

# 13. Folgas e Bloqueios

## RF-021 — Criar folga

O administrador deverá conseguir registrar uma folga para um barbeiro.

A folga deverá impedir novos agendamentos durante o período definido.

---

## RF-022 — Criar bloqueio

O administrador deverá conseguir bloquear:

- Um horário.
- Um intervalo.
- Um dia inteiro.

Exemplos:

```text
07/09
Dia inteiro bloqueado.

10/09
João — Folga.

15/09
Pedro
14:00 → 16:00 bloqueado.
```

---

## RF-023 — Gerenciar bloqueios

O administrador deverá conseguir visualizar, editar e remover bloqueios existentes, respeitando as regras de negócio.

---

# 14. Avaliações

## RF-024 — Avaliar atendimento

O cliente deverá poder avaliar um atendimento concluído.

A avaliação inicial deverá possuir:

- Nota de 1 a 5.
- Comentário opcional.

---

## RF-025 — Restringir avaliações

Uma avaliação deverá:

- Pertencer a um cliente autenticado.
- Estar associada a um atendimento.
- Ser vinculada ao barbeiro que realizou o atendimento.
- Somente ser criada após o atendimento estar `COMPLETED`.
- Não permitir mais de uma avaliação para o mesmo atendimento.

---

## RF-026 — Exibir avaliação do barbeiro

O sistema deverá calcular uma média das avaliações recebidas pelo barbeiro.

A forma de apresentação será definida posteriormente na especificação de UI/UX.

---

# 15. Controle de Acesso

## RF-027 — Controle por função

O sistema deverá controlar o acesso às funcionalidades conforme o tipo de usuário.

As funções iniciais são:

```text
CUSTOMER
BARBER
ADMIN
```

Um usuário não deverá conseguir acessar ou executar operações que não estejam autorizadas para sua função.

---

# 16. Estrutura Inicial de Dados

O sistema deverá ser projetado considerando entidades semelhantes a:

```text
User
Barbershop
Barber
Service
BarberService
BusinessHours
BarberWorkingHours
BlockedPeriod
Appointment
Review
```

A estrutura definitiva será definida durante a fase de arquitetura e modelagem do banco de dados.

---

# 17. Preparação para múltiplas barbearias

O MVP terá somente uma barbearia operacional.

Entretanto, a arquitetura deverá considerar a existência futura de uma entidade `Barbershop` e relacionamentos que permitam associar dados à barbearia correspondente.

O MVP não deverá implementar:

- Marketplace.
- Seleção de múltiplas barbearias.
- Interface de gerenciamento de franquias.
- Múltiplas unidades operacionais.

O objetivo é evitar retrabalho estrutural sem introduzir complexidade desnecessária no produto inicial.

---

# 18. Requisitos Não Funcionais

## RNF-001 — Responsividade

A aplicação deverá funcionar adequadamente em:

- Desktop.
- Tablet.
- Smartphone.

---

## RNF-002 — Segurança

Dados privados deverão ser protegidos por autenticação e autorização.

Operações administrativas deverão ser protegidas no backend.

A interface não deverá ser considerada mecanismo suficiente de segurança.

---

## RNF-003 — Integridade

O sistema deverá impedir conflitos de agenda mesmo quando duas solicitações forem realizadas simultaneamente.

A consistência deverá ser garantida pela camada responsável pela persistência.

---

## RNF-004 — Performance

As consultas de disponibilidade deverão ser suficientemente rápidas para permitir uma experiência fluida durante o processo de agendamento.

Otimizações prematuras deverão ser evitadas até que existam evidências de necessidade.

---

## RNF-005 — Manutenibilidade

O código deverá ser organizado de forma modular, seguindo responsabilidades bem definidas e evitando acoplamento desnecessário.

---

## RNF-006 — Testabilidade

As principais regras de negócio deverão ser implementadas de forma que possam ser testadas automaticamente.

---

## RNF-007 — Observabilidade

Erros relevantes deverão ser registrados de maneira que possam ser investigados durante desenvolvimento e produção.

A estratégia específica de logging será definida posteriormente.

---

# 19. Fluxo Completo de Agendamento

O fluxo esperado do MVP é:

```text
1. Cliente entra na plataforma
        ↓
2. Cliente seleciona "Agendar"
        ↓
3. Cliente visualiza calendário
        ↓
4. Cliente seleciona uma data
        ↓
5. Cliente escolhe o serviço
        ↓
6. Sistema identifica barbeiros compatíveis
        ↓
7. Sistema verifica disponibilidade
        ↓
8. Cliente escolhe barbeiro
        ↓
9. Sistema apresenta horários disponíveis
        ↓
10. Cliente escolhe horário
        ↓
11. Sistema valida disponibilidade novamente
        ↓
12. Sistema cria agendamento
        ↓
13. Agendamento recebe status CONFIRMED
        ↓
14. Cliente recebe confirmação
```

A etapa 11 é obrigatória.

A disponibilidade exibida na interface não deve ser considerada garantia de que o horário continua disponível no momento da confirmação.

---

# 20. Fluxo de Atendimento

```text
CONFIRMED
    ↓
IN_PROGRESS
    ↓
COMPLETED
    ↓
REVIEW
```

Caso o cliente ou administrador cancele:

```text
CONFIRMED
    ↓
CANCELLED
```

A avaliação somente poderá ocorrer após:

```text
COMPLETED
```

---

# 21. Critério de Sucesso do MVP

O MVP será considerado funcional quando um cliente conseguir realizar o seguinte fluxo sem intervenção manual:

```text
Criar conta
   ↓
Escolher data
   ↓
Escolher serviço
   ↓
Encontrar barbeiro disponível
   ↓
Escolher horário
   ↓
Confirmar agendamento
   ↓
Visualizar agendamento
   ↓
Cancelar agendamento
```

Além disso, um administrador deverá conseguir:

```text
Criar barbeiro
   ↓
Criar serviço
   ↓
Associar serviço ao barbeiro
   ↓
Definir horário
   ↓
Bloquear horário
   ↓
Visualizar agenda
```

O sistema também deverá permitir:

```text
Atendimento concluído
       ↓
Cliente avalia barbeiro
       ↓
Nota é registrada
       ↓
Média do barbeiro é atualizada
```

---

# 22. Definition of Done — MVP

O MVP somente será considerado concluído quando:

- [ ] Fluxo de autenticação funcionar.
- [ ] Cliente conseguir realizar cadastro.
- [ ] Cliente conseguir realizar login.
- [ ] Administrador conseguir gerenciar barbeiros.
- [ ] Administrador conseguir gerenciar serviços.
- [ ] Administrador conseguir associar serviços a barbeiros.
- [ ] Administrador conseguir definir horários.
- [ ] Administrador conseguir criar bloqueios.
- [ ] Cliente conseguir selecionar uma data.
- [ ] Cliente conseguir selecionar um serviço.
- [ ] Cliente conseguir visualizar barbeiros compatíveis.
- [ ] Cliente conseguir visualizar horários disponíveis.
- [ ] Cliente conseguir criar agendamento.
- [ ] Sistema impedir conflitos de agenda.
- [ ] Cliente conseguir visualizar seus agendamentos.
- [ ] Cliente conseguir cancelar agendamento.
- [ ] Barbeiro conseguir visualizar sua agenda.
- [ ] Administrador conseguir visualizar a agenda.
- [ ] Atendimento puder ser marcado como `IN_PROGRESS`.
- [ ] Atendimento puder ser marcado como `COMPLETED`.
- [ ] Cliente puder avaliar atendimento concluído.
- [ ] Controle de acesso estiver implementado.
- [ ] Aplicação funcionar em dispositivos móveis.
- [ ] Principais regras de negócio possuírem testes automatizados.
- [ ] Build de produção funcionar.
- [ ] Não existirem erros críticos conhecidos.

---

# 23. Dependências Futuras

Os seguintes recursos não fazem parte do MVP, mas poderão depender desta estrutura:

- Notificações.
- WhatsApp.
- Pagamentos.
- Assinaturas.
- Relatórios.
- Fidelidade.
- IA.
- Múltiplas barbearias.
- Franquias.
- Aplicativo mobile.

As decisões atuais deverão evitar bloquear essas possibilidades, mas nenhuma delas deverá aumentar o escopo do MVP sem uma decisão explícita.

---

# 24. Próxima Etapa

Após a aprovação deste documento, serão criados:

1. `USER_STORIES.md`
2. `BUSINESS_RULES.md`
3. `MVP_SCOPE.md`

Depois disso será iniciada a fase de arquitetura, onde serão definidos:

- Stack.
- Arquitetura da aplicação.
- Banco de dados.
- Modelo de autenticação.
- Autorização.
- Estrutura de pastas.
- APIs.
- Fluxo de dados.
- Estratégia de testes.
- Segurança.

Somente após a conclusão da arquitetura o repositório GitHub será criado oficialmente.