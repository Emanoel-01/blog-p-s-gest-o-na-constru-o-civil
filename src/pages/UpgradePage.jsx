import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function UpgradePage() {
  return (
    <div>
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
        O Futuro da Construção Civil não é dos Generalistas. <br/>É dos <span className="text-green-600">Líderes de Nicho</span>.
      </h2>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl mb-6 border-2 border-orange-200">
        <p className="text-gray-800 leading-relaxed text-justify text-lg">
          O mercado mudou. Saber "um pouco de tudo" não garante mais os melhores contratos nem os maiores salários. 
          A Construção 4.0 exige um novo perfil profissional: <strong>o especialista que domina a técnica profunda, 
          mas que também sabe gerir, vender e liderar</strong>.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
        <p className="text-gray-700 leading-relaxed text-justify">
          A Pós-Graduação ESUDA foi desenhada com uma <strong>arquitetura curricular inteligente</strong> que resolve 
          a maior dor do engenheiro e arquiteto atual: <strong className="text-red-600">o abismo entre a técnica e o negócio</strong>.
        </p>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
        🏆 Por que o Programa ESUDA é o mais completo do mercado?
      </h3>
      <p className="text-gray-700 mb-6 leading-relaxed text-justify">
        Baseado em nossa metodologia de <strong>Sinergia Curricular</strong>, integramos o desenvolvimento humano 
        e estratégico com a tecnologia de ponta. Veja os <strong>3 pilares</strong> que tornam esta formação imbatível:
      </p>

      <div className="space-y-6 mb-8">
        <div className="bg-white p-6 rounded-xl border-l-4 border-green-600 shadow-md">
          <h4 className="text-xl font-bold text-gray-900 mb-3">
            1. A Base do "Engenheiro-Empresário" (Ciclo Comum)
          </h4>
          <p className="text-gray-700 mb-3 leading-relaxed text-justify">
            Enquanto outras escolas ensinam apenas teoria básica, nós entregamos <strong>ferramentas para você 
            monetizar seu conhecimento</strong>. Antes de entrar no nicho técnico, você domina:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                <strong>Gestão de Negócios:</strong> Branding, Precificação e Estrutura Legal para blindar seu CPF e CNPJ.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                <strong>Liderança 4.0:</strong> Inteligência Artificial Aplicada, Negociação Harvard e Marketing Pessoal.
              </span>
            </li>
          </ul>
          <p className="text-gray-800 font-semibold mt-3">
            ✅ Resultado: Você deixa de ser apenas um executor de projetos e passa a pensar como dono do negócio.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-l-4 border-blue-600 shadow-md">
          <h4 className="text-xl font-bold text-gray-900 mb-3">
            2. Especialização Cirúrgica: 4 Perfis, 4 Caminhos Claros
          </h4>
          <p className="text-gray-700 mb-3 leading-relaxed text-justify">
            Não formamos "faz-tudo". Nossos cursos têm <strong>foco total no resultado final esperado pelo mercado</strong>:
          </p>
          <div className="space-y-3 ml-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="font-bold text-orange-800 mb-1">🏗️ Gestão de Projetos e Obras (O Perfil Business)</p>
              <p className="text-gray-700 text-sm">
                Focado em <strong>Dinheiro e Prazo</strong>. Você será o gestor que protege a margem de lucro, 
                domina Claims (pleitos) e garante o equilíbrio financeiro da obra.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-bold text-purple-800 mb-1">💻 Tecnologia BIM (O Perfil Tech)</p>
              <p className="text-gray-700 text-sm">
                Focado em <strong>Método Virtual</strong>. Você não será apenas um desenhista 3D, mas um BIM Manager 
                estrategista que coordena dados, interoperabilidade e processos construtivos digitais.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-bold text-green-800 mb-1">⚙️ Manutenção Predial (O Perfil Operations)</p>
              <p className="text-gray-700 text-sm">
                Focado em <strong>Vida Útil</strong>. Saia da manutenção corretiva e lidere a era da Gestão de Ativos, 
                usando IoT, Drones e BIM FM para valorizar o patrimônio.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="font-bold text-red-800 mb-1">⚖️ Engenharia Legal (O Perfil Legal/Finance)</p>
              <p className="text-gray-700 text-sm">
                Focado em <strong>Valor e Prova</strong>. Torne-se a autoridade que o judiciário e os bancos respeitam. 
                Domine a regularização de imóveis, a auditoria de risco e a avaliação de ativos.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-l-4 border-indigo-600 shadow-md">
          <h4 className="text-xl font-bold text-gray-900 mb-3">
            3. Inteligência de Carreira "Lifelong Learning"
          </h4>
          <p className="text-gray-700 leading-relaxed text-justify">
            Nosso modelo respeita seu tempo e investimento. Ao concluir uma especialização, você já eliminou todo o 
            <strong> Ciclo Comum (360h)</strong>. Isso permite que você obtenha uma <strong className="text-green-600">segunda 
            certificação com 50% do caminho andado</strong>, incentivando sua formação contínua.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Tecnologias abordadas no curso:
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-6">
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Autodesk Navisworks</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Autodesk Revit</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">BIM Collab</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Orçafascio</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Obra na Mão</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Power BI</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Inteligência Artificial</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">QGIS</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Sisdea</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">Termografia e Drones</span>
        </div>
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