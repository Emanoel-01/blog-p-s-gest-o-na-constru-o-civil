import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const COURSES = [
  { id: 'gestao', title: 'Gestão de Projetos e Obras', class: 'text-orange-600' },
  { id: 'bim', title: 'Tecnologia BIM', class: 'text-cyan-600' },
  { id: 'manutencao', title: 'Engenharia e Gestão da Manutenção', class: 'text-green-600' },
  { id: 'legal', title: 'Engenharia Legal e Perícias', class: 'text-purple-600' }
];

const DISCIPLINE_DATA = {
  comum: [
    { name: 'Gestão de Escritórios: Branding e Precificação', type: 'Presencial' },
    { name: 'Práticas Simuladas: Empreendedorismo', type: 'Presencial' },
    { name: 'Inteligência Artificial Aplicada', type: 'Presencial' },
    { name: 'Marketing Pessoal e Digital para Arq. e Eng.', type: 'Presencial' },
    { name: 'Novas Fontes de Receita: Elaboração de Laudos', type: 'EAD' },
    { name: 'Solução Criativa de Problemas (Design Thinking)', type: 'EAD' },
    { name: 'Negociação e Gestão de Conflitos', type: 'EAD' },
    { name: 'Liderança e Alta Performance', type: 'EAD' },
    { name: 'Metodologia da Pesquisa e Didática', type: 'EAD' },
  ],
  especifica_gestao: [
    { name: 'Técnicas de Orçamentos, Cobranças e Custos de Obras' },
    { name: 'Administração Contratual e Gestão de Pleitos (Claims)' },
    { name: 'Sistemas Informatizados de Gestão e BI' },
    { name: 'Lean Construction e Logística de Canteiro' },
    { name: 'Engenharia de Segurança e Normas de Desempenho' },
    { name: 'Técnicas de Coordenação e Compatibilização de Projetos' },
    { name: 'Técnicas de Orçamentos e Custos de Projetos' },
    { name: 'Técnicas de Planejamento e Coordenação de Obras' },
    { name: 'Eficiência Energética e Sustentabilidade' },
  ],
  especifica_bim: [
    { name: 'BIM Estrutural: Detalhamento de Fabricação (LOD 400)' },
    { name: 'CDE e Normatização: Implementação ISO 19650' },
    { name: 'BIM Estratégico: Gêmeos Digitais, IA e BI' },
    { name: 'BIM Arquitetura I: Modelagem Estratégica' },
    { name: 'BIM Arquitetura II: Parametrização e Dados' },
    { name: 'BIM Instalações I: Modelagem de Sistemas' },
    { name: 'BIM Instalações II: Coordenação 3D' },
    { name: 'Análise BIM 4D/5D: Simulação de Custos' },
    { name: 'BIM 6D e 7D: Desempenho e Gestão de Ativos (FM)' },
  ],
  especifica_manutencao: [
    { name: 'Engenharia Diagnóstica: Terapia Predial' },
    { name: 'Manutenção Preditiva: IoT, Sensores Inteligentes' },
    { name: 'Termografia Infravermelha e Drones na Inspeção' },
    { name: 'BIM FM (Facility Management) e Orçamento de Manutenção' },
    { name: 'Patologias Construtivas em Estruturas e Envoltória' },
    { name: 'Manutenção Avançada em Instalações' },
    { name: 'CMMS/GMAO: Sistemas de Gestão' },
    { name: 'Engenharia Condominial e Sistemas de Segurança' },
    { name: 'Gestão da Manutenção: Planejamento e KPIs' },
  ],
  especifica_legal: [
    { name: 'Avaliação de Imóveis I: Metodologia Científica' },
    { name: 'Avaliação de Imóveis II: Métodos Alternativos e Relatório Final' },
    { name: 'Perícias Judiciais e Regularização de Imóveis' },
    { name: 'Perícia em Desempenho: Verificação da NBR 15.575' },
    { name: 'Simulação Computacional (BIM 6D) para Validação de Laudos' },
    { name: 'Patologia das Construções e Intervenções' },
    { name: 'Auditoria Predial e NBR 16.747' },
    { name: 'Certificações Ambientais e de Eficiência' },
    { name: 'Engenharia Legal Aplicada: Aspectos de Responsabilidade' },
  ]
};

