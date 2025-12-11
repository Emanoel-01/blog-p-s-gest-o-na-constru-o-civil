import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, UserPlus, MessageCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function NotificationCenter({ leads, comentarios, perguntasSemResposta, onNavigate }) {
  const notifications = useMemo(() => {
    const notifs = [];
    
    // 1. Leads não contatados em 24h
    const now = new Date();
    const leadsNaoContatados = leads.filter(lead => {
      if (lead.status !== 'Novo') return false;
      
      const createdDate = new Date(lead.created_date);
      const hoursSince = (now - createdDate) / (1000 * 60 * 60);
      
      return hoursSince >= 24;
    });

    leadsNaoContatados.forEach(lead => {
      const hoursSince = Math.floor((now - new Date(lead.created_date)) / (1000 * 60 * 60));
      notifs.push({
        id: `lead-${lead.id}`,
        tipo: 'lead',
        titulo: 'Lead precisa de atenção',
        descricao: `${lead.nome} aguarda contato há ${hoursSince}h`,
        urgente: hoursSince >= 48,
        timestamp: lead.created_date,
        action: () => onNavigate('leads')
      });
    });

    // 2. Comentários pendentes
    const comentariosPendentes = comentarios.filter(c => !c.aprovado);
    comentariosPendentes.forEach(comentario => {
      notifs.push({
        id: `comentario-${comentario.id}`,
        tipo: 'comentario',
        titulo: 'Comentário aguardando aprovação',
        descricao: `${comentario.autor_nome}: "${comentario.conteudo.substring(0, 50)}..."`,
        urgente: false,
        timestamp: comentario.created_date,
        action: () => onNavigate('comentarios')
      });
    });

    // 3. Perguntas sem resposta
    const perguntasPendentes = perguntasSemResposta.filter(p => p.status === 'Pendente');
    perguntasPendentes.forEach(pergunta => {
      notifs.push({
        id: `pergunta-${pergunta.id}`,
        tipo: 'pergunta',
        titulo: 'Pergunta sem FAQ adequada',
        descricao: `"${pergunta.pergunta.substring(0, 50)}..."`,
        urgente: false,
        timestamp: pergunta.created_date,
        action: () => onNavigate('chatbot')
      });
    });

    // Ordenar por mais recente
    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [leads, comentarios, perguntasSemResposta]);

  const urgentCount = notifications.filter(n => n.urgente).length;
  const totalCount = notifications.length;

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'lead': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'comentario': return <MessageCircle className="w-4 h-4 text-pink-600" />;
      case 'pergunta': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="w-5 h-5" />
          {totalCount > 0 && (
            <Badge 
              className={`absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-1 text-xs ${
                urgentCount > 0 ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              {totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Central de Notificações
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            {totalCount === 0 ? 'Nenhuma pendência' : `${totalCount} pendência${totalCount > 1 ? 's' : ''}`}
            {urgentCount > 0 && <span className="ml-2 text-red-200 font-semibold">• {urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {totalCount === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 font-semibold">Tudo em dia!</p>
              <p className="text-xs text-gray-500 mt-1">Nenhuma notificação pendente</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={notif.action}
                  className={`p-4 cursor-pointer transition-colors ${
                    notif.urgente ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      notif.urgente ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-sm text-gray-900">
                          {notif.titulo}
                        </h5>
                        {notif.urgente && (
                          <Badge className="bg-red-600 text-white text-xs flex-shrink-0">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notif.descricao}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(notif.timestamp).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}