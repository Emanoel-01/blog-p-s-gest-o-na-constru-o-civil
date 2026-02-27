import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Edit, Trash2, Save, X, ExternalLink, Upload, Sparkles, Star, CheckCircle2, Calendar, Download, Mail, Tag, Users, Bell } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '../components/editor/RichTextEditor';
import html2pdf from 'html2pdf.js';

import DetailedReport from '../components/admin/DetailedReport';
import ManagerialReport from '../components/admin/ManagerialReport';
import DisciplinaFormFields from '../components/admin/DisciplinaFormFields';
import AdminScheduleTemplate from '../components/admin/AdminScheduleTemplate';
import ProjetoForm from '../components/admin/incubadora/ProjetoForm';
import AtividadeForm from '../components/admin/incubadora/AtividadeForm';
import AtividadeList from '../components/admin/incubadora/AtividadeList';
import AtividadeEditForm from '../components/admin/incubadora/AtividadeEditForm';
import LeadCRM from '../components/admin/LeadCRM';
import NotificationCenter from '../components/admin/NotificationCenter';
import EventosManager from '../components/admin/EventosManager';
import CampanhaEmailManager from '../components/admin/CampanhaEmailManager';
import NotificacoesDiscentesPage from '../components/admin/NotificacoesDiscentesPage';
import GPOChatbot from '../components/admin/GPOChatbot';

