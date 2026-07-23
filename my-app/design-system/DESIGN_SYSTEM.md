# Quick Transfer — Design System Audit

> Documento gerado a partir da análise das 4 imagens de protótipo.
> Todos os valores hex são aproximações extraídas visualmente dos protótipos.

---

## 1. Paleta de Cores

### 1.1 Primary (Azul Marinho / Navy)

Cor dominante usada na sidebar, background do login, botões primários e cabeçalhos.

| Token            | Hex       | Uso principal                                    |
|------------------|-----------|--------------------------------------------------|
| `primary-50`     | `#EFF6FF` | Background sutil de inputs em foco               |
| `primary-100`    | `#DBEAFE` | Hover leve, background de seleção                |
| `primary-200`    | `#B3D4F7` | Bordas de botões primários, divisores claros      |
| `primary-300`    | `#80AED2` | Borda do botão de login, ícones inativos          |
| `primary-400`    | `#4A8DC4` | Links hover, ícones secundários                   |
| `primary-500`    | `#1E6DB5` | Links ativos, ícones de ação                      |
| `primary-600`    | `#005DAA` | Botões primários, background do login, sidebar ativa |
| `primary-700`    | `#004C92` | Hover de botões primários                         |
| `primary-800`    | `#0A2E5C` | Sidebar background (tom mais escuro)              |
| `primary-900`    | `#0D1B3E` | Sidebar background principal (mais escuro ainda)  |
| `primary-950`    | `#091428` | Background mais profundo da sidebar               |

### 1.2 Secondary (Azul-Acinzentado / Slate Blue)

Usado em elementos de suporte, backgrounds secundários e textos de ênfase moderada.

| Token              | Hex       | Uso principal                                |
|--------------------|-----------|----------------------------------------------|
| `secondary-50`     | `#F0F4F8` | Background de áreas de conteúdo              |
| `secondary-100`    | `#E2E8F0` | Bordas de tabelas, separadores               |
| `secondary-200`    | `#CBD5E1` | Bordas de inputs inativos                    |
| `secondary-300`    | `#94A3B8` | Texto placeholder, ícones desabilitados      |
| `secondary-400`    | `#64748B` | Texto secundário, labels de forms            |
| `secondary-500`    | `#475569` | Texto de corpo secundário                    |
| `secondary-600`    | `#334155` | Texto de cabeçalhos de tabela                |
| `secondary-700`    | `#1E293B` | Texto de ênfase                              |
| `secondary-800`    | `#1A2332` | Sidebar sections                             |
| `secondary-900`    | `#0F172A` | Texto principal de alta ênfase               |

### 1.3 Neutros (Escala de Cinzas)

Aplicados em backgrounds, bordas, textos de corpo e elementos de UI neutra.

| Token            | Hex       | Uso principal                                  |
|------------------|-----------|-------------------------------------------------|
| `neutral-50`     | `#FAFBFC` | Background da página principal                  |
| `neutral-100`    | `#F5F6F8` | Background de cards, campos de formulário        |
| `neutral-200`    | `#E8EAED` | Bordas sutis, separadores de linhas de tabela    |
| `neutral-300`    | `#D1D5DB` | Bordas de inputs, divisores                      |
| `neutral-400`    | `#9CA3AF` | Texto placeholder, ícones inativos               |
| `neutral-500`    | `#6B7280` | Texto de apoio, labels                           |
| `neutral-600`    | `#4B5563` | Texto de corpo                                   |
| `neutral-700`    | `#374151` | Texto de ênfase secundária                       |
| `neutral-800`    | `#1F2937` | Títulos e headings                               |
| `neutral-900`    | `#111827` | Texto de máxima ênfase                           |

### 1.4 Accent / Gold-Beige (Escala Dourada)

Aparece na folha de tokens como uma escala separada (tons beige/dourados). Uso provável: destaques especiais, alertas informativos ou variante decorativa.

