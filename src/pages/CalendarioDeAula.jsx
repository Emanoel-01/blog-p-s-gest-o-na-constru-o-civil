import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Calendar, Clock, User, BookOpen, ArrowLeft } from 'lucide-react';

export default function CalendarioDeAula() {
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

  const getCicloNome = (cicloId) => {
    const ciclo = ciclos.find(c => c.id === cicloId);
    return ciclo ? ciclo.nome : 'Ciclo não encontrado';
  };

  const getProfessorNome = (professorId) => {
    const professor = professores.find(p => p.id === professorId);
    return professor ? professor.nome : '';
  };

  const groupedByDate = cronograma.reduce((acc, item) => {
    if (!acc[item.data]) {
      acc[item.data] = [];
    }
    acc[item.data].push(item);
    return acc;
  }, {});

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Presencial':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EAD':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Dia Sem aula':
      case 'Carnaval':
      case 'Data Magna':
      case 'Sexta Santa':
      case 'Dia do Trabalho':
      case 'Intervalo':
      case '7 de Setembro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Prévias':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            📅 Calendário de Aulas
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl">
            Acompanhe o cronograma completo das aulas, datas importantes e horários
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
      ) : Object.keys(groupedByDate).length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 italic">
              Nenhuma aula agendada no momento. Em breve o cronograma será atualizado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([data, aulas]) => (
            <Card key={data} className="border-2 border-gray-200 hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  {data}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {aulas.map((aula, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        aula.tipo === 'Dia Sem aula' || 
                        aula.tipo === 'Carnaval' || 
                        aula.tipo === 'Data Magna' || 
                        aula.tipo === 'Sexta Santa' || 
                        aula.tipo === 'Dia do Trabalho' || 
                        aula.tipo === 'Intervalo' || 
                        aula.tipo === '7 de Setembro'
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <Badge className={`${getTipoColor(aula.tipo)} border font-semibold`}>
                          {aula.tipo}
                        </Badge>
                        {aula.horario_inicio && aula.horario_fim && (
                          <Badge variant="outline" className="border-gray-400 text-gray-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {aula.horario_inicio} - {aula.horario_fim}
                          </Badge>
                        )}
                      </div>

                      {aula.disciplina_nome && (
                        <div className="mb-2">
                          <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            {aula.disciplina_nome}
                          </h4>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {aula.ciclo_id && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Ciclo:</span>
                            <span>{getCicloNome(aula.ciclo_id)}</span>
                          </div>
                        )}
                        {aula.professor_id && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Professor:</span>
                            <span>{getProfessorNome(aula.professor_id)}</span>
                          </div>
                        )}
                      </div>

                      {aula.observacoes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {aula.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}