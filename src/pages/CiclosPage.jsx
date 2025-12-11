import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
    'from-green-100 to-green-200',
    'from-green-200 to-green-300',
    'from-gray-100 to-gray-200',
    'from-green-100 to-gray-200',
    'from-gray-200 to-green-200',
    'from-green-50 to-green-100'
  ];

  return (
    <>
      <Helmet>
        <title>Ciclos de Conhecimento ESUDA | Arquitetura Curricular Modular em Construção Civil</title>
        <meta name="description" content="Arquitetura curricular modular ESUDA: ciclos de conhecimento que você combina para formar sua especialização. BIM, Gestão, Manutenção, Legal e Tecnologias 4.0." />
        <meta name="keywords" content="ciclos de conhecimento, currículo modular construção civil, disciplinas BIM, gestão de obras, ESUDA" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/CiclosPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ciclos de Conhecimento ESUDA | Arquitetura Curricular Modular" />
        <meta property="og:description" content="Sistema modular inovador: combine ciclos de conhecimento e construa sua especialização sob medida." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/CiclosPage" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Ciclos de Conhecimento ESUDA",
            "description": "Ciclos modulares de conhecimento em Construção Civil",
            "itemListElement": ciclos.map((ciclo, index) => ({
              "@type": "Course",
              "position": index + 1,
              "name": ciclo.nome,
              "description": `Ciclo de ${ciclo.carga_horaria} horas`,
              "provider": {
                "@type": "Organization",
                "name": "ESUDA"
              },
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseWorkload": `PT${ciclo.carga_horaria}H`
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Ciclos de Conhecimento
          </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
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
                <div className={`bg-gradient-to-r ${gradientClass} p-4 sm:p-6 text-gray-800`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">{ciclo.nome}</h2>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                            <Badge className="bg-white border-green-600 text-gray-900 text-xs sm:text-sm">
                              <Clock className="w-3 h-3 mr-1" />
                              {ciclo.carga_horaria}h
                            </Badge>
                            {hasDisciplinas && (
                              <Badge className="bg-white border-green-600 text-gray-900 text-xs sm:text-sm">
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
                      variant="outline"
                      className="text-gray-800 hover:bg-white border-2 border-green-600 w-full sm:w-auto text-sm sm:text-base"
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
                  <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                    {!hasDisciplinas ? (
                      <p className="text-center text-gray-500 italic py-6 sm:py-8 text-sm sm:text-base">
                        Nenhuma disciplina cadastrada para este ciclo ainda.
                      </p>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {disciplinasArray.map((disciplina, discIndex) => {
                          const isDiscExpanded = expandedDisciplina === `${ciclo.id}-${discIndex}`;
                          const discKey = `${ciclo.id}-${discIndex}`;
                          
                          // Se for string (formato antigo), mostrar apenas o nome
                          if (typeof disciplina === 'string') {
                            return (
                              <div key={discIndex} className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-green-600 shadow-sm">
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">{disciplina}</p>
                              </div>
                            );
                          }

                          // Se for objeto (formato novo com ementa)
                          return (
                            <div 
                              key={discIndex} 
                              className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 transition-all shadow-md"
                            >
                              <div className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                  <div className="flex-1 w-full">
                                    <div className="flex items-start gap-2 sm:gap-3 mb-2">
                                      <div className="bg-green-100 text-green-700 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                        {discIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight">
                                          {disciplina.nome}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                          {disciplina.modalidade && (
                                           <Badge variant="outline" className={`text-xs sm:text-sm ${
                                             disciplina.modalidade === 'Presencial' 
                                               ? 'border-green-600 text-green-700 bg-green-50' 
                                               : 'border-blue-600 text-blue-700 bg-blue-50'
                                           }`}>
                                             {disciplina.modalidade}
                                           </Badge>
                                          )}
                                          {disciplina.carga_horaria && (
                                            <Badge variant="outline" className="border-gray-400 text-gray-700 text-xs sm:text-sm">
                                              {disciplina.carga_horaria}h
                                            </Badge>
                                          )}
                                        </div>
                                        {disciplina.ementa_sintetica && (
                                          <p className="text-gray-700 leading-relaxed text-justify text-xs sm:text-sm md:text-base">
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
                                      className="flex-shrink-0 w-full sm:w-auto text-xs sm:text-sm"
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
                                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-4">
                                    {disciplina.ementa_detalhada && (
                                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          📖 Ementa Detalhada
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.ementa_detalhada}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.conhecimento_adquirido && (
                                      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                                        <h4 className="text-xs sm:text-sm font-bold text-green-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          🎓 Conhecimento Adquirido
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.conhecimento_adquirido}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.habilidade_tecnica && (
                                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          🔧 Habilidade Técnica (Entregável)
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800 text-justify leading-relaxed">
                                          {disciplina.habilidade_tecnica}
                                        </p>
                                      </div>
                                    )}

                                    {disciplina.habilidade_comportamental && (
                                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                                          💡 Habilidade Comportamental
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-800">
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
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
          <Link to={createPageUrl('DiferenciaisPage')} className="w-full sm:w-auto">
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
              ← Voltar
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
              Ver Especializações
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}