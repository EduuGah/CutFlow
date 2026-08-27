# CutFlow — Project Brief

> Plataforma de agendamento e gestão de horários para barbearias.

**Status:** Draft  
**Versão:** 0.1.0  
**Fase:** Product Discovery  
**Última atualização:** 2026-08-27

---

## 1. Visão do Produto

O CutFlow é uma plataforma web de agendamento para barbearias que busca simplificar a marcação de horários para clientes e melhorar o gerenciamento da agenda para proprietários e barbeiros.

O cliente poderá consultar os serviços disponíveis, escolher uma data, visualizar os barbeiros que realizam aquele serviço e selecionar um horário disponível.

A barbearia poderá administrar seus profissionais, serviços, horários de trabalho, folgas e bloqueios de agenda através de uma área administrativa.

O produto será inicialmente desenvolvido para atender uma única barbearia. A arquitetura deverá evitar decisões que impeçam uma futura expansão para múltiplas unidades ou franquias.

---

## 2. Problema

Barbearias podem enfrentar dificuldades para organizar seus horários e profissionais quando os agendamentos são realizados de maneira manual ou através de ferramentas pouco especializadas.

Entre os problemas identificados estão:

- Dificuldade para visualizar a agenda dos barbeiros.
- Conflitos de horários.
- Dificuldade para saber qual barbeiro está disponível.
- Dificuldade para encontrar horários específicos.
- Necessidade de contato manual para consultar disponibilidade.
- Dificuldade para administrar folgas e bloqueios.
- Falta de centralização dos agendamentos.
- Experiência pouco conveniente para o cliente.

Do ponto de vista do cliente, o processo pode exigir mensagens ou ligações para descobrir se existe determinado serviço, barbeiro ou horário disponível.

---

## 3. Oportunidade

Criar uma experiência de agendamento simples e previsível, permitindo que o cliente encontre um horário sem precisar entrar em contato diretamente com a barbearia.

Ao mesmo tempo, oferecer à equipe uma ferramenta centralizada para administrar a agenda e reduzir conflitos de horários.

---

## 4. Público-alvo

O produto possui dois públicos principais.

### 4.1 Clientes

Inicialmente, o público principal é formado por pessoas que utilizam serviços de barbearia, com foco inicial em homens aproximadamente entre 15 e 50 anos.

Os clientes utilizam o sistema para:

- Consultar serviços.
- Consultar disponibilidade.
- Escolher barbeiros.
- Agendar horários.
- Consultar seus próprios agendamentos.
- Cancelar agendamentos.
- Avaliar atendimentos realizados.

### 4.2 Barbearias

O segundo público é formado principalmente por pequenas e médias barbearias que precisam organizar:

- Profissionais.
- Serviços.
- Horários de trabalho.
- Agenda.
- Folgas.
- Bloqueios.
- Agendamentos.
- Avaliações.

---

## 5. Personas

Persona é uma representação fictícia de um usuário típico do produto. Ela ajuda a orientar decisões de produto e experiência.

### 5.1 Cliente — Lucas

**Idade:** 27 anos

Lucas trabalha durante a semana e normalmente procura horários depois do trabalho ou aos finais de semana.

Ele não gosta de precisar enviar mensagens para perguntar quais horários estão disponíveis.

Seu objetivo é encontrar rapidamente um horário adequado, preferencialmente com um barbeiro específico.

**Necessidades:**

- Ver horários disponíveis.
- Escolher o serviço.
- Escolher o barbeiro.
- Agendar rapidamente.
- Ter acesso aos próprios agendamentos.
- Poder cancelar quando necessário.
- Avaliar o atendimento.

**Principais frustrações:**

- Precisar perguntar quais horários estão disponíveis.
- Descobrir que o horário desejado já foi ocupado.
- Não saber qual barbeiro realiza determinado serviço.
- Ter dificuldade para remarcar ou cancelar.

---

### 5.2 Administrador — Proprietário da Barbearia

O proprietário precisa visualizar e controlar a operação da barbearia.

Ele precisa saber:

- Quem trabalha em cada horário.
- Quais serviços cada barbeiro realiza.
- Quais horários estão ocupados.
- Quais horários estão disponíveis.
- Quais profissionais estão de folga.
- Quais horários precisam ser bloqueados.

**Principais frustrações:**

- Conflitos de agenda.
- Informações espalhadas.
- Controle manual dos horários.
- Dificuldade para visualizar a agenda completa.

