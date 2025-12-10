import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronUp, Image as ImageIcon, Video, FileText, ExternalLink, Calendar, Tag, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ImageViewer from '../components/blog/ImageViewer';

export default function EmAcaoPage() {
  const [expandedPost, setExpandedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem')
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
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
    <div className="space-y-8">
      {selectedImage && (
        <ImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
      
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Blog Em Ação
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Acompanhe eventos, workshops, masterclasses e novidades da nossa comunidade acadêmica
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por palavra-chave, título, descrição ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isExpanded = expandedPost === post.id;

            return (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-200 overflow-hidden flex flex-col">
                {post.imagem_destaque && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.imagem_destaque}
                      alt={post.titulo}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleImageClick(post.imagem_destaque)}
                    />
                    <div className="absolute top-2 right-2 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.data}
                    </div>
                  </div>
                )}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{post.descricao}</p>
                    
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
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold mt-2"
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
                    <div className="space-y-4 pt-4 mt-4 border-t-2 border-pink-200">
                      {post.conteudo_completo && (
                        <div className="prose prose-sm max-w-none text-justify bg-gray-50 p-4 rounded-lg">
                          <ReactMarkdown>{post.conteudo_completo}</ReactMarkdown>
                        </div>
                      )}

                      {post.midias && post.midias.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-pink-600" />
                            Mídias Anexadas
                          </h4>
                          <div className="space-y-3">
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
                                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-300" 
                                    onClick={() => handleImageClick(midia.url)}
                                  />
                                )}
                                
                                {midia.tipo === 'video' && midia.url && (
                                  <video controls className="w-full rounded-lg">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('ParceirosPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('CalendarioDeAula')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Calendário de Aulas
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}