import BulkEnrollStudents from '../components/admin/BulkEnrollStudents';
import NotificationManager from '../components/admin/NotificationManager';
import BulkActionsPanel from '../components/admin/BulkActionsPanel';
import AplicativosManager from '../components/admin/AplicativosManager';
import CRMDashboard from '../components/admin/crm/CRMDashboard';
import LeadsTable from '../components/admin/crm/LeadsTable';
import MarketingStudio from '../components/admin/crm/MarketingStudio';
import BulkActions from '../components/admin/crm/BulkActions';
import ActivityLog from '../components/admin/crm/ActivityLog';
import EmailTemplateManager from '../components/admin/EmailTemplateManager';
import EmailCampaignLog from '../components/admin/EmailCampaignLog';
import BlogManager from '../components/admin/BlogManager';
import GerenciamentoUsuarios from '../components/admin/GerenciamentoUsuarios';
import SystemAutomation from '../components/admin/SystemAutomation';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ai-tools');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [hasCrmAccess, setHasCrmAccess] = useState(false);
  const [novaTag, setNovaTag] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const superAdmin = user.email === 'emanoel.s.amorim@gmail.com' || user.email === 'emanoel@esuda.edu.br';
        setIsSuperAdmin(superAdmin);
        setHasCrmAccess(superAdmin || user.role === 'admin' || user.crm_access === true);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
    loadUser();
  }, []);

  // Incubadora state
  const [showProjetoForm, setShowProjetoForm] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState(null);
  const [projetoForm, setProjetoForm] = useState({
    nome_projeto: '',
    coordenador: '',
    objetivo_geral: '',
    justificativa: '',
    tipo_projeto: 'Incubadora Profissional',
    ano_projeto: new Date().getFullYear(),
    especializacoes: []
  });
  const [atividadeTab, setAtividadeTab] = useState('eventos');
  
  // Ciclos state
  const [editingCiclo, setEditingCiclo] = useState(null);
  const [showCicloForm, setShowCicloForm] = useState(false);
  const [cicloForm, setCicloForm] = useState({
    nome: '',
    carga_horaria: '',
    disciplinas: [],
    ordem: 0
  });

  // Especializações state
  const [editingEspec, setEditingEspec] = useState(null);
  const [showEspecForm, setShowEspecForm] = useState(false);
  const [especForm, setEspecForm] = useState({
    nome: '',
    carga_horaria_total: '',
    ciclos: [],
    professores: [],
    parceiros: [],
    tecnologias: [],
    link_externo: '',
    link_inscricao: '',
    link_matricula: '',
    resumo: '',
    descricao_completa_ia: '',
    periodo_inscricao: '',
    data_inicio: '',
    status_inscricao: 'Inscrições Abertas',
    condicoes_pagamento: [],
    formato_aulas: [],
    dias_aulas: [],
    horario_inicio: '',
    horario_fim: '',
    duracao_meses: '',
    ordem: 0
  });
  const [generatingResumo, setGeneratingResumo] = useState(false);

  // Parceiros state
  const [editingParceiro, setEditingParceiro] = useState(null);
  const [showParceiroForm, setShowParceiroForm] = useState(false);
  const [parceiroForm, setParceiroForm] = useState({
    nome: '',
    tipos_parceria: [],
    logo_url: '',
    instagram: '',
    linkedin: '',
    site: '',
    especializacoes: [], // Added especializacoes
    ordem: 0
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedTiposParceria, setSelectedTiposParceria] = useState({});

  // Tecnologias state
  const [editingTecnologia, setEditingTecnologia] = useState(null);
  const [showTecnologiaForm, setShowTecnologiaForm] = useState(false);
  const [tecnologiaForm, setTecnologiaForm] = useState({
    nome: '',
    especializacoes: [], // Added especializacoes
    ordem: 0
  });

  // Professores state
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [showProfessorForm, setShowProfessorForm] = useState(false);
  const [professorForm, setProfessorForm] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    titulo: '',
    mini_bio: '',
    foto_url: '',
    instagram: '',
    linkedin: '',
    lattes: '',
    site: '',
    especializacoes: [],
    credenciais: [],
    ordem: 0
  });
  const [uploadingFotoProfessor, setUploadingFotoProfessor] = useState(false);

  // Discentes state
  const [editingDiscente, setEditingDiscente] = useState(null);
  const [showDiscenteForm, setShowDiscenteForm] = useState(false);
  const [discenteForm, setDiscenteForm] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    titulo: '',
    numero_turma: '',
    cargo_atual: '',
    empresa: '',
    status_carreira: '',
    sobre: '',
    tags_competencia: [],
    foto_url: '',
    instagram: '',
    linkedin: '',
    lattes: '',
    site: '',
    especializacoes: [],
    parceiros: [],
    ordem: 0
  });
  const [uploadingFotoDiscente, setUploadingFotoDiscente] = useState(false);

  // Posts state
  const [editingPost, setEditingPost] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    titulo: '',
    data: '',
    descricao: '',
    conteudo_completo: '',
    midias: [],
    imagem_destaque: '',
    tags: [],
    categoria_principal: '',
    subcategoria: '',
    status: 'Rascunho',
    data_publicacao: '',
    especializacoes: [],
    ciclos: [],
    professores: [],
    parceiros: [],
    ordem: 0
  });
  const [uploadingMidia, setUploadingMidia] = useState(false);

  // Cronograma state
  const [editingCronograma, setEditingCronograma] = useState(null);
  const [showCronogramaForm, setShowCronogramaForm] = useState(false);
  const [cronogramaForm, setCronogramaForm] = useState({
    data: '',
    tipo: 'Presencial',
    ciclo_id: '',
    disciplina_nome: '',
    professor_id: '',
    horario_inicio: '',
    horario_fim: '',
    observacoes: '',
    ordem: 0
  });

  // Nova State para Análise de Cursos
  const [analiseForm, setAnaliseForm] = useState({
    nome_proposto: '',
    ciclos_selecionados: [],
    especializacao_existente_id: null // Added for re-evaluation
  });
  const [analiseResult, setAnaliseResult] = useState(null);
  const [loadingAnalise, setLoadingAnalise] = useState(false);
  const [isGeneratingAnalisePDF, setIsGeneratingAnalisePDF] = useState(false); // New state for PDF generation

  // Novo estado para gerenciar disciplinas editáveis e selecionadas
  const [disciplinasEditaveis, setDisciplinasEditaveis] = useState({});
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState({});
  const [incluindoDisciplinas, setIncluindoDisciplinas] = useState({});

  // Estado para edição de atividades
  const [editingAtividade, setEditingAtividade] = useState(null);
  const [atividadeEditTipo, setAtividadeEditTipo] = useState(null);

  // Chatbot FAQs state
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [faqForm, setFaqForm] = useState({
    pergunta: '',
    resposta: '',
    pagina_destino: '',
    categoria: 'Informações Gerais',
    ativo: true,
    ordem: 0
  });

  // Leads state
  const [editingLead, setEditingLead] = useState(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState('Todos');
  
  // CRM Tab state
  const [crmSubTab, setCrmSubTab] = useState('dashboard');
  const [crmMarketingSubTab, setCrmMarketingSubTab] = useState('acoes');

  // Queries
  const { data: ciclos = [], isLoading: loadingCiclos } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const { data: especializacoes = [], isLoading: loadingEspec } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const { data: professores = [], isLoading: loadingProf } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem')
  });

  const { data: parceiros = [], isLoading: loadingParceiros } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('ordem')
  });

  const { data: tecnologias = [], isLoading: loadingTecnologias } = useQuery({
    queryKey: ['tecnologias'],
    queryFn: () => base44.entities.Tecnologia.list('ordem')
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date')
  });

  const { data: discentes = [], isLoading: loadingDiscentes } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('ordem')
  });

  const { data: cronograma = [], isLoading: loadingCronograma } = useQuery({
    queryKey: ['cronograma'],
    queryFn: () => base44.entities.CronogramaAula.list('data')
  });

  const { data: projetos = [] } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => base44.entities.Projeto.list()
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos-incubadora'],
    queryFn: () => base44.entities.Evento.list('-data')
  });

  const { data: artigos = [] } = useQuery({
    queryKey: ['artigos-incubadora'],
    queryFn: () => base44.entities.ArtigoCientifico.list('-data_publicacao')
  });

  const { data: canteiros = [] } = useQuery({
    queryKey: ['canteiros-incubadora'],
    queryFn: () => base44.entities.CanteiroDidatico.list('-data')
  });

  const { data: freelancers = [] } = useQuery({
    queryKey: ['freelancers-incubadora'],
    queryFn: () => base44.entities.FreelancerNetwork.list('-data')
  });

  const { data: relatorios = [] } = useQuery({
    queryKey: ['relatorios-incubadora'],
    queryFn: () => base44.entities.RelatorioTecnico.list('-data')
  });

  const { data: producoes = [] } = useQuery({
    queryKey: ['producoes-incubadora'],
    queryFn: () => base44.entities.ProducaoTecnologica.list('-data')
  });

  const { data: chatbotFAQs = [] } = useQuery({
    queryKey: ['chatbot-faqs'],
    queryFn: () => base44.entities.ChatbotFAQ.list('ordem')
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date')
  });

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios-admin'],
    queryFn: () => base44.entities.Comentario.list('-created_date')
  });

  const { data: perguntasSemResposta = [] } = useQuery({
    queryKey: ['perguntas-sem-resposta'],
    queryFn: () => base44.entities.PerguntaSemResposta.list('-created_date')
  });

  const { data: allNotificacoes = [] } = useQuery({
    queryKey: ['admin-notificacoes'],
    queryFn: () => base44.entities.Notificacao.list('-created_date')
  });

  const { data: inscritos = [] } = useQuery({
    queryKey: ['inscritos'],
    queryFn: () => base44.entities.Inscrito.list('-data_inscricao')
  });

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas'],
    queryFn: () => base44.entities.CampanhaMarketing.list('-created_date')
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['crm-activity-log'],
    queryFn: () => base44.entities.CRMActivityLog.list('-created_date', 100),
    enabled: hasCrmAccess
  });

  // Auto-calcular carga horária quando ciclos mudam
  useEffect(() => {
    if (especForm.ciclos.length > 0 && ciclos.length > 0) {
      const totalHoras = especForm.ciclos.reduce((sum, cicloId) => {
        const ciclo = ciclos.find(c => c.id === cicloId);
        return sum + (ciclo?.carga_horaria || 0);
      }, 0);
      setEspecForm(prev => ({ ...prev, carga_horaria_total: totalHoras.toString() }));
    }
  }, [especForm.ciclos, ciclos]);

  // ========== MUTATIONS PARA CICLOS ==========
  const createCicloMutation = useMutation({
    mutationFn: (data) => base44.entities.Ciclo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      resetCicloForm();
      toast.success('Ciclo criado com sucesso!');
    }
  });

  const updateCicloMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ciclo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      setEditingCiclo(null);
      toast.success('Ciclo atualizado com sucesso!');
    }
  });

  const deleteCicloMutation = useMutation({
    mutationFn: (id) => base44.entities.Ciclo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
      toast.success('Ciclo removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA ESPECIALIZAÇÕES ==========
  const createEspecMutation = useMutation({
    mutationFn: (data) => base44.entities.Especializacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especializacoes'] });
      resetEspecForm();
      toast.success('Especialização criada com sucesso!');
    }
  });

  const updateEspecMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Especializacao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especializacoes'] });
      setEditingEspec(null);
      toast.success('Especialização atualizada com sucesso!');
    }
  });

  const deleteEspecMutation = useMutation({
    mutationFn: (id) => base44.entities.Especializacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especializacoes'] });
      toast.success('Especialização removida com sucesso!');
    }
  });

  // ========== MUTATIONS PARA PARCEIROS ==========
  const createParceiroMutation = useMutation({
    mutationFn: (data) => base44.entities.Parceiro.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] });
      resetParceiroForm();
      toast.success('Parceiro criado com sucesso!');
    }
  });

  const updateParceiroMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Parceiro.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] });
      setEditingParceiro(null);
      toast.success('Parceiro atualizado com sucesso!');
    }
  });

  const deleteParceiroMutation = useMutation({
    mutationFn: (id) => base44.entities.Parceiro.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros'] });
      toast.success('Parceiro removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA TECNOLOGIAS ==========
  const createTecnologiaMutation = useMutation({
    mutationFn: (data) => base44.entities.Tecnologia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tecnologias'] });
      resetTecnologiaForm();
      toast.success('Tecnologia criada com sucesso!');
    }
  });

  const updateTecnologiaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tecnologia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tecnologias'] });
      setEditingTecnologia(null);
      toast.success('Tecnologia atualizada com sucesso!');
    }
  });

  const deleteTecnologiaMutation = useMutation({
    mutationFn: (id) => base44.entities.Tecnologia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tecnologias'] });
      toast.success('Tecnologia removida com sucesso!');
    }
  });

  // ========== MUTATIONS PARA PROFESSORES ==========
  const createProfessorMutation = useMutation({
    mutationFn: (data) => base44.entities.Professor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      resetProfessorForm();
      toast.success('Professor criado com sucesso!');
    }
  });

  const updateProfessorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Professor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setEditingProfessor(null);
      toast.success('Professor atualizado com sucesso!');
    }
  });

  const deleteProfessorMutation = useMutation({
    mutationFn: (id) => base44.entities.Professor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA DISCENTES ==========
  const createDiscenteMutation = useMutation({
    mutationFn: (data) => base44.entities.Discente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
      resetDiscenteForm();
      toast.success('Aluno criado com sucesso!');
    }
  });

  const updateDiscenteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Discente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
      setEditingDiscente(null);
      toast.success('Aluno atualizado com sucesso!');
    }
  });

  const deleteDiscenteMutation = useMutation({
    mutationFn: (id) => base44.entities.Discente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
      toast.success('Aluno removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA POSTS ==========
  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      resetPostForm();
      toast.success('Post criado com sucesso!');
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setEditingPost(null);
      toast.success('Post atualizado com sucesso!');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA CRONOGRAMA ==========
  const createCronogramaMutation = useMutation({
    mutationFn: (data) => base44.entities.CronogramaAula.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      resetCronogramaForm();
      toast.success('Aula adicionada ao cronograma!');
    }
  });

  const updateCronogramaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CronogramaAula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      setEditingCronograma(null);
      toast.success('Aula atualizada com sucesso!');
    }
  });

  const deleteCronogramaMutation = useMutation({
    mutationFn: (id) => base44.entities.CronogramaAula.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      toast.success('Aula removida do cronograma!');
    }
  });

  // ========== MUTATIONS PARA PROJETO ==========
  const createProjetoMutation = useMutation({
    mutationFn: (data) => base44.entities.Projeto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      resetProjetoForm();
      toast.success('Projeto criado com sucesso!');
    }
  });

  const updateProjetoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Projeto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      setEditingProjeto(null);
      toast.success('Projeto atualizado com sucesso!');
    }
  });

  const deleteProjetoMutation = useMutation({
    mutationFn: (id) => base44.entities.Projeto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      toast.success('Projeto removido com sucesso!');
    }
  });

  // ========== MUTATIONS PARA CHATBOT FAQS ==========
  const createFAQMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatbotFAQ.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs'] });
      resetFAQForm();
      toast.success('FAQ criada com sucesso!');
    }
  });

  const updateFAQMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChatbotFAQ.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs'] });
      setEditingFAQ(null);
      toast.success('FAQ atualizada com sucesso!');
    }
  });

  const deleteFAQMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatbotFAQ.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs'] });
      toast.success('FAQ removida com sucesso!');
    }
  });

  // ========== MUTATIONS PARA LEADS ==========
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead atualizado com sucesso!');
    }
  });

  const updateComentarioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Comentario.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-admin'] });
    }
  });

  const deleteComentarioMutation = useMutation({
    mutationFn: (id) => base44.entities.Comentario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-admin'] });
      toast.success('Comentário removido!');
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead removido com sucesso!');
    }
  });

  const updateInscritoMutation = useMutation({
    mutationFn: async ({ id, data, logDetails }) => {
      await base44.entities.Inscrito.update(id, data);
      
      // Registrar no log de atividades
      if (logDetails && currentUser) {
        try {
          await base44.entities.CRMActivityLog.create({
            user_email: currentUser.email,
            user_name: currentUser.full_name,
            action_type: 'lead_atualizado',
            lead_id: id,
            lead_nome: logDetails.lead_nome,
            details: logDetails.details,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Erro ao registrar log:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscritos'] });
      toast.success('Inscrito atualizado!');
    }
  });

  const deleteInscritoMutation = useMutation({
    mutationFn: async ({ id, inscrito }) => {
      await base44.entities.Inscrito.delete(id);
      
      // Registrar no log de atividades
      if (currentUser) {
        try {
          await base44.entities.CRMActivityLog.create({
            user_email: currentUser.email,
            user_name: currentUser.full_name,
            action_type: 'lead_excluido',
            lead_id: id,
            lead_nome: inscrito?.nome_completo,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Erro ao registrar log:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscritos'] });
      toast.success('Inscrito removido!');
    }
  });

  const updatePerguntaSemRespostaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerguntaSemResposta.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perguntas-sem-resposta'] });
      toast.success('Pergunta atualizada!');
    }
  });

  const deletePerguntaSemRespostaMutation = useMutation({
    mutationFn: (id) => base44.entities.PerguntaSemResposta.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perguntas-sem-resposta'] });
      toast.success('Pergunta removida!');
    }
  });

  // ========== HANDLERS PARA CICLOS ==========
  const resetCicloForm = () => {
    setCicloForm({ nome: '', carga_horaria: '', disciplinas: [], ordem: 0 });
    setShowCicloForm(false);
    setEditingCiclo(null);
  };

  const handleSaveCiclo = () => {
    const data = {
      nome: cicloForm.nome,
      carga_horaria: parseInt(cicloForm.carga_horaria),
      disciplinas: cicloForm.disciplinas,
      ordem: parseInt(cicloForm.ordem) || 0
    };

    if (editingCiclo) {
      updateCicloMutation.mutate({ id: editingCiclo.id, data });
    } else {
      createCicloMutation.mutate(data);
    }
  };

  const handleEditCiclo = (ciclo) => {
    // Converter disciplinas antigas (strings) para novo formato (objetos)
    let disciplinasFormatadas = [];
    if (ciclo.disciplinas) {
      disciplinasFormatadas = ciclo.disciplinas.map(d => {
        if (typeof d === 'string') {
          return { nome: d, ementa_sintetica: '', ementa_detalhada: '', conhecimento_adquirido: '', habilidade_tecnica: '', habilidade_comportamental: '', modalidade: 'Presencial', carga_horaria: 0 };
        }
        return d;
      });
    }
    
    setCicloForm({
      nome: ciclo.nome,
      carga_horaria: ciclo.carga_horaria.toString(),
      disciplinas: disciplinasFormatadas,
      ordem: ciclo.ordem || 0
    });
    setEditingCiclo(ciclo);
    setShowCicloForm(true);
  };

  const handleDeleteCiclo = (id) => {
    if (window.confirm('Tem certeza que deseja remover este ciclo?')) {
      deleteCicloMutation.mutate(id);
    }
  };

  const handleAddDisciplina = () => {
    setCicloForm(prev => ({
      ...prev,
      disciplinas: [...prev.disciplinas, {
        nome: '',
        ementa_sintetica: '',
        ementa_detalhada: '',
        conhecimento_adquirido: '',
        habilidade_tecnica: '',
        habilidade_comportamental: '',
        carga_horaria: 0,
        modalidade: 'Presencial'
      }]
    }));
  };

  const handleDisciplinaChange = (index, field, value) => {
    setCicloForm(prev => ({
      ...prev,
      disciplinas: prev.disciplinas.map((d, i) => 
        i === index ? { ...d, [field]: field === 'carga_horaria' ? parseInt(value) || 0 : value } : d
      )
    }));
  };

  const handleRemoveDisciplina = (index) => {
    setCicloForm(prev => ({
      ...prev,
      disciplinas: prev.disciplinas.filter((_, i) => i !== index)
    }));
  };

  // ========== HANDLERS PARA ESPECIALIZAÇÕES ==========
  const resetEspecForm = () => {
    setEspecForm({
      nome: '',
      carga_horaria_total: '',
      ciclos: [],
      professores: [],
      parceiros: [],
      tecnologias: [],
      link_externo: '',
      link_inscricao: '',
      link_matricula: '',
      resumo: '',
      descricao_completa_ia: '',
      periodo_inscricao: '',
      data_inicio: '',
      status_inscricao: 'Inscrições Abertas',
      condicoes_pagamento: [],
      formato_aulas: [],
      dias_aulas: [],
      horario_inicio: '',
      horario_fim: '',
      duracao_meses: '',
      ordem: 0
    });
    setShowEspecForm(false);
    setEditingEspec(null);
  };

  const handleSaveEspec = () => {
    const data = {
      nome: especForm.nome,
      carga_horaria_total: parseInt(especForm.carga_horaria_total),
      ciclos: especForm.ciclos,
      professores: especForm.professores,
      parceiros: especForm.parceiros,
      tecnologias: especForm.tecnologias,
      link_externo: especForm.link_externo,
      link_inscricao: especForm.link_inscricao,
      link_matricula: especForm.link_matricula,
      resumo: especForm.resumo,
      descricao_completa_ia: especForm.descricao_completa_ia,
      periodo_inscricao: especForm.periodo_inscricao,
      data_inicio: especForm.data_inicio,
      status_inscricao: especForm.status_inscricao,
      condicoes_pagamento: especForm.condicoes_pagamento,
      formato_aulas: especForm.formato_aulas,
      dias_aulas: especForm.dias_aulas,
      horario_inicio: especForm.horario_inicio,
      horario_fim: especForm.horario_fim,
      duracao_meses: parseInt(especForm.duracao_meses) || 0,
      ordem: parseInt(especForm.ordem) || 0
    };

    if (editingEspec) {
      updateEspecMutation.mutate({ id: editingEspec.id, data });
    } else {
      createEspecMutation.mutate(data);
    }
  };

  const handleEditEspec = (espec) => {
    setEspecForm({
      nome: espec.nome,
      carga_horaria_total: espec.carga_horaria_total?.toString() || '',
      ciclos: espec.ciclos || [],
      professores: espec.professores || [],
      parceiros: espec.parceiros || [],
      tecnologias: espec.tecnologias || [],
      link_externo: espec.link_externo || '',
      link_inscricao: espec.link_inscricao || '',
      link_matricula: espec.link_matricula || '',
      resumo: espec.resumo || '',
      descricao_completa_ia: espec.descricao_completa_ia || '',
      periodo_inscricao: espec.periodo_inscricao || '',
      data_inicio: espec.data_inicio || '',
      status_inscricao: espec.status_inscricao || 'Inscrições Abertas',
      condicoes_pagamento: espec.condicoes_pagamento || [],
      formato_aulas: espec.formato_aulas || [],
      dias_aulas: espec.dias_aulas || [],
      horario_inicio: espec.horario_inicio || '',
      horario_fim: espec.horario_fim || '',
      duracao_meses: espec.duracao_meses?.toString() || '',
      ordem: espec.ordem || 0
    });
    setEditingEspec(espec);
    setShowEspecForm(true);
  };

  const handleDeleteEspec = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta especialização?')) {
      deleteEspecMutation.mutate(id);
    }
  };

  const handleCicloCheckboxChange = (cicloId) => {
    setEspecForm(prev => ({
      ...prev,
      ciclos: prev.ciclos.includes(cicloId)
        ? prev.ciclos.filter(id => id !== cicloId)
        : [...prev.ciclos, cicloId]
    }));
  };

  const handleProfessorCheckboxChange = (professorId) => {
    setEspecForm(prev => ({
      ...prev,
      professores: prev.professores.includes(professorId)
        ? prev.professores.filter(id => id !== professorId)
        : [...prev.professores, professorId]
    }));
  };

  const handleParceiroCheckboxChange = (parceiroId) => {
    setEspecForm(prev => ({
      ...prev,
      parceiros: prev.parceiros.includes(parceiroId)
        ? prev.parceiros.filter(id => id !== parceiroId)
        : [...prev.parceiros, parceiroId]
    }));
  };

  const handleTecnologiaCheckboxChange = (tecnologiaId) => {
    setEspecForm(prev => ({
      ...prev,
      tecnologias: prev.tecnologias.includes(tecnologiaId)
        ? prev.tecnologias.filter(id => id !== tecnologiaId)
        : [...prev.tecnologias, tecnologiaId]
    }));
  };

  const handleFormatoAulaCheckboxChange = (formato) => {
    setEspecForm(prev => ({
      ...prev,
      formato_aulas: prev.formato_aulas.includes(formato)
        ? prev.formato_aulas.filter(f => f !== formato)
        : [...prev.formato_aulas, formato]
    }));
  };

  const handleDiaAulaCheckboxChange = (dia) => {
    setEspecForm(prev => ({
      ...prev,
      dias_aulas: Array.isArray(prev.dias_aulas) && prev.dias_aulas.includes(dia)
        ? prev.dias_aulas.filter(diaItem => diaItem !== dia)
        : [...(Array.isArray(prev.dias_aulas) ? prev.dias_aulas : []), dia]
    }));
  };

  const handleAddCondicaoPagamento = () => {
    if (especForm.condicoes_pagamento.length >= 4) {
      toast.error('Máximo de 4 condições de pagamento permitidas!');
      return;
    }
    setEspecForm(prev => ({
      ...prev,
      condicoes_pagamento: [...prev.condicoes_pagamento, { descricao: '', destaque: false }]
    }));
  };

  const handleRemoveCondicaoPagamento = (index) => {
    setEspecForm(prev => ({
      ...prev,
      condicoes_pagamento: prev.condicoes_pagamento.filter((_, i) => i !== index)
    }));
  };

  const handleCondicaoPagamentoChange = (index, field, value) => {
    setEspecForm(prev => ({
      ...prev,
      condicoes_pagamento: prev.condicoes_pagamento.map((cond, i) => 
        i === index 
          ? { ...cond, [field]: value } 
          : (field === 'destaque' && value && cond.destaque) // If a new one is set as highlight, unhighlight others
            ? { ...cond, destaque: false } 
            : cond
      )
    }));
  };

  const handleGenerateResumo = async () => {
    if (!especForm.descricao_completa_ia) {
      toast.error('Por favor, preencha a descrição completa antes de gerar o resumo!');
      return;
    }

    setGeneratingResumo(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em marketing educacional. Analise a seguinte descrição detalhada de uma pós-graduação em arquitetura e engenharia civil e crie um resumo PUBLICITÁRIO conciso e atrativo de no máximo 150 palavras que:

1. Capte a atenção do leitor
2. Destaque os principais diferenciais do curso
3. Seja persuasivo e profissional
4. Use linguagem direta e envolvente

Descrição completa:
${especForm.descricao_completa_ia}

Retorne APENAS o resumo publicitário, sem introduções ou explicações adicionais.`
      });

      setEspecForm(prev => ({ ...prev, resumo: response }));
      toast.success('Resumo gerado com sucesso! Revise e ajuste se necessário.');
    } catch (error) {
      toast.error('Erro ao gerar resumo: ' + error.message);
    } finally {
      setGeneratingResumo(false);
    }
  };

  // ========== HANDLERS PARA PARCEIROS ==========
  const tiposParceiraOptions = [
    { value: 'Canteiros Didáticos', needsQuantidade: true, needsDiscount: false },
    { value: 'Workshops', needsQuantidade: true, needsDiscount: false },
    { value: 'Masterclasses', needsQuantidade: true, needsDiscount: false },
    { value: 'Contratação de Alunos', needsQuantidade: true, needsDiscount: false },
    { value: 'Incubadora Profissional', needsQuantidade: true, needsDiscount: false },
    { value: 'Licença Educacional', needsQuantidade: false, needsDiscount: false },
    { value: 'Convênios Corporativos', needsQuantidade: false, needsDiscount: true }
  ];

  const resetParceiroForm = () => {
    setParceiroForm({
      nome: '',
      tipos_parceria: [],
      logo_url: '',
      instagram: '',
      linkedin: '',
      site: '',
      especializacoes: [], // Reset especializacoes
      ordem: 0
    });
    setSelectedTiposParceria({});
    setShowParceiroForm(false);
    setEditingParceiro(null);
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setParceiroForm(prev => ({ ...prev, logo_url: file_url }));
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTipoParceriaToggle = (tipoValue) => {
    setSelectedTiposParceria(prev => {
      const newSelected = { ...prev };
      if (newSelected[tipoValue]) {
        delete newSelected[tipoValue];
      } else {
        newSelected[tipoValue] = { tipo: tipoValue, quantidade: 0, desconto: 0 };
      }
      return newSelected;
    });
  };

  const handleTipoParceriaChange = (tipoValue, field, value) => {
    setSelectedTiposParceria(prev => ({
      ...prev,
      [tipoValue]: {
        ...prev[tipoValue],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleParceiroEspecCheckboxChange = (especId) => { // New handler
    setParceiroForm(prev => ({
      ...prev,
      especializacoes: prev.especializacoes.includes(especId)
        ? prev.especializacoes.filter(id => id !== especId)
        : [...prev.especializacoes, especId]
    }));
  };

  const handleSaveParceiro = () => {
    if (!parceiroForm.nome) {
      toast.error('Nome do parceiro é obrigatório!');
      return;
    }

    const tipos_parceria = Object.values(selectedTiposParceria).map(tp => {
      const result = { tipo: tp.tipo };
      if (tp.quantidade > 0) result.quantidade = tp.quantidade;
      if (tp.desconto > 0) result.desconto = tp.desconto;
      return result;
    });

    if (tipos_parceria.length === 0) {
      toast.error('Selecione pelo menos um tipo de parceria!');
      return;
    }

    const data = {
      nome: parceiroForm.nome,
      tipos_parceria,
      logo_url: parceiroForm.logo_url,
      instagram: parceiroForm.instagram,
      linkedin: parceiroForm.linkedin,
      site: parceiroForm.site,
      especializacoes: parceiroForm.especializacoes, // Added especializacoes to data
      ordem: parseInt(parceiroForm.ordem) || 0
    };

    if (editingParceiro) {
      updateParceiroMutation.mutate({ id: editingParceiro.id, data });
    } else {
      createParceiroMutation.mutate(data);
    }
  };

  const handleEditParceiro = (parceiro) => {
    setParceiroForm({
      nome: parceiro.nome,
      tipos_parceria: parceiro.tipos_parceria || [],
      logo_url: parceiro.logo_url || '',
      instagram: parceiro.instagram || '',
      linkedin: parceiro.linkedin || '',
      site: parceiro.site || '',
      especializacoes: parceiro.especializacoes || [], // Load especializacoes
      ordem: parceiro.ordem || 0
    });
    
    const selected = {};
    (parceiro.tipos_parceria || []).forEach(tp => {
      selected[tp.tipo] = {
        tipo: tp.tipo,
        quantidade: tp.quantidade || 0,
        desconto: tp.desconto || 0
      };
    });
    setSelectedTiposParceria(selected);
    
    setEditingParceiro(parceiro);
    setShowParceiroForm(true);
  };

  const handleDeleteParceiro = (id) => {
    if (window.confirm('Tem certeza que deseja remover este parceiro?')) {
      deleteParceiroMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA TECNOLOGIAS ==========
  const resetTecnologiaForm = () => {
    setTecnologiaForm({ nome: '', especializacoes: [], ordem: 0 }); // Reset especializacoes
    setShowTecnologiaForm(false);
    setEditingTecnologia(null);
  };

  const handleTecnologiaEspecCheckboxChange = (especId) => { // New handler
    setTecnologiaForm(prev => ({
      ...prev,
      especializacoes: prev.especializacoes.includes(especId)
        ? prev.especializacoes.filter(id => id !== especId)
        : [...prev.especializacoes, especId]
    }));
  };

  const handleSaveTecnologia = () => {
    if (!tecnologiaForm.nome) {
      toast.error('Nome da tecnologia é obrigatório!');
      return;
    }

    const data = {
      nome: tecnologiaForm.nome,
      especializacoes: tecnologiaForm.especializacoes, // Added especializacoes to data
      ordem: parseInt(tecnologiaForm.ordem) || 0
    };

    if (editingTecnologia) {
      updateTecnologiaMutation.mutate({ id: editingTecnologia.id, data });
    } else {
      createTecnologiaMutation.mutate(data);
    }
  };

  const handleEditTecnologia = (tecnologia) => {
    setTecnologiaForm({
      nome: tecnologia.nome,
      especializacoes: tecnologia.especializacoes || [], // Load especializacoes
      ordem: tecnologia.ordem || 0
    });
    setEditingTecnologia(tecnologia);
    setShowTecnologiaForm(true);
  };

  const handleDeleteTecnologia = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta tecnologia?')) {
      deleteTecnologiaMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA PROFESSORES ==========
  const resetProfessorForm = () => {
    setProfessorForm({
      nome: '',
      email: '',
      whatsapp: '',
      titulo: '',
      mini_bio: '',
      foto_url: '',
      instagram: '',
      linkedin: '',
      lattes: '',
      site: '',
      especializacoes: [],
      credenciais: [],
      ordem: 0
    });
    setShowProfessorForm(false);
    setEditingProfessor(null);
  };

  const handleUploadFotoProfessor = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFotoProfessor(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfessorForm(prev => ({ ...prev, foto_url: file_url }));
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploadingFotoProfessor(false);
    }
  };

  const handleProfessorEspecCheckboxChange = (especId) => { // New handler
    setProfessorForm(prev => ({
      ...prev,
      especializacoes: prev.especializacoes.includes(especId)
        ? prev.especializacoes.filter(id => id !== especId)
        : [...prev.especializacoes, especId]
    }));
  };

  const handleSaveProfessor = () => {
    if (!professorForm.nome || !professorForm.titulo) {
      toast.error('Nome e título do professor são obrigatórios!');
      return;
    }

    const data = {
      nome: professorForm.nome,
      email: professorForm.email,
      whatsapp: professorForm.whatsapp,
      titulo: professorForm.titulo,
      mini_bio: professorForm.mini_bio,
      foto_url: professorForm.foto_url,
      instagram: professorForm.instagram,
      linkedin: professorForm.linkedin,
      lattes: professorForm.lattes,
      site: professorForm.site,
      especializacoes: professorForm.especializacoes,
      credenciais: professorForm.credenciais,
      ordem: parseInt(professorForm.ordem) || 0
    };

    if (editingProfessor) {
      updateProfessorMutation.mutate({ id: editingProfessor.id, data });
    } else {
      createProfessorMutation.mutate(data);
    }
  };

  const handleEditProfessor = (professor) => {
    setProfessorForm({
      nome: professor.nome,
      email: professor.email || '',
      whatsapp: professor.whatsapp || '',
      titulo: professor.titulo,
      mini_bio: professor.mini_bio || '',
      foto_url: professor.foto_url || '',
      instagram: professor.instagram || '',
      linkedin: professor.linkedin || '',
      lattes: professor.lattes || '',
      site: professor.site || '',
      especializacoes: professor.especializacoes || [],
      credenciais: professor.credenciais || [],
      ordem: professor.ordem || 0
    });
    setEditingProfessor(professor);
    setShowProfessorForm(true);
  };

  const handleDeleteProfessor = (id) => {
    if (window.confirm('Tem certeza que deseja remover este professor?')) {
      deleteProfessorMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA DISCENTES ==========
  const resetDiscenteForm = () => {
    setDiscenteForm({
      nome: '',
      email: '',
      whatsapp: '',
      titulo: '',
      numero_turma: '',
      cargo_atual: '',
      empresa: '',
      status_carreira: '',
      sobre: '',
      tags_competencia: [],
      foto_url: '',
      instagram: '',
      linkedin: '',
      lattes: '',
      site: '',
      especializacoes: [],
      parceiros: [],
      ordem: 0
    });
    setShowDiscenteForm(false);
    setEditingDiscente(null);
  };

  const handleUploadFotoDiscente = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFotoDiscente(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDiscenteForm(prev => ({ ...prev, foto_url: file_url }));
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploadingFotoDiscente(false);
    }
  };

  const handleDiscenteEspecCheckboxChange = (especId) => {
    setDiscenteForm(prev => ({
      ...prev,
      especializacoes: prev.especializacoes.includes(especId)
        ? prev.especializacoes.filter(id => id !== especId)
        : [...prev.especializacoes, especId]
    }));
  };

  const handleDiscenteParceiroCheckboxChange = (parceiroId) => {
    setDiscenteForm(prev => ({
      ...prev,
      parceiros: prev.parceiros.includes(parceiroId)
        ? prev.parceiros.filter(id => id !== parceiroId)
        : [...prev.parceiros, parceiroId]
    }));
  };

  const handleSaveDiscente = () => {
    if (!discenteForm.nome || !discenteForm.email) {
      toast.error('Nome e email do aluno são obrigatórios!');
      return;
    }

    const data = {
      nome: discenteForm.nome,
      email: discenteForm.email,
      whatsapp: discenteForm.whatsapp,
      titulo: discenteForm.titulo,
      numero_turma: discenteForm.numero_turma,
      cargo_atual: discenteForm.cargo_atual,
      empresa: discenteForm.empresa,
      status_carreira: discenteForm.status_carreira,
      sobre: discenteForm.sobre,
      tags_competencia: discenteForm.tags_competencia,
      foto_url: discenteForm.foto_url,
      instagram: discenteForm.instagram,
      linkedin: discenteForm.linkedin,
      lattes: discenteForm.lattes,
      site: discenteForm.site,
      especializacoes: discenteForm.especializacoes,
      parceiros: discenteForm.parceiros,
      ordem: parseInt(discenteForm.ordem) || 0
    };

    if (editingDiscente) {
      updateDiscenteMutation.mutate({ id: editingDiscente.id, data });
    } else {
      createDiscenteMutation.mutate(data);
    }
  };

  const handleEditDiscente = (discente) => {
    setDiscenteForm({
      nome: discente.nome,
      email: discente.email || '',
      whatsapp: discente.whatsapp || '',
      titulo: discente.titulo,
      numero_turma: discente.numero_turma || '',
      cargo_atual: discente.cargo_atual || '',
      empresa: discente.empresa || '',
      status_carreira: discente.status_carreira || '',
      sobre: discente.sobre || '',
      tags_competencia: discente.tags_competencia || [],
      foto_url: discente.foto_url || '',
      instagram: discente.instagram || '',
      linkedin: discente.linkedin || '',
      lattes: discente.lattes || '',
      site: discente.site || '',
      especializacoes: discente.especializacoes || [],
      parceiros: discente.parceiros || [],
      ordem: discente.ordem || 0
    });
    setEditingDiscente(discente);
    setShowDiscenteForm(true);
  };

  const handleDeleteDiscente = (id) => {
    if (window.confirm('Tem certeza que deseja remover este aluno?')) {
      deleteDiscenteMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA POSTS ==========
  const resetPostForm = () => {
    setPostForm({
      titulo: '',
      data: '',
      descricao: '',
      conteudo_completo: '',
      midias: [],
      imagem_destaque: '',
      tags: [],
      categoria_principal: '',
      subcategoria: '',
      status: 'Rascunho',
      data_publicacao: '',
      especializacoes: [],
      ciclos: [],
      professores: [],
      parceiros: [],
      ordem: 0
    });
    setShowPostForm(false);
    setEditingPost(null);
    setNovaTag('');
  };

  const handleSavePost = () => {
    if (!postForm.titulo || !postForm.data || !postForm.descricao) {
      toast.error('Título, data e descrição são obrigatórios!');
      return;
    }

    if (postForm.status === 'Agendado' && !postForm.data_publicacao) {
      toast.error('Data de publicação é obrigatória para posts agendados!');
      return;
    }

    const data = {
      titulo: postForm.titulo,
      data: postForm.data,
      descricao: postForm.descricao,
      conteudo_completo: postForm.conteudo_completo,
      midias: postForm.midias,
      imagem_destaque: postForm.imagem_destaque,
      tags: postForm.tags,
      categoria_principal: postForm.categoria_principal,
      subcategoria: postForm.subcategoria,
      status: postForm.status,
      data_publicacao: postForm.data_publicacao,
      especializacoes: postForm.especializacoes,
      ciclos: postForm.ciclos,
      professores: postForm.professores,
      parceiros: postForm.parceiros,
      ordem: parseInt(postForm.ordem) || 0
    };

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data });
    } else {
      createPostMutation.mutate(data);
    }
  };

  const handleEditPost = (post) => {
    setPostForm({
      titulo: post.titulo,
      data: post.data,
      descricao: post.descricao,
      conteudo_completo: post.conteudo_completo || '',
      midias: post.midias || [],
      imagem_destaque: post.imagem_destaque || '',
      tags: post.tags || [],
      categoria_principal: post.categoria_principal || '',
      subcategoria: post.subcategoria || '',
      status: post.status || 'Rascunho',
      data_publicacao: post.data_publicacao || '',
      especializacoes: post.especializacoes || [],
      ciclos: post.ciclos || [],
      professores: post.professores || [],
      parceiros: post.parceiros || [],
      ordem: post.ordem || 0
    });
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Tem certeza que deseja remover este post?')) {
      deletePostMutation.mutate(id);
    }
  };



  // ========== HANDLERS PARA CRONOGRAMA ==========
  const resetCronogramaForm = () => {
    setCronogramaForm({
      data: '',
      tipo: 'Presencial',
      ciclo_id: '',
      disciplina_nome: '',
      professor_id: '',
      horario_inicio: '',
      horario_fim: '',
      observacoes: '',
      ordem: 0
    });
    setShowCronogramaForm(false);
    setEditingCronograma(null);
  };

  const handleSaveCronograma = () => {
    if (!cronogramaForm.data || !cronogramaForm.tipo) {
      toast.error('Data e tipo são obrigatórios!');
      return;
    }

    const data = {
      data: cronogramaForm.data,
      tipo: cronogramaForm.tipo,
      ciclo_id: cronogramaForm.ciclo_id,
      disciplina_nome: cronogramaForm.disciplina_nome,
      professor_id: cronogramaForm.professor_id,
      horario_inicio: cronogramaForm.horario_inicio,
      horario_fim: cronogramaForm.horario_fim,
      observacoes: cronogramaForm.observacoes,
      ordem: parseInt(cronogramaForm.ordem) || 0
    };

    if (editingCronograma) {
      updateCronogramaMutation.mutate({ id: editingCronograma.id, data });
    } else {
      createCronogramaMutation.mutate(data);
    }
  };

  const handleEditCronograma = (item) => {
    setCronogramaForm({
      data: item.data,
      tipo: item.tipo,
      ciclo_id: item.ciclo_id || '',
      disciplina_nome: item.disciplina_nome || '',
      professor_id: item.professor_id || '',
      horario_inicio: item.horario_inicio || '',
      horario_fim: item.horario_fim || '',
      observacoes: item.observacoes || '',
      ordem: item.ordem || 0
    });
    setEditingCronograma(item);
    setShowCronogramaForm(true);
  };

  const handleDeleteCronograma = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta aula do cronograma?')) {
      deleteCronogramaMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA PROJETO ==========
  const resetProjetoForm = () => {
    setProjetoForm({
      nome_projeto: '',
      coordenador: '',
      objetivo_geral: '',
      justificativa: '',
      tipo_projeto: 'Incubadora Profissional',
      ano_projeto: new Date().getFullYear(),
      especializacoes: []
    });
    setShowProjetoForm(false);
    setEditingProjeto(null);
  };

  const handleSaveProjeto = (e) => {
    e.preventDefault();
    
    if (!projetoForm.nome_projeto || !projetoForm.ano_projeto) {
      toast.error('Nome e ano do projeto são obrigatórios!');
      return;
    }

    const data = {
      ...projetoForm,
      ano_projeto: parseInt(projetoForm.ano_projeto)
    };

    if (editingProjeto) {
      updateProjetoMutation.mutate({ id: editingProjeto.id, data });
    } else {
      createProjetoMutation.mutate(data);
    }
  };

  const handleEditProjeto = (projeto) => {
    setProjetoForm(projeto);
    setEditingProjeto(projeto);
    setShowProjetoForm(true);
  };

  const handleDeleteProjeto = (id) => {
    if (window.confirm('Tem certeza que deseja remover este projeto?')) {
      deleteProjetoMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA CHATBOT FAQS ==========
  const resetFAQForm = () => {
    setFaqForm({
      pergunta: '',
      resposta: '',
      pagina_destino: '',
      categoria: 'Informações Gerais',
      ativo: true,
      ordem: 0
    });
    setShowFAQForm(false);
    setEditingFAQ(null);
  };

  const handleSaveFAQ = () => {
    if (!faqForm.pergunta || !faqForm.resposta) {
      toast.error('Pergunta e resposta são obrigatórios!');
      return;
    }

    const data = {
      pergunta: faqForm.pergunta,
      resposta: faqForm.resposta,
      pagina_destino: faqForm.pagina_destino,
      categoria: faqForm.categoria,
      ativo: faqForm.ativo,
      ordem: parseInt(faqForm.ordem) || 0
    };

    if (editingFAQ) {
      updateFAQMutation.mutate({ id: editingFAQ.id, data });
    } else {
      createFAQMutation.mutate(data);
    }
  };

  const handleEditFAQ = (faq) => {
    setFaqForm({
      pergunta: faq.pergunta,
      resposta: faq.resposta,
      pagina_destino: faq.pagina_destino || '',
      categoria: faq.categoria,
      ativo: faq.ativo !== false,
      ordem: faq.ordem || 0
    });
    setEditingFAQ(faq);
    setShowFAQForm(true);
  };

  const handleDeleteFAQ = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta FAQ?')) {
      deleteFAQMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA LEADS ==========
  const handleEditLead = (lead) => {
    setEditingLead(lead);
  };

  const handleSaveLead = (leadId, data) => {
    updateLeadMutation.mutate({ id: leadId, data });
  };

  const handleDeleteLead = (id) => {
    if (window.confirm('Tem certeza que deseja remover este lead?')) {
      deleteLeadMutation.mutate(id);
    }
  };

  // ========== HANDLERS PARA ANÁLISE DE CURSOS ==========
  const handleEspecializacaoExistenteChange = (especId) => {
    if (!especId || especId === 'nova') {
      // Resetar para nova análise
      setAnaliseForm({
        nome_proposto: '',
        ciclos_selecionados: [],
        especializacao_existente_id: null
      });
      setAnaliseResult(null); // Clear previous analysis result
      setDisciplinasEditaveis({});
      setDisciplinasSelecionadas({});
      setIncluindoDisciplinas({});
      return;
    }

    const espec = especializacoes.find(e => e.id === especId);
    if (espec) {
      setAnaliseForm({
        nome_proposto: espec.nome,
        ciclos_selecionados: espec.ciclos || [],
        especializacao_existente_id: especId
      });
      setAnaliseResult(null); // Clear previous analysis result
      setDisciplinasEditaveis({});
      setDisciplinasSelecionadas({});
      setIncluindoDisciplinas({});
    }
  };

  const handleAnaliseCicloCheckbox = (cicloId) => {
    // Desabilitar se uma especialização existente estiver selecionada
    if (analiseForm.especializacao_existente_id) return;

    setAnaliseForm(prev => ({
      ...prev,
      ciclos_selecionados: prev.ciclos_selecionados.includes(cicloId)
        ? prev.ciclos.filter(id => id !== cicloId)
        : [...prev.ciclos_selecionados, cicloId]
    }));
  };

  const calcularCargaHorariaTotal = () => {
    return analiseForm.ciclos_selecionados.reduce((total, cicloId) => {
      const ciclo = ciclos.find(c => c.id === cicloId);
      return total + (ciclo?.carga_horaria || 0);
    }, 0);
  };

  const handleAvaliarViabilidade = async () => {
    if (analiseForm.ciclos_selecionados.length === 0) {
      toast.error('Selecione pelo menos um ciclo para análise!');
      return;
    }

    setLoadingAnalise(true);
    setAnaliseResult(null);
    setDisciplinasEditaveis({});
    setDisciplinasSelecionadas({});
    setIncluindoDisciplinas({});

    try {
      // Buscar detalhes completos dos ciclos selecionados
      const ciclosDetalhados = analiseForm.ciclos_selecionados.map(cicloId => {
        const ciclo = ciclos.find(c => c.id === cicloId);
        return {
          id: cicloId,
          nome: ciclo?.nome || '',
          carga_horaria: ciclo?.carga_horaria || 0,
          disciplinas: ciclo?.disciplinas || []
        };
      });

      // Separar ciclos COM disciplinas e SEM disciplinas
      const ciclosComDisciplinas = ciclosDetalhados.filter(c => c.disciplinas && c.disciplinas.length > 0);
      const ciclosSemDisciplinas = ciclosDetalhados.filter(c => !c.disciplinas || c.disciplinas.length === 0);

      // Construir texto dos ciclos COM disciplinas
      const ciclosComDisciplinasTexto = ciclosComDisciplinas.map((c, idx) => {
        const disciplinasTexto = c.disciplinas
          .map(d => {
            if (typeof d === 'string') return d;
            if (d && typeof d === 'object' && d.nome) return d.nome;
            return 'Disciplina sem nome';
          })
          .join(', ');
        return `\n${idx + 1}. **${c.nome}** (${c.carga_horaria}h)\n   Disciplinas: ${disciplinasTexto}`;
      }).join('\n');

      // Construir texto dos ciclos SEM disciplinas
      const ciclosSemDisciplinasTexto = ciclosSemDisciplinas.map((c, idx) => {
        return `\n${idx + 1}. **${c.nome}** (${c.carga_horaria}h) - [SEM DISCIPLINAS CADASTRADAS]`;
      }).join('\n');

      const nomeProposto = analiseForm.nome_proposto || 'Nova Pós-Graduação';
      const cargaHorariaTotal = calcularCargaHorariaTotal();
      const isReanalise = analiseForm.especializacao_existente_id !== null;

      const prompt = `Você é um especialista em currículos acadêmicos de pós-graduação em Arquitetura e Engenharia Civil, com vasta experiência em análise de mercado educacional no Brasil.

**TAREFA:** Analisar a viabilidade de uma ${isReanalise ? 'pós-graduação EXISTENTE' : 'nova pós-graduação'} com base nos ciclos de conhecimento selecionados e realizar uma análise de mercado comparativa.

**INFORMAÇÕES DA PÓS-GRADUAÇÃO ${isReanalise ? '(REAVALIAÇÃO)' : 'PROPOSTA'}:**
- Nome/Foco: ${nomeProposto}
- Carga Horária Total: ${cargaHorariaTotal} horas

**CICLOS COM DISCIPLINAS JÁ DEFINIDAS:**${ciclosComDisciplinas.length > 0 ? ciclosComDisciplinasTexto : '\n(Nenhum ciclo possui disciplinas cadastradas)'}

**CICLOS SEM DISCIPLINAS CADASTRADAS:**${ciclosSemDisciplinas.length > 0 ? ciclosSemDisciplinasTexto : '\n(Todos os ciclos possuem disciplinas cadastradas)'}

---

**INSTRUÇÕES IMPORTANTES:**
- A análise de CONFLITOS e SINERGIA deve ser feita APENAS com base nos ciclos que possuem disciplinas cadastradas (listados em "CICLOS COM DISCIPLINAS JÁ DEFINIDAS")
- A falta de disciplinas em um ciclo NÃO é um conflito - é apenas uma oportunidade para sugestões
- Sugestões de disciplinas devem ser feitas APENAS para os ciclos listados em "CICLOS SEM DISCIPLINAS CADASTRADAS"

---

**ANÁLISE SOLICITADA:**

1. **RESUMO EXECUTIVO:** Crie um resumo estratégico de 3-4 parágrafos que responda:
   - Os ciclos selecionados possuem boa sinergia entre si?
   - Este curso é viável do ponto de vista de mercado?
   - Trata-se de uma tendência crescente ou há demanda consolidada por este tipo de formação?
   - Qual o posicionamento competitivo deste curso em relação aos similares do mercado?

2. **SINERGIA GERAL:** Analise como os ciclos se complementam.
   ${ciclosComDisciplinas.length > 0 ? 'Baseie sua análise principalmente nos ciclos COM disciplinas cadastradas.' : ''}
   ${ciclosSemDisciplinas.length > 0 ? `Para os ${ciclosSemDisciplinas.length} ciclo(s) sem disciplinas, faça uma análise mais superficial baseada apenas no título.` : ''}

3. **CONFLITOS POTENCIAIS:** 
   **ATENÇÃO: Analise conflitos APENAS entre os conteúdos das disciplinas dos ciclos que JÁ POSSUEM disciplinas cadastradas.**
   **NÃO mencione a falta de disciplinas como um conflito. A ausência de disciplinas será tratada na seção 6.**
   
   Para cada conflito de conteúdo ou abordagem contraditória identificado ENTRE AS DISCIPLINAS EXISTENTES:
   - Descreva claramente o conflito
   - Sugira uma estratégia específica de como mitigar ou resolver esse conflito
   ${!isReanalise ? '- Como se trata de um curso novo, seja especialmente detalhado nas estratégias de mitigação' : ''}
   
   ${ciclosComDisciplinas.length === 0 ? '**Como nenhum ciclo possui disciplinas cadastradas, não há conflitos a serem analisados. Deixe esta seção vazia.**' : ''}

4. **DUPLICIDADES IDENTIFICADAS:** 
   Liste disciplinas ou tópicos que aparecem repetidos desnecessariamente ENTRE OS CICLOS QUE JÁ POSSUEM DISCIPLINAS.
   ${ciclosComDisciplinas.length === 0 ? 'Como nenhum ciclo possui disciplinas, não há duplicidades a serem identificadas.' : ''}

5. **SUGESTÕES DE OTIMIZAÇÃO:** 
   Forneça recomendações práticas para melhorar o currículo${!isReanalise ? ', estruturando cada sugestão como uma mudança concreta' : ''}.
   ${ciclosComDisciplinas.length > 0 ? 'Base suas sugestões principalmente nos ciclos que já possuem disciplinas.' : ''}

6. **SUGESTÕES DE DISCIPLINAS PARA CICLOS VAZIOS:** 
   ${ciclosSemDisciplinas.length > 0 ? `
   **🚨 ATENÇÃO CRÍTICA: Sugira disciplinas EXCLUSIVAMENTE para os ${ciclosSemDisciplinas.length} ciclo(s) listados abaixo em "CICLOS SEM DISCIPLINAS CADASTRADAS". NÃO sugira disciplinas para nenhum outro ciclo.**
   
   Ciclos que DEVEM receber sugestões:
   ${ciclosSemDisciplinasTexto}
   
   Para CADA UM destes ciclos acima:
   - Liste 5-7 disciplinas que seriam adequadas
   - Para cada disciplina, explique brevemente (1-2 frases) a justificativa com base em:
     * O título do ciclo
     * A análise de mercado
     * As tendências de pós-graduação na área
     * A sinergia com os demais ciclos do curso
   ` : '**Não há ciclos sem disciplinas nesta análise. Deixe este campo vazio ou retorne um array vazio.**'}

7. **ANÁLISE DE MERCADO:** Pesquise na internet por cursos de pós-graduação similares ou concorrentes no mercado brasileiro. Para cada curso encontrado, forneça:
   - Nome do Curso
   - Instituição/Universidade que oferece
   - URL da página oficial do curso (se disponível)
   - Principais Disciplinas (lista resumida de 4-6 disciplinas-chave)
   - Formato (Presencial, Remoto (ao vivo), Gravada, Híbrido ou Não Informado)
   - Duração (em meses, ou "Não Informado")
   - Valor do Curso (formato: "R$ X,XX/mês", "R$ X.XXX,XX total", "a partir de R$ X", ou "Consultar")

Seja detalhado, prático e objetivo na análise.`;

      const responseSchema = {
        type: "object",
        properties: {
          resumo_executivo: {
            type: "string",
            description: "Resumo executivo estratégico sobre sinergia, viabilidade de mercado e tendências"
          },
          sinergia_geral: {
            type: "string",
            description: "Análise detalhada da sinergia entre os ciclos selecionados"
          },
          conflitos_potenciais: {
            type: "array",
            items: {
              type: "object",
              properties: {
                conflito: {
                  type: "string",
                  description: "Descrição clara do conflito identificado ENTRE DISCIPLINAS EXISTENTES"
                },
                mitigacao_sugerida: {
                  type: "string",
                  description: "Estratégia específica para mitigar ou resolver o conflito"
                }
              },
              required: ["conflito", "mitigacao_sugerida"]
            },
            description: "Lista de potenciais conflitos ENTRE CONTEÚDOS EXISTENTES com estratégias de mitigação. NÃO incluir ausência de disciplinas como conflito."
          },
          duplicidades_identificadas: {
            type: "array",
            items: { type: "string" },
            description: "Lista de disciplinas ou tópicos duplicados ENTRE OS CICLOS COM DISCIPLINAS"
          },
          sugestoes_otimizacao: {
            type: "array",
            items: { type: "string" },
            description: "Lista clara e acionável de mudanças recomendadas"
          },
          sugestoes_disciplinas_ciclos_vazios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nome_ciclo: {
                  type: "string",
                  description: "Nome EXATO do ciclo sem disciplinas cadastradas, conforme listado na seção CICLOS SEM DISCIPLINAS CADASTRADAS"
                },
                disciplinas_sugeridas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      disciplina: {
                        type: "string",
                        description: "Nome da disciplina sugerida"
                      },
                      justificativa: {
                        type: "string",
                        description: "Justificativa para inclusão desta disciplina (1-2 frases)"
                      }
                    },
                    required: ["disciplina", "justificativa"]
                  }
                }
              },
              required: ["nome_ciclo", "disciplinas_sugeridas"]
            },
            description: "Sugestões de disciplinas APENAS para ciclos que NÃO possuem disciplinas cadastradas"
          },
          analise_mercado: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nome_curso_mercado: { type: "string" },
                instituicao: { type: "string" },
                url_curso: {
                  type: "string",
                  description: "URL da página oficial do curso, se disponível"
                },
                disciplinas_principais: {
                  type: "array",
                  items: { type: "string" }
                },
                formato: {
                  type: "string",
                  enum: ["Presencial", "Remoto (ao vivo)", "Gravada", "Híbrido", "Não Informado"]
                },
                duracao: { type: "string" },
                valor: { type: "string" }
              }
            },
            description: "Análise de cursos similares no mercado com links externos"
          }
        }
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: responseSchema
      });

      setAnaliseResult(response);

      // Inicializar estado de disciplinas editáveis com as sugestões da IA
      if (response.sugestoes_disciplinas_ciclos_vazios && response.sugestoes_disciplinas_ciclos_vazios.length > 0) {
        const editaveisInit = {};
        const selecionadasInit = {};
        
        response.sugestoes_disciplinas_ciclos_vazios.forEach((cicloSugestao) => {
          const nomeCiclo = cicloSugestao.nome_ciclo;
          editaveisInit[nomeCiclo] = {};
          selecionadasInit[nomeCiclo] = {};
          
          (cicloSugestao.disciplinas_sugeridas || []).forEach((disc, idx) => {
            editaveisInit[nomeCiclo][idx] = disc.disciplina;
            selecionadasInit[nomeCiclo][idx] = false;
          });
        });
        
        setDisciplinasEditaveis(editaveisInit);
        setDisciplinasSelecionadas(selecionadasInit);
      }

      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      toast.error('Erro na análise de viabilidade: ' + (error.message || 'Erro desconhecido'));
      console.error('Erro na análise de viabilidade:', error);
    } finally {
      setLoadingAnalise(false);
    }
  };

  const handleDisciplinaCheckboxChange = (nomeCiclo, disciplinaIdx) => {
    setDisciplinasSelecionadas(prev => ({
      ...prev,
      [nomeCiclo]: {
        ...prev[nomeCiclo],
        [disciplinaIdx]: !prev[nomeCiclo][disciplinaIdx]
      }
    }));
  };

  const handleDisciplinaInputChange = (nomeCiclo, disciplinaIdx, novoNome) => {
    setDisciplinasEditaveis(prev => ({
      ...prev,
      [nomeCiclo]: {
        ...prev[nomeCiclo],
        [disciplinaIdx]: novoNome
      }
    }));
  };

  const handleIncluirDisciplinasNoCiclo = async (nomeCiclo) => {
    // Encontrar o ciclo pelo nome
    const ciclo = ciclos.find(c => c.nome === nomeCiclo);
    if (!ciclo) {
      toast.error(`Ciclo "${nomeCiclo}" não encontrado!`);
      return;
    }

    // Coletar disciplinas selecionadas
    const disciplinasParaIncluir = [];
    Object.keys(disciplinasSelecionadas[nomeCiclo] || {}).forEach(idx => {
      if (disciplinasSelecionadas[nomeCiclo][idx]) {
        const nomeDisciplina = disciplinasEditaveis[nomeCiclo][idx];
        if (nomeDisciplina && nomeDisciplina.trim()) {
          disciplinasParaIncluir.push(nomeDisciplina.trim());
        }
      }
    });

    if (disciplinasParaIncluir.length === 0) {
      toast.error('Selecione pelo menos uma disciplina para incluir!');
      return;
    }

    setIncluindoDisciplinas(prev => ({ ...prev, [nomeCiclo]: true }));

    try {
      // Atualizar o ciclo com as novas disciplinas
      const disciplinasAtuais = Array.isArray(ciclo.disciplinas) ? ciclo.disciplinas : [];
      const novasDisciplinas = [...new Set([...disciplinasAtuais, ...disciplinasParaIncluir])]; // Use Set to avoid duplicates

      await updateCicloMutation.mutateAsync({
        id: ciclo.id,
        data: {
          disciplinas: novasDisciplinas
        }
      });

      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });

      toast.success(`${disciplinasParaIncluir.length} disciplina(s) incluída(s) com sucesso no ciclo "${nomeCiclo}"!`);

      // Desmarcar as disciplinas que foram incluídas
      setDisciplinasSelecionadas(prev => {
        const novo = { ...prev };
        if (novo[nomeCiclo]) {
          Object.keys(novo[nomeCiclo]).forEach(idx => {
            if (novo[nomeCiclo][idx]) {
              novo[nomeCiclo][idx] = false;
            }
          });
        }
        return novo;
      });

    } catch (error) {
      toast.error('Erro ao incluir disciplinas: ' + (error.message || 'Erro desconhecido'));
      console.error('Erro ao incluir disciplinas:', error);
    } finally {
      setIncluindoDisciplinas(prev => ({ ...prev, [nomeCiclo]: false }));
    }
  };

  const resetAnaliseForm = () => {
    setAnaliseForm({ nome_proposto: '', ciclos_selecionados: [], especializacao_existente_id: null });
    setAnaliseResult(null);
    setDisciplinasEditaveis({});
    setDisciplinasSelecionadas({});
    setIncluindoDisciplinas({});
  };

  const handleCriarNovaEspecializacao = () => {
    if (!analiseResult) return;

    // Construir descrição completa a partir dos ciclos selecionados de forma segura
    const ciclosDetalhes = analiseForm.ciclos_selecionados.map(cicloId => {
      const ciclo = ciclos.find(c => c.id === cicloId);
      if (!ciclo) return '';
      
      let texto = `**${ciclo.nome}** (${ciclo.carga_horaria}h)\n`;
      if (ciclo.disciplinas && ciclo.disciplinas.length > 0) {
        const disciplinasTexto = ciclo.disciplinas
          .map(d => {
            if (typeof d === 'string') return d;
            if (d && typeof d === 'object' && d.nome) return d.nome;
            return '';
          })
          .filter(Boolean)
          .join(', ');
        texto += `Disciplinas: ${disciplinasTexto}\n\n`;
      } else {
        texto += '\n';
      }
      return texto;
    }).join('');
    
    const descricaoCompleta = `${analiseResult.resumo_executivo || ''}\n\n---\n\nCICLOS QUE COMPÕEM ESTA ESPECIALIZAÇÃO:\n\n${ciclosDetalhes}`;

    // Pré-preencher formulário de especialização
    setEspecForm({
      nome: analiseForm.nome_proposto || '',
      carga_horaria_total: calcularCargaHorariaTotal().toString(),
      ciclos: [...analiseForm.ciclos_selecionados],
      professores: [],
      parceiros: [],
      tecnologias: [],
      link_externo: '',
      link_inscricao: '',
      link_matricula: '',
      resumo: analiseResult.resumo_executivo || '',
      descricao_completa_ia: descricaoCompleta,
      periodo_inscricao: '',
      data_inicio: '',
      status_inscricao: 'Inscrições Abertas',
      condicoes_pagamento: [],
      formato_aulas: [],
      dias_aulas: [],
      horario_inicio: '',
      horario_fim: '',
      duracao_meses: '',
      ordem: especializacoes.length
    });

    // Mudar para aba de especializações e abrir formulário
    setActiveTab('especializacoes');
    setShowEspecForm(true);
    setEditingEspec(null);

    toast.success('Formulário de nova especialização preenchido! Revise e complete os dados.');
  };

  const handleDownloadAnalisePDF = async () => {
    setIsGeneratingAnalisePDF(true);
    try {
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 2px solid #16a34a;">
          <img src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" alt="ESUDA Logo" style="height: 48px;" />
          <div style="text-align: right;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Análise de Viabilidade de Pós-Graduação</h1>
            <p style="font-size: 14px; color: #666; margin: 0;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        ${analiseResult.resumo_executivo ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #4338ca;">Resumo Executivo</h2>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: justify;">${analiseResult.resumo_executivo}</p>
        ` : ''}

        ${analiseResult.sinergia_geral ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #16a34a;">Sinergia Geral</h2>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: justify;">${analiseResult.sinergia_geral}</p>
        ` : ''}

        ${analiseResult.conflitos_potenciais && analiseResult.conflitos_potenciais.length > 0 ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #dc2626;">Conflitos Potenciais</h2>
          <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
            ${analiseResult.conflitos_potenciais.map(item => `
              <li style="margin-bottom: 15px; border-left: 3px solid #dc2626; padding-left: 10px;">
                <p style="font-weight: bold; margin: 0; font-size: 14px;">${item.conflito}</p>
                <p style="font-size: 13px; color: #4b5563; margin-top: 5px; text-align: justify;">Estratégia de Mitigação: ${item.mitigacao_sugerida}</p>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        ${analiseResult.duplicidades_identificadas && analiseResult.duplicidades_identificadas.length > 0 ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #d97706;">Duplicidades Identificadas</h2>
          <ul style="list-style: disc; margin-left: 20px; margin-bottom: 20px; font-size: 14px;">
            ${analiseResult.duplicidades_identificadas.map(dup => `<li>${dup}</li>`).join('')}
          </ul>
        ` : ''}

        ${analiseResult.sugestoes_otimizacao && analiseResult.sugestoes_otimizacao.length > 0 ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #2563eb;">Sugestões de Otimização</h2>
          <ul style="list-style: disc; margin-left: 20px; margin-bottom: 20px; font-size: 14px;">
            ${analiseResult.sugestoes_otimizacao.map(sug => `<li>${sug}</li>`).join('')}
          </ul>
        ` : ''}

        ${analiseResult.sugestoes_disciplinas_ciclos_vazios && analiseResult.sugestoes_disciplinas_ciclos_vazios.length > 0 ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #f59e0b;">Sugestões de Disciplinas para Ciclos sem Conteúdo</h2>
          ${analiseResult.sugestoes_disciplinas_ciclos_vazios.map(cicloSugestao => `
            <h3 style="font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #f59e0b;">📚 ${cicloSugestao.nome_ciclo}</h3>
            <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
              ${cicloSugestao.disciplinas_sugeridas.map(disc => `
                <li style="margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 10px;">
                  <p style="font-weight: bold; margin: 0; font-size: 14px;">${disc.disciplina}</p>
                  <p style="font-size: 13px; color: #4b5563; margin-top: 5px; text-align: justify;">${disc.justificativa}</p>
                </li>
              `).join('')}
            </ul>
          `).join('')}
        ` : ''}

        ${analiseResult.analise_mercado && analiseResult.analise_mercado.length > 0 ? `
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #6d28d9;">Análise de Mercado - Cursos Similares</h2>
          ${analiseResult.analise_mercado.map(curso => `
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
              <h3 style="font-size: 16px; font-weight: bold; margin: 0;">${curso.url_curso ? `<a href="${curso.url_curso}" target="_blank" rel="noopener noreferrer" style="color: #6d28d9; text-decoration: underline;">${curso.nome_curso_mercado}</a>` : curso.nome_curso_mercado}</h3>
              <p style="font-size: 13px; color: #4b5563;">${curso.instituicao}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${curso.formato ? `<span style="font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 9999px; background-color: #e0f2fe; color: #0369a1;">${curso.formato}</span>` : ''}
                ${curso.duracao ? `<span style="font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 9999px; background-color: #f0fdf4; color: #16a34a;">Duração: ${curso.duracao}</span>` : ''}
                ${curso.valor ? `<span style="font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 9999px; background-color: #fffbeb; color: #d97706;">Valor: ${curso.valor}</span>` : ''}
              </div>
              ${curso.disciplinas_principais && curso.disciplinas_principais.length > 0 ? `
                <p style="font-size: 13px; font-weight: 600; color: #4b5563; margin-top: 10px; margin-bottom: 5px;">Disciplinas Principais:</p>
                <ul style="list-style: disc; margin-left: 20px; font-size: 13px; color: #4b5563;">
                  ${curso.disciplinas_principais.map(disc => `<li>${disc}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}
      `;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `analise-viabilidade-${analiseForm.nome_proposto.toLowerCase().replace(/\s+/g, '-') || 'curso'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Análise de curso baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF da análise:', error);
      toast.error('Erro ao baixar a análise de curso.');
    } finally {
      setIsGeneratingAnalisePDF(false);
    }
  };


  const handleCriarFAQDePergunta = (pergunta) => {
    setFaqForm({
      pergunta: pergunta.pergunta,
      resposta: '',
      pagina_destino: '',
      categoria: 'Informações Gerais',
      ativo: true,
      ordem: chatbotFAQs.length
    });
    setShowFAQForm(true);
    setEditingFAQ(null);
  };

  // ========== RENDER TABS ==========
  const renderCiclosTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Ciclos de Conhecimento</h3>
        <Button
          onClick={() => setShowCicloForm(!showCicloForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Ciclo
        </Button>
      </div>



      {showCicloForm && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingCiclo ? 'Editar Ciclo' : 'Novo Ciclo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome do Ciclo</label>
              <Input
                value={cicloForm.nome}
                onChange={(e) => setCicloForm({...cicloForm, nome: e.target.value})}
                placeholder="Ex: Ciclo de Gestão de Projetos e Obras"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Carga Horária (horas)</label>
              <Input
                type="number"
                value={cicloForm.carga_horaria}
                onChange={(e) => setCicloForm({...cicloForm, carga_horaria: e.target.value})}
                placeholder="120"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">Disciplinas do Ciclo</label>
                <Button
                  onClick={handleAddDisciplina}
                  size="sm"
                  variant="outline"
                  type="button"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Disciplina
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cicloForm.disciplinas.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg">
                    Nenhuma disciplina adicionada. Clique em "Adicionar Disciplina" para começar.
                  </p>
                ) : (
                  cicloForm.disciplinas.map((disciplina, index) => (
                    <DisciplinaFormFields
                      key={index}
                      disciplina={disciplina}
                      index={index}
                      onChange={handleDisciplinaChange}
                      onRemove={handleRemoveDisciplina}
                    />
                  ))
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={cicloForm.ordem}
                onChange={(e) => setCicloForm({...cicloForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCiclo} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetCicloForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loadingCiclos ? (
          <p className="text-gray-600">Carregando ciclos...</p>
        ) : ciclos.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum ciclo cadastrado ainda.</p>
        ) : (
          ciclos.map((ciclo) => (
            <Card key={ciclo.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">
                      {ciclo.nome} ({ciclo.carga_horaria}h)
                    </h4>
                    {ciclo.disciplinas && ciclo.disciplinas.length > 0 && (
                     <ul className="text-sm text-gray-600 ml-4 list-disc">
                       {ciclo.disciplinas.slice(0, 3).map((d, i) => {
                         const nomeDisciplina = typeof d === 'string' ? d : (d?.nome || 'Sem nome');
                         return <li key={i}>{nomeDisciplina}</li>;
                       })}
                       {ciclo.disciplinas.length > 3 && (
                         <li className="italic">+ {ciclo.disciplinas.length - 3} disciplinas</li>
                       )}
                     </ul>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditCiclo(ciclo)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteCiclo(ciclo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderEspecializacoesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Especializações</h3>
        <Button
          onClick={() => setShowEspecForm(!showEspecForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Especialização
        </Button>
      </div>



      {showEspecForm && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingEspec ? 'Editar Especialização' : 'Nova Especialização'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome da Especialização</label>
              <Input
                value={especForm.nome}
                onChange={(e) => setEspecForm({...especForm, nome: e.target.value})}
                placeholder="Ex: Gestão de Projetos e Obras"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Carga Horária Total (h) - Auto-calculado</label>
                <Input
                  type="number"
                  value={especForm.carga_horaria_total}
                  readOnly
                  className="bg-gray-100"
                  placeholder="Será calculado automaticamente"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
                <Input
                  type="number"
                  value={especForm.ordem}
                  onChange={(e) => setEspecForm({...especForm, ordem: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Link Externo (Página ESUDA)</label>
                <Input
                  value={especForm.link_externo}
                  onChange={(e) => setEspecForm({...especForm, link_externo: e.target.value})}
                  placeholder="https://esuda.edu.br/posgraduacao/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Link Inscreva-se agora</label>
                <Input
                  value={especForm.link_inscricao}
                  onChange={(e) => setEspecForm({...especForm, link_inscricao: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Link Matricule-se</label>
                <Input
                  value={especForm.link_matricula}
                  onChange={(e) => setEspecForm({...especForm, link_matricula: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Informações Gerais do Curso</h4>
              
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">Formato das Aulas (selecione um ou mais)</label>
                <div className="flex flex-wrap gap-2">
                  {['Presencial', 'Remoto (ao vivo)', 'Gravadas'].map((formato) => (
                    <label key={formato} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={especForm.formato_aulas.includes(formato)}
                        onChange={() => handleFormatoAulaCheckboxChange(formato)}
                        className="rounded"
                      />
                      <span className="text-sm">{formato}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Horário de Início</label>
                  <Input
                    type="time"
                    value={especForm.horario_inicio}
                    onChange={(e) => setEspecForm({...especForm, horario_inicio: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Horário de Término</label>
                  <Input
                    type="time"
                    value={especForm.horario_fim}
                    onChange={(e) => setEspecForm({...especForm, horario_fim: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Duração (meses)</label>
                  <Input
                    type="number"
                    value={especForm.duracao_meses}
                    onChange={(e) => setEspecForm({...especForm, duracao_meses: e.target.value})}
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Dias das Aulas</label>
                <div className="flex flex-wrap gap-2">
                  {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((dia) => (
                    <label key={dia} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={especForm.dias_aulas.includes(dia)}
                        onChange={() => handleDiaAulaCheckboxChange(dia)}
                        className="rounded"
                      />
                      <span className="text-sm">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Período de Inscrição/Matrícula</label>
                <Input
                  value={especForm.periodo_inscricao}
                  onChange={(e) => setEspecForm({...especForm, periodo_inscricao: e.target.value})}
                  placeholder="01/01/2025 a 31/01/2025"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data de Início das Aulas</label>
                <Input
                  value={especForm.data_inicio}
                  onChange={(e) => setEspecForm({...especForm, data_inicio: e.target.value})}
                  placeholder="25/10/2025"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Status de Inscrições/Matrículas</label>
              <Select
                value={especForm.status_inscricao}
                onValueChange={(value) => setEspecForm({...especForm, status_inscricao: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                  <SelectItem value="Matrículas Abertas">Matrículas Abertas</SelectItem>
                  <SelectItem value="Turma Iniciada (Aceitando novos alunos)">Turma Iniciada (Aceitando novos alunos)</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Aguardando Nova Turma">Aguardando Nova Turma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Condições de Pagamento (até 4)</label>
                <Button
                  onClick={handleAddCondicaoPagamento}
                  size="sm"
                  variant="outline"
                  disabled={especForm.condicoes_pagamento.length >= 4}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Condição
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {especForm.condicoes_pagamento.map((cond, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-600">Condição {index + 1}</span>
                      <Button
                        onClick={() => handleRemoveCondicaoPagamento(index)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={cond.descricao}
                      onChange={(e) => handleCondicaoPagamentoChange(index, 'descricao', e.target.value)}
                      placeholder="Ex: 10x de R$ 249,00"
                      className="text-sm"
                    />
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cond.destaque}
                        onChange={(e) => handleCondicaoPagamentoChange(index, 'destaque', e.target.checked)}
                        className="rounded"
                      />
                      <Star className={`w-4 h-4 ${cond.destaque ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-xs text-gray-600">Melhor condição</span>
                    </label>
                  </div>
                ))}
              </div>
              {especForm.condicoes_pagamento.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-md">
                  Nenhuma condição de pagamento cadastrada. Clique em "Adicionar Condição" para começar.
                </p>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Geração Inteligente de Resumo
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição Completa para IA</label>
                  <Textarea
                    value={especForm.descricao_completa_ia}
                    onChange={(e) => setEspecForm({...especForm, descricao_completa_ia: e.target.value})}
                    rows={8}
                    placeholder="Cole aqui o texto completo e detalhado do curso (apresentação, diferenciais, mercado de trabalho, etc.). A IA irá gerar um resumo publicitário conciso e atraente..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleGenerateResumo}
                  disabled={generatingResumo || !especForm.descricao_completa_ia}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generatingResumo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Gerando resumo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Resumo Publicitário com IA
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Resumo do Curso (Publicitário)</label>
              <Textarea
                value={especForm.resumo}
                onChange={(e) => setEspecForm({...especForm, resumo: e.target.value})}
                rows={6}
                placeholder="Este campo será preenchido automaticamente pela IA, mas você pode editá-lo manualmente..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Dica: Use o botão de IA acima para gerar automaticamente ou edite manualmente.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Ciclos que compõem a especialização</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {ciclos.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum ciclo cadastrado. Cadastre ciclos primeiro.</p>
                ) : (
                  ciclos.map((ciclo) => (
                    <label key={ciclo.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={especForm.ciclos.includes(ciclo.id)}
                        onChange={() => handleCicloCheckboxChange(ciclo.id)}
                      />
                      <span className="text-sm">{ciclo.nome} ({ciclo.carga_horaria}h)</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Professores vinculados</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {professores.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum professor cadastrado.</p>
                ) : (
                  professores.map((professor) => (
                    <label key={professor.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={especForm.professores.includes(professor.id)}
                        onChange={() => handleProfessorCheckboxChange(professor.id)}
                      />
                      <span className="text-sm">{professor.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Parceiros vinculados</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {parceiros.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum parceiro cadastrado.</p>
                ) : (
                  parceiros.map((parceiro) => (
                    <label key={parceiro.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={especForm.parceiros.includes(parceiro.id)}
                        onChange={() => handleParceiroCheckboxChange(parceiro.id)}
                      />
                      <span className="text-sm">{parceiro.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tecnologias utilizadas</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {tecnologias.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma tecnologia cadastrada.</p>
                ) : (
                  tecnologias.map((tecnologia) => (
                    <label key={tecnologia.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={especForm.tecnologias.includes(tecnologia.id)}
                        onChange={() => handleTecnologiaCheckboxChange(tecnologia.id)}
                      />
                      <span className="text-sm">{tecnologia.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEspec} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetEspecForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {especializacoes.length > 0 && (
          <SocialMediaGenerator especializacao={especializacoes[0]} />
        )}
        
        {loadingEspec ? (
          <p className="text-gray-600">Carregando especializações...</p>
        ) : especializacoes.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma especialização cadastrada ainda.</p>
        ) : (
          especializacoes.map((espec) => (
            <Card key={espec.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-800">
                          {espec.nome} ({espec.carga_horaria_total}h)
                        </h4>
                        {espec.link_externo && (
                          <a href={espec.link_externo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                          </a>
                        )}
                         {espec.link_inscricao && (
                          <a href={espec.link_inscricao} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Inscreva-se
                          </a>
                        )}
                        {espec.link_matricula && (
                          <a href={espec.link_matricula} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Matricule-se
                          </a>
                        )}
                        {espec.status_inscricao && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            espec.status_inscricao === 'Inscrições Abertas' ? 'bg-green-100 text-green-800' :
                            espec.status_inscricao === 'Matrículas Abertas' ? 'bg-teal-100 text-teal-800' :
                            espec.status_inscricao === 'Turma Iniciada (Aceitando novos alunos)' ? 'bg-purple-100 text-purple-800' :
                            espec.status_inscricao === 'Fechado' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {espec.status_inscricao}
                          </span>
                        )}
                      </div>
                    {espec.resumo && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{espec.resumo}</p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      {espec.formato_aulas && espec.formato_aulas.length > 0 && <p><strong>Formato:</strong> {espec.formato_aulas.join(', ')}</p>}
                      {espec.dias_aulas && espec.dias_aulas.length > 0 && (
                        <p><strong>Dias:</strong> {espec.dias_aulas.join(', ')}</p>
                      )}
                      {espec.horario_inicio && espec.horario_fim && (
                        <p><strong>Horário:</strong> {espec.horario_inicio} às {espec.horario_fim}</p>
                      )}
                      {espec.duracao_meses && espec.duracao_meses > 0 && <p><strong>Duração:</strong> {espec.duracao_meses} meses</p>}
                      {espec.periodo_inscricao && <p><strong>Inscrições:</strong> {espec.periodo_inscricao}</p>}
                      {espec.data_inicio && <p><strong>Início:</strong> {espec.data_inicio}</p>}
                      {espec.condicoes_pagamento && espec.condicoes_pagamento.length > 0 && (
                        <p><strong>Condições:</strong> {espec.condicoes_pagamento.length} opção(ões) de pagamento</p>
                      )}
                      {espec.ciclos && espec.ciclos.length > 0 && (
                        <p><strong>Ciclos:</strong> {espec.ciclos.length} ciclo(s)</p>
                      )}
                      {espec.professores && espec.professores.length > 0 && (
                        <p><strong>Professores:</strong> {espec.professores.length} professor(es)</p>
                      )}
                      {espec.parceiros && espec.parceiros.length > 0 && (
                        <p><strong>Parceiros:</strong> {espec.parceiros.length} parceiro(s)</p>
                      )}
                      {espec.tecnologias && espec.tecnologias.length > 0 && (
                        <p><strong>Tecnologias:</strong> {espec.tecnologias.length} tecnologia(s)</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditEspec(espec)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteEspec(espec.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  </div>
                  
                  <SocialMediaGenerator especializacao={espec} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderParceirosTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Parceiros</h3>
        <Button
          onClick={() => setShowParceiroForm(!showParceiroForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>



      {showParceiroForm && (
        <Card className="mb-6 bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingParceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome do Parceiro</label>
              <Input
                value={parceiroForm.nome}
                onChange={(e) => setParceiroForm({...parceiroForm, nome: e.target.value})}
                placeholder="Ex: Amorim TECH"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">Tipos de Parceria</label>
              <div className="bg-white p-4 rounded-md border space-y-3">
                {tiposParceiraOptions.map((option) => (
                  <div key={option.value} className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={!!selectedTiposParceria[option.value]}
                        onChange={() => handleTipoParceriaToggle(option.value)}
                      />
                      <span className="font-medium">{option.value}</span>
                    </label>
                    
                    {selectedTiposParceria[option.value] && option.needsQuantidade && (
                      <div className="ml-6">
                        <label className="text-xs font-medium text-gray-600">Quantidade</label>
                        <Input
                          type="number"
                          value={selectedTiposParceria[option.value].quantidade || ''}
                          onChange={(e) => handleTipoParceriaChange(option.value, 'quantidade', e.target.value)}
                          className="w-32"
                          min="0"
                        />
                      </div>
                    )}
                    
                    {selectedTiposParceria[option.value] && option.needsDiscount && (
                      <div className="ml-6">
                        <label className="text-xs font-medium text-gray-600">Desconto</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={selectedTiposParceria[option.value].desconto || ''}
                            onChange={(e) => handleTipoParceriaChange(option.value, 'desconto', e.target.value)}
                            className="w-32"
                            min="0"
                            max="100"
                          />
                          <span className="text-gray-600">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Logo do Parceiro</label>
              {parceiroForm.logo_url && (
                <div className="mb-2">
                  <img src={parceiroForm.logo_url} alt="Logo" loading="lazy" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  disabled={uploadingLogo}
                  className="flex-1"
                />
                <Button disabled={uploadingLogo} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLogo ? 'Enviando...' : 'Upload'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Instagram</label>
                <Input
                  value={parceiroForm.instagram}
                  onChange={(e) => setParceiroForm({...parceiroForm, instagram: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                <Input
                  value={parceiroForm.linkedin}
                  onChange={(e) => setParceiroForm({...parceiroForm, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Site</label>
              <Input
                value={parceiroForm.site}
                onChange={(e) => setParceiroForm({...parceiroForm, site: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Especializações Vinculadas</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {especializacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma especialização cadastrada.</p>
                ) : (
                  especializacoes.map((espec) => (
                    <label key={espec.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={parceiroForm.especializacoes.includes(espec.id)}
                        onChange={() => handleParceiroEspecCheckboxChange(espec.id)}
                      />
                      <span className="text-sm">{espec.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={parceiroForm.ordem}
                onChange={(e) => setParceiroForm({...parceiroForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveParceiro} className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetParceiroForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loadingParceiros ? (
          <p className="text-gray-600">Carregando parceiros...</p>
        ) : parceiros.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum parceiro cadastrado ainda.</p>
        ) : (
          parceiros.map((parceiro) => (
            <Card key={parceiro.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {parceiro.logo_url && (
                    <img src={parceiro.logo_url} alt={parceiro.nome} loading="lazy" className="w-20 h-20 rounded-lg object-cover border" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">{parceiro.nome}</h4>
                    <div className="space-y-1">
                      {parceiro.tipos_parceria?.map((tp, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          <strong>{tp.tipo}:</strong>{' '}
                          {tp.quantidade ? `${tp.quantidade} unidade(s)` : ''}
                          {tp.quantidade && tp.desconto ? ' e ' : ''}
                          {tp.desconto ? `${tp.desconto}% de desconto` : ''}
                          {!tp.quantidade && !tp.desconto ? 'Ativo' : ''}
                        </div>
                      ))}
                    </div>
                    {parceiro.especializacoes && parceiro.especializacoes.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Especializações:</strong> {parceiro.especializacoes.length} vinculada(s)
                      </div>
                    )}
                    <div className="text-xs text-gray-500 flex gap-3 mt-2">
                      {parceiro.instagram && <span>Instagram ✓</span>}
                      {parceiro.linkedin && <span>LinkedIn ✓</span>}
                      {parceiro.site && <span>Site ✓</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditParceiro(parceiro)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteParceiro(parceiro.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderTecnologiasTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Tecnologias</h3>
        <Button
          onClick={() => setShowTecnologiaForm(!showTecnologiaForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tecnologia
        </Button>
      </div>

      {showTecnologiaForm && (
        <Card className="mb-6 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingTecnologia ? 'Editar Tecnologia' : 'Nova Tecnologia'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome da Tecnologia</label>
              <Input
                value={tecnologiaForm.nome}
                onChange={(e) => setTecnologiaForm({...tecnologiaForm, nome: e.target.value})}
                placeholder="Ex: BIM (Autodesk Revit)"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Especializações que utilizam esta Tecnologia</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {especializacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma especialização cadastrada.</p>
                ) : (
                  especializacoes.map((espec) => (
                    <label key={espec.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={tecnologiaForm.especializacoes.includes(espec.id)}
                        onChange={() => handleTecnologiaEspecCheckboxChange(espec.id)}
                      />
                      <span className="text-sm">{espec.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={tecnologiaForm.ordem}
                onChange={(e) => setTecnologiaForm({...tecnologiaForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveTecnologia} className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetTecnologiaForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingTecnologias ? (
          <p className="text-gray-600">Carregando tecnologias...</p>
        ) : tecnologias.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">Nenhuma tecnologia cadastrada ainda.</p>
        ) : (
          tecnologias.map((tecnologia) => (
            <Card key={tecnologia.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">{tecnologia.nome}</h4>
                    {tecnologia.especializacoes && tecnologia.especializacoes.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Especializações:</strong> {tecnologia.especializacoes.length} vinculada(s)
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditTecnologia(tecnologia)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTecnologia(tecnologia.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderProfessoresTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Corpo Docente</h3>
        <Button
          onClick={() => setShowProfessorForm(!showProfessorForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Professor
        </Button>
      </div>



      {showProfessorForm && (
        <Card className="mb-6 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300 mb-4">
              <h4 className="text-sm font-bold text-yellow-900 mb-2">📧 Dados de Login (Obrigatório)</h4>
              <p className="text-xs text-yellow-800 mb-3">
                O e-mail cadastrado aqui será usado pelo professor para fazer login no sistema e acessar seu perfil.
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail de Login *</label>
                <Input
                  type="email"
                  value={professorForm.email}
                  onChange={(e) => setProfessorForm({...professorForm, email: e.target.value})}
                  placeholder="professor@email.com"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome Completo *</label>
                <Input
                  value={professorForm.nome}
                  onChange={(e) => setProfessorForm({...professorForm, nome: e.target.value})}
                  placeholder="Ex: Dr. João Silva"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Titulação *</label>
                <Input
                  value={professorForm.titulo}
                  onChange={(e) => setProfessorForm({...professorForm, titulo: e.target.value})}
                  placeholder="Ex: Doutor em Engenharia Civil"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp</label>
              <Input
                value={professorForm.whatsapp}
                onChange={(e) => setProfessorForm({...professorForm, whatsapp: e.target.value})}
                placeholder="Ex: 5581999999999"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mini Biografia</label>
              <Textarea
                value={professorForm.mini_bio}
                onChange={(e) => setProfessorForm({...professorForm, mini_bio: e.target.value})}
                rows={3}
                placeholder="Breve descrição da experiência profissional..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta biografia pode ser editada pelo próprio professor no perfil dele.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Foto do Professor</label>
              {professorForm.foto_url && (
                <div className="mb-2">
                  <img
                    src={professorForm.foto_url}
                    alt="Foto"
                    loading="lazy"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFotoProfessor}
                  disabled={uploadingFotoProfessor}
                  className="flex-1"
                />
                <Button disabled={uploadingFotoProfessor} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFotoProfessor ? 'Enviando...' : 'Upload'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Instagram</label>
                <Input
                  value={professorForm.instagram}
                  onChange={(e) => setProfessorForm({...professorForm, instagram: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                <Input
                  value={professorForm.linkedin}
                  onChange={(e) => setProfessorForm({...professorForm, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Lattes</label>
                <Input
                  value={professorForm.lattes}
                  onChange={(e) => setProfessorForm({...professorForm, lattes: e.target.value})}
                  placeholder="http://lattes.cnpq.br/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Site Pessoal</label>
                <Input
                  value={professorForm.site}
                  onChange={(e) => setProfessorForm({...professorForm, site: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Especializações em que Leciona</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {especializacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma especialização cadastrada.</p>
                ) : (
                  especializacoes.map((espec) => (
                    <label key={espec.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={professorForm.especializacoes.includes(espec.id)}
                        onChange={() => handleProfessorEspecCheckboxChange(espec.id)}
                      />
                      <span className="text-sm">{espec.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Credenciais */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-indigo-900">🎓 Credenciais Acadêmicas e Profissionais</h4>
                <Button
                  onClick={() => setProfessorForm(prev => ({
                    ...prev,
                    credenciais: [...prev.credenciais, {
                      instituicao_nome: '',
                      logo_url: '',
                      cargo_titulo: '',
                      descricao: '',
                      periodo: ''
                    }]
                  }))}
                  size="sm"
                  variant="outline"
                  className="border-indigo-300 text-indigo-700"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Credencial
                </Button>
              </div>
              
              <div className="space-y-4">
                {professorForm.credenciais.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    Nenhuma credencial cadastrada. Adicione instituições de ensino ou empresas.
                  </p>
                ) : (
                  professorForm.credenciais.map((cred, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-indigo-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-indigo-700">Credencial {idx + 1}</span>
                        <Button
                          onClick={() => setProfessorForm(prev => ({
                            ...prev,
                            credenciais: prev.credenciais.filter((_, i) => i !== idx)
                          }))}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700">Instituição/Empresa *</label>
                          <Input
                            value={cred.instituicao_nome}
                            onChange={(e) => {
                              const newCreds = [...professorForm.credenciais];
                              newCreds[idx].instituicao_nome = e.target.value;
                              setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                            }}
                            placeholder="Ex: Universidade Federal de PE"
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700">Cargo/Título *</label>
                          <Input
                            value={cred.cargo_titulo}
                            onChange={(e) => {
                              const newCreds = [...professorForm.credenciais];
                              newCreds[idx].cargo_titulo = e.target.value;
                              setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                            }}
                            placeholder="Ex: Mestre em Engenharia Civil"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Logo/Marca da Instituição (URL)</label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={cred.logo_url}
                            onChange={(e) => {
                              const newCreds = [...professorForm.credenciais];
                              newCreds[idx].logo_url = e.target.value;
                              setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                            }}
                            placeholder="https://... ou faça upload"
                            className="text-sm flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  toast.info('Enviando logo...');
                                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                  const newCreds = [...professorForm.credenciais];
                                  newCreds[idx].logo_url = file_url;
                                  setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                                  toast.success('Logo enviado!');
                                } catch (error) {
                                  toast.error('Erro ao enviar logo');
                                }
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                        {cred.logo_url && (
                          <img src={cred.logo_url} alt="Logo" className="w-16 h-16 object-contain mt-2 border rounded" />
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Período</label>
                        <Input
                          value={cred.periodo}
                          onChange={(e) => {
                            const newCreds = [...professorForm.credenciais];
                            newCreds[idx].periodo = e.target.value;
                            setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                          }}
                          placeholder="Ex: 2020 - atual"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Descrição</label>
                        <Textarea
                          value={cred.descricao}
                          onChange={(e) => {
                            const newCreds = [...professorForm.credenciais];
                            newCreds[idx].descricao = e.target.value;
                            setProfessorForm(prev => ({...prev, credenciais: newCreds}));
                          }}
                          placeholder="Atividades, conquistas, especializações..."
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={professorForm.ordem}
                onChange={(e) => setProfessorForm({...professorForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveProfessor} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetProfessorForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loadingProf ? (
          <p className="text-gray-600">Carregando professores...</p>
        ) : professores.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">Nenhum professor cadastrado ainda.</p>
        ) : (
          professores.map((professor) => {
            const especializacoesNomes = professor.especializacoes?.map(especId => {
              const espec = especializacoes.find(e => e.id === especId);
              return espec?.nome;
            }).filter(Boolean) || [];

            return (
              <Card key={professor.id} className="hover:shadow-xl transition-shadow border-2 border-indigo-100">
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    {professor.foto_url && (
                      <img
                        src={professor.foto_url}
                        alt={professor.nome}
                        loading="lazy"
                        className="w-20 h-20 rounded-full object-cover border-3 border-indigo-500 shadow-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-gray-900 mb-1 text-lg">{professor.nome}</h4>
                     <p className="text-sm text-indigo-700 mb-1">{professor.titulo}</p>
                     {professor.email && (
                       <p className="text-xs text-gray-600 mb-2">
                         📧 {professor.email}
                       </p>
                     )}

                     {especializacoesNomes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Leciona em:</p>
                          <div className="flex flex-wrap gap-1">
                            {especializacoesNomes.map((nome, idx) => (
                              <Badge key={idx} className="bg-indigo-100 text-indigo-800 text-xs">
                                {nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {professor.instagram && (
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            Instagram
                          </Badge>
                        )}
                        {professor.linkedin && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            LinkedIn
                          </Badge>
                        )}
                        {professor.lattes && (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                            Lattes
                          </Badge>
                        )}
                        {professor.site && (
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            Site
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditProfessor(professor)}
                        className="text-blue-600 hover:text-blue-700 h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteProfessor(professor.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAnaliseCursosTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Análise de Viabilidade de Pós-Graduação</h3>
        <p className="text-sm text-gray-600">
          Selecione os ciclos de conhecimento ou uma especialização existente e deixe a IA avaliar a sinergia, conflitos, duplicidades e fazer uma análise de mercado.
        </p>
      </div>

      <Card className="mb-6 bg-purple-50 border-purple-200">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Avaliar uma Nova Pós-Graduação ou Especialização Existente?
            </label>
            <Select
              value={analiseForm.especializacao_existente_id || 'nova'}
              onValueChange={handleEspecializacaoExistenteChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nova">✨ Nova Análise (selecione ciclos manualmente)</SelectItem>
                {especializacoes.map((espec) => (
                  <SelectItem key={espec.id} value={espec.id}>
                    🔄 {espec.nome} (Reavaliação)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Nome/Foco Proposto da Nova Pós-Graduação
            </label>
            <Input
              value={analiseForm.nome_proposto}
              onChange={(e) => setAnaliseForm({ ...analiseForm, nome_proposto: e.target.value })}
              placeholder="Ex: Gestão de Projetos e Obras com Foco em BIM"
              className="text-base"
              disabled={!!analiseForm.especializacao_existente_id}
            />
            <p className="text-xs text-gray-500 mt-1">
              {analiseForm.especializacao_existente_id 
                ? "Nome preenchido automaticamente da especialização selecionada" 
                : "Este nome ajudará a IA a fazer uma análise de mercado mais precisa."}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Selecione os Ciclos de Conhecimento para Análise
            </label>
            {analiseForm.especializacao_existente_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Os ciclos foram carregados automaticamente da especialização selecionada.
                </p>
              </div>
            )}
            <div className="bg-white p-4 rounded-md border max-h-80 overflow-y-auto space-y-2">
              {ciclos.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nenhum ciclo cadastrado.</p>
              ) : (
                ciclos.map((ciclo) => (
                  <label 
                    key={ciclo.id} 
                    className={`flex items-start space-x-3 p-3 rounded-md border transition-all ${
                      analiseForm.especializacao_existente_id 
                        ? 'cursor-not-allowed bg-gray-50 border-gray-200' 
                        : 'cursor-pointer hover:bg-purple-50 hover:border-purple-200 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 rounded"
                      checked={analiseForm.ciclos_selecionados.includes(ciclo.id)}
                      onChange={() => handleAnaliseCicloCheckbox(ciclo.id)}
                      disabled={!!analiseForm.especializacao_existente_id}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{ciclo.nome}</span>
                      <span className="text-sm text-gray-600 ml-2">({ciclo.carga_horaria}h)</span>
                      {ciclo.disciplinas && ciclo.disciplinas.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {ciclo.disciplinas.length} disciplina(s) cadastradas
                        </p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {analiseForm.ciclos_selecionados.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">
                  Carga Horária Total Selecionada:
                </span>
                <span className="text-2xl font-bold text-green-700">
                  {calcularCargaHorariaTotal()}h
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {analiseForm.ciclos_selecionados.length} ciclo(s) selecionado(s)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAvaliarViabilidade}
              disabled={loadingAnalise || analiseForm.ciclos_selecionados.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3"
            >
              {loadingAnalise ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Avaliar Viabilidade com IA
                </>
              )}
            </Button>
            <Button
              onClick={resetAnaliseForm}
              variant="outline"
              className="border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingAnalise && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-blue-800 font-semibold">Analisando currículo e pesquisando mercado...</p>
            <p className="text-sm text-blue-600 mt-2">Isso pode levar de 10 a 30 segundos.</p>
          </CardContent>
        </Card>
      )}

      {analiseResult && !loadingAnalise && (
        <div className="space-y-6">
          {/* Botão Criar Nova Especialização - Destaque no Topo */}
          {!analiseForm.especializacao_existente_id && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 shadow-xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  ✅ Gostou desta Análise?
                </h3>
                <p className="text-gray-700 mb-4">
                  Clique no botão abaixo para criar uma nova especialização com os dados já preenchidos.
                </p>
                <Button
                  onClick={handleCriarNovaEspecializacao}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 text-lg"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Criar Nova Especialização
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Botão para Baixar PDF */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleDownloadAnalisePDF}
              disabled={isGeneratingAnalisePDF}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isGeneratingAnalisePDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Análise (PDF)
                </>
              )}
            </Button>
          </div>

          {/* Resumo Executivo - Destaque Principal */}
          {analiseResult.resumo_executivo && (
            <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-300 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-900 flex items-center gap-3">
                  <Star className="w-7 h-7 fill-yellow-500 text-yellow-500" />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed text-justify whitespace-pre-line">
                    {analiseResult.resumo_executivo}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sinergia Geral */}
          {analiseResult.sinergia_geral && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Sinergia Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-justify leading-relaxed">{analiseResult.sinergia_geral}</p>
              </CardContent>
            </Card>
          )}

          {/* Conflitos Potenciais - Com Estratégias de Mitigação */}
          {analiseResult.conflitos_potenciais && analiseResult.conflitos_potenciais.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800">⚠️ Conflitos Potenciais e Como Mitigá-los</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analiseResult.conflitos_potenciais.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-red-600 mt-1 font-bold">▸</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-2">
                            {typeof item === 'string' ? item : item.conflito}
                          </p>
                          {item.mitigacao_sugerida && (
                            <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                              <p className="text-xs font-semibold text-green-800 mb-1">💡 Estratégia de Mitigação:</p>
                              <p className="text-sm text-gray-700 text-justify">{item.mitigacao_sugerida}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicidades Identificadas */}
          {analiseResult.duplicidades_identificadas && analiseResult.duplicidades_identificadas.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">🔄 Duplicidades Identificadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analiseResult.duplicidades_identificadas.map((dup, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">▸</span>
                      <span className="text-gray-700 text-justify">{dup}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sugestões de Otimização - Lista Clara de Mudanças */}
          {analiseResult.sugestoes_otimizacao && analiseResult.sugestoes_otimizacao.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">💡 Sugestões de Otimização (Mudanças Recomendadas)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analiseResult.sugestoes_otimizacao.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1 font-bold">▸</span>
                      <span className="text-gray-700 text-justify">{sug}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sugestões de Disciplinas para Ciclos Vazios - COM INTERFACE DE SELEÇÃO */}
          {analiseResult.sugestoes_disciplinas_ciclos_vazios && analiseResult.sugestoes_disciplinas_ciclos_vazios.length > 0 && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Sugestões de Disciplinas para Ciclos sem Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analiseResult.sugestoes_disciplinas_ciclos_vazios.map((cicloSugestao, cicloIdx) => {
                    const nomeCiclo = cicloSugestao.nome_ciclo;
                    const carregando = incluindoDisciplinas[nomeCiclo];
                    const hasSelectedDisciplines = Object.values(disciplinasSelecionadas[nomeCiclo] || {}).some(v => v);
                    
                    return (
                      <div key={cicloIdx} className="bg-white p-4 rounded-lg border-2 border-amber-200">
                        <h4 className="font-bold text-gray-800 mb-3 text-lg">
                          📚 {nomeCiclo}
                        </h4>
                        <div className="space-y-3 mb-4">
                          {(cicloSugestao.disciplinas_sugeridas || []).map((disc, discIdx) => {
                            const disciplinaEditada = disciplinasEditaveis[nomeCiclo]?.[discIdx] || disc.disciplina;
                            const disciplinaSelecionada = disciplinasSelecionadas[nomeCiclo]?.[discIdx] || false;
                            
                            return (
                              <div key={discIdx} className={`p-3 rounded-md border transition-all ${
                                disciplinaSelecionada 
                                  ? 'bg-green-50 border-green-400 border-2' 
                                  : 'bg-amber-50 border-amber-200'
                              }`}>
                                <div className="flex items-start gap-3 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={disciplinaSelecionada}
                                    onChange={() => handleDisciplinaCheckboxChange(nomeCiclo, discIdx)}
                                    className="mt-1 w-5 h-5 rounded cursor-pointer accent-green-600"
                                    disabled={carregando}
                                  />
                                  <div className="flex-1">
                                    <Input
                                      value={disciplinaEditada}
                                      onChange={(e) => handleDisciplinaInputChange(nomeCiclo, discIdx, e.target.value)}
                                      className={`font-semibold ${
                                        disciplinaSelecionada 
                                          ? 'bg-white border-green-400' 
                                          : 'bg-white border-amber-300'
                                      }`}
                                      disabled={carregando}
                                    />
                                    <p className="text-sm text-gray-600 mt-2 text-justify italic">
                                      {disc.justificativa}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Button
                          onClick={() => handleIncluirDisciplinasNoCiclo(nomeCiclo)}
                          disabled={carregando || !hasSelectedDisciplines}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold"
                        >
                          {carregando ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Incluindo disciplinas...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Incluir Disciplinas Selecionadas neste Ciclo
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de Mercado - Tabela Formatada com Links */}
          {analiseResult.analise_mercado && analiseResult.analise_mercado.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">🎯 Análise de Mercado - Cursos Similares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analiseResult.analise_mercado.map((curso, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {curso.url_curso ? (
                            <a 
                              href={curso.url_curso} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-bold text-gray-800 text-lg hover:text-purple-600 underline decoration-purple-400 decoration-2 flex items-center gap-2"
                            >
                              {curso.nome_curso_mercado}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <h4 className="font-bold text-gray-800 text-lg">{curso.nome_curso_mercado}</h4>
                          )}
                          <p className="text-sm text-gray-600">{curso.instituicao}</p>
                        </div>
                        {curso.formato && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {curso.formato}
                          </span>
                        )}
                      </div>
                      
                      {/* Tabela de Informações */}
                      <div className="grid grid-cols-2 gap-3 mb-3 mt-3 pt-3 border-t border-gray-200">
                        {curso.duracao && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-500">Duração</p>
                              <p className="text-sm font-semibold text-gray-800">{curso.duracao}</p>
                            </div>
                          </div>
                        )}
                        {curso.valor && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-lg">💰</span>
                            <div>
                              <p className="text-xs text-gray-500">Valor</p>
                              <p className="text-sm font-semibold text-green-700">{curso.valor}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Disciplinas Principais */}
                      {curso.disciplinas_principais && curso.disciplinas_principais.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Principais Disciplinas:</p>
                          <div className="flex flex-wrap gap-1">
                            {curso.disciplinas_principais.map((disc, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {disc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderRelatoriosTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Central de Relatórios</h3>
        <p className="text-sm text-gray-600">
          Gere relatórios detalhados e gerenciais sobre suas pós-graduações, ciclos e suas inter-relações.
        </p>
      </div>

      <div className="space-y-8">
        {/* Relatório Detalhado */}
        <Card className="bg-blue-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">📄 Relatório Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Visualize todas as informações de cada pós-graduação, incluindo status de preenchimento de campos, ciclos, disciplinas e recursos vinculados.
            </p>
            <DetailedReport
              especializacoes={especializacoes}
              ciclos={ciclos}
              professores={professores}
              parceiros={parceiros}
              tecnologias={tecnologias}
            />
          </CardContent>
        </Card>

        {/* Relatório Gerencial */}
        <Card className="bg-purple-50 border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">📊 Relatório Gerencial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Análise estratégica com mapa visual de relações, ciclos compartilhados e identificação de disciplinas comuns entre especializações.
            </p>
            <ManagerialReport
              especializacoes={especializacoes}
              ciclos={ciclos}
              professores={professores}
              parceiros={parceiros}
              tecnologias={tecnologias}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDiscentesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Corpo Discente</h3>
        <Button
          onClick={() => setShowDiscenteForm(!showDiscenteForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Cadastro em Massa */}
      <div className="mb-6">
        <BulkEnrollStudents />
      </div>

      {showDiscenteForm && (
        <Card className="mb-6 bg-teal-50 border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingDiscente ? 'Editar Aluno' : 'Novo Aluno'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <Input
                  value={discenteForm.nome}
                  onChange={(e) => setDiscenteForm({...discenteForm, nome: e.target.value})}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email (para login)</label>
                <Input
                  type="email"
                  value={discenteForm.email}
                  onChange={(e) => setDiscenteForm({...discenteForm, email: e.target.value})}
                  placeholder="Ex: maria@esuda.edu.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                <Input
                  value={discenteForm.whatsapp}
                  onChange={(e) => setDiscenteForm({...discenteForm, whatsapp: e.target.value})}
                  placeholder="Ex: 5581999999999"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Número da Turma</label>
                <Input
                  value={discenteForm.numero_turma}
                  onChange={(e) => setDiscenteForm({...discenteForm, numero_turma: e.target.value})}
                  placeholder="Ex: T01/2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Formação/Título</label>
                <Input
                  value={discenteForm.titulo}
                  onChange={(e) => setDiscenteForm({...discenteForm, titulo: e.target.value})}
                  placeholder="Ex: Arquiteta"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cargo Atual</label>
                <Input
                  value={discenteForm.cargo_atual}
                  onChange={(e) => setDiscenteForm({...discenteForm, cargo_atual: e.target.value})}
                  placeholder="Ex: Coordenadora BIM"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Empresa Atual</label>
              <Input
                value={discenteForm.empresa}
                onChange={(e) => setDiscenteForm({...discenteForm, empresa: e.target.value})}
                placeholder="Ex: Construtora XYZ"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Status de Carreira</label>
              <Select 
                value={discenteForm.status_carreira} 
                onValueChange={(v) => setDiscenteForm({...discenteForm, status_carreira: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  <SelectItem value="Open to Work">🟢 Open to Work</SelectItem>
                  <SelectItem value="Contratado">🔵 Contratado</SelectItem>
                  <SelectItem value="Freelancer">🟣 Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sobre (Bio Profissional)</label>
              <Textarea
                value={discenteForm.sobre}
                onChange={(e) => setDiscenteForm({...discenteForm, sobre: e.target.value})}
                rows={3}
                placeholder="Resumo profissional do aluno..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Competências/Skills (separadas por vírgula)</label>
              <Input
                value={discenteForm.tags_competencia.join(', ')}
                onChange={(e) => setDiscenteForm({...discenteForm, tags_competencia: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                placeholder="Ex: BIM, Revit, MS Project, Lean Construction"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Foto do Aluno</label>
              {discenteForm.foto_url && (
                <div className="mb-2">
                  <img src={discenteForm.foto_url} alt="Foto" loading="lazy" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFotoDiscente}
                  disabled={uploadingFotoDiscente}
                  className="flex-1"
                />
                <Button disabled={uploadingFotoDiscente} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFotoDiscente ? 'Enviando...' : 'Upload'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Instagram</label>
                <Input
                  value={discenteForm.instagram}
                  onChange={(e) => setDiscenteForm({...discenteForm, instagram: e.target.value})}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                <Input
                  value={discenteForm.linkedin}
                  onChange={(e) => setDiscenteForm({...discenteForm, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Lattes</label>
                <Input
                  value={discenteForm.lattes}
                  onChange={(e) => setDiscenteForm({...discenteForm, lattes: e.target.value})}
                  placeholder="http://lattes.cnpq.br/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Site/Portfólio Pessoal</label>
                <Input
                  value={discenteForm.site}
                  onChange={(e) => setDiscenteForm({...discenteForm, site: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Especializações Cursadas</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {especializacoes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhuma especialização cadastrada.</p>
                ) : (
                  especializacoes.map((espec) => (
                    <label key={espec.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={discenteForm.especializacoes.includes(espec.id)}
                        onChange={() => handleDiscenteEspecCheckboxChange(espec.id)}
                      />
                      <span className="text-sm">{espec.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Parceiros Vinculados</label>
              <div className="bg-white p-4 rounded-md border space-y-2 max-h-60 overflow-y-auto">
                {parceiros.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum parceiro cadastrado.</p>
                ) : (
                  parceiros.map((parceiro) => (
                    <label key={parceiro.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={discenteForm.parceiros.includes(parceiro.id)}
                        onChange={() => handleDiscenteParceiroCheckboxChange(parceiro.id)}
                      />
                      <span className="text-sm">{parceiro.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={discenteForm.ordem}
                onChange={(e) => setDiscenteForm({...discenteForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveDiscente} className="bg-teal-600 hover:bg-teal-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetDiscenteForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingDiscentes ? (
          <p className="text-gray-600">Carregando alunos...</p>
        ) : discentes.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">Nenhum aluno cadastrado ainda.</p>
        ) : (
          discentes.map((discente) => (
            <Card key={discente.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                {discente.foto_url && (
                  <img
                    src={discente.foto_url}
                    alt={discente.nome}
                    loading="lazy"
                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-600 shadow-md mx-auto mb-3"
                  />
                )}
                <h4 className="font-bold text-gray-800 mb-1">{discente.nome}</h4>
                <p className="text-sm text-gray-600 mb-3">{discente.titulo}</p>
                {discente.especializacoes && discente.especializacoes.length > 0 && (
                  <div className="text-xs text-gray-500 mb-3">
                    <strong>Especializações:</strong> {discente.especializacoes.length} cursada(s)
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditDiscente(discente)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteDiscente(discente.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderCronogramaTab = () => (
    <AdminScheduleTemplate
      professores={professores}
      ciclos={ciclos}
      onRefresh={() => queryClient.invalidateQueries({ queryKey: ['cronograma'] })}
    />
  );

  const renderIncubadoraTab = () => {
    return (
      <div className="space-y-6">
        {/* Gerenciamento de Projetos */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Projetos da Incubadora</h3>
            <Button
              onClick={() => setShowProjetoForm(!showProjetoForm)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>

          {showProjetoForm && (
            <Card className="mb-6 bg-teal-50 border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingProjeto ? 'Editar Projeto' : 'Novo Projeto da Incubadora'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjetoForm
                  formData={projetoForm}
                  setFormData={setProjetoForm}
                  onSubmit={handleSaveProjeto}
                  especializacoes={especializacoes}
                  isEditing={!!editingProjeto}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {projetos.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum projeto cadastrado ainda.</p>
            ) : (
              projetos.map((projeto) => (
                <Card key={projeto.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">
                          {projeto.nome_projeto} ({projeto.ano_projeto})
                        </h4>
                        <p className="text-sm text-gray-600">{projeto.coordenador}</p>
                        {projeto.especializacoes && projeto.especializacoes.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            {projeto.especializacoes.length} especialização(ões) vinculadas
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditProjeto(projeto)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteProjeto(projeto.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Registro de Atividades */}
        {projetos.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Registrar Atividades e Produções</h3>
            
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                onClick={() => setAtividadeTab('eventos')}
                variant={atividadeTab === 'eventos' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'eventos' ? 'bg-blue-600' : ''}
              >
                Eventos
              </Button>
              <Button
                onClick={() => setAtividadeTab('artigos')}
                variant={atividadeTab === 'artigos' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'artigos' ? 'bg-purple-600' : ''}
              >
                Artigos Científicos
              </Button>
              <Button
                onClick={() => setAtividadeTab('canteiros')}
                variant={atividadeTab === 'canteiros' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'canteiros' ? 'bg-green-600' : ''}
              >
                Canteiros Didáticos
              </Button>
              <Button
                onClick={() => setAtividadeTab('freelancers')}
                variant={atividadeTab === 'freelancers' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'freelancers' ? 'bg-orange-600' : ''}
              >
                Network
              </Button>
              <Button
                onClick={() => setAtividadeTab('relatorios')}
                variant={atividadeTab === 'relatorios' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'relatorios' ? 'bg-cyan-600' : ''}
              >
                Relatórios Técnicos
              </Button>
              <Button
                onClick={() => setAtividadeTab('producoes')}
                variant={atividadeTab === 'producoes' ? 'default' : 'outline'}
                size="sm"
                className={atividadeTab === 'producoes' ? 'bg-pink-600' : ''}
              >
                Produções Tecnológicas
              </Button>
            </div>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                {editingAtividade ? (
                  <AtividadeEditForm
                    tipo={atividadeEditTipo}
                    atividade={editingAtividade}
                    projetos={projetos}
                    onSuccess={() => {
                      setEditingAtividade(null);
                      setAtividadeEditTipo(null);
                      queryClient.invalidateQueries();
                    }}
                    onCancel={() => {
                      setEditingAtividade(null);
                      setAtividadeEditTipo(null);
                    }}
                  />
                ) : (
                  <>
                    {atividadeTab === 'eventos' && (
                      <AtividadeForm
                        tipo="Evento"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['eventos-incubadora'] })}
                      />
                    )}
                    {atividadeTab === 'artigos' && (
                      <AtividadeForm
                        tipo="ArtigoCientifico"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['artigos-incubadora'] })}
                      />
                    )}
                    {atividadeTab === 'canteiros' && (
                      <AtividadeForm
                        tipo="CanteiroDidatico"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['canteiros-incubadora'] })}
                      />
                    )}
                    {atividadeTab === 'freelancers' && (
                      <AtividadeForm
                        tipo="FreelancerNetwork"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['freelancers-incubadora'] })}
                      />
                    )}
                    {atividadeTab === 'relatorios' && (
                      <AtividadeForm
                        tipo="RelatorioTecnico"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['relatorios-incubadora'] })}
                      />
                    )}
                    {atividadeTab === 'producoes' && (
                      <AtividadeForm
                        tipo="ProducaoTecnologica"
                        projetos={projetos}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['producoes-incubadora'] })}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Listagem de Atividades Cadastradas */}
            <div className="mt-8">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Atividades Cadastradas</h4>
              {atividadeTab === 'eventos' && (
                <AtividadeList
                  atividades={eventos}
                  tipo="Evento"
                  onEdit={(evt) => { setEditingAtividade(evt); setAtividadeEditTipo('Evento'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.Evento.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['eventos-incubadora'] });
                      toast.success('Evento excluído!');
                    }
                  }}
                />
              )}
              {atividadeTab === 'artigos' && (
                <AtividadeList
                  atividades={artigos}
                  tipo="ArtigoCientifico"
                  onEdit={(art) => { setEditingAtividade(art); setAtividadeEditTipo('ArtigoCientifico'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.ArtigoCientifico.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['artigos-incubadora'] });
                      toast.success('Artigo excluído!');
                    }
                  }}
                />
              )}
              {atividadeTab === 'canteiros' && (
                <AtividadeList
                  atividades={canteiros}
                  tipo="CanteiroDidatico"
                  onEdit={(cant) => { setEditingAtividade(cant); setAtividadeEditTipo('CanteiroDidatico'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.CanteiroDidatico.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['canteiros-incubadora'] });
                      toast.success('Canteiro excluído!');
                    }
                  }}
                />
              )}
              {atividadeTab === 'freelancers' && (
                <AtividadeList
                  atividades={freelancers}
                  tipo="FreelancerNetwork"
                  onEdit={(fre) => { setEditingAtividade(fre); setAtividadeEditTipo('FreelancerNetwork'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.FreelancerNetwork.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['freelancers-incubadora'] });
                      toast.success('Network excluído!');
                    }
                  }}
                />
              )}
              {atividadeTab === 'relatorios' && (
                <AtividadeList
                  atividades={relatorios}
                  tipo="RelatorioTecnico"
                  onEdit={(rel) => { setEditingAtividade(rel); setAtividadeEditTipo('RelatorioTecnico'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.RelatorioTecnico.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['relatorios-incubadora'] });
                      toast.success('Relatório excluído!');
                    }
                  }}
                />
              )}
              {atividadeTab === 'producoes' && (
                <AtividadeList
                  atividades={producoes}
                  tipo="ProducaoTecnologica"
                  onEdit={(prod) => { setEditingAtividade(prod); setAtividadeEditTipo('ProducaoTecnologica'); }}
                  onDelete={async (id) => {
                    if (window.confirm('Tem certeza que deseja excluir?')) {
                      await base44.entities.ProducaoTecnologica.delete(id);
                      queryClient.invalidateQueries({ queryKey: ['producoes-incubadora'] });
                      toast.success('Produção excluída!');
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLeadsTab = () => {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">CRM - Gestão de Leads</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sistema completo de gerenciamento com histórico de interações e follow-up automático
          </p>
        </div>

        <BulkActionsPanel 
          type="leads" 
          items={leads.filter(l => l.status !== 'Convertido' && l.status !== 'Perdido')} 
        />

        <div className="mt-6">
          <LeadCRM 
            leads={leads} 
            onUpdate={(id, data) => updateLeadMutation.mutate({ id, data })}
            especializacoes={especializacoes}
          />
        </div>
      </div>
    );
  };

  const renderChatbotTab = () => (
    <div className="space-y-8">
      {/* Seção de Perguntas Sem Resposta */}
      {perguntasSemResposta.filter(p => p.status === 'Pendente').length > 0 && (
        <Card className="bg-amber-50 border-2 border-amber-300">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              ⚠️ Perguntas que Precisam de FAQ ({perguntasSemResposta.filter(p => p.status === 'Pendente').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Estas perguntas foram feitas por usuários mas a IA não tinha informação suficiente para responder adequadamente.
            </p>
            <div className="space-y-3">
              {perguntasSemResposta
                .filter(p => p.status === 'Pendente')
                .map((pergunta) => (
                  <Card key={pergunta.id} className="bg-white border border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 mb-2">"{pergunta.pergunta}"</h5>
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-xs text-gray-500 mb-1">Resposta da IA:</p>
                            <p className="text-sm text-gray-700 italic">{pergunta.resposta_ia}</p>
                          </div>
                          {pergunta.lead_nome && (
                            <p className="text-xs text-gray-600">
                              Perguntado por: <strong>{pergunta.lead_nome}</strong> ({pergunta.lead_whatsapp})
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(pergunta.created_date).toLocaleDateString('pt-BR')} às {new Date(pergunta.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleCriarFAQDePergunta(pergunta)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Criar FAQ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePerguntaSemRespostaMutation.mutate({ 
                              id: pergunta.id, 
                              data: { status: 'Ignorada' } 
                            })}
                          >
                            Ignorar
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deletePerguntaSemRespostaMutation.mutate(pergunta.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de FAQs */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Gerenciar Chatbot - FAQs</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure as perguntas e respostas do assistente virtual do site
            </p>
          </div>
          <Button
            onClick={() => setShowFAQForm(!showFAQForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova FAQ
          </Button>
        </div>

      {showFAQForm && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingFAQ ? 'Editar FAQ' : 'Nova FAQ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Pergunta / Palavra-chave</label>
              <Input
                value={faqForm.pergunta}
                onChange={(e) => setFaqForm({...faqForm, pergunta: e.target.value})}
                placeholder="Ex: como me inscrever"
              />
              <p className="text-xs text-gray-500 mt-1">
                O chatbot buscará correspondências parciais com esta pergunta
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <Select value={faqForm.categoria} onValueChange={(v) => setFaqForm({...faqForm, categoria: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cursos">Cursos</SelectItem>
                  <SelectItem value="Inscrição">Inscrição</SelectItem>
                  <SelectItem value="Contato">Contato</SelectItem>
                  <SelectItem value="Informações Gerais">Informações Gerais</SelectItem>
                  <SelectItem value="Pagamento">Pagamento</SelectItem>
                  <SelectItem value="Calendário">Calendário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Resposta</label>
              <Textarea
                value={faqForm.resposta}
                onChange={(e) => setFaqForm({...faqForm, resposta: e.target.value})}
                rows={4}
                placeholder="Digite a resposta que o chatbot deve dar..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Página Destino (opcional)</label>
              <Select value={faqForm.pagina_destino} onValueChange={(v) => setFaqForm({...faqForm, pagina_destino: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (apenas resposta)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhuma</SelectItem>
                  <SelectItem value="Homepage">Home</SelectItem>
                  <SelectItem value="UpgradePage">O Upgrade</SelectItem>
                  <SelectItem value="DiferenciaisPage">Diferenciais</SelectItem>
                  <SelectItem value="CiclosPage">Ciclos de Conhecimento</SelectItem>
                  <SelectItem value="EspecializacoesPage">Especializações</SelectItem>
                  <SelectItem value="CoordenadorPage">Coordenação</SelectItem>
                  <SelectItem value="ProfessoresPage">Corpo Docente</SelectItem>
                  <SelectItem value="CorpoDiscentePage">Corpo Discente</SelectItem>
                  <SelectItem value="ParceirosPage">Parceiros</SelectItem>
                  <SelectItem value="IncubadoraProfissionalPage">Incubadora Profissional</SelectItem>
                  <SelectItem value="EmAcaoPage">Blog</SelectItem>
                  <SelectItem value="CalendarioDeAula">Calendário de Aulas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Se selecionado, o chatbot oferecerá um botão para ir à página
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Ordem de Prioridade</label>
                <Input
                  type="number"
                  value={faqForm.ordem}
                  onChange={(e) => setFaqForm({...faqForm, ordem: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  checked={faqForm.ativo}
                  onChange={(e) => setFaqForm({...faqForm, ativo: e.target.checked})}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">FAQ Ativa</label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveFAQ} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={resetFAQForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {chatbotFAQs.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma FAQ cadastrada ainda.</p>
        ) : (
          chatbotFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-800">{faq.pergunta}</h4>
                      <Badge className="text-xs">{faq.categoria}</Badge>
                      {!faq.ativo && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                          Inativa
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{faq.resposta}</p>
                    {faq.pagina_destino && (
                      <Badge variant="outline" className="text-xs">
                        → {faq.pagina_destino}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditFAQ(faq)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );

  const renderNotificacoesTab = () => {
    return <NotificationManager allNotificacoes={allNotificacoes} />;
  };

  const renderCRMTab = () => {
    // Filtrar apenas G1, excluindo "Matriculado Turma Antiga" para o dashboard e marketing
    const leadsG1Dashboard = inscritos.filter(i => 
      i.grupo_monitoramento === 'G1_Cursos_Atuais' && 
      i.status_crm !== 'Matriculado Turma Antiga'
    );

    // Para a lista de leads, mostrar TODOS (G1 + G2)
    const todosLeads = inscritos.filter(i => 
      i.grupo_monitoramento === 'G1_Cursos_Atuais' || 
      i.grupo_monitoramento === 'G2_Cursos_Legacy_Pos_Ago2024'
    );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">CRM & Marketing Studio</h3>
          <p className="text-sm text-gray-600">
            Gerencie leads ativos, crie campanhas com IA e execute ações em massa
          </p>
        </div>

        {/* GPO Intelligence Chatbot */}
        <GPOChatbot />

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setCrmSubTab('dashboard')}
            variant={crmSubTab === 'dashboard' ? 'default' : 'outline'}
            size="sm"
            className={crmSubTab === 'dashboard' ? 'bg-blue-600' : ''}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setCrmSubTab('leads')}
            variant={crmSubTab === 'leads' ? 'default' : 'outline'}
            size="sm"
            className={crmSubTab === 'leads' ? 'bg-indigo-600' : ''}
          >
            Lista de Leads
          </Button>
          <Button
            onClick={() => setCrmSubTab('marketing')}
            variant={crmSubTab === 'marketing' ? 'default' : 'outline'}
            size="sm"
            className={crmSubTab === 'marketing' ? 'bg-purple-600' : ''}
          >
            Studio de Marketing IA
          </Button>
          <Button
            onClick={() => setCrmSubTab('acoes')}
            variant={crmSubTab === 'acoes' ? 'default' : 'outline'}
            size="sm"
            className={crmSubTab === 'acoes' ? 'bg-orange-600' : ''}
          >
            Ações em Massa
          </Button>
          <Button
            onClick={() => setCrmSubTab('log')}
            variant={crmSubTab === 'log' ? 'default' : 'outline'}
            size="sm"
            className={crmSubTab === 'log' ? 'bg-teal-600' : ''}
          >
            Log de Atividades
          </Button>
          <Button
            onClick={async () => {
              try {
                toast.info('Sincronizando leads dos cursos atuais (G1)...');
                const { data } = await base44.functions.invoke('syncLeadsActive');
                if (data.success) {
                  // Registrar no log de atividades
                  try {
                    await base44.entities.CRMActivityLog.create({
                      user_email: currentUser?.email,
                      user_name: currentUser?.full_name,
                      action_type: 'sincronizacao_planilha',
                      details: {
                        g1: data.stats.g1,
                        g2: data.stats.g2,
                        criados: data.stats.created,
                        atualizados: data.stats.updated
                      },
                      timestamp: new Date().toISOString()
                    });
                  } catch (logError) {
                    console.error('Erro ao registrar log:', logError);
                  }
                  
                  const msg = `✅ ${data.stats.g1} leads G1 | ${data.stats.g2} leads G2 | ${data.stats.created} criados | ${data.stats.updated} atualizados | ${data.stats.skipped} ignorados`;
                  toast.success(msg, { duration: 6000 });
                  queryClient.invalidateQueries(['inscritos']);
                } else {
                  toast.error(data.error || 'Erro na sincronização');
                }
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            variant="outline"
            size="sm"
            className="border-green-600 text-green-700 hover:bg-green-50 font-semibold"
          >
            🔄 Sincronizar Leads G1
          </Button>
          <Button
            onClick={async () => {
              if (!window.confirm('Remover duplicatas do banco de dados? Isso manterá apenas a inscrição mais recente de cada aluno por curso.')) return;
              try {
                toast.info('Removendo duplicatas...');
                const { data } = await base44.functions.invoke('cleanDuplicates');
                if (data.success) {
                  // Registrar no log de atividades
                  try {
                    await base44.entities.CRMActivityLog.create({
                      user_email: currentUser?.email,
                      user_name: currentUser?.full_name,
                      action_type: 'duplicatas_removidas',
                      details: {
                        quantidade: data.duplicatas_removidas
                      },
                      timestamp: new Date().toISOString()
                    });
                  } catch (logError) {
                    console.error('Erro ao registrar log:', logError);
                  }
                  
                  toast.success(`✅ ${data.duplicatas_removidas} duplicatas removidas!`, { duration: 4000 });
                  queryClient.invalidateQueries(['inscritos']);
                } else {
                  toast.error(data.error || 'Erro na limpeza');
                }
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            variant="outline"
            size="sm"
            className="border-red-600 text-red-700 hover:bg-red-50 font-semibold"
          >
            🧹 Limpar Duplicatas
          </Button>
        </div>

        {crmSubTab === 'dashboard' && <CRMDashboard inscritos={leadsG1Dashboard} />}
        {crmSubTab === 'leads' && (
          <LeadsTable 
            inscritos={todosLeads}
            currentUser={currentUser}
            onUpdate={(id, data) => {
              const inscrito = todosLeads.find(i => i.id === id);
              updateInscritoMutation.mutate({ 
                id, 
                data,
                logDetails: {
                  lead_nome: inscrito?.nome_completo,
                  details: { campo: 'status_crm', de: inscrito?.status_crm, para: data.status_crm }
                }
              });
            }}
            onDelete={(id) => {
              const inscrito = todosLeads.find(i => i.id === id);
              deleteInscritoMutation.mutate({ id, inscrito });
            }}
          />
        )}
        {crmSubTab === 'marketing' && <MarketingStudio inscritos={leadsG1Dashboard} currentUser={currentUser} />}
        {crmSubTab === 'acoes' && (
          <div className="space-y-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                onClick={() => setCrmMarketingSubTab('acoes')}
                variant={crmMarketingSubTab === 'acoes' ? 'default' : 'outline'}
                size="sm"
                className={crmMarketingSubTab === 'acoes' ? 'bg-orange-600' : ''}
              >
                Envio em Massa
              </Button>
              <Button
                onClick={() => setCrmMarketingSubTab('templates')}
                variant={crmMarketingSubTab === 'templates' ? 'default' : 'outline'}
                size="sm"
                className={crmMarketingSubTab === 'templates' ? 'bg-blue-600' : ''}
              >
                📧 Gerenciar Templates
              </Button>
              <Button
                onClick={() => setCrmMarketingSubTab('campanhas')}
                variant={crmMarketingSubTab === 'campanhas' ? 'default' : 'outline'}
                size="sm"
                className={crmMarketingSubTab === 'campanhas' ? 'bg-purple-600' : ''}
              >
                📊 Log de Campanhas
              </Button>
            </div>
            
            {crmMarketingSubTab === 'acoes' && <BulkActions inscritos={todosLeads} currentUser={currentUser} />}
            {crmMarketingSubTab === 'templates' && <EmailTemplateManager />}
            {crmMarketingSubTab === 'campanhas' && <EmailCampaignLog />}
          </div>
        )}
        {crmSubTab === 'log' && <ActivityLog />}
      </div>
    );
  };

  const renderPostsTab = () => (
    <BlogManager
      posts={posts}
      editingPost={editingPost}
      setEditingPost={setEditingPost}
      showPostForm={showPostForm}
      setShowPostForm={setShowPostForm}
      postForm={postForm}
      setPostForm={setPostForm}
      onSave={handleSavePost}
      onDelete={handleDeletePost}
      uploadingMidia={uploadingMidia}
      especializacoes={especializacoes}
      ciclos={ciclos}
      professores={professores}
      parceiros={parceiros}
    />
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Área do Administrador</h2>
        </div>
        <NotificationCenter
          leads={leads}
          comentarios={comentarios}
          perguntasSemResposta={perguntasSemResposta}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      </div>
      
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 mb-8">
        <p className="text-red-800 font-semibold text-justify">
          Bem-vindo à área de administração. Aqui você pode gerenciar ciclos, especializações, parceiros, tecnologias, professores e analisar a viabilidade de novos cursos.
        </p>
      </div>

      {/* Mostrar todas as abas para usuários com acesso (admin, crm_access ou super admin) */}
      {hasCrmAccess && (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              onClick={() => setActiveTab('ciclos')}
              variant={activeTab === 'ciclos' ? 'default' : 'outline'}
              className={activeTab === 'ciclos' ? 'bg-blue-600' : ''}
            >
              Ciclos de Conhecimento
            </Button>
        <Button
          onClick={() => setActiveTab('especializacoes')}
          variant={activeTab === 'especializacoes' ? 'default' : 'outline'}
          className={activeTab === 'especializacoes' ? 'bg-green-600' : ''}
        >
          Especializações
        </Button>
        <Button
          onClick={() => setActiveTab('parceiros')}
          variant={activeTab === 'parceiros' ? 'default' : 'outline'}
          className={activeTab === 'parceiros' ? 'bg-orange-600' : ''}
        >
          Parceiros
        </Button>
        <Button
          onClick={() => setActiveTab('tecnologias')}
          variant={activeTab === 'tecnologias' ? 'default' : 'outline'}
          className={activeTab === 'tecnologias' ? 'bg-purple-600' : ''}
        >
          Tecnologias
        </Button>
        <Button
          onClick={() => setActiveTab('professores')}
          variant={activeTab === 'professores' ? 'default' : 'outline'}
          className={activeTab === 'professores' ? 'bg-indigo-600' : ''}
        >
          Corpo Docente
        </Button>
        <Button
          onClick={() => setActiveTab('analise')}
          variant={activeTab === 'analise' ? 'default' : 'outline'}
          className={activeTab === 'analise' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Análise de Cursos
        </Button>
        <Button
          onClick={() => setActiveTab('relatorios')}
          variant={activeTab === 'relatorios' ? 'default' : 'outline'}
          className={activeTab === 'relatorios' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
        >
          <Download className="w-4 h-4 mr-2" />
          Relatórios
        </Button>
        <Button
          onClick={() => setActiveTab('discentes')}
          variant={activeTab === 'discentes' ? 'default' : 'outline'}
          className={activeTab === 'discentes' ? 'bg-teal-600' : ''}
        >
          Corpo Discente
        </Button>
        <Button
          onClick={() => setActiveTab('posts')}
          variant={activeTab === 'posts' ? 'default' : 'outline'}
          className={activeTab === 'posts' ? 'bg-pink-600' : ''}
        >
          Blog "Em Ação"
        </Button>
        <Button
          onClick={() => setActiveTab('incubadora')}
          variant={activeTab === 'incubadora' ? 'default' : 'outline'}
          className={activeTab === 'incubadora' ? 'bg-teal-600' : ''}
        >
          Incubadora Profissional
        </Button>
        <Button
          onClick={() => setActiveTab('chatbot')}
          variant={activeTab === 'chatbot' ? 'default' : 'outline'}
          className={activeTab === 'chatbot' ? 'bg-blue-600' : ''}
        >
          Chatbot FAQs
        </Button>
        <Button
          onClick={() => setActiveTab('leads')}
          variant={activeTab === 'leads' ? 'default' : 'outline'}
          className={activeTab === 'leads' ? 'bg-emerald-600' : ''}
        >
          Leads
        </Button>

        <Button
          onClick={() => setActiveTab('notificacoes')}
          variant={activeTab === 'notificacoes' ? 'default' : 'outline'}
          className={activeTab === 'notificacoes' ? 'bg-violet-600' : ''}
        >
          Notificações
        </Button>
        <Button
          onClick={() => setActiveTab('eventos-discentes')}
          variant={activeTab === 'eventos-discentes' ? 'default' : 'outline'}
          className={activeTab === 'eventos-discentes' ? 'bg-amber-600' : ''}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Eventos Discentes
        </Button>
        <Button
          onClick={() => setActiveTab('notificacoes-discentes')}
          variant={activeTab === 'notificacoes-discentes' ? 'default' : 'outline'}
          className={activeTab === 'notificacoes-discentes' ? 'bg-indigo-600' : ''}
        >
          <Bell className="w-4 h-4 mr-2" />
          Notificações Discentes
        </Button>
        <Button
          onClick={() => setActiveTab('campanhas-email')}
          variant={activeTab === 'campanhas-email' ? 'default' : 'outline'}
          className={activeTab === 'campanhas-email' ? 'bg-cyan-600' : ''}
        >
          <Mail className="w-4 h-4 mr-2" />
          Campanhas Email
        </Button>
        <Button
          onClick={() => setActiveTab('aplicativos')}
          variant={activeTab === 'aplicativos' ? 'default' : 'outline'}
          className={activeTab === 'aplicativos' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Aplicativos Inteligentes
        </Button>
        <Button
          onClick={() => setActiveTab('crm')}
          variant={activeTab === 'crm' ? 'default' : 'outline'}
          className={activeTab === 'crm' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
        >
          <Mail className="w-4 h-4 mr-2" />
          CRM & Marketing
        </Button>
        <Button
          onClick={() => setActiveTab('usuarios')}
          variant={activeTab === 'usuarios' ? 'default' : 'outline'}
          className={activeTab === 'usuarios' ? 'bg-gradient-to-r from-red-600 to-pink-600' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          Gerenciar Usuários
        </Button>
        <Button
          onClick={() => setActiveTab('marketing-ia')}
          variant={activeTab === 'marketing-ia' ? 'default' : 'outline'}
          className={activeTab === 'marketing-ia' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Studio Marketing IA
        </Button>
        <Button
          onClick={() => setActiveTab('automacao')}
          variant={activeTab === 'automacao' ? 'default' : 'outline'}
          className={activeTab === 'automacao' ? 'bg-gradient-to-r from-green-600 to-teal-600' : ''}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Automação Sistema
        </Button>
        <Button
          onClick={() => setActiveTab('ai-tools')}
          variant={activeTab === 'ai-tools' ? 'default' : 'outline'}
          className={activeTab === 'ai-tools' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ferramentas IA
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === 'ciclos' && renderCiclosTab()}
        {activeTab === 'especializacoes' && renderEspecializacoesTab()}
        {activeTab === 'parceiros' && renderParceirosTab()}
        {activeTab === 'tecnologias' && renderTecnologiasTab()}
        {activeTab === 'professores' && renderProfessoresTab()}
        {activeTab === 'discentes' && renderDiscentesTab()}
        {activeTab === 'analise' && renderAnaliseCursosTab()}
        {activeTab === 'relatorios' && renderRelatoriosTab()}
        {activeTab === 'posts' && renderPostsTab()}

        {activeTab === 'incubadora' && renderIncubadoraTab()}
        {activeTab === 'chatbot' && renderChatbotTab()}
        {activeTab === 'leads' && renderLeadsTab()}

        {activeTab === 'notificacoes' && renderNotificacoesTab()}
        {activeTab === 'eventos-discentes' && <EventosManager />}
        {activeTab === 'notificacoes-discentes' && <NotificacoesDiscentesPage />}
        {activeTab === 'campanhas-email' && <CampanhaEmailManager currentUser={currentUser} />}
        {activeTab === 'aplicativos' && <AplicativosManager />}
        {activeTab === 'crm' && renderCRMTab()}
        {activeTab === 'usuarios' && <GerenciamentoUsuarios />}
        {activeTab === 'marketing-ia' && <MarketingAIStudio />}
        {activeTab === 'automacao' && <SystemAutomation />}
        {activeTab === 'ai-tools' && <AIToolsSection />}
      </div>
        </>
      )}
    </div>
  );
}