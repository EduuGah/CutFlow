# CutFlow — AI Development Context

> Documento mestre de contexto para utilização com ferramentas de IA durante o desenvolvimento do CutFlow.

**Projeto:** CutFlow
**Versão do contexto:** 1.0.0
**Data:** 2026-08-27
**Status:** Product Requirements
**MVP:** Em especificação
**Repositório GitHub:** Ainda não criado
**Implementação:** Ainda não iniciada

---

# 1. INSTRUÇÃO PRINCIPAL PARA A IA

Você está participando do desenvolvimento de um projeto de software chamado CutFlow.

O CutFlow é uma plataforma web de agendamento e gestão para barbearias.

Este documento contém o contexto consolidado do projeto e deve ser tratado como uma fonte de contexto para todas as próximas tarefas.

IMPORTANTE:

Não implemente o projeto inteiro de uma vez.

Não pule fases.

Não invente funcionalidades sem autorização.

Não altere decisões de produto sem discutir primeiro.

Não considere uma tarefa concluída apenas porque o código aparentemente funciona.

O desenvolvimento deverá acontecer de maneira incremental, profissional e rastreável.

Todas as decisões importantes devem ser documentadas.

O usuário deseja utilizar o desenvolvimento deste projeto como uma experiência prática para aprender como um projeto de software profissional é planejado, desenvolvido, testado, versionado e publicado utilizando IA como ferramenta de desenvolvimento.

A IA deve atuar como uma parceira de desenvolvimento, não como uma ferramenta que simplesmente gera todo o projeto de uma vez.

---

# 2. OBJETIVO DO PROJETO

O objetivo é criar uma aplicação web funcional para gerenciamento de agenda e agendamento de serviços de uma barbearia.

O projeto inicialmente atenderá uma única barbearia.

Entretanto, a arquitetura deve permitir uma futura expansão para múltiplas barbearias ou unidades.

Não devemos implementar funcionalidades de múltiplas barbearias no MVP.

Devemos apenas evitar decisões arquiteturais que tornem essa expansão impossível ou excessivamente custosa.

---

# 3. PROBLEMA

Barbearias podem enfrentar dificuldades para organizar seus horários e profissionais quando os agendamentos são realizados manualmente ou através de ferramentas pouco especializadas.

Problemas principais:

- Agenda desorganizada.
- Conflitos de horários.
- Dificuldade para saber quais barbeiros estão disponíveis.
- Dificuldade para saber quais serviços cada barbeiro realiza.
- Necessidade de contato manual para consultar horários.
- Dificuldade para administrar folgas.
- Dificuldade para bloquear horários.
- Falta de centralização dos agendamentos.

Para o cliente, o processo tradicional pode exigir mensagens ou ligações para descobrir:

- Qual serviço está disponível.
- Qual barbeiro pode realizar o serviço.
- Qual horário está disponível.
- Se determinado dia possui disponibilidade.

O CutFlow busca centralizar esse processo.

---

# 4. PROPOSTA DE VALOR

## Para o cliente

Permitir que o cliente encontre e reserve rapidamente um horário com o barbeiro desejado sem precisar entrar em contato diretamente com a barbearia.

## Para a barbearia

Centralizar a agenda e a disponibilidade dos profissionais em uma única plataforma, reduzindo conflitos e facilitando o gerenciamento dos atendimentos.

## Resumo

> O CutFlow conecta clientes aos horários disponíveis da barbearia de forma simples, enquanto mantém a agenda organizada para toda a equipe.

---

# 5. PÚBLICO-ALVO

Existem três usuários principais.

## 5.1 Cliente

Pessoas que utilizam serviços de barbearia.

Público inicial:

Principalmente homens entre aproximadamente 15 e 50 anos.

O cliente utiliza o sistema para:

- Criar conta.
- Fazer login.
- Consultar calendário.
- Escolher data.
- Escolher serviço.
- Encontrar barbeiros disponíveis.
- Escolher barbeiro.
- Escolher horário.
- Criar agendamento.
- Consultar agendamentos.
- Cancelar agendamentos.
- Avaliar atendimentos concluídos.

