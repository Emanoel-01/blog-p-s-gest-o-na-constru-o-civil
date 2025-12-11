import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, GraduationCap, Instagram, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function CoordenadorPage() {
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
            "jobTitle": "Coordenador das Especializações em Gestão e Tecnologias na Construção Civil",
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
        <p className="text-base sm:text-lg text-gray-600 mt-2">Emanoel Amorim - Coordenador das Especializações em Gestão e Tecnologias na Construção Civil</p>
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

          <a href="https://emanoel313.wixsite.com/my-site" target="_blank" rel="noopener noreferrer" className="sm:col-span-2">
            <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 sm:py-3 text-sm sm:text-base">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Site - Amorim Arquitetura
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