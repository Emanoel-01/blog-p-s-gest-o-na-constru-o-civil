import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Download, List, BarChart, Calendar as CalendarIcon, 
  Settings, Filter, User, MessageSquare, X, AlertCircle, CheckCircle,
  PlusCircle, Search, Clock, Info, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- CONSTANTES & CORES ---
const FERIADOS = { 
  "14/02/2026": "Carnaval", "07/03/2026": "Data Magna", "04/04/2026": "Páscoa", 
  "02/05/2026": "Dia do Trabalho", "24/06/2026": "São João", "29/08/2026": "Intervalo", 
  "05/09/2026": "Independência", "31/10/2026": "Finados", "14/11/2026": "Proclamação Rep." 
};

const EVENT_TYPES = {
  FERIADO: { label: 'Feriado / Sem Aula', color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  PRESENCIAL: { label: 'Aula Presencial', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-600' },
  EAD: { label: 'Aula EAD (Ao Vivo)', color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-600' },
  ELETIVA: { label: 'Eletiva / Opcional', color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-600' }
};

const COURSES_OPTIONS = ['BIM', 'GPO', 'LEGAL', 'MANUTENÇÃO 4.0', 'TODOS'];

export default function PortalAcademico({ rawData = [], professores = [], currentUser = null }) {
  const queryClient = useQueryClient();
  
  // --- ESTADOS ---
  // Ordem alterada: Calendário primeiro
  const [view, setView] = useState('calendario'); 
  const [events, setEvents] = useState([]);
  const [filterTurma, setFilterTurma] = useState('TODAS');
  const [filterProf, setFilterProf] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  // Estados do Formulário de Gestão
  const [formData, setFormData] = useState({
    date1: '',
    date2: '', // Para "1 ou 2 dias"
    hasSecondDate: false,
    type: 'Presencial',
    discipline: '',
    professor: '',
    manualProfessor: '', // Caso selecione "Outro"
    courses: [], // Lista de cursos selecionados (BIM, GPO...)
    details: ''
  });
  
  // Admin Check
  const isAdmin = currentUser?.email === 'emanoel.s.amorim@gmail.com';
  
  // Modal e Chat
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Olá! Sou seu assistente acadêmico. Como posso ajudar com o cronograma?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const contentRef = useRef(null);

  // --- QUERIES & MUTATIONS ---
  const { data: cronogramaData = [], isLoading } = useQuery({
    queryKey: ['cronograma'],
    queryFn: () => base44.entities.CronogramaAula.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CronogramaAula.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cronograma']);
      toast.success('Aula cadastrada com sucesso!');
    },
    onError: () => toast.error('Erro ao cadastrar aula')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CronogramaAula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cronograma']);
      toast.success('Aula atualizada com sucesso!');
      setEditingEventId(null);
    },
    onError: () => toast.error('Erro ao atualizar aula')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CronogramaAula.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cronograma']);
      toast.success('Aula excluída com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir aula')
  });

  // --- PROCESSAMENTO DE DADOS ---
  useEffect(() => {
    const dataSource = cronogramaData.length > 0 ? cronogramaData : rawData;
    if (!dataSource || dataSource.length === 0) return;

    const processed = dataSource.map((item, index) => {
      const getData = (keys) => {
        for (const k of keys) if (item[k] !== undefined) return item[k];
        return null;
      };

      const rawDate = getData(['Data', 'data', 'date']);
      const tipoRaw = getData(['Tipo', 'tipo', 'type']) || 'Presencial';
      const disciplina = getData(['Nome da Discisciplina ', 'disciplina_nome', 'disciplina', 'Disciplina']) || 'Sem Título';
      const docente = getData(['Docente', 'professor_nome', 'professor']) || 'A Definir';
      const cursos = getData(['cursos']) || ['TODOS'];
      const obs = getData(['Recomendações Preliminares', 'observacoes', 'details']) || '';

      // Normalização do Tipo para Cores
      let normalizedType = 'PRESENCIAL';
      if (tipoRaw.toUpperCase().includes('EAD') || tipoRaw.toUpperCase().includes('ONLINE')) normalizedType = 'EAD';
      if (tipoRaw.toUpperCase().includes('FERIADO') || tipoRaw.toUpperCase().includes('SEM AULA') || !!FERIADOS[rawDate]) normalizedType = 'FERIADO';
      if (tipoRaw.toUpperCase().includes('ELETIVA') || tipoRaw.toUpperCase().includes('OPCIONAL')) normalizedType = 'ELETIVA';

      return {
        id: item.id || `evt-${index}`,
        dateString: rawDate,
        dateObj: parseDateSafe(rawDate),
        typeLabel: tipoRaw,
        typeKey: normalizedType,
        title: disciplina,
        professor: docente,
        cursos: Array.isArray(cursos) ? cursos : [cursos || 'TODOS'],
        details: obs,
      };
    }).sort((a, b) => a.dateObj - b.dateObj);

    setEvents(processed);
  }, [cronogramaData, rawData]);

  const parseDateSafe = (dateInput) => {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;
    if (dateInput.includes('-')) {
        const [y, m, d] = dateInput.split('-');
        return new Date(y, m - 1, d);
    }
    if (dateInput.includes('/')) {
        const [d, m, y] = dateInput.split('/');
        return new Date(y, m - 1, d);
    }
    return new Date();
  };

  // --- FILTROS ---
  const filteredEvents = events.filter(evt => {
    const matchesSearch = searchTerm === '' || 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.professor.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;
    if (filterProf !== 'TODOS' && !evt.professor.includes(filterProf)) return false;
    
    // Filtro de Curso
    if (filterTurma !== 'TODAS') {
        const eventCursos = evt.cursos || ['TODOS'];
        const hasTodos = eventCursos.some(c => c.toUpperCase() === 'TODOS');
        const hasCurso = eventCursos.some(c => c.toUpperCase().includes(filterTurma));
        if (!hasTodos && !hasCurso) return false;
    }
    return true;
  });

  // --- FUNÇÕES DE GESTÃO ---
  const handleCourseToggle = (course) => {
    setFormData(prev => {
      const newCourses = prev.courses.includes(course) 
        ? prev.courses.filter(c => c !== course)
        : [...prev.courses, course];
      return { ...prev, courses: newCourses };
    });
  };

  const handleSaveClass = async () => {
    // Validação
    if (!formData.date1 || !formData.discipline) {
      toast.error("Preencha a data e a disciplina!");
      return;
    }
    
    const finalProfessor = formData.professor === 'OUTRO' ? formData.manualProfessor : formData.professor;
    if (!finalProfessor) {
      toast.error("Informe o professor!");
      return;
    }

    // Encontrar ID do professor
    const professorObj = professores.find(p => p.nome === finalProfessor);
    
    // Preparar dados
    const aulaData = {
      data: formData.date1.split('-').reverse().join('/'),
      tipo: formData.type,
      disciplina_nome: formData.discipline,
      professor_id: professorObj?.id || '',
      professor_nome: finalProfessor,
      cursos: formData.courses.length > 0 ? formData.courses : ['TODOS'],
      observacoes: formData.details,
      ordem: 1
    };

    try {
      if (editingEventId) {
        // Modo edição
        await updateMutation.mutateAsync({ id: editingEventId, data: aulaData });
      } else {
        // Modo criação - primeira aula
        await createMutation.mutateAsync(aulaData);
        
        // Se tem segunda data, criar outra aula
        if (formData.hasSecondDate && formData.date2) {
          const aulaData2 = {
            ...aulaData,
            data: formData.date2.split('-').reverse().join('/')
          };
          await createMutation.mutateAsync(aulaData2);
          toast.success(`Aula também cadastrada para ${formData.date2.split('-').reverse().join('/')}`);
        }
      }

      // Limpar form
      setFormData({
        date1: '', date2: '', hasSecondDate: false, type: 'Presencial',
        discipline: '', professor: '', manualProfessor: '', courses: [], details: ''
      });
      setEditingEventId(null);
      
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      toast.error('Erro ao salvar aula: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
    
    try {
      await deleteMutation.mutateAsync(eventId);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleDownloadPDF = async () => {
    toast.info("Gerando PDF com todas as visualizações...");
    
    // Criar container temporário
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1200px';
    document.body.appendChild(tempContainer);

    try {
      // Renderizar cada visualização
      const calendarHTML = `
        <div style="padding: 20px;">
          <h1 style="text-align: center; color: #166534; margin-bottom: 20px;">Calendário Acadêmico 2026</h1>
          ${contentRef.current.innerHTML}
        </div>
      `;
      
      tempContainer.innerHTML = calendarHTML;
      
      // Salvar visualização atual
      const currentView = view;
      
      // Gerar PDF com calendário
      const opt = {
        margin: 10,
        filename: 'Cronograma_ESUDA_2026_Completo.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const worker = html2pdf().set(opt);
      
      // Adicionar calendário
      await worker.from(tempContainer).toPdf().get('pdf').then(async (pdf) => {
        // Adicionar lista
        setView('lista');
        await new Promise(resolve => setTimeout(resolve, 500));
        tempContainer.innerHTML = `
          <div style="padding: 20px;">
            <h1 style="text-align: center; color: #166534; margin-bottom: 20px;">Lista Detalhada</h1>
            ${contentRef.current.innerHTML}
          </div>
        `;
        pdf.addPage();
        
        // Adicionar timeline
        setView('gantt');
        await new Promise(resolve => setTimeout(resolve, 500));
        tempContainer.innerHTML = `
          <div style="padding: 20px;">
            <h1 style="text-align: center; color: #166534; margin-bottom: 20px;">Timeline (Gantt)</h1>
            ${contentRef.current.innerHTML}
          </div>
        `;
        pdf.addPage();
        
        // Restaurar visualização original
        setView(currentView);
      }).save();
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  // --- RENDERIZADORES ---

  // 1. CALENDÁRIO (Agora o principal)
  const renderCalendarView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Legendas */}
      <div className="flex flex-wrap gap-4 justify-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        {Object.entries(EVENT_TYPES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className={`w-3 h-3 rounded-full ${style.dot}`}></span>
            {style.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => {
          const date = new Date(2026, i, 1);
          const monthName = date.toLocaleString('pt-BR', { month: 'long' });
          const daysInMonth = new Date(2026, i + 1, 0).getDate();
          const startDay = date.getDay();

          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="text-center font-bold text-gray-800 uppercase text-xs mb-3 bg-gray-50 py-1 rounded">{monthName} 2026</div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
                 {['D','S','T','Q','Q','S','S'].map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                 {Array.from({length: startDay}).map((_, k) => <div key={`e-${k}`} />)}
                 {Array.from({length: daysInMonth}).map((_, d) => {
                    const day = d + 1;
                    const dayEvts = events.filter(e => e.dateObj.getMonth() === i && e.dateObj.getDate() === day); 
                    const hasEvt = dayEvts.length > 0;
                    const evt = dayEvts[0];
                    const style = evt ? EVENT_TYPES[evt.typeKey] : null;

                    return (
                      <TooltipProvider key={day}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`
                                aspect-square flex items-center justify-center rounded-lg text-xs transition-all
                                ${hasEvt 
                                  ? `${style?.color} font-bold cursor-pointer hover:brightness-95 border` 
                                  : 'text-gray-400 hover:bg-gray-50'}
                              `}
                              onClick={() => {
                                if(hasEvt) { setSelectedEvent(evt); setIsModalOpen(true); }
                                else if(isAdmin) { 
                                  // Atalho para criar aula no dia clicado
                                  setFormData(prev => ({...prev, date1: `2026-${String(i+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}));
                                  setView('admin');
                                  toast.info(`Criando aula para ${day}/${i+1}`);
                                }
                              }}
                            >
                              {day}
                            </div>
                          </TooltipTrigger>
                          {hasEvt && (
                            <TooltipContent className="bg-gray-900 text-white border-none text-xs p-3 max-w-[250px]">
                              <p className="font-bold mb-1">{evt.title}</p>
                              <p className="opacity-80 mb-1">{evt.professor}</p>
                              <div className="flex gap-1 flex-wrap mb-1">
                                <span className="text-[10px] uppercase bg-white/20 px-1 rounded">{evt.typeLabel}</span>
                                {evt.cursos && evt.cursos.map((c, i) => (
                                  <span key={i} className="text-[10px] bg-blue-500/30 px-1 rounded">{c}</span>
                                ))}
                              </div>
                              {evt.details && (
                                <p className="text-[10px] mt-2 pt-2 border-t border-white/20 opacity-90">
                                  {evt.details}
                                </p>
                              )}
                              {isAdmin && evt.id && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="w-full mt-2 h-6 text-[10px]"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Excluir
                                </Button>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )
                 })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  // 2. LISTA (Colunas Personalizadas)
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Data / Formato</th>
              <th className="px-6 py-4">Disciplina / Conteúdo</th>
              <th className="px-6 py-4">Professor</th>
              <th className="px-6 py-4">Cursos</th>
              <th className="px-6 py-4 w-1/4">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEvents.map((evt) => {
              const style = EVENT_TYPES[evt.typeKey];
              return (
                <tr key={evt.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* DATA / FORMATO */}
                  <td className="px-6 py-4 align-top">
                    <div className="font-mono font-bold text-gray-900">{evt.dateString}</div>
                    <Badge variant="outline" className={`mt-2 ${style.color}`}>{evt.typeLabel}</Badge>
                  </td>
                  {/* DISCIPLINA */}
                  <td className="px-6 py-4 align-top font-medium text-gray-800">
                    {evt.title}
                  </td>
                  {/* PROFESSOR */}
                  <td className="px-6 py-4 align-top text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {evt.professor}
                    </div>
                  </td>
                  {/* CURSOS */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex gap-1 flex-wrap">
                      {evt.cursos && evt.cursos.map((c, i) => (
                        <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  {/* DETALHES */}
                  <td className="px-6 py-4 align-top text-xs text-gray-500">
                     {evt.details ? (
                       <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800">
                         {evt.details}
                       </div>
                     ) : (
                       <span className="text-gray-300 italic">-</span>
                     )}
                     {isAdmin && (
                       <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-green-700" 
                         onClick={() => { setFormData(prev => ({...prev, discipline: evt.title, professor: evt.professor, details: evt.details})); setView('admin'); }}>
                         Editar
                       </Button>
                     )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 3. TIMELINE (GANTT SIMPLIFICADO)
  const renderGanttView = () => {
    // Agrupamento por mês para visualização tipo timeline
    const months = {};
    filteredEvents.forEach(evt => {
        const m = evt.dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        if(!months[m]) months[m] = [];
        months[m].push(evt);
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-12">
         {Object.entries(months).map(([month, evts]) => (
             <div key={month} className="relative border-l-2 border-green-200 pl-8 ml-4">
                 <span className="absolute -left-[42px] top-0 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                   {month}
                 </span>
                 
                 <div className="space-y-4 pt-2">
                     {evts.map((evt) => {
                       const style = EVENT_TYPES[evt.typeKey];
                       return (
                         <div key={evt.id} className="relative group">
                             {/* Linha do tempo horizontal */}
                             <div className="absolute -left-[41px] top-4 w-8 h-0.5 bg-green-200"></div>
                             <div className={`absolute -left-[36px] top-3 w-2.5 h-2.5 rounded-full ${style.dot} ring-4 ring-white`}></div>
                             
                             <div className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-green-300 hover:shadow-md rounded-lg p-4 transition-all flex flex-col sm:flex-row justify-between gap-4 cursor-pointer"
                                  onClick={() => { setSelectedEvent(evt); setIsModalOpen(true); }}>
                                
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-lg p-2 w-16 h-16 shrink-0 shadow-sm">
                                    <span className="text-xl font-bold text-gray-800">{evt.dateObj.getDate()}</span>
                                    <span className="text-[10px] uppercase text-gray-400">{evt.dateObj.toLocaleString('pt-BR',{weekday:'short'})}</span>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-bold text-gray-800">{evt.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                      <User className="w-3 h-3" /> {evt.professor}
                                    </div>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                       <Badge className={style.color}>{evt.typeLabel}</Badge>
                                       {evt.cursos && evt.cursos.map((c, i) => (
                                         <Badge key={i} variant="outline">{c}</Badge>
                                       ))}
                                    </div>
                                  </div>
                                </div>
                             </div>
                         </div>
                       );
                     })}
                 </div>
             </div>
         ))}
      </div>
    );
  };

  // 4. GESTÃO (ADMIN)
  const renderAdminView = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-right">
       <div className="bg-green-700 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5" /> Gestão Acadêmica</h2>
            <p className="text-green-100 text-sm mt-1">Cadastrar e Editar Aulas para Base44</p>
          </div>
       </div>

       <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* COLUNA ESQUERDA: DADOS PRINCIPAIS */}
          <div className="space-y-6">
             
             {/* Disciplina */}
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Disciplina / Conteúdo</Label>
                <Input 
                   placeholder="Ex: Gestão de Projetos BIM" 
                   value={formData.discipline}
                   onChange={e => setFormData({...formData, discipline: e.target.value})}
                   className="font-bold text-lg"
                />
             </div>

             {/* Professor (Com opção manual) */}
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Professor</Label>
                <Select 
                   value={formData.professor} 
                   onValueChange={v => setFormData({...formData, professor: v})}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                     {professores.map(p => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
                     <SelectItem value="OUTRO" className="font-bold text-green-700">+ Outro (Inserir Manualmente)</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Input condicional para Professor Manual */}
                {formData.professor === 'OUTRO' && (
                  <Input 
                    placeholder="Digite o nome do professor..." 
                    className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800"
                    value={formData.manualProfessor}
                    onChange={e => setFormData({...formData, manualProfessor: e.target.value})}
                    autoFocus
                  />
                )}
             </div>

             {/* Cursos (Checkbox) */}
             <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Label className="text-xs font-bold uppercase text-gray-500">Cursos</Label>
                <p className="text-xs text-gray-500 mb-2">Selecione os cursos. Se nenhum for selecionado, será considerado TODOS.</p>
                <div className="grid grid-cols-2 gap-3">
                   {COURSES_OPTIONS.map(course => (
                      <div key={course} className="flex items-center space-x-2">
                         <Checkbox 
                            id={`chk-${course}`} 
                            checked={formData.courses.includes(course)}
                            onCheckedChange={() => handleCourseToggle(course)}
                         />
                         <label htmlFor={`chk-${course}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {course}
                         </label>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* COLUNA DIREITA: DATA E DETALHES */}
          <div className="space-y-6">
             
             {/* Datas (1 ou 2 dias) */}
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-gray-500">Data Principal</Label>
                      <Input type="date" value={formData.date1} onChange={e => setFormData({...formData, date1: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-gray-500">Tipo de Aula</Label>
                      <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Presencial">Presencial</SelectItem>
                            <SelectItem value="EAD">EAD (Online)</SelectItem>
                            <SelectItem value="Eletiva">Eletiva</SelectItem>
                            <SelectItem value="Feriado">Feriado/Sem Aula</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                {/* Opção de 2 dias */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                   <Checkbox 
                      id="chk-date2" 
                      checked={formData.hasSecondDate}
                      onCheckedChange={(checked) => setFormData({...formData, hasSecondDate: checked})}
                   />
                   <label htmlFor="chk-date2" className="text-sm text-gray-600 cursor-pointer">
                      Repetir ou Adicionar 2º Dia?
                   </label>
                </div>
                
                {formData.hasSecondDate && (
                   <div className="animate-in slide-in-from-top-2">
                      <Label className="text-xs font-bold uppercase text-gray-500">Segunda Data</Label>
                      <Input type="date" className="mt-1" value={formData.date2} onChange={e => setFormData({...formData, date2: e.target.value})} />
                   </div>
                )}
             </div>

             {/* Detalhes (Textarea) */}
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Detalhes / Observações</Label>
                <Textarea 
                   placeholder="Informações adicionais, sala de aula, link do meet... (Se vazio, ficará em branco)" 
                   className="h-32 resize-none"
                   value={formData.details}
                   onChange={e => setFormData({...formData, details: e.target.value})}
                />
             </div>

             <Button 
                className="w-full bg-green-700 hover:bg-green-800 h-12 text-lg" 
                onClick={handleSaveClass}
                disabled={createMutation.isPending || updateMutation.isPending}
             >
                {editingEventId ? (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Salvar Alterações</>
                ) : (
                  <><PlusCircle className="w-5 h-5 mr-2" /> Cadastrar Aula</>
                )}
             </Button>
             {editingEventId && (
               <Button 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => {
                    setEditingEventId(null);
                    setFormData({
                      date1: '', date2: '', hasSecondDate: false, type: 'Presencial',
                      discipline: '', professor: '', manualProfessor: '', courses: [], details: ''
                    });
                  }}
               >
                  Cancelar Edição
               </Button>
             )}
          </div>
       </div>
    </div>
  );

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 font-sans text-gray-900 flex justify-center">
      <div className="max-w-[1400px] w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 p-6 space-y-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-700/20">
                     <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                     <h1 className="text-xl font-bold text-gray-900">Portal Acadêmico 2026</h1>
                     <p className="text-sm text-gray-500">Engenharia e Arquitetura - ESUDA</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                     <Input 
                        placeholder="Buscar disciplina..." 
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <Button variant="outline" onClick={handleDownloadPDF} className="border-gray-300">
                     <Download className="w-4 h-4" /> <span className="hidden sm:inline ml-2">PDF</span>
                  </Button>
               </div>
           </div>
        </header>

        {/* NAV (ORDEM ALTERADA: Calendário -> Lista -> Timeline -> Gestão) */}
        <nav className="flex px-6 border-b border-gray-200 sticky top-0 z-20 bg-white/95 backdrop-blur overflow-x-auto">
           {[
             { id: 'calendario', icon: CalendarIcon, label: 'Calendário (Principal)' },
             { id: 'lista', icon: List, label: 'Lista Detalhada' },
             { id: 'gantt', icon: BarChart, label: 'Timeline (Gantt)' },
             { id: 'admin', icon: Settings, label: 'Gestão Base44', show: isAdmin }
           ].map(tab => (
             (!tab.show && tab.show === false) ? null : (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                    ${view === tab.id ? 'border-green-700 text-green-700 bg-green-50/50' : 'border-transparent text-gray-500 hover:text-green-700 hover:bg-gray-50'}
                  `}
                >
                   <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
             )
           ))}
        </nav>

        {/* CONTEÚDO */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto" ref={contentRef}>
           {view === 'lista' && renderListView()}
           {view === 'gantt' && renderGanttView()}
           {view === 'calendario' && renderCalendarView()}
           {view === 'admin' && renderAdminView()}
        </main>

        {/* CHATBOT */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" data-html2canvas-ignore>
           {isChatOpen && (
              <div className="bg-white w-[300px] sm:w-[350px] h-[450px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                 <div className="bg-green-700 p-4 text-white flex justify-between items-center">
                    <span className="font-bold text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Assistente Virtual</span>
                    <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4" /></button>
                 </div>
                 <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {chatMessages.map((msg, i) => (
                       <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${msg.type === 'user' ? 'bg-green-700 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                    <Input 
                       className="h-10 text-xs rounded-full bg-gray-50 border-gray-200" 
                       placeholder="Digite sua dúvida..." 
                       value={chatInput}
                       onChange={e => setChatInput(e.target.value)}
                    />
                    <Button size="icon" className="h-10 w-10 rounded-full bg-green-700 hover:bg-green-800"><MessageSquare className="w-4 h-4" /></Button>
                 </div>
              </div>
           )}
           <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition-colors flex items-center justify-center">
              {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
           </button>
        </div>

        {/* MODAL DETALHES DO EVENTO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="sm:max-w-md">
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-green-700">
                    <CalendarIcon className="w-5 h-5" /> {selectedEvent?.dateString}
                 </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                       <Badge className={selectedEvent ? EVENT_TYPES[selectedEvent.typeKey].color : ''}>
                          {selectedEvent?.typeLabel}
                       </Badge>
                       <span className="text-xs text-gray-400 font-mono">ID: {selectedEvent?.id}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">{selectedEvent?.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                       <User className="w-4 h-4" /> {selectedEvent?.professor}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                       <Info className="w-3 h-3"/> Detalhes / Observações
                    </h4>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 min-h-[60px]">
                       {selectedEvent?.details || "Nenhum detalhe informado."}
                    </p>
                 </div>
              </div>
              <DialogFooter className="gap-2">
                 {isAdmin && selectedEvent?.id && (
                    <>
                      <Button variant="destructive" onClick={() => handleDeleteEvent(selectedEvent.id)} className="flex-1">
                         <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </Button>
                      <Button className="flex-1 bg-green-700" onClick={() => { 
                         setIsModalOpen(false); 
                         setEditingEventId(selectedEvent.id);
                         
                         // Verificar se o professor está na lista
                         const professorExists = professores.some(p => p.nome === selectedEvent.professor);
                         
                         setFormData({
                            date1: selectedEvent.dateString.split('/').reverse().join('-'),
                            date2: '',
                            hasSecondDate: false,
                            type: selectedEvent.typeLabel,
                            discipline: selectedEvent.title,
                            professor: professorExists ? selectedEvent.professor : 'OUTRO',
                            manualProfessor: professorExists ? '' : selectedEvent.professor,
                            courses: selectedEvent.cursos || [],
                            details: selectedEvent.details || ''
                         });
                         setView('admin'); 
                      }}>
                         Editar
                      </Button>
                    </>
                 )}
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}