---

# 6. PERSONAS

## 6.1 Lucas — Cliente

Idade: 27 anos.

Lucas trabalha durante a semana e geralmente procura horários depois do trabalho ou nos finais de semana.

Ele não gosta de precisar mandar mensagens para descobrir horários disponíveis.

Seu objetivo é encontrar rapidamente um horário adequado, preferencialmente com um barbeiro específico.

Necessidades:

- Ver horários disponíveis.
- Escolher serviço.
- Escolher barbeiro.
- Agendar rapidamente.
- Consultar agendamentos.
- Cancelar quando necessário.
- Avaliar atendimento.

Frustrações:

- Precisar perguntar horários por mensagem.
- Descobrir que o horário já foi ocupado.
- Não saber qual barbeiro realiza determinado serviço.
- Dificuldade para cancelar ou remarcar.

---

## 6.2 Proprietário / Administrador

Responsável pela operação da barbearia.

Precisa controlar:

- Barbeiros.
- Serviços.
- Horários.
- Folgas.
- Bloqueios.
- Agendamentos.
- Avaliações.

Principais problemas:

- Conflitos de agenda.
- Informações espalhadas.
- Controle manual.
- Dificuldade de visualizar toda a operação.

---

## 6.3 Barbeiro

Utiliza o sistema principalmente para visualizar seus atendimentos.

Precisa:

- Visualizar agenda.
- Ver próximos atendimentos.
- Identificar cliente.
- Ver serviço.
- Ver alterações.
- Iniciar atendimento.
- Concluir atendimento.

---

# 7. FLUXO PRINCIPAL DO CLIENTE

O fluxo definido é:

Cliente
↓
Login / Cadastro
↓
Calendário
↓
Escolher data
↓
Escolher serviço
↓
Sistema identifica barbeiros compatíveis
↓
Sistema verifica disponibilidade
↓
Escolher barbeiro
↓
Escolher horário
↓
Confirmar agendamento
↓
Atendimento
↓
Avaliação

IMPORTANTE:

A escolha da data ocorre antes da escolha do serviço.

Fluxo oficial:

DATA → SERVIÇO → BARBEIRO → HORÁRIO

---

# 8. AUTENTICAÇÃO

O cliente terá uma conta.

Dados:

- Nome.
- E-mail.
- Senha.
- Telefone.

O telefone existe para permitir que a barbearia entre em contato com o cliente quando necessário.

A senha nunca deve ser armazenada em texto puro.

O sistema deverá utilizar uma solução adequada de autenticação.

---

# 9. TIPOS DE USUÁRIO

Existem três funções principais:

CUSTOMER
BARBER
ADMIN

---

# 10. CLIENTE

O cliente poderá:

- Criar conta.
- Fazer login.
- Fazer logout.
- Visualizar perfil.
- Editar perfil.
- Visualizar calendário.
- Escolher data.
- Escolher serviço.
- Visualizar barbeiros disponíveis.
- Visualizar horários.
- Criar agendamento.
- Visualizar seus agendamentos.
- Cancelar seus agendamentos.
- Avaliar atendimentos concluídos.

---

# 11. BARBEIRO

O barbeiro poderá:

- Fazer login.
- Visualizar sua agenda.
- Visualizar seus atendimentos.
- Visualizar informações necessárias do cliente.
- Iniciar atendimento.
- Concluir atendimento.

O barbeiro NÃO deverá possuir acesso às configurações administrativas.

---

# 12. ADMINISTRADOR

O administrador poderá:

- Gerenciar barbeiros.
- Criar barbeiros.
- Editar barbeiros.
- Ativar/desativar barbeiros.
- Gerenciar serviços.
- Criar serviços.
- Editar serviços.
- Ativar/desativar serviços.
- Associar serviços a barbeiros.
- Configurar horários da barbearia.
- Configurar horários individuais.
- Criar folgas.
- Criar bloqueios.
- Visualizar agenda.
- Gerenciar agendamentos.
- Visualizar avaliações.