| Token          | Hex       | Uso principal                              |
|----------------|-----------|--------------------------------------------|
| `accent-50`    | `#FFF8E1` | Background de alertas/informações leves     |
| `accent-100`   | `#FFECB3` | Background de tags/badges informativos      |
| `accent-200`   | `#FFE082` | Bordas de destaque                          |
| `accent-300`   | `#FFD54F` | Ícones de aviso suave                       |
| `accent-400`   | `#FFCA28` | Badges de alerta                            |
| `accent-500`   | `#FFC107` | Cor de destaque primária dourada            |
| `accent-600`   | `#FFB300` | Texto/ícone de aviso                        |
| `accent-700`   | `#FF8F00` | Hover de elementos dourados                 |

---

## 2. Cores Semânticas de Status

Observadas nos badges das telas de admin (entrevistas, vagas, cursos, usuários):

| Token             | Hex (bg)  | Hex (text) | Significado visual nos protótipos                     | Exemplos de uso                              |
|-------------------|-----------|------------|-------------------------------------------------------|----------------------------------------------|
| `status-success`  | `#DCFCE7` | `#166534`  | Aprovado, Aberto, Ativo, Concluído                    | Badge "Aprovado" em entrevistas, "Aberto" em vagas |
| `status-danger`   | `#FEE2E2` | `#991B1B`  | Urgente, Atrasado, Fechado, Reprovado, Inativo        | Badge "Reprovado", "Fechado", "Urgente"      |
| `status-warning`  | `#FEF3C7` | `#92400E`  | Pendente, Atenção, Em revisão                         | Badge de aviso / pendência                    |
| `status-info`     | `#DBEAFE` | `#1E40AF`  | Em andamento, Informativo, Em processo                | Badge "Em andamento", "Agendada"              |
| `status-neutral`  | `#F3F4F6` | `#4B5563`  | Inativo, Rascunho, Sem status definido                | Badge "Inativo", estados desabilitados        |

> **Nota de acessibilidade:** Todos os badges devem incluir texto descritivo (e idealmente um ícone),
> nunca dependendo apenas da cor para transmitir significado (WCAG 1.4.1).

---

## 3. Tipografia

**Fonte principal:** Manrope (já configurada no `layout.tsx` existente)

### Escala de Tamanhos e Pesos

Baseada nos exemplos "Aa" da folha de tokens e nos textos das telas:

| Token / Uso               | Tamanho (px) | Tamanho (rem) | Peso     | Line Height | Exemplo no protótipo                          |
|---------------------------|-------------|---------------|----------|-------------|-----------------------------------------------|
| `display-lg`              | 44px        | 2.75rem       | 300      | 1.1         | "Quick Transfer" no login                     |
| `heading-xl`              | 32px        | 2rem          | 600      | 1.25        | "Login" no card                               |
| `heading-lg`              | 24px        | 1.5rem        | 600      | 1.33        | Títulos de página ("Painel do Coordenador")   |
| `heading-md`              | 20px        | 1.25rem       | 600      | 1.4         | Títulos de seção, labels de form              |
| `heading-sm`              | 16px        | 1rem          | 600      | 1.5         | Nomes em cards, cabeçalhos de tabela          |
| `body-lg`                 | 16px        | 1rem          | 400      | 1.5         | Corpo principal, botões                       |
| `body-md`                 | 14px        | 0.875rem      | 400      | 1.5         | Texto de tabela, campos de formulário         |
| `body-sm`                 | 12px        | 0.75rem       | 400      | 1.5         | Captions, labels auxiliares, pagination info  |
| `body-xs`                 | 10px        | 0.625rem      | 400      | 1.4         | Badges de status (texto pequeno)              |
| `number-stat`             | 48px        | 3rem          | 700      | 1.0         | Números grandes nos cards de estatística      |

---

## 4. Espaçamento e Raio de Borda

### 4.1 Escala de Espaçamento

