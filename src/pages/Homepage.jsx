import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Handshake, 
  Rss, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Building2
} from 'lucide-react';

export default function Homepage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem', 3)
  });

  const { data: professores = [] } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem', 4)
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('ordem', 4)
  });

  const { data: parceiros = [] } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('ordem', 6)
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

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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

      {/* Destaques */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          Conheça Nossa Comunidade
        </h2>

        {/* Blog Posts */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Rss className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Últimas do Blog</h3>
              <Link to={createPageUrl('EmAcaoPage')} className="ml-auto">
                <Button variant="outline" size="sm">
                  Ver Todos
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Link key={post.id} to={createPageUrl('EmAcaoPage')}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      {post.imagem_destaque && (
                        <img
                          src={post.imagem_destaque}
                          alt={post.titulo}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{post.data}</p>
                        <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{post.titulo}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.descricao}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid de Destaques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Corpo Docente */}
          <Link to={createPageUrl('ProfessoresPage')}>
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-400">
              <CardContent className="p-6 text-center">
                <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Corpo Docente</h3>
                <p className="text-sm text-gray-600 mb-3">Professores experientes e atuantes no mercado</p>
                {professores.length > 0 && (
                  <Badge className="bg-indigo-100 text-indigo-800">{professores.length}+ Professores</Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Corpo Discente */}
          <Link to={createPageUrl('CorpoDiscentePage')}>
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 hover:border-teal-400">
              <CardContent className="p-6 text-center">
                <div className="bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Corpo Discente</h3>
                <p className="text-sm text-gray-600 mb-3">Conheça nossos alunos e suas jornadas</p>
                {discentes.length > 0 && (
                  <Badge className="bg-teal-100 text-teal-800">{discentes.length}+ Alunos</Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Parceiros */}
          <Link to={createPageUrl('ParceirosPage')}>
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-400">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Parceiros</h3>
                <p className="text-sm text-gray-600 mb-3">Empresas e instituições que apoiam nossa jornada</p>
                {parceiros.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-800">{parceiros.length}+ Parceiros</Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Blog */}
          <Link to={createPageUrl('EmAcaoPage')}>
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 hover:border-pink-400">
              <CardContent className="p-6 text-center">
                <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rss className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Blog Em Ação</h3>
                <p className="text-sm text-gray-600 mb-3">Eventos, workshops e novidades da comunidade</p>
                <Badge className="bg-pink-100 text-pink-800">Últimas Notícias</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Dúvidas Frequentes */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
          ❓ Dúvidas Frequentes
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-4 sm:p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{faq.q}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-700 text-justify text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
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