---

# 13. SERVIÇOS

Serviços iniciais:

| Serviço | Duração |
|---|---:|
| Corte | 30 minutos |
| Barba | 20 minutos |
| Luzes | 90 minutos |

Esses valores são iniciais e poderão ser alterados posteriormente.

O administrador deverá futuramente poder:

- Criar serviços.
- Alterar serviços.
- Definir duração.
- Definir preço.
- Ativar/desativar serviços.

Um serviço inativo não poderá receber novos agendamentos.

---

# 14. RELAÇÃO BARBEIRO/SERVIÇO

Um barbeiro pode realizar vários serviços.

Exemplo:

João:
- Corte.
- Barba.
- Luzes.

Pedro:
- Corte.
- Barba.

O sistema deve impedir que um cliente escolha um barbeiro para um serviço que ele não realiza.

---

# 15. HORÁRIOS

A barbearia terá horários gerais de funcionamento.

Exemplo:

Segunda:
10:00 → 19:00

Terça:
10:00 → 19:00

Quarta:
10:00 → 19:00

Os horários podem variar entre os dias da semana.

Além disso, cada barbeiro terá sua própria disponibilidade.

Exemplo:

Barbearia:
10:00 → 21:00

João:
10:00 → 18:00

Pedro:
12:00 → 21:00

A disponibilidade final deverá considerar ambas as regras.

---

# 16. FOLGAS E BLOQUEIOS

O administrador poderá bloquear horários.

Tipos:

- Dia inteiro.
- Intervalo específico.
- Folga de barbeiro.
- Feriado.
- Ausência excepcional.

Exemplo:

07/09:
Barbearia fechada.

10/09:
João — Folga.

15/09:
Pedro — Bloqueado das 14:00 às 16:00.

Horários bloqueados não podem receber novos agendamentos.

---

# 17. DISPONIBILIDADE

Para determinar se um horário está disponível, o sistema deverá considerar:

1. Data.
2. Horário de funcionamento da barbearia.
3. Horário de trabalho do barbeiro.
4. Serviço.
5. Duração do serviço.
6. Agendamentos existentes.
7. Folgas.
8. Bloqueios.
9. Status do barbeiro.
10. Status do serviço.

---

# 18. DURAÇÃO

Cada serviço possui uma duração.

Exemplos:

Corte:
30 minutos.

Barba:
20 minutos.

Luzes:
90 minutos.

Um horário só será considerado disponível se houver espaço suficiente para todo o serviço.

Exemplo:

Serviço:
Luzes — 90 minutos.

Horário de trabalho:
10:00 → 18:00.

Se existir um bloqueio às 16:00:

Não oferecer:

14:30 → 16:00

porque o serviço terminaria exatamente no bloqueio.

---

# 19. AGENDAMENTO

Um agendamento deve possuir:

- Cliente.
- Barbeiro.
- Serviço.
- Data.
- Horário.
- Duração.
- Status.

Status iniciais:

CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED

---

# 20. TRANSIÇÕES

Fluxo normal:

CONFIRMED
↓
IN_PROGRESS
↓
COMPLETED

Cancelamento:

CONFIRMED
↓
CANCELLED

A avaliação somente poderá ocorrer depois de:

COMPLETED

As transições detalhadas serão definidas em BUSINESS_RULES.md.

---

# 21. CANCELAMENTO

O cliente pode cancelar seu próprio agendamento a qualquer momento.

Não haverá janela mínima de cancelamento no MVP.

Ao cancelar:

- Status passa para CANCELLED.
- Histórico é preservado.
- Horário poderá voltar a ficar disponível.

---

# 22. AVALIAÇÕES

Após um atendimento concluído, o cliente poderá avaliar o barbeiro.

Avaliação inicial:

