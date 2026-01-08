import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todas as entidades
    const entities = [
      'Ciclo', 'Especializacao', 'Professor', 'Parceiro', 'Tecnologia', 'Discente',
      'Post', 'Comentario', 'Depoimento', 'CronogramaAula', 'Projeto', 'Evento',
      'ArtigoCientifico', 'CanteiroDidatico', 'FreelancerNetwork', 'RelatorioTecnico',
      'ProducaoTecnologica', 'Inscrito', 'Lead', 'CRMActivityLog', 'SocialMediaPost',
      'CampanhaMarketing', 'ChatbotFAQ', 'PerguntaSemResposta', 'MediaItem',
      'FiltroSalvo', 'Notificacao', 'UserProfile', 'AplicativoNoticia',
      'AplicativoFeedback', 'AplicativoMidia'
    ];

    const entitySchemas = {};
    for (const entityName of entities) {
      try {
        const schema = await base44.asServiceRole.entities[entityName].schema();
        entitySchemas[entityName] = schema;
      } catch (error) {
        // Entidade não existe
      }
    }

    // Gerar documentação
    const markdown = `# Documentação Técnica e Arquitetural
## Sistema de Gestão de Pós-Graduações (GPO) - ESUDA

---

## 📋 Sumário Executivo

Este documento apresenta a documentação completa do Sistema de Gestão de Pós-Graduações desenvolvido para a Faculdade ESUDA, incluindo análise arquitetural, funcional, entidades, componentes e estilos.

**Versão:** 2.0  
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

### 1.2 Estrutura de Diretórios Atual

\`\`\`
📁 entities/                    # ${Object.keys(entitySchemas).length} entidades cadastradas
${Object.keys(entitySchemas).map(name => `│   ├── ${name}.json`).join('\n')}
│
📁 pages/                       # Páginas da aplicação (flat structure)
│   ├── Homepage.jsx
│   ├── AdminPage.jsx
│   ├── UpgradePage.jsx
│   ├── CiclosPage.jsx
│   ├── EspecializacoesPage.jsx
│   ├── CoordenadorPage.jsx
│   ├── ProfessoresPage.jsx
│   ├── CorpoDiscentePage.jsx
│   ├── ParceirosPage.jsx
│   ├── EmAcaoPage.jsx
│   ├── PostPage.jsx
│   ├── CalendarioDeAula.jsx
│   ├── DepoimentosPage.jsx
│   ├── IncubadoraProfissionalPage.jsx
│   ├── AplicativosInteligentesPage.jsx
│   ├── GaleriaMidiasAplicativos.jsx
│   ├── PerfilDocente.jsx
│   ├── PerfilDiscente.jsx
│   ├── MeuPerfilDocente.jsx
│   ├── MeuPerfilDiscente.jsx
│   ├── UserProfilePage.jsx
│   ├── GerenciadorDeMidiaPage.jsx
│   └── Documentation.jsx
│
📁 components/                  # Componentes reutilizáveis
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Componentes administrativos
│   │   ├── DepoimentosManager.jsx
│   │   ├── ComentariosManager.jsx
│   │   ├── SocialMediaGenerator.jsx
│   │   ├── BulkActionsPanel.jsx
│   │   ├── NotificationManager.jsx
│   │   ├── crm/
│   │   │   ├── CRMDashboard.jsx
│   │   │   ├── LeadsTable.jsx
│   │   │   ├── MarketingStudio.jsx
│   │   │   ├── ActivityLog.jsx
│   │   │   └── BulkActions.jsx
│   │   └── incubadora/
│   │       ├── ProjetoForm.jsx
│   │       ├── AtividadeForm.jsx
│   │       ├── AtividadeList.jsx
│   │       └── AtividadeEditForm.jsx
│   ├── blog/
│   │   ├── ImageViewer.jsx
│   │   └── PDFGallery.jsx
│   ├── chatbot/
│   │   ├── Chatbot.jsx
│   │   └── InactivityHelper.jsx
│   ├── layout/
│   │   └── NotificationBell.jsx
│   ├── notifications/
│   │   └── CommentNotifications.jsx
│   └── community/
│       ├── AtalhosComunidade.jsx
│       ├── FeedSucesso.jsx
│       └── NotificacoesPanel.jsx
│
📁 functions/                   # Backend functions (Deno)
│   ├── syncLeadsActive.js
│   ├── getGPOReport.js
│   ├── generateMarketingContent.js
│   ├── generateCampaignImage.js
│   ├── sendBulkEmail.js
│   ├── sendDepoimentoNotification.js
│   ├── notifyAdminNewContent.js
│   ├── cleanDuplicates.js
│   ├── listAllDepoimentos.js
│   └── generateDocumentation.js
│
📁 agents/                      # AI Agents
│   ├── coordenador_digital.json
│   ├── suporte_aluno.json
│   └── gpo_intelligence.json
│
📄 Layout.jsx                   # Layout wrapper global
\`\`\`

---

## 🗄️ 2. ENTIDADES DO SISTEMA (${Object.keys(entitySchemas).length} entidades)

${Object.entries(entitySchemas).map(([name, schema]) => {
  const props = schema.properties || {};
  const required = schema.required || [];
  
  return `### 2.${Object.keys(entitySchemas).indexOf(name) + 1} Entidade: ${name}

**Descrição:** ${schema.description || 'Entidade do sistema'}

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| \`id\` | string | Sim (auto) | Identificador único |
| \`created_date\` | datetime | Sim (auto) | Data de criação |
| \`updated_date\` | datetime | Sim (auto) | Data de atualização |
| \`created_by\` | string | Sim (auto) | Email do criador |
${Object.entries(props).map(([key, prop]) => {
  const type = prop.type || 'string';
  const isRequired = required.includes(key) ? 'Sim' : 'Não';
  const desc = prop.description || '-';
  return `| \`${key}\` | ${type} | ${isRequired} | ${desc} |`;
}).join('\n')}

