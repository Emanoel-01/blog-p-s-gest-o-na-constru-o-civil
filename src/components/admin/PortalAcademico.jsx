import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Download, List, BarChart, Calendar as CalendarIcon, 
  Settings, Filter, User, MessageSquare, X, AlertCircle, CheckCircle,
  PlusCircle, BookOpen, Search, ArrowLeft, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

// --- CONSTANTES ---
const FERIADOS = { 
  "14/02/2026": "Carnaval", "07/03/2026": "Data Magna", "04/04/2026": "Páscoa", 
  "02/05/2026": "Dia do Trabalho", "24/06/2026": "São João", "29/08/2026": "Intervalo", 
  "05/09/2026": "Independência", "31/10/2026": "Finados", "14/11/2026": "Proclamação Rep." 
};

const POS_COURSES = ['BIM', 'MANUT', 'GPO', 'LEGAL'];

export default function PortalAcademico({ rawData = [], professores = [], currentUser = null }) {
  // --- ESTADOS ---
  const [view, setView] = useState('lista'); // lista, gantt, calendario, admin
  const [role, setRole] = useState('student'); // student, admin
  const [events, setEvents] = useState([]);
  const [filterTurma, setFilterTurma] = useState('TODAS');
  const [filterProf, setFilterProf] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Verificar se é admin (apenas emanoel.s.amorim@gmail.com)
  const isAdmin = currentUser?.email === 'emanoel.s.amorim@gmail.com';
  
  // Modal e Chat
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Olá! Sou seu assistente acadêmico IA. Pergunte sobre datas de aulas, professores ou conteúdo programático.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Form Admin
  const [formData, setFormData] = useState({
    data: '',
    tipo: 'Presencial',
    disciplina_nome: '',
    professor_id: '',
    ciclo_id: '',
    horario_inicio: '',
    horario_fim: '',
    observacoes: ''
  });

  // Refs
  const contentRef = useRef(null);

  // --- PROCESSAMENTO DE DADOS (ADAPTER) ---
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;

    // Transforma dados do Base44/CSV para o formato visual
    const processed = rawData.map((item, index) => {
      // 1. Normalização de Chaves (Evita erros se o nome da coluna mudar)
      const getData = (keys) => {
        for (const k of keys) if (item[k] !== undefined) return item[k];
        return null;
      };

      const rawDate = getData(['Data', 'data', 'date']);
      const tipo = getData(['Tipo', 'tipo', 'type']) || 'Presencial';
      const disciplina = getData(['Nome da Discisciplina ', 'disciplina_nome', 'disciplina', 'Disciplina']) || 'Sem Título';
      const docente = getData(['Docente', 'professor_nome', 'professor']) || 'A Definir';
      const turma = getData(['Curso / Turma', 'turma', 'curso', 'observacoes']) || 'Todos';
      const obs = getData(['Recomendações Preliminares', 'observacoes', 'details']) || '';

      // 2. Lógica de Negócio
      const isHoliday = !!FERIADOS[rawDate] || tipo === 'Feriado' || tipo === 'Dia Sem aula' || tipo === 'FERIADO';
      
      // Detecção de Categoria - TODAS as turmas = COMMON
      let category = 'COMMON';
      const turmaUpper = String(turma).toUpperCase();
      const obsUpper = String(obs).toUpperCase();
      
      // Se não for TODAS, e mencionar curso específico, é SPECIFIC
      if (!turmaUpper.includes('TODAS') && !turmaUpper.includes('TODOS')) {
        if (turmaUpper.includes('BIM') || turmaUpper.includes('GPO') || 
            turmaUpper.includes('MANUT') || turmaUpper.includes('LEGAL') ||
            obsUpper.includes('BIM') || obsUpper.includes('GPO') || 
            obsUpper.includes('MANUT') || obsUpper.includes('LEGAL')) {
          category = 'SPECIFIC';
        }
      }

      return {
        id: item.id || `evt-${index}`,
        dateString: rawDate,
        dateObj: parseDateSafe(rawDate),
        type: tipo,
        category,
        title: disciplina,
        professor: docente,
        turmaContext: turma,
        isHoliday,
        details: obs,
      };
    }).sort((a, b) => a.dateObj - b.dateObj);

    setEvents(processed);
  }, [rawData]);

  // Parser Seguro de Datas (Resolve formato ISO e BR)
  const parseDateSafe = (dateInput) => {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;
    // Formato YYYY-MM-DD
    if (dateInput.includes('-')) {
        const [y, m, d] = dateInput.split('-');
        return new Date(y, m - 1, d);
    }
    // Formato DD/MM/YYYY
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
      evt.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.details && evt.details.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterProf !== 'TODOS' && !evt.professor.includes(filterProf)) return false;
    if (filterTurma !== 'TODAS') {
        // Se for aula comum, aparece para todos. Se for específica, filtra.
        if (evt.category === 'SPECIFIC' && !evt.title.includes(filterTurma) && !evt.turmaContext.includes(filterTurma)) return false;
    }
    return true;
  });

  // --- AÇÕES ---
  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 5,
      filename: 'Cronograma_ESUDA_2026.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    toast.success("Download do PDF iniciado!");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Analisando sua solicitação no banco de dados...' }]);
    }, 1000);
    setChatInput('');
  };

  // --- RENDERIZADORES ---

  const renderListView = () => (
    <div className="space-y-4">
      {/* Filtros Mobile/Desktop */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4" data-html2canvas-ignore>
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterTurma} onValueChange={setFilterTurma}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas as Turmas</SelectItem>
              {POS_COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <User className="w-4 h-4 text-gray-500" />
          <Select value={filterProf} onValueChange={setFilterProf}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white"><SelectValue placeholder="Professor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Professores</SelectItem>
              {professores.map(p => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* VERSÃO MOBILE (Cards) */}
      <div className="block md:hidden space-y-3">
        {filteredEvents.map(evt => (
          <div key={evt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col flex-1">
                <span className="font-bold text-gray-900 text-base leading-tight">{evt.title}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <User className="w-3 h-3" /> {evt.professor}
                </span>
              </div>
              <Badge variant={evt.type === 'EAD' ? 'secondary' : 'default'} className={evt.isHoliday ? 'bg-red-100 text-red-700' : ''}>{evt.type}</Badge>
            </div>
            
            {evt.details && (
              <div className="text-xs text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2 items-start">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {evt.details}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <span className="font-mono font-bold text-sm text-gray-700">{evt.dateString}</span>
              {isAdmin && !evt.isHoliday && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { 
                    setSelectedEvent(evt); 
                    setFormData({
                      data: evt.dateString.split('/').reverse().join('-'),
                      tipo: evt.type,
                      disciplina_nome: evt.title,
                      professor_id: professores.find(p => p.nome === evt.professor)?.id || '',
                      ciclo_id: '',
                      horario_inicio: '',
                      horario_fim: '',
                      observacoes: evt.details || ''
                    });
                    setView('admin'); 
                  }}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={(e) => handleQuickDelete(evt, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VERSÃO DESKTOP (Tabela Original) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Data / Formato</th>
                <th className="px-6 py-4">Disciplina / Conteúdo</th>
                <th className="px-6 py-4">Detalhes</th>
                <th className="px-6 py-4">Turma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((evt) => {
                const tagColor = evt.isHoliday ? 'bg-red-50 text-red-700 border-red-200' : evt.type === 'EAD' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200';
                return (
                  <tr key={evt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top w-[160px]">
                      <div className="font-mono font-bold text-gray-900">{evt.dateString}</div>
                      <Badge variant="outline" className={`mt-2 border ${tagColor}`}>{evt.type}</Badge>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {evt.isHoliday ? (
                        <span className="font-bold text-red-600 uppercase tracking-wide">{evt.title || "FERIADO"}</span>
                      ) : (
                        <>
                          <div className="font-bold text-gray-900 text-base">{evt.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-xs">
                            <User className="w-3 h-3" /> {evt.professor}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                       {evt.details && (
                         <div className="text-xs text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2 items-start max-w-[200px]">
                           <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {evt.details}
                         </div>
                       )}
                       {isAdmin && !evt.isHoliday && (
                         <div className="flex gap-2 mt-2">
                           <Button variant="link" size="sm" className="h-auto p-0 text-xs text-green-700" onClick={() => { 
                             setSelectedEvent(evt); 
                             setFormData({
                               data: evt.dateString.split('/').reverse().join('-'),
                               tipo: evt.type,
                               disciplina_nome: evt.title,
                               professor_id: professores.find(p => p.nome === evt.professor)?.id || '',
                               ciclo_id: '',
                               horario_inicio: '',
                               horario_fim: '',
                               observacoes: evt.details || ''
                             });
                             setView('admin'); 
                           }}>
                             Editar
                           </Button>
                           <Button variant="link" size="sm" className="h-auto p-0 text-xs text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleQuickDelete(evt, e); }}>
                             Excluir
                           </Button>
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">{evt.turmaContext === 'Todos / 2026.1' ? 'Ciclo Comum' : evt.turmaContext}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGanttView = () => {
    // Agrupa por mês para o Gantt
    const months = {};
    const groupedEvents = {};
    
    // Primeiro, agrupa disciplinas comuns do mesmo dia
    filteredEvents.forEach(evt => {
        if(evt.typeKey === 'FERIADO') return;
        
        const dateKey = evt.dateString;
        const disciplineKey = `${dateKey}-${evt.title}`;
        
        if (!groupedEvents[disciplineKey]) {
          groupedEvents[disciplineKey] = {
            ...evt,
            courses: evt.turmaContext === 'Todos' ? ['BIM', 'MANUT', 'GPO', 'LEGAL'] : []
          };
        }
    });
    
    // Depois, organiza por mês
    Object.values(groupedEvents).forEach(evt => {
        const m = evt.dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        if(!months[m]) months[m] = [];
        months[m].push(evt);
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-10">
         {Object.entries(months).map(([month, evts]) => (
             <div key={month} className="animate-in fade-in duration-300">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
                   <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider px-4 py-1 bg-green-50 rounded-full border border-green-200">
                     {month}
                   </h3>
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
                 </div>
                 
                 <div className="space-y-3">
                     {evts.map((evt, idx) => {
                       const style = EVENT_TYPES[evt.typeKey];
                       const bgColor = evt.typeKey === 'EAD' ? 'from-green-500 to-green-600' : evt.typeKey === 'ELETIVA' ? 'from-purple-500 to-purple-600' : 'from-blue-600 to-blue-700';
                       const hoverBg = evt.typeKey === 'EAD' ? 'hover:from-green-600 hover:to-green-700' : evt.typeKey === 'ELETIVA' ? 'hover:from-purple-600 hover:to-purple-700' : 'hover:from-blue-700 hover:to-blue-800';
                       
                       return (
                         <div key={evt.id} className="group grid grid-cols-[50px_1fr] gap-4 items-center">
                             <div className="flex flex-col items-end">
                               <div className="text-2xl font-bold text-gray-800">{evt.dateObj.getDate()}</div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                                 {evt.dateObj.toLocaleString('pt-BR', { weekday: 'short' })}
                               </div>
                             </div>
                             
                             <div 
                                className={`bg-gradient-to-r ${bgColor} ${hoverBg} rounded-lg px-4 py-3 shadow-md group-hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 relative`}
                                onClick={() => { setSelectedEvent(evt); setIsModalOpen(true); }}
                             >
                                 <div className="flex justify-between items-start gap-3">
                                   <div className="flex-1 min-w-0">
                                     <h4 className="text-white font-bold text-sm mb-1 truncate">
                                       {evt.title}
                                     </h4>
                                     
                                     {evt.courses && evt.courses.length > 0 && (
                                       <div className="flex items-center gap-1 flex-wrap mt-2">
                                         {evt.courses.map(course => (
                                           <span key={course} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                                             {course}
                                           </span>
                                         ))}
                                       </div>
                                     )}
                                     
                                     <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                                       <User className="w-3 h-3" />
                                       <span className="truncate">{evt.professor}</span>
                                     </div>
                                   </div>
                                   
                                   <div className="flex flex-col items-end gap-1">
                                     <span className="text-[10px] uppercase bg-white/20 text-white px-2 py-1 rounded font-bold tracking-wide">
                                       {evt.typeLabel}
                                     </span>
                                   </div>
                                 </div>

                                 {/* Botão Deletar - Aparece no hover (Admin) */}
                                 {isAdmin && (
                                   <button
                                     onClick={(e) => handleQuickDelete(evt, e)}
                                     className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                     title="Excluir aula"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
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

  const handleQuickDelete = async (evt, e) => {
    e.stopPropagation();
    if (!window.confirm(`Excluir "${evt.title}" de ${evt.dateString}?`)) return;
    
    try {
      await base44.entities.CronogramaAula.delete(evt.id);
      toast.success('Aula excluída!');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const renderCalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => {
        const year = i < 2 ? 2025 : 2026;
        const date = new Date(2026, i, 1);
        const monthName = date.toLocaleString('pt-BR', { month: 'long' });
        const daysInMonth = new Date(2026, i + 1, 0).getDate();
        const startDay = date.getDay();

        return (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center font-bold text-green-800 uppercase text-xs mb-3">{monthName} 2026</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-1">
               {['D','S','T','Q','Q','S','S'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
               {Array.from({length: startDay}).map((_, k) => <div key={`e-${k}`} />)}
               {Array.from({length: daysInMonth}).map((_, d) => {
                  const day = d + 1;
                  const dStr = new Date(2026, i, day).toLocaleDateString('pt-BR');
                  const dayEvts = events.filter(e => e.dateString.includes(`${String(day).padStart(2,'0')}/${String(i+1).padStart(2,'0')}`)); 
                  const hasEvt = dayEvts.length > 0;
                  const isHol = dayEvts.some(e => e.isHoliday);

                  let cellClass = "text-gray-600 hover:bg-gray-50";
                  if (hasEvt) {
                      if (isHol) cellClass = "bg-red-100 text-red-800 line-through font-bold";
                      else if (dayEvts[0].type === 'EAD') cellClass = "bg-orange-100 text-orange-800 font-bold border border-orange-200 cursor-pointer relative group";
                      else cellClass = "bg-blue-100 text-blue-800 font-bold border border-blue-200 cursor-pointer relative group";
                  } else if (isAdmin) {
                      cellClass = "text-gray-600 hover:bg-green-50 hover:border hover:border-green-300 cursor-pointer";
                  }

                  return (
                    <div 
                      key={day} 
                      className={`aspect-square flex items-center justify-center rounded text-xs transition-colors ${cellClass}`}
                      onClick={() => { 
                        if (hasEvt && !isHol) { 
                          setSelectedEvent(dayEvts[0]); 
                          setIsModalOpen(true); 
                        } else if (isAdmin) {
                          const dateToCreate = `${year}-${String(i+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                          setFormData({ 
                            data: dateToCreate,
                            tipo: 'Presencial',
                            disciplina_nome: '',
                            professor_id: '',
                            ciclo_id: '',
                            horario_inicio: '',
                            horario_fim: '',
                            observacoes: ''
                          });
                          setSelectedEvent(null);
                          setView('admin');
                          toast.info(`Criando aula para ${day}/${i+1}/${year}`);
                        }
                      }}
                    >
                      {day}
                      {isAdmin && hasEvt && !isHol && (
                        <button
                          onClick={(e) => handleQuickDelete(dayEvts[0], e)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          title="Excluir aula"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
               })}
            </div>
          </div>
        )
      })}
    </div>
  );

  const handleSaveAula = async () => {
    if (!formData.data || !formData.tipo || !formData.disciplina_nome) {
      toast.error('Preencha data, tipo e disciplina!');
      return;
    }

    try {
      const dataFormatada = new Date(formData.data).toLocaleDateString('pt-BR');
      const professorNome = professores.find(p => p.id === formData.professor_id)?.nome || 'A Definir';

      const aulaData = {
        data: dataFormatada,
        tipo: formData.tipo,
        disciplina_nome: formData.disciplina_nome,
        professor_id: formData.professor_id,
        ciclo_id: formData.ciclo_id,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        observacoes: formData.observacoes
      };

      if (selectedEvent) {
        await base44.entities.CronogramaAula.update(selectedEvent.id, aulaData);
        toast.success('Aula atualizada com sucesso!');
      } else {
        await base44.entities.CronogramaAula.create(aulaData);
        toast.success('Aula criada com sucesso!');
      }

      window.location.reload();
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  const handleDeleteAula = async () => {
    if (!selectedEvent) return;
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      await base44.entities.CronogramaAula.delete(selectedEvent.id);
      toast.success('Aula excluída com sucesso!');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const renderAdminView = () => (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-700" />
        {selectedEvent ? 'Editar Aula' : 'Nova Aula'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: O Que e Quem */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Disciplina</label>
            <Input 
              value={formData.disciplina_nome} 
              onChange={e => setFormData({...formData, disciplina_nome: e.target.value})}
              placeholder="Nome da disciplina..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Professor</label>
            <Select value={formData.professor_id} onValueChange={v => setFormData({...formData, professor_id: v})}>
              <SelectTrigger><SelectValue placeholder="Selecione o docente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>A Definir</SelectItem>
                {professores.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Coluna 2: Quando e Como */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
              <Input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
              <Select value={formData.tipo} onValueChange={v => setFormData({...formData, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="EAD">EAD</SelectItem>
                  <SelectItem value="Prévias">Prévias</SelectItem>
                  <SelectItem value="Carnaval">Carnaval</SelectItem>
                  <SelectItem value="Data Magna">Data Magna</SelectItem>
                  <SelectItem value="Sexta Santa">Sexta Santa</SelectItem>
                  <SelectItem value="Dia do Trabalho">Dia do Trabalho</SelectItem>
                  <SelectItem value="Intervalo">Intervalo</SelectItem>
                  <SelectItem value="7 de Setembro">7 de Setembro</SelectItem>
                  <SelectItem value="Dia Sem aula">Dia Sem aula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Início</label>
              <Input type="time" value={formData.horario_inicio} onChange={e => setFormData({...formData, horario_inicio: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Fim</label>
              <Input type="time" value={formData.horario_fim} onChange={e => setFormData({...formData, horario_fim: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Observações / Links</label>
            <Textarea 
              className="h-20 resize-none text-xs" 
              placeholder="Detalhes da aula, link do Meet ou local..."
              value={formData.observacoes}
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        {selectedEvent && (
          <Button variant="destructive" onClick={handleDeleteAula}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Aula
          </Button>
        )}
        <Button className="bg-green-700 hover:bg-green-800 min-w-[150px]" onClick={handleSaveAula}>
          <CheckCircle className="w-4 h-4 mr-2" />
          {selectedEvent ? 'Atualizar' : 'Agendar Aula'}
        </Button>
      </div>
    </div>
  );

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 font-sans text-gray-900 flex justify-center">
      <div className="max-w-[1400px] w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
              {/* Botão Voltar Integrado ao Título */}
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-700/20">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Portal Acadêmico 2026</h1>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Engenharia e Arquitetura - ESUDA</p>
                  </div>
                </div>
              </div>
              {/* Ações */}
              <Button variant="outline" onClick={handleDownloadPDF} className="border-gray-300" size="sm">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
            
            {/* Barra de Busca (Aparece em todas as abas) */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Busque por disciplina, professor ou conteúdo..." 
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* NAV */}
        <nav className="flex px-6 border-b border-gray-200 sticky top-0 z-20 bg-white/95 backdrop-blur">
           {[
             { id: 'lista', icon: List, label: 'Lista' },
             { id: 'gantt', icon: BarChart, label: 'Timeline' },
             { id: 'calendario', icon: CalendarIcon, label: 'Calendário' },
             { id: 'admin', icon: Settings, label: 'Gestão', show: isAdmin }
           ].map(tab => (
             (!tab.show && tab.show === false) ? null : (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${view === tab.id ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'}`}
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
              <div className="bg-white w-[320px] h-[400px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                 <div className="bg-green-700 p-4 text-white flex justify-between items-center">
                    <span className="font-bold text-sm">IA Assistente</span>
                    <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4" /></button>
                 </div>
                 <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {chatMessages.map((msg, i) => (
                       <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-xl text-xs ${msg.type === 'user' ? 'bg-green-700 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="p-2 bg-white border-t border-gray-100 flex gap-2">
                    <Input 
                       className="h-9 text-xs rounded-full bg-gray-50 border-gray-200 focus-visible:ring-green-500" 
                       placeholder="Digite aqui..." 
                       value={chatInput}
                       onChange={e => setChatInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                    />
                    <Button size="icon" className="h-9 w-9 rounded-full bg-green-700 hover:bg-green-800" onClick={handleChatSend}><MessageSquare className="w-4 h-4" /></Button>
                 </div>
              </div>
           )}
           <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition-colors flex items-center justify-center">
              {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
           </button>
        </div>

        {/* MODAL DETALHES */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-green-700"><CalendarIcon className="w-5 h-5" /> {selectedEvent?.dateString}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedEvent?.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                       <User className="w-4 h-4" /> {selectedEvent?.professor}
                    </div>
                    <Badge className={`mt-3 ${selectedEvent?.type === 'EAD' ? 'bg-orange-500' : 'bg-blue-600'}`}>{selectedEvent?.type}</Badge>
                 </div>
                 {isAdmin && (
                    <Button className="w-full bg-green-700" onClick={() => { setIsModalOpen(false); setView('admin'); setSelectedEvent(selectedEvent); }}>
                       Editar Aula
                    </Button>
                 )}
              </div>
           </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}