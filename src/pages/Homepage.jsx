import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Lightbulb
} from 'lucide-react';

export default function Homepage() {

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem', 2)
  });

  const { data: incubadoraActivities = [] } = useQuery({
    queryKey: ['incubadora-preview'],
    queryFn: async () => {
      const projetos = await base44.entities.Projeto.list();
      const incubadoraProjetos = projetos.filter(p => p.tipo_projeto === 'Incubadora Profissional');
      
      if (incubadoraProjetos.length === 0) return [];
      
      const projetoIds = incubadoraProjetos.map(p => p.id);
      
      const [eventos, artigos, canteiros, freelancers, relatorios, producoes, discentes] = await Promise.all([
        base44.entities.Evento.list('-data'),
        base44.entities.ArtigoCientifico.list('-data_publicacao'),
        base44.entities.CanteiroDidatico.list('-data'),
        base44.entities.FreelancerNetwork.list('-data'),
        base44.entities.RelatorioTecnico.list('-data'),
        base44.entities.ProducaoTecnologica.list('-data'),
        base44.entities.Discente.list('nome')
      ]);
      
      const allActivities = [
        ...eventos.filter(e => projetoIds.includes(e.projeto_id)).map(e => ({ ...e, type: 'Evento', date: e.data })),
        ...artigos.filter(a => projetoIds.includes(a.projeto_id)).map(a => ({ ...a, type: 'Artigo', date: a.data_publicacao })),
        ...canteiros.filter(c => projetoIds.includes(c.projeto_id)).map(c => ({ ...c, type: 'Canteiro', date: c.data })),
        ...freelancers.filter(f => projetoIds.includes(f.projeto_id)).map(f => {
          const aluno = discentes.find(d => d.id === f.aluno_id);
          return { 
            ...f, 
            type: f.tipo || 'Freelancer', 
            date: f.data,
            aluno_foto: aluno?.foto_url,
            aluno_nome: aluno?.nome
          };
        }),
        ...relatorios.filter(r => projetoIds.includes(r.projeto_id)).map(r => ({ ...r, type: 'Relatório', date: r.data })),
        ...producoes.filter(p => projetoIds.includes(p.projeto_id)).map(p => ({ ...p, type: 'Produção', date: p.data }))
      ];
      
      return allActivities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
    }
  });



  const faqs = [
    {
      q: "Estou em dúvida entre dois cursos. Qual escolher?",
      a: "Não precisa escolher um só. Faça o primeiro e ganhe 50% de desconto no segundo. Além disso, você elimina todas as matérias comuns e termina a segunda especialização na metade do tempo."
    },
    {
      q: "Qual a diferença entre Manutenção Predial e Engenharia Legal?",
      a: "O foco de atuação. Escolha Manutenção Predial se quer trabalhar com gestão de facilities, reparos, drones e condomínios. Escolha Engenharia Legal se quer ser Perito Judicial, avaliar imóveis para bancos ou trabalhar com regularização e usucapião."
    },
    {
      q: "O curso é online ou presencial?",
      a: "É Híbrido Inteligente. As matérias de Gestão são EAD (flexibilidade). As matérias Técnicas são 100% Presenciais (prática real e networking)."
    },
    {
      q: "Moro em outra cidade. Consigo fazer?",
      a: "Sim. A transmissão é ao vivo com qualidade garantida. E o melhor: se você mora a mais de 70km de distância, tem 50% DE DESCONTO na mensalidade."
    },
    {
      q: "E se eu perder uma aula no sábado?",
      a: "Sem problemas. Todas as aulas são gravadas. Se faltar, você assiste ao vídeo na plataforma e não perde nenhum conteúdo."
    },
    {
      q: "O TCC é obrigatório?",
      a: "Não. O TCC é OPCIONAL e GRATUITO. Se quiser fazer, terá orientação para publicar um artigo. Se não quiser, recebe o título de especialista da mesma forma."
    },
    {
      q: "Sou ex-aluno da ESUDA. Tenho desconto?",
      a: "Sim. Se parcelar em 10x, a sua matrícula (1ª parcela) é GRÁTIS."
    },
    {
      q: "Se eu indicar um amigo, ganho algo?",
      a: "Ganha dinheiro no bolso. Pelo programa 'Quem Indica Amigo É', se ele se matricular, a sua última mensalidade é GRÁTIS."
    },
    {
      q: "Vou aprender softwares de verdade?",
      a: "Sim, foco total na prática. Você vai operar ferramentas como Sienge, Power BI, MS Project, Navisworks, Solibri e Sensores IoT, dependendo do curso escolhido."
    },
    {
      q: "Qual a duração do curso?",
      a: "São apenas 10 meses. É um formato intensivo para acelerar sua carreira."
    }
  ];



  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-8">
        <img
          src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
          alt="Logo da Faculdade ESUDA"
          className="w-48 sm:w-64 md:w-80 mx-auto mb-6"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Pós-Graduação em Arquitetura e Engenharia Civil
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-3xl leading-relaxed">
          Conheça as especializações: <span className="font-semibold text-green-700">Inovação, Tecnologia e Foco no Mercado</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-2xl">
          <Link to={createPageUrl('UpgradePage')} className="w-full sm:flex-1">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              Conheça o Upgrade
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:flex-1">
            <Button variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              Ver Especializações
            </Button>
          </Link>
        </div>
      </div>

      {/* Incubadora Profissional com ROI */}
      {incubadoraActivities.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Incubadora Profissional
              </h2>
            </div>
            <Link to={createPageUrl('IncubadoraProfissionalPage')}>
              <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-100">
                Ver Dashboard ROI
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {/* Destaque ROI */}
          <div className="bg-white rounded-xl p-6 mb-6 border-2 border-teal-300 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Curso com Maior Retorno ao Aluno
              </h3>
            </div>
            <p className="text-center text-gray-700 text-base max-w-2xl mx-auto leading-relaxed">
              O programa que mais gera retorno financeiro e de conhecimento aos alunos. <span className="font-bold text-green-700">Antes do final do curso, nossos alunos já recuperam o valor investido</span> através de oportunidades reais de trabalho e projetos práticos.
            </p>
            <p className="text-center text-sm text-gray-600 mt-2 italic">
              *Dados rastreáveis comprovam retorno em atividades práticas, freelancing e contratações.
            </p>
          </div>
          
          <p className="text-center text-gray-700 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
            Acompanhe as últimas atividades e produções do projeto de integração teórico-prática
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {incubadoraActivities.map((activity, idx) => {
              const title = activity.nome_evento || activity.titulo_artigo || activity.nome_canteiro || 
                           activity.nome_atividade || activity.titulo_relatorio || activity.titulo_producao;
              
              const isFreelancer = ['Freelancer', 'Empregado', 'Contratado'].includes(activity.type);
              
              return (
                <Link key={idx} to={createPageUrl('IncubadoraProfissionalPage')}>
                  <Card className="h-full bg-white border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {isFreelancer && activity.aluno_foto ? (
                          <img 
                            src={activity.aluno_foto} 
                            alt={activity.aluno_nome} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-teal-300"
                          />
                        ) : null}
                        <div className="flex-1">
                          <Badge className={`mb-2 ${
                            activity.type === 'Empregado' ? 'bg-green-100 text-green-800' :
                            activity.type === 'Contratado' ? 'bg-blue-100 text-blue-800' :
                            'bg-teal-100 text-teal-800'
                          }`}>
                            {activity.type}
                          </Badge>
                          {isFreelancer && activity.aluno_nome && (
                            <p className="text-xs text-gray-600 font-semibold mb-1">{activity.aluno_nome}</p>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{title}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.resumo}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tecnologias Exclusivas */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-blue-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Tecnologias Exclusivas Desenvolvidas pelo Coordenador
          </h2>
        </div>
        <p className="text-center text-gray-700 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
          Aplicativos inteligentes com IA que transformam a forma de trabalhar na construção civil
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <a href="https://esuda-gpo.base44.app" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full bg-white border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      GPO 4.0
                      <ExternalLink className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 mb-3">Gestão de Projetos e Obras</Badge>
                  </div>
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  Plano Interativo de Gestão de Projetos e Obras. Transforme sua forma de trabalhar com IA aplicada à gestão de projetos, orçamentos, planejamento e execução de obras.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700">
                  Acessar GPO 4.0
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </a>

          <a href="https://esuda-predial.base44.app" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full bg-white border-2 border-purple-300 hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      Predial 4.0
                      <ExternalLink className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <Badge className="bg-purple-100 text-purple-800 mb-3">Manutenção Predial</Badge>
                  </div>
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  Plano Interativo de Manutenção Predial. Transforme sua forma de trabalhar com IA aplicada à gestão de Manutenção Predial.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700">
                  Acessar Predial 4.0
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>

      {/* Conheça Nossa Comunidade */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Conheça Nossa Comunidade
        </h2>

        {/* Card do Blog */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:shadow-2xl transition-all">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-pink-600 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center">
                  <Rss className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Em Ação</h3>
                  <p className="text-sm text-gray-600">Eventos, workshops e novidades</p>
                </div>
              </div>
              <Link to={createPageUrl('EmAcaoPage')}>
                <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-100">
                  Ver Todos
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Posts Recentes */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <Link key={post.id} to={createPageUrl('EmAcaoPage')}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-white border border-pink-100">
                      <CardContent className="p-0">
                        {post.imagem_destaque && (
                          <img
                            src={post.imagem_destaque}
                            alt={post.titulo}
                            className="w-full h-36 sm:h-40 object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{post.data}</p>
                          <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm sm:text-base">{post.titulo}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{post.descricao}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum post disponível no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dúvidas Frequentes */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
          ❓ Dúvidas Frequentes
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg border-2 border-gray-200 px-4 sm:px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 text-sm sm:text-base hover:no-underline py-4 sm:py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-justify text-sm sm:text-base leading-relaxed pb-4 sm:pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Pronto para Transformar sua Carreira?
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90">
          Explore nossos ciclos de conhecimento e monte sua trilha personalizada
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto">
          <Link to={createPageUrl('CiclosPage')} className="w-full sm:w-auto">
            <Button className="w-full bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              Ver Ciclos de Conhecimento
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('EspecializacoesPage')} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-6 sm:px-8 text-base sm:text-lg">
              Ver Especializações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}