Observada nos protótipos (padding de cards, gaps entre elementos, margens):

| Token   | Valor  | Uso principal                                         |
|---------|--------|-------------------------------------------------------|
| `sp-1`  | 4px    | Gap mínimo entre ícone e texto inline                  |
| `sp-2`  | 8px    | Padding interno de badges, gap entre itens de lista    |
| `sp-3`  | 12px   | Padding de inputs, gap pequeno entre elementos         |
| `sp-4`  | 16px   | Padding horizontal de botões, gap entre itens de form  |
| `sp-5`  | 20px   | Padding interno de cards, espaço entre seções          |
| `sp-6`  | 24px   | Margem entre cards, gap de grid                        |
| `sp-8`  | 32px   | Padding do container da página, margens amplas         |
| `sp-10` | 40px   | Margem entre seções maiores                            |
| `sp-12` | 48px   | Margem de topo de páginas                              |
| `sp-16` | 64px   | Espaçamento vertical grande entre blocos               |

### 4.2 Raio de Borda (Border Radius)

| Token          | Valor  | Uso                                           |
|----------------|--------|------------------------------------------------|
| `radius-sm`    | 4px    | Badges de status, tags pequenas                |
| `radius-md`    | 8px    | Inputs, botões, cards de lista                 |
| `radius-lg`    | 12px   | Cards de conteúdo, modais                      |
| `radius-xl`    | 16px   | Cards de login, containers destacados          |
| `radius-2xl`   | 20px   | Card principal do login                        |
| `radius-full`  | 9999px | Avatares, botões arredondados (FAB)            |

---

## 5. Sombras

| Token          | Valor CSS                                       | Uso                                |
|----------------|--------------------------------------------------|------------------------------------|
| `shadow-sm`    | `0 1px 2px rgba(0,0,0,0.05)`                    | Cards sutis, inputs                |
| `shadow-md`    | `0 4px 6px -1px rgba(0,0,0,0.1)`                | Cards de conteúdo, dropdowns       |
| `shadow-lg`    | `0 10px 15px -3px rgba(0,0,0,0.1)`              | Modais, card de login              |
| `shadow-xl`    | `0 20px 25px -5px rgba(0,0,0,0.1)`              | Dialogs, sheets                    |

---

## 6. Inventário de Componentes Reutilizáveis

### 6.1 Sidebar de Navegação + Topbar/Header

- **Sidebar:** Fixa à esquerda, background `primary-900` (navy escuro). Contém:
  - Logo "Quick Transfer" no topo (ícone + texto branco)
  - Links de navegação com ícones (Lucide), texto branco/acinzentado
  - Item ativo com destaque (fundo levemente mais claro ou borda lateral)
  - Seções agrupadas (ex: "Coordenador" / "Admin")
  - Rodapé com ícone de logout e nome do usuário
  - Largura: ~240px (desktop), colapsável em mobile
- **Topbar:** Barra horizontal acima do conteúdo, fundo branco. Contém:
  - Breadcrumb de navegação (ex: "Quick Transfer > Turnos > ...")
  - Ações à direita: ícone de notificação (bell), avatar do usuário
  - Altura: ~60px

### 6.2 Botão (Button)

Variantes observadas nos protótipos:
- **Primary:** Background `primary-600`, texto branco, borda `primary-300` (como no login)
- **Secondary/Outline:** Background transparente, borda cinza, texto escuro
- **Destructive/Danger:** Background vermelho (`status-danger`), texto branco — visto em ações de exclusão
- **Ghost:** Sem background/borda, texto primário — links internos
- **Icon-only:** Botão quadrado com ícone (ex: editar, excluir nas tabelas)
- Tamanhos: `sm` (badges de ação), `md` (padrão), `lg` (botão do login)

### 6.3 Input de Texto e Input de Busca

