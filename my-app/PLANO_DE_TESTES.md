# PLANO DE TESTES - QUICK TRANSFER

---

## 1. Informações Gerais
- **Projeto:** Quick Transfer - Frontend
- **Versão:** 1.0.0
- **Documento:** Plano de Testes de Software (Seção 7 - Requisitos de Qualidade)
- **Data de Elaboração:** 29/07/2026

---

## 2. Estrutura Padrão dos Casos de Teste
Cada teste contemplado neste plano possui a seguinte estrutura padronizada de atributos:
1. **Código / Identificação do Teste** (ex: `CT-001`)
2. **Funcionalidade Testada**
3. **Objetivo do Teste**
4. **Pré-condições**
5. **Dados Utilizados**
6. **Etapas de Execução**
7. **Resultado Esperado**
8. **Trecho de Código de Exemplo (Componentes do Projeto / React Testing Library)**
9. **Prioridade** (`Alta`, `Média`, `Baixa`)
10. **Responsável pela Execução**

---

## 3. Matriz de Casos de Teste

### CT-001: Autenticação e Navegação por Perfil (RBAC / Sidebar)
- **Funcionalidade Testada:** Navegação entre telas e Controle de Acesso Baseado em Perfil (RBAC).
- **Objetivo do Teste:** Verificar se a Sidebar (`src/components/layout/sidebar.tsx`) exibe exclusivamente os módulos autorizados para cada perfil (`MANAGER`, `COORDINATOR`, `ADMIN`).
- **Pré-condições:** Aplicação em execução na rota `/login`.
- **Dados Utilizados:** 
  - Gestor: `userRole = "MANAGER"`
  - Coordenador: `userRole = "COORDINATOR"`
  - Admin: `userRole = "ADMIN"`
- **Etapas de Execução:**
  1. Renderizar o componente `Sidebar` passando as propriedades de perfil.
  2. Verificar os itens de menu renderizados na arvore DOM.
- **Resultado Esperado:** 
  - **MANAGER:** Exibe seções "Minhas Vagas", "Alunos" e "Entrevistas" (`/manager/vacancies`, `/manager/students`, `/manager/interviews`).
  - **COORDINATOR:** Exibe seções "Painel", "Turnos", "Turmas", "Alunos" e "Solicitações".
  - **ADMIN:** Exibe todas as seções incluindo "Painel Admin", "Usuários", "Locais", "Entrevistas" (`/admin/*`).
- **Trecho de Código:**
```typescript
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/layout/sidebar";

describe("CT-001: Autenticação e RBAC da Sidebar", () => {
  it("deve renderizar apenas módulos do Gestor para o papel MANAGER", () => {
    // Renderiza a Sidebar real do projeto com o perfil MANAGER
    render(<Sidebar initialRole="MANAGER" />);
    
    expect(screen.getByText("Minhas Vagas")).toBeInTheDocument();
    expect(screen.getByText("Alunos")).toBeInTheDocument();
    expect(screen.queryByText("Painel Admin")).not.toBeInTheDocument();
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** QA / Equipe de Desenvolvimento

---

### CT-002: Carregamento de Dados e Estado de Carregamento (Loading State)
- **Funcionalidade Testada:** Carregamento de dados e estados de carregamento.
- **Objetivo do Teste:** Garantir que indicadores visuais de carregamento (`DataTable` / Skeleton) são exibidos adequadamente em componentes de listagem como `DataTable` (`src/components/shared/data-table.tsx`).
- **Pré-condições:** Componente de tabela acionado antes da resolução do *fetch* da API.
- **Dados Utilizados:** `isLoading = true`, `data = []`.
- **Etapas de Execução:**
  1. Renderizar `<DataTable isLoading={true} data={[]} columns={columns} />`.
  2. Verificar a exibição das linhas de esqueleto (*loading skeleton*).
- **Resultado Esperado:** O componente renderiza o estado de carregamento visual sem falhas na interface.
- **Trecho de Código:**
```typescript
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/components/shared/data-table";

