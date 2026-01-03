import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, User, Filter, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ActivityLog() {
  const [actionFilter, setActionFilter] = useState('Todas');
  const [userFilter, setUserFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['crm-activity-log'],
    queryFn: () => base44.entities.CRMActivityLog.list('-created_date', 100)
  });

  // Extrair lista de usuários únicos
  const uniqueUsers = [...new Set(logs.map(l => l.user_email))].filter(Boolean);

  const filtered = logs.filter(log => {
    const matchesAction = actionFilter === 'Todas' || log.action_type === actionFilter;
    const matchesUser = userFilter === 'Todos' || log.user_email === userFilter;
    const matchesSearch = !searchTerm || 
      log.lead_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesUser && matchesSearch;
  });

  const getActionLabel = (type) => {
    const labels = {
      'lead_criado': 'Lead Criado',
      'lead_atualizado': 'Lead Atualizado',
      'lead_excluido': 'Lead Excluído',
      'email_em_massa': 'Email em Massa',
      'campanha_criada': 'Campanha Criada',
      'sincronizacao_planilha': 'Sincronização',
      'duplicatas_removidas': 'Limpeza de Duplicatas'
    };
    return labels[type] || type;
  };

  const getActionColor = (type) => {
    const colors = {
      'lead_criado': 'bg-green-100 text-green-800',
      'lead_atualizado': 'bg-blue-100 text-blue-800',
      'lead_excluido': 'bg-red-100 text-red-800',
      'email_em_massa': 'bg-purple-100 text-purple-800',
      'campanha_criada': 'bg-indigo-100 text-indigo-800',
      'sincronizacao_planilha': 'bg-yellow-100 text-yellow-800',
      'duplicatas_removidas': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Log de Atividades do CRM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Histórico completo de todas as ações realizadas pelos administradores do CRM.
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por lead ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas Ações</SelectItem>
                <SelectItem value="lead_criado">Lead Criado</SelectItem>
                <SelectItem value="lead_atualizado">Lead Atualizado</SelectItem>
                <SelectItem value="lead_excluido">Lead Excluído</SelectItem>
                <SelectItem value="email_em_massa">Email em Massa</SelectItem>
                <SelectItem value="campanha_criada">Campanha Criada</SelectItem>
                <SelectItem value="sincronizacao_planilha">Sincronização</SelectItem>
                <SelectItem value="duplicatas_removidas">Limpeza Duplicatas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos Usuários</SelectItem>
                {uniqueUsers.map(email => (
                  <SelectItem key={email} value={email}>{email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="text-sm">
              {filtered.length} registro(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Carregando atividades...</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 italic">Nenhuma atividade registrada com os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(log => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.action_type)}>
                        {getActionLabel(log.action_type)}
                      </Badge>
                      {log.lead_nome && (
                        <span className="text-sm font-semibold text-gray-800">
                          {log.lead_nome}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{log.user_name || log.user_email}</span>
                    </div>

                    {log.details && (
                      <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600">
                        {log.details.campo && (
                          <p>
                            <strong>{log.details.campo}:</strong> {log.details.de} → {log.details.para}
                          </p>
                        )}
                        {log.details.destinatarios && (
                          <p><strong>Destinatários:</strong> {log.details.destinatarios}</p>
                        )}
                        {log.details.quantidade && (
                          <p><strong>Quantidade:</strong> {log.details.quantidade}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(new Date(log.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}