- **Input padrão:** Border `neutral-300`, background `neutral-50`/`#F8FBFF`, border-radius `radius-md`, padding `sp-3`. Focus: border `primary-600`, background `primary-50`
- **Input de busca:** Mesmo estilo + ícone de lupa (Search) à esquerda
- Todos com label acima, placeholder em `neutral-400`

### 6.4 Tabela com Paginação

Presente em: Usuários, Locais, Entrevistas, Turmas, Vagas, Cursos.
- **Cabeçalho:** Background levemente cinza (`neutral-50`), texto `secondary-600` em peso 600
- **Linhas:** Alternância sutil de cor ou borda inferior `neutral-200`
- **Células:** Podem conter text, badge, avatar, botões de ação (ícones de editar/excluir)
- **Paginação:** Abaixo da tabela — botões de página (prev/next + números), indicador "Mostrando X de Y"
- **Ordenação:** Ícones de seta nos cabeçalhos para ordenação ascendente/descendente

### 6.5 Badge/Pill de Status

Elemento inline arredondado com texto + fundo colorido:
- **success:** fundo verde claro, texto verde escuro (ex: "Aprovado", "Aberto", "Ativo")
- **danger:** fundo vermelho claro, texto vermelho escuro (ex: "Reprovado", "Fechado", "Urgente")
- **warning:** fundo amarelo claro, texto marrom/âmbar (ex: "Pendente")
- **info:** fundo azul claro, texto azul escuro (ex: "Em andamento", "Agendada")
- **neutral:** fundo cinza claro, texto cinza escuro (ex: "Inativo")
- Border-radius: `radius-sm` a `radius-full` (pill)
- Font-size: `body-sm` ou `body-xs`
- Padding: `sp-1` vertical, `sp-2` horizontal

### 6.6 Avatar

- Circular (`radius-full`), tamanhos: `sm` (32px), `md` (40px), `lg` (64px), `xl` (96px — perfil do aluno)
- Com imagem ou fallback de iniciais (fundo `primary-600`, texto branco)
- Visto em: tabela de usuários, card de aluno, topbar

### 6.7 Card de Estatística (Stat Card)

Usado no Dashboard do Coordenador:
- Número grande (`number-stat`), label descritivo abaixo
- Ícone no canto (estilo outline, cor `primary-500`)
- Background branco, borda `neutral-200`, sombra `shadow-sm`
- Layout horizontal: texto à esquerda, ícone à direita

### 6.8 Card de Item de Lista

Usado para listar alunos, turmas, entrevistas, vagas:
- Layout: avatar/ícone + informações textuais (nome, cargo, data) + badges de status + ações
- Borda inferior ou separador entre itens
- Hover com background `neutral-50`

### 6.9 Barra de Progresso (Progress Bar)

Visível na tela de turnos (ocupação de turno):
- Track cinza (`neutral-200`), fill azul (`primary-600`)
- Texto de porcentagem ao lado
- Altura: ~8px, border-radius: `radius-full`

### 6.10 Painel Lateral (Drawer/Sheet)

Visível na tela de ajuste manual de turno:
- Desliza da direita, fundo branco, sombra à esquerda
- Contém: título, conteúdo de formulário/lista, botões de ação no rodapé
- Overlay escuro semi-transparente no fundo
- Largura: ~400px

### 6.11 Item de Timeline/Notificação

Visível na tela de Detalhes do Aluno:
- Linha vertical conectando os itens (timeline indicator)
- Cada item: badge de status + descrição + data/hora
- Cores dos badges conforme tabela semântica (seção 2)

### 6.12 Modal de Confirmação / Formulário

- **Confirmação:** Background overlay, card central com título, mensagem, botões "Cancelar" / "Confirmar"
- **Formulário (ex: "Nova Turma"):** Pode ser modal ou página inteira — nos protótipos aparece como página com formulário (título + inputs + seleção de alunos + botões de ação)

### 6.13 Botão de Ação Flutuante (FAB)

