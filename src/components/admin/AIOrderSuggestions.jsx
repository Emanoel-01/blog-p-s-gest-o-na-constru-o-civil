import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, ArrowUp, ArrowDown, Check, Loader2 } from 'lucide-react';

export default function AIOrderSuggestions({ entityType, items = [], onApplyOrder }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const entityLabels = {
    ciclo: 'Ciclos',
    especializacao: 'Especializações',
    professor: 'Professores',
    parceiro: 'Parceiros'
  };

  const getSuggestionMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await base44.functions.invoke('suggestOptimalOrder', {
        entity_type: entityType,
        items: items.map(item => ({
          id: item.id,
          nome: item.nome,
          titulo: item.titulo,
          carga_horaria: item.carga_horaria,
          ordem: item.ordem,
          area_conhecimento: item.area_conhecimento,
          tipo_parceria: item.tipo_parceria,
          especializacoes: item.especializacoes
        }))
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuggestion(data.suggestion);
      setLoading(false);
      toast.success('Sugestões de ordenação geradas!');
    },
    onError: (error) => {
      setLoading(false);
      toast.error('Erro ao gerar sugestões: ' + error.message);
    }
  });

  const applyOrderMutation = useMutation({
    mutationFn: async () => {
      if (!suggestion?.ordered_ids) return;
      
      const promises = suggestion.ordered_ids.map((id, index) => {
        const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
        return base44.entities[entityName].update(id, { ordem: index + 1 });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityType + 's']);
      toast.success('Ordenação aplicada com sucesso!');
      setSuggestion(null);
      if (onApplyOrder) onApplyOrder();
    },
    onError: (error) => {
      toast.error('Erro ao aplicar ordenação: ' + error.message);
    }
  });

  const getItemById = (id) => items.find(item => item.id === id);

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Sugestões de Ordenação com IA
        </CardTitle>
        <CardDescription>
          A IA analisa seus {entityLabels[entityType]} e sugere a ordem ideal de apresentação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestion ? (
          <Button
            onClick={() => getSuggestionMutation.mutate()}
            disabled={loading || items.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Sugestões de Ordenação
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
              <h4 className="font-bold text-purple-900 mb-2">Critérios Utilizados:</h4>
              <p className="text-sm text-gray-700">{suggestion.resumo_criterios}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-900">Ordem Sugerida:</h4>
              {suggestion.ordered_ids?.map((id, index) => {
                const item = getItemById(id);
                const justificativa = suggestion.justificativas?.find(j => j.id === id);
                const currentPosition = items.findIndex(i => i.id === id) + 1;
                const newPosition = index + 1;
                const positionChange = currentPosition - newPosition;

                return (
                  <div
                    key={id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-600 text-white shrink-0">
                        #{newPosition}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {item?.nome || item?.titulo || 'Item'}
                          </p>
                          {positionChange !== 0 && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              {positionChange > 0 ? (
                                <>
                                  <ArrowUp className="w-3 h-3 text-green-600" />
                                  +{positionChange}
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="w-3 h-3 text-red-600" />
                                  {positionChange}
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          {justificativa?.razao}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => applyOrderMutation.mutate()}
                disabled={applyOrderMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Aplicar Ordenação Sugerida
              </Button>
              <Button
                onClick={() => setSuggestion(null)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}