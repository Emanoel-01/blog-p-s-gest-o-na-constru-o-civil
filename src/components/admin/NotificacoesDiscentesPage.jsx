import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Mail, Eye, EyeOff, Send, Filter, Search, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotificacoesDiscentesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterTurma, setFilterTurma] = useState('todas');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [selectedIds, setSelectedIds] = useState([]);

  const queryClient = useQueryClient();

  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => base44.entities.Notificacao.list('-data_envio')
  });

  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list()
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, lida }) => base44.entities.Notificacao.update(id, { lida }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      toast.success('Status atualizado!');
    }
  });

  const resendMutation = useMutation({
    mutationFn: async (notificacao) => {
      await base44.integrations.Core.SendEmail({
        to: notificacao.destinatario_email,
        subject: notificacao.titulo,
        body: notificacao.mensagem
      });
    },
    onSuccess: () => {
      toast.success('Notificação reenviada por email!');
    },
    onError: () => {
      toast.error('Erro ao reenviar notificação');
    }
  });

  const resendBulkMutation = useMutation({
    mutationFn: async (notificacoes) => {
      for (const notif of notificacoes) {
        await base44.integrations.Core.SendEmail({
          to: notif.destinatario_email,
          subject: notif.titulo,
          body: notif.mensagem
        });
      }
    },
    onSuccess: (_, notificacoes) => {
      toast.success(`${notificacoes.length} notificações reenviadas!`);
      setSelectedIds([]);
    },
    onError: () => {
      toast.error('Erro ao reenviar notificações em massa');
    }
  });

  const turmasDisponiveis = [...new Set(discentes.map(d => d.numero_turma).filter(Boolean))];

  const filteredNotificacoes = notificacoes.filter(notif => {
    const matchSearch = searchTerm === '' || 
      notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.destinatario_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todas' || 
      (filterStatus === 'lidas' && notif.lida) ||
      (filterStatus === 'nao_lidas' && !notif.lida);

    const matchTipo = filterTipo === 'todos' || notif.tipo === filterTipo;

    let matchTurma = filterTurma === 'todas';
    if (filterTurma !== 'todas') {
      const discente = discentes.find(d => d.email === notif.destinatario_email);
      matchTurma = discente?.numero_turma === filterTurma;
    }

    return matchSearch && matchStatus && matchTipo && matchTurma;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredNotificacoes.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleResendBulk = () => {
    const notificacoesParaReenviar = notificacoes.filter(n => selectedIds.includes(n.id));
    resendBulkMutation.mutate(notificacoesParaReenviar);
  };

  const stats = {
    total: notificacoes.length,
    lidas: notificacoes.filter(n => n.lida).length,
    naoLidas: notificacoes.filter(n => !n.lida).length,
    eventos: notificacoes.filter(n => n.tipo === 'evento').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Notificações dos Discentes</h2>
        <p className="text-gray-600">Visualize e gerencie todas as notificações enviadas aos alunos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.lidas}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.naoLidas}</p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eventos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.eventos}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por título ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="lidas">Lidas</SelectItem>
                <SelectItem value="nao_lidas">Não Lidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTurma} onValueChange={setFilterTurma}>
              <SelectTrigger>
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Turmas</SelectItem>
                {turmasDisponiveis.map(turma => (
                  <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">
                {selectedIds.length} notificação(ões) selecionada(s)
              </p>
              <Button
                onClick={handleResendBulk}
                disabled={resendBulkMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {resendBulkMutation.isPending ? 'Reenviando...' : 'Reenviar Selecionadas'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notificações List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Notificações ({filteredNotificacoes.length})</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredNotificacoes.length && filteredNotificacoes.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-600">Selecionar todas</label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotificacoes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma notificação encontrada</p>
            ) : (
              filteredNotificacoes.map(notif => {
                const discente = discentes.find(d => d.email === notif.destinatario_email);
                return (
                  <div
                    key={notif.id}
                    className={`border rounded-lg p-4 transition-all ${
                      notif.lida ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notif.id)}
                        onChange={() => handleSelectOne(notif.id)}
                        className="mt-1 w-4 h-4"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{notif.titulo}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={notif.lida ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                {notif.lida ? 'Lida' : 'Não Lida'}
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-800">{notif.tipo || 'Geral'}</Badge>
                              {discente?.numero_turma && (
                                <Badge className="bg-blue-100 text-blue-800">{discente.numero_turma}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsReadMutation.mutate({ id: notif.id, lida: !notif.lida })}
                            >
                              {notif.lida ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => resendMutation.mutate(notif)}
                              disabled={resendMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{notif.mensagem}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {notif.destinatario_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(notif.data_envio).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        {notif.link_acao && (
                          <a
                            href={notif.link_acao}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                          >
                            Ver mais →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}