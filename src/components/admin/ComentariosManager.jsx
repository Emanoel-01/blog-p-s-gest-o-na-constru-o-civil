import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle2, XCircle, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
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
      const allComments = await base44.asServiceRole.entities.Comentario.list(sortBy);
      return allComments;
    }
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-data')
  });

  const updateComentarioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.Comentario.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      toast.success('Comentário atualizado!');
    }
  });

  const deleteComentarioMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.Comentario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comentarios']);
      toast.success('Comentário deletado!');
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }) => {
      if (action === 'aprovar') {
        await Promise.all(ids.map(id => 
          base44.asServiceRole.entities.Comentario.update(id, { aprovado: true })
        ));
      } else if (action === 'rejeitar') {
        await Promise.all(ids.map(id => 
          base44.asServiceRole.entities.Comentario.update(id, { aprovado: false })
        ));
      } else if (action === 'deletar') {
        await Promise.all(ids.map(id => 
          base44.asServiceRole.entities.Comentario.delete(id)
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
          <div className="space-y-3">
            {filteredComentarios.map((comentario) => (
              <Card key={comentario.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedComments.includes(comentario.id)}
                      onCheckedChange={() => toggleSelection(comentario.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800">{comentario.autor_nome}</span>
                        <Badge variant={comentario.aprovado ? 'default' : 'outline'}>
                          {comentario.aprovado ? 'Aprovado' : 'Pendente'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(comentario.created_date).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{comentario.autor_email}</p>
                      <p className="text-sm font-semibold text-blue-700 mb-2">
                        Post: {getPostTitle(comentario.post_id)}
                      </p>
                      <p className="text-gray-700 mb-3">{comentario.conteudo}</p>

                      {/* Resposta Admin */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          Resposta da Coordenação:
                        </label>
                        <Textarea
                          placeholder="Digite uma resposta (opcional)..."
                          value={respostaAdmin[comentario.id] ?? comentario.resposta_admin ?? ''}
                          onChange={(e) => setRespostaAdmin(prev => ({
                            ...prev,
                            [comentario.id]: e.target.value
                          }))}
                          rows={2}
                          className="text-sm mb-2"
                        />
                        {(respostaAdmin[comentario.id] !== undefined || comentario.resposta_admin) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              updateComentarioMutation.mutate({
                                id: comentario.id,
                                data: { resposta_admin: respostaAdmin[comentario.id] ?? comentario.resposta_admin }
                              });
                              setRespostaAdmin(prev => {
                                const newState = { ...prev };
                                delete newState[comentario.id];
                                return newState;
                              });
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Salvar Resposta
                          </Button>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 mt-3">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}