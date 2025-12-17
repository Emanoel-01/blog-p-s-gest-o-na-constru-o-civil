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

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('nome')
  });

  const { data: professores = [] } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('nome')
  });

  const { data: parceiros = [] } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('nome')
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

        {/* Vídeos do Instagram e LinkedIn em Destaque */}
        <div className="max-w-4xl mx-auto mb-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4">
            Últimas Postagens nas Redes Sociais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.instagram.com/reel/DPkKSFJke6X/embed"
                className="w-full h-96 sm:h-[500px]"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                allow="encrypted-media"
              />
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.instagram.com/reel/DPMARgDDhM8/embed"
                className="w-full h-96 sm:h-[500px]"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                allow="encrypted-media"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7386641164558360576?compact=1"
                className="w-full h-96 sm:h-[500px]"
                frameBorder="0"
                allowFullScreen={true}
                title="Publicação incorporada"
              />
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7371274943013048321?compact=1"
                className="w-full h-96 sm:h-[500px]"
                frameBorder="0"
                allowFullScreen={true}
                title="Publicação incorporada"
              />
            </div>
          </div>
        </div>
        
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
        <div className="space-y-6 max-w-5xl mx-auto">
          {filteredPosts.map((post) => {
            const postUrl = `${window.location.origin}${createPageUrl('EmAcaoPage')}?postId=${post.id}`;

            const isExpanded = expandedPost === post.id;

            return (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-200 overflow-hidden">
                {post.imagem_destaque && (
                  <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
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
                    <div className="absolute top-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Calendar className="w-4 h-4" />
                      {post.data}
                    </div>
                  </div>
                )}
                <CardContent className="p-5 sm:p-6 md:p-8">
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">{post.titulo}</h3>
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

                    {/* Marcações de Pessoas */}
                    {((post.discentes && post.discentes.length > 0) || 
                      (post.professores && post.professores.length > 0) || 
                      (post.parceiros && post.parceiros.length > 0)) && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Marcações:</p>
                        
                        {/* Alunos Marcados */}
                        {post.discentes && post.discentes.length > 0 && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Alunos
                            </Badge>
                            {post.discentes.map(discenteId => {
                              const discente = discentes.find(d => d.id === discenteId);
                              if (!discente) return null;
                              return (
                                <Link 
                                  key={discenteId} 
                                  to={createPageUrl('PerfilDiscente') + '?id=' + discenteId}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 cursor-pointer hover:bg-blue-200 text-xs">
                                    {discente.nome}
                                  </Badge>
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {/* Professores Marcados */}
                        {post.professores && post.professores.length > 0 && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-xs flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Professores
                            </Badge>
                            {post.professores.map(professorId => {
                              const professor = professores.find(p => p.id === professorId);
                              if (!professor) return null;
                              return (
                                <Link 
                                  key={professorId} 
                                  to={createPageUrl('PerfilDocente') + '?id=' + professorId}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 cursor-pointer hover:bg-indigo-200 text-xs">
                                    {professor.nome}
                                  </Badge>
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {/* Parceiros Marcados */}
                        {post.parceiros && post.parceiros.length > 0 && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs flex items-center gap-1">
                              <Handshake className="w-3 h-3" />
                              Parceiros
                            </Badge>
                            {post.parceiros.map(parceiroId => {
                              const parceiro = parceiros.find(p => p.id === parceiroId);
                              if (!parceiro) return null;
                              return (
                                <Badge key={parceiroId} className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  {parceiro.nome}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => togglePost(post.id)}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3 text-base"
                  >
                    {isExpanded ? (
                      <>
                        Ver Menos <ChevronUp className="ml-2 w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Ver Mais <ChevronDown className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="space-y-6 pt-6 mt-6 border-t-2 border-pink-200">
                      {/* Botões de Compartilhamento */}
                      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg">
                        <Share2 className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-gray-700">Compartilhar:</span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} - ${postUrl}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Facebook
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          LinkedIn
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent(postUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          X / Twitter
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(postUrl);
                            toast.success('Link copiado!');
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Copiar Link
                        </button>
                      </div>

                      {post.conteudo_completo && (
                        <div className="prose prose-base max-w-none text-justify bg-gray-50 p-6 rounded-lg">
                          <ReactMarkdown>{post.conteudo_completo}</ReactMarkdown>
                        </div>
                      )}

                      {post.midias && post.midias.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-pink-600" />
                            Mídias Anexadas
                          </h4>
                          <div className="space-y-6">
                            {post.midias.map((midia, idx) => {
                              const isYouTube = midia.url?.includes('youtube.com') || midia.url?.includes('youtu.be');
                              const isInstagram = midia.url?.includes('instagram.com');
                              const isLinkedIn = midia.url?.includes('linkedin.com');
                              
                              let embedUrl = midia.url;
                              if (isYouTube) {
                                const videoId = midia.url.includes('youtu.be') 
                                  ? midia.url.split('youtu.be/')[1]?.split('?')[0]
                                  : midia.url.split('v=')[1]?.split('&')[0];
                                embedUrl = `https://www.youtube.com/embed/${videoId}`;
                              } else if (isInstagram && midia.url.includes('/reel/')) {
                                const reelId = midia.url.split('/reel/')[1]?.split('/')[0];
                                embedUrl = `https://www.instagram.com/reel/${reelId}/embed`;
                              } else if (isLinkedIn && midia.url.includes('/posts/')) {
                                embedUrl = midia.url.replace('/posts/', '/embed/feed/update/urn:li:share:');
                              }

                              return (
                                <div key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-md">
                                  {midia.titulo && (
                                    <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                      {getMidiaIcon(midia.tipo)}
                                      {midia.titulo}
                                    </h5>
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
                                    <>
                                      {isYouTube ? (
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                          <iframe
                                            src={embedUrl}
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (
                                        <video controls preload="metadata" className="w-full rounded-lg">
                                          <source src={midia.url} />
                                          Seu navegador não suporta o elemento de vídeo.
                                        </video>
                                      )}
                                    </>
                                  )}
                                  
                                  {midia.tipo === 'link' && midia.url && (
                                    <>
                                      {isInstagram ? (
                                        <div className="w-full max-w-lg mx-auto">
                                          <iframe
                                            src={embedUrl}
                                            className="w-full h-[600px] rounded-lg"
                                            frameBorder="0"
                                            scrolling="no"
                                            allowTransparency={true}
                                            allow="encrypted-media"
                                          />
                                        </div>
                                      ) : isLinkedIn ? (
                                        <div className="w-full">
                                          <iframe
                                            src={embedUrl}
                                            className="w-full h-[500px] rounded-lg"
                                            frameBorder="0"
                                            allowFullScreen={true}
                                          />
                                        </div>
                                      ) : (
                                        <a
                                          href={midia.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base"
                                        >
                                          Abrir Link <ExternalLink className="w-5 h-5" />
                                        </a>
                                      )}
                                    </>
                                  )}
                                  
                                  {midia.tipo === 'pdf' && midia.url && (
                                    <a
                                      href={midia.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base"
                                    >
                                      Abrir PDF <ExternalLink className="w-5 h-5" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
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