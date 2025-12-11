import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Check, X, Reply } from 'lucide-react';
import { toast } from 'sonner';

export default function ComentariosManager({ comentarios, posts, onApprove, onReject, onReply }) {
  const [selectedStatus, setSelectedStatus] = useState('Pendente');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredComentarios = comentarios.filter(c => {
    if (selectedStatus === 'Pendente') return !c.aprovado;
    if (selectedStatus === 'Aprovado') return c.aprovado;
    return true;
  });

  const getPostTitle = (postId) => {
    const post = posts.find(p => p.id === postId);
    return post?.titulo || 'Post não encontrado';
  };

  const handleReply = async (comentarioId) => {
    if (!replyText.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    await onReply(comentarioId, replyText);
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gestão de Comentários</h3>
          <p className="text-sm text-gray-600 mt-1">
            Modere e responda aos comentários do blog
          </p>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Pendente">Pendentes</SelectItem>
            <SelectItem value="Aprovado">Aprovados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredComentarios.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 italic">
                Nenhum comentário {selectedStatus === 'Pendente' ? 'pendente' : selectedStatus === 'Aprovado' ? 'aprovado' : ''} encontrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComentarios.map((comentario) => (
            <Card key={comentario.id} className="border-2">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                          {comentario.autor_nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{comentario.autor_nome}</h4>
                          {comentario.autor_email && (
                            <p className="text-xs text-gray-500">{comentario.autor_email}</p>
                          )}
                        </div>
                        <Badge className={comentario.aprovado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {comentario.aprovado ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-600 mb-1">Post:</p>
                        <p className="text-sm font-semibold text-gray-800">{getPostTitle(comentario.post_id)}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <p className="text-sm text-gray-700">{comentario.conteudo}</p>
                      </div>

                      <p className="text-xs text-gray-500">
                        {new Date(comentario.created_date).toLocaleString('pt-BR')}
                      </p>

                      {comentario.resposta_admin && (
                        <div className="bg-pink-50 p-3 rounded-lg border-l-2 border-pink-400 mt-3">
                          <p className="text-xs font-semibold text-pink-800 mb-1">Sua Resposta:</p>
                          <p className="text-sm text-gray-700">{comentario.resposta_admin}</p>
                        </div>
                      )}

                      {replyingTo === comentario.id && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-3">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Responder ao comentário</h5>
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Digite sua resposta..."
                            className="text-sm mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReply(comentario.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Reply className="w-3 h-3 mr-1" />
                              Enviar Resposta
                            </Button>
                            <Button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              size="sm"
                              variant="outline"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!comentario.aprovado && (
                      <Button
                        onClick={() => onApprove(comentario.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    <Button
                      onClick={() => onReject(comentario.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {comentario.aprovado ? 'Remover' : 'Rejeitar'}
                    </Button>
                    <Button
                      onClick={() => setReplyingTo(comentario.id)}
                      size="sm"
                      variant="outline"
                      disabled={replyingTo === comentario.id}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      {comentario.resposta_admin ? 'Editar Resposta' : 'Responder'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}