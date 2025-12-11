import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, GraduationCap, Instagram, Globe, ArrowRight } from 'lucide-react';

export default function CoordenadorPage() {
  return (
    <div className="px-2 sm:px-4">
      <div className="text-center mb-6 sm:mb-8">
        <img
          src="https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg"
          alt="Emanoel Amorim"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-600 shadow-lg mx-auto mb-3 sm:mb-4"
        />
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 px-2">Meu Perfil: Gestão Estratégica e Tecnologia (Construção 4.0)</h2>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Emanoel Amorim - Coordenador das Especializações em Gestão e Tecnologias na Construção Civil</p>
      </div>

      <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed mb-6 sm:mb-8">
        <p className="text-justify text-sm sm:text-base">
          <strong>Como me apresentar?</strong> Vamos lá, pelo começo: Fui aluno da graduação em 
          Arquitetura e Urbanismo da ESUDA, e fiz a Pós-Graduação em Gestão de Projetos e Obras 
          logo após me formar. Hoje, minha carreira é construída na intersecção entre Arquitetura, 
          Engenharia Civil e Gestão de Projetos. Sou Mestre em Engenharia Civil e especialista em 
          transformar a forma como gerenciamos empreendimentos, unindo a visão estratégica de um 
          PMO à realidade do canteiro de obras.
        </p>

        <div className="bg-green-50 p-4 sm:p-5 rounded-lg border-l-4 border-green-600">
          <h4 className="font-bold text-base sm:text-lg text-green-800 mb-2 sm:mb-3">Experiência Prática e Liderança</h4>
          <p className="mb-2 text-justify text-sm sm:text-base">
            Minha experiência é focada em liderar o ciclo completo de grandes projetos, da 
            fiscalização à operação:
          </p>
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">▸</span>
              <span className="text-justify text-sm sm:text-base"><strong>Liderança de Empreendimentos:</strong> Atualmente, sou Gerente de 
              Manutenção Predial no CRC/PE e Coordenador Técnico da fiscalização das obras de 
              restauro do histórico Palácio Joaquim Nabuco (ALEPE).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">▸</span>
              <span className="text-justify text-sm sm:text-base"><strong>Empreendedorismo:</strong> Como Diretor da Amorim Arquitetura, atuo 
              com consultoria, especialmente em Pernambuco, com foco em patrimônios históricos e 
              empreendimentos comerciais.</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 sm:p-5 rounded-lg border-l-4 border-blue-600">
          <h4 className="font-bold text-base sm:text-lg text-blue-800 mb-2 sm:mb-3">Domínio em Tecnologia e Inovação</h4>
          <p className="mb-2 text-justify text-sm sm:text-base">
            Meu diferencial é o domínio e a aplicação da Construção 4.0. Para mim, tecnologia 
            não é apenas ferramenta, é estratégia:
          </p>
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">▸</span>
              <span className="text-justify text-sm sm:text-base"><strong>Tecnologias-Chave:</strong> Implemento e domino tecnologias como BIM, 
              Drones, Sensores Inteligentes, Termografia e, claro, Inteligência Artificial.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">▸</span>
              <span className="text-justify text-sm sm:text-base"><strong>Analista de Soluções:</strong> Criei um novo braço de consultoria para 
              atuar como Analista de Processos e Arquiteto de Soluções, ajudando construtoras a 
              otimizar fluxos de trabalho e a implementar essas tecnologias de forma personalizada 
              para impulsionar seus resultados.</span>
            </li>
          </ul>
        </div>

        <div className="bg-orange-50 p-4 sm:p-5 rounded-lg border-l-4 border-orange-500">
          <h4 className="font-bold text-base sm:text-lg text-orange-800 mb-2 sm:mb-3">Visão Acadêmica e Missão</h4>
          <p className="mb-2 text-justify text-sm sm:text-base">
            Na Faculdade Esuda, estou à frente das especializações de Gestão e Tecnologias na Construção Civil. Minha missão é ir além da teoria:
          </p>
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">▸</span>
              <span className="text-justify text-sm sm:text-base"><strong>Ensino Prático:</strong> Criei a "Incubadora Profissional" (um programa 
              de pesquisa e extensão) e utilizo canteiros didáticos, garantindo que os alunos 
              participem de projetos reais e construam uma rede de talentos valiosa para o mercado.</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-base sm:text-lg font-semibold text-orange-600 mt-4 sm:mt-6 text-justify">
          Estou aqui para transferir essa experiência de campo e esse domínio tecnológico, 
          garantindo que vocês se tornem não apenas formados, mas sim verdadeiros especialistas 
          prontos para o futuro da Construção Civil.
        </p>
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
  );
}