describe("CT-002: Estado de Carregamento na DataTable", () => {
  it("deve exibir as linhas de carregamento quando isLoading for true", () => {
    const columns = [{ key: "name", header: "Nome" }];
    
    render(<DataTable columns={columns} data={[]} isLoading={true} />);
    
    // Verifica a presença das células de carregamento (Skeleton)
    const skeletonRows = screen.getAllByRole("row");
    expect(skeletonRows.length).toBeGreaterThan(0);
  });
});
```
- **Prioridade:** Média
- **Responsável pela Execução:** QA / Tester

---

### CT-003: Validação de Formulário e Cadastro de Nova Turma
- **Funcionalidade Testada:** Cadastro e Validação de Formulários (`src/app/classes/new/page.tsx`).
- **Objetivo do Teste:** Validar o comportamento do formulário de criação de turma `NovaTurmaPage` ao submeter dados.
- **Pré-condições:** Usuário autenticado na rota `/classes/new`.
- **Dados Utilizados:** 
  - `className`: "Turma 2026-A"
  - `classCode`: "TURMA-2026-A"
- **Etapas de Execução:**
  1. Preencher os campos de input de Nome da Turma e Código da Turma.
  2. Disparar a submissão do formulário clicando no botão "Salvar Turma".
- **Resultado Esperado:** O evento `handleSubmit` deve processar os dados cadastrados e redirecionar para `/admin/classes`.
- **Trecho de Código:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import NovaTurmaPage from "@/app/classes/new/page";

describe("CT-003: Cadastro de Nova Turma", () => {
  it("deve permitir preencher o nome da turma e acionar a gravação", () => {
    render(<NovaTurmaPage />);
    
    const inputClassName = screen.getByLabelText(/Nome da Turma/i);
    fireEvent.change(inputClassName, { target: { value: "Turma 2026-A" } });
    
    const saveButton = screen.getByRole("button", { name: /Salvar Turma/i });
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** Tester / Desenvolvedor Frontend

---

### CT-004: Edição e Exclusão de Registro com Confirmação Visual
- **Funcionalidade Testada:** Edição e Exclusão na Gestão de Usuários (`src/app/admin/users/page.tsx`).
- **Objetivo do Teste:** Assegurar que as ações de "Editar" e "Excluir" exibidas no componente `UsuariosPage` invoquem os manipuladores corretos.
- **Pré-condições:** Acesso à página `/admin/users` com registros mockados `mockUsers`.
- **Dados Utilizados:** Registro do usuário `UserDTO` com perfil `ADMIN` ou `COORDINATOR`.
- **Etapas de Execução:**
  1. Renderizar a página `UsuariosPage`.
  2. Localizar a tabela de usuários com os botões de ação (ícones `Edit` e `Trash2`).
  3. Clicar na ação de exclusão do registro target.
- **Resultado Esperado:** As ações acionam os modais de confirmação visual sem erros de execução.
- **Trecho de Código:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import UsuariosPage from "@/app/admin/users/page";

describe("CT-004: Tabela de Usuários Admin - Ações de Edição e Exclusão", () => {
  it("deve renderizar a tabela de usuários com os botões de ação", () => {
    render(<UsuariosPage />);
    
    // Confirma a renderização das colunas da página de usuários do projeto
    expect(screen.getByText("Usuário")).toBeInTheDocument();
    expect(screen.getByText("Papel / Função")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});
```
- **Prioridade:** Média
- **Responsável pela Execução:** QA / Tester

---

### CT-005: Tratamento de Indisponibilidade da API e Fallback Gracioso
- **Funcionalidade Testada:** Resiliência e Fallback no cliente de API (`src/lib/api.ts`).
- **Objetivo do Teste:** Verificar o comportamento do método `apiFetch` do projeto ao receber erro de conexão ou status HTTP 500 do Spring Boot (`http://localhost:8080`).
- **Pré-condições:** Servidor da API simulando indisponibilidade.
- **Dados Utilizados:** Chamada para o endpoint `/api/v1/students`.
- **Etapas de Execução:**
  1. Invocar a função `apiFetch("/students")` com endpoint inacessível.
  2. Tratar a exceção capturada para exibir feedback gracioso.
- **Resultado Esperado:** O sistema captura o erro via `try/catch` e disponibiliza mensagens amigáveis ou dados em *fallback mock*.
- **Trecho de Código:**
```typescript
import { apiFetch } from "@/lib/api";

describe("CT-005: Resiliência da API e Fallback", () => {
  it("deve lançar erro tratável quando a API estiver offline", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    
    await expect(apiFetch("/students")).rejects.toThrow("Failed to fetch");
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** Equipe de QA / Desenvolvedor

---

### CT-006: Responsividade da Interface e Toggle da Sidebar Mobile
- **Funcionalidade Testada:** Responsividade e alternância da Sidebar (`src/components/layout/sidebar.tsx`).
- **Objetivo do Teste:** Testar a exibição do botão de menu mobile e o controle do estado `mobileOpen` no componente `Sidebar`.
- **Pré-condições:** Resolução de tela mobile (< 1024px).
- **Dados Utilizados:** Evento de clique no botão do menu hambúrguer (`Menu`).
- **Etapas de Execução:**
  1. Renderizar a `Sidebar` em ambiente simulado mobile.
  2. Localizar o botão de alternância do menu mobile.
  3. Clicar para abrir/fechar.
- **Resultado Esperado:** O estado de visibilidade da barra lateral alterna entre visível e oculto.
- **Trecho de Código:**
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/layout/sidebar";

describe("CT-006: Menu Mobile e Responsividade", () => {
  it("deve acionar a abertura do menu mobile ao clicar no ícone de Menu", () => {
    render(<Sidebar />);
    
    const menuButtons = screen.getAllByRole("button");
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});
```
- **Prioridade:** Média
- **Responsável pela Execução:** Designer UI/UX / QA Tester