const CALENDAR_TEMPLATE_2026 = [
  { date: '10/01/2026', type: 'C-P', desc: '1ª Disciplina Presencial' }, { date: '17/01/2026', type: 'C-P', desc: '' },
  { date: '24/01/2026', type: 'C-P', desc: '2ª Disciplina Presencial' }, { date: '31/01/2026', type: 'C-P', desc: '' },
  { date: '07/02/2026', type: 'FERIADO', desc: 'Prévias' }, { date: '14/02/2026', type: 'FERIADO', desc: 'Carnaval' },
  { date: '21/02/2026', type: 'C-EAD', desc: '1ª Disciplina EAD' }, { date: '28/02/2026', type: 'C-EAD', desc: '' },
  { date: '07/03/2026', type: 'FERIADO', desc: 'Data Magna' }, { date: '14/03/2026', type: 'C-P', desc: '3ª Disciplina Presencial' },
  { date: '21/03/2026', type: 'C-P', desc: '' }, { date: '28/03/2026', type: 'C-EAD', desc: '2ª Disciplina EAD' },
  { date: '04/04/2026', type: 'FERIADO', desc: 'Sexta Santa' }, { date: '11/04/2026', type: 'C-EAD', desc: '' },
  { date: '18/04/2026', type: 'C-P', desc: '4ª Disciplina Presencial' }, { date: '25/04/2026', type: 'C-P', desc: '' },
  { date: '02/05/2026', type: 'FERIADO', desc: 'Dia do Trabalho' }, { date: '09/05/2026', type: 'C-EAD', desc: '3ª Disciplina EAD' },
  { date: '16/05/2026', type: 'C-EAD', desc: '' }, { date: '23/05/2026', type: 'C-EAD', desc: '4ª Disciplina EAD' },
  { date: '30/05/2026', type: 'C-EAD', desc: '' }, { date: '06/06/2026', type: 'E', desc: '1ª Disciplina Específica' },
  { date: '13/06/2026', type: 'E', desc: '' }, { date: '20/06/2026', type: 'C-EAD', desc: '5ª Disciplina EAD' },
  { date: '27/06/2026', type: 'C-EAD', desc: '' }, { date: '04/07/2026', type: 'E', desc: '2ª Disciplina Específica' },
  { date: '11/07/2026', type: 'E', desc: '' }, { date: '18/07/2026', type: 'E', desc: '3ª Disciplina Específica' },
  { date: '25/07/2026', type: 'E', desc: '' }, { date: '01/08/2026', type: 'E', desc: '4ª Disciplina Específica' },
  { date: '08/08/2026', type: 'E', desc: '' }, { date: '15/08/2026', type: 'E', desc: '5ª Disciplina Específica' },
  { date: '22/08/2026', type: 'E', desc: '' }, { date: '29/08/2026', type: 'E', desc: '6ª Disciplina Específica' },
  { date: '12/09/2026', type: 'E', desc: '' }, { date: '19/09/2026', type: 'E', desc: '7ª Disciplina Específica' },
  { date: '26/09/2026', type: 'E', desc: '' }, { date: '03/10/2026', type: 'E', desc: '8ª Disciplina Específica' },
  { date: '17/10/2026', type: 'E', desc: '' }, { date: '24/10/2026', type: 'E', desc: '9ª Disciplina Específica' },
  { date: '31/10/2026', type: 'E', desc: '' }, { date: '14/11/2026', type: 'E', desc: '' },
  { date: '21/11/2026', type: 'E', desc: '' }, { date: '28/11/2026', type: 'E', desc: '' },
  { date: '05/12/2026', type: 'E', desc: '' }, { date: '12/12/2026', type: 'E', desc: '' },
  { date: '19/12/2026', type: 'E', desc: '' }
];

