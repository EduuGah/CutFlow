# Arquitetura Frontend - CutFlow

Este documento define os padrões arquiteturais, a stack tecnológica e a organização estrutural da camada de visualização (Frontend) da aplicação CutFlow.

## 1. Stack Tecnológico Base

*   **Framework:** React 18+ inicializado via Vite.
*   **Linguagem:** TypeScript (Strict mode).
*   **Estilização:** Tailwind CSS v4 (Abordagem mobile-first utilizando utility classes).
*   **Roteamento:** React Router DOM (v6+).
*   **Ícones:** `lucide-react`.

## 2. Padrão de Integração (Backend-as-a-Service)

O sistema operará como uma Single Page Application (SPA) pura, sem uma camada de backend intermediária (Node.js/Express) própria. 

*   **SDK:** Utilizaremos o SDK oficial do Supabase (`@supabase/supabase-js`).
*   **Comunicação:** Todas as operações de autenticação (Auth) e manipulação de banco de dados (CRUD) serão feitas diretamente do cliente React para a API do Supabase.
*   **Segurança:** A segurança será garantida através das políticas de Row Level Security (RLS) configuradas diretamente no PostgreSQL do Supabase, garantindo que o cliente só acesse os dados permitidos para sua `role`.

## 3. Gerenciamento de Estado

*   **Estado Global / Sessão:** A sessão do usuário logado (Autenticação) e os dados de perfil (Role) serão gerenciados preferencialmente através da Context API nativa do React (`AuthContext`).
*   **Estado de UI (Local):** Formulários, aberturas de modais, e carregamentos (loading) serão gerenciados via `useState` e `useReducer` dentro do próprio escopo do componente.
*   **Server State (Buscando dados):** Abstrairemos as chamadas ao Supabase em Custom Hooks (`useAppointments`, `useServices`) para centralizar a lógica e evitar duplicação de chamadas.

## 4. Estrutura de Diretórios (`src/`)

A organização do código deve seguir estritamente o modelo de pastas abaixo para separar responsabilidades:

```text
src/
├── assets/          # Imagens estáticas, svgs, logos
├── components/      # Componentes de UI reutilizáveis (Dumb components)
│   ├── ui/          # Botões, Inputs, Cards (elementos base)
│   └── layout/      # Headers, Navbars, Sidebars
├── config/          # Configurações globais (ex: inicialização do cliente Supabase)
├── contexts/        # Provedores de estado global (ex: AuthProvider)
├── hooks/           # Custom hooks para isolar lógica complexa e fetch de dados
├── pages/           # Componentes roteáveis (representam uma tela completa)
│   ├── auth/        # Login, Cadastro
│   ├── admin/       # Telas de gestão do proprietário
│   ├── barber/      # Visualização da agenda do barbeiro
│   └── customer/    # Fluxo de agendamento e histórico
├── services/        # Lógicas puras de chamada ao banco de dados isoladas da UI
├── types/           # Definições de Interfaces e Types do TypeScript (Models)
└── utils/           # Funções auxiliares (formatação de data, dinheiro, validadores)
```

## 5. Padrões de Código e Boas Práticas

*   **Componentes Funcionais:** Utilizar exclusivamente componentes funcionais e hooks. Arrow functions devem ser o padrão para a definição do componente (`const Button = () => {}`).
*   **Tipagem Forte:** O uso de `any` no TypeScript é terminantemente proibido. Todas as props e respostas de API devem ter suas interfaces mapeadas na pasta `types/`.
*   **Separação de Responsabilidades (SoC):** Componentes da pasta `pages/` conectam-se aos contextos e hooks para orquestrar os dados, enquanto componentes da pasta `components/` focam apenas em renderização baseados em `props` (apresentacionais).
*   **Variáveis de Ambiente:** Variáveis expostas no lado do cliente devem seguir o padrão do Vite (`VITE_SUPABASE_URL`). Todas as chaves necessárias devem estar documentadas no arquivo `.env.example`.