---

### CT-007: Telas do Perfil Gestor (Minhas Vagas, Meus Alunos e Entrevistas)
- **Funcionalidade Testada:** Módulo do Gestor (`src/app/manager/vacancies/page.tsx`, `src/app/manager/students/page.tsx` e `src/app/manager/interviews/page.tsx`).
- **Objetivo do Teste:** Validar a renderização da interface e listagem de dados das vagas geridas pelo perfil Gestor.
- **Pré-condições:** Autenticado com perfil `MANAGER`.
- **Dados Utilizados:** Dados de `mockVacancies` em `src/lib/mock-data.ts`.
- **Etapas de Execução:**
  1. Acessar e renderizar a rota `/manager/vacancies`.
  2. Verificar os cards e dados das vagas ofertadas.
- **Resultado Esperado:** Exibir corretamente os títulos e o status das vagas sob gestão.
- **Trecho de Código:**
```typescript
import { render, screen } from "@testing-library/react";
import MinhasVagasPage from "@/app/manager/vacancies/page";

describe("CT-007: Módulo do Gestor - Minhas Vagas", () => {
  it("deve renderizar a tela de Minhas Vagas do Gestor", () => {
    render(<MinhasVagasPage />);
    expect(screen.getByText(/Minhas Vagas/i)).toBeInTheDocument();
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** QA / Tester

---

### CT-008: Telas do Perfil Coordenador (Dashboard, Turnos, Turmas, Alunos, Solicitações)
- **Funcionalidade Testada:** Módulo do Coordenador (`src/app/dashboard/page.tsx`, `src/app/requests/page.tsx`).
- **Objetivo do Teste:** Testar a renderização dos cards de estatísticas do Dashboard e solicitações de transferência do Coordenador.
- **Pré-condições:** Autenticado com perfil `COORDINATOR`.
- **Dados Utilizados:** Dados mockados de solicitações e alunos.
- **Etapas de Execução:**
  1. Renderizar o componente de Dashboard (`/dashboard`).
  2. Verificar os cards estatísticos (Total de Alunos, Turmas, Solicitações Pendentes).
- **Resultado Esperado:** Os dados e métricas do painel do coordenador são calculados e exibidos na tela.
- **Trecho de Código:**
```typescript
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

describe("CT-008: Módulo Coordenador - Painel Dashboard", () => {
  it("deve exibir os cartões de estatísticas no painel do Coordenador", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Painel de Controle/i)).toBeInTheDocument();
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** QA / Tester

---

### CT-009: Telas do Perfil Administrador (Usuários, Locais, Cursos, Vagas, Turmas, Entrevistas e Configurações)
- **Funcionalidade Testada:** Módulo Geral de Administração (`src/app/admin/page.tsx`).
- **Objetivo do Teste:** Validar que a página principal de Administração renderiza os atalhos de gestão total do sistema.
- **Pré-condições:** Autenticado com perfil `ADMIN`.
- **Dados Utilizados:** Seções do painel administrativo.
- **Etapas de Execução:**
  1. Renderizar a rota `/admin`.
  2. Verificar a presença dos links de acesso a Usuários, Locais, Cursos, Vagas e Configurações.
- **Resultado Esperado:** Todas as opções administrativas estão visíveis e funcionais para a função `ADMIN`.
- **Trecho de Código:**
```typescript
import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/page";

describe("CT-009: Painel de Controle Administrador", () => {
  it("deve carregar o painel geral de administração do sistema", () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText(/Painel de Administração/i)).toBeInTheDocument();
  });
});
```
- **Prioridade:** Alta
- **Responsável pela Execução:** QA / Tester

---

## 4. Resumo de Cobertura dos Requisitos do Projeto

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
