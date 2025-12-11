import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Check, X, Edit, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DepoimentosManager() {
  const queryClient = useQueryClient();
  const [editingDep, setEditingDep] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: depoimentos = [] } = useQuery({
    queryKey: ['admin-depoimentos'],
    queryFn: () => base44.entities.Depoimento.list('-created_date'),
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
    },
  });

  const handleApprove = (dep) => {
    updateMutation.mutate({ id: dep.id, data: { status: 'Aprovado' } });
  };

  const handleReject = (dep) => {
    updateMutation.mutate({ id: dep.id, data: { status: 'Rejeitado' } });
  };

  const handleEdit = (dep) => {
    setEditingDep(dep);
    setEditForm({
      nome: dep.nome,
      profissao: dep.profissao,
      vinculo_pos_graduacao: dep.vinculo_pos_graduacao,
      depoimento_texto: dep.depoimento_texto,
      admin_observacoes: dep.admin_observacoes || '',
    });
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ id: editingDep.id, data: editForm });
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja deletar este depoimento?')) {
      deleteMutation.mutate(id);
    }
  };

  const pendentes = depoimentos.filter(d => d.status === 'Pendente');
  const aprovados = depoimentos.filter(d => d.status === 'Aprovado');
  const rejeitados = depoimentos.filter(d => d.status === 'Rejeitado');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Gerenciar Depoimentos</h3>

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

      {depoimentos.map((dep) => (
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
              <Button onClick={() => handleDelete(dep.id)} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4 mr-1" /> Deletar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

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
            <Button onClick={handleSaveEdit} className="w-full bg-green-600 hover:bg-green-700">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}