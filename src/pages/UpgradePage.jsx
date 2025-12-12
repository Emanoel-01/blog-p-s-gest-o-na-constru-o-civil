import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight, Handshake } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UpgradePage() {
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
      
      <div className="px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center leading-tight">
          O Futuro da Construção Civil não é dos Generalistas. <br className="hidden sm:block"/>É dos <span className="text-green-600">Líderes de Nicho</span>.
        </h1>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border-2 border-orange-200">
        <p className="text-gray-800 leading-relaxed text-justify text-sm sm:text-base lg:text-lg">
          O mercado mudou. Saber "um pouco de tudo" não garante mais os melhores contratos nem os maiores salários. 
          A Construção 4.0 exige um novo perfil profissional: <strong>o especialista que domina a técnica profunda, 
          mas que também sabe gerir, vender e liderar</strong>.
        </p>
      </div>

      <div className="bg-blue-50 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border border-blue-200">
        <p className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base">
          A Pós-Graduação ESUDA foi desenhada com uma <strong>arquitetura curricular inteligente</strong> que resolve 
          a maior dor do engenheiro e arquiteto atual: <strong className="text-red-600">o abismo entre a técnica e o negócio</strong>.
        </p>
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">
        🏆 Por que o Programa ESUDA é o mais completo do mercado?
      </h3>
      <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base">
        Baseado em nossa metodologia de <strong>Sinergia Curricular</strong>, integramos o desenvolvimento humano 
        e estratégico com a tecnologia de ponta. Veja os <strong>3 pilares</strong> que tornam esta formação imbatível:
      </p>

      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-green-600 shadow-md">
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
            1. A Base do Profissional Empreendedor (Ciclo Comum)
          </h4>
          <p className="text-gray-700 mb-2 sm:mb-3 leading-relaxed text-justify text-sm sm:text-base">
            Enquanto outras escolas ensinam apenas teoria básica, nós entregamos <strong>ferramentas para você 
            monetizar seu conhecimento</strong>. Antes de entrar no nicho técnico, você domina:
          </p>
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm sm:text-base">
                <strong>Gestão de Negócios:</strong> Branding, Precificação e Estrutura Legal para blindar seu CPF e CNPJ.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm sm:text-base">
                <strong>Liderança 4.0:</strong> Inteligência Artificial Aplicada, Negociação Harvard e Marketing Pessoal.
              </span>
            </li>
          </ul>
          <p className="text-gray-800 font-semibold mt-2 sm:mt-3 text-sm sm:text-base">
            ✅ Resultado: Você deixa de ser apenas um executor de projetos e passa a pensar como dono do negócio.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-blue-600 shadow-md">
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
            2. Especialização Cirúrgica: 4 Perfis, 4 Caminhos Claros
          </h4>
          <p className="text-gray-700 mb-2 sm:mb-3 leading-relaxed text-justify text-sm sm:text-base">
            Não formamos "faz-tudo". Nossos cursos têm <strong>foco total no resultado final esperado pelo mercado</strong>:
          </p>
          <div className="space-y-2 sm:space-y-3 ml-0 sm:ml-4">
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-600">
              <p className="font-bold text-green-800 mb-1 text-sm sm:text-base">🏗️ Gestão de Projetos e Obras (O Perfil Business)</p>
              <p className="text-gray-700 text-xs sm:text-sm">
                Focado em <strong>Dinheiro e Prazo</strong>. Você será o gestor que protege a margem de lucro, 
                domina Claims (pleitos) e garante o equilíbrio financeiro da obra.
              </p>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-600">
              <p className="font-bold text-blue-800 mb-1 text-sm sm:text-base">💻 Tecnologia BIM (O Perfil Tech)</p>
              <p className="text-gray-700 text-xs sm:text-sm">
                Focado em <strong>Método Virtual</strong>. Você não será apenas um desenhista 3D, mas um BIM Manager 
                estrategista que coordena dados, interoperabilidade e processos construtivos digitais.
              </p>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-600">
              <p className="font-bold text-green-800 mb-1 text-sm sm:text-base">⚙️ Manutenção Predial (O Perfil Operations)</p>
              <p className="text-gray-700 text-xs sm:text-sm">
                Focado em <strong>Vida Útil e Gestão de Ativos</strong>. Saia da manutenção corretiva e lidere a era da Gestão de Facilities, 
                usando IoT, Drones e BIM FM para valorizar o patrimônio.
              </p>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-gray-600">
              <p className="font-bold text-gray-800 mb-1 text-sm sm:text-base">⚖️ Engenharia Legal (O Perfil Legal/Finance)</p>
              <p className="text-gray-700 text-xs sm:text-sm">
                Focado em <strong>Valor e Prova</strong>. Torne-se a autoridade que o judiciário e os bancos respeitam. 
                Domine a <strong>regularização de imóveis</strong>, a auditoria de risco e a avaliação de ativos.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-green-600 shadow-md">
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
            3. Inteligência de Carreira "Lifelong Learning"
          </h4>
          <p className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base">
            Nosso modelo respeita seu tempo e investimento. Ao concluir uma especialização, você já eliminou todo o 
            <strong> Ciclo Comum (360h)</strong>. Isso permite que você obtenha uma <strong className="text-green-600">segunda 
            certificação com 50% do caminho andado</strong>, incentivando sua formação contínua.
          </p>
        </div>
      </div>

      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
        Tecnologias abordadas no curso:
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4 sm:mb-6">
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Autodesk Navisworks</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Autodesk Revit</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">BIM Collab</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Orçafascio</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Obra na Mão</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Power BI</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Inteligência Artificial</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">QGIS</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Sisdea</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Termografia e Drones</span>
        </div>
      </div>

      {/* Dúvidas Frequentes */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 border border-gray-200 mt-8 sm:mt-12">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
          ❓ Dúvidas Frequentes
        </h3>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
            <AccordionItem value="item-1" className="bg-white rounded-lg border-2 border-gray-200 px-3 sm:px-4 md:px-5 overflow-hidden">
              <AccordionTrigger className="text-left font-semibold text-gray-900 text-xs sm:text-sm md:text-base hover:no-underline py-3 sm:py-4">
                Estou em dúvida entre dois cursos. Qual escolher?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 text-justify text-xs sm:text-sm md:text-base leading-relaxed pb-3 sm:pb-4">
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
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-green-300 mt-8 sm:mt-12">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Handshake className="w-7 h-7 text-green-600" />
            Quero ser Parceiro
          </h3>
          <p className="text-gray-700 text-sm sm:text-base mb-6 max-w-2xl mx-auto leading-relaxed">
            Conecte-se com o Coordenador e a ESUDA. Descubra oportunidades de parceria, receba análises personalizadas e inicie colaborações estratégicas.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-green-200 mb-6">
          <h4 className="font-bold text-gray-800 mb-4 text-center text-base sm:text-lg">
            Tipos de Parceria Disponíveis:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Canteiros Didáticos</p>
                <p className="text-xs text-gray-600">Espaços práticos de aprendizado</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Workshops</p>
                <p className="text-xs text-gray-600">Eventos técnicos especializados</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Masterclasses</p>
                <p className="text-xs text-gray-600">Aulas com especialistas renomados</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Contratação de Alunos</p>
                <p className="text-xs text-gray-600">Acesso ao nosso talento qualificado</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Incubadora Profissional</p>
                <p className="text-xs text-gray-600">Projetos práticos com alunos</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Licença Educacional</p>
                <p className="text-xs text-gray-600">Softwares e ferramentas</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Convênios Corporativos</p>
                <p className="text-xs text-gray-600">Descontos para colaboradores</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Seja Professor</p>
                <p className="text-xs text-gray-600">Compartilhe seu conhecimento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="https://parcerias-esuda-amorimtech.base44.app" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 text-base sm:text-lg">
              <Handshake className="w-5 h-5 mr-2" />
              Iniciar Parceria
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('Homepage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('DiferenciaisPage')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Ver Diferenciais
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
    </>
  );
}