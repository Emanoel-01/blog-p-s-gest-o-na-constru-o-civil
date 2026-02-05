import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, GraduationCap, Instagram, ArrowRight, CheckCircle, MessageCircle, ChevronRight, ChevronLeft, Briefcase, Award, Wifi } from 'lucide-react';

export default function CoordenadorPage() {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [isAutoScroll, setIsAutoScroll] = React.useState(false);
  const timelineRef = React.useRef(null);
  const autoScrollInterval = React.useRef(null);

  const timeline = [
    { year: '2026', title: 'CEO, CTO & Arquiteto de Soluções da Amorim TECH', description: 'Atuação como Product Manager da Marca e Técnico Responsável pela migração da arquitetura de protótipos e unificação para uma infraestrutura de escala industrial, garantindo a robustez das APIs, segurança de dados e a integração da Engenharia de Contexto assistida por IA.', icon: 'tech', imageUrl: 'https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg' },
    { year: '2025', title: 'Analista de Processos e Arquiteto de Soluções Digitais', description: 'Desenvolvimento (por Vibe Coding) de 09 Protótipos de apps de gestão inteligente das edificações.', icon: 'tech', imageUrl: 'https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg' },
    { year: '2022-2024', title: 'Mestrado em Engenharia Civil', description: 'Gestão da Manutenção de Edificações em Instituições Públicas. UPE - Universidade de Pernambuco. Orientador: Prof. Dr. Alberto Casado Lordsleem Júnior.', icon: 'academic', imageUrl: 'https://www.upe.br/wp-content/uploads/2021/03/logo-upe.png' },
    { year: '2024', title: 'Coordenador e Docente de Cursos de Especialização', description: 'Atuação na Faculdade Esuda.', icon: 'work', imageUrl: 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png' },
    { year: '2024', title: 'Residencial Parque de Exposições', description: 'Projeto Arquitetônico. Módulos I a IV. Sertenge Engenharia S/A | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_b214383a73d14514ad8901a5cb287041~mv2.png/v1/crop/x_359,y_0,w_583,h_731/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/cor.png' },
    { year: '2019', title: 'Especialização em Arquitetura e Patrimônio', description: 'Análise das características arquitetônicas da Basílica e Convento de Nossa Senhora do Carmo em Recife/PE. FAVENI.', icon: 'academic', imageUrl: 'https://static.wixstatic.com/media/152459_0dedafe2eeda4698981281984bcf0c99~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Basilica%20do%20Carmo%20_JPG.jpg' },
    { year: '2017-2019', title: 'MBA em Gerenciamento de Projetos', description: 'Metodologia gerenciamento de projeto de conservação e restauro em bens tombados. Faculdade Esuda.', icon: 'academic', imageUrl: 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png' },
    { year: '2016-2018', title: 'MBA em Plataforma BIM', description: 'Modelagem, Planejamento e Orçamento. O Uso do BIM em Projetos de Restauro. UNIP.', icon: 'academic', imageUrl: 'https://www.unip.br/presencial/img/logo.png' },
    { year: '2015-2017', title: 'Especialização em Gestão de Projetos e Obras', description: 'Orçamento e Perícia. Faculdade Esuda.', icon: 'academic', imageUrl: 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png' },
    { year: '2010-2014', title: 'Graduação em Arquitetura e Urbanismo', description: 'Faculdade Ciências Humanas Esuda. Título: PROJETO DE TRATAMENTO ACÚSTICO DA IGREJA BATISTA JARDIM BEBERIBE, EM OLINDA/PE.', icon: 'academic', imageUrl: 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png' },
    { year: '2007-2009', title: 'Técnico em Construção Civil', description: 'Formação técnica em Edificações. ETEPAM.', icon: 'academic', imageUrl: 'https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg' }
  ];

  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 300;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleAutoScroll = () => {
    if (isAutoScroll) {
      clearInterval(autoScrollInterval.current);
      setIsAutoScroll(false);
    } else {
      setIsAutoScroll(true);
      autoScrollInterval.current = setInterval(() => {
        if (timelineRef.current) {
          const maxScroll = timelineRef.current.scrollWidth - timelineRef.current.clientWidth;
          if (timelineRef.current.scrollLeft >= maxScroll) {
            timelineRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            timelineRef.current.scrollBy({ left: 2, behavior: 'auto' });
          }
        }
      }, 30);
    }
  };

  React.useEffect(() => {
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  const getIconComponent = (iconType) => {
    switch(iconType) {
      case 'tech': return <Wifi className="w-6 h-6 text-purple-600" />;
      case 'academic': return <GraduationCap className="w-6 h-6 text-blue-600" />;
      case 'work': return <Briefcase className="w-6 h-6 text-green-600" />;
      case 'project': return <Award className="w-6 h-6 text-orange-600" />;
      default: return <Briefcase className="w-6 h-6 text-gray-600" />;
    }
  };

  const getIconBg = (iconType) => {
    switch(iconType) {
      case 'tech': return 'bg-purple-100 border-purple-300';
      case 'academic': return 'bg-blue-100 border-blue-300';
      case 'work': return 'bg-green-100 border-green-300';
      case 'project': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <>
      <Helmet>
        <title>Emanoel Amorim | Coordenador Pós-Graduação ESUDA em Gestão e Tecnologias na Construção Civil</title>
        <meta name="description" content="Conheça Emanoel Amorim, Mestre em Engenharia Civil e coordenador das especializações ESUDA. Especialista em BIM, Gestão de Projetos, Construção 4.0 e Incubadora Profissional." />
        <meta name="keywords" content="Emanoel Amorim, coordenador ESUDA, BIM expert, gestão construção civil, construção 4.0, mestre engenharia civil, Recife" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/CoordenadorPage" />
        
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Emanoel Amorim | Coordenador ESUDA" />
        <meta property="og:description" content="Mestre em Engenharia Civil, especialista em Gestão de Projetos e Construção 4.0. Coordenador das especializações ESUDA." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/CoordenadorPage" />
        <meta property="og:image" content="https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Emanoel Amorim",
            "jobTitle": "Coordenador das Especializações nas áreas de Gestão e Tecnologias na Construção Civil",
            "affiliation": {
              "@type": "Organization",
              "name": "ESUDA"
            },
            "description": "Mestre em Engenharia Civil, especialista em BIM, Gestão de Projetos e Construção 4.0",
            "sameAs": [
              "https://www.linkedin.com/in/emanoel-amorim-43025b65",
              "http://lattes.cnpq.br/8865037855941412",
              "http://researchgate.net/profile/Emanoel-Amorim",
              "https://www.instagram.com/arquitetura.amorim/",
              "https://emanoel313.wixsite.com/my-site"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <img
            src="https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg"
            alt="Emanoel Amorim - Coordenador ESUDA"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-600 shadow-lg mx-auto mb-3 sm:mb-4"
          />
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 px-2">Meu Perfil: Gestão Estratégica e Tecnologia (Construção 4.0)</h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Emanoel Amorim - Coordenador das Especializações nas áreas de Gestão e Tecnologias na Construção Civil</p>
      </div>

      <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed mb-6 sm:mb-8">
        <p className="text-justify text-sm sm:text-base">
          <strong>Mestre em Engenharia Civil</strong> com foco em Gestão de Projetos e Construção 4.0. 
          Minha carreira une <strong>Arquitetura, Engenharia e Gestão de Projetos</strong>, transformando 
          a forma como gerenciamos empreendimentos com visão estratégica e prática de canteiro.
        </p>

        <div className="bg-green-50 p-4 sm:p-5 rounded-lg border-l-4 border-green-600">
          <h4 className="font-bold text-base sm:text-lg text-green-800 mb-2">Experiência Prática</h4>
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-sm sm:text-base"><strong>Gerente de Manutenção Predial</strong> no CRC/PE</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-sm sm:text-base"><strong>Coordenador Técnico</strong> - Restauro Palácio Joaquim Nabuco (ALEPE)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-sm sm:text-base"><strong>Diretor da Amorim Arquitetura</strong> - Consultoria e projetos</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 sm:p-5 rounded-lg border-l-4 border-blue-600">
          <h4 className="font-bold text-base sm:text-lg text-blue-800 mb-2">Construção 4.0 e Inovação</h4>
          <p className="text-sm sm:text-base mb-2">
            Domínio em <strong>BIM, Drones, Sensores IoT, Termografia e IA</strong>. 
            Atuo como Arquiteto de Soluções, otimizando processos em construtoras.
          </p>
        </div>

        <div className="bg-green-50 p-4 sm:p-5 rounded-lg border-l-4 border-green-600">
          <h4 className="font-bold text-base sm:text-lg text-green-800 mb-2">Missão Acadêmica</h4>
          <p className="text-sm sm:text-base">
            Coordeno as especializações ESUDA com foco em <strong>ensino prático e projetos reais</strong>. 
            Criador da <strong>Incubadora Profissional</strong> que conecta alunos ao mercado.
          </p>
        </div>

        <div className="bg-purple-50 p-4 sm:p-5 rounded-lg border-l-4 border-purple-600">
          <h4 className="font-bold text-base sm:text-lg text-purple-800 mb-3">Quem Sou Eu</h4>
          <p className="text-sm sm:text-base mb-3 text-gray-700">
            Ouça o episódio do meu podcast onde a IA apresenta um resumo completo da minha trajetória profissional:
          </p>
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <iframe 
              style={{ borderRadius: '12px' }} 
              src="https://open.spotify.com/embed/episode/1NXYnNIrKCwm3sVtjQRGlD?utm_source=generator&t=431" 
              width="100%" 
              height="152" 
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              title="Podcast - Quem é Emanoel Amorim"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200 mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Trajetória Profissional
        </h3>
        
        <div className="relative">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Button 
              onClick={() => scrollTimeline('left')} 
              variant="outline" 
              size="icon"
              className="h-8 w-8 bg-white shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={toggleAutoScroll}
              variant={isAutoScroll ? "default" : "outline"}
              size="sm"
              className={isAutoScroll ? "bg-blue-600 text-white" : "bg-white"}
            >
              {isAutoScroll ? 'Pausar' : 'Auto-Scroll'}
            </Button>
            
            <Button 
              onClick={() => scrollTimeline('right')} 
              variant="outline" 
              size="icon"
              className="h-8 w-8 bg-white shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div 
            ref={timelineRef}
            className="overflow-x-auto hide-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 pb-4" style={{ minWidth: 'min-content' }}>
              {timeline.map((item, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-4"
                >
                  <div className="text-center mb-3">
                    <div className="inline-block bg-blue-50 px-4 py-1 rounded-full">
                      <span className="text-sm font-bold text-blue-700">{item.year}</span>
                    </div>
                  </div>

                  <div className="flex justify-center mb-3">
                    <div className={`w-16 h-16 rounded-full border-2 ${getIconBg(item.icon)} flex items-center justify-center overflow-hidden`}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        getIconComponent(item.icon)
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 mb-2 text-center min-h-[40px] line-clamp-2">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 text-center leading-relaxed line-clamp-4">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg border border-blue-200 mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
          Conecte-se com o Coordenador
        </h3>
        <p className="text-center mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
          Acompanhe o trabalho e a visão de mercado:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <a href="https://www.linkedin.com/in/emanoel-amorim-43025b65" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base">
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              LinkedIn
            </Button>
          </a>
          
          <a href="http://lattes.cnpq.br/8865037855941412" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Lattes
            </Button>
          </a>

          <a href="http://researchgate.net/profile/Emanoel-Amorim" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              ResearchGate
            </Button>
          </a>

          <a href="https://www.instagram.com/arquitetura.amorim/" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-2 sm:py-3 text-sm sm:text-base">
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Instagram
            </Button>
          </a>

          <a href="https://wa.me/5581991298803" target="_blank" rel="noopener noreferrer" className="sm:col-span-2">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base shadow-lg">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Falar pelo WhatsApp
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('ProfessoresPage')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Conheça os Professores
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
    </>
  );
}