import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageCircle, Reply, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';

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

export default function CommentNotifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastChecked, setLastChecked] = useState(() => {
    return localStorage.getItem('lastCommentCheck') || new Date().toISOString();
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const { data: allComentarios = [] } = useQuery({
    queryKey: ['comentarios-notif'],
    queryFn: () => base44.entities.Comentario.list('-created_date'),
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-data')
  });

  // Encontrar comentários novos onde o usuário comentou
  const meusComentarios = allComentarios.filter(c => 
    user && c.autor_email === user.email
  );

  const meusPostsIds = meusComentarios.map(c => c.post_id);

  // Novos comentários/respostas em posts onde participei
  const novasNotificacoes = allComentarios.filter(c => {
    if (!user || c.autor_email === user.email) return false;
    if (new Date(c.created_date) <= new Date(lastChecked)) return false;
    
    // Respostas diretas aos meus comentários
    if (c.comentario_pai_id) {
      const comentarioPai = allComentarios.find(cp => cp.id === c.comentario_pai_id);
      if (comentarioPai && comentarioPai.autor_email === user.email) {
        return true;
      }
    }
    
    // Novos comentários em posts onde comentei
    return meusPostsIds.includes(c.post_id);
  });

  const handleMarkAsRead = () => {
    const now = new Date().toISOString();
    setLastChecked(now);
    localStorage.setItem('lastCommentCheck', now);
    setShowNotifications(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {novasNotificacoes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {novasNotificacoes.length > 9 ? '9+' : novasNotificacoes.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
          <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-600" />
                <h3 className="font-bold text-gray-800">Notificações</h3>
                {novasNotificacoes.length > 0 && (
                  <Badge className="bg-red-500">{novasNotificacoes.length}</Badge>
                )}
              </div>
              <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {novasNotificacoes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma notificação nova</p>
                </div>
              ) : (
                novasNotificacoes.map((notif) => {
                  const post = posts.find(p => p.id === notif.post_id);
                  const isResposta = !!notif.comentario_pai_id;
                  const slug = post ? generateSlug(post.titulo, post.id) : '';

                  return (
                    <Link
                      key={notif.id}
                      to={createPageUrl('PostPage') + '?slug=' + slug}
                      onClick={handleMarkAsRead}
                    >
                      <Card className="hover:bg-pink-50 transition-colors cursor-pointer border-l-4 border-pink-400">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            {isResposta ? (
                              <Reply className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                            ) : (
                              <MessageCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 mb-1">
                                {isResposta ? (
                                  <>
                                    <span className="text-blue-600">{notif.autor_nome}</span> respondeu seu comentário
                                  </>
                                ) : (
                                  <>
                                    <span className="text-pink-600">{notif.autor_nome}</span> comentou
                                  </>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                "{notif.conteudo}"
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                em: {post?.titulo || 'Post'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.created_date).toLocaleString('pt-BR', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>

            {novasNotificacoes.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Button
                  onClick={handleMarkAsRead}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}