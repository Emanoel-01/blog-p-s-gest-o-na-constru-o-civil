import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    ...freelancers.map(f => ({ ...f, type: 'Freelancer Network', icon: Briefcase, color: 'bg-orange-500' })),
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-10 h-10" />
          <h1 className="text-4xl font-extrabold">Incubadora Profissional</h1>
        </div>
        <p className="text-teal-50 text-lg">
          Capacitando alunos a integrarem conhecimentos teóricos com a prática do mercado de trabalho
        </p>
      </div>

      {/* Conteúdo Fixo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="w-6 h-6" />
              Objetivo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              Capacitar os alunos a integrarem os conhecimentos teóricos com a prática do mercado de trabalho. 
              Este projeto visa complementar a formação acadêmica dos alunos, proporcionando a vivência profissional 
              e o desenvolvimento de habilidades e competências valorizadas pelas empresas.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Lightbulb className="w-6 h-6" />
              Objetivos Específicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Award className="w-6 h-6" />
              Justificativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              O projeto se insere nos Cursos de Pós-Graduação em Gestão e Tecnologias da Construção Civil, 
              enfrentando os desafios do mercado e contribuindo para a otimização de processos. 
              Visa preencher a lacuna no desenvolvimento profissional, alinhando teoria com prática.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard de Métricas */}
      <Card className="bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="w-7 h-7 text-teal-600" />
            Resultados e Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{eventos.length}</div>
              <div className="text-sm text-gray-600 mt-1">Eventos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{artigos.length}</div>
              <div className="text-sm text-gray-600 mt-1">Artigos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 text-center">
              <div className="text-3xl font-bold text-green-600">{canteiros.length}</div>
              <div className="text-sm text-gray-600 mt-1">Canteiros</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200 text-center">
              <div className="text-3xl font-bold text-orange-600">{freelancers.length}</div>
              <div className="text-sm text-gray-600 mt-1">Freelancers</div>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg border-2 border-cyan-200 text-center">
              <div className="text-3xl font-bold text-cyan-600">{relatorios.length}</div>
              <div className="text-sm text-gray-600 mt-1">Relatórios</div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-200 text-center">
              <div className="text-3xl font-bold text-pink-600">{producoes.length}</div>
              <div className="text-sm text-gray-600 mt-1">Produções</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listagem de Atividades */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Publicações e Atividades</h2>
        
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
                      <div className="px-5 pb-5 space-y-4 border-t border-gray-200 pt-5">
                        {activity.resumo && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Resumo</h4>
                            <p className="text-gray-600 text-sm">{activity.resumo}</p>
                          </div>
                        )}
                        
                        {activity.descricao_completa && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Descrição Completa</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{activity.descricao_completa}</p>
                          </div>
                        )}

                        {activity.comprovacao_urls && activity.comprovacao_urls.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Comprovações e Mídias</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}