import React, { useState, useEffect } from 'react';
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
  Rss, 
  Sparkles, 
  ExternalLink,
  Zap,
  Building2,
  Lightbulb,
  User
} from 'lucide-react';
import FeedSucesso from '../components/community/FeedSucesso';
import NotificacoesPanel from '../components/community/NotificacoesPanel';
import AtalhosComunidade from '../components/community/AtalhosComunidade';

export default function Homepage() {
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser) {
          const professores = await base44.entities.Professor.list();
          const isProfessor = professores.some(p => p.email === currentUser.email);
          
          if (isProfessor) {
            setProfileType('docente');
          } else {
            const discentes = await base44.entities.Discente.list();
            const isDiscente = discentes.some(d => d.email === currentUser.email);
            if (isDiscente) {
              setProfileType('discente');
            }
          }
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }
    checkUser();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem', 2)
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-seo'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const { data: incubadoraActivities = [] } = useQuery({
    queryKey: ['incubadora-preview'],
    queryFn: async () => {
      const projetos = await base44.entities.Projeto.list();
      const incubadoraProjetos = projetos.filter(p => p.tipo_projeto === 'Incubadora Profissional');

      if (incubadoraProjetos.length === 0) return [];

      const projetoIds = incubadoraProjetos.map(p => p.id);

      const [freelancers, discentes] = await Promise.all([
        base44.entities.FreelancerNetwork.list('-data'),
        base44.entities.Discente.list('nome')
      ]);

      const networkActivities = freelancers
        .filter(f => projetoIds.includes(f.projeto_id))
        .map(f => {
          const aluno = discentes.find(d => d.id === f.aluno_id);
          return { 
            ...f, 
            type: f.tipo || 'Network', 
            date: f.data,
            aluno_foto: aluno?.foto_url,
            aluno_nome: aluno?.nome
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, user ? 8 : 4);

      return networkActivities;
    },
    enabled: !loadingUser
  });

  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes-home', user?.email],
    queryFn: () => base44.entities.Notificacao.filter({ destinatario_email: user.email, lida: false }, '-created_date', 10),
    enabled: !!user
  });



  // Dados estruturados JSON-LD para SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ESUDA - Escola Superior de Desenho e Animação",
    "url": "https://esuda.edu.br",
    "logo": "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png",
    "description": "Pós-Graduação em Gestão e Tecnologias na Construção Civil. Especializações em BIM, Gestão de Projetos e Obras, Manutenção Predial e Engenharia Legal com foco em inovação e tecnologia.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Recife",
      "addressRegion": "PE",
      "addressCountry": "BR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Admissions",
      "availableLanguage": "Portuguese"
    },
    "sameAs": [
      "https://www.instagram.com/esuda.oficial/",
      "https://www.linkedin.com/school/esuda/"
    ]
  };

  const coursesSchema = especializacoes.map(espec => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `Especialização em ${espec.nome}`,
    "description": espec.resumo || `Pós-graduação em ${espec.nome} com foco em inovação e tecnologia na construção civil`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "ESUDA",
      "url": "https://esuda.edu.br"
    },
    "courseCode": espec.id,
    "educationalCredentialAwarded": "Especialização",
    "timeRequired": `P${espec.duracao_meses || 10}M`,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": espec.formato_aulas?.includes("Presencial") ? "blended" : "online",
      "courseWorkload": `PT${espec.carga_horaria_total}H`
    },
    "offers": espec.condicoes_pagamento?.length > 0 ? {
      "@type": "Offer",
      "category": "Paid",
      "priceCurrency": "BRL"
    } : undefined
  }));

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  // Usuário LOGADO - Lobby da Comunidade
  if (user && profileType) {
    return (
      <>
        <Helmet>
          <title>Comunidade ESUDA | Sua Home Acadêmica</title>
        </Helmet>

        <div className="space-y-8 pb-8 px-3 sm:px-4">
          {/* Boas-vindas */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo(a), {user.full_name || 'Membro da Comunidade'}! 👋
            </h1>
            <p className="text-gray-600">
              {profileType === 'docente' ? 'Área do Docente' : 'Área do Discente'}
            </p>
          </div>

          {/* Atalhos Rápidos */}
          <AtalhosComunidade profileType={profileType} />

          {/* Feed de Sucesso */}
          {incubadoraActivities.length > 0 && (
            <FeedSucesso activities={incubadoraActivities} />
          )}

          {/* Notificações Recentes */}
          <NotificacoesPanel notificacoes={notificacoes} />

          {/* Tecnologias Exclusivas - Sempre visível */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Tecnologias Exclusivas
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <a href="https://esuda-gpo.base44.app" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full bg-white border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">GPO 4.0</h3>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Gestão de Projetos</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Plano Interativo de Gestão de Projetos e Obras com IA.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                      Acessar
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </a>

              <a href="https://esuda-predial.base44.app" target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full bg-white border-2 border-purple-300 hover:border-purple-500 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Predial 4.0</h3>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">Manutenção Predial</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Plano Interativo de Manutenção Predial com IA.
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
                      Acessar
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Usuário NÃO LOGADO - Sales Page (comportamento original)
  return (
    <>
      <Helmet>
        {/* Meta Tags Básicas */}
        <title>Pós-Graduação em Gestão e Tecnologias na Construção Civil | ESUDA</title>
        <meta name="description" content="Especializações em BIM, Gestão de Projetos e Obras, Manutenção Predial e Engenharia Legal. Cursos com foco em inovação, tecnologia 4.0 e retorno garantido. Inscrições abertas." />
        
        {/* Keywords */}
        <meta name="keywords" content="pós-graduação construção civil, especialização BIM, gestão de obras, manutenção predial, engenharia legal, mestrado construção, curso BIM, pós engenharia civil, ESUDA, Recife, tecnologia construção 4.0, GPO 4.0, Predial 4.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://esuda.edu.br" />
        <meta property="og:title" content="Pós-Graduação em Gestão e Tecnologias na Construção Civil | ESUDA" />
        <meta property="og:description" content="Especializações com foco em inovação e tecnologia 4.0. Retorno garantido antes do fim do curso. Inscrições abertas." />
        <meta property="og:image" content="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://esuda.edu.br" />
        <meta property="twitter:title" content="Pós-Graduação em Gestão e Tecnologias na Construção Civil | ESUDA" />
        <meta property="twitter:description" content="Especializações com foco em inovação e tecnologia 4.0. Retorno garantido antes do fim do curso." />
        <meta property="twitter:image" content="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://esuda.edu.br" />
        
        {/* Dados Estruturados JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        {coursesSchema.map((schema, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <div className="space-y-8 sm:space-y-12 pb-8 sm:pb-12 px-3 sm:px-4">
        {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8">
        <img
          src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
          alt="Logo da Faculdade ESUDA"
          loading="eager"
          className="w-40 sm:w-48 md:w-64 lg:w-80 mx-auto mb-4 sm:mb-6"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
          Pós-Graduação nas áreas de Gestão e Tecnologias na Construção Civil
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl leading-relaxed px-2">
          Conheça as especializações: <span className="font-semibold text-green-700">Inovação, Tecnologia e Foco no Mercado</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-2xl px-2">
          <Link to={createPageUrl('UpgradePage')} className="w-full sm:flex-1">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg">
              Conheça o Upgrade
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:flex-1">
            <Button variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg">
              Ver Especializações
            </Button>
          </Link>
        </div>
      </div>

      {/* Incubadora Profissional com ROI */}
      {incubadoraActivities.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border-2 border-teal-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-teal-600" />
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                Incubadora Profissional
              </h2>
            </div>
            <Link to={createPageUrl('IncubadoraProfissionalPage')} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-teal-300 text-teal-700 hover:bg-teal-100 text-xs sm:text-sm">
                Ver Dashboard ROI
                <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
          
          {/* Destaque ROI */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-teal-300 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 sm:p-3 rounded-full">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 text-center">
                Curso com Maior Retorno ao Aluno
              </h3>
            </div>
            <p className="text-center text-gray-700 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              O programa que mais gera retorno financeiro e de conhecimento aos alunos. <span className="font-bold text-green-700">Antes do final do curso, nossos alunos já recuperam o valor investido</span> através de oportunidades reais de trabalho e projetos práticos.
            </p>
            <p className="text-center text-[10px] sm:text-xs md:text-sm text-gray-600 mt-2 italic">
              *Dados rastreáveis comprovam retorno em atividades práticas, freelancing e contratações.
            </p>
          </div>
          
          <p className="text-center text-gray-700 mb-4 sm:mb-6 max-w-3xl mx-auto text-xs sm:text-sm md:text-base">
            Faça parte da nossa comunidade e se destaque no mercado como:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {incubadoraActivities.map((activity, idx) => {
              const title = activity.nome_evento || activity.titulo_artigo || activity.nome_canteiro || 
                           activity.nome_atividade || activity.titulo_relatorio || activity.titulo_producao;
              
              const isFreelancer = ['Freelancer', 'Empregado', 'Contratado'].includes(activity.type);
              
              return (
                <Link key={idx} to={createPageUrl('IncubadoraProfissionalPage')}>
                  <Card className="h-full bg-white border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition-all">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {isFreelancer && (
                          activity.aluno_foto ? (
                            <img 
                              src={activity.aluno_foto} 
                              alt={activity.aluno_nome}
                              loading="lazy"
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-teal-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-2 border-teal-300 flex-shrink-0">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          )
                        )}
                        <div className="flex-1 min-w-0">
                          <Badge className={`mb-1 text-[10px] px-1.5 py-0.5 ${
                            activity.type === 'Empregado' ? 'bg-green-100 text-green-800' :
                            activity.type === 'Contratado' ? 'bg-blue-100 text-blue-800' :
                            'bg-teal-100 text-teal-800'
                          }`}>
                            {activity.type}
                          </Badge>
                          {isFreelancer && activity.aluno_nome && (
                            <p className="text-[10px] sm:text-xs text-gray-800 font-bold leading-tight">{activity.aluno_nome}</p>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">{title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-1 line-clamp-2">{activity.resumo}</p>
                      <p className="text-[10px] text-gray-500">{activity.date}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tecnologias Exclusivas */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border-2 border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4 sm:mb-6">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600" />
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 text-center">
            Tecnologias Exclusivas Desenvolvidas pelo Coordenador
            </h2>
            </div>
            <p className="text-center text-gray-700 mb-4 sm:mb-6 max-w-3xl mx-auto text-xs sm:text-sm md:text-base px-2">
            Aplicativos inteligentes com IA que transformam a forma de trabalhar na construção civil
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
          <a href="https://esuda-gpo.base44.app" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full bg-white border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-xl">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                      GPO 4.0
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 mb-2 sm:mb-3 text-xs">Gestão de Projetos e Obras</Badge>
                  </div>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4">
                  Plano Interativo de Gestão de Projetos e Obras. Transforme sua forma de trabalhar com IA aplicada à gestão de projetos, orçamentos, planejamento e execução de obras.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 text-xs sm:text-sm">
                  Acessar GPO 4.0
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  </CardContent>
                  </Card>
                  </a>

                  <a href="https://esuda-predial.base44.app" target="_blank" rel="noopener noreferrer" className="group">
                  <Card className="h-full bg-white border-2 border-purple-300 hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 sm:p-3 rounded-xl">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                      Predial 4.0
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <Badge className="bg-purple-100 text-purple-800 mb-2 sm:mb-3 text-xs">Manutenção Predial</Badge>
                  </div>
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4">
                  Plano Interativo de Manutenção Predial. Transforme sua forma de trabalhar com IA aplicada à gestão de Manutenção Predial.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700 text-xs sm:text-sm">
                  Acessar Predial 4.0
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>

      {/* Conheça Nossa Comunidade */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center px-2">
          Conheça Nossa Comunidade
        </h2>

        {/* Card do Blog */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:shadow-2xl transition-all">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-pink-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center">
                  <Rss className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Blog Em Ação</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Eventos, workshops e novidades</p>
                </div>
                </div>
                <Link to={createPageUrl('EmAcaoPage')} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-pink-300 text-pink-700 hover:bg-pink-100 text-xs sm:text-sm">
                  Ver Todos
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                </Link>
                </div>

                {/* Vídeos do Instagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.instagram.com/reel/DPkKSFJke6X/embed"
                    className="w-full h-80 sm:h-96"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                    allow="encrypted-media"
                  />
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.instagram.com/reel/DPMARgDDhM8/embed"
                    className="w-full h-80 sm:h-96"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                    allow="encrypted-media"
                  />
                </div>
                </div>

                {/* Vídeos do LinkedIn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7386641164558360576?compact=1"
                    className="w-full h-80 sm:h-96"
                    frameBorder="0"
                    allowFullScreen={true}
                    title="Publicação incorporada"
                  />
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7371274943013048321?compact=1"
                    className="w-full h-80 sm:h-96"
                    frameBorder="0"
                    allowFullScreen={true}
                    title="Publicação incorporada"
                  />
                </div>
                </div>

                {/* Posts Recentes */}
                {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {posts.map((post) => (
                  <Link key={post.id} to={createPageUrl('EmAcaoPage')}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white border border-pink-100">
                      <CardContent className="p-0">
                        {post.imagem_destaque && (
                          <img
                            src={post.imagem_destaque}
                            alt={post.titulo}
                            loading="lazy"
                            className="w-full h-32 sm:h-36 md:h-40 object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-3 sm:p-4">
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{post.data}</p>
                          <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-base">{post.titulo}</h4>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 line-clamp-2">{post.descricao}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm">Nenhum post disponível no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 text-center text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
          Pronto para Transformar sua Carreira?
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 px-2">
          Explore nossos ciclos de conhecimento e monte sua trilha personalizada
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto px-2">
          <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto">
            <Button className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg">
              Ver Ciclos de Conhecimento
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg">
              Ver Especializações
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}