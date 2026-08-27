# Escopo do MVP (MVP Scope) - CutFlow

Este documento define o limite exato do que será construído na primeira versão (Minimum Viable Product) da plataforma CutFlow. O objetivo é evitar o *scope creep* (aumento descontrolado do projeto) e focar na entrega de valor central.

## 1. Funcionalidades INCLUÍDAS (In-Scope)

*   **Autenticação Simplificada:** 
    *   Login com e-mail e senha.
    *   Criação de usuários de forma manual ou simplificada (sem envio de e-mails de confirmação para validação da conta).
*   **Gestão de Perfis (RBAC):** Controle de acesso baseado em regras (`Customer`, `Barber`, `Admin`).
*   **Gestão Administrativa (Admin/Barber):**
    *   Cadastro e edição de serviços oferecidos.
    *   Cadastro de profissionais (barbeiros).
    *   Definição de jornada de trabalho (dias e horários).
    *   Registro de bloqueios pontuais e folgas (`time-offs`).
    *   Visualização da agenda diária/semanal.
*   **Agendamento (Customer):**
    *   Fluxo de agendamento online validando conflitos de horários.
    *   Visualização do histórico e status do próprio agendamento.
    *   Cancelamento de agendamento.
*   **Gestão do Atendimento:** Transição de status do serviço (`IN_PROGRESS`, `COMPLETED`).
*   **Avaliações Simples:** Permite dar uma nota (1 a 5 estrelas) e comentário opcional após a conclusão do serviço.

## 2. Funcionalidades EXCLUÍDAS (Out-of-Scope)

As funcionalidades abaixo estão **explicitamente fora** do escopo da primeira versão:

*   **E-mails Transacionais:** Confirmação de criação de conta e recuperação de senha via e-mail não serão implementados nesta fase.
*   **Integração de Pagamentos:** Gateways (Stripe, Mercado Pago), cobrança via app ou split de pagamentos. Pagamentos serão tratados fisicamente no local.
*   **Notificações Externas:** Disparo de SMS ou mensagens automatizadas via API do WhatsApp.
*   **Multi-Tenancy Na Interface:** O banco de dados poderá prever estrutura para várias barbearias (`tenantId`), mas a interface e o funcionamento do MVP atenderão apenas a uma barbearia central.
*   **Fidelidade:** Programas de pontos, cashback ou pacotes de assinatura.
*   **Dashboards Financeiros:** Relatórios de faturamento, comissão ou fechamento de caixa.
*   **Social Login:** Autenticação via Google, Apple ou Facebook (OAuth).

## 3. Premissas Técnicas

*   A aplicação será uma Single Page Application (SPA) construída com React.
*   O design será 100% responsivo (Mobile-first), garantindo usabilidade em smartphones sem a necessidade de criar aplicativos nativos para iOS ou Android neste primeiro momento.
