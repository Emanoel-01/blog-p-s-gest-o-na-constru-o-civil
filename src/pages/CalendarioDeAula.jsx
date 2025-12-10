import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import ScheduleCalendar from '../components/admin/ScheduleCalendar';
import DayDetailModal from '../components/admin/DayDetailModal';

export default function CalendarioDeAula() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedAulas, setSelectedAulas] = useState([]);

  const { data: cronograma = [], isLoading } = useQuery({
    queryKey: ['cronograma'],
    queryFn: () => base44.entities.CronogramaAula.list('data')
  });

  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const { data: professores = [] } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem')
  });

  const handleDayClick = (day, aulas) => {
    setSelectedDay(day);
    setSelectedAulas(aulas);
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
    setSelectedAulas([]);
  };

  return (
    <div className="space-y-8">
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          aulas={selectedAulas}
          professores={professores}
          ciclos={ciclos}
          onClose={handleCloseModal}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            📅 Calendário de Aulas
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl">
            Acompanhe o cronograma completo das aulas. Clique nos dias com aula para ver mais detalhes.
          </p>
        </div>
        <Link to={createPageUrl('EmAcaoPage')}>
          <Button variant="outline" className="border-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando cronograma...</p>
        </div>
      ) : cronograma.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-xl text-center">
          <p className="text-gray-500 italic">
            Nenhuma aula agendada no momento. Em breve o cronograma será atualizado.
          </p>
        </div>
      ) : (
        <ScheduleCalendar
          cronograma={cronograma}
          professores={professores}
          ciclos={ciclos}
          onDayClick={handleDayClick}
        />
      )}
    </div>
  );
}