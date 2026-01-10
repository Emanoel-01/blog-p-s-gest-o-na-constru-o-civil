import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle2, XCircle, Trash2, Search, ThumbsUp, Reply, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ComentariosManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('-created_date');
  const [selectedComments, setSelectedComments] = useState([]);
  const [respostaAdmin, setRespostaAdmin] = useState({});
  const queryClient = useQueryClient();

  const { data: comentarios = [], isLoading } = useQuery({
    queryKey: ['admin-comentarios'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listAllComentarios', {});
      return response.comentarios.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-data')
  });

  const updateComentarioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Comentario.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      toast.success('Comentário atualizado!');
    }
  });

  const deleteComentarioMutation = useMutation({
    mutationFn: (id) => base44.entities.Comentario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      toast.success('Comentário deletado!');
    }
  });

  const likeComentarioMutation = useMutation({
    mutationFn: async (comentarioId) => {
      const comentario = comentarios.find(c => c.id === comentarioId);
      const likes = comentario.likes || 0;
      await base44.entities.Comentario.update(comentarioId, { likes: likes + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      toast.success('Like adicionado!');
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }) => {
      if (action === 'aprovar') {
        await Promise.all(ids.map(id => 
          base44.entities.Comentario.update(id, { aprovado: true })
        ));
      } else if (action === 'rejeitar') {
        await Promise.all(ids.map(id => 
          base44.entities.Comentario.update(id, { aprovado: false })
        ));
      } else if (action === 'deletar') {
        await Promise.all(ids.map(id => 
          base44.entities.Comentario.delete(id)
        ));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      setSelectedComments([]);
      toast.success('Ação em massa executada!');
    }
  });

  const filteredComentarios = comentarios.filter(c => {
    const matchSearch = !searchTerm || 
      c.autor_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.autor_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todos' || 
      (filterStatus === 'aprovado' && c.aprovado) ||
      (filterStatus === 'pendente' && !c.aprovado);

    return matchSearch && matchStatus;
  });

  const toggleSelection = (id) => {
    setSelectedComments(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getPostTitle = (postId) => {
    const post = posts.find(p => p.id === postId);
    return post?.titulo || 'Post não encontrado';
  };

  const getRespostas = (comentarioId) => {
    return comentarios.filter(c => c.comentario_pai_id === comentarioId && c.aprovado);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          Gerenciar Comentários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros e Busca */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por autor, email ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="todos">Todos</option>
            <option value="aprovado">Aprovados</option>
            <option value="pendente">Pendentes</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="-created_date">Mais Recentes</option>
            <option value="created_date">Mais Antigos</option>
            <option value="autor_nome">Nome (A-Z)</option>
          </select>
        </div>

        {/* Ações em Massa */}
        {selectedComments.length > 0 && (
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-semibold text-gray-700">
              {selectedComments.length} selecionado(s)
            </span>
            <Button
              size="sm"
              onClick={() => bulkActionMutation.mutate({ action: 'aprovar', ids: selectedComments })}
              className="bg-green-600 hover:bg-green-700"
            >
              Aprovar Todos
            </Button>
            <Button
              size="sm"
              onClick={() => bulkActionMutation.mutate({ action: 'rejeitar', ids: selectedComments })}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Rejeitar Todos
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => bulkActionMutation.mutate({ action: 'deletar', ids: selectedComments })}
            >
              Deletar Todos
            </Button>
          </div>
        )}

        {/* Lista de Comentários */}
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Carregando comentários...</p>
        ) : filteredComentarios.length === 0 ? (
          <p className="text-center py-8 text-gray-500 italic">Nenhum comentário encontrado.</p>
        ) : (
          <div className="space-y-4">
            {filteredComentarios.filter(c => !c.comentario_pai_id).map((comentario) => {
              const respostas = getRespostas(comentario.id);
              return (
                <Card key={comentario.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedComments.includes(comentario.id)}
                        onCheckedChange={() => toggleSelection(comentario.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                                {comentario.autor_nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-gray-800">{comentario.autor_nome}</span>
                                <p className="text-xs text-gray-500">{comentario.autor_email}</p>
                              </div>
                              <Badge variant={comentario.aprovado ? 'default' : 'outline'} className={comentario.aprovado ? 'bg-green-600' : 'bg-orange-100 text-orange-800'}>
                                {comentario.aprovado ? '✓ Aprovado' : '⏳ Pendente'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              📅 {new Date(comentario.created_date).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm font-semibold text-blue-700 mb-3 bg-blue-50 px-3 py-1 rounded inline-block">
                              Post: {getPostTitle(comentario.post_id)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-pink-400">
                          <p className="text-gray-800 leading-relaxed">{comentario.conteudo}</p>
                        </div>

                        {/* Estatísticas e Ações Rápidas */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                          <button
                            onClick={() => likeComentarioMutation.mutate(comentario.id)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600 transition-colors bg-white px-3 py-1 rounded-full border hover:border-pink-300"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-semibold">{comentario.likes || 0}</span>
                          </button>
                          {respostas.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                              <Reply className="w-4 h-4" />
                              <span className="font-semibold">{respostas.length} {respostas.length === 1 ? 'resposta' : 'respostas'}</span>
                            </div>
                          )}
                        </div>

                        {/* Resposta da Coordenação */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-3">
                          <label className="text-sm font-bold text-blue-900 block mb-2 flex items-center gap-2">
                            <Reply className="w-4 h-4" />
                            Resposta da Coordenação
                          </label>
                          <Textarea
                            placeholder="Digite sua resposta como administrador..."
                            value={respostaAdmin[comentario.id] ?? comentario.resposta_admin ?? ''}
                            onChange={(e) => setRespostaAdmin(prev => ({
                              ...prev,
                              [comentario.id]: e.target.value
                            }))}
                            rows={3}
                            className="text-sm mb-2 bg-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const respostaTexto = respostaAdmin[comentario.id] ?? comentario.resposta_admin;
                              if (!respostaTexto || respostaTexto.trim() === '') {
                                toast.error('Digite uma resposta antes de salvar!');
                                return;
                              }
                              updateComentarioMutation.mutate({
                                id: comentario.id,
                                data: { 
                                  resposta_admin: respostaTexto,
                                  aprovado: true
                                }
                              });
                              setRespostaAdmin(prev => {
                                const newState = { ...prev };
                                delete newState[comentario.id];
                                return newState;
                              });
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Publicar Resposta da Coordenação
                          </Button>
                          {comentario.resposta_admin && (
                            <div className="mt-3 bg-white p-3 rounded border-l-4 border-blue-600">
                              <p className="text-xs font-bold text-blue-800 mb-1">✓ Resposta Publicada:</p>
                              <p className="text-sm text-gray-700">{comentario.resposta_admin}</p>
                            </div>
                          )}
                        </div>

                        {/* Respostas de outros usuários */}
                        {respostas.length > 0 && (
                          <div className="ml-6 space-y-2 mb-3 pl-4 border-l-2 border-pink-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">💬 Respostas dos Usuários:</p>
                            {respostas.map((resposta) => (
                              <div key={resposta.id} className="bg-gray-50 p-3 rounded border">
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                                    {resposta.autor_nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-800">{resposta.autor_nome}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(resposta.created_date).toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{resposta.conteudo}</p>
                                    <button
                                      onClick={() => likeComentarioMutation.mutate(resposta.id)}
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-pink-600 transition-colors mt-2"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{resposta.likes || 0}</span>
                                    </button>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      if (confirm('Deletar esta resposta?')) {
                                        deleteComentarioMutation.mutate(resposta.id);
                                      }
                                    }}
                                    className="h-7 w-7 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2 flex-wrap">
                          {!comentario.aprovado && (
                            <Button
                              size="sm"
                              onClick={() => updateComentarioMutation.mutate({ 
                                id: comentario.id, 
                                data: { aprovado: true } 
                              })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          {comentario.aprovado && (
                            <Button
                              size="sm"
                              onClick={() => updateComentarioMutation.mutate({ 
                                id: comentario.id, 
                                data: { aprovado: false } 
                              })}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => likeComentarioMutation.mutate(comentario.id)}
                            className="bg-pink-600 hover:bg-pink-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Curtir ({comentario.likes || 0})
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar este comentário?')) {
                                deleteComentarioMutation.mutate(comentario.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}