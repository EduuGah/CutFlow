# CutFlow — User Stories

> Histórias de usuário do MVP do CutFlow.

**Status:** Draft  
**Versão:** 0.1.0  
**Fase:** Product Requirements  
**Última atualização:** 2026-08-27

---

# 1. Convenção

As histórias seguem o formato:

> Como [usuário], quero [objetivo], para [benefício].

Cada história possui critérios de aceite que definem quando ela pode ser considerada concluída.

---

# 2. Cliente

## US-001 — Criar conta

**Como** cliente,  
**quero** criar uma conta utilizando meus dados,  
**para** poder utilizar o sistema de agendamento.

### Critérios de aceite

- [ ] Cliente consegue informar nome.
- [ ] Cliente consegue informar e-mail.
- [ ] Cliente consegue informar senha.
- [ ] Cliente consegue informar telefone.
- [ ] Sistema valida os dados.
- [ ] Sistema impede cadastro com e-mail já utilizado.
- [ ] Conta é criada com sucesso quando os dados são válidos.

---

## US-002 — Entrar na plataforma

**Como** cliente,  
**quero** entrar na minha conta,  
**para** acessar meus agendamentos e realizar novos agendamentos.

### Critérios de aceite

- [ ] Cliente consegue informar e-mail.
- [ ] Cliente consegue informar senha.
- [ ] Credenciais válidas permitem acesso.
- [ ] Credenciais inválidas não permitem acesso.
- [ ] Cliente autenticado é direcionado para sua área.

---

## US-003 — Visualizar perfil

**Como** cliente,  
**quero** visualizar meus dados,  
**para** verificar minhas informações cadastradas.

### Critérios de aceite

- [ ] Nome é exibido.
- [ ] E-mail é exibido.
- [ ] Telefone é exibido.

---

## US-004 — Editar perfil

**Como** cliente,  
**quero** editar meus dados pessoais,  
**para** manter minhas informações atualizadas.

### Critérios de aceite

- [ ] Cliente consegue editar nome.
- [ ] Cliente consegue editar telefone.
- [ ] Sistema valida os dados alterados.
- [ ] Alterações são persistidas.

---

# 3. Agendamento

## US-005 — Visualizar calendário

**Como** cliente,  
**quero** visualizar um calendário,  
**para** escolher o dia em que desejo realizar meu atendimento.

### Critérios de aceite

- [ ] Calendário é exibido.
- [ ] Cliente consegue navegar entre datas.
- [ ] Cliente consegue selecionar uma data.
- [ ] Data selecionada é utilizada no fluxo de agendamento.

---

## US-006 — Visualizar serviços disponíveis

**Como** cliente,  
**quero** visualizar os serviços disponíveis,  
**para** escolher qual atendimento desejo realizar.

### Critérios de aceite

- [ ] Serviços ativos são exibidos.
- [ ] Serviços inativos não aparecem para novos agendamentos.
- [ ] Nome do serviço é exibido.
- [ ] Duração do serviço é exibida.
- [ ] Preço é exibido.

---

## US-007 — Encontrar barbeiros disponíveis

**Como** cliente,  
**quero** visualizar os barbeiros que estão disponíveis na data escolhida e realizam o serviço selecionado,  
**para** escolher o profissional que desejo.

### Critérios de aceite

- [ ] Apenas barbeiros ativos são exibidos.
- [ ] Apenas barbeiros que realizam o serviço são exibidos.
- [ ] Barbeiros que não trabalham na data selecionada não são exibidos como disponíveis.
- [ ] Barbeiros sem nenhum horário compatível não são exibidos como disponíveis.

---

## US-008 — Visualizar horários

**Como** cliente,  
**quero** visualizar os horários disponíveis de um barbeiro,  
**para** escolher o melhor horário para meu atendimento.

### Critérios de aceite

- [ ] Horários ocupados não são disponibilizados.
- [ ] Horários bloqueados não são disponibilizados.
- [ ] Horários fora da jornada do barbeiro não são disponibilizados.
- [ ] O sistema considera a duração do serviço.
- [ ] O horário selecionado permanece associado ao barbeiro e serviço escolhidos.

---

## US-009 — Criar agendamento

**Como** cliente,  
**quero** confirmar um horário disponível,  
**para** reservar meu atendimento.

### Critérios de aceite

- [ ] Cliente precisa estar autenticado.
- [ ] Serviço deve estar ativo.
- [ ] Barbeiro deve estar ativo.
- [ ] Barbeiro deve realizar o serviço.
- [ ] Data deve ser válida.
- [ ] Horário deve estar disponível.
- [ ] Sistema verifica novamente a disponibilidade no momento da confirmação.
- [ ] Agendamento é criado com status `CONFIRMED`.
- [ ] Cliente recebe confirmação do agendamento.