export default function AdminScheduleTemplate({ professores, ciclos, onRefresh }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    turma: '',
    courseId: '',
    cycleType: '',
    professorId: '',
    disciplina: ''
  });
  const [specificDisciplines, setSpecificDisciplines] = useState({
    gestao: { disciplina: '', professorId: '' },
    bim: { disciplina: '', professorId: '' },
    manutencao: { disciplina: '', professorId: '' },
    legal: { disciplina: '', professorId: '' }
  });

  const { data: cronograma = [], isLoading } = useQuery({
    queryKey: ['cronograma'],
    queryFn: () => base44.entities.CronogramaAula.list('data')
  });

  const createAulaMutation = useMutation({
    mutationFn: (aulaData) => base44.entities.CronogramaAula.create(aulaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
    }
  });

  const updateAulaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CronogramaAula.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      toast.success('Aula atualizada com sucesso!');
    }
  });

  const deleteAulaMutation = useMutation({
    mutationFn: (id) => base44.entities.CronogramaAula.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      toast.success('Aula excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro na exclusão:', error);
      queryClient.invalidateQueries({ queryKey: ['cronograma'] });
    }
  });

  const getNextSaturday = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    const current = new Date(year, month - 1, day);
    const next = new Date(current);
    next.setDate(current.getDate() + 7);
    return `${String(next.getDate()).padStart(2, '0')}/${String(next.getMonth() + 1).padStart(2, '0')}/${next.getFullYear()}`;
  };

  const getBlockStatus = () => {
    const blockStatus = {};
    const scheduledByDate = {};
    
    cronograma.forEach(aula => {
      if (!scheduledByDate[aula.data]) {
        scheduledByDate[aula.data] = [];
      }
      scheduledByDate[aula.data].push(aula);
    });

    Object.keys(scheduledByDate).forEach(date => {
      blockStatus[date] = { status: 'AGENDADO', details: scheduledByDate[date] };
    });
    
    return blockStatus;
  };

  const selectScheduleLine = (date, type) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setSelectedType(null);
      setFormData({ turma: '', courseId: '', cycleType: '', professorId: '', disciplina: '' });
    } else {
      setSelectedDate(date);
      setSelectedType(type);
      setFormData({ turma: '', courseId: '', cycleType: '', professorId: '', disciplina: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error('Clique no sábado desejado na lista para selecionar a data.');
      return;
    }

    const nextDate = getNextSaturday(selectedDate);
    const classesToSave = [];

    if (formData.cycleType === 'comum') {
      const professor = professores.find(p => p.id === formData.professorId);
      if (!professor || !formData.disciplina) {
        toast.error('Preencha a Disciplina e o Professor.');
        return;
      }

      const modalidade = selectedType?.includes('C-P') ? 'Presencial' : 'EAD';
      
      COURSES.forEach(course => {
        classesToSave.push({
          data: selectedDate,
          tipo: modalidade,
          disciplina_nome: formData.disciplina,
          professor_id: professor.id,
          observacoes: `Turma ${formData.turma} - ${course.title} - Ciclo Comum (1º Dia)`,
          ordem: 0
        });
        classesToSave.push({
          data: nextDate,
          tipo: modalidade,
          disciplina_nome: formData.disciplina,
          professor_id: professor.id,
          observacoes: `Turma ${formData.turma} - ${course.title} - Ciclo Comum (2º Dia)`,
          ordem: 0
        });
      });

      toast.success(`Disciplina comum "${formData.disciplina}" agendada para os 4 cursos em ${selectedDate} e ${nextDate}.`);
    } else if (formData.cycleType === 'especifica') {
      if (!formData.courseId || !formData.disciplina || !formData.professorId) {
        toast.error('Preencha o Curso, Disciplina e Professor.');
        return;
      }

      const course = COURSES.find(c => c.id === formData.courseId);
      const professor = professores.find(p => p.id === formData.professorId);

      classesToSave.push({
        data: selectedDate,
        tipo: formData.courseId,
        disciplina_nome: formData.disciplina,
        professor_id: professor.id,
        observacoes: `Turma ${formData.turma} - ${course.title} - Específica (1º Dia)`,
        ordem: 0
      });
      classesToSave.push({
        data: nextDate,
        tipo: formData.courseId,
        disciplina_nome: formData.disciplina,
        professor_id: professor.id,
        observacoes: `Turma ${formData.turma} - ${course.title} - Específica (2º Dia)`,
        ordem: 0
      });

      toast.success(`Disciplina específica "${formData.disciplina}" agendada para ${course.title} em ${selectedDate} e ${nextDate}.`);
    }

    // Salvar no banco de dados
    try {
      for (const aula of classesToSave) {
        await createAulaMutation.mutateAsync(aula);
      }
      toast.success('Aulas salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar aulas: ' + error.message);
      return;
    }
    
    setSelectedDate(null);
    setSelectedType(null);
    setFormData({ turma: '', courseId: '', cycleType: '', professorId: '', disciplina: '' });
    setSpecificDisciplines({
      gestao: { disciplina: '', professorId: '' },
      bim: { disciplina: '', professorId: '' },
      manutencao: { disciplina: '', professorId: '' },
      legal: { disciplina: '', professorId: '' }
    });
  };

  const blockStatus = getBlockStatus();

  const getCycleOptions = () => {
    if (!selectedType) return [];
    
    if (selectedType.includes('C-P') || selectedType.includes('C-EAD')) {
      const typeText = selectedType.includes('C-P') ? 'Presencial/Remoto' : 'EAD';
      return [{ value: 'comum', label: `Ciclo I: BASE COMUM (${typeText}) - Todos os Cursos` }];
    }
    
    if (selectedType === 'E') {
      return [{ value: 'especifica', label: 'Ciclo II: ESPECÍFICO - Escolher 1 Curso' }];
    }
    
    return [];
  };

  const handleDeleteAula = async (aulaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
      try {
        await deleteAulaMutation.mutateAsync(aulaId);
      } catch (error) {
        console.error('Erro ao excluir aula:', error);
        toast.error('Erro ao excluir aula. Ela pode já ter sido removida.');
        queryClient.invalidateQueries({ queryKey: ['cronograma'] });
      }
    }
  };

  const getDisciplineOptions = () => {
    if (formData.cycleType === 'comum') {
      const requiredType = selectedType?.includes('C-P') ? 'Presencial' : 'EAD';
      return DISCIPLINE_DATA.comum.filter(d => d.type === requiredType);
    } else if (formData.cycleType === 'especifica' && formData.courseId) {
      const key = `especifica_${formData.courseId}`;
      return DISCIPLINE_DATA[key] || [];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 text-white py-6 px-6 rounded-xl shadow-lg -mx-6 -mt-6 mb-6">
        <h1 className="text-2xl font-extrabold">Cronograma Anual de Aulas - 2026</h1>
        <p className="text-slate-300 mt-1 text-sm">Status de agendamento por sábado, baseado na tipologia de aula (Presencial, EAD ou Específica).</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-teal-600">
        {/* Cabeçalho */}
        <div className="grid grid-cols-[120px_100px_100px_1fr] gap-4 font-bold text-sm text-slate-700 border-b-2 border-gray-300 pb-3 mb-2">
          <div>DATA (SÁBADO)</div>
          <div>TURMA</div>
          <div>TIPO (CICLO)</div>
          <div>DISCIPLINAS AGENDADAS</div>
        </div>

        {/* Linhas de Sábados */}
        <div className="mb-8 max-h-[500px] overflow-y-auto">
          {CALENDAR_TEMPLATE_2026.map((template) => {
            const dateISO = template.date;
            let status = 'LIVRE';
            let details = template;

            if (blockStatus[dateISO]) {
              status = blockStatus[dateISO].status;
              details = blockStatus[dateISO].details;
            } else if (template.type === 'FERIADO') {
              status = 'FERIADO';
            }

            const isSelectable = status === 'LIVRE' && template.type !== 'FERIADO' && template.type !== '';
            const isSelected = selectedDate === dateISO;

            const scheduledClasses = cronograma.filter(c => c.data === dateISO);
            const grouped = scheduledClasses.reduce((acc, c) => {
              const key = `${c.disciplina_nome}-${c.professor_id}`;
              if (!acc[key]) {
                const prof = professores.find(p => p.id === c.professor_id);
                acc[key] = { 
                  discipline: c.disciplina_nome, 
                  professor: prof?.nome || 'N/A', 
                  tipo: c.tipo,
                  observacoes: c.observacoes
                };
              }
              return acc;
            }, {});

            return (
              <div
                key={dateISO}
                onClick={() => isSelectable && selectScheduleLine(dateISO, template.type)}
                className={`grid grid-cols-[120px_100px_100px_1fr] gap-4 items-center py-3 border-b transition-colors ${
                  isSelectable ? 'cursor-pointer border-dashed border-gray-400 hover:bg-gray-50' : 'border-gray-200'
                } ${
                  isSelected ? 'bg-teal-50 border-l-4 border-l-teal-600 pl-4' : ''
                } ${
                  status === 'AGENDADO' ? 'bg-green-50' : status === 'FERIADO' ? 'bg-red-50' : status === 'BLOQUEADO' ? 'bg-gray-100' : ''
                }`}
              >
                <div className="font-semibold text-sm">{dateISO}</div>
                
                {/* Turma */}
                <div className="text-xs font-semibold">
                  {status === 'LIVRE' && 'LIVRE'}
                  {status === 'FERIADO' && '---'}
                  {status === 'BLOQUEADO' && '---'}
                  {status === 'AGENDADO' && <span className="text-gray-700">AGENDADO</span>}
                </div>

                {/* Tipo */}
                <div className="text-xs">
                  {status === 'FERIADO' && <span className="font-bold text-red-600">FERIADO</span>}
                  {status === 'BLOQUEADO' && <span className="text-gray-600">BLOQUEADO</span>}
                  {status === 'LIVRE' && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      template.type.includes('EAD') ? 'bg-green-100 text-green-800' :
                      template.type.includes('P') ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {template.type.includes('EAD') ? 'COMUM EAD' :
                       template.type.includes('P') ? 'COMUM PRESENCIAL' :
                       'ESPECÍFICA'}
                    </span>
                  )}
                  {status === 'AGENDADO' && Object.keys(grouped).map((key, idx) => {
                    const item = grouped[key];
                    const tipoLabel = item.tipo === 'Presencial' ? 'PRESENCIAL/REMOTO' : 
                                     item.tipo === 'EAD' ? 'EAD' : 'ESPECÍFICA';
                    return (
                      <div key={idx} className="mb-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          item.tipo === 'Presencial' ? 'bg-blue-100 text-blue-800' :
                          item.tipo === 'EAD' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {tipoLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Disciplinas */}
                <div className="text-sm">
                  {status === 'FERIADO' && <span className="font-bold text-red-800">{template.desc}</span>}
                  {status === 'BLOQUEADO' && (
                    <span className="text-slate-500 italic">
                      2º DIA DO BLOCO
                    </span>
                  )}
                  {status === 'LIVRE' && <span className="text-gray-400">---</span>}
                  {status === 'AGENDADO' && scheduledClasses.slice(0, 3).map((aula, idx) => {
                    const obs = aula.observacoes || '';
                    const isDia1 = obs.includes('1º Dia');
                    const prof = professores.find(p => p.id === aula.professor_id);
                    return (
                      <div key={idx} className="mb-1 p-2 rounded-md bg-white border border-gray-200 group hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-slate-800 block truncate">{aula.disciplina_nome}</span>
                            <span className="text-xs text-slate-500 block">
                              Prof: {prof?.nome.split(' ')[0]} {isDia1 ? '(1º)' : '(2º)'}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAula(aula.id);
                            }}
                            className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {status === 'AGENDADO' && scheduledClasses.length > 3 && (
                    <div className="text-xs text-gray-600 font-semibold mt-1">+{scheduledClasses.length - 3} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulário de Agendamento */}
        {selectedDate && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6 transition-all">
            <h2 className="text-xl font-bold text-teal-700 mb-4">
              Agendar Disciplina de 2 Sábados em: <span className="text-teal-900">{selectedDate} e {getNextSaturday(selectedDate)}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Identificação da Turma (Ex: T01/26)
                </label>
                <Input
                  value={formData.turma}
                  onChange={(e) => setFormData({...formData, turma: e.target.value})}
                  placeholder="Ex: T01/2026"
                  required
                />
              </div>

              {/* Seleção de Ciclo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Agendamento</label>
                  <Select
                    value={formData.cycleType}
                    onValueChange={(value) => setFormData({...formData, cycleType: value, disciplina: ''})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCycleOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.cycleType === 'comum' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Professor Responsável (Todos os Cursos)</label>
                    <Select
                      value={formData.professorId}
                      onValueChange={(value) => setFormData({...formData, professorId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o Professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {professores.map(prof => (
                          <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Campos Dinâmicos */}
              {formData.cycleType === 'comum' && (
                <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
                  <h3 className="font-bold text-lg mb-4 text-blue-800">
                    Disciplina Comum (Tipo: {selectedType?.includes('C-P') ? 'Presencial/Remoto' : 'EAD'})
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Selecione a Disciplina Comum
                    </label>
                    <Select
                      value={formData.disciplina}
                      onValueChange={(value) => setFormData({...formData, disciplina: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDisciplineOptions().map(disc => (
                          <SelectItem key={disc.name} value={disc.name}>{disc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-xs mt-2 text-blue-700">
                    OBS: A disciplina e o professor serão replicados em todos os 4 cursos para os 2 sábados.
                  </p>
                </div>
              )}

              {formData.cycleType === 'especifica' && (
                <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-600">
                  <h3 className="font-bold text-lg mb-4 text-amber-800">
                    Disciplina Específica - Cadastrar 1 Curso por vez
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Curso</label>
                      <Select
                        value={formData.courseId}
                        onValueChange={(value) => setFormData({...formData, courseId: value, disciplina: ''})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha o curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSES.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              <span className={course.class}>{course.title}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.courseId && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Disciplina Específica</label>
                          <Select
                            value={formData.disciplina}
                            onValueChange={(value) => setFormData({...formData, disciplina: value})}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                              {(DISCIPLINE_DATA[`especifica_${formData.courseId}`] || []).map(disc => (
                                <SelectItem key={disc.name} value={disc.name}>{disc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Professor Responsável</label>
                          <Select
                            value={formData.professorId}
                            onValueChange={(value) => setFormData({...formData, professorId: value})}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o professor" />
                            </SelectTrigger>
                            <SelectContent>
                              {professores.map(prof => (
                                <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-xs mt-4 text-amber-700">
                    OBS: Esta disciplina será agendada apenas para o curso selecionado nos dois sábados. Para cadastrar outras disciplinas específicas, repita o processo para cada curso.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3"
              >
                CONFIRMAR AGENDAMENTO (2 SÁBADOS)
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}