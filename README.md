# Quick Transfer - Frontend

## 👥 Integrantes da Equipe
- **Eduardo Lino**
- **Guilherme Dogde**
- **Bruno Athanazio**
- **Vinicius Derreti**
- **Matheus de Borba da Silva**

---

## 📌 Descrição do Problema
Em processos de transferência e alocação de estudantes/aprendizes em vagas internas ou programas de formação na empresa, a gestão manual por planilhas ou sistemas descentralizados acarreta falhas de comunicação, morosidade na triagem de candidatos, dificuldade no agendamento e acompanhamento de entrevistas, além da falta de rastreabilidade do progresso de cada participante.

---

## 🎯 Objetivo da Solução
O **Quick Transfer** é uma plataforma centralizada projetada para automatizar e otimizar o fluxo de transferência, triagem, alocação e gerenciamento de estudantes e turmas. Esta interface web consome a API backend do Quick Transfer e provê uma experiência intuitiva e responsiva para os perfis de usuário **Administrador**, **Gestor** e **Coordenador**, com controle de acesso baseado em papéis (RBAC) aplicado tanto no middleware de roteamento quanto na renderização condicional de componentes.

---

## 🛠️ Tecnologias Utilizadas
- **Linguagem & Framework Core:** TypeScript 5, Next.js 16 (App Router, React Compiler)
- **Biblioteca de Interface:** React 19
- **Estilização:** Tailwind CSS 4, `tw-animate-css`, `tailwind-merge`, `class-variance-authority (CVA)`
- **Componentes de UI:** `shadcn/ui` 4, `@base-ui/react` 1.6, Lucide React (ícones)
- **Tipografia:** Manrope (Google Fonts via `next/font`)
- **Cliente HTTP:** Fetch API nativa com utilitário centralizado `apiFetch` (proxy interno `/backend`)
- **Autenticação:** JWT via cookies `HttpOnly` + cookie de perfil (`userRole`); proteção de rotas via Next.js Middleware
- **Gerenciamento de Dependências:** npm
- **Linting:** ESLint 9 com configuração `eslint-config-next`

---

## 📦 Instruções para Instalação

### Pré-requisitos
- **Node.js 20+** instalado
- **npm 10+** (incluso com o Node.js)
- Instância do **Quick Transfer Backend** em execução (ou configuração de mock habilitada)

