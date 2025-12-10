import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ChevronDown, Image as ImageIcon, Video, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function EmAcaoPage() {
  const [expandedPost, setExpandedPost] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-ordem')
  });

  const togglePost = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const getMidiaIcon = (tipo) => {
    switch(tipo) {
      case 'imagem': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Blog ESUDA - Em Ação
      </h2>
      <p className="text-gray-600 mb-6 text-justify">
        Acompanhe as últimas notícias, eventos, workshops e atividades da nossa comunidade acadêmica.
      </p>

      {isLoading ? (
        <p className="text-gray-600">Carregando posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 italic text-justify">
          Nenhum post publicado ainda. Aguarde novidades em breve!
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {posts.map((post) => {
            const isExpanded = expandedPost === post.id;

            return (
              <Card key={post.id} className="bg-white border-2 border-gray-200 hover:shadow-xl transition-shadow">
                <div
                  onClick={() => togglePost(post.id)}
                  className="cursor-pointer p-4 flex justify-between items-start bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 transition-colors"
                >
                  <div className="flex gap-4 flex-1">
                    {post.imagem_destaque && (
                      <img
                        src={post.imagem_destaque}
                        alt={post.titulo}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{post.data}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{post.titulo}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.descricao}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-6 h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {isExpanded && (
                  <CardContent className="p-6 space-y-5 border-t-2 border-gray-100">
                    {post.conteudo_completo && (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{post.conteudo_completo}</ReactMarkdown>
                      </div>
                    )}

                    {post.midias && post.midias.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Mídias Anexadas:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {post.midias.map((midia, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                {getMidiaIcon(midia.tipo)}
                                <span className="text-sm font-semibold text-gray-700 capitalize">
                                  {midia.tipo}
                                </span>
                              </div>
                              {midia.titulo && (
                                <p className="text-sm text-gray-600 mb-2">{midia.titulo}</p>
                              )}
                              
                              {midia.tipo === 'imagem' && (
                                <img src={midia.url} alt={midia.titulo || 'Imagem'} className="w-full rounded-lg" />
                              )}
                              
                              {midia.tipo === 'video' && (
                                <video controls className="w-full rounded-lg">
                                  <source src={midia.url} />
                                  Seu navegador não suporta o elemento de vídeo.
                                </video>
                              )}
                              
                              {(midia.tipo === 'pdf' || midia.tipo === 'link') && (
                                <a
                                  href={midia.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Abrir {midia.tipo === 'pdf' ? 'PDF' : 'Link'} →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
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
        <Link to={createPageUrl('Homepage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
}