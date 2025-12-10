import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
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
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    turma: '',
    courseId: '',
    cycleType: '',
    professorId: '',
    disciplina: ''
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
    schedule.forEach(item => {
      blockStatus[item.date] = { status: 'AGENDADO', details: item };
      if (item.isFirstDay) {
        const nextSat = getNextSaturday(item.date);
        blockStatus[nextSat] = { status: 'BLOQUEADO', details: item };
      }
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

    const professor = professores.find(p => p.id === formData.professorId);
    if (!professor || !formData.disciplina) {
      toast.error('Preencha a Disciplina e o Professor.');
      return;
    }

    const nextDate = getNextSaturday(selectedDate);
    const classesToSchedule = [];

    const scheduleBlock = (courseData) => {
      classesToSchedule.push({
        date: selectedDate,
        turma: formData.turma,
        courseId: courseData.id,
        courseTitle: courseData.title,
        discipline: formData.disciplina,
        professor: professor.nome,
        professorId: professor.id,
        cycleType: formData.cycleType,
        isFirstDay: true,
      });
      classesToSchedule.push({
        date: nextDate,
        turma: formData.turma,
        courseId: courseData.id,
        courseTitle: courseData.title,
        discipline: formData.disciplina,
        professor: professor.nome,
        professorId: professor.id,
        cycleType: formData.cycleType,
        isFirstDay: false,
      });
    };

    if (formData.cycleType === 'comum') {
      COURSES.forEach(course => scheduleBlock(course));
    } else if (formData.cycleType === 'especifica') {
      const courseData = COURSES.find(c => c.id === formData.courseId);
      if (courseData) scheduleBlock(courseData);
    }

    setSchedule([...schedule, ...classesToSchedule]);
    toast.success(`Disciplina "${formData.disciplina}" agendada em bloco para ${selectedDate} e ${nextDate}.`);
    
    setSelectedDate(null);
    setSelectedType(null);
    setFormData({ turma: '', courseId: '', cycleType: '', professorId: '', disciplina: '' });
  };

  const blockStatus = getBlockStatus();

  const getCycleOptions = () => {
    if (!selectedType) return [];
    
    if (selectedType.includes('C-P') || selectedType.includes('C-EAD')) {
      const typeText = selectedType.includes('C-P') ? 'Presencial/Remoto' : 'EAD';
      return [{ value: 'comum', label: `Ciclo I: BASE COMUM (${typeText})` }];
    }
    
    if (selectedType === 'E') {
      return [{ value: 'especifica', label: 'Ciclo II: ESPECÍFICO (1 Curso)' }];
    }
    
    return [];
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

            const scheduledClasses = schedule.filter(c => c.date === dateISO);
            const grouped = scheduledClasses.reduce((acc, c) => {
              const key = `${c.discipline}-${c.professor}`;
              if (!acc[key]) acc[key] = { discipline: c.discipline, professor: c.professor, cycle: c.cycleType, courses: [], isFirstDay: c.isFirstDay };
              acc[key].courses.push({ id: c.courseId, turma: c.turma });
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
                  {status === 'AGENDADO' && Object.keys(grouped).map((key, idx) => (
                    <div key={idx} className="mb-1">
                      {grouped[key].courses.map((c, i) => {
                        const courseData = COURSES.find(cc => cc.id === c.id);
                        return (
                          <span key={i} className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mr-1 ${courseData.class} bg-opacity-10`}>
                            {c.turma}
                          </span>
                        );
                      })}
                    </div>
                  ))}
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
                  {status === 'AGENDADO' && Object.keys(grouped).map((key, idx) => (
                    <div key={idx} className="mb-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        grouped[key].cycle === 'comum' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {grouped[key].cycle === 'comum' ? 'COMUM' : 'ESPECÍFICA'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Disciplinas */}
                <div className="text-sm">
                  {status === 'FERIADO' && <span className="font-bold text-red-800">{template.desc}</span>}
                  {status === 'BLOQUEADO' && (
                    <span className="text-slate-500 italic">
                      2º DIA DO BLOCO (Início {details.date})
                    </span>
                  )}
                  {status === 'LIVRE' && <span className="text-gray-400">---</span>}
                  {status === 'AGENDADO' && Object.keys(grouped).map((key, idx) => {
                    const item = grouped[key];
                    const blockStatusText = item.isFirstDay ? ' (1º Dia)' : ' (2º Dia)';
                    return (
                      <div key={idx} className="mb-2 p-1 rounded-md">
                        <span className="text-sm font-semibold text-slate-800 block">{item.discipline}</span>
                        <span className="text-xs text-slate-500 block">Prof: {item.professor.split(' ')[1]} {blockStatusText}</span>
                      </div>
                    );
                  })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Curso Principal</label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({...formData, courseId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Professor Responsável Principal</label>
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
              </div>

              {/* Campos Dinâmicos */}
              {formData.cycleType && (
                <div className={`p-5 rounded-lg border-l-4 ${
                  formData.cycleType === 'comum' ? 'bg-blue-50 border-blue-600' : 'bg-amber-50 border-amber-600'
                }`}>
                  <h3 className={`font-bold text-lg mb-4 ${
                    formData.cycleType === 'comum' ? 'text-blue-800' : 'text-amber-800'
                  }`}>
                    {formData.cycleType === 'comum' 
                      ? `Disciplina Comum (Tipo: ${selectedType?.includes('C-P') ? 'Presencial/Remoto' : 'EAD'})`
                      : `Disciplina Específica (Turma: ${COURSES.find(c => c.id === formData.courseId)?.title || 'Curso Específico'})`
                    }
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Selecione a Disciplina {formData.cycleType === 'comum' ? 'Comum' : 'Específica'}
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

                  <p className={`text-xs mt-2 ${formData.cycleType === 'comum' ? 'text-blue-700' : 'text-amber-700'}`}>
                    {formData.cycleType === 'comum' 
                      ? 'OBS: A disciplina e o professor serão replicados em todos os 4 cursos para os 2 sábados.'
                      : `OBS: Esta disciplina será agendada apenas para a turma de ${COURSES.find(c => c.id === formData.courseId)?.title} nos dois sábados.`
                    }
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