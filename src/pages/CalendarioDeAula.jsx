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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          {selectedDay && (
            <DayDetailModal
              day={selectedDay}
              aulas={selectedAulas}
              professores={professores}
              ciclos={ciclos}
              onClose={handleCloseModal}
            />
          )}

          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center gap-2 sm:gap-3">
                  📅 Calendário de Aulas 2026
                </h1>
                <p className="text-green-50 text-sm sm:text-base md:text-lg max-w-3xl">
                  Acompanhe o cronograma completo das aulas. Clique nos dias com aula para ver mais detalhes sobre horários, professores e disciplinas.
                </p>
              </div>
              <Link to={createPageUrl('EmAcaoPage')} className="w-full sm:w-auto">
                <Button variant="outline" className="border-white bg-white/10 hover:bg-white/20 text-white w-full sm:w-auto text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>

      {isLoading ? (
        <div className="text-center py-12 sm:py-16">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-green-600 mx-auto mb-4 sm:mb-6" />
          <p className="text-gray-600 text-base sm:text-lg font-medium">Carregando cronograma...</p>
        </div>
      ) : cronograma.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 sm:p-12 md:p-16 rounded-2xl text-center border-2 border-dashed border-gray-300">
          <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl md:text-6xl">📚</div>
          <p className="text-gray-600 text-base sm:text-lg font-medium mb-1 sm:mb-2">
            Nenhuma aula agendada no momento
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            Em breve o cronograma será atualizado com as próximas aulas.
          </p>
        </div>
      ) : (
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
          <ScheduleCalendar
            cronograma={cronograma}
            professores={professores}
            ciclos={ciclos}
            onDayClick={handleDayClick}
          />
        </div>
      )}
    </div>
  );
}