---

### 5.3 Profissional — Barbeiro

O barbeiro utiliza o sistema principalmente para acompanhar seus próprios atendimentos.

Ele precisa:

- Visualizar sua agenda.
- Saber seus próximos atendimentos.
- Identificar o cliente.
- Saber qual serviço será realizado.
- Visualizar alterações ou cancelamentos.

---

## 6. Proposta de Valor

### Para o cliente

> Encontrar e reservar rapidamente um horário disponível com o barbeiro desejado, sem precisar entrar em contato diretamente com a barbearia.

### Para a barbearia

> Centralizar a agenda e a disponibilidade dos profissionais em uma única plataforma, reduzindo conflitos e facilitando o gerenciamento dos atendimentos.

### Proposta resumida

> **O CutFlow conecta clientes aos horários disponíveis da barbearia de forma simples, enquanto mantém a agenda organizada para toda a equipe.**

---

## 7. Objetivos do Produto

### Objetivo principal

Criar uma experiência de agendamento simples, rápida e confiável para clientes e uma ferramenta eficiente de gerenciamento de agenda para a barbearia.

### Objetivos específicos

- Reduzir a necessidade de agendamento manual.
- Evitar conflitos de horários.
- Facilitar a visualização da disponibilidade.
- Permitir escolha de serviço e barbeiro.
- Permitir gerenciamento de horários individuais.
- Permitir bloqueios de agenda.
- Permitir cancelamento.
- Registrar histórico de atendimentos.
- Permitir avaliações após o atendimento.

---

## 8. Fluxo Principal do Cliente

O fluxo principal esperado é:

```text
Criar conta / Entrar
        ↓
Escolher serviço
        ↓
Escolher data
        ↓
Visualizar barbeiros disponíveis
        ↓
Escolher barbeiro
        ↓
Visualizar horários disponíveis
        ↓
Escolher horário
        ↓
Confirmar agendamento
        ↓
Realizar atendimento
        ↓
Avaliar barbeiro
```

---

## 9. Fluxo Principal da Barbearia

```text
Entrar
  ↓
Dashboard
  ↓
Visualizar agenda
  ↓
Gerenciar profissionais
  ↓
Gerenciar serviços
  ↓
Definir horários de trabalho
  ↓
Definir folgas/bloqueios
  ↓
Gerenciar agendamentos
  ↓
Acompanhar avaliações
```

---

## 10. Funcionalidades do MVP

O MVP deve ser pequeno o suficiente para ser desenvolvido, testado e validado rapidamente.

### Autenticação

- Cadastro de cliente.
- Login.
- Logout.
- Recuperação de acesso, se suportada pela infraestrutura escolhida.
- Controle de sessão.

### Clientes

- Perfil básico.
- Visualização de próximos agendamentos.
- Histórico de agendamentos.
- Cancelamento.
- Avaliação de atendimento.

### Barbearia

- Cadastro e gerenciamento de barbeiros.
- Cadastro e gerenciamento de serviços.
- Definição dos serviços realizados por cada barbeiro.
- Definição dos horários de trabalho.
- Definição de folgas.
- Bloqueio de horários.
- Visualização da agenda.

### Agendamento

- Escolha do serviço.
- Escolha da data.
- Visualização de barbeiros disponíveis.
- Escolha do barbeiro.
- Visualização de horários disponíveis.
- Confirmação do agendamento.
- Cancelamento.

### Avaliações

Após um atendimento concluído:

- Cliente poderá avaliar o barbeiro.
- Avaliação deverá estar vinculada ao atendimento.
- A nota poderá ser utilizada para calcular a média do barbeiro.

---

## 11. Serviços

O sistema deverá permitir que a barbearia cadastre diferentes serviços.

Exemplos:

- Corte.
- Barba.
- Corte + Barba.
- Luzes.
- Reflexos.
- Outros serviços.

Cada serviço deverá possuir, no mínimo:

- Nome.
- Descrição opcional.
- Duração.
- Preço.
- Status ativo/inativo.

---

## 12. Profissionais

Cada barbeiro deverá possuir:

- Nome.
- Perfil.
- Status.
- Serviços que realiza.
- Horários de trabalho.
- Folgas.
- Bloqueios de agenda.

Um barbeiro poderá realizar vários serviços.

Exemplo:

```text
João
├── Corte
├── Barba
├── Corte + Barba
└── Luzes
```

