# Regras de Negócio (Business Rules) - CutFlow

Este documento define as regras de negócio centrais que governam o comportamento do sistema CutFlow. Estas regras devem ser respeitadas em todas as camadas da aplicação (Frontend e Backend/Regras de API).

## 1. Fluxo de Agendamento (Scheduling)

*   **BR-01 - Ordem Obrigatória:** O fluxo de agendamento pelo Cliente deve seguir estritamente a ordem de seleção: `Data` ➔ `Serviço` ➔ `Barbeiro` ➔ `Horários Disponíveis`.
*   **BR-02 - Prevenção de Conflitos (Overbooking):** Um Barbeiro não pode ter dois agendamentos simultâneos no mesmo intervalo de tempo. O sistema deve calcular a disponibilidade somando a duração padrão do serviço selecionado à hora de início.
*   **BR-03 - Respeito à Jornada e Bloqueios:** Os horários disponíveis para agendamento só podem ser exibidos se:
    1.  Estiverem dentro da jornada de trabalho configurada para o Barbeiro selecionado naquele dia da semana.
    2.  Não colidirem com bloqueios manuais ou folgas (`time-offs`) registradas pelo Administrador.

## 2. Gestão de Estado do Agendamento (State Management)

*   **BR-04 - Transições de Status:** 
    *   Ao ser criado, o agendamento assume o status `CONFIRMED`.
    *   Apenas o Barbeiro responsável ou um Administrador podem transicionar o status de `CONFIRMED` para `IN_PROGRESS`.
    *   Apenas o Barbeiro responsável ou um Administrador podem transicionar o status de `IN_PROGRESS` para `COMPLETED`.
*   **BR-05 - Regra de Cancelamento Livre:** O status `CANCELLED` pode ser acionado pelo Cliente, pelo Barbeiro ou pelo Administrador a qualquer momento antes de o agendamento ser marcado como concluído. No momento (MVP), não há limite mínimo de horas de antecedência para o cliente efetuar um cancelamento.

## 3. Sistema de Avaliação (Reviews)

*   **BR-06 - Elegibilidade para Avaliação:** Um cliente só está autorizado a avaliar um atendimento (dar nota e comentar) se o status daquele agendamento for estritamente `COMPLETED`.
*   **BR-07 - Limite de Avaliação:** É permitida apenas 1 (uma) avaliação por agendamento concluído. O sistema deve aceitar uma nota de 1 a 5 estrelas e, opcionalmente, um comentário em texto.

## 4. Permissões e Acessos (RBAC)

*   **BR-08 - Visibilidade de Agendamentos (Barbeiros):** Um usuário com a role `Barber` só pode visualizar, editar o status ou interagir com os agendamentos que estão atribuídos especificamente a ele.
*   **BR-09 - Visibilidade de Agendamentos (Clientes):** Um usuário com a role `Customer` só pode visualizar e interagir com seu próprio histórico de agendamentos.
*   **BR-10 - Visibilidade Administrativa (Admins):** Um usuário com a role `Admin` possui visão irrestrita, podendo visualizar, criar, cancelar e alterar o status de qualquer agendamento de qualquer barbeiro na plataforma.