- Nota de 1 a 5.
- Comentário opcional.

Regras:

- Cliente precisa estar autenticado.
- Cliente só pode avaliar seu próprio atendimento.
- Atendimento precisa estar COMPLETED.
- Um atendimento só pode receber uma avaliação.
- Avaliação pertence ao barbeiro.
- Avaliação pertence ao atendimento.

O sistema calculará a média das avaliações do barbeiro.

---

# 23. CONTROLE DE ACESSO

CUSTOMER:

Pode acessar apenas seus próprios dados e operações permitidas.

BARBER:

Pode acessar sua agenda e operações relacionadas aos seus atendimentos.

ADMIN:

Pode administrar a barbearia.

IMPORTANTE:

Controle de acesso deve existir no backend.

Nunca confiar apenas em:

- Botões escondidos.
- Rotas protegidas no frontend.
- Condicionais da interface.

---

# 24. BANCO DE DADOS — CONCEITO INICIAL

Entidades previstas:

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

A estrutura definitiva ainda NÃO foi decidida.

A IA deverá analisar e propor uma modelagem durante a fase de arquitetura.

Não criar banco definitivo antes dessa fase.

---

# 25. MULTI-BARBERSHOP

O MVP suporta operacionalmente apenas uma barbearia.

Porém, o sistema deverá possuir uma arquitetura que permita futuramente:

CutFlow
├── Barbearia A
│   ├── João
│   └── Pedro
│
├── Barbearia B
│   ├── Carlos
│   └── Lucas
│
└── Barbearia C
    └── ...

Não implementar marketplace ou múltiplas unidades no MVP.

Apenas evitar decisões que tornem isso impossível futuramente.

---

# 26. MVP

## Dentro

- Autenticação.
- Perfil.
- Calendário.
- Serviços.
- Barbeiros.
- Relação barbeiro/serviço.
- Horários.
- Folgas.
- Bloqueios.
- Disponibilidade.
- Agendamento.
- Cancelamento.
- Agenda do cliente.
- Agenda do barbeiro.
- Agenda administrativa.
- Status de atendimento.
- Avaliações.
- Controle de acesso.

## Fora

- Pagamentos.
- Assinaturas financeiras.
- WhatsApp.
- SMS.
- Programa de fidelidade.
- Cupons.
- Estoque.
- Gestão financeira completa.
- Marketplace.
- Múltiplas barbearias na interface.
- IA.
- Analytics avançado.
- Aplicativo mobile nativo.

---

# 27. PÓS-MVP

Possibilidades futuras:

- Notificações.
- WhatsApp.
- SMS.
- Pagamentos.
- Assinaturas.
- Comissões.
- Dashboard avançado.
- Analytics.
- Fidelidade.
- Cupons.
- Favoritos.
- Reagendamento.
- IA.
- Previsão de demanda.
- Sugestões de horários.
- Múltiplas unidades.
- Franquias.

---

# 28. MODELO DE NEGÓCIO

O modelo planejado é SaaS.

A barbearia será o cliente pagante.

Os clientes finais utilizarão a plataforma para realizar agendamentos.

O MVP não terá cobrança obrigatória.

Preços e planos ainda não foram definidos.

---

# 29. DOCUMENTAÇÃO JÁ PRODUZIDA

Atualmente existem os seguintes documentos:

PROJECT_BRIEF.md

docs/product/PRODUCT_REQUIREMENTS.md

docs/product/USER_STORIES.md

Esses documentos representam as decisões tomadas até agora.

Não contradiga esses documentos sem primeiro explicar a inconsistência.

---

# 30. FASES DO PROJETO

O projeto será desenvolvido nas seguintes fases:

FASE 0
Product Discovery

FASE 1
Product Requirements

FASE 2
Architecture & Technical Design

FASE 3
Repository Setup

FASE 4
Project Management

FASE 5
Foundation

FASE 6
Authentication & Authorization

FASE 7
Core Domain

FASE 8
Scheduling

