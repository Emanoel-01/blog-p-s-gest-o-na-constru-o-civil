import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronUp, Image as ImageIcon, Video, FileText, ExternalLink, Calendar, Tag, Search, MessageCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ImageViewer from '../components/blog/ImageViewer';
import { toast } from 'sonner';

export default function EmAcaoPage() {
  const [expandedPost, setExpandedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comentarios, setComentarios] = useState({});
  const [novoComentario, setNovoComentario] = useState({});

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem')
  });

  const { data: allComentarios = [] } = useQuery({
    queryKey: ['comentarios'],
    queryFn: () => base44.entities.Comentario.list('-created_date')
  });

  const createComentarioMutation = useMutation({
    mutationFn: (data) => base44.entities.Comentario.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comentarios']);
      toast.success('Comentário enviado! Aguardando aprovação.');
    }
  });

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      post.titulo?.toLowerCase().includes(term) ||
      post.descricao?.toLowerCase().includes(term) ||
      post.conteudo_completo?.toLowerCase().includes(term) ||
      post.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  });

  const togglePost = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const getComentariosAprovados = (postId) => {
    return allComentarios.filter(c => c.post_id === postId && c.aprovado);
  };

  const getPostsRelacionados = (currentPost) => {
    if (!currentPost.tags || currentPost.tags.length === 0) return [];
    
    return posts
      .filter(p => p.id !== currentPost.id && p.tags?.some(tag => currentPost.tags.includes(tag)))
      .slice(0, 3);
  };

  const handleSubmitComentario = (postId) => {
    const comentario = novoComentario[postId];
    if (!comentario?.autor_nome || !comentario?.conteudo) {
      toast.error('Preencha nome e comentário');
      return;
    }

    createComentarioMutation.mutate({
      post_id: postId,
      autor_nome: comentario.autor_nome,
      autor_email: comentario.autor_email || '',
      conteudo: comentario.conteudo,
      aprovado: false
    });

    setNovoComentario(prev => ({ ...prev, [postId]: {} }));
  };

  const handleImageClick = (imageUrl, allImages) => {
    const index = allImages.indexOf(imageUrl);
    setSelectedImages(allImages);
    setSelectedImageIndex(index >= 0 ? index : 0);
  };

  const getMidiaIcon = (tipo) => {
    switch(tipo) {
      case 'imagem': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'link': return <ExternalLink className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

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
      </Helmet>
      
      <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
        {selectedImages.length > 0 && (
          <ImageViewer 
            images={selectedImages} 
            initialIndex={selectedImageIndex}
            onClose={() => setSelectedImages([])} 
          />
        )}
        
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Blog Em Ação
          </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-4 sm:mb-6">
          Acompanhe eventos, workshops, masterclasses e novidades da nossa comunidade acadêmica
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Buscar por palavra-chave, título, descrição ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 py-4 sm:py-6 text-sm sm:text-base"
            />
          </div>
          {searchTerm && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => {
            const isExpanded = expandedPost === post.id;

            return (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-200 overflow-hidden flex flex-col">
                {post.imagem_destaque && (
                  <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                    <img
                      src={post.imagem_destaque}
                      alt={post.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => {
                        const allImages = [
                          post.imagem_destaque,
                          ...(post.midias || [])
                            .filter(m => m.tipo === 'imagem' && m.url)
                            .map(m => m.url)
                        ];
                        handleImageClick(post.imagem_destaque, allImages);
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="hidden sm:inline">{post.data}</span>
                      <span className="sm:hidden">{post.data.split('/')[0]}/{post.data.split('/')[1]}</span>
                    </div>
                  </div>
                )}
                <CardContent className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{post.titulo}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">{post.descricao}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-pink-50 text-pink-700 border-pink-300 text-xs flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => togglePost(post.id)}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold mt-2 text-xs sm:text-sm"
                  >
                    {isExpanded ? (
                      <>
                        Ver Menos <ChevronUp className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Ver Mais <ChevronDown className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-pink-200">
                      {post.conteudo_completo && (
                        <div className="prose prose-sm max-w-none text-justify bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                          <ReactMarkdown>{post.conteudo_completo}</ReactMarkdown>
                        </div>
                      )}

                      {post.midias && post.midias.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                            Mídias Anexadas
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            {post.midias.map((midia, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                  {getMidiaIcon(midia.tipo)}
                                  <span className="font-semibold text-sm text-gray-800 capitalize">
                                    {midia.tipo}
                                  </span>
                                </div>
                                {midia.titulo && (
                                  <p className="text-sm text-gray-600 mb-3 font-semibold">{midia.titulo}</p>
                                )}
                                
                                {midia.tipo === 'imagem' && midia.url && (
                                  <img 
                                    src={midia.url} 
                                    alt={midia.titulo || 'Imagem'}
                                    loading="lazy"
                                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-300" 
                                    onClick={() => {
                                      const allImages = [
                                        post.imagem_destaque,
                                        ...(post.midias || [])
                                          .filter(m => m.tipo === 'imagem' && m.url)
                                          .map(m => m.url)
                                      ].filter(Boolean);
                                      handleImageClick(midia.url, allImages);
                                    }}
                                  />
                                )}
                                
                                {midia.tipo === 'video' && midia.url && (
                                  <video controls preload="metadata" className="w-full rounded-lg">
                                    <source src={midia.url} />
                                    Seu navegador não suporta o elemento de vídeo.
                                  </video>
                                )}
                                
                                {(midia.tipo === 'pdf' || midia.tipo === 'link') && midia.url && (
                                  <a
                                    href={midia.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-sm"
                                  >
                                    Abrir {midia.tipo === 'pdf' ? 'PDF' : 'Link'} <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Posts Relacionados */}
                      {getPostsRelacionados(post).length > 0 && (
                        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-pink-200">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                            Posts Relacionados
                          </h4>
                          <div className="grid gap-2">
                            {getPostsRelacionados(post).map((relatedPost) => (
                              <div 
                                key={relatedPost.id}
                                onClick={() => {
                                  setExpandedPost(null);
                                  setTimeout(() => togglePost(relatedPost.id), 100);
                                }}
                                className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-all cursor-pointer"
                              >
                                <div className="flex gap-3">
                                  {relatedPost.imagem_destaque && (
                                    <img 
                                      src={relatedPost.imagem_destaque} 
                                      alt={relatedPost.titulo}
                                      loading="lazy"
                                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                                      {relatedPost.titulo}
                                    </h5>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {relatedPost.descricao}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seção de Comentários */}
                      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-pink-200">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                          Comentários ({getComentariosAprovados(post.id).length})
                        </h4>

                        {/* Formulário de Novo Comentário */}
                        <div className="bg-pink-50 p-3 sm:p-4 rounded-lg border border-pink-200">
                          <h5 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Deixe seu comentário</h5>
                          <div className="space-y-2">
                            <Input
                              placeholder="Seu nome *"
                              value={novoComentario[post.id]?.autor_nome || ''}
                              onChange={(e) => setNovoComentario(prev => ({
                                ...prev,
                                [post.id]: { ...prev[post.id], autor_nome: e.target.value }
                              }))}
                              className="text-xs sm:text-sm"
                            />
                            <Input
                              placeholder="Seu email (opcional)"
                              type="email"
                              value={novoComentario[post.id]?.autor_email || ''}
                              onChange={(e) => setNovoComentario(prev => ({
                                ...prev,
                                [post.id]: { ...prev[post.id], autor_email: e.target.value }
                              }))}
                              className="text-xs sm:text-sm"
                            />
                            <Textarea
                              placeholder="Seu comentário *"
                              rows={3}
                              value={novoComentario[post.id]?.conteudo || ''}
                              onChange={(e) => setNovoComentario(prev => ({
                                ...prev,
                                [post.id]: { ...prev[post.id], conteudo: e.target.value }
                              }))}
                              className="text-xs sm:text-sm"
                            />
                            <Button
                              onClick={() => handleSubmitComentario(post.id)}
                              size="sm"
                              className="w-full bg-pink-600 hover:bg-pink-700 text-xs sm:text-sm"
                            >
                              <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Enviar Comentário
                            </Button>
                            <p className="text-xs text-gray-500 italic">
                              * Seu comentário será publicado após aprovação
                            </p>
                          </div>
                        </div>

                        {/* Lista de Comentários Aprovados */}
                        <div className="space-y-2 sm:space-y-3">
                          {getComentariosAprovados(post.id).length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-500 italic text-center py-4">
                              Seja o primeiro a comentar!
                            </p>
                          ) : (
                            getComentariosAprovados(post.id).map((comentario) => (
                              <div key={comentario.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs flex-shrink-0">
                                    {comentario.autor_nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs sm:text-sm text-gray-800">
                                        {comentario.autor_nome}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comentario.created_date).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                      {comentario.conteudo}
                                    </p>
                                    {comentario.resposta_admin && (
                                      <div className="mt-2 bg-pink-50 p-2 rounded border-l-2 border-pink-400">
                                        <p className="text-xs font-semibold text-pink-800 mb-1">
                                          Resposta da Coordenação:
                                        </p>
                                        <p className="text-xs text-gray-700">
                                          {comentario.resposta_admin}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      </div>
                      )}
                      </CardContent>
                      </Card>
                      );
                      })}
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