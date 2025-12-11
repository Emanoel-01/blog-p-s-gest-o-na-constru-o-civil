import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ROIDashboard from '../components/incubadora/ROIDashboard';
import { 
  Target, 
  Lightbulb, 
  FileText, 
  Calendar, 
  Award,
  Briefcase,
  BookOpen,
  Cpu,
  Users,
  Building2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

export default function IncubadoraProfissionalPage() {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const { data: projetos = [] } = useQuery({
    queryKey: ['projetos-incubadora'],
    queryFn: async () => {
      const all = await base44.entities.Projeto.list();
      return all.filter(p => p.tipo_projeto === 'Incubadora Profissional');
    }
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.Evento.list('-data');
      return all.filter(e => projetoIds.includes(e.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const { data: artigos = [] } = useQuery({
    queryKey: ['artigos-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.ArtigoCientifico.list('-data_publicacao');
      return all.filter(a => projetoIds.includes(a.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const { data: canteiros = [] } = useQuery({
    queryKey: ['canteiros-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.CanteiroDidatico.list('-data');
      return all.filter(c => projetoIds.includes(c.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const { data: freelancers = [] } = useQuery({
    queryKey: ['freelancers-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.FreelancerNetwork.list('-data');
      return all.filter(f => projetoIds.includes(f.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('nome')
  });

  const { data: relatorios = [] } = useQuery({
    queryKey: ['relatorios-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.RelatorioTecnico.list('-data');
      return all.filter(r => projetoIds.includes(r.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const { data: producoes = [] } = useQuery({
    queryKey: ['producoes-incubadora'],
    queryFn: async () => {
      if (projetos.length === 0) return [];
      const projetoIds = projetos.map(p => p.id);
      const all = await base44.entities.ProducaoTecnologica.list('-data');
      return all.filter(p => projetoIds.includes(p.projeto_id));
    },
    enabled: projetos.length > 0
  });

  const allActivities = [
    ...eventos.map(e => ({ ...e, type: 'Evento', icon: Calendar, color: 'bg-blue-500' })),
    ...artigos.map(a => ({ ...a, type: 'Artigo Científico', icon: FileText, color: 'bg-purple-500' })),
    ...canteiros.map(c => ({ ...c, type: 'Canteiro Didático', icon: Building2, color: 'bg-green-500' })),
    ...freelancers.map(f => {
      const aluno = discentes.find(d => d.id === f.aluno_id);
      return { 
        ...f, 
        type: f.tipo || 'Network', 
        icon: Briefcase, 
        color: 'bg-orange-500',
        aluno_nome: aluno ? aluno.nome : 'N/A'
      };
    }),
    ...relatorios.map(r => ({ ...r, type: 'Relatório Técnico', icon: BookOpen, color: 'bg-cyan-500' })),
    ...producoes.map(p => ({ ...p, type: 'Produção Tecnológica', icon: Cpu, color: 'bg-pink-500' }))
  ].sort((a, b) => {
    const dateA = new Date(a.data || a.data_publicacao);
    const dateB = new Date(b.data || b.data_publicacao);
    return dateB - dateA;
  });

  const renderMediaFile = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      return (
        <video controls className="w-full rounded-lg">
          <source src={url} type={`video/${ext}`} />
        </video>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <img src={url} alt="Comprovação" className="w-full rounded-lg" />;
    } else if (ext === 'pdf') {
      return (
        <iframe src={url} className="w-full h-96 rounded-lg border" title="PDF"></iframe>
      );
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
          <ExternalLink className="w-4 h-4" />
          Abrir arquivo
        </a>
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12 px-2 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Incubadora Profissional</h1>
        </div>
        <p className="text-teal-50 text-sm sm:text-base md:text-lg">
          Capacitando alunos a integrarem conhecimentos teóricos com a prática do mercado de trabalho
        </p>
      </div>

      {/* Tabs para ROI e Atividades */}
      <Tabs defaultValue="roi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="roi" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">ROI e Métricas</span>
            <span className="sm:hidden">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="atividades" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Award className="w-3 h-3 sm:w-4 sm:h-4" />
            Atividades
          </TabsTrigger>
        </TabsList>

        {/* Aba de ROI */}
        <TabsContent value="roi" className="mt-6">
          <ROIDashboard
            projetos={projetos}
            eventos={eventos}
            artigos={artigos}
            canteiros={canteiros}
            freelancers={freelancers}
            relatorios={relatorios}
            producoes={producoes}
          />
        </TabsContent>

        {/* Aba de Atividades */}
        <TabsContent value="atividades" className="mt-6">

          {/* Conteúdo Fixo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                    Objetivo Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              Capacitar os alunos a integrarem os conhecimentos teóricos com a prática do mercado de trabalho. 
              Este projeto visa complementar a formação acadêmica dos alunos, proporcionando a vivência profissional 
              e o desenvolvimento de habilidades e competências valorizadas pelas empresas.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800 text-base sm:text-lg">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
              Objetivos Específicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span>Aplicar os conhecimentos adquiridos nos módulos do curso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span>Desenvolver estudos de caso práticos em áreas específicas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span>Estabelecer elo entre Esuda e instituições parceiras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span>Estimular pesquisa, extensão e inovação tecnológica</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-base sm:text-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              Justificativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              O projeto se insere nos Cursos de Pós-Graduação em Gestão e Tecnologias da Construção Civil, 
              enfrentando os desafios do mercado e contribuindo para a otimização de processos. 
              Visa preencher a lacuna no desenvolvimento profissional, alinhando teoria com prática.
            </p>
          </CardContent>
        </Card>
          </div>

          {/* Dashboard de Métricas */}
          <Card className="bg-white border-2 border-gray-200 mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-teal-600" />
            Resultados e Métricas
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-blue-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-blue-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{eventos.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Eventos</div>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-purple-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{artigos.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Artigos</div>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-green-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{canteiros.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Canteiros</div>
            </div>
            <div className="bg-orange-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-orange-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">{freelancers.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Network</div>
            </div>
            <div className="bg-cyan-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-cyan-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-600">{relatorios.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Relatórios</div>
            </div>
            <div className="bg-pink-50 p-2 sm:p-3 md:p-4 rounded-lg border-2 border-pink-200 text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600">{producoes.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Produções</div>
            </div>
          </div>
        </CardContent>
          </Card>

          {/* Listagem de Atividades */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Publicações e Atividades</h2>
            
            {allActivities.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Nenhuma atividade registrada ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
            {allActivities.map((activity, idx) => {
              const Icon = activity.icon;
              const isExpanded = expandedActivity === idx;
              const title = activity.nome_evento || activity.titulo_artigo || activity.nome_canteiro || 
                           activity.nome_atividade || activity.titulo_relatorio || activity.titulo_producao;
              const date = activity.data || activity.data_publicacao;

              return (
                <Card key={idx} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedActivity(isExpanded ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`${activity.color} p-3 rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <Badge className={`${activity.color} text-white mb-2`}>
                            {activity.type}
                          </Badge>
                          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                          <p className="text-sm text-gray-500">{date}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 space-y-3 sm:space-y-4 border-t border-gray-200 pt-3 sm:pt-4 md:pt-5">
                        {isFreelancer && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {activity.aluno_nome && (
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm">Aluno Responsável</h4>
                                <p className="text-gray-600 text-xs sm:text-sm">{activity.aluno_nome}</p>
                              </div>
                            )}
                            {activity.empresa_parceira && (
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm">Empresa Parceira</h4>
                                <p className="text-gray-600 text-xs sm:text-sm">{activity.empresa_parceira}</p>
                              </div>
                            )}
                            </div>
                            )}

                            {activity.resumo && (
                            <div>
                            <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Resumo</h4>
                            <p className="text-gray-600 text-xs sm:text-sm">{activity.resumo}</p>
                            </div>
                            )}

                            {activity.descricao_completa && (
                            <div>
                            <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Descrição Completa</h4>
                            <p className="text-gray-600 text-xs sm:text-sm whitespace-pre-wrap">{activity.descricao_completa}</p>
                            </div>
                            )}

                            {activity.comprovacao_urls && activity.comprovacao_urls.length > 0 && (
                            <div>
                            <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 text-xs sm:text-sm">Comprovações e Mídias</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              {activity.comprovacao_urls.map((url, urlIdx) => (
                                <div key={urlIdx} className="border rounded-lg p-3 bg-gray-50">
                                  {renderMediaFile(url)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}