---

## 13. Disponibilidade

A disponibilidade de um barbeiro deverá considerar:

1. Horário de trabalho.
2. Serviço selecionado.
3. Duração do serviço.
4. Agendamentos existentes.
5. Folgas.
6. Bloqueios.
7. Eventuais regras futuras da barbearia.

Exemplo:

```text
Horário de trabalho:
10:00 → 19:00

Agendamento:
14:00 → 14:30

Resultado:

13:30 → disponível
14:00 → ocupado
14:30 → disponível
15:00 → disponível
```

A implementação exata dos intervalos será definida na fase de arquitetura.

---

## 14. Bloqueios de Agenda

A barbearia deverá conseguir bloquear:

- Um dia inteiro.
- Um intervalo de horário.
- Folga de um profissional.
- Feriados.
- Eventos excepcionais.
- Outros períodos em que determinado barbeiro não estará disponível.

Exemplos:

```text
07/09
Feriado

10/09
João — Folga

15/09
Pedro — Bloqueado
14:00 → 16:00
```

---

## 15. Avaliações

O cliente poderá avaliar o barbeiro após um atendimento.

A avaliação deverá:

- Estar vinculada a um atendimento.
- Ser realizada por um cliente autenticado.
- Ser realizada somente após o atendimento.
- Não permitir múltiplas avaliações para o mesmo atendimento.
- Ser associada ao barbeiro responsável.

A forma exata da avaliação será definida posteriormente.

Uma possibilidade para o MVP é utilizar uma nota de 1 a 5.

---

## 16. Regras de Negócio Iniciais

### RB-001 — Agendamento

Um agendamento deve possuir:

- Cliente.
- Serviço.
- Barbeiro.
- Data.
- Horário.
- Status.

### RB-002 — Conflito

Um barbeiro não pode possuir dois atendimentos conflitantes.

### RB-003 — Serviço

Um cliente somente poderá agendar serviços ativos.

### RB-004 — Profissional

Um cliente somente poderá escolher um barbeiro que realize o serviço selecionado.

### RB-005 — Disponibilidade

Um horário somente poderá ser oferecido quando o barbeiro estiver disponível durante toda a duração do serviço.

### RB-006 — Horário de trabalho

Agendamentos não podem ser realizados fora do horário de trabalho do barbeiro.

### RB-007 — Bloqueios

Horários bloqueados não podem receber novos agendamentos.

### RB-008 — Cancelamento

Clientes poderão cancelar seus próprios agendamentos de acordo com as regras definidas pelo produto.

### RB-009 — Avaliação

Somente atendimentos elegíveis poderão receber avaliações.

### RB-010 — Isolamento

Dados administrativos não devem estar disponíveis para clientes que não possuam a permissão correspondente.

---

## 17. Modelo de Acesso Inicial

O sistema deverá possuir diferentes níveis de acesso.

### Cliente

Pode:

- Gerenciar seu próprio perfil.
- Consultar serviços.
- Consultar disponibilidade.
- Criar agendamentos.
- Visualizar seus agendamentos.
- Cancelar seus agendamentos.
- Avaliar atendimentos elegíveis.

### Barbeiro

Pode:

- Visualizar sua agenda.
- Visualizar seus atendimentos.
- Visualizar informações necessárias dos clientes.
- Atualizar estados permitidos dos atendimentos.

### Administrador

Pode:

- Gerenciar barbeiros.
- Gerenciar serviços.
- Gerenciar horários.
- Gerenciar bloqueios.
- Gerenciar agendamentos.
- Visualizar avaliações.
- Administrar configurações da barbearia.

A definição detalhada das permissões será especificada na documentação de autorização.

---

## 18. Escopo do MVP

### Dentro do escopo

- Aplicação web responsiva.
- Autenticação.
- Perfil de cliente.
- Área administrativa.
- Cadastro de barbeiros.
- Cadastro de serviços.
- Relação entre barbeiros e serviços.
- Horários de trabalho.
- Folgas.
- Bloqueios.
- Calendário.
- Disponibilidade.
- Agendamento.
- Cancelamento.
- Histórico básico.
- Avaliações.
- Controle de acesso baseado em função.

### Fora do escopo

- Aplicativo mobile nativo.
- Pagamentos online.
- Assinaturas financeiras.
- Integração com WhatsApp.
- SMS.
- Programa de fidelidade.
- Cupons.
- Estoque.
- Gestão financeira completa.
- Marketplace de barbearias.
- Múltiplas unidades.
- IA.
- Relatórios avançados.
- Integrações externas complexas.

