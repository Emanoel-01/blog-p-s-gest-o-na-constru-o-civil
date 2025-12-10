import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowRight, ChevronDown, ChevronUp, BookOpen, Clock, GraduationCap } from 'lucide-react';

export default function CiclosPage() {
  const [expandedCiclo, setExpandedCiclo] = useState(null);
  const [expandedDisciplina, setExpandedDisciplina] = useState(null);

  const { data: ciclos = [], isLoading } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const toggleCiclo = (cicloId) => {
    setExpandedCiclo(expandedCiclo === cicloId ? null : cicloId);
    setExpandedDisciplina(null);
  };

  const toggleDisciplina = (discIndex) => {
    setExpandedDisciplina(expandedDisciplina === discIndex ? null : discIndex);
  };

  const gradientColors = [
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-amber-500 to-yellow-600'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Ciclos de Conhecimento
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Nossa arquitetura curricular modular permite que você construa sua especialização de forma inteligente e estratégica
        </p>
      </div>

      {/* Ciclos Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando ciclos...</p>
        </div>
      ) : ciclos.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 italic">
              Nenhum ciclo disponível no momento. Aguarde atualizações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {ciclos.map((ciclo, index) => {
            const isExpanded = expandedCiclo === ciclo.id;
            const gradientClass = gradientColors[index % gradientColors.length];
            const disciplinasArray = Array.isArray(ciclo.disciplinas) ? ciclo.disciplinas : [];
            const hasDisciplinas = disciplinasArray.length > 0;
            
            // Verificar se as disciplinas são objetos ou strings
            const isObjectDisciplinas = hasDisciplinas && typeof disciplinasArray[0] === 'object';

            return (
              <Card 
                key={ciclo.id} 
                className="overflow-hidden border-2 border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold">{ciclo.nome}</h2>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                              <Clock className="w-3 h-3 mr-1" />
                              {ciclo.carga_horaria}h
                            </Badge>
                            {hasDisciplinas && (
                              <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {disciplinasArray.length} disciplina{disciplinasArray.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleCiclo(ciclo.id)}
                      variant="ghost"
                      className="text-white hover:bg-white/20 border-2 border-white/50"
                    >
                      {isExpanded ? (
                        <>
                          Ocultar <ChevronUp className="ml-2 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Ver Disciplinas <ChevronDown className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
                    {!hasDisciplinas ? (
                      <p className="text-center text-gray-500 italic py-8">
                        Nenhuma disciplina cadastrada para este ciclo ainda.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {disciplinasArray.map((disciplina, discIndex) => {
                          const isDiscExpanded = expandedDisciplina === `${ciclo.id}-${discIndex}`;
                          const discKey = `${ciclo.id}-${discIndex}`;
                          
                          // Se for string (formato antigo), mostrar apenas o nome
                          if (typeof disciplina === 'string') {
                            return (
                              <div key={discIndex} className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                <p className="font-semibold text-gray-800">{disciplina}</p>
                              </div>
                            );
                          }

                          // Se for objeto (formato novo com ementa)
                          return (
                            <div 
                              key={discIndex} 
                              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-md"
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-2">
                                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {discIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                          {disciplina.nome}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {disciplina.modalidade && (
                                            <Badge variant="outline" className={
                                              disciplina.modalidade === 'Presencial' 
                                                ? 'border-green-500 text-green-700 bg-green-50' 
                                                : 'border-blue-500 text-blue-700 bg-blue-50'
                                            }>
                                              {disciplina.modalidade}
                                            </Badge>
                                          )}
                                          {disciplina.carga_horaria && (
                                            <Badge variant="outline" className="border-gray-400 text-gray-700">
                                              {disciplina.carga_horaria}h
                                            </Badge>
                                          )}
                                        </div>
                                        {disciplina.ementa_sintetica && (
                                          <p className="text-gray-700 leading-relaxed text-justify">
                                            {disciplina.ementa_sintetica}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {(disciplina.ementa_detalhada || disciplina.conhecimento_adquirido || disciplina.habilidade_tecnica || disciplina.habilidade_comportamental) && (
                                    <Button
                                      onClick={() => toggleDisciplina(discKey)}
                                      variant="outline"
                                      size="sm"
                                      className="flex-shrink-0"
                                    >
                                      {isDiscExpanded ? (
                                        <>
                                          <ChevronUp className="w-4 h-4" />
                                        </>
                                      ) : (
                                        <>
                                          Detalhes <ChevronDown className="w-4 h-4 ml-1" />
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {isDiscExpanded && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                    {disciplina.ementa_detalhada && (
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                          📖 Ementa Detalhada
                                        </h4>
                                        <p className="text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.ementa_detalhada}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.conhecimento_adquirido && (
                                      <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                                          🎓 Conhecimento Adquirido
                                        </h4>
                                        <p className="text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.conhecimento_adquirido}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.habilidade_tecnica && (
                                      <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                                          🔧 Habilidade Técnica (Entregável)
                                        </h4>
                                        <p className="text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.habilidade_tecnica}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.habilidade_comportamental && (
                                      <div className="bg-amber-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                                          💡 Habilidade Comportamental
                                        </h4>
                                        <p className="text-sm text-gray-800">
                                          {disciplina.habilidade_comportamental}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-8">
        <Link to={createPageUrl('DiferenciaisPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('EspecializacoesPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Especializações
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}