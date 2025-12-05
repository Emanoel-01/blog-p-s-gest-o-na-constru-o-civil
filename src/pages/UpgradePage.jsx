
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function UpgradePage() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Especializando os Profissionais para o Futuro do Mercado
      </h2>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Nossos cursos são preparados para o mercado real.
        </h3>
        <p className="text-gray-700 leading-relaxed text-justify">
          Entendemos que o profissional moderno precisa de flexibilidade e conhecimento direcionado. Por isso,
          nossas pós-graduações não são engessadas; elas são <strong>modulares</strong>. Aqui, o aluno tem o poder
          de escolher e cursar os ciclos de conhecimento que realmente necessita para impulsionar sua carreira.
        </p>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Por que o Upgrade? O Profissional 4.0 da Construção Civil Começa Aqui!
      </h3>
      <p className="text-gray-700 mb-4 leading-relaxed text-justify">
        O mercado da arquitetura e engenharia civil exige uma visão integrada e multidisciplinar, que vai muito
        além da excelência técnica em uma única área. Para o profissional se destacar, é essencial dominar as
        ferramentas e os processos que conectam todas as etapas do ciclo de vida de uma edificação, da concepção
        à manutenção.
      </p>
      <p className="text-gray-700 mb-4 leading-relaxed text-justify">
        Isso inclui a elaboração de projetos complexos e especializados como: <strong>Acústica, luminotécnica,
        interiores, comunicação visual, acessibilidade, paisagismo, instalações prediais (gás, elétrica, SPDA,
        PCI, hidrossanitários, climatização)</strong>, a compatibilização e gestão eficiente de projetos, obras,
        pós-obras e da manutenção, sempre com foco em sustentabilidade, alta performance e inovação tecnológica.
      </p>
      <p className="text-gray-700 mb-6 leading-relaxed text-justify">
        Reconhecendo essa necessidade, a ESUDA, que já é referência em áreas como acústica, iluminação e gestão
        de projetos e obras, está promovendo um significativo <strong className="text-orange-600">UPGRADE</strong> em suas especializações.
        Saímos de uma ótica focada apenas na excelência técnica para uma abordagem 4.0, que integra todas essas
        disciplinas com o que há de mais moderno em tecnologia, como <strong>BIM, Inteligência Artificial, IoT, CMMS,
        Termografia Infravermelha, Drones</strong>, entre outras.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Entre as tecnologias abordadas no curso, destacam-se:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 mb-6">
        <ul className="space-y-2">
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Autodesk Navisworks</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Autodesk Revit</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />BIM Collab</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Orçafascio</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Obra na Mão</li>
        </ul>
        <ul className="space-y-2">
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Power BI</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Inteligência Artificial</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />QGIS</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Sisdea</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Termografia e Drones</li>
        </ul>
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('Homepage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('DiferenciaisPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Diferenciais
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
