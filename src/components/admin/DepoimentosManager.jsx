import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Check, X, Edit, UserCircle, Trash2, AlertTriangle, Search, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import BulkActionsPanel from './BulkActionsPanel';

export default function DepoimentosManager() {
  const queryClient = useQueryClient();
  const [editingDep, setEditingDep] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(null);
  
  // Filtros e ordenação
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('data_desc');

  const { data: depoimentos = [] } = useQuery({
    queryKey: ['admin-depoimentos'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listAllDepoimentos', {});
      return response.depoimentos;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Depoimento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-depoimentos']);
      toast.success('Atualizado!');
      setEditingDep(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Depoimento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-depoimentos']);
      toast.success('Depoimento deletado!');
      setDeleteConfirmDialog(null);
    },
  });

  const handleApprove = async (dep) => {
    updateMutation.mutate({ id: dep.id, data: { status: 'Aprovado' } });
    
    // Enviar notificação por email
    try {
      await base44.functions.invoke('sendDepoimentoNotification', {
        depoimentoId: dep.id,
        action: 'approved',
        depoimento: dep
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const handleReject = async (dep) => {
    updateMutation.mutate({ id: dep.id, data: { status: 'Rejeitado' } });
    
    // Enviar notificação por email
    try {
      await base44.functions.invoke('sendDepoimentoNotification', {
        depoimentoId: dep.id,
        action: 'rejected',
        depoimento: dep
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const handleEdit = (dep) => {
    setEditingDep(dep);
    setEditForm({
      nome: dep.nome,
      profissao: dep.profissao,
      vinculo_pos_graduacao: dep.vinculo_pos_graduacao,
      depoimento_texto: dep.depoimento_texto,
      admin_observacoes: dep.admin_observacoes || '',
      autoApprove: dep.autoApprove || false,
      featured: dep.featured || false,
      status: dep.status,
    });
  };

  const handleSaveEdit = () => {
    // Se autoApprove for true, aprovar automaticamente
    const dataToUpdate = {
      ...editForm,
      ...(editForm.autoApprove && editingDep.status === 'Pendente' 
        ? { status: 'Aprovado' } 
        : {}
      )
    };
    
    updateMutation.mutate({ id: editingDep.id, data: dataToUpdate });
  };

  const handleDeleteClick = (dep) => {
    setDeleteConfirmDialog(dep);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmDialog) {
      deleteMutation.mutate(deleteConfirmDialog.id);
    }
  };

  // Filtrar e ordenar depoimentos
  const filteredAndSortedDepoimentos = useMemo(() => {
    let filtered = [...depoimentos];
    
    // Filtro por status
    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    // Busca por nome ou texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.nome?.toLowerCase().includes(term) ||
        d.depoimento_texto?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term)
      );
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'data_desc':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'data_asc':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'nome_asc':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'nome_desc':
          return (b.nome || '').localeCompare(a.nome || '');
        case 'rating_desc':
          return (b.avaliacao_estrelas || 0) - (a.avaliacao_estrelas || 0);
        case 'rating_asc':
          return (a.avaliacao_estrelas || 0) - (b.avaliacao_estrelas || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [depoimentos, statusFilter, searchTerm, sortBy]);

  const pendentes = depoimentos.filter(d => d.status === 'Pendente');
  const aprovados = depoimentos.filter(d => d.status === 'Aprovado');
  const rejeitados = depoimentos.filter(d => d.status === 'Rejeitado');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Gerenciar Depoimentos</h3>

      {/* Ações em Massa */}
      {pendentes.length > 0 && (
        <BulkActionsPanel 
          type="depoimentos" 
          items={pendentes}
        />
      )}

      {/* Filtros e Busca */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </Label>
              <Input
                placeholder="Nome, email ou texto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Ordenar por
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_desc">Mais Recentes</SelectItem>
                  <SelectItem value="data_asc">Mais Antigos</SelectItem>
                  <SelectItem value="nome_asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="nome_desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="rating_desc">Maior Avaliação</SelectItem>
                  <SelectItem value="rating_asc">Menor Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'Todos') && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {filteredAndSortedDepoimentos.length} resultado(s)
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('Todos');
                }}
                className="text-xs"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendentes.length}</p>
            <p className="text-sm text-yellow-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{aprovados.length}</p>
            <p className="text-sm text-green-600">Aprovados</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{rejeitados.length}</p>
            <p className="text-sm text-red-600">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {filteredAndSortedDepoimentos.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 italic">
              Nenhum depoimento encontrado com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredAndSortedDepoimentos.map((dep) => (
        <Card key={dep.id} className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {dep.foto_url ? (
                  <img src={dep.foto_url} alt={dep.nome} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-400" />
                )}
                <div>
                  <h4 className="font-bold text-lg">{dep.nome}</h4>
                  <p className="text-sm text-gray-600">{dep.profissao} - {dep.vinculo_pos_graduacao}</p>
                  <p className="text-xs text-gray-500">{dep.email} | {dep.telefone}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {dep.autoApprove && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Auto-Aprovação Ativa
                      </Badge>
                    )}
                    {dep.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        ⭐ Em Destaque
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Badge className={
                dep.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                dep.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }>
                {dep.status}
              </Badge>
            </div>

            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${dep.avaliacao_estrelas >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>

            {dep.depoimento_texto && (
              <p className="text-gray-700 mb-4 italic">"{dep.depoimento_texto}"</p>
            )}

            {dep.depoimento_video_url && (
              <video controls className="w-full max-w-md rounded-lg mb-4">
                <source src={dep.depoimento_video_url} />
              </video>
            )}

            {dep.depoimento_audio_url && (
              <audio controls className="w-full mb-4">
                <source src={dep.depoimento_audio_url} />
              </audio>
            )}

            {dep.admin_observacoes && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Observações Admin:</p>
                <p className="text-sm text-gray-600">{dep.admin_observacoes}</p>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {dep.status !== 'Aprovado' && (
                <Button onClick={() => handleApprove(dep)} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-1" /> Aprovar
                </Button>
              )}
              {dep.status !== 'Rejeitado' && (
                <Button onClick={() => handleReject(dep)} size="sm" variant="destructive">
                  <X className="w-4 h-4 mr-1" /> Rejeitar
                </Button>
              )}
              <Button onClick={() => handleEdit(dep)} size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
              <Button onClick={() => handleDeleteClick(dep)} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4 mr-1" /> Deletar
              </Button>
            </div>
          </CardContent>
        </Card>
      )))}

      {/* Dialog de Edição */}
      <Dialog open={!!editingDep} onOpenChange={() => setEditingDep(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Depoimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Nome</label>
              <Input value={editForm.nome || ''} onChange={(e) => setEditForm({...editForm, nome: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold">Profissão</label>
              <Input value={editForm.profissao || ''} onChange={(e) => setEditForm({...editForm, profissao: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold">Vínculo</label>
              <Input value={editForm.vinculo_pos_graduacao || ''} onChange={(e) => setEditForm({...editForm, vinculo_pos_graduacao: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold">Depoimento</label>
              <Textarea value={editForm.depoimento_texto || ''} onChange={(e) => setEditForm({...editForm, depoimento_texto: e.target.value})} rows={4} />
            </div>
            <div>
              <label className="text-sm font-semibold">Observações Admin</label>
              <Textarea value={editForm.admin_observacoes || ''} onChange={(e) => setEditForm({...editForm, admin_observacoes: e.target.value})} rows={3} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Status</label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoApprove" 
                  checked={editForm.autoApprove || false}
                  onCheckedChange={(checked) => setEditForm({...editForm, autoApprove: checked})}
                />
                <Label htmlFor="autoApprove" className="text-sm font-semibold">
                  Aprovação Automática
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  checked={editForm.featured || false}
                  onCheckedChange={(checked) => setEditForm({...editForm, featured: checked})}
                />
                <Label htmlFor="featured" className="text-sm font-semibold">
                  ⭐ Depoimento em Destaque
                </Label>
              </div>

              <p className="text-xs text-gray-500 italic">
                * Depoimentos em destaque aparecem na homepage
              </p>
            </div>
            <Button onClick={handleSaveEdit} className="w-full bg-green-600 hover:bg-green-700">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!deleteConfirmDialog} onOpenChange={() => setDeleteConfirmDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja deletar permanentemente o depoimento de{' '}
              <strong>{deleteConfirmDialog?.nome}</strong>?
            </p>
            <p className="text-sm text-gray-500 italic">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmDialog(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Sim, Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}