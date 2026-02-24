import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Calendar, Tag, MessageCircle, Send, User, Users, Handshake, Image as ImageIcon, Video, FileText, ExternalLink, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ImageViewer from '../components/blog/ImageViewer';
import { toast } from 'sonner';

export default function PostDetail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const postId = searchParams.get('id');
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [novoComentario, setNovoComentario] = useState({});

  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const posts = await base44.entities.Post.list();
      return posts.find(p => p.id === postId);
    },
    enabled: !!postId
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
    mutationFn: async (data) => {
      const comentario = await base44.entities.Comentario.create(data);
      
      try {
        await base44.functions.invoke('notifyAdminNewContent', {
          tipo: 'comentario',
          dados: {
            autor_nome: data.autor_nome,
            autor_email: data.autor_email,
            conteudo: data.conteudo,
            post_titulo: post?.titulo || 'Post'
          }
        });
      } catch (error) {
        console.error('Erro ao notificar admins:', error);
      }
      
      return comentario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comentarios']);
      toast.success('Comentário publicado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário. Tente novamente.');
    }
  });

  const getComentariosAprovados = (postId) => {
    return allComentarios.filter(c => c.post_id === postId && c.aprovado);
  };

  const handleImageClick = (imageUrl, allImages) => {
    const index = allImages.indexOf(imageUrl);
    setSelectedImages(allImages);
    setSelectedImageIndex(index >= 0 ? index : 0);
  };

  const handleSubmitComentario = () => {
    const comentario = novoComentario;
    if (!comentario?.autor_nome || !comentario?.conteudo || !comentario?.autor_email) {
      toast.error('Preencha nome, email e comentário');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(comentario.autor_email)) {
      toast.error('Informe um email válido');
      return;
    }

    createComentarioMutation.mutate({
      post_id: postId,
      autor_nome: comentario.autor_nome,
      autor_email: comentario.autor_email,
      conteudo: comentario.conteudo,
      aprovado: true
    });

    setNovoComentario({});
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.descricao,
          url: shareUrl
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado para área de transferência!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência!');
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post não encontrado</h2>
        <Link to={createPageUrl('EmAcaoPage')}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Button>
        </Link>
      </div>
    );
  }

  const postUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{post.titulo} | Blog Em Ação ESUDA</title>
        <meta name="description" content={post.descricao} />
        <meta name="keywords" content={post.tags?.join(', ') || 'blog construção civil, eventos ESUDA'} />
        <link rel="canonical" href={postUrl} />
        
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.titulo} />
        <meta property="og:description" content={post.descricao} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={post.imagem_destaque || 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.titulo} />
        <meta name="twitter:description" content={post.descricao} />
        <meta name="twitter:image" content={post.imagem_destaque || 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png'} />
      </Helmet>

      <div className="space-y-6 px-2 sm:px-0">
        {selectedImages.length > 0 && (
          <ImageViewer 
            images={selectedImages} 
            initialIndex={selectedImageIndex}
            onClose={() => setSelectedImages([])} 
          />
        )}

        <div className="flex items-center justify-between mb-4">
          <Link to={createPageUrl('EmAcaoPage')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
          
          <Button onClick={handleShare} className="bg-gradient-to-r from-pink-600 to-rose-600">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {post.imagem_destaque && (
            <div className="relative h-72 sm:h-96 md:h-[28rem] overflow-hidden">
              <img
                src={post.imagem_destaque}
                alt={post.titulo}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg mb-4">
                  <Calendar className="w-4 h-4" />
                  {post.data}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
                  {post.titulo}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 md:p-10">
            {!post.imagem_destaque && (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.titulo}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    {post.data}
                  </div>
                </div>
              </>
            )}
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light border-l-4 border-pink-600 pl-6 italic">
              {post.descricao}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="bg-pink-50 text-pink-700 border-pink-300">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {((post.discentes && post.discentes.length > 0) || 
              (post.professores && post.professores.length > 0) || 
              (post.parceiros && post.parceiros.length > 0)) && (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Marcações:</p>
                
                {post.discentes && post.discentes.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      <User className="w-3 h-3 mr-1" />
                      Alunos
                    </Badge>
                    {post.discentes.map(discenteId => {
                      const discente = discentes.find(d => d.id === discenteId);
                      if (!discente) return null;
                      return (
                        <Link 
                          key={discenteId} 
                          to={createPageUrl('PerfilDiscente') + '?id=' + discenteId}
                        >
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 cursor-pointer hover:bg-blue-200">
                            {discente.nome}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {post.professores && post.professores.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                      <Users className="w-3 h-3 mr-1" />
                      Professores
                    </Badge>
                    {post.professores.map(professorId => {
                      const professor = professores.find(p => p.id === professorId);
                      if (!professor) return null;
                      return (
                        <Link 
                          key={professorId} 
                          to={createPageUrl('PerfilDocente') + '?id=' + professorId}
                        >
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 cursor-pointer hover:bg-indigo-200">
                            {professor.nome}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {post.parceiros && post.parceiros.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Handshake className="w-3 h-3 mr-1" />
                      Parceiros
                    </Badge>
                    {post.parceiros.map(parceiroId => {
                      const parceiro = parceiros.find(p => p.id === parceiroId);
                      if (!parceiro) return null;
                      return (
                        <Badge key={parceiroId} className="bg-green-100 text-green-800 border-green-300">
                          {parceiro.nome}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg mb-6">
              <Share2 className="w-5 h-5 text-pink-600" />
              <span className="font-semibold text-gray-700">Compartilhar:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} - ${postUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
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
              <div 
                className="prose prose-lg prose-pink max-w-none mb-8 prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-pink-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.conteudo_completo }}
              />
            )}

            {post.midias && post.midias.length > 0 && (
              <div className="space-y-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-pink-600" />
                  Mídias Anexadas
                </h3>
                <div className="space-y-6">
                  {post.midias.map((midia, idx) => {
                    const isYouTube = midia.url?.includes('youtube.com') || midia.url?.includes('youtu.be');
                    const isInstagram = midia.url?.includes('instagram.com');
                    
                    let embedUrl = midia.url;
                    if (isYouTube) {
                      const videoId = midia.url.includes('youtu.be') 
                        ? midia.url.split('youtu.be/')[1]?.split('?')[0]
                        : midia.url.split('v=')[1]?.split('&')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (isInstagram && midia.url.includes('/reel/')) {
                      const reelId = midia.url.split('/reel/')[1]?.split('/')[0];
                      embedUrl = `https://www.instagram.com/reel/${reelId}/embed`;
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
                            ) : (
                              <a
                                href={midia.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
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
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
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

            <div className="border-t-2 border-gray-200 pt-8 mt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-pink-600" />
                </div>
                Comentários ({getComentariosAprovados(postId).length})
              </h3>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200 mb-8 shadow-sm">
                <h5 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-pink-600" />
                  Deixe seu comentário
                </h5>
                <div className="space-y-3">
                  <Input
                    placeholder="Seu nome *"
                    value={novoComentario?.autor_nome || ''}
                    onChange={(e) => setNovoComentario(prev => ({
                      ...prev,
                      autor_nome: e.target.value
                    }))}
                  />
                  <Input
                    placeholder="Seu email *"
                    type="email"
                    value={novoComentario?.autor_email || ''}
                    onChange={(e) => setNovoComentario(prev => ({
                      ...prev,
                      autor_email: e.target.value
                    }))}
                  />
                  <Textarea
                    placeholder="Seu comentário *"
                    rows={4}
                    value={novoComentario?.conteudo || ''}
                    onChange={(e) => setNovoComentario(prev => ({
                      ...prev,
                      conteudo: e.target.value
                    }))}
                  />
                  <Button
                    onClick={handleSubmitComentario}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Comentário
                  </Button>
                  <p className="text-xs text-gray-500 italic">
                    * Campos obrigatórios - Seu email não será exibido publicamente
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {getComentariosAprovados(postId).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 italic">
                      Seja o primeiro a comentar!
                    </p>
                  </div>
                ) : (
                  getComentariosAprovados(postId).map((comentario) => (
                    <div key={comentario.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                          {comentario.autor_nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900">
                              {comentario.autor_nome}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {new Date(comentario.created_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comentario.conteudo}
                          </p>
                          {comentario.resposta_admin && (
                            <div className="mt-4 bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border-l-4 border-pink-500 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-sm font-bold text-pink-800">
                                  Resposta da Coordenação ESUDA
                                </p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
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
        </article>
      </div>
    </>
  );
}