FASE 9
Administration

FASE 10
Reviews

FASE 11
Testing & Quality

FASE 12
UI/UX Polish

FASE 13
Production

FASE 14
Post-MVP

---

# 31. ESTADO ATUAL

FASE 0 — Product Discovery

STATUS:
COMPLETED

PROJECT_BRIEF.md:
APPROVED

FASE 1 — Product Requirements

STATUS:
IN PROGRESS

PRODUCT_REQUIREMENTS.md:
APPROVED

USER_STORIES.md:
APPROVED

BUSINESS_RULES.md:
NOT CREATED

MVP_SCOPE.md:
NOT CREATED

Architecture:
NOT STARTED

GitHub:
NOT CREATED

Implementation:
NOT STARTED

---

# 32. PRÓXIMO PASSO

O próximo passo é criar:

docs/product/BUSINESS_RULES.md

Depois:

docs/product/MVP_SCOPE.md

Somente após esses documentos serem aprovados deverá começar a fase de arquitetura.

---

# 33. ARQUITETURA

Na fase de arquitetura deverão ser decididos:

- Frontend.
- Backend.
- Banco de dados.
- Autenticação.
- Autorização.
- API.
- Estrutura de pastas.
- Modelo de dados.
- Segurança.
- Validação.
- Testes.
- Tratamento de erros.
- Logging.
- Variáveis de ambiente.
- Deploy.
- CI/CD.

A IA deverá apresentar alternativas e justificar recomendações antes de implementar.

---

# 34. GITHUB

O GitHub ainda NÃO foi criado.

Quando chegarmos à fase de Repository Setup:

1. Criar repositório.
2. Criar README.
3. Criar .gitignore.
4. Configurar licença, se necessário.
5. Criar estrutura inicial.
6. Fazer primeiro commit.
7. Criar branch de desenvolvimento, se necessário.
8. Configurar Issues.
9. Configurar Labels.
10. Configurar Milestones.
11. Configurar GitHub Project.
12. Definir fluxo de branches.
13. Definir Pull Requests.
14. Definir regras de revisão.
15. Configurar CI posteriormente.

A IA deverá orientar o usuário passo a passo.

Não presumir que o Google AI Studio criará ou administrará tudo automaticamente.

---

# 35. FLUXO DE DESENVOLVIMENTO

Cada unidade significativa de trabalho deverá seguir aproximadamente:

Issue
↓
Planejamento
↓
Branch
↓
Implementação
↓
Testes
↓
Commit
↓
Push
↓
Pull Request
↓
Code Review
↓
Correções
↓
Aprovação
↓
Merge

A IA deve explicar ao usuário o que está acontecendo em cada etapa.

---

# 36. BRANCHES

A estratégia definitiva ainda será definida.

Uma possibilidade:

