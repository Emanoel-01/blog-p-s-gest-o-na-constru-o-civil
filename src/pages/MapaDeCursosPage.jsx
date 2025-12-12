import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { BookOpen, ChevronRight, Clock, GraduationCap, Filter } from 'lucide-react';

export default function MapaDeCursosPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const { data: especializacoes = [], isLoading: loadingEspec } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const filterOptions = [
    { id: 'Todos', label: 'Todas as Áreas', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { id: 'BIM', label: 'BIM', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { id: 'Gestão', label: 'Gestão de Projetos e Obras', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { id: 'Manutenção', label: 'Manutenção Predial', color: 'bg-green-100 text-green-800 border-green-300' },
    { id: 'Legal', label: 'Engenharia Legal', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  ];

  const filteredEspecializacoes = useMemo(() => {
    if (selectedFilter === 'Todos') return especializacoes;
    
    return especializacoes.filter(espec => {
      const nome = espec.nome.toLowerCase();
      if (selectedFilter === 'BIM') return nome.includes('bim') || nome.includes('tecnologia');
      if (selectedFilter === 'Gestão') return nome.includes('gestão') || nome.includes('projetos') || nome.includes('obras');
      if (selectedFilter === 'Manutenção') return nome.includes('manutenção') || nome.includes('predial');
      if (selectedFilter === 'Legal') return nome.includes('legal') || nome.includes('perícia');
      return true;
    });
  }, [especializacoes, selectedFilter]);

  const getCicloById = (id) => ciclos.find(c => c.id === id);

  const isCicloComum = (ciclo) => {
    if (!ciclo) return false;
    const nome = ciclo.nome.toLowerCase();
    return nome.includes('comum') || nome.includes('base') || nome.includes('estratégias') || nome.includes('liderança');
  };

  const getCicloAreaColor = (espec) => {
    const nome = espec.nome.toLowerCase();
    if (nome.includes('bim') || nome.includes('tecnologia')) return 'from-cyan-50 to-cyan-100 border-cyan-200';
    if (nome.includes('gestão') || nome.includes('projetos') || nome.includes('obras')) return 'from-orange-50 to-orange-100 border-orange-200';
    if (nome.includes('manutenção') || nome.includes('predial')) return 'from-green-50 to-green-100 border-green-200';
    if (nome.includes('legal') || nome.includes('perícia')) return 'from-purple-50 to-purple-100 border-purple-200';
    return 'from-gray-50 to-gray-100 border-gray-200';
  };

  return (
    <>
      <Helmet>
        <title>Mapa de Cursos Interativo | Navegue pelas Especializações ESUDA</title>
        <meta name="description" content="Explore visualmente as especializações, ciclos de conhecimento e disciplinas da ESUDA. Navegue pelo currículo completo com filtros interativos." />
        <meta name="keywords" content="mapa de cursos, currículo ESUDA, especializações, ciclos de conhecimento, disciplinas" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/MapaDeCursosPage" />
      </Helmet>

      <div className="space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            🗺️ Mapa de Cursos Interativo
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            Navegue visualmente pelo currículo completo: especializações, ciclos de conhecimento e disciplinas interligadas.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Filtrar por Área de Especialização</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map(option => (
              <Button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                variant={selectedFilter === option.id ? "default" : "outline"}
                className={`${selectedFilter === option.id ? option.color + ' border-2 font-bold' : 'border-gray-300'} text-xs sm:text-sm`}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Contador */}
          <div className="text-sm text-gray-600 font-semibold">
            📊 Mostrando <span className="text-blue-600 font-bold">{filteredEspecializacoes.length}</span> Especialização(ões) filtrada(s).
          </div>
        </div>

        {/* Loading State */}
        {loadingEspec ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando mapa de cursos...</p>
          </div>
        ) : filteredEspecializacoes.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 italic">
                Nenhuma especialização encontrada para o filtro selecionado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEspecializacoes.map((espec) => {
              const ciclosEspec = (espec.ciclos || []).map(id => getCicloById(id)).filter(Boolean);
              const totalDisciplinas = ciclosEspec.reduce((acc, ciclo) => {
                const disciplinas = Array.isArray(ciclo.disciplinas) ? ciclo.disciplinas : [];
                return acc + disciplinas.length;
              }, 0);

              return (
                <Card key={espec.id} className={`bg-gradient-to-r ${getCicloAreaColor(espec)} border-2 hover:shadow-2xl transition-all`}>
                  {/* Cartão de Especialização */}
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          Especialização em {espec.nome}
                        </CardTitle>
                        {espec.resumo && (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {espec.resumo.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-600 text-white border-blue-700 font-bold">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {espec.carga_horaria_total}h
                        </Badge>
                        {totalDisciplinas > 0 && (
                          <Badge className="bg-green-600 text-white border-green-700 font-bold">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {totalDisciplinas} Disciplinas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Accordions de Ciclos */}
                    {ciclosEspec.length > 0 ? (
                      <Accordion type="single" collapsible className="space-y-3">
                        {ciclosEspec.map((ciclo, idx) => {
                          const disciplinasArray = Array.isArray(ciclo.disciplinas) ? ciclo.disciplinas : [];
                          const isComum = isCicloComum(ciclo);

                          return (
                            <AccordionItem key={idx} value={`ciclo-${idx}`} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 text-left w-full">
                                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{ciclo.nome}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge className={`text-xs ${isComum ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
                                        {isComum ? 'Ciclo Comum' : 'Ciclo Específico'}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-gray-400 text-gray-700">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {ciclo.carga_horaria}h
                                      </Badge>
                                      {disciplinasArray.length > 0 && (
                                        <Badge variant="outline" className="text-xs border-gray-400 text-gray-700">
                                          {disciplinasArray.length} Disciplinas
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="px-4 pb-4">
                                {disciplinasArray.length === 0 ? (
                                  <p className="text-sm text-gray-500 italic py-2">
                                    Nenhuma disciplina cadastrada para este ciclo.
                                  </p>
                                ) : (
                                  <div className="space-y-2 mt-2">
                                    {disciplinasArray.map((disciplina, discIdx) => {
                                      // Se for string (formato antigo)
                                      if (typeof disciplina === 'string') {
                                        return (
                                          <div key={discIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-gray-800">{disciplina}</span>
                                          </div>
                                        );
                                      }

                                      // Se for objeto (formato novo com ementa)
                                      return (
                                        <div key={discIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                          <div className="flex items-start gap-3">
                                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900">{disciplina.nome}</span>
                                                {disciplina.modalidade && (
                                                  <Badge className={`text-xs ${disciplina.modalidade === 'Presencial' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                                                    {disciplina.modalidade}
                                                  </Badge>
                                                )}
                                                {disciplina.carga_horaria && (
                                                  <Badge variant="outline" className="text-xs border-gray-400 text-gray-700">
                                                    {disciplina.carga_horaria}h
                                                  </Badge>
                                                )}
                                              </div>
                                              {disciplina.ementa_sintetica && (
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                  {disciplina.ementa_sintetica}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-gray-500 italic py-4">
                        Nenhum ciclo vinculado a esta especialização ainda.
                      </p>
                    )}

                    {/* Link para detalhes */}
                    {espec.link_externo && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <a href={espec.link_externo} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            Ver Detalhes Completos da Especialização
                            <ChevronRight className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
          <Link to={createPageUrl('Homepage')} className="w-full sm:w-auto">
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
              ← Voltar para Home
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
              Ver Lista de Especializações
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}