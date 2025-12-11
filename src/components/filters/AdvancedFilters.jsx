import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, Save, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdvancedFilters({ pageName, filterOptions, currentFilters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['filtrosSalvos', pageName],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.FiltroSalvo.filter({ 
        pagina: pageName, 
        usuario_email: user.email 
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.FiltroSalvo.create({
        ...data,
        usuario_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['filtrosSalvos', pageName]);
      toast.success('Filtro salvo com sucesso!');
      setShowSaveDialog(false);
      setFilterName('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FiltroSalvo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['filtrosSalvos', pageName]);
      toast.success('Filtro excluído!');
    }
  });

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Digite um nome para o filtro');
      return;
    }
    saveMutation.mutate({
      nome_filtro: filterName,
      pagina: pageName,
      configuracao_filtro: currentFilters
    });
  };

  const handleLoadFilter = (filtro) => {
    onFiltersChange(filtro.configuracao_filtro);
    toast.success(`Filtro "${filtro.nome_filtro}" aplicado`);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    Object.keys(currentFilters).forEach(key => {
      clearedFilters[key] = '';
    });
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
        
        {savedFilters.length > 0 && (
          <Select onValueChange={handleLoadFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Carregar filtro salvo" />
            </SelectTrigger>
            <SelectContent>
              {savedFilters.map(filtro => (
                <SelectItem key={filtro.id} value={filtro}>
                  {filtro.nome_filtro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {option.label}
                  </label>
                  {option.type === 'select' ? (
                    <Select 
                      value={currentFilters[option.key] || ''} 
                      onValueChange={(value) => onFiltersChange({ ...currentFilters, [option.key]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={option.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        {option.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={option.type || 'text'}
                      placeholder={option.placeholder}
                      value={currentFilters[option.key] || ''}
                      onChange={(e) => onFiltersChange({ ...currentFilters, [option.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
              
              {!showSaveDialog ? (
                <Button 
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Filtros
                </Button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Nome do filtro"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveFilter}>Salvar</Button>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancelar</Button>
                </div>
              )}

              {savedFilters.length > 0 && (
                <Select onValueChange={(id) => deleteMutation.mutate(id)}>
                  <SelectTrigger className="w-48">
                    <Trash2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Excluir filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedFilters.map(filtro => (
                      <SelectItem key={filtro.id} value={filtro.id}>
                        {filtro.nome_filtro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}