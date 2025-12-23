import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Zap, Building2, Sparkles, Lightbulb, Eye, FileText, Shield, ExternalLink } from 'lucide-react';

export default function AplicativosInteligentesPage() {
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