Visível em telas de admin (lista de cursos, lista de vagas):
- Botão circular no canto inferior direito
- Ícone "+" branco, background `primary-600`
- Sombra `shadow-lg`
- Tamanho: ~56px

### 6.14 Componentes Adicionais Identificados

- **Breadcrumb:** Navegação hierárquica na topbar (ex: "Quick Transfer > Turnos > Detalhes")
- **Tabs:** Abas de navegação dentro de páginas (ex: filtros de status em cursos: "Todos", "Concluídos", "Em andamento")
- **Select/Dropdown:** Campo de seleção em formulários (ex: selecionar turno, selecionar período)
- **Checkbox:** Para seleção múltipla de alunos (em "Nova Turma")
- **Empty State:** Ícone + mensagem quando não há dados (ex: "Nenhum turno encontrado")
- **Tooltip:** Nos ícones de ação das tabelas
- **Separator/Divider:** Linha horizontal sutil entre seções

---

## 7. Mapeamento para shadcn/ui

| Componente do protótipo           | Componente shadcn       | Customização necessária                                |
|-----------------------------------|-------------------------|-------------------------------------------------------|
| Botão                             | `button`                | Variantes de cor via CVA (já suportado)                |
| Input de texto / busca            | `input`                 | Composição com ícone Lucide (search)                   |
| Tabela                            | `table`                 | Paginação e ordenação manual por cima                  |
| Badge de status                   | `badge`                 | Novas variantes: success, warning, info, neutral       |
| Avatar                            | `avatar`                | Fallback de iniciais (já suportado)                    |
| Card (estatística, item)          | `card`                  | Composição: StatCard, ListItemCard                     |
| Barra de progresso                | `progress`              | Cores customizadas via CSS vars                        |
| Painel lateral                    | `sheet`                 | Já suportado                                           |
| Modal                             | `dialog`                | Já suportado                                           |
| Abas                              | `tabs`                  | Já suportado                                           |
| Select/Dropdown                   | `select`                | Já suportado                                           |
| Checkbox                          | `checkbox`              | Já suportado                                           |
| Separator                         | `separator`             | Já suportado                                           |
| Tooltip                           | `tooltip`               | Já suportado                                           |
| Breadcrumb                        | `breadcrumb`            | Já suportado                                           |
| Sidebar + Topbar                  | **Manual** (layout)     | Componentes compostos customizados                     |
| Card de estatística               | **Manual** (features)   | Composição de `card` + Lucide icon                     |
| Item de timeline                  | **Manual** (features)   | Componente customizado                                 |
| FAB (botão flutuante)             | **Manual** (layout)     | Composição de `button` + posição fixed                 |
| Empty State                       | **Manual** (ui)         | Componente customizado simples                         |
| Page Header                       | **Manual** (layout)     | Título + ações + breadcrumb                            |

---

## 8. Decisões e Suposições Pendentes

1. **Cores exatas:** Os valores hex são aproximações visuais. Se houver um arquivo Figma/sketch com valores exatos, é preferível usá-los.
2. **Fonte secundária:** Não identifiquei uma segunda família tipográfica nos protótipos. Assumo que Manrope é usada em toda a interface.
3. **Ícones:** Assumo Lucide React como biblioteca de ícones (padrão shadcn/ui). Confirmar se os ícones nos protótipos são Lucide ou outra biblioteca.
4. **Sidebar responsiva:** Nos protótipos desktop, a sidebar é fixa. Assumo que em mobile ela se torna um drawer/hamburger menu. Confirmar comportamento desejado.
5. **Temas claro/escuro:** Os protótipos mostram apenas tema claro para as páginas internas. A folha de tokens tem fundo escuro, mas parece ser apenas a apresentação dos tokens. Confirmar se dark mode é necessário.
6. **Navegação:** Assumo que a sidebar tem os mesmos itens para coordenador e admin, com agrupamento por seção. Confirmar se há controle de visibilidade por role.
