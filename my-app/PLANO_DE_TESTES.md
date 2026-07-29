# PLANO DE TESTES - QUICK TRANSFER

---

## 1. Informações Gerais
- **Projeto:** Quick Transfer - Frontend
- **Versão:** 1.0.0
- **Documento:** Plano de Testes de Software (Seção 7 - Requisitos de Qualidade)
- **Data de Elaboração:** 29/07/2026

---

## 2. Estrutura Padrão dos Casos de Teste
Cada teste contemplado neste plano possui a seguinte estrutura de atributos:
1. **Código / Identificação do Teste** (ex: `CT-001`)
2. **Funcionalidade Testada**
3. **Objetivo do Teste**
4. **Pré-condições**
5. **Dados Utilizados**
6. **Etapas de Execução**
7. **Resultado Esperado**
8. **Prioridade** (`Alta`, `Média`, `Baixa`)
9. **Responsável pela Execução**

---

## 3. Matriz de Casos de Teste

### CT-001: Autenticação e Navegação por Perfil (RBAC / Sidebar)
- **Funcionalidade Testada:** Navegação entre telas e Controle de Acesso Baseado em Perfil (RBAC).
- **Objetivo do Teste:** Verificar se a Sidebar e as rotas exibe exclusivamente os módulos autorizados para cada perfil (`GESTOR`, `COORDINATOR`, `ADMIN`).
- **Pré-condições:** Aplicação em execução na rota `/login`.
- **Dados Utilizados:** 
  - Gestor: `usuario = gestor_test`, `senha = 123`
  - Coordenador: `usuario = coordenador_test`, `senha = 123`
  - Admin: `usuario = admin_test`, `senha = 123`
- **Etapas de Execução:**
  1. Acessar a tela de login `/login`.
  2. Informar o usuário `gestor_test` e a senha `123`. Clicar em "Entrar".
  3. Verificar os itens visíveis na Sidebar.
  4. Realizar o logout clicando em "Sair".
  5. Repetir o processo para `coordenador_test` e `admin_test`.
- **Resultado Esperado:** 
  - **Gestor:** Exibe apenas a seção "Gestor" (Minhas Vagas, Alunos).
  - **Coordenador:** Exibe apenas a seção "Coordenador" (Painel, Turnos, Turmas, Alunos, Solicitações).
  - **Admin:** Exibe todas as seções ("Coordenador", "Gestor" e "Administração").
- **Prioridade:** Alta
- **Responsável pela Execução:** QA / Equipe de Desenvolvimento

---

### CT-002: Carregamento de Dados e Estado de Carregamento (Loading State)
- **Funcionalidade Testada:** Carregamento de dados e estados de carregamento.
- **Objetivo do Teste:** Garantir que indicadores visuais de carregamento (*spinners* / *skeletons*) são exibidos adequadamente durante a busca de dados na API.
- **Pré-condições:** Usuário autenticado com perfil `ADMIN` ou `COORDINATOR`.
- **Dados Utilizados:** Requisição de listagem de turmas ou alunos.
- **Etapas de Execução:**
  1. Acessar a rota `/students` ou `/admin/users`.
  2. Observar a renderização inicial da interface durante o *fetch* de dados.
- **Resultado Esperado:** A interface deve exibir estados visuais de carregamento (feedback de processamento) e preencher as tabelas sem travamentos ou *flicker*.
- **Prioridade:** Média
- **Responsável pela Execução:** QA / Tester

---

### CT-003: Validação de Formulario e Cadastro de Nova Turma
- **Funcionalidade Testada:** Cadastro e Validação de Formulários.
- **Objetivo do Teste:** Validar o comportamento do formulário de criação de turma ao enviar dados válidos e inválidos (campos obrigatórios vazios).
- **Pré-condições:** Usuário autenticado com perfil `COORDINATOR` ou `ADMIN`.
- **Dados Utilizados:** 
  - Inválidos: Nome da Turma = `""` (vazio), Vagas = `""`.
  - Válidos: Nome = `"Turma 2026-A"`, Curso = `"Engenharia"`, Vagas = `30`.
- **Etapas de Execução:**
  1. Navegar até a página `/classes/new`.
  2. Clicar no botão de envio sem preencher os campos.
  3. Verificar as mensagens de erro nos campos obrigatórios.
  4. Preencher os campos com dados válidos e submeter o formulário.
