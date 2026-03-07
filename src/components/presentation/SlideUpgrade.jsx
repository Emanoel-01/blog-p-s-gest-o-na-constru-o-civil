import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function SlideUpgrade() {
  return (
    <div className="slide-content max-h-[75vh] overflow-y-auto pr-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Especializando os Profissionais para o Futuro do Mercado
      </h2>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800">
          Nossos cursos são preparados para o mercado real.
        </h3>
        <p className="text-gray-700 mt-2">
          Entendemos que o profissional moderno precisa de flexibilidade e conhecimento direcionado. Por isso,
          nossas pós-graduações não são engessadas; elas são <strong>modulares</strong>. Aqui, o aluno tem o poder
          de escolher e cursar os ciclos de conhecimento que realmente necessita para impulsionar sua carreira.
        </p>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Por que o Upgrade? O Profissional 4.0 da Arquitetura e Engenharia Começa Aqui!
      </h3>
      <p className="text-gray-700 mb-4 leading-relaxed">
        O mercado da arquitetura e engenharia civil exige uma visão integrada e multidisciplinar, que vai muito
        além da excelência técnica em uma única área. Para o profissional se destacar, é essencial dominar as
        ferramentas e os processos que conectam todas as etapas do ciclo de vida de uma edificação, da concepção
        à manutenção. Isso inclui a elaboração de projetos complexos e especializados como: Acústica, luminotécnica,
        interiores, comunicação visual, acessibilidade, paisagismo, instalações prediais (gás, elétrica, SPDA,
        PCI, hidrossanitários, climatização), a compatibilização e gestão eficiente de projetos, obras, pós-obras
        e da manutenção, sempre com foco em sustentabilidade, alta performance e inovação tecnológica.
      </p>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Reconhecendo essa necessidade, a ESUDA, que já é referência em áreas como acústica, iluminação e gestão
        de projetos e obras, está promovendo um significativo <strong className="esuda-orange">UPGRADE</strong> em suas especializações.
        Saímos de uma ótica focada apenas na excelência técnica para uma abordagem 4.0, que integra todas essas
        disciplinas com o que há de mais moderno em tecnologia, como BIM, Inteligência Artificial, IoT, CMMS,
        Termografia Infravermelha, Drones, entre outras. Com a reestruturação completa de nossas pós-graduações
        em ciclos de conhecimento, agora você pode ampliar suas opções de formação, construindo uma carreira
        sob medida para as novas demandas do mercado. Este é o futuro, e ele começa aqui.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Entre as tecnologias abordadas no curso, destacam-se:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 mb-6">
        <ul className="list-inside space-y-1">
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Autodesk Navisworks</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Autodesk Revit</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />BIM Collab</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Orçafascio</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Obra na Mão</li>
        </ul>
        <ul className="list-inside space-y-1">
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Power BI</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Inteligência Artificial (Generativa, Computer Vision, Machine Learning)</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />QGIS</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Sisdea</li>
          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Termografia Infravermelha e Drones</li>
        </ul>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        PRINCIPAIS DIFERENCIAIS
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 list-none">
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Estrutura Modular e Flexível:</strong> Construa uma jornada de aprendizado única.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Projeto Incubadora Profissional ESUDA:</strong> Ambiente de inovação e empreendedorismo.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Foco em Construção 4.0 e Integração Tecnológica:</strong> Domine as ferramentas do futuro.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Laboratório de Tecnologia e Inovação:</strong> Parceria com a Startup Amorim TECH.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Corpo Docente de Mercado:</strong> Aprenda com referências em suas áreas.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Capacitação para Licitações e Contratos:</strong> Formação completa para setor público e privado.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Ênfase em Sustentabilidade e Eficiência:</strong> Projetos alinhados às práticas de ESG.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Networking Qualificado:</strong> Conecte-se com profissionais e empresas.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Atividades Eletivas:</strong> Canteiros Didáticos, Workshops e Masterclasses.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Infraestrutura Completa:</strong> Instalações modernas e confortáveis.
          </div>
        </li>
        <li className="bg-gray-50 p-3 rounded-lg flex items-start border border-gray-200">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-900">Convênios Corporativos:</strong> Descontos especiais para ex-alunos e conveniados.
          </div>
        </li>
      </ul>
    </div>
  );
}