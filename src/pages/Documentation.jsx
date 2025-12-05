import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Página standalone sem Layout - acessível apenas via Base44 Dev Menu
export default function Documentation() {
  const [showRaw, setShowRaw] = useState(false);

  const markdownContent = `# Documentação Técnica e Arquitetural
## Sistema de Gestão de Pós-Graduações (GPO) - ESUDA

---

## 📋 Sumário Executivo

Este documento apresenta a documentação completa do Sistema de Gestão de Pós-Graduações desenvolvido para a Faculdade ESUDA, incluindo análise arquitetural, funcional, entidades, componentes e estilos.

**Versão:** 1.0  
**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Plataforma:** Base44  
**Stack:** React + Tailwind CSS + Base44 BaaS

---

## 🏗️ 1. ARQUITETURA DO SISTEMA

### 1.1 Visão Geral da Arquitetura

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | React 18 + JSX | Componentes funcionais com hooks |
| **Estilização** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Biblioteca de componentes reutilizáveis |
| **Backend** | Base44 BaaS | Backend as a Service com autenticação e DB |
| **Database** | Base44 Entities | Sistema de entidades NoSQL gerenciado |
| **Roteamento** | React Router DOM | Navegação entre páginas |
| **State Management** | React Query | Cache e gerenciamento de estado do servidor |
| **IA/LLM** | Base44 Core.InvokeLLM | Integração com modelos de linguagem |

### 1.2 Estrutura de Diretórios

\`\`\`
├── entities/               # Definições de esquema (JSON Schema)
│   ├── Ciclo.json
│   ├── Especializacao.json
│   ├── Professor.json
│   ├── Parceiro.json
│   ├── Tecnologia.json
│   └── Post.json
│
├── pages/                  # Páginas da aplicação (flat structure)
│   ├── Homepage.jsx
│   ├── UpgradePage.jsx
│   ├── DiferenciaisPage.jsx
│   ├── CiclosPage.jsx
│   ├── EspecializacoesPage.jsx
│   ├── CoordenadorPage.jsx
│   ├── ProfessoresPage.jsx
│   ├── ParceirosPage.jsx
│   ├── EmAcaoPage.jsx
│   ├── InscricoesMatriculasPage.jsx
│   ├── AdminPage.jsx
│   └── Documentation.jsx
│
├── components/             # Componentes reutilizáveis (pode ter subpastas)
│   ├── ui/                 # shadcn/ui components
│   ├── admin/
│   │   ├── DetailedReport.jsx
│   │   └── ManagerialReport.jsx
│   └── presentation/
│       ├── SlideCover.jsx
│       ├── SlideUpgrade.jsx
│       ├── SlideCycles.jsx
│       ├── SlideExistingDegrees.jsx
│       └── SlideBuildYourOwn.jsx
│
└── Layout.jsx              # Layout wrapper para todas as páginas
\`\`\`

---

## 🗄️ 2. MODELO DE DADOS (ENTIDADES)

### 2.1 Entidade: User (Built-in)

**Descrição:** Entidade pré-existente do Base44 para gerenciamento de usuários.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único do usuário |
| \`email\` | string | Sim | Email do usuário (único) |
| \`full_name\` | string | Sim | Nome completo do usuário |
| \`role\` | enum | Sim | Papel: "admin" ou "user" |
| \`created_date\` | datetime | Sim (auto) | Data de criação |
| \`updated_date\` | datetime | Sim (auto) | Data de atualização |

**Regras de Acesso:**
- Somente administradores podem listar, atualizar ou deletar outros usuários
- Usuários regulares podem visualizar e atualizar apenas seus próprios dados

---

### 2.2 Entidade: Ciclo

**Descrição:** Representa um ciclo de conhecimento (módulo curricular) que compõe as especializações.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`nome\` | string | Sim | Nome do ciclo (ex: "Gestão de Projetos e Obras") |
| \`carga_horaria\` | number | Sim | Carga horária em horas |
| \`disciplinas\` | array[string] | Não | Lista de nomes das disciplinas |
| \`ordem\` | number | Não | Ordem de exibição |
| \`created_date\` | datetime | Sim (auto) | Data de criação |
| \`updated_date\` | datetime | Sim (auto) | Data de atualização |
| \`created_by\` | string | Sim (auto) | Email do criador |

**Relacionamentos:**
- Usado em: \`Especializacao.ciclos\` (Many-to-Many)

**Exemplo:**
\`\`\`json
{
  "nome": "Ciclo I: Gestão de Projetos e Obras",
  "carga_horaria": 120,
  "disciplinas": [
    "Gerenciamento de Projetos",
    "Eficiência Energética e Sustentabilidade",
    "Técnicas de Compatibilização de Projetos"
  ],
  "ordem": 1
}
\`\`\`

---

### 2.3 Entidade: Especializacao

**Descrição:** Representa uma pós-graduação/curso de especialização completo.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`nome\` | string | Sim | Nome da especialização |
| \`carga_horaria_total\` | number | Sim | Carga horária total em horas |
| \`ciclos\` | array[string] | Sim | IDs dos ciclos vinculados |
| \`professores\` | array[string] | Não | IDs dos professores vinculados |
| \`parceiros\` | array[string] | Não | IDs dos parceiros vinculados |
| \`tecnologias\` | array[string] | Não | IDs das tecnologias utilizadas |
| \`link_externo\` | string | Não | URL da página oficial |
| \`link_inscricao\` | string | Não | URL para inscrição |
| \`link_matricula\` | string | Não | URL para matrícula |
| \`resumo\` | string | Não | Resumo publicitário (gerado por IA) |
| \`descricao_completa_ia\` | string | Não | Descrição completa para IA processar |
| \`periodo_inscricao\` | string | Não | Período de inscrição/matrícula |
| \`data_inicio\` | string | Não | Data de início das aulas |
| \`status_inscricao\` | enum | Não | Status: "Inscrições Abertas", "Matrículas Abertas", "Turma Iniciada (Aceitando novos alunos)", "Fechado", "Aguardando Nova Turma" |
| \`condicoes_pagamento\` | array[object] | Não | Array com condições de pagamento |
| \`formato_aulas\` | array[enum] | Não | Formato: "Presencial", "Remoto (ao vivo)", "Gravadas" |
| \`dias_aulas\` | array[enum] | Não | Dias da semana |
| \`horario_inicio\` | string | Não | Horário de início (HH:MM) |
| \`horario_fim\` | string | Não | Horário de fim (HH:MM) |
| \`duracao_meses\` | number | Não | Duração em meses |
| \`ordem\` | number | Não | Ordem de exibição |

**Estrutura de \`condicoes_pagamento\`:**
\`\`\`json
{
  "descricao": "10x de R$ 249,00",
  "destaque": true
}
\`\`\`

**Relacionamentos:**
- Tem muitos: \`Ciclo\` (via \`ciclos\`)
- Tem muitos: \`Professor\` (via \`professores\`)
- Tem muitos: \`Parceiro\` (via \`parceiros\`)
- Tem muitos: \`Tecnologia\` (via \`tecnologias\`)

---

### 2.4 Entidade: Professor

**Descrição:** Representa um docente do corpo de professores.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`nome\` | string | Sim | Nome completo |
| \`titulo\` | string | Sim | Titulação acadêmica (ex: "Dr.", "Msc.") |
| \`foto_url\` | string | Não | URL da foto |
| \`instagram\` | string | Não | URL do perfil Instagram |
| \`linkedin\` | string | Não | URL do perfil LinkedIn |
| \`lattes\` | string | Não | URL do currículo Lattes |
| \`site\` | string | Não | URL do site pessoal |
| \`especializacoes\` | array[string] | Não | IDs das especializações |
| \`ordem\` | number | Não | Ordem de exibição |

**Relacionamentos:**
- Usado em: \`Especializacao.professores\` (Many-to-Many)

---

### 2.5 Entidade: Parceiro

**Descrição:** Representa uma empresa/instituição parceira.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`nome\` | string | Sim | Nome do parceiro |
| \`tipos_parceria\` | array[object] | Sim | Tipos de parceria |
| \`logo_url\` | string | Não | URL do logo |
| \`instagram\` | string | Não | URL do perfil Instagram |
| \`linkedin\` | string | Não | URL do perfil LinkedIn |
| \`site\` | string | Não | URL do site |
| \`especializacoes\` | array[string] | Não | IDs das especializações |
| \`ordem\` | number | Não | Ordem de exibição |

**Estrutura de \`tipos_parceria\`:**
\`\`\`json
{
  "tipo": "Canteiros Didáticos",
  "quantidade": 5,
  "desconto": 10
}
\`\`\`

**Tipos de Parceria Disponíveis:**
- Canteiros Didáticos
- Workshops
- Masterclasses
- Contratação de Alunos
- Incubadora Profissional
- Licença Educacional
- Convênios Corporativos

---

### 2.6 Entidade: Tecnologia

**Descrição:** Representa uma tecnologia/software utilizado nos cursos.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`nome\` | string | Sim | Nome da tecnologia (ex: "Autodesk Revit") |
| \`especializacoes\` | array[string] | Não | IDs das especializações |
| \`ordem\` | number | Não | Ordem de exibição |

---

### 2.7 Entidade: Post

**Descrição:** Representa um post/evento para a página "Em Ação".

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`titulo\` | string | Sim | Título do post |
| \`data\` | string | Sim | Data do evento/post |
| \`descricao\` | string | Sim | Descrição do post |
| \`imagem_url\` | string | Não | URL da imagem |
| \`ordem\` | number | Não | Ordem de exibição |

---

## 🔐 3. CONTROLE DE ACESSO E AUTENTICAÇÃO

### 3.1 Níveis de Acesso

| Papel | Descrição | Permissões |
|-------|-----------|------------|
| **admin** | Administrador do sistema | Acesso total ao AdminPage, CRUD completo de todas as entidades, acesso a relatórios e análises de IA |
| **user** | Usuário regular/visitante | Acesso somente às páginas públicas (visualização de cursos, ciclos, professores, etc.) |
| **Público** | Visitantes não autenticados | Acesso às páginas informativas (Homepage, Upgrade, Diferenciais, Ciclos, Especializações, etc.) |

### 3.2 Proteção de Rotas

| Página | Requer Autenticação | Requer Admin |
|--------|---------------------|--------------|
| Homepage | Não | Não |
| UpgradePage | Não | Não |
| DiferenciaisPage | Não | Não |
| CiclosPage | Não | Não |
| EspecializacoesPage | Não | Não |
| CoordenadorPage | Não | Não |
| ProfessoresPage | Não | Não |
| ParceirosPage | Não | Não |
| EmAcaoPage | Não | Não |
| InscricoesMatriculasPage | Não | Não |
| **AdminPage** | **Sim** | **Sim** |
| **Documentation** | **Sim** | **Sim** |

### 3.3 Implementação de Segurança

A proteção é implementada no Layout.jsx:

\`\`\`javascript
useEffect(() => {
  async function checkAdminStatus() {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user && user.role === 'admin');
    } catch (error) {
      setIsAdmin(false);
    }
  }
  checkAdminStatus();
}, []);
\`\`\`

A AdminPage só é exibida no menu quando \`isAdmin === true\`.

---

## 🤖 4. INTELIGÊNCIA ARTIFICIAL E AGENTES

### 4.1 InvokeLLM - Análise de Viabilidade de Cursos

**Localização:** AdminPage > Aba "Análise de Cursos"

**Função:** Analisa a viabilidade de criar novas especializações com base em ciclos selecionados.

**Integração:**
\`\`\`javascript
const res = await base44.integrations.Core.InvokeLLM({
  prompt: promptDetalhado,
  add_context_from_internet: true,
  response_json_schema: {
    type: "object",
    properties: {
      resumo_executivo: { type: "string" },
      sinergia_curricular: { type: "string" },
      // ... mais propriedades
    }
  }
});
\`\`\`

**Parâmetros de Entrada:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| \`ciclosSelecionados\` | array[Ciclo] | Ciclos que farão parte do curso |
| \`nomePosGraduacao\` | string | Nome proposto para a especialização |
| \`focoEspecifico\` | string | Foco/diferencial do curso |
| \`contextoBase\` | string | Contexto institucional da ESUDA |

**Saída Estruturada:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| \`resumo_executivo\` | string | Resumo estratégico do curso |
| \`sinergia_curricular\` | string | Análise da coesão curricular |
| \`conflitos_sobreposicoes\` | string | Identificação de redundâncias |
| \`tendencias_mercado\` | string | Análise de mercado |
| \`sugestoes_disciplinas\` | array[object] | Disciplinas sugeridas para ciclos vazios |
| \`conflitos_potenciais\` | array[object] | Conflitos identificados |
| \`analise_mercado\` | array[object] | Cursos similares no mercado |

**Estrutura de \`sugestoes_disciplinas\`:**
\`\`\`json
{
  "ciclo_nome": "Nome do Ciclo",
  "disciplinas": [
    {
      "nome": "Nome da Disciplina",
      "justificativa": "Por que esta disciplina é importante",
      "carga_horaria_sugerida": 20
    }
  ]
}
\`\`\`

**Estrutura de \`analise_mercado\`:**
\`\`\`json
{
  "nome_curso": "Gestão de Projetos BIM",
  "instituicao": "USP",
  "url": "https://...",
  "disciplinas_chave": ["BIM", "Gestão", "Planejamento"],
  "formato": "Remoto",
  "duracao": "12 meses",
  "valor_aproximado": "R$ 15.000"
}
\`\`\`

---

### 4.2 Geração de Resumo Publicitário

**Função:** Gera resumo publicitário a partir da descrição completa.

**Implementação:**
\`\`\`javascript
const resResumo = await base44.integrations.Core.InvokeLLM({
  prompt: \`Você é um redator publicitário especializado...\`,
  response_json_schema: {
    type: "object",
    properties: {
      resumo: { type: "string" }
    }
  }
});
\`\`\`

**Uso:** Automático ao salvar especialização com \`descricao_completa_ia\` preenchida.

---

## 📄 5. PÁGINAS E COMPONENTES

### 5.1 Páginas Públicas

| Página | Rota | Descrição |
|--------|------|-----------|
| **Homepage** | \`/Homepage\` | Página inicial com logo e links principais |
| **UpgradePage** | \`/UpgradePage\` | Explicação da abordagem modular e Profissional 4.0 |
| **DiferenciaisPage** | \`/DiferenciaisPage\` | Diferenciais do programa e tecnologias |
| **CiclosPage** | \`/CiclosPage\` | Lista de ciclos com accordion para disciplinas |
| **EspecializacoesPage** | \`/EspecializacoesPage\` | Cards expansíveis com detalhes de cada especialização |
| **CoordenadorPage** | \`/CoordenadorPage\` | Perfil do coordenador Emanoel Amorim |
| **ProfessoresPage** | \`/ProfessoresPage\` | Corpo docente (placeholder) |
| **ParceirosPage** | \`/ParceirosPage\` | Lista de parceiros com logos e links |
| **EmAcaoPage** | \`/EmAcaoPage\` | Posts de eventos e atividades |
| **InscricoesMatriculasPage** | \`/InscricoesMatriculasPage\` | Informações sobre inscrições e contatos |

---

### 5.2 Páginas Administrativas

| Página | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| **AdminPage** | \`/AdminPage\` | Central de administração com múltiplas abas | Admin |
| **Documentation** | \`/Documentation\` | Documentação técnica do sistema | Dev only |

**Abas da AdminPage:**

| Aba | Funcionalidade |
|-----|----------------|
| **Ciclos de Conhecimento** | CRUD de ciclos |
| **Especializações** | CRUD de especializações com geração de resumo por IA |
| **Parceiros** | CRUD de parceiros |
| **Tecnologias** | CRUD de tecnologias |
| **Corpo Docente** | CRUD de professores |
| **Análise de Cursos** | Ferramenta de viabilidade com IA |
| **Relatórios** | Relatórios detalhado e gerencial com PDF |
| **Posts "Em Ação"** | CRUD de posts (placeholder) |

---

### 5.3 Componentes de Relatórios

#### DetailedReport.jsx

**Descrição:** Gera relatório detalhado de cada especialização.

**Funcionalidades:**
- Lista todas as especializações cadastradas
- Mostra status de preenchimento de cada campo
- Exibe ciclos, disciplinas, professores, parceiros e tecnologias
- Indica campos vazios com alerta
- Exporta para PDF

**Props:**
\`\`\`typescript
{
  especializacoes: Especializacao[],
  ciclos: Ciclo[],
  professores: Professor[],
  parceiros: Parceiro[],
  tecnologias: Tecnologia[]
}
\`\`\`

---

#### ManagerialReport.jsx

**Descrição:** Relatório gerencial com análise estratégica.

**Funcionalidades:**
- Estatísticas agregadas do portfólio
- Mapa visual de relações (especializações → recursos)
- Análise de ciclos compartilhados
- Identificação de disciplinas comuns entre especializações
- Recomendações para diferenciação
- Exportação para PDF

**Análises Realizadas:**

1. **Visão Geral:**
   - Total de especializações, ciclos, professores, parceiros, tecnologias
   - Carga horária total agregada

2. **Mapa de Relações:**
   - Para cada especialização, mostra visualmente:
     - Ciclos vinculados (nome, CH, disciplinas)
     - Quantidade de professores
     - Quantidade de parceiros
     - Quantidade de tecnologias

3. **Ciclos Compartilhados:**
   - Lista ciclos usados em múltiplas especializações
   - Identifica reutilização de conteúdo

4. **Análise de Similaridade:**
   - Compara disciplinas entre todas as especializações
   - Alerta quando 2+ especializações têm disciplinas comuns
   - Sugere estratégias de diferenciação

---

### 5.4 Componentes de Apresentação

| Componente | Descrição |
|------------|-----------|
| **SlideCover** | Slide de capa com logo e título |
| **SlideUpgrade** | Slide sobre o conceito "Upgrade" |
| **SlideCycles** | Slide com accordion de ciclos (com edição admin) |
| **SlideExistingDegrees** | Placeholder para especializações |
| **SlideBuildYourOwn** | Interface para criar especialização customizada |

---

## 🎨 6. SISTEMA DE DESIGN E ESTILOS

### 6.1 Paleta de Cores

| Cor | Hex/Tailwind | Uso |
|-----|--------------|-----|
| **Verde ESUDA** | \`#61b376\` / \`from-green-600 to-green-700\` | Cor principal da marca |
| **Azul** | \`from-blue-600 to-indigo-600\` | Informação, ciclos |
| **Roxo** | \`from-purple-600 to-indigo-600\` | Relatórios, análise |
| **Laranja** | \`text-orange-600\` | Parceiros, destaques |
| **Vermelho** | \`from-red-600 to-pink-600\` | Alertas, conflitos |
| **Amarelo/Âmbar** | \`amber-600\` | Avisos, campos vazios |
| **Verde (Sucesso)** | \`green-600\` | Confirmação, campos preenchidos |
| **Cinza** | \`gray-50 to gray-900\` | Neutro, textos |

### 6.2 Tipografia

| Elemento | Classe Tailwind | Uso |
|----------|-----------------|-----|
| **Heading 1** | \`text-3xl md:text-5xl font-bold\` | Títulos principais |
| **Heading 2** | \`text-2xl md:text-3xl font-bold\` | Subtítulos de seção |
| **Heading 3** | \`text-xl font-semibold\` | Títulos de card |
| **Body** | \`text-base text-gray-700\` | Texto padrão |
| **Small** | \`text-sm text-gray-600\` | Textos secundários |
| **Caption** | \`text-xs text-gray-500\` | Labels, metadados |

### 6.3 Componentes shadcn/ui Utilizados

| Componente | Importação | Uso |
|------------|-----------|-----|
| **Button** | \`@/components/ui/button\` | Botões de ação |
| **Card** | \`@/components/ui/card\` | Containers de conteúdo |
| **Badge** | \`@/components/ui/badge\` | Tags e status |
| **Input** | \`@/components/ui/input\` | Campos de texto |
| **Textarea** | \`@/components/ui/textarea\` | Campos de texto multiline |
| **Select** | \`@/components/ui/select\` | Dropdowns |
| **Checkbox** | \`@/components/ui/checkbox\` | Seleção múltipla |

### 6.4 Ícones (Lucide React)

| Ícone | Componente | Uso |
|-------|-----------|-----|
| **Home** | \`Home\` | Página inicial |
| **Award** | \`Award\` | Upgrade |
| **Lightbulb** | \`Lightbulb\` | Diferenciais |
| **GitMerge** | \`GitMerge\` | Ciclos |
| **GraduationCap** | \`GraduationCap\` | Especializações |
| **Users** | \`Users\` | Professores |
| **Handshake** | \`Handshake\` | Parceiros |
| **Cpu** | \`Cpu\` | Tecnologias |
| **Download** | \`Download\` | Exportar |
| **Sparkles** | \`Sparkles\` | IA/Análise |
| **AlertTriangle** | \`AlertTriangle\` | Alertas |
| **CheckCircle** | \`CheckCircle\` | Confirmação |

### 6.5 Layout e Responsividade

**Layout Sidebar:**
- Sidebar fixa à esquerda com 16 (mobile) ou 64 (desktop) de largura
- Backdrop blur para efeito glassmorphism
- Logo ESUDA no topo
- Navegação vertical com ícones e labels

**Breakpoints:**
- \`md:\` → 768px (tablets e acima)
- Mobile-first approach

**Container Principal:**
- \`max-w-4xl mx-auto\` → Máximo 896px centralizado
- Padding responsivo: \`p-4 md:p-8\`

---

## 🔄 7. FLUXOS FUNCIONAIS PRINCIPAIS

### 7.1 Fluxo de Criação de Especialização

\`\`\`
1. Admin acessa AdminPage > Especializações
2. Clica em "Adicionar Nova Especialização"
3. Preenche o formulário:
   - Nome, carga horária
   - Seleciona ciclos
   - Seleciona professores, parceiros, tecnologias
   - Adiciona links, datas, condições de pagamento
   - Escreve descrição completa
4. Ao salvar:
   - Sistema valida campos obrigatórios
   - Se \`descricao_completa_ia\` preenchida → gera resumo com IA
   - Cria registro no backend
   - Atualiza cache do React Query
   - Exibe toast de sucesso
\`\`\`

---

### 7.2 Fluxo de Análise de Viabilidade com IA

\`\`\`
1. Admin acessa AdminPage > Análise de Cursos
2. Digita nome da pós-graduação
3. Seleciona ciclos desejados
4. Opcionalmente adiciona foco específico
5. Clica em "Analisar Viabilidade com IA"
6. Sistema:
   - Coleta disciplinas de todos os ciclos
   - Monta prompt contextual
   - Chama InvokeLLM com acesso à internet
   - Aguarda resposta estruturada (JSON)
7. Exibe resultado:
   - Resumo executivo
   - Análise de sinergia
   - Conflitos identificados
   - Sugestões de disciplinas (editáveis)
   - Comparativo de mercado
8. Admin pode:
   - Editar sugestões de disciplinas
   - Selecionar e incluir disciplinas nos ciclos
   - Criar nova especialização com dados preenchidos
\`\`\`

---

### 7.3 Fluxo de Geração de Relatórios

\`\`\`
1. Admin acessa AdminPage > Relatórios
2. Escolhe tipo:
   a) Relatório Detalhado:
      - Sistema busca todas as especializações
      - Para cada uma, busca ciclos, professores, parceiros, tecnologias
      - Renderiza cards com status de preenchimento
      - Mostra todas as disciplinas de cada ciclo
   b) Relatório Gerencial:
      - Calcula estatísticas agregadas
      - Monta mapa visual de relações
      - Analisa ciclos compartilhados
      - Compara disciplinas entre especializações
      - Identifica sobreposições
3. Admin revisa conteúdo na tela
4. Clica em "Exportar para PDF"
5. Sistema:
   - Captura conteúdo HTML com html2canvas
   - Converte para imagem PNG
   - Cria PDF com jsPDF
   - Faz download do arquivo
\`\`\`

---

## 📊 8. MÉTRICAS E ANÁLISES

### 8.1 Indicadores do Sistema

| Métrica | Descrição | Fonte |
|---------|-----------|-------|
| **Total de Especializações** | Número de pós-graduações ativas | \`Especializacao.list()\` |
| **Total de Ciclos** | Número de ciclos cadastrados | \`Ciclo.list()\` |
| **Carga Horária Total** | Soma de todas as especializações | Agregação |
| **Professores Únicos** | Professores distintos no portfólio | Set de IDs |
| **Parceiros Ativos** | Parceiros distintos | Set de IDs |
| **Tecnologias Utilizadas** | Tecnologias distintas | Set de IDs |
| **Ciclos Compartilhados** | Ciclos usados em múltiplas especializações | Análise |
| **Taxa de Reutilização** | % de ciclos compartilhados | Cálculo |

### 8.2 Análises de Qualidade

| Análise | Objetivo | Resultado |
|---------|----------|-----------|
| **Completude de Dados** | Identificar campos vazios | Lista de campos não preenchidos |
| **Similaridade Curricular** | Detectar sobreposição | Pares de especializações com disciplinas comuns |
| **Viabilidade de Mercado** | Avaliar competitividade | Cursos similares e posicionamento |
| **Coerência Curricular** | Avaliar sinergia | Score de alinhamento temático |

---

## 🔧 9. CONFIGURAÇÃO E DEPLOY

### 9.1 Variáveis de Ambiente

| Variável | Descrição | Fonte |
|----------|-----------|-------|
| \`BASE44_APP_ID\` | ID do app no Base44 | Auto (Base44) |
| \`BASE44_APP_OWNER\` | Owner do app | Auto (Base44) |

### 9.2 Dependências (package.json implícito)

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 18.x | Framework UI |
| react-router-dom | 6.x | Roteamento |
| @tanstack/react-query | 5.x | State management |
| lucide-react | latest | Ícones |
| tailwindcss | 3.x | CSS utility |
| shadcn/ui | latest | Componentes |
| react-markdown | latest | Renderização Markdown |
| jspdf | 2.5.x | Geração de PDF |
| html2canvas | latest | Captura de tela |

### 9.3 Build e Deploy

**Plataforma:** Base44 (deploy automático)

**Processo:**
1. Código commitado no Base44 Editor
2. Build automático na plataforma
3. Deploy instantâneo
4. URL: \`https://[app-id].base44.app\`

---

## 📝 10. MANUTENÇÃO E EVOLUÇÃO

### 10.1 Tarefas Comuns de Manutenção

| Tarefa | Frequência | Responsável |
|--------|------------|-------------|
| Atualizar informações de cursos | Semestral | Coordenação |
| Adicionar novos ciclos | Conforme necessário | Admin |
| Atualizar corpo docente | Anual | Admin |
| Revisar parceiros | Anual | Admin |
| Backup de dados | Automático | Base44 |

### 10.2 Roadmap de Melhorias

| Funcionalidade | Prioridade | Descrição |
|----------------|------------|-----------|
| **CRUD de Posts** | Alta | Implementar gestão completa de posts "Em Ação" |
| **Upload de Imagens** | Média | Permitir upload de fotos de professores e parceiros |
| **Relatório de Inscrições** | Baixa | Dashboard com métricas de inscrições |
| **Notificações** | Baixa | Sistema de alertas para novos cursos |
| **API Pública** | Baixa | Expor dados para integração externa |

---

## 🛡️ 11. SEGURANÇA E BOAS PRÁTICAS

### 11.1 Checklist de Segurança

- ✅ Autenticação obrigatória para área administrativa
- ✅ Validação de papel (admin) para operações sensíveis
- ✅ Sanitização de inputs (via React)
- ✅ HTTPS obrigatório (Base44)
- ✅ CORS configurado (Base44)
- ✅ Backup automático de dados (Base44)

### 11.2 Boas Práticas de Código

- ✅ Componentes funcionais com hooks
- ✅ Props tipadas (via JSDoc comments quando necessário)
- ✅ Separação de concerns (páginas vs componentes)
- ✅ Estado servidor gerenciado pelo React Query
- ✅ Estado local mínimo
- ✅ Código responsivo (mobile-first)
- ✅ Acessibilidade (uso de labels, aria-labels)

---

## 📞 12. CONTATOS E SUPORTE

| Papel | Responsabilidade | Contato |
|-------|------------------|---------|
| **Coordenador Acadêmico** | Emanoel Amorim | LinkedIn, Instagram, Site |
| **Suporte Base44** | Plataforma e infraestrutura | suporte@base44.com |
| **Administrador do Sistema** | Gestão de dados | [Definir] |

---

## 📚 13. GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Base44** | Backend as a Service para desenvolvimento rápido |
| **BaaS** | Backend as a Service |
| **Ciclo** | Módulo curricular que agrupa disciplinas |
| **Especialização** | Pós-graduação completa composta por ciclos |
| **InvokeLLM** | Integração do Base44 para chamar modelos de linguagem |
| **React Query** | Biblioteca para gerenciamento de estado do servidor |
| **shadcn/ui** | Biblioteca de componentes React reutilizáveis |
| **Tailwind CSS** | Framework CSS utility-first |

---

## 📌 14. APÊNDICES

### 14.1 Exemplo de Prompt para InvokeLLM

\`\`\`
Você é um consultor educacional especializado...

**Contexto Institucional:**
[Informações sobre a ESUDA]

**Ciclos Selecionados:**
- Ciclo: [Nome]
  Carga Horária: [CH]h
  Disciplinas:
    - [Disciplina 1]
    - [Disciplina 2]
    ...

**Tarefa:**
Analise a viabilidade de criar uma pós-graduação chamada "[Nome]"...

Retorne um JSON estruturado com:
- resumo_executivo
- sinergia_curricular
- conflitos_sobreposicoes
- tendencias_mercado
- sugestoes_disciplinas
- conflitos_potenciais
- analise_mercado
\`\`\`

---

### 14.2 Estrutura de Resposta da IA

\`\`\`json
{
  "resumo_executivo": "Texto estratégico...",
  "sinergia_curricular": "Análise de coesão...",
  "conflitos_sobreposicoes": "Identificação de redundâncias...",
  "tendencias_mercado": "Demanda por...",
  "sugestoes_disciplinas": [
    {
      "ciclo_nome": "Ciclo X",
      "disciplinas": [
        {
          "nome": "Disciplina Y",
          "justificativa": "Importante porque...",
          "carga_horaria_sugerida": 20
        }
      ]
    }
  ],
  "conflitos_potenciais": [
    {
      "titulo": "Sobreposição de Conteúdo",
      "descricao": "Disciplinas A e B...",
      "estrategia_mitigacao": "Considere..."
    }
  ],
  "analise_mercado": [
    {
      "nome_curso": "Gestão de Projetos BIM",
      "instituicao": "USP",
      "url": "https://...",
      "disciplinas_chave": ["BIM", "Gestão"],
      "formato": "Remoto",
      "duracao": "12 meses",
      "valor_aproximado": "R$ 15.000"
    }
  ]
}
\`\`\`

---

## ✅ 15. CONCLUSÃO

Este documento apresenta a arquitetura completa do Sistema de Gestão de Pós-Graduações da ESUDA. O sistema foi desenvolvido com foco em:

- **Modularidade:** Especializações compostas por ciclos reutilizáveis
- **Inteligência:** Análise de viabilidade com IA e geração automática de conteúdo
- **Gestão:** Relatórios detalhados e gerenciais com exportação para PDF
- **Usabilidade:** Interface responsiva e intuitiva
- **Escalabilidade:** Arquitetura baseada em BaaS (Base44)

O sistema está pronto para suportar o crescimento do portfólio de pós-graduações da ESUDA, oferecendo ferramentas poderosas para análise estratégica e tomada de decisão.

---

**Fim da Documentação**

*Gerado em: ${new Date().toLocaleString('pt-BR')}*
`;

  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentacao-sistema-gpo-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Documentação Técnica e Arquitetural
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  Sistema de Gestão de Pós-Graduações - ESUDA
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowRaw(!showRaw)}
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                {showRaw ? 'Ver Formatado' : 'Ver Markdown'}
              </Button>
              <Button
                onClick={downloadMarkdown}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Markdown
              </Button>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-100 mb-1">🔒 Acesso Restrito - Somente Desenvolvimento</h3>
              <p className="text-sm text-red-200">
                Esta página contém documentação técnica sensível e está disponível apenas no ambiente de desenvolvimento do Base44.
                Não é acessível pelo menu do aplicativo publicado.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {showRaw ? (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Código Markdown:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs md:text-sm leading-relaxed max-h-[600px] overflow-y-auto">
                  {markdownContent}
                </pre>
              </div>
            ) : (
              <div className="prose prose-sm md:prose-base max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-blue-600">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-gray-300">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="bg-blue-600 text-white font-bold p-3 text-left border border-gray-300">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="p-3 border border-gray-300">
                        {children}
                      </td>
                    ),
                    code: ({ inline, children }) => (
                      inline ? (
                        <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                          {children}
                        </code>
                      )
                    ),
                    hr: () => <hr className="my-8 border-t-2 border-gray-300" />,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white/70">
          <p>Documentação gerada automaticamente • Sistema Base44</p>
          <p className="mt-1">© {new Date().getFullYear()} ESUDA - Faculdade de Arquitetura e Engenharia Civil</p>
        </div>
      </div>
    </div>
  );
}