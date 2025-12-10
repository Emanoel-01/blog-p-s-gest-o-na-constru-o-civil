import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScheduleCalendar({ cronograma, professores, ciclos, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getAulasForDay = (day) => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}/${currentMonth.getFullYear()}`;
    const dateStr2 = `${String(day).padStart(2, '0')}/${currentMonth.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`;
    return cronograma.filter(aula => aula.data === dateStr || aula.data.startsWith(dateStr2) || aula.data === `${String(day).padStart(2, '0')}/${String(currentMonth.getMonth() + 1).padStart(2, '0')}`);
  };

  const isSaturday = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getDay() === 6;
  };

  const getTipoColor = (aula) => {
    // Se for feriado ou sem aula
    if (['Carnaval', 'Data Magna', 'Sexta Santa', 'Dia do Trabalho', 'Intervalo', '7 de Setembro', 'Dia Sem aula', 'Prévias'].includes(aula.tipo)) {
      return 'bg-red-500 hover:bg-red-600';
    }
    
    // Para disciplinas comuns, usar cor baseada na modalidade
    if (aula.modalidade === 'Presencial') {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    if (aula.modalidade === 'EAD') {
      return 'bg-green-500 hover:bg-green-600';
    }
    
    // Para disciplinas específicas, usar cor do curso
    if (aula.modalidade === 'Específica') {
      switch(aula.courseId) {
        case 'gestao': return 'bg-orange-500 hover:bg-orange-600';
        case 'bim': return 'bg-cyan-500 hover:bg-cyan-600';
        case 'manutencao': return 'bg-green-500 hover:bg-green-600';
        case 'legal': return 'bg-purple-500 hover:bg-purple-600';
        default: return 'bg-gray-400 hover:bg-gray-500';
      }
    }
    
    return 'bg-gray-400 hover:bg-gray-500';
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const aulas = getAulasForDay(day);
    const isSat = isSaturday(day);
    const hasAulas = aulas.length > 0;

    days.push(
      <div
        key={day}
        className={`h-24 border border-gray-200 p-2 ${
          isSat && !hasAulas ? 'bg-gray-100' : 'bg-white'
        } ${hasAulas ? 'cursor-pointer' : ''} hover:bg-gray-50 transition-colors relative`}
        onClick={() => hasAulas && onDayClick && onDayClick(day, aulas)}
      >
        <div className={`text-sm font-semibold mb-1 ${isSat ? 'text-blue-600' : 'text-gray-700'}`}>
          {day}
        </div>
        {hasAulas && (
          <div className="space-y-1">
            {aulas.slice(0, 3).map((aula, idx) => (
              <div
                key={idx}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getTipoColor(aula)}`}
                title={aula.disciplina_nome}
              >
                {aula.disciplina_nome || aula.tipo}
              </div>
            ))}
            {aulas.length > 3 && (
              <div className="text-xs text-gray-600 font-semibold">+{aulas.length - 3}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={previousMonth} variant="outline" size="icon">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <Button onClick={nextMonth} variant="outline" size="icon">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-700 p-2 bg-gray-100">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {days}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <Badge className="bg-blue-500">Presencial/Remoto</Badge>
        <Badge className="bg-green-500">EAD</Badge>
        <Badge className="bg-red-500">Sem Aula</Badge>
        <Badge className="bg-orange-500">Gestão de Projetos</Badge>
        <Badge className="bg-cyan-500">Tecnologia BIM</Badge>
        <Badge className="bg-green-600">Manutenção</Badge>
        <Badge className="bg-purple-500">Engenharia Legal</Badge>
      </div>
    </div>
  );
}