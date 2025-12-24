import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Zap, Building2, Sparkles, Lightbulb, Eye, FileText, Shield, ExternalLink, Newspaper, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

export default function AplicativosInteligentesPage() {
  const { data: noticias = [] } = useQuery({
    queryKey: ['aplicativo-noticias-public'],
    queryFn: () => base44.entities.AplicativoNoticia.list('-data_publicacao', 10)
  });

  const noticiasDestaque = noticias.filter(n => n.destaque).slice(0, 3);
  const outrasNoticias = noticias.filter(n => !n.destaque).slice(0, 6);

  const aplicativos = [
    {
      nome: 'GPO 4.0',
      categoria: 'Gestão de Projetos e Obras',
      descricao: 'Plano Interativo de Gestão de Projetos e Obras. Transforme sua forma de trabalhar com IA aplicada à gestão de projetos, orçamentos, planejamento e execução de obras.',
      url: 'https://esuda-gpo.base44.app',
      icon: Zap,
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'bg-blue-100 text-blue-800'
    },
    {
      nome: 'Predial 4.0',
      categoria: 'Manutenção Predial',
      descricao: 'Plano Interativo de Manutenção Predial. Transforme sua forma de trabalhar com IA aplicada à gestão de Manutenção Predial.',
      url: 'https://esuda-predial.base44.app',
      icon: Building2,
      gradient: 'from-purple-600 to-pink-600',
      badge: 'bg-purple-100 text-purple-800'
    },
    {
      nome: 'EngenhariaPro AI',
      categoria: 'Prompt do Mestre',
      descricao: 'Assistente inteligente com IA para engenheiros e profissionais da construção civil. Respostas especializadas e soluções técnicas.',
      url: 'https://promptdomestre.base44.app',
      icon: Sparkles,
      gradient: 'from-green-600 to-emerald-600',
      badge: 'bg-green-100 text-green-800'
    },
    {
      nome: 'InteriorOS',
      categoria: 'Design de Interiores com IA',
      descricao: 'Sistema inteligente para projetos de design de interiores. Crie ambientes incríveis com auxílio de inteligência artificial.',
      url: 'https://interior-ia.base44.app',
      icon: Lightbulb,
      gradient: 'from-orange-600 to-red-600',
      badge: 'bg-orange-100 text-orange-800'
    },
    {
      nome: 'Vistoria Cautelar Pro',
      categoria: 'Vistorias Cautelares',
      descricao: 'Sistema especializado em vistorias cautelares. Gerencie, documente e automatize processos de vistoria predial.',
      url: 'https://vistoria-cautelar-pro-34e39a54.base44.app',
      icon: Shield,
      gradient: 'from-teal-600 to-cyan-600',
      badge: 'bg-teal-100 text-teal-800'
    },
    {
      nome: 'SmartVisto',
      categoria: 'Vistorias Inteligentes',
      descricao: 'Plataforma de vistorias inteligentes com IA. Automatize inspeções e gere relatórios profissionais rapidamente.',
      url: 'https://smart-visto-vistorias-inteligentes-6f115f68.base44.app',
      icon: Eye,
      gradient: 'from-pink-600 to-rose-600',
      badge: 'bg-pink-100 text-pink-800'
    },
    {
      nome: 'Amorim Responde',
      categoria: 'Manutenção Predial Inteligente',
      descricao: 'Assistente especializado em manutenção predial. Tire dúvidas e obtenha orientações técnicas com inteligência artificial.',
      url: 'https://amorim-responde-manutencao-predial-afd5910a.base44.app',
      icon: Building2,
      gradient: 'from-indigo-600 to-purple-600',
      badge: 'bg-indigo-100 text-indigo-800'
    },
    {
      nome: 'LaudoAcess Pro',
      categoria: 'Acessibilidade',
      descricao: 'Sistema profissional para laudos de acessibilidade. Garanta conformidade com normas técnicas e legislação vigente.',
      url: 'https://amorimtech-acessibilidade.base44.app',
      icon: FileText,
      gradient: 'from-yellow-600 to-amber-600',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    {
      nome: 'Avalia Predial ESUDA',
      categoria: 'Sistema de Avaliação',
      descricao: 'Sistema de avaliação para alunos da Pós-Graduação em Engenharia e Gestão da Manutenção Predial. Feedback imediato e plano de estudo com IA.',
      url: 'https://avalia-predial-esuda.base44.app',
      icon: FileText,
      gradient: 'from-red-600 to-pink-600',
      badge: 'bg-red-100 text-red-800'
    },
    {
      nome: 'Gestor Predial 4.0',
      categoria: 'Gestão Predial Inteligente',
      descricao: 'Sistema inteligente de gestão predial com IA para manutenção preventiva e inspeções automatizadas. Aplicativo gratuito exclusivo para gestores públicos com assistentes de IA para inspeções, diagnósticos e planejamento de manutenção.',
      url: 'https://gestorpredial-amorimtech.base44.app',
      icon: Building2,
      gradient: 'from-cyan-600 to-blue-600',
      badge: 'bg-cyan-100 text-cyan-800'
    },
    {
      nome: 'InspeçãoIA',
      categoria: 'Inspeção Predial Inteligente',
      descricao: 'Plataforma de inspeção predial inteligente com IA. Realize inspeções completas e gere laudos técnicos profissionais de forma automatizada e eficiente.',
      url: 'https://laudo-de-inspecao.base44.app',
      icon: Shield,
      gradient: 'from-slate-600 to-gray-700',
      badge: 'bg-slate-100 text-slate-800'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Aplicativos Inteligentes ESUDA | Tecnologias com IA para Construção Civil</title>
        <meta name="description" content="Conheça os aplicativos inteligentes desenvolvidos pelo coordenador da ESUDA. Ferramentas com IA para gestão de obras, manutenção predial, vistorias e mais." />
        <meta name="keywords" content="aplicativos construção civil, IA construção, gestão obras IA, manutenção predial IA, vistorias inteligentes" />
      </Helmet>

      <div className="space-y-12 pb-12">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tecnologias Exclusivas Desenvolvidas pelo Coordenador
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Aplicativos inteligentes com IA que transformam a forma de trabalhar na construção civil
          </p>
        </div>

        {/* Notícias e Atualizações */}
        {(noticiasDestaque.length > 0 || outrasNoticias.length > 0) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Newspaper className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Notícias e Atualizações</h2>
              </div>
              <Link to={createPageUrl('GaleriaMidiasAplicativos')}>
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Ver Galeria de Mídias
                </Button>
              </Link>
            </div>

            {/* Notícias em Destaque */}
            {noticiasDestaque.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">✨ Em Destaque</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {noticiasDestaque.map((noticia) => (
                    <Card key={noticia.id} className="border-2 border-yellow-300 bg-white hover:shadow-xl transition-all">
                      <CardContent className="p-5">
                        {noticia.imagem_destaque && (
                          <img src={noticia.imagem_destaque} alt={noticia.titulo} className="w-full h-32 object-cover rounded-lg mb-3" />
                        )}
                        <div className="flex gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">{noticia.aplicativo_nome}</Badge>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">{noticia.tipo}</Badge>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{noticia.titulo}</h4>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{noticia.descricao}</p>
                        <p className="text-xs text-gray-500">{noticia.data_publicacao}</p>
                        {noticia.conteudo_completo && (
                          <details className="mt-3">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:underline">Ler mais</summary>
                            <div className="mt-2 text-sm text-gray-700 prose prose-sm max-w-none">
                              <ReactMarkdown>{noticia.conteudo_completo}</ReactMarkdown>
                            </div>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Outras Notícias */}
            {outrasNoticias.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📰 Recentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outrasNoticias.map((noticia) => (
                    <Card key={noticia.id} className="border-2 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">{noticia.aplicativo_nome}</Badge>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">{noticia.tipo}</Badge>
                        </div>
                        <h4 className="font-bold mb-1">{noticia.titulo}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{noticia.descricao}</p>
                        <p className="text-xs text-gray-500 mt-2">{noticia.data_publicacao}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid de Aplicativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aplicativos.map((app, index) => {
            const Icon = app.icon;
            return (
              <a 
                key={index}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full border-2 hover:border-gray-400 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`bg-gradient-to-br ${app.gradient} p-3 rounded-xl`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {app.nome}
                        </h3>
                        <Badge className={`${app.badge} text-xs mb-3`}>
                          {app.categoria}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {app.descricao}
                    </p>
                    
                    <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                      Acessar Aplicativo
                      <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-10 text-center border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Revolucione seu Trabalho com IA
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
            Ferramentas exclusivas desenvolvidas para profissionais da construção civil que buscam inovação e eficiência
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('EspecializacoesPage')}>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3">
                Ver Especializações →
              </Button>
            </Link>
            <Link to={createPageUrl('Homepage')}>
              <Button variant="outline" className="border-gray-300 px-8 py-3">
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}