${schema.rls ? `**Regras de Acesso (RLS):**
- Create: ${JSON.stringify(schema.rls.create || {})}
- Read: ${JSON.stringify(schema.rls.read || {})}
- Update: ${JSON.stringify(schema.rls.update || {})}
- Delete: ${JSON.stringify(schema.rls.delete || {})}` : ''}

---
`;
}).join('\n')}

## 🔐 3. CONTROLE DE ACESSO E AUTENTICAÇÃO

### 3.1 Níveis de Acesso

| Papel | Descrição | Permissões |
|-------|-----------|------------|
| **admin** | Administrador do sistema | Acesso total ao AdminPage, CRUD completo, relatórios |
| **user** | Usuário regular | Acesso às páginas públicas e perfis próprios |
| **Público** | Visitantes não autenticados | Acesso às páginas informativas |

### 3.2 Recursos de Segurança

- ✅ Autenticação via Base44 Auth
- ✅ Row Level Security (RLS) nas entidades
- ✅ Validação de papel (role) para operações sensíveis
- ✅ HTTPS obrigatório
- ✅ Backup automático de dados

---

## 🤖 4. INTELIGÊNCIA ARTIFICIAL E AGENTES

### 4.1 Agentes Disponíveis

| Agente | Função | Integração |
|--------|--------|------------|
| **GPO Intelligence** | Auditor de performance acadêmica - Grupo 1 | WhatsApp |
| **Coordenador Digital** | Assistente do coordenador | WhatsApp |
| **Suporte Aluno** | Suporte automatizado a alunos | WhatsApp |

### 4.2 Integrações de IA

- **InvokeLLM:** Análise de viabilidade de cursos
- **Geração de Conteúdo:** Marketing e redes sociais
- **Análise de Dados:** Relatórios e dashboards
- **Processamento de Linguagem:** Chatbot e FAQ

---

## 📊 5. FUNCIONALIDADES PRINCIPAIS

### 5.1 Sistema CRM & Marketing

- **Dashboard CRM:** Gestão completa de leads e inscritos
- **Marketing Studio:** Geração de conteúdo com IA
- **Sincronização G1:** Importação automática do Google Sheets
- **Email em Massa:** Campanhas de email marketing
- **Exportação WhatsApp:** Lista de contatos formatada

### 5.2 Sistema de Depoimentos

- **Submissão Pública:** Formulário para depoimentos
- **Moderação:** Aprovação/rejeição de depoimentos
- **Aprovação Automática:** Para usuários confiáveis
- **Notificações:** Email para admins e autores
- **Reações:** Likes e corações nos depoimentos

### 5.3 Blog "Em Ação"

- **Posts com Mídia:** Suporte a imagens, vídeos, PDFs, áudio
- **Comentários:** Sistema completo com respostas
- **Notificações:** Para admins e autores de posts
- **SEO:** Meta tags e Schema.org
- **Compartilhamento:** Redes sociais integradas

### 5.4 Incubadora Profissional

- **Gestão de Projetos:** CRUD completo
- **Atividades:** Eventos, artigos, canteiros, freelancer
- **Dashboard ROI:** Visualização de métricas
- **Relatórios:** Exportação para análise

### 5.5 Aplicativos Inteligentes

- **GPO 4.0:** Gestão de projetos e obras
- **Predial 4.0:** Manutenção predial
- **Galeria de Mídia:** Upload e gestão de conteúdo
- **Feedback:** Sistema de avaliação

---

## 🎨 6. SISTEMA DE DESIGN

### 6.1 Paleta de Cores

| Cor | Uso |
|-----|-----|
| **Verde ESUDA** (\`#61b376\`) | Cor principal da marca |
| **Azul** | Informação, links |
| **Roxo** | Relatórios, análise |
| **Laranja** | Parceiros, destaques |
| **Vermelho** | Alertas, deletar |
| **Verde Sucesso** | Confirmações |

### 6.2 Componentes shadcn/ui

- Button, Card, Badge, Input, Textarea, Select, Checkbox
- Dialog, Dropdown, Popover, Toast, Tabs
- Calendar, Accordion, Avatar, Progress

---

## 📈 7. INTEGRAÇÕES EXTERNAS

### 7.1 Google Sheets

- **Sincronização de Leads:** Importação automática
- **Deduplicação:** Remoção de duplicatas
- **Grupos G1/G2:** Categorização automática

### 7.2 SendGrid

- **Email Transacional:** Notificações e confirmações
- **Email Marketing:** Campanhas em massa

### 7.3 OpenAI

- **Geração de Texto:** Conteúdo de marketing
- **Geração de Imagens:** DALL-E 3
- **Análise de Dados:** Processamento com LLM

---

## 📞 8. CONTATOS E SUPORTE

| Papel | Responsabilidade | Contato |
|-------|------------------|---------|
| **Coordenador Acadêmico** | Emanoel Amorim | emanoel.s.amorim@gmail.com |
| **Suporte Base44** | Plataforma | suporte@base44.com |

---

## ✅ 9. CONCLUSÃO

Sistema completo de gestão acadêmica com:
- ${Object.keys(entitySchemas).length} entidades de dados
- Integração com IA e automações
- CRM e marketing integrados
- Sistema de blog e depoimentos
- Incubadora profissional
- Aplicativos inteligentes

**Gerado em:** ${new Date().toLocaleString('pt-BR')}

---

**Fim da Documentação**
`;

    return Response.json({
      success: true,
      markdown,
      entities_count: Object.keys(entitySchemas).length,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao gerar documentação:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});