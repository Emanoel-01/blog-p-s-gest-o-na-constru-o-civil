import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronUp, Image as ImageIcon, Video, FileText, ExternalLink, Calendar, Tag, Search, MessageCircle, Send, User, Users, Handshake, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ImageViewer from '../components/blog/ImageViewer';
import { toast } from 'sonner';

// Função para gerar slug a partir do título
const generateSlug = (titulo, id) => {
  if (!titulo) return '';
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${id.slice(-8)}`;
};

export default function EmAcaoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTag, setFiltroTag] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('-created_date');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', ordenacao],
    queryFn: () => base44.entities.Post.list(ordenacao)
  });

  // Schema.org para BlogPosting individual
  const generateBlogSchema = (post) => {
    const author = post.professores?.length > 0 
      ? professores.find(p => p.id === post.professores[0])
      : null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.titulo,
      "description": post.descricao,
      "image": post.imagem_destaque || "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png",
      "datePublished": post.created_date,
      "dateModified": post.updated_date || post.created_date,
      "author": author ? {
        "@type": "Person",
        "name": author.nome,
        "jobTitle": author.titulo,
        "url": `https://posgraduacao-esuda.base44.app/PerfilDocente?id=${author.id}`
      } : {
        "@type": "Organization",
        "name": "ESUDA - Escola Superior de Desenvolvimento e Aperfeiçoamento"
      },
      "publisher": {
        "@type": "EducationalOrganization",
        "name": "ESUDA",
        "logo": {
          "@type": "ImageObject",
          "url": "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://posgraduacao-esuda.base44.app/EmAcaoPage?postId=${post.id}`
      },
      "keywords": post.tags?.join(', ') || '',
      "articleBody": post.conteudo_completo
    };
  };





  // Extrair todas as tags únicas
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))].sort();

  // Filtrar posts - apenas publicados
  const filteredPosts = posts.filter(post => {
    // Exibir apenas posts publicados ou agendados cuja data já passou
    const isPublicado = post.status === 'Publicado';
    const isAgendadoJaPublicado = post.status === 'Agendado' && 
      post.data_publicacao && 
      new Date(post.data_publicacao) <= new Date();
    
    if (!isPublicado && !isAgendadoJaPublicado) return false;
    
    const termMatch = !searchTerm || (
      post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.conteudo_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const tagMatch = filtroTag === 'todas' || post.tags?.includes(filtroTag);
    
    return termMatch && tagMatch;
  });

  // Paginação
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);



  return (
    <>
      <Helmet>
        <title>Blog Em Ação ESUDA | Eventos, Workshops e Novidades da Construção Civil</title>
        <meta name="description" content="Acompanhe eventos, workshops, masterclasses e novidades da comunidade acadêmica ESUDA. Blog com conteúdo sobre Construção Civil, BIM, Gestão de Obras e Tecnologias 4.0." />
        <meta name="keywords" content="blog construção civil, eventos ESUDA, workshops BIM, masterclasses engenharia, notícias construção civil, comunidade acadêmica" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/EmAcaoPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog Em Ação ESUDA | Eventos e Novidades" />
        <meta property="og:description" content="Fique por dentro dos eventos, workshops e novidades da comunidade ESUDA em Construção Civil." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/EmAcaoPage" />
        <meta property="og:image" content="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" />
        
        {/* Schema.org para Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog ESUDA em Ação",
            "description": "Blog oficial da pós-graduação ESUDA com notícias, eventos e realizações",
            "url": "https://posgraduacao-esuda.base44.app/EmAcaoPage",
            "publisher": {
              "@type": "EducationalOrganization",
              "name": "ESUDA",
              "logo": {
                "@type": "ImageObject",
                "url": "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
              }
            },
            "blogPost": filteredPosts.slice(0, 10).map(post => ({
              "@type": "BlogPosting",
              "headline": post.titulo,
              "datePublished": post.created_date,
              "url": `https://posgraduacao-esuda.base44.app/EmAcaoPage?postId=${post.id}`
            }))
          })}
        </script>
      </Helmet>
      
      <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Blog Em Ação
          </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-4 sm:mb-6">
          Acompanhe eventos, workshops, masterclasses e novidades da nossa comunidade acadêmica
        </p>

        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Buscar por palavra-chave, título, descrição ou tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 sm:pl-10 py-4 sm:py-6 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-700">Filtrar por categoria:</span>
              <Button
                variant={filtroTag === 'todas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFiltroTag('todas');
                  setCurrentPage(1);
                }}
                className={filtroTag === 'todas' ? 'bg-pink-600' : ''}
              >
                Todas
              </Button>
              {allTags.slice(0, 8).map(tag => (
                <Button
                  key={tag}
                  variant={filtroTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFiltroTag(tag);
                    setCurrentPage(1);
                  }}
                  className={filtroTag === tag ? 'bg-pink-600' : ''}
                >
                  {tag}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-700">Ordenar por:</span>
              <Button
                variant={ordenacao === '-created_date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrdenacao('-created_date')}
                className={ordenacao === '-created_date' ? 'bg-pink-600' : ''}
              >
                Mais Recentes
              </Button>
              <Button
                variant={ordenacao === 'created_date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrdenacao('created_date')}
                className={ordenacao === 'created_date' ? 'bg-pink-600' : ''}
              >
                Mais Antigos
              </Button>
              <Button
                variant={ordenacao === 'titulo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrdenacao('titulo')}
                className={ordenacao === 'titulo' ? 'bg-pink-600' : ''}
              >
                A-Z
              </Button>
            </div>
          </div>

          {(searchTerm || filtroTag !== 'todas') && (
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredPosts.length} post(s) encontrado(s)
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 italic">
              {searchTerm ? 'Nenhum post encontrado com este termo de busca.' : 'Nenhum post disponível no momento. Em breve teremos novidades!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {currentPosts.map((post) => {
            const postSlug = generateSlug(post.titulo, post.id);
            return (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-200 overflow-hidden">
                {post.imagem_destaque && (
                  <Link to={createPageUrl('PostPage') + '?slug=' + postSlug}>
                    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden cursor-pointer">
                      <img
                        src={post.imagem_destaque}
                        alt={post.titulo}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    <div className="absolute top-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Calendar className="w-4 h-4" />
                      {post.data}
                    </div>
                    </div>
                    </Link>
                    )}
                <CardContent className="p-5 sm:p-6 md:p-8">
                  <div className="mb-4">
                    <Link to={createPageUrl('PostPage') + '?slug=' + postSlug}>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 hover:text-pink-600 transition-colors cursor-pointer">
                        {post.titulo}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">{post.descricao}</p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-pink-50 text-pink-700 border-pink-300 text-sm flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                  </div>

                  <Link to={createPageUrl('PostPage') + '?slug=' + postSlug}>
                    <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3 text-base">
                      Ler Post Completo <ChevronDown className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </p>
          
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="min-w-[100px]"
            >
              ← Anterior
            </Button>
            
            {/* Desktop: Mostrar todas as páginas se forem poucas, ou com ellipsis */}
            <div className="hidden sm:flex gap-1">
              {totalPages <= 7 ? (
                [...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={currentPage === i + 1 ? 'bg-pink-600 hover:bg-pink-700' : ''}
                  >
                    {i + 1}
                  </Button>
                ))
              ) : (
                <>
                  {/* Primeira página */}
                  <Button
                    variant={currentPage === 1 ? 'default' : 'outline'}
                    onClick={() => {
                      setCurrentPage(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={currentPage === 1 ? 'bg-pink-600 hover:bg-pink-700' : ''}
                  >
                    1
                  </Button>
                  
                  {/* Ellipsis esquerda */}
                  {currentPage > 3 && <span className="px-2 py-2">...</span>}
                  
                  {/* Páginas ao redor da atual */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === currentPage ||
                      pageNum === currentPage - 1 ||
                      pageNum === currentPage + 1
                    ) {
                      if (pageNum !== 1 && pageNum !== totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={currentPage === pageNum ? 'bg-pink-600 hover:bg-pink-700' : ''}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    }
                    return null;
                  })}
                  
                  {/* Ellipsis direita */}
                  {currentPage < totalPages - 2 && <span className="px-2 py-2">...</span>}
                  
                  {/* Última página */}
                  <Button
                    variant={currentPage === totalPages ? 'default' : 'outline'}
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={currentPage === totalPages ? 'bg-pink-600 hover:bg-pink-700' : ''}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile: Apenas página atual */}
            <div className="sm:hidden">
              <span className="px-4 py-2 bg-pink-600 text-white rounded-md font-semibold">
                {currentPage}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="min-w-[100px]"
            >
              Próxima →
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link to={createPageUrl('ParceirosPage')} className="w-full sm:w-auto">
          <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('CalendarioDeAula')} className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
            Ver Calendário de Aulas →
          </Button>
        </Link>
      </div>
      </div>
      </>
      );
      }