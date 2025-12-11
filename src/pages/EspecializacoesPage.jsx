import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ArrowRight, 
  ExternalLink, 
  Calendar, 
  BookOpen, 
  Users, 
  Handshake, 
  Cpu, 
  Star, 
  ChevronDown,
  Clock,
  CalendarDays,
  Video,
  DollarSign,
  UserPlus, // New icon import
  LogIn     // New icon import
} from 'lucide-react';

export default function EspecializacoesPage() {
  const [expandedEspec, setExpandedEspec] = useState(null);

  const { data: especializacoes = [], isLoading: loadingEspec } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const { data: ciclos = [] } = useQuery({
    queryKey: ['ciclos'],
    queryFn: () => base44.entities.Ciclo.list('ordem')
  });

  const { data: professores = [] } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem')
  });

  const { data: parceiros = [] } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('ordem')
  });

  const { data: tecnologias = [] } = useQuery({
    queryKey: ['tecnologias'],
    queryFn: () => base44.entities.Tecnologia.list('ordem')
  });

  const getCicloById = (id) => ciclos.find(c => c.id === id);
  const getProfessorById = (id) => professores.find(p => p.id === id);
  const getParceiroById = (id) => parceiros.find(p => p.id === id);
  const getTecnologiaById = (id) => tecnologias.find(t => t.id === id);

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Inscrições Abertas': return 'bg-green-100 text-green-800 border-green-300';
      case 'Matrículas Abertas': return 'bg-blue-100 text-blue-800 border-blue-300'; // Updated status text
      case 'Turma Iniciada (Aceitando novos alunos)': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // New status
      case 'Fechado': return 'bg-red-100 text-red-800 border-red-300';
      case 'Aguardando Nova Turma': return 'bg-gray-100 text-gray-800 border-gray-300'; // Updated color for this status
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleEspecializacao = (especId) => {
    setExpandedEspec(expandedEspec === especId ? null : especId);
  };

  return (
    <>
      <Helmet>
        <title>Especializações em Construção Civil | Pós-Graduação ESUDA - BIM, Gestão de Obras, Manutenção</title>
        <meta name="description" content="Conheça as especializações da ESUDA: BIM, Gestão de Projetos e Obras, Manutenção Predial, Engenharia Legal e Tecnologias 4.0. Cursos com ciclos modulares de 360h. Inscrições abertas!" />
        <meta name="keywords" content="especialização BIM, pós-graduação gestão de obras, curso manutenção predial, engenharia legal, especialização construção civil, ESUDA Recife" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/EspecializacoesPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Especializações em Construção Civil | ESUDA" />
        <meta property="og:description" content="Especializações com ciclos modulares: BIM, Gestão de Obras, Manutenção Predial, Engenharia Legal e Tecnologias 4.0. 360h de conhecimento aplicado." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/EspecializacoesPage" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Especializações ESUDA em Construção Civil",
            "description": "Lista de especializações oferecidas pela ESUDA",
            "itemListElement": especializacoes.map((espec, index) => ({
              "@type": "Course",
              "position": index + 1,
              "name": `Especialização em ${espec.nome}`,
              "description": espec.resumo || `Especialização em ${espec.nome}`,
              "provider": {
                "@type": "Organization",
                "name": "ESUDA",
                "sameAs": "https://esuda.edu.br"
              },
              "courseMode": espec.formato_aulas?.join(", "),
              "timeRequired": `P${espec.duracao_meses || 12}M`,
              "educationalCredentialAwarded": "Especialização",
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseWorkload": `PT${espec.carga_horaria_total}H`
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Nossas Especializações em Construção Civil</h1>
      <p className="text-gray-600 mb-4 sm:mb-6 text-justify text-sm sm:text-base">
        Uma especialização completa é formada pela combinação de ciclos que somam, no mínimo, 360 horas.
        Escolha os ciclos que mais interessam a você!
      </p>

      {loadingEspec ? (
        <p className="text-gray-600">Carregando especializações...</p>
      ) : especializacoes.length === 0 ? (
        <p className="text-gray-500 italic text-justify">
          Nenhuma especialização disponível no momento. Por favor, aguarde enquanto atualizamos o conteúdo.
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {especializacoes.map((espec) => {
            const isExpanded = expandedEspec === espec.id;

            return (
              <Card key={espec.id} className="bg-white border-2 border-gray-200 hover:shadow-xl transition-shadow">
                <div
                  onClick={() => toggleEspecializacao(espec.id)}
                  className="cursor-pointer p-3 sm:p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                      Especialização em {espec.nome}
                    </h3>
                    {espec.status_inscricao && (
                      <Badge className={`${getStatusBadgeColor(espec.status_inscricao)} border font-semibold text-xs sm:text-sm`}>
                        {espec.status_inscricao}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {isExpanded && (
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-3 sm:pb-4 border-b">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-500">Carga Horária</p>
                          <p className="font-bold text-gray-800 text-xs sm:text-sm">{espec.carga_horaria_total}h</p>
                        </div>
                      </div>

                      {/* Updated: Handle formato_aulas as an array */}
                      {espec.formato_aulas && espec.formato_aulas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Formato</p>
                            <p className="font-bold text-gray-800 text-sm">{espec.formato_aulas.join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {espec.dias_aulas && espec.dias_aulas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">Dia(s)</p>
                            <p className="font-bold text-gray-800 text-sm">
                              {espec.dias_aulas.map(d => d.substring(0, 3)).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {espec.horario_inicio && espec.horario_fim && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-500">Horário</p>
                            <p className="font-bold text-gray-800">{espec.horario_inicio} - {espec.horario_fim}</p>
                          </div>
                        </div>
                      )}

                      {espec.duracao_meses && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-xs text-gray-500">Duração</p>
                            <p className="font-bold text-gray-800">{espec.duracao_meses} meses</p>
                          </div>
                        </div>
                      )}

                      {espec.periodo_inscricao && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Inscrições</p>
                            <p className="font-semibold text-gray-700 text-sm">{espec.periodo_inscricao}</p>
                          </div>
                        </div>
                      )}

                      {espec.data_inicio && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Início das Aulas</p>
                            <p className="font-semibold text-gray-700 text-sm">{espec.data_inicio}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {espec.resumo && (
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 leading-relaxed text-justify text-xs sm:text-sm">{espec.resumo}</p>
                      </div>
                    )}

                    {espec.condicoes_pagamento && espec.condicoes_pagamento.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span>Condições de Pagamento:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {espec.condicoes_pagamento.map((cond, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg text-sm font-semibold ${
                                cond.destaque
                                  ? 'bg-green-100 border-2 border-green-500 text-green-900'
                                  : 'bg-white border-2 border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {cond.destaque && <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />}
                                <span>{cond.descricao}</span>
                              </div>
                              {cond.destaque && (
                                <span className="mt-2 block text-xs bg-green-600 text-white px-2 py-1 rounded-full w-fit">
                                  Melhor Condição
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New: Action buttons for Saiba Mais, Inscreva-se, Matricule-se */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      {espec.link_externo && (
                        <a href={espec.link_externo} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-full sm:min-w-[180px]">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm">
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Saiba Mais
                          </Button>
                        </a>
                      )}
                      {espec.link_inscricao && (
                        <a href={espec.link_inscricao} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-full sm:min-w-[180px]">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm">
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Inscreva-se Agora
                          </Button>
                        </a>
                      )}
                      {espec.link_matricula && (
                        <a href={espec.link_matricula} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-full sm:min-w-[180px]">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm">
                            <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Matricule-se
                          </Button>
                        </a>
                      )}
                    </div>

                    {espec.ciclos && espec.ciclos.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Ciclos de Conhecimento:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {espec.ciclos.map((cicloId) => {
                            const ciclo = getCicloById(cicloId);
                            if (!ciclo) return null;
                            
                            return (
                              <Link key={cicloId} to={createPageUrl('CiclosPage')} className="group">
                                <div className="bg-white px-3 py-1.5 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:shadow-md transition-all text-sm group-hover:bg-blue-50 font-semibold text-blue-800">
                                  {ciclo.nome} ({ciclo.carga_horaria}h)
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {espec.professores && espec.professores.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          Professores:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {espec.professores.map((professorId) => {
                            const professor = getProfessorById(professorId);
                            if (!professor) return null;
                            
                            return (
                              <div key={professorId} className="bg-purple-50 px-3 py-1.5 rounded-full border border-purple-300 text-sm font-medium text-purple-800">
                                {professor.nome}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {espec.parceiros && espec.parceiros.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-orange-600" />
                          Parceiros:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {espec.parceiros.map((parceiroId) => {
                            const parceiro = getParceiroById(parceiroId);
                            if (!parceiro) return null;
                            
                            return (
                              <div key={parceiroId} className="bg-orange-50 px-3 py-1.5 rounded-full border border-orange-300 text-sm font-medium text-orange-800">
                                {parceiro.nome}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {espec.tecnologias && espec.tecnologias.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-green-600" />
                          Tecnologias:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {espec.tecnologias.map((tecnologiaId) => {
                            const tecnologia = getTecnologiaById(tecnologiaId);
                            if (!tecnologia) return null;
                            
                            return (
                              <div key={tecnologiaId} className="bg-green-50 px-3 py-1.5 rounded-full border border-green-300 text-sm font-bold text-green-800">
                                {tecnologia.nome}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('CoordenadorPage')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Conheça a Coordenação
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
      </div>
    </>
  );
}