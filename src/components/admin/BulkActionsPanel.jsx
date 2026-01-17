import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, Check, X, Trash2, Mail, AlertCircle, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BulkActionsPanel({ type, items = [] }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [grupoFilter, setGrupoFilter] = useState('Todos');
  const queryClient = useQueryClient();

  // Filtrar itens baseado em status e grupo
  const filteredItems = useMemo(() => {
    if (type !== 'leads') return items;
    
    return items.filter(item => {
      const matchesStatus = statusFilter === 'Todos' || item.status_crm === statusFilter;
      const matchesGrupo = grupoFilter === 'Todos' || item.grupo_monitoramento === grupoFilter;
      return matchesStatus && matchesGrupo;
    });
  }, [items, statusFilter, grupoFilter, type]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }) => {
      const promises = ids.map(id => {
        if (type === 'leads') {
          return base44.entities.Lead.update(id, data);
        } else if (type === 'comentarios') {
          return base44.entities.Comentario.update(id, data);
        } else if (type === 'depoimentos') {
          return base44.entities.Depoimento.update(id, data);
        }
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([type]);
      clearSelection();
      toast.success(`${selectedIds.length} item(ns) atualizado(s)`);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => {
        if (type === 'leads') {
          return base44.entities.Lead.delete(id);
        } else if (type === 'comentarios') {
          return base44.entities.Comentario.delete(id);
        } else if (type === 'depoimentos') {
          return base44.entities.Depoimento.delete(id);
        }
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([type]);
      clearSelection();
      toast.success(`${selectedIds.length} item(ns) excluído(s)`);
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });

  const handleBulkAction = (action) => {
    setCurrentAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (!currentAction) return;

    switch (currentAction) {
      case 'approve':
        if (type === 'depoimentos') {
          bulkUpdateMutation.mutate({ ids: selectedIds, data: { status: 'Aprovado' } });
        } else {
          bulkUpdateMutation.mutate({ ids: selectedIds, data: { aprovado: true } });
        }
        break;
      case 'reject':
        if (type === 'depoimentos') {
          bulkUpdateMutation.mutate({ ids: selectedIds, data: { status: 'Rejeitado' } });
        } else {
          bulkUpdateMutation.mutate({ ids: selectedIds, data: { aprovado: false } });
        }
        break;
      case 'archive':
        bulkUpdateMutation.mutate({ 
          ids: selectedIds, 
          data: { status: 'Perdido', notas: 'Arquivado automaticamente' } 
        });
        break;
      case 'delete':
        bulkDeleteMutation.mutate(selectedIds);
        break;
      case 'mark_converted':
        bulkUpdateMutation.mutate({ ids: selectedIds, data: { status: 'Convertido' } });
        break;
      default:
        break;
    }
    setShowConfirmDialog(false);
  };

  const getActionLabel = () => {
    switch (currentAction) {
      case 'approve': return 'Aprovar';
      case 'reject': return 'Rejeitar';
      case 'archive': return 'Arquivar';
      case 'delete': return 'Excluir';
      case 'mark_converted': return 'Marcar como Convertido';
      default: return '';
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Ações em Massa
          </CardTitle>
          <CardDescription>
            Selecione itens e execute ações em massa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {selectedIds.length} selecionado(s)
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAll}
                disabled={selectedIds.length === items.length}
              >
                Selecionar Todos ({items.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
                disabled={selectedIds.length === 0}
              >
                Limpar
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(type === 'comentarios' || type === 'depoimentos') && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar ({selectedIds.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('reject')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar ({selectedIds.length})
                  </Button>
                </>
              )}

              {type === 'leads' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Arquivar ({selectedIds.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('mark_converted')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar Convertido ({selectedIds.length})
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir ({selectedIds.length})
              </Button>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => toggleSelection(item.id)}
                />
                <div className="flex-1 min-w-0">
                  {type === 'leads' && (
                    <>
                      <p className="font-semibold text-sm">{item.nome}</p>
                      <p className="text-xs text-gray-600">{item.whatsapp}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.status}
                      </Badge>
                    </>
                  )}
                  {type === 'comentarios' && (
                    <>
                      <p className="font-semibold text-sm">{item.autor_nome}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.conteudo}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${item.aprovado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {item.aprovado ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </>
                  )}
                  {type === 'depoimentos' && (
                    <>
                      <p className="font-semibold text-sm">{item.nome}</p>
                      <p className="text-xs text-gray-600">{item.profissao} - {item.vinculo_pos_graduacao}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          item.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Rejeitado' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a <strong>{getActionLabel()}</strong> {selectedIds.length} item(ns).
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}