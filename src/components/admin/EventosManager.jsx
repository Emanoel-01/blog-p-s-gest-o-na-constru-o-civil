import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, MapPin, Plus, Edit, Trash2, Send, Users, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EventosManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    localizacao: '',
    turmas_alvo: [],
    tipo_evento: 'Outro',
    link_inscricao: '',
    imagem_url: '',
    status: 'Programado'
  });
  const [newTurma, setNewTurma] = useState('');

  const queryClient = useQueryClient();

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => base44.entities.EventoDiscente.list('-data_evento')
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list()
  });

  const turmasDisponiveis = [...new Set(discentes.map(d => d.numero_turma).filter(Boolean))];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EventoDiscente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento criado com sucesso!');
      resetForm();
    },
    onError: () => toast.error('Erro ao criar evento')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EventoDiscente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento atualizado com sucesso!');
      resetForm();
    },
    onError: () => toast.error('Erro ao atualizar evento')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventoDiscente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento excluído com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir evento')
  });

  const notifyMutation = useMutation({
    mutationFn: async (evento_id) => {
      const { notifyDiscentesEvento } = await import('@/functions/notifyDiscentesEvento');
      return notifyDiscentesEvento({ evento_id });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success(`Notificações enviadas para ${data.total_notificacoes} discentes!`);
    },
    onError: () => toast.error('Erro ao enviar notificações')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvento) {
      updateMutation.mutate({ id: editingEvento.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao,
      data_evento: evento.data_evento,
      localizacao: evento.localizacao,
      turmas_alvo: evento.turmas_alvo || [],
      tipo_evento: evento.tipo_evento || 'Outro',
      link_inscricao: evento.link_inscricao || '',
      imagem_url: evento.imagem_url || '',
      status: evento.status || 'Programado'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvento(null);
    setFormData({
      titulo: '',
      descricao: '',
      data_evento: '',
      localizacao: '',
      turmas_alvo: [],
      tipo_evento: 'Outro',
      link_inscricao: '',
      imagem_url: '',
      status: 'Programado'
    });
  };

  const addTurma = () => {
    if (newTurma && !formData.turmas_alvo.includes(newTurma)) {
      setFormData({ ...formData, turmas_alvo: [...formData.turmas_alvo, newTurma] });
      setNewTurma('');
    }
  };

  const removeTurma = (turma) => {
    setFormData({ ...formData, turmas_alvo: formData.turmas_alvo.filter(t => t !== turma) });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Programado': 'bg-blue-100 text-blue-800',
      'Em Andamento': 'bg-green-100 text-green-800',
      'Concluído': 'bg-gray-100 text-gray-800',
      'Cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Eventos para Discentes</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-green-300">
          <CardHeader className="bg-green-50">
            <CardTitle>{editingEvento ? 'Editar Evento' : 'Criar Novo Evento'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título do Evento *</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  placeholder="Ex: Workshop de BIM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição *</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  rows={4}
                  placeholder="Descreva o evento..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data e Hora do Evento *</label>
                  <Input
                    type="datetime-local"
                    value={formData.data_evento}
                    onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                  <Select value={formData.tipo_evento} onValueChange={(v) => setFormData({ ...formData, tipo_evento: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aula">Aula</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                      <SelectItem value="Evento Social">Evento Social</SelectItem>
                      <SelectItem value="Avaliação">Avaliação</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Localização *</label>
                <Input
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  required
                  placeholder="Ex: Auditório Principal - Campus ESUDA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Turmas Alvo (deixe vazio para todos)</label>
                <div className="flex gap-2 mb-2">
                  <Select value={newTurma} onValueChange={setNewTurma}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmasDisponiveis.map(turma => (
                        <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addTurma} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.turmas_alvo.map(turma => (
                    <Badge key={turma} className="bg-blue-600 text-white">
                      {turma}
                      <button type="button" onClick={() => removeTurma(turma)} className="ml-2">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Link de Inscrição/Mais Info</label>
                  <Input
                    value={formData.link_inscricao}
                    onChange={(e) => setFormData({ ...formData, link_inscricao: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programado">Programado</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  {editingEvento ? 'Atualizar Evento' : 'Criar Evento'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {eventos.map(evento => (
          <Card key={evento.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{evento.titulo}</h3>
                    <Badge className={getStatusColor(evento.status)}>
                      {evento.status}
                    </Badge>
                    {evento.notificacao_enviada && (
                      <Badge className="bg-green-600 text-white">
                        <Send className="w-3 h-3 mr-1" />
                        Notificado
                      </Badge>
                    )}
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">{evento.tipo_evento}</Badge>
                </div>
                <div className="flex gap-2">
                  {!evento.notificacao_enviada && (
                    <Button
                      size="sm"
                      onClick={() => notifyMutation.mutate(evento.id)}
                      disabled={notifyMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Notificar
                    </Button>
                  )}
                  <Button size="sm" onClick={() => handleEdit(evento)} variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={() => deleteMutation.mutate(evento.id)} variant="outline" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{evento.descricao}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(evento.data_evento).toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {evento.localizacao}
                </div>
                {evento.turmas_alvo && evento.turmas_alvo.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Turmas: {evento.turmas_alvo.join(', ')}
                  </div>
                )}
              </div>

              {evento.link_inscricao && (
                <a href={evento.link_inscricao} target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
                  <Button variant="outline" size="sm">
                    Mais Informações →
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}