---

## 19. Pós-MVP

Possíveis funcionalidades futuras:

### Gestão

- Dashboard avançado.
- Relatórios.
- Métricas de desempenho.
- Histórico avançado.

### Comunicação

- E-mail.
- WhatsApp.
- SMS.
- Lembretes automáticos.

### Financeiro

- Pagamentos online.
- Controle financeiro.
- Comissões.

### Experiência

- Favoritar barbeiros.
- Reagendamento.
- Programa de fidelidade.
- Cupons.
- Avaliações detalhadas.

### Inteligência Artificial

- Assistente para proprietários.
- Análise de agenda.
- Previsão de demanda.
- Identificação de horários de maior movimento.
- Sugestões para melhorar ocupação da agenda.

### Escalabilidade

- Múltiplas barbearias.
- Franquias.
- Múltiplas unidades.
- Gestão centralizada.

---

## 20. Modelo de Negócio

O modelo de negócio planejado é SaaS por assinatura.

A barbearia será o cliente pagante da plataforma.

O cliente final utilizará o sistema para realizar seus agendamentos.

A estratégia comercial detalhada ainda não está definida.

O MVP não terá cobrança obrigatória.

---

## 21. Estratégia de Evolução

A evolução planejada será:

```text
MVP
 ↓
Validação do fluxo de agendamento
 ↓
Correção de problemas
 ↓
Melhoria da experiência
 ↓
Recursos de gestão
 ↓
Comunicação
 ↓
Financeiro
 ↓
IA
 ↓
Suporte a múltiplas unidades
```

A prioridade será validar o problema principal antes de aumentar o escopo.

---

## 22. Princípios do Produto

### Simplicidade

O cliente deve conseguir realizar um agendamento sem precisar entender a complexidade interna da agenda.

### Confiabilidade

O sistema deve evitar conflitos e apresentar somente horários realmente disponíveis.

### Transparência

O cliente deve saber claramente:

- Qual serviço escolheu.
- Qual barbeiro realizará o serviço.
- Quando será realizado.
- Qual a duração esperada.

### Controle

A barbearia deve possuir controle sobre:

- Profissionais.
- Serviços.
- Horários.
- Folgas.
- Bloqueios.
- Agendamentos.

### Evolução

O MVP deve ser simples, mas a arquitetura não deve impedir futuras expansões.

---

## 23. Métrica Principal de Sucesso

A principal métrica inicial será:

> **Percentual de agendamentos realizados com sucesso através do fluxo digital.**

Outras métricas poderão ser definidas posteriormente.

Exemplos:

- Número de agendamentos.
- Taxa de cancelamento.
- Taxa de conclusão.
- Tempo médio para realizar um agendamento.
- Número de clientes recorrentes.
- Avaliação média dos barbeiros.

---

## 24. Fora de Decisão

As seguintes decisões ainda não foram tomadas:

- Nome definitivo do produto.
- Identidade visual.
- Stack tecnológica definitiva.
- Provedor de autenticação.
- Banco de dados definitivo.
- Estratégia de hospedagem.
- Sistema de pagamentos.
- Política definitiva de cancelamento.
- Modelo exato de avaliação.
- Regras comerciais.
- Preços dos planos.
- Estratégia de expansão para múltiplas unidades.

Essas decisões serão tomadas nas fases apropriadas.

---

## 25. Estado Atual

O CutFlow está atualmente na fase de **Product Discovery**.

Nenhum código deve ser produzido até que:

1. O Product Brief seja validado.
2. Os requisitos do produto sejam definidos.
3. A arquitetura seja definida.
4. O escopo do MVP seja aprovado.

Após essas etapas, será criado o repositório oficial do projeto e iniciado o planejamento técnico através de Issues, Milestones, Projects e branches.

---

## 26. Próxima Fase

**Fase 1 — Product Requirements**

A próxima etapa deverá transformar as ideias deste documento em requisitos verificáveis.

Será necessário definir:

- Requisitos funcionais.
- Requisitos não funcionais.
- User Stories.
- Acceptance Criteria.
- Estados dos agendamentos.
- Regras de cancelamento.
- Regras de avaliação.
- Fluxos de usuário.
- Casos de uso.
- Definition of Done.
- Escopo definitivo do MVP.