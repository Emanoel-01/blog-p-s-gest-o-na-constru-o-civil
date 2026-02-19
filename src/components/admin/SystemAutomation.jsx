import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { UserPlus, RefreshCw, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemAutomation() {
  const [inviteResults, setInviteResults] = useState(null);
  const [leadsResults, setLeadsResults] = useState(null);

  const inviteDiscentesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autoInviteDiscentes', {});
      return response.data;
    },
    onSuccess: (data) => {
      setInviteResults(data);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error('Erro ao convidar discentes: ' + error.message);
    }
  });

  const updateLeadsMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('updateOldLeads', { action });
      return response.data;
    },
    onSuccess: (data) => {
      setLeadsResults(data);
      if (data.count) {
        toast.info(`${data.count} leads antigos encontrados`);
      } else {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error('Erro ao atualizar leads: ' + error.message);
    }
  });

  return (
    <div className="space-y-6">
      {/* Convite Automático de Discentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Convite Automático de Discentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Convida automaticamente todos os discentes cadastrados que ainda não são usuários do sistema.
            Eles receberão um email com instruções para criar sua conta.
          </p>

          <Button
            onClick={() => inviteDiscentesMutation.mutate()}
            disabled={inviteDiscentesMutation.isPending}
            className="w-full gap-2"
          >
            {inviteDiscentesMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Convidar Todos os Discentes
              </>
            )}
          </Button>

          {inviteResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{inviteResults.message}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mt-3">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{inviteResults.total_discentes}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{inviteResults.invited}</p>
                  <p className="text-xs text-gray-600">Convidados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{inviteResults.already_users}</p>
                  <p className="text-xs text-gray-600">Já Usuários</p>
                </div>
              </div>
              
              {inviteResults.results && inviteResults.results.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">Ver detalhes</summary>
                  <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                    {inviteResults.results.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs py-1 border-b">
                        {r.status === 'convidado' ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                        <span>{r.nome} ({r.email})</span>
                        {r.error && <span className="text-red-600">- {r.error}</span>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atualização de Leads Antigos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Atualização de Leads Antigos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Atualiza leads de outubro/2025 ou anteriores para datas mais recentes, mantendo a proporção temporal.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => updateLeadsMutation.mutate('count')}
              disabled={updateLeadsMutation.isPending}
              className="flex-1 gap-2"
            >
              {updateLeadsMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Verificar Leads Antigos
                </>
              )}
            </Button>

            <Button
              onClick={() => updateLeadsMutation.mutate('update')}
              disabled={updateLeadsMutation.isPending || (leadsResults && leadsResults.count === 0)}
              className="flex-1 gap-2"
            >
              {updateLeadsMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Atualizar Leads
                </>
              )}
            </Button>
          </div>

          {leadsResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
              {leadsResults.count !== undefined ? (
                <>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">
                      {leadsResults.count} leads antigos encontrados
                    </span>
                  </div>
                  {leadsResults.leads && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">Ver leads</summary>
                      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                        {leadsResults.leads.map((lead, idx) => (
                          <div key={idx} className="text-xs py-1 border-b">
                            <span className="font-medium">{lead.nome}</span>
                            <span className="text-gray-600"> - {new Date(lead.created_date).toLocaleDateString()}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{lead.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">{leadsResults.message}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center mt-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{leadsResults.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{leadsResults.updated}</p>
                      <p className="text-xs text-gray-600">Atualizados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{leadsResults.errors}</p>
                      <p className="text-xs text-gray-600">Erros</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}