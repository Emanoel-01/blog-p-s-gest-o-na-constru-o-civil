import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Clock, User, BookOpen } from 'lucide-react';

export default function DayDetailModal({ day, aulas, professores, ciclos, onClose }) {
  if (!aulas || aulas.length === 0) return null;

  const getProfessorNome = (professorId) => {
    const professor = professores.find(p => p.id === professorId);
    return professor ? professor.nome : 'Não especificado';
  };

  const getCicloNome = (cicloId) => {
    const ciclo = ciclos.find(c => c.id === cicloId);
    return ciclo ? ciclo.nome : 'Não especificado';
  };

  const eadDisciplines = [
    'Negociação e Gestão de Conflitos',
    'Liderança e Alta Performance',
    'Competências Estratégicas, Liderança e Alta Performance',
    'Solução Criativa de Problemas (Design Thinking)',
    'Solução Criativa de Problemas Complexos (Design Thinking)',
    'Metodologia da Pesquisa e Didática',
    'Metodologia da Pesquisa e Didática do Ensino Superior',
    'Novas Fontes de Receita: Elaboração de Laudos',
    'Novas Fontes de Receita: Elaboração de Laudos e Perícias'
  ];

  const getTipoColor = (aula) => {
    // Sem aula
    if (['Carnaval', 'Data Magna', 'Sexta Santa', 'Dia do Trabalho', 'Intervalo', '7 de Setembro', 'Dia Sem aula', 'Prévias'].includes(aula.tipo)) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    
    // Verificar se é disciplina EAD pela lista
    if (eadDisciplines.includes(aula.disciplina_nome)) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    
    // Disciplinas comuns por modalidade (agrupadas)
    if (aula.isCommon || aula.tipo === 'Presencial') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (aula.tipo === 'EAD') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    
    // Disciplinas específicas por curso
    switch(aula.tipo) {
      case 'gestao': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'bim': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'manutencao': return 'bg-green-100 text-green-800 border-green-300';
      case 'legal': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">
            Aulas do dia {day} - {aulas[0].data}
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {aulas.map((aula, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${getTipoColor(aula)} border font-semibold`}>
                    {['Carnaval', 'Data Magna', 'Sexta Santa', 'Dia do Trabalho', 'Intervalo', '7 de Setembro', 'Dia Sem aula', 'Prévias'].includes(aula.tipo) 
                      ? 'FERIADO'
                      : eadDisciplines.includes(aula.disciplina_nome)
                        ? 'EAD - Todos os Cursos'
                        : aula.isCommon || aula.tipo === 'Presencial'
                          ? 'Presencial/Remoto - Todos os Cursos'
                          : aula.tipo === 'EAD'
                            ? 'EAD - Todos os Cursos'
                            : aula.tipo === 'gestao'
                              ? 'Gestão de Projetos'
                              : aula.tipo === 'bim'
                                ? 'Tecnologia BIM'
                                : aula.tipo === 'manutencao'
                                  ? 'Manutenção'
                                  : aula.tipo === 'legal'
                                    ? 'Engenharia Legal'
                                    : aula.tipo
                    }
                  </Badge>
                  {aula.horario_inicio && aula.horario_fim && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {aula.horario_inicio} - {aula.horario_fim}
                    </div>
                  )}
                </div>

                {aula.disciplina_nome && (
                  <div className="mb-3">
                    <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {aula.disciplina_nome}
                    </h4>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {aula.ciclo_id && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Ciclo:</span>
                      <span className="text-gray-600">{getCicloNome(aula.ciclo_id)}</span>
                    </div>
                  )}
                  {aula.professor_id && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-700">Professor:</span>
                      <span className="text-gray-600">{getProfessorNome(aula.professor_id)}</span>
                    </div>
                  )}
                </div>

                {aula.observacoes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      <strong>Observações:</strong> {aula.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}