- **Resultado Esperado:** 
  - Com dados em branco: Mensagens de erro de validação são exibidas e o formulário impede o envio.
  - Com dados válidos: A turma é cadastrada e o sistema fornece feedback visual positivo.
- **Prioridade:** Alta
- **Responsável pela Execução:** Tester / Desenvolvedor Frontend

---

### CT-004: Edição e Exclusão de Registro
- **Funcionalidade Testada:** Edição e Exclusão.
- **Objetivo do Teste:** Assegurar que os fluxos de edição de parâmetros e exclusão de itens funcionem corretamente com modal de confirmação.
- **Pré-condições:** Registro existente no sistema (ex: Usuário em `/admin/users`).
- **Dados Utilizados:** ID do registro existente.
- **Etapas de Execução:**
  1. Navegar até a página `/admin/users`.
  2. Localizar um usuário na lista e clicar no botão "Editar".
  3. Alterar o nome do usuário e salvar.
  4. Em seguida, clicar no ícone de "Excluir" no mesmo registro.
  5. Confirmar a ação no modal de alerta.
- **Resultado Esperado:**
  - Após edição: A lista exibe o nome atualizado.
  - Após exclusão: O registro é removido da listagem com notificação visual.
- **Prioridade:** Média
- **Responsável pela Execução:** QA / Tester

---

### CT-005: Tratamento de Indisponibilidade da API e Fallback Gracioso
- **Funcionalidade Testada:** Estados de erro e comportamento diante de dados inválidos ou indisponibilidade da API.
- **Objetivo do Teste:** Avaliar a resiliência do sistema quando a API (backend) estiver offline ou retornar erro 500/Failed to Fetch.
- **Pré-condições:** Backend offline ou endpoint inacessível (`http://localhost:8080`).
- **Dados Utilizados:** Credenciais de teste em ambiente sem conexão backend.
- **Etapas de Execução:**
  1. Interromper o servidor backend Spring Boot.
  2. Acessar `/login` e tentar realizar login com credenciais de teste (`coordenador_test`).
  3. Tentar acessar rotas de dados do sistema.
- **Resultado Esperado:** O sistema não deve quebrar com *white screen*. Deve acionar o fallback gracioso de autenticação/dados mockados ou exibir alerta amigável de erro informando a indisponibilidade de rede.
- **Prioridade:** Alta
- **Responsável pela Execução:** Equipe de QA / Desenvolvedor

---

### CT-006: Responsividade da Interface e Toggle da Sidebar Mobile
- **Funcionalidade Testada:** Responsividade e Feedback Visual.
- **Objetivo do Teste:** Verificar se a Sidebar e os componentes da página se adaptam corretamente em telas de dispositivos móveis (< 1024px).
- **Pré-condições:** Aplicação aberta no navegador em viewport mobile (ex: 375px x 667px).
- **Dados Utilizados:** Resoluções de tela: 375px (Mobile), 768px (Tablet), 1440px (Desktop).
- **Etapas de Execução:**
  1. Redimensionar a janela do navegador para 375px de largura.
  2. Observar se a Sidebar recolhe automaticamente e o botão hambúrguer é exibido.
  3. Clicar no botão hambúrguer para abrir a Sidebar.
  4. Clicar em um item de menu ou no overlay para fechar a Sidebar.
- **Resultado Esperado:** A Sidebar transiciona suavemente, a tela ajusta os espaçamentos sem quebras visuais e o menu mobile abre/fecha adequadamente.
- **Prioridade:** Média
- **Responsável pela Execução:** Designer UI/UX / QA Tester

---

## 4. Resumo de Cobertura dos Requisitos do Projeto

| Categoria Requerida | Caso de Teste Associado |
| :--- | :--- |
| **Navegação entre telas** | CT-001, CT-006 |
| **Carregamento de dados** | CT-002 |
| **Estados de carregamento** | CT-002 |
| **Estados de erro** | CT-005 |
| **Validação de formulários** | CT-003 |
| **Cadastro** | CT-003 |
| **Edição** | CT-004 |
| **Exclusão** | CT-004 |
| **Responsividade** | CT-006 |
| **Feedback visual** | CT-002, CT-003, CT-004 |
| **Dados inválidos / Indisponibilidade API** | CT-003, CT-005 |