---

## US-010 — Visualizar meus agendamentos

**Como** cliente,  
**quero** visualizar meus agendamentos,  
**para** saber quais atendimentos tenho marcados.

### Critérios de aceite

- [ ] Cliente consegue visualizar próximos agendamentos.
- [ ] Cliente consegue visualizar agendamentos anteriores.
- [ ] Serviço é exibido.
- [ ] Barbeiro é exibido.
- [ ] Data é exibida.
- [ ] Horário é exibido.
- [ ] Status é exibido.

---

## US-011 — Cancelar agendamento

**Como** cliente,  
**quero** cancelar um agendamento,  
**para** liberar o horário caso eu não possa comparecer.

### Critérios de aceite

- [ ] Cliente somente consegue cancelar seus próprios agendamentos.
- [ ] Cancelamento pode ser realizado a qualquer momento.
- [ ] Status passa para `CANCELLED`.
- [ ] Histórico do agendamento é preservado.
- [ ] Horário volta a poder ser disponibilizado.

---

# 4. Avaliações

## US-012 — Avaliar atendimento

**Como** cliente,  
**quero** avaliar um atendimento concluído,  
**para** registrar minha experiência com o barbeiro.

### Critérios de aceite

- [ ] Somente atendimentos concluídos podem ser avaliados.
- [ ] Cliente somente pode avaliar seus próprios atendimentos.
- [ ] Nota deve estar entre 1 e 5.
- [ ] Comentário é opcional.
- [ ] Avaliação é vinculada ao barbeiro.
- [ ] Avaliação é vinculada ao atendimento.

---

## US-013 — Visualizar avaliação do barbeiro

**Como** cliente,  
**quero** visualizar a avaliação média de um barbeiro,  
**para** conhecer sua reputação dentro da barbearia.

### Critérios de aceite

- [ ] Média das avaliações é calculada.
- [ ] Quantidade de avaliações pode ser exibida.
- [ ] Apenas avaliações válidas participam da média.

---

# 5. Barbeiro

## US-014 — Visualizar minha agenda

**Como** barbeiro,  
**quero** visualizar minha agenda,  
**para** saber quais atendimentos preciso realizar.

### Critérios de aceite

- [ ] Barbeiro consegue visualizar seus atendimentos.
- [ ] Outros barbeiros não aparecem na agenda pessoal.
- [ ] Data é exibida.
- [ ] Horário é exibido.
- [ ] Serviço é exibido.
- [ ] Informações necessárias do cliente são exibidas.

---

## US-015 — Iniciar atendimento

**Como** barbeiro,  
**quero** iniciar um atendimento,  
**para** indicar que o serviço está sendo realizado.

### Critérios de aceite

- [ ] Atendimento confirmado pode ser iniciado.
- [ ] Status passa de `CONFIRMED` para `IN_PROGRESS`.
- [ ] Cliente não pode alterar o estado do atendimento.

---

## US-016 — Concluir atendimento

**Como** barbeiro,  
**quero** concluir um atendimento,  
**para** indicar que o serviço foi finalizado.

### Critérios de aceite

- [ ] Atendimento em andamento pode ser concluído.
- [ ] Status passa para `COMPLETED`.
- [ ] Cliente passa a poder avaliar o atendimento.

---

# 6. Administração

## US-017 — Visualizar dashboard

**Como** administrador,  
**quero** visualizar um dashboard,  
**para** acompanhar a operação da barbearia.

### Critérios de aceite

- [ ] Administrador consegue acessar o dashboard.
- [ ] Informações administrativas não ficam disponíveis para clientes.
- [ ] Dashboard apresenta informações relevantes da agenda.

---

## US-018 — Cadastrar barbeiro

**Como** administrador,  
**quero** cadastrar um barbeiro,  
**para** disponibilizá-lo para os agendamentos.

### Critérios de aceite

- [ ] Administrador consegue cadastrar barbeiro.
- [ ] Nome é obrigatório.
- [ ] Barbeiro pode ser ativado ou desativado.
- [ ] Barbeiro criado aparece na gestão administrativa.

---

## US-019 — Editar barbeiro

**Como** administrador,  
**quero** editar informações de um barbeiro,  
**para** manter os dados atualizados.

### Critérios de aceite

- [ ] Administrador consegue editar barbeiro.
- [ ] Alterações são persistidas.
- [ ] Alterações respeitam as regras de autorização.

---

## US-020 — Configurar serviços