main
develop
feature/*
fix/*
chore/*
docs/*

Não assumir esta estratégia como definitiva antes da fase de configuração do GitHub.

---

# 37. COMMITS

Commits deverão ser pequenos e relacionados a uma mudança lógica.

Evitar commits gigantes como:

"finished entire application"

Preferir commits específicos:

feat(auth): add customer registration

fix(scheduling): prevent overlapping appointments

test(appointments): add availability validation

docs(product): update cancellation rules

A convenção definitiva deverá ser definida antes do início do desenvolvimento.

---

# 38. PULL REQUESTS

Cada PR deverá:

- Ter título claro.
- Referenciar Issue.
- Explicar o que foi alterado.
- Explicar como foi testado.
- Informar possíveis impactos.
- Ser pequeno o suficiente para revisão.
- Não misturar mudanças não relacionadas.

Exemplo:

Issue:
#24 Implement appointment creation

Branch:
feature/24-create-appointment

PR:
feat: implement appointment creation

---

# 39. TESTES

Testes deverão fazer parte do desenvolvimento.

Não deixar todos os testes para o final.

Priorizar testes para:

- Regras de disponibilidade.
- Conflitos.
- Duração.
- Bloqueios.
- Cancelamento.
- Permissões.
- Avaliações.
- Transições de status.

---

# 40. SEGURANÇA

Segurança é requisito desde o início.

Considerar:

- Autenticação.
- Autorização.
- Validação de entrada.
- Controle de acesso.
- Proteção de dados.
- Secrets.
- Variáveis de ambiente.
- Regras do banco.
- Segurança de APIs.
- Proteção contra acesso indevido.

Nunca colocar:

- Senhas.
- API keys.
- Tokens.
- Secrets.

diretamente no código ou Git.

---

# 41. IA COMO FERRAMENTA

A IA deverá ser utilizada como uma ferramenta de desenvolvimento profissional.

A IA pode:

- Analisar requisitos.
- Sugerir arquitetura.
- Criar código.
- Criar testes.
- Refatorar.
- Explicar decisões.
- Analisar erros.
- Revisar código.
- Sugerir melhorias.

Mas a IA NÃO deve:

- Criar funcionalidades não aprovadas.
- Alterar requisitos silenciosamente.
- Ignorar regras de negócio.
- Fazer grandes mudanças sem explicar.
- Implementar tudo em uma única etapa.
- Considerar código gerado automaticamente como correto sem testes.
- Inventar APIs.
- Inventar credenciais.
- Expor secrets.
- Remover testes para fazer o build passar.

---

# 42. PRINCÍPIO DE DESENVOLVIMENTO INCREMENTAL

Nunca solicitar:

"Construa o CutFlow inteiro."

Preferir:

"Implemente a Issue #12."

Depois:

"Execute os testes."

Depois:

"Analise os resultados."

Depois:

"Corrija os problemas encontrados."

Depois:

"Prepare o resumo do PR."

---

# 43. REGRA DE CONTEXTO

Antes de implementar uma funcionalidade, a IA deve verificar:

1. Product Brief.
2. Product Requirements.
3. User Stories.
4. Business Rules.
5. MVP Scope.
6. Architecture.
7. Issues relacionadas.
8. Código existente.

Se existir conflito, parar e informar.

---

# 44. REGRA DE NÃO INVENTAR

Quando uma informação necessária não estiver definida:

NÃO inventar silenciosamente.

A IA deve:

1. Identificar a lacuna.
2. Explicar por que ela é importante.
3. Sugerir uma opção.
4. Aguardar aprovação quando a decisão for relevante.

Exemplo:

"Precisamos definir se um administrador pode cancelar qualquer agendamento. Isso afeta autorização e regras de negócio. Minha recomendação é permitir. Deseja seguir assim?"

---

# 45. REGRA DE MUDANÇA

Se uma nova decisão alterar um documento existente:

1. Identificar o documento afetado.
2. Explicar a consequência.
3. Atualizar o documento.
4. Verificar documentos dependentes.
5. Atualizar requisitos relacionados.
6. Atualizar Issues quando aplicável.

Não deixar documentação desatualizada.

---

# 46. REGRA DE ESCOPO

Se surgir uma ideia interessante durante o desenvolvimento:

Não adicionar automaticamente ao MVP.

Classificar como:

MUST HAVE
SHOULD HAVE
COULD HAVE
WON'T HAVE

Se estiver fora do MVP, registrar como possível funcionalidade futura.

---

# 47. DEFINITION OF DONE

Uma tarefa não está pronta apenas porque o código compila.

Uma tarefa deverá considerar:

- Código implementado.
- Testes implementados quando aplicáveis.
- Testes executados.
- Regras de negócio respeitadas.
- Segurança considerada.
- Responsividade considerada quando aplicável.
- Documentação atualizada quando necessário.
- Sem erros críticos conhecidos.
- PR revisável.

---

# 48. PROCESSO DE APROVAÇÃO

O usuário é responsável pela aprovação das decisões importantes.

A IA deve apresentar decisões importantes antes de aplicá-las.

Exemplos:

- Arquitetura.
- Banco de dados.
- Autenticação.
- Estratégia de branches.
- Modelo de autorização.
- Bibliotecas importantes.
- Alterações de escopo.
- Mudanças de requisitos.

---

# 49. GOOGLE AI STUDIO

O Google AI Studio será utilizado como ferramenta de desenvolvimento assistido por IA.

O AI Studio NÃO é considerado automaticamente o sistema de gerenciamento do projeto.

GitHub continuará sendo a fonte principal de:

- Código.
- Issues.
- Pull Requests.
- Histórico.
- Versionamento.

Documentação importante deverá permanecer no repositório.

---

# 50. COMO A IA DEVE RESPONDER

Ao receber uma nova tarefa, a IA deve:

1. Identificar a fase atual.
2. Identificar os requisitos relacionados.
3. Identificar a Issue relacionada, quando existir.
4. Verificar dependências.
5. Explicar brevemente o plano.
6. Implementar apenas o escopo solicitado.
7. Executar/verificar testes quando possível.
8. Informar arquivos alterados.
9. Informar decisões relevantes.
10. Informar próximos passos.

Evitar respostas vagas como:

"Pronto, sistema implementado."

Preferir:

"Implementei a criação de agendamentos da Issue #24.

Alterações:
- ...
- ...
- ...

Testes:
- ...
- ...

Regras consideradas:
- ...
- ...

Possíveis próximos passos:
- ..."

---

# 51. PRIMEIRA TAREFA APÓS IMPORTAR ESTE CONTEXTO

Quando este documento for fornecido à IA, NÃO começar a programar.

Primeiro:

1. Ler este documento.
2. Confirmar entendimento.
3. Reconhecer que o projeto está na FASE 1.
4. Não criar código.
5. Não criar banco.
6. Não criar GitHub automaticamente.
7. Não implementar funcionalidades.
8. Aguardar o próximo comando.

A próxima atividade planejada é:

BUSINESS_RULES.md

---

# 52. COMANDO DE CONTINUAÇÃO

Após fornecer este documento à IA, o usuário poderá dizer:

"Leia o AI_CONTEXT.md e continue exatamente de onde paramos."

Nesse momento, a IA deverá continuar a partir da fase indicada no documento, respeitando todas as decisões existentes.

---

# 53. VISÃO DO PROJETO

O objetivo final é chegar a:

CutFlow
│
├── Cliente
│   ├── Cadastro
│   ├── Login
│   ├── Calendário
│   ├── Agendamento
│   ├── Histórico
│   └── Avaliações
│
├── Barbeiro
│   ├── Agenda
│   ├── Atendimentos
│   ├── Iniciar atendimento
│   └── Concluir atendimento
│
└── Administrador
    ├── Dashboard
    ├── Agenda
    ├── Barbeiros
    ├── Serviços
    ├── Horários
    ├── Folgas
    ├── Bloqueios
    └── Avaliações

Tudo deverá ser construído incrementalmente.

---

# 54. OBJETIVO EDUCACIONAL

Além de criar um produto funcional, este projeto tem como objetivo ensinar na prática:

- Product Discovery.
- Documentação.
- Requisitos.
- User Stories.
- Regras de negócio.
- Arquitetura.
- Modelagem de banco.
- Autenticação.
- Autorização.
- Git.
- GitHub.
- Issues.
- Milestones.
- Projects.
- Branches.
- Commits.
- Pull Requests.
- Code Review.
- Testes.
- CI/CD.
- Deploy.
- Segurança.
- Desenvolvimento assistido por IA.

O processo é tão importante quanto o produto final.

---

# 55. REGRA FINAL

Não tentar chegar ao produto final rapidamente.

O objetivo é construir o CutFlow de forma:

- Profissional.
- Incremental.
- Documentada.
- Testável.
- Versionada.
- Revisável.
- Segura.
- Sustentável.

A velocidade de geração de código não deve ser priorizada em relação à qualidade do processo.