### Passo a Passo de Instalação
1. **Clonar o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd quick-transfer-frontend/my-app
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz de `my-app/` com base no arquivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Edite o arquivo `.env.local` conforme a seção de [Variáveis de Ambiente Necessárias](#-variáveis-de-ambiente-necessárias).

---

## 🚀 Instruções para Execução

### Opção A: Ambiente de Desenvolvimento (Recomendado)
Inicia o servidor de desenvolvimento com hot-reload:
```bash
npm run dev
```
A aplicação estará acessível em `http://localhost:3000`.

### Opção B: Build de Produção
Gera o bundle otimizado e inicia o servidor de produção:
```bash
npm run build
npm run start
```

### Integração com o Backend
Por padrão, o frontend utiliza um proxy interno do Next.js na rota `/backend` para redirecionar as chamadas à API, evitando problemas de CORS e não expondo o endereço do backend. Certifique-se de que o backend esteja em execução e acessível (por padrão, em `http://localhost:8080/api`).

---

## 🔑 Variáveis de Ambiente Necessárias
As variáveis de ambiente devem ser configuradas no arquivo `.env.local` localizado na raiz do diretório `my-app/`:

| Variável | Descrição | Exemplo / Valor Padrão |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base da API do backend. Se não definida, o proxy interno `/backend` é utilizado | (não definida por padrão) |
| `NEXT_PUBLIC_ENABLE_MOCK_AUTH` | Habilita autenticação mock para demonstrações sem API ativa. **Nunca habilite em produção** | `false` |
| `NEXT_PUBLIC_MOCK_AUTH_USERNAME` | Usuário fictício utilizado no modo mock | `admin.mock` |
| `NEXT_PUBLIC_MOCK_AUTH_PASSWORD` | Senha fictícia utilizada no modo mock | `Mock@123456789!` |

> **Atenção:** O modo mock (`NEXT_PUBLIC_ENABLE_MOCK_AUTH=true`) deve ser utilizado apenas temporariamente para demonstrações. Em produção, mantenha `false` e realize um novo deploy para remoção das credenciais mock do bundle.

---

## 🌐 Rotas e Módulos da Aplicação

A aplicação utiliza o **App Router** do Next.js e organiza as rotas por perfil de acesso:

| Perfil | Rota Inicial | Módulos Disponíveis |
| :--- | :--- | :--- |
| `ADMIN` | `/admin` | Painel Admin e Usuários |
| `COORDINATOR` | `/dashboard` | Painel, Turmas, Alunos, Cursos e Direcionamento |
| `MANAGER` | `/manager/vacancies` | Minhas Vagas, Alunos, Entrevistas e Locais |

O controle de acesso é aplicado em dois níveis:
1. **Next.js Middleware (`src/middleware.ts`):** Intercepta todas as requisições de navegação, valida a presença e validade do token JWT e redireciona o usuário para a rota inicial de seu perfil caso tente acessar uma rota não permitida.
2. **Sidebar com RBAC (`src/components/layout/sidebar.tsx`):** Exibe apenas os itens de menu autorizados para o perfil autenticado.

---

## ⚙️ Principais Funcionalidades

- **Autenticação e Controle de Acesso (RBAC):**
  - Login seguro com autenticação via JWT em cookie `HttpOnly`, sem armazenamento de token no `localStorage`.
  - Middleware de proteção de rotas que valida o formato e a expiração do JWT localmente, com a validação de assinatura delegada ao backend.
  - Navegação condicionalmente renderizada por perfil (`ADMIN`, `MANAGER`, `COORDINATOR`).

- **Módulo do Administrador (`/admin`):**
  - Gestão completa de Usuários (CRUD com modais de confirmação).

- **Módulo do Coordenador (`/dashboard`):**
  - Painel de controle com dados reais de alunos, turmas e vagas.
  - Gestão de Turmas, Alunos e Cursos.
  - Cadastro de aluno como entidade acadêmica, sem conta de acesso.

- **Módulo do Gestor (`/manager`):**
  - Visualização e gerenciamento das próprias Vagas.
  - Acompanhamento dos Alunos vinculados.
  - Agendamento e acompanhamento de Entrevistas.
  - Gestão dos locais utilizados pelas vagas.

- **Componentes Compartilhados:**
  - `DataTable`: Tabela genérica e reutilizável com suporte a estado de carregamento (skeleton), paginação e ações por linha.
  - `StatCard`: Cards de estatísticas com ícones e indicadores de variação.
  - `SearchInput`: Campo de busca padronizado.
  - `EmptyState`: Feedback visual para listagens sem dados.
  - `FAB` (Floating Action Button): Ação primária flutuante.
  - `TimelineItem`: Exibição de eventos em linha do tempo.

- **Proxy de API Integrado (`/backend/[...path]`):**
  - Rota de API do Next.js que atua como proxy reverso para o backend Spring Boot, ocultando o endereço e evitando CORS em ambiente de desenvolvimento.

- **Mock de Autenticação para Demonstração:**
  - Mecanismo de autenticação simulada controlado por variáveis de ambiente para validação de fluxos de UI sem backend ativo.

---

## 📁 Estrutura Resumida de Pastas

```text
quick-transfer-frontend/
├── .github/                        # Workflows e pipelines CI/CD
└── my-app/                         # Raiz da aplicação Next.js
    ├── design-system/              # Tokens e guia de design do projeto
    ├── public/                     # Ativos públicos (imagens, ícones, logos)
    ├── src/
    │   ├── app/                    # App Router do Next.js (rotas e páginas)
    │   │   ├── admin/              # Módulo Administrador (users, vacancies, courses, etc.)
    │   │   ├── backend/[...path]/  # Proxy reverso para a API Spring Boot
    │   │   ├── classes/            # Gestão de Turmas (Coordenador)
    │   │   ├── coordinator/        # Telas exclusivas do Coordenador
    │   │   ├── courses/            # Gestão de Cursos
    │   │   ├── dashboard/          # Painel de controle do Coordenador
    │   │   ├── login/              # Tela de autenticação
    │   │   ├── manager/            # Módulo Gestor (vacancies, students, interviews)
    │   │   ├── students/           # Gestão de Alunos
    │   │   ├── globals.css         # Estilos globais e variáveis CSS (design tokens)
    │   │   └── layout.tsx          # Layout raiz (fonte Manrope, metadados globais)
    │   ├── components/
    │   │   ├── features/           # Componentes específicos de funcionalidade (admin, manager, etc.)
    │   │   ├── layout/             # Estrutura de layout (Sidebar, Topbar, AppShell, PageHeader)
    │   │   ├── shared/             # Componentes genéricos e reutilizáveis (DataTable, StatCard, etc.)
    │   │   └── ui/                 # Componentes de UI base (shadcn/ui + @base-ui/react)
    │   ├── lib/
    │   │   ├── api.ts              # Cliente HTTP centralizado (apiFetch, ApiError)
    │   │   ├── auth.ts             # Lógica de autenticação JWT e RBAC no lado do cliente
    │   │   ├── manager-api.ts      # Funções de API específicas do módulo Gestor
    │   │   ├── mock-auth.ts        # Mecanismo de autenticação mock para demonstrações
    │   │   ├── mock-data.ts        # Dados fictícios para desenvolvimento e testes
    │   │   └── utils.ts            # Utilitários gerais (cn, classNames)
    │   ├── middleware.ts            # Middleware de proteção de rotas e RBAC (Next.js Edge)
    │   └── types/                  # Definições de tipos TypeScript globais
    ├── .env.example                # Modelo de variáveis de ambiente
    ├── components.json             # Configuração do shadcn/ui
    ├── next.config.ts              # Configuração do Next.js (React Compiler habilitado)
    ├── package.json                # Dependências e scripts npm
    ├── PLANO_DE_TESTES.md          # Plano de testes e casos de teste documentados
    └── tsconfig.json               # Configuração do TypeScript
```

---

## 🛡️ Boas Práticas de Segurança Adotadas

1. **Autenticação via Cookie `HttpOnly`:** O token JWT nunca é acessado pelo JavaScript do cliente; o armazenamento é delegado ao cookie gerenciado pelo backend, protegendo contra ataques XSS.
2. **Proteção de Rotas no Edge (Middleware):** O Next.js Middleware intercepta requisições antes da renderização, validando localmente o formato e a expiração do JWT e bloqueando o acesso a rotas não autorizadas para o perfil do usuário.
3. **RBAC em Múltiplas Camadas:** O controle de acesso é aplicado no middleware de borda e na renderização condicional da Sidebar, garantindo que itens de navegação não autorizados nunca sejam exibidos na interface.
4. **Proxy Reverso Integrado:** As chamadas à API são feitas através do proxy `/backend` do Next.js, ocultando o endereço do servidor backend do cliente e evitando a exposição de infraestrutura.
5. **Mensagens de Erro Seguras:** O cliente HTTP (`apiFetch`) mapeia códigos HTTP de erro para mensagens amigáveis e estáticas, evitando a exibição de stacktraces ou detalhes internos da infraestrutura ao usuário final.
6. **Modo Mock Controlado por Variável de Ambiente:** A autenticação simulada para demonstrações só é habilitada explicitamente via `NEXT_PUBLIC_ENABLE_MOCK_AUTH=true`, com instrução de novo deploy para remoção das credenciais do bundle em produção.

---

## 🧪 Procedimento Utilizado para Realização dos Testes

O projeto documenta um plano de testes abrangente (`PLANO_DE_TESTES.md`) baseado na **React Testing Library** em conjunto com **Jest**, cobrindo os fluxos críticos da interface.

### Tipos de Testes Planejados

- **Testes de Controle de Acesso (RBAC):** Verificação da renderização condicional da Sidebar para cada perfil (`ADMIN`, `MANAGER`, `COORDINATOR`) — `CT-001`.
- **Testes de Estado de Carregamento (Loading State):** Validação da exibição de indicadores visuais de carregamento (Skeleton) no componente `DataTable` — `CT-002`.
- **Testes de Validação de Formulários:** Cobertura dos fluxos de cadastro e submissão de formulários (ex.: criação de turma) — `CT-003`.
- **Testes de Edição e Exclusão:** Validação das ações de edição e exclusão com modais de confirmação na gestão de usuários — `CT-004`.
- **Testes de Resiliência e Fallback da API:** Verificação do comportamento do `apiFetch` em cenários de indisponibilidade da API e erros HTTP — `CT-005`.
- **Testes de Responsividade:** Validação do toggle da Sidebar em resoluções mobile — `CT-006`.
- **Testes de Módulos por Perfil:** Cobertura das telas do Gestor (`CT-007`), Coordenador (`CT-008`) e Administrador (`CT-009`).

### Matriz de Cobertura de Requisitos

| Categoria Requerida | Casos de Teste Associados |
| :--- | :--- |
| **Navegação entre telas** | CT-001, CT-006, CT-007, CT-008, CT-009 |
| **Carregamento de dados** | CT-002, CT-007, CT-008, CT-009 |
| **Estados de carregamento** | CT-002 |
| **Estados de erro** | CT-005 |
| **Validação de formulários** | CT-003, CT-009 |
| **Cadastro** | CT-003, CT-008, CT-009 |
| **Edição** | CT-004, CT-008, CT-009 |
| **Exclusão** | CT-004, CT-009 |
| **Responsividade** | CT-006 |
| **Feedback visual** | CT-002, CT-003, CT-004, CT-007, CT-008, CT-009 |
| **Dados inválidos / Indisponibilidade API** | CT-003, CT-005 |

> Para a especificação completa de cada caso de teste (pré-condições, dados, etapas de execução e trechos de código), consulte o arquivo [`PLANO_DE_TESTES.md`](my-app/PLANO_DE_TESTES.md).

---

## ⚠️ Limitações Conhecidas

1. **Dependência de Backend Ativo:** A maioria das funcionalidades depende da API Quick Transfer Backend em execução. Sem o backend, apenas fluxos cobertos pelo modo mock de autenticação (`NEXT_PUBLIC_ENABLE_MOCK_AUTH`) funcionarão corretamente.
2. **Ausência de Gerenciamento de Estado Global:** A aplicação atual não utiliza uma biblioteca de gerenciamento de estado global (ex.: Redux, Zustand ou React Query). O estado é gerenciado localmente por componente e via `useState`/`useEffect`, o que pode demandar refatoração em funcionalidades de maior complexidade.
3. **Validação de Assinatura JWT no Cliente:** O middleware frontend valida apenas o formato e a expiração do JWT localmente, sem verificar a assinatura criptográfica. A validação completa da assinatura é de responsabilidade do backend em cada requisição autenticada.
4. **Dados Mock em Código:** Os dados fictícios para desenvolvimento e testes estão hardcoded em `src/lib/mock-data.ts`, sem integração com um servidor mock dedicado (ex.: MSW - Mock Service Worker), o que limita a fidelidade dos testes de integração.
5. **Associação Aluno–Vaga:** O contrato OpenAPI atual não expõe um endpoint ou DTO que persista diretamente `studentId` e `vacancyId`. O frontend bloqueia essa gravação para não transformar o status global do aluno em um vínculo incorreto com todas as vagas.