**Como** administrador,  
**quero** cadastrar e configurar serviços,  
**para** definir quais atendimentos a barbearia oferece.

### Critérios de aceite

- [ ] Administrador consegue criar serviço.
- [ ] Administrador consegue editar serviço.
- [ ] Administrador consegue definir duração.
- [ ] Administrador consegue definir preço.
- [ ] Administrador consegue ativar ou desativar serviço.

---

## US-021 — Associar serviço a barbeiro

**Como** administrador,  
**quero** definir quais serviços cada barbeiro realiza,  
**para** impedir que clientes agendem serviços incompatíveis com o profissional.

### Critérios de aceite

- [ ] Administrador consegue associar serviço.
- [ ] Administrador consegue remover associação.
- [ ] Cliente somente visualiza barbeiros compatíveis.

---

## US-022 — Configurar horário da barbearia

**Como** administrador,  
**quero** configurar os horários de funcionamento da barbearia,  
**para** definir quando os atendimentos podem ocorrer.

### Critérios de aceite

- [ ] Administrador consegue definir horário por dia da semana.
- [ ] Horários podem variar entre dias.
- [ ] Configuração é persistida.

---

## US-023 — Configurar horário do barbeiro

**Como** administrador,  
**quero** configurar o horário de trabalho de cada barbeiro,  
**para** representar corretamente sua disponibilidade.

### Critérios de aceite

- [ ] Administrador consegue configurar horários individuais.
- [ ] Horários podem variar por dia.
- [ ] Sistema considera esses horários durante a busca de disponibilidade.

---

## US-024 — Criar folga

**Como** administrador,  
**quero** registrar uma folga para um barbeiro,  
**para** impedir agendamentos durante sua ausência.

### Critérios de aceite

- [ ] Administrador consegue registrar folga.
- [ ] Folga pode representar um dia ou período.
- [ ] Horários afetados deixam de ser disponibilizados.

---

## US-025 — Bloquear horário

**Como** administrador,  
**quero** bloquear um período da agenda,  
**para** impedir agendamentos quando necessário.

### Critérios de aceite

- [ ] Administrador consegue bloquear um período.
- [ ] Bloqueio pode ser de um intervalo.
- [ ] Bloqueio pode representar um dia inteiro.
- [ ] Horários bloqueados não podem ser agendados.

---

## US-026 — Visualizar agenda geral

**Como** administrador,  
**quero** visualizar a agenda completa da barbearia,  
**para** acompanhar todos os atendimentos.

### Critérios de aceite

- [ ] Administrador consegue visualizar todos os barbeiros.
- [ ] Administrador consegue visualizar os agendamentos.
- [ ] Agenda pode ser consultada por data.
- [ ] Status dos agendamentos é exibido.

---

# 7. Controle de Acesso

## US-027 — Restringir funcionalidades por função

**Como** administrador do sistema,  
**quero** controlar o acesso de acordo com a função do usuário,  
**para** proteger dados e funcionalidades administrativas.

### Critérios de aceite

- [ ] Cliente não acessa funcionalidades administrativas.
- [ ] Barbeiro não acessa configurações administrativas.
- [ ] Administrador possui acesso às funcionalidades administrativas.
- [ ] Restrições são aplicadas no backend.
- [ ] Tentativas não autorizadas são rejeitadas.

---

# 8. Histórico

## US-028 — Manter histórico de agendamentos

**Como** cliente,  
**quero** manter meu histórico de agendamentos,  
**para** consultar atendimentos anteriores.

### Critérios de aceite

- [ ] Agendamentos concluídos permanecem armazenados.
- [ ] Agendamentos cancelados permanecem armazenados.
- [ ] Histórico pertence ao cliente.
- [ ] Histórico não pode ser alterado pelo cliente de maneira indevida.

---

# 9. Resumo

O MVP contém inicialmente:

| Área | Stories |
|---|---:|
| Autenticação e perfil | 4 |
| Agendamento | 7 |
| Avaliações | 2 |
| Barbeiro | 3 |
| Administração | 10 |
| Controle de acesso | 1 |
| Histórico | 1 |
| **Total** | **28** |

Essas histórias ainda não são GitHub Issues.

Elas serão posteriormente agrupadas em tarefas técnicas e transformadas em Issues durante a fase de planejamento do repositório.

---

# 10. Próxima etapa

Após a aprovação deste documento:

1. Definir `BUSINESS_RULES.md`.
2. Definir `MVP_SCOPE.md`.
3. Revisar inconsistências entre requisitos, histórias e regras.
4. Criar arquitetura.
5. Criar repositório GitHub.
6. Criar Issues a partir das histórias.