import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Calendar, Tag, User, Users, Handshake, Image as ImageIcon, Video, FileText, ExternalLink } from 'lucide-react';
import ImageViewer from '../components/blog/ImageViewer';
import PDFGallery from '../components/blog/PDFGallery';
import { toast } from 'sonner';
import { usePostTracking } from '../components/blog/usePostTracking';

const generateSlug = (titulo, id) => {
  if (!titulo || !id) return '';
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${id.slice(-8)}`;
};

export default function PostPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const slug = urlParams.get('slug');
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-data')
  });

  const post = posts.find(p => {
    const postSlug = generateSlug(p.titulo, p.id);
    return slug === postSlug;
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

  const handleImageClick = (imageUrl, allImages) => {
    const index = allImages.indexOf(imageUrl);
    setSelectedImages(allImages);
    setSelectedImageIndex(index >= 0 ? index : 0);
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

  const getMidiaIcon = (tipo) => {
    switch(tipo) {
      case 'imagem': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <span className="w-4 h-4">🎵</span>;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'link': return <ExternalLink className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loadingPosts) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando post...</p>
      </div>
    );
  }

  if (!post) {
    return <Navigate to={createPageUrl('EmAcaoPage')} replace />;
  }

  const postUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{post.titulo} | Blog Em Ação ESUDA</title>
        <meta name="description" content={post.meta_description || post.descricao} />
        <meta name="keywords" content={post.palavra_chave_principal ? `${post.palavra_chave_principal}, ${post.tags?.join(', ') || ''}` : post.tags?.join(', ') || 'blog construção civil, eventos ESUDA'} />
        <link rel="canonical" href={postUrl} />
        
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.titulo} />
        <meta property="og:description" content={post.meta_description || post.descricao} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={post.imagem_destaque || 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png'} />
        <meta property="og:image:alt" content={post.titulo} />
        <meta property="article:published_time" content={post.created_date} />
        <meta property="article:modified_time" content={post.updated_date || post.created_date} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.titulo} />
        <meta name="twitter:description" content={post.meta_description || post.descricao} />
        <meta name="twitter:image" content={post.imagem_destaque || 'https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png'} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.titulo,
            "description": post.meta_description || post.descricao,
            "image": post.imagem_destaque || "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png",
            "datePublished": post.created_date,
            "dateModified": post.updated_date || post.created_date,
            "author": {
              "@type": "Organization",
              "name": "ESUDA"
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
              "@id": postUrl
            },
            "keywords": post.palavra_chave_principal || post.tags?.join(', ') || ''
          })}
        </script>
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

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {post.imagem_destaque && (
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              <img
                src={post.imagem_destaque}
                alt={post.titulo}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover cursor-pointer"
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

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{post.titulo}</h1>
            <p className="text-lg text-gray-600 mb-6">{post.descricao}</p>

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
                className="prose prose-lg max-w-none mb-8 text-justify"
                dangerouslySetInnerHTML={{ __html: post.conteudo_completo }}
              />
            )}

            {post.midias && post.midias.length > 0 && (
              <div className="space-y-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-pink-600" />
                  Mídias Anexadas
                </h3>

                {/* Galeria de PDFs */}
                {post.midias.filter(m => m.tipo === 'pdf').length > 0 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      Documentos PDF
                    </h4>
                    <PDFGallery pdfs={post.midias.filter(m => m.tipo === 'pdf')} />
                    {post.midias.filter(m => m.tipo === 'pdf' && m.cta).map((pdf, idx) => (
                      pdf.cta && (
                        <div key={idx} className="text-center">
                          <a
                            href={pdf.cta.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block px-6 py-3 rounded-full font-bold text-white shadow-xl transform hover:scale-110 transition-all ${
                              pdf.cta.cor === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                              pdf.cta.cor === 'verde' ? 'bg-green-600 hover:bg-green-700' :
                              pdf.cta.cor === 'vermelho' ? 'bg-red-600 hover:bg-red-700' :
                              pdf.cta.cor === 'laranja' ? 'bg-orange-600 hover:bg-orange-700' :
                              pdf.cta.cor === 'roxo' ? 'bg-purple-600 hover:bg-purple-700' :
                              pdf.cta.cor === 'rosa' ? 'bg-pink-600 hover:bg-pink-700' :
                              'bg-gray-600 hover:bg-gray-700'
                            }`}
                          >
                            {pdf.cta.texto}
                          </a>
                        </div>
                      )
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  {post.midias.filter(m => m.tipo !== 'pdf').map((midia, idx) => {
                    const isYouTube = midia.url?.includes('youtube.com') || midia.url?.includes('youtu.be');
                    const isInstagram = midia.url?.includes('instagram.com');
                    
                    const getYouTubeId = (url) => {
                      if (!url) return null;
                      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
                      if (url.includes('/shorts/')) return url.split('/shorts/')[1]?.split('?')[0];
                      if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0];
                      return null;
                    };

                    let embedUrl = midia.url;
                    if (isYouTube) {
                      const videoId = getYouTubeId(midia.url);
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
                          <div>
                            <img 
                              src={midia.url} 
                              alt={midia.titulo || 'Imagem'}
                              loading="lazy"
                              decoding="async"
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
                            {midia.cta && (
                              <div className="mt-4 text-center">
                                <a
                                  href={midia.cta.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-block px-6 py-3 rounded-full font-bold text-white shadow-xl transform hover:scale-110 transition-all ${
                                    midia.cta.cor === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                                    midia.cta.cor === 'verde' ? 'bg-green-600 hover:bg-green-700' :
                                    midia.cta.cor === 'vermelho' ? 'bg-red-600 hover:bg-red-700' :
                                    midia.cta.cor === 'laranja' ? 'bg-orange-600 hover:bg-orange-700' :
                                    midia.cta.cor === 'roxo' ? 'bg-purple-600 hover:bg-purple-700' :
                                    midia.cta.cor === 'rosa' ? 'bg-pink-600 hover:bg-pink-700' :
                                    'bg-gray-600 hover:bg-gray-700'
                                  }`}
                                >
                                  {midia.cta.texto}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {midia.tipo === 'video' && midia.url && (
                          <div>
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
                              <video controls preload="metadata" loading="lazy" className="w-full rounded-lg">
                                <source src={midia.url} />
                                Seu navegador não suporta o elemento de vídeo.
                              </video>
                            )}
                            {midia.cta && (
                              <div className="mt-4 text-center">
                                <a
                                  href={midia.cta.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-block px-6 py-3 rounded-full font-bold text-white shadow-xl transform hover:scale-110 transition-all ${
                                    midia.cta.cor === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                                    midia.cta.cor === 'verde' ? 'bg-green-600 hover:bg-green-700' :
                                    midia.cta.cor === 'vermelho' ? 'bg-red-600 hover:bg-red-700' :
                                    midia.cta.cor === 'laranja' ? 'bg-orange-600 hover:bg-orange-700' :
                                    midia.cta.cor === 'roxo' ? 'bg-purple-600 hover:bg-purple-700' :
                                    midia.cta.cor === 'rosa' ? 'bg-pink-600 hover:bg-pink-700' :
                                    'bg-gray-600 hover:bg-gray-700'
                                  }`}
                                >
                                  {midia.cta.texto}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {midia.tipo === 'audio' && midia.url && (
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                                  <span className="text-2xl">🎵</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-purple-900">Podcast / Áudio</p>
                                  <p className="text-xs text-purple-700">{midia.titulo || 'Reproduzir áudio'}</p>
                                </div>
                              </div>
                              <audio controls className="w-full" preload="none">
                                <source src={midia.url} type="audio/mpeg" />
                                <source src={midia.url} type="audio/wav" />
                                <source src={midia.url} type="audio/ogg" />
                                Seu navegador não suporta o elemento de áudio.
                              </audio>
                            </div>
                            {midia.cta && (
                              <div className="text-center">
                                <a
                                  href={midia.cta.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-block px-6 py-3 rounded-full font-bold text-white shadow-xl transform hover:scale-110 transition-all ${
                                    midia.cta.cor === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                                    midia.cta.cor === 'verde' ? 'bg-green-600 hover:bg-green-700' :
                                    midia.cta.cor === 'vermelho' ? 'bg-red-600 hover:bg-red-700' :
                                    midia.cta.cor === 'laranja' ? 'bg-orange-600 hover:bg-orange-700' :
                                    midia.cta.cor === 'roxo' ? 'bg-purple-600 hover:bg-purple-700' :
                                    midia.cta.cor === 'rosa' ? 'bg-pink-600 hover:bg-pink-700' :
                                    'bg-gray-600 hover:bg-gray-700'
                                  }`}
                                >
                                  {midia.cta.texto}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {midia.tipo === 'link' && midia.url && (
                          <div className="space-y-4">
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
                            {midia.cta && (
                              <div className="text-center">
                                <a
                                  href={midia.cta.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-block px-6 py-3 rounded-full font-bold text-white shadow-xl transform hover:scale-110 transition-all ${
                                    midia.cta.cor === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                                    midia.cta.cor === 'verde' ? 'bg-green-600 hover:bg-green-700' :
                                    midia.cta.cor === 'vermelho' ? 'bg-red-600 hover:bg-red-700' :
                                    midia.cta.cor === 'laranja' ? 'bg-orange-600 hover:bg-orange-700' :
                                    midia.cta.cor === 'roxo' ? 'bg-purple-600 hover:bg-purple-700' :
                                    midia.cta.cor === 'rosa' ? 'bg-pink-600 hover:bg-pink-700' :
                                    'bg-gray-600 hover:bg-gray-700'
                                  }`}
                                >
                                  {midia.cta.texto}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                            </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>
        </article>
      </div>
    </>
  );
}