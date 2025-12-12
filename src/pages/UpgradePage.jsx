import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight, Handshake, Sparkles, Target, TrendingUp, Award, Users, Zap, Briefcase, GraduationCap, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UpgradePage() {
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
    <>
      <Helmet>
        <title>O Upgrade Profissional ESUDA | Da Especialização Técnica à Liderança Estratégica</title>
        <meta name="description" content="Pós-graduação ESUDA: formando líderes de nicho na Construção Civil. Arquitetura curricular inteligente que une técnica, gestão e tecnologia 4.0. Descubra o upgrade da sua carreira." />
        <meta name="keywords" content="upgrade profissional engenharia, especialização construção civil, engenheiro empresário, BIM manager, líder construção civil, pós-graduação estratégica" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/UpgradePage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="O Upgrade Profissional ESUDA | Especialização com Visão de Negócio" />
        <meta property="og:description" content="O mercado mudou. Descubra como unir especialização técnica com visão estratégica de negócio." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/UpgradePage" />
      </Helmet>
      
      <div className="px-2 sm:px-4 py-6 sm:py-10">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full mb-6 border-2 border-green-300">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-gray-800">Formando Líderes de Nicho</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
            O Futuro da Construção Civil não é dos Generalistas.<br className="hidden sm:block"/>
            É dos <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Líderes de Nicho</span>.
          </h1>
        </div>

      {/* Alert Blocks */}
      <div className="space-y-8 mb-16 sm:mb-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 p-8 sm:p-10 rounded-3xl border border-orange-200 shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
          <div className="relative flex items-start gap-5">
            <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">O Mercado Mudou</h3>
              <p className="text-gray-700 leading-[1.8] text-justify text-base sm:text-lg">
                Saber "um pouco de tudo" não garante mais os melhores contratos nem os maiores salários. 
                A Construção 4.0 exige um novo perfil profissional: <strong>o especialista que domina a técnica profunda, 
                mas que também sabe gerir, vender e liderar</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-8 sm:p-10 rounded-3xl border border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
          <div className="relative flex items-start gap-5">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Arquitetura Curricular Inteligente</h3>
              <p className="text-gray-700 leading-[1.8] text-justify text-base sm:text-lg">
                A Pós-Graduação ESUDA foi desenhada para resolver a maior dor do engenheiro e arquiteto atual: 
                <strong className="text-red-600"> o abismo entre a técnica e o negócio</strong>. 
                Nossa metodologia integra conhecimento profundo com visão estratégica.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-4 rounded-full mb-6 border border-yellow-200 shadow-md">
          <Award className="w-6 h-6 text-orange-600" />
          <span className="text-base sm:text-lg font-semibold text-gray-800">Por que Somos os Melhores?</span>
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
          3 Pilares que Tornam Esta Formação Imbatível
        </h3>
        <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto leading-[1.8]">
          Baseado em nossa metodologia de <strong>Sinergia Curricular</strong>, integramos o desenvolvimento humano 
          e estratégico com a tecnologia de ponta.
        </p>
      </div>

      {/* 3 Pilares Cards */}
      <div className="space-y-10 sm:space-y-12 mb-16 sm:mb-24">
        <div className="group relative bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute -top-5 -left-5 bg-gradient-to-br from-green-600 to-emerald-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
            1
          </div>
          <div className="flex items-start gap-5 mb-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              A Base do Profissional Empreendedor
              <span className="block text-base sm:text-lg font-medium text-green-700 mt-2">(Ciclo Comum)</span>
            </h4>
          </div>
          <p className="text-gray-700 mb-4 leading-[1.8] text-justify text-base sm:text-lg">
            Enquanto outras escolas ensinam apenas teoria básica, nós entregamos <strong>ferramentas para você 
            monetizar seu conhecimento</strong>. Antes de entrar no nicho técnico, você domina:
          </p>
          <ul className="space-y-4 ml-2 sm:ml-4">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <span className="text-gray-700 text-base sm:text-lg leading-[1.8]">
                <strong>Gestão de Negócios:</strong> Branding, Precificação e Estrutura Legal para blindar seu CPF e CNPJ.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <span className="text-gray-700 text-base sm:text-lg leading-[1.8]">
                <strong>Liderança 4.0:</strong> Inteligência Artificial Aplicada, Negociação Harvard e Marketing Pessoal.
              </span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-green-50 rounded-xl border-l-4 border-green-600">
            <p className="text-gray-900 font-bold text-base sm:text-lg leading-[1.8]">
              ✅ Resultado: Você deixa de ser apenas um executor de projetos e passa a pensar como dono do negócio.
            </p>
          </div>
        </div>

        <div className="group relative bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute -top-5 -left-5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
            2
          </div>
          <div className="flex items-start gap-5 mb-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              Especialização Cirúrgica
              <span className="block text-base sm:text-lg font-medium text-blue-700 mt-2">4 Perfis, 4 Caminhos Claros</span>
            </h4>
          </div>
          <p className="text-gray-700 mb-4 leading-[1.8] text-justify text-base sm:text-lg">
            Não formamos "faz-tudo". Nossos cursos têm <strong>foco total no resultado final esperado pelo mercado</strong>:
          </p>
          <div className="space-y-4 ml-0 sm:ml-4">
            <div className="bg-green-50 p-5 sm:p-6 rounded-2xl border-l-4 border-green-600 hover:bg-green-100 transition-colors duration-300">
              <p className="font-bold text-green-900 mb-2 text-base sm:text-lg">🏗️ Gestão de Projetos e Obras (O Perfil Business)</p>
              <p className="text-gray-700 text-sm sm:text-base leading-[1.8]">
                Focado em <strong>Dinheiro e Prazo</strong>. Você será o gestor que protege a margem de lucro, 
                domina Claims (pleitos) e garante o equilíbrio financeiro da obra.
              </p>
            </div>
            <div className="bg-blue-50 p-5 sm:p-6 rounded-2xl border-l-4 border-blue-600 hover:bg-blue-100 transition-colors duration-300">
              <p className="font-bold text-blue-900 mb-2 text-base sm:text-lg">💻 Tecnologia BIM (O Perfil Tech)</p>
              <p className="text-gray-700 text-sm sm:text-base leading-[1.8]">
                Focado em <strong>Método Virtual</strong>. Você não será apenas um desenhista 3D, mas um BIM Manager 
                estrategista que coordena dados, interoperabilidade e processos construtivos digitais.
              </p>
            </div>
            <div className="bg-green-50 p-5 sm:p-6 rounded-2xl border-l-4 border-green-600 hover:bg-green-100 transition-colors duration-300">
              <p className="font-bold text-green-900 mb-2 text-base sm:text-lg">⚙️ Manutenção Predial (O Perfil Operations)</p>
              <p className="text-gray-700 text-sm sm:text-base leading-[1.8]">
                Focado em <strong>Vida Útil e Gestão de Ativos</strong>. Saia da manutenção corretiva e lidere a era da Gestão de Facilities, 
                usando IoT, Drones e BIM FM para valorizar o patrimônio.
              </p>
            </div>
            <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border-l-4 border-gray-600 hover:bg-gray-100 transition-colors duration-300">
              <p className="font-bold text-gray-900 mb-2 text-base sm:text-lg">⚖️ Engenharia Legal (O Perfil Legal/Finance)</p>
              <p className="text-gray-700 text-sm sm:text-base leading-[1.8]">
                Focado em <strong>Valor e Prova</strong>. Torne-se a autoridade que o judiciário e os bancos respeitam. 
                Domine a <strong>regularização de imóveis</strong>, a auditoria de risco e a avaliação de ativos.
              </p>
            </div>
          </div>
        </div>

        <div className="group relative bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute -top-5 -left-5 bg-gradient-to-br from-purple-600 to-pink-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
            3
          </div>
          <div className="flex items-start gap-5 mb-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              Inteligência de Carreira
              <span className="block text-base sm:text-lg font-medium text-purple-700 mt-2">"Lifelong Learning"</span>
            </h4>
          </div>
          <p className="text-gray-700 leading-[1.8] text-justify text-base sm:text-lg">
            Nosso modelo respeita seu tempo e investimento. Ao concluir uma especialização, você já eliminou todo o 
            <strong> Ciclo Comum (360h)</strong>. Isso permite que você obtenha uma <strong className="text-green-600">segunda 
            certificação com 50% do caminho andado</strong>, incentivando sua formação contínua.
          </p>
        </div>
      </div>

      {/* Seção de Diferenciais */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 rounded-3xl p-8 sm:p-12 border-2 border-green-400 mt-12 sm:mt-20 mb-12 sm:mb-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 px-6 py-3 rounded-full mb-4 border-2 border-green-400">
            <Sparkles className="w-6 h-6 text-green-600" />
            <span className="text-base font-bold text-gray-900">O Que Nos Torna Únicos</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Principais Diferenciais
          </h3>
          <p className="text-gray-700 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Conheça o que torna nossas pós-graduações únicas e alinhadas com as demandas do mercado.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {diferenciais.map((item, index) => (
            <div key={index} className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-default">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-base sm:text-lg group-hover:text-green-700 transition-colors duration-300">{item.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 text-justify leading-[1.7]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tecnologias e Parceiros */}
        <div className="relative bg-white p-6 sm:p-8 rounded-2xl border-2 border-green-300 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-md">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900">Tecnologias e Parceiros</h4>
          </div>
          <p className="text-gray-700 mb-6 text-base sm:text-lg leading-[1.8]">
            Nossas especializações utilizam as mais avançadas ferramentas do mercado:
          </p>
          {tecnologias.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {tecnologias.map((tec) => (
                <span key={tec.id} className="bg-gradient-to-r from-green-50 to-blue-50 px-3 py-1.5 rounded-full border border-green-300 text-sm font-bold text-gray-800">
                  {tec.nome}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Autodesk Navisworks</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Autodesk Revit</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">BIM Collab</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Orçafascio</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Obra na Mão</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Power BI</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Inteligência Artificial</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">QGIS</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Sisdea</span>
              <span className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700">Termografia e Drones</span>
            </div>
          )}
          <p className="text-gray-700 text-base sm:text-lg leading-[1.8] mt-6 pt-6 border-t border-gray-200">
            <strong>Parceiros:</strong> Amorim TECH (Laboratório de Inovação), CREA/PE, CAU/PE.
          </p>
        </div>
      </div>

      {/* Dúvidas Frequentes */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl p-6 sm:p-10 md:p-12 border-2 border-gray-300 mt-12 sm:mt-20 shadow-xl">
        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full mb-4 border-2 border-gray-300 shadow-md">
            <GraduationCap className="w-6 h-6 text-gray-700" />
            <span className="text-base font-bold text-gray-900">Tire Suas Dúvidas</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Perguntas Frequentes
          </h3>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            <AccordionItem value="item-1" className="bg-white rounded-2xl border border-gray-200 px-5 sm:px-6 md:px-8 overflow-hidden hover:border-green-500 transition-all duration-300 shadow-md hover:shadow-xl">
              <AccordionTrigger className="text-left font-bold text-gray-900 text-sm sm:text-base md:text-lg hover:no-underline py-5 sm:py-6 hover:text-green-700 transition-colors duration-300">
                Estou em dúvida entre dois cursos. Qual escolher?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-sm sm:text-base md:text-lg leading-[1.8] pb-5 sm:pb-6">
                Não precisa escolher um só. Faça o primeiro e ganhe 50% de desconto no segundo. Além disso, você elimina todas as matérias comuns e termina a segunda especialização na metade do tempo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Qual a diferença entre Manutenção Predial e Engenharia Legal?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                O foco de atuação. Escolha Manutenção Predial se quer trabalhar com gestão de facilities, reparos, drones e condomínios. Escolha Engenharia Legal se quer ser Perito Judicial, avaliar imóveis para bancos ou trabalhar com regularização e usucapião.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                O curso é online ou presencial?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                É Híbrido Inteligente. As matérias de Gestão são EAD (flexibilidade). As matérias Técnicas são 100% Presenciais (prática real e networking).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Moro em outra cidade. Consigo fazer?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Sim. A transmissão é ao vivo com qualidade garantida. E o melhor: se você mora a mais de 70km de distância, tem 50% DE DESCONTO na mensalidade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                E se eu perder uma aula no sábado?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Sem problemas. Todas as aulas são gravadas. Se faltar, você assiste ao vídeo na plataforma e não perde nenhum conteúdo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                O TCC é obrigatório?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Não. O TCC é OPCIONAL e GRATUITO. Se quiser fazer, terá orientação para publicar um artigo. Se não quiser, recebe o título de especialista da mesma forma.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Sou ex-aluno da ESUDA. Tenho desconto?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Sim. Se parcelar em 10x, a sua matrícula (1ª parcela) é GRÁTIS.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Se eu indicar um amigo, ganho algo?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Ganha dinheiro no bolso. Pelo programa "Quem Indica Amigo É", se ele se matricular, a sua última mensalidade é GRÁTIS.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Vou aprender softwares de verdade?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Sim, foco total na prática. Você vai operar ferramentas como Sienge, Power BI, MS Project, Navisworks, Solibri e Sensores IoT, dependendo do curso escolhido.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Qual a duração do curso?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                São apenas 10 meses. É um formato intensivo para acelerar sua carreira.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Posso fazer duas Pós ao mesmo tempo?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
                Sim! Você pode cursar duas especializações simultaneamente aproveitando o mesmo Ciclo Comum e garantindo 50% de desconto na segunda. Para as disciplinas específicas, a flexibilidade é total: você escolhe assistir uma presencial/remota e a outra gravada, ou acompanhar ambas pelas gravações, conquistando assim sua dupla certificação com otimização máxima de tempo e investimento.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Seção Quero ser Parceiro */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 rounded-3xl p-8 sm:p-12 border-2 border-green-400 mt-12 sm:mt-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-56 h-56 bg-green-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-300 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full mb-4 border-2 border-green-400 shadow-lg">
            <Handshake className="w-6 h-6 text-green-600" />
            <span className="text-base font-bold text-gray-900">Oportunidades de Parceria</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Seja Nosso Parceiro
          </h3>
          <p className="text-gray-700 text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
            Conecte-se com o Coordenador e a ESUDA. Descubra oportunidades de parceria, receba análises personalizadas e inicie colaborações estratégicas.
          </p>
        </div>

        <div className="relative bg-white rounded-2xl p-6 sm:p-8 border-2 border-green-300 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-lg sm:text-xl">
              Tipos de Parceria Disponíveis
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Canteiros Didáticos</p>
                <p className="text-xs text-gray-600">Espaços práticos de aprendizado</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Workshops</p>
                <p className="text-xs text-gray-600">Eventos técnicos especializados</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Masterclasses</p>
                <p className="text-xs text-gray-600">Aulas com especialistas renomados</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Contratação de Alunos</p>
                <p className="text-xs text-gray-600">Acesso ao nosso talento qualificado</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Incubadora Profissional</p>
                <p className="text-xs text-gray-600">Projetos práticos com alunos</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Licença Educacional</p>
                <p className="text-xs text-gray-600">Softwares e ferramentas</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Convênios Corporativos</p>
                <p className="text-xs text-gray-600">Descontos para colaboradores</p>
              </div>
            </div>
            <div className="group flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
              <div className="bg-green-600 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Seja Professor</p>
                <p className="text-xs text-gray-600">Compartilhe seu conhecimento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-center">
          <a href="https://parcerias-esuda-amorimtech.base44.app" target="_blank" rel="noopener noreferrer">
            <Button className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold py-4 px-10 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Handshake className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
              Iniciar Parceria Agora
            </Button>
          </a>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 sm:mt-16">
        <Link to={createPageUrl('Homepage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 w-full sm:w-auto py-3 px-6 font-bold text-base transition-all duration-300">
            ← Voltar para Home
          </Button>
        </Link>
        <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto">
          <Button className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto py-3 px-6 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Ver Ciclos de Conhecimento
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
    </>
  );
}