import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function DiferenciaisPage() {
  const { data: tecnologias = [] } = useQuery({
    queryKey: ['tecnologias'],
    queryFn: () => base44.entities.Tecnologia.list('ordem')
  });

  const diferenciais = [
    { title: "Estrutura Modular e Flexível", desc: "Construa uma jornada de aprendizado única, escolhendo os ciclos de conhecimento que atendem diretamente aos seus objetivos de carreira." },
    { title: "Projeto Incubadora Profissional ESUDA", desc: "Participe de um ambiente de inovação e empreendedorismo, com mentoria de mercado para desenvolvimento de carreira e projetos práticos." },
    { title: "Foco em Construção 4.0 e Integração Tecnológica", desc: "Domine as ferramentas que estão definindo o futuro do setor." },
    { title: "Laboratório de Tecnologia e Inovação", desc: "Parceria com a Startup Amorim TECH para acesso a tecnologias de ponta." },
    { title: "Corpo Docente de Mercado", desc: "Aprenda com professores que são referência em suas áreas de atuação, com vasta experiência prática." },
    { title: "Capacitação para Licitações e Contratos", desc: "Formação completa para atuar tanto no setor público quanto no privado." },
    { title: "Ênfase em Sustentabilidade e Eficiência", desc: "Desenvolva projetos e processos alinhados às mais modernas práticas de ESG." },
    { title: "Networking Qualificado", desc: "Conecte-se com profissionais e empresas que são protagonistas no mercado da construção civil." },
    { title: "Atividades Eletivas", desc: "Expanda seu conhecimento com Canteiros Didáticos, Workshops e Masterclasses." },
    { title: "Infraestrutura Completa", desc: "Instalações modernas e confortáveis, com biblioteca informatizada e espaços de estudo individuais ou em grupo." },
    { title: "Convênios Corporativos", desc: "Descontos especiais para ex-alunos e conveniados ao CREA/PE e CAU/PE." },
  ];

  return (
    <div className="px-2 sm:px-4">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
        PRINCIPAIS DIFERENCIAIS
      </h2>
      <p className="text-gray-600 mb-4 sm:mb-6 text-justify text-sm sm:text-base">
        Conheça o que torna nossas pós-graduações únicas e alinhadas com as demandas do mercado.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {diferenciais.map((item, index) => (
          <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-justify">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 sm:p-6 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Tecnologias e Parceiros</h3>
        <p className="text-gray-700 mb-3 sm:mb-4 text-justify text-sm sm:text-base">
          Nossas especializações utilizam as mais avançadas ferramentas do mercado:
        </p>
        {tecnologias.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {tecnologias.map((tec) => (
              <span key={tec.id} className="bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-300 text-xs sm:text-sm font-bold text-gray-800">
                {tec.nome}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-xs sm:text-sm italic mb-3 sm:mb-4">
            As tecnologias serão adicionadas em breve pelo administrador.
          </p>
        )}
        <p className="text-gray-700 text-justify text-sm sm:text-base">
          <strong>Parceiros:</strong> Amorim TECH (Laboratório de Inovação), CREA/PE, CAU/PE.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('UpgradePage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Ver Ciclos de Conhecimento
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}