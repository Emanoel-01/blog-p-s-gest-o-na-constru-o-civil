import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap, Briefcase, MessageCircle, ExternalLink } from 'lucide-react';

export default function NotificationBell({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes', userEmail],
    queryFn: () => base44.entities.Notificacao.filter({ destinatario_email: userEmail }, '-created_date', 20),
    enabled: !!userEmail
  });

  const marcarComoLidaMutation = useMutation({
    mutationFn: (id) => base44.entities.Notificacao.update(id, { lida: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificacoes']);
    }
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: async () => {
      const naoLidasIds = notificacoes.filter(n => !n.lida).map(n => n.id);
      await Promise.all(naoLidasIds.map(id => base44.entities.Notificacao.update(id, { lida: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notificacoes']);
    }
  });

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'Acadêmico': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Carreira': return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'Engajamento': return <MessageCircle className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-700" />
          {naoLidas > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0">
              {naoLidas > 9 ? '9+' : naoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              {naoLidas > 0 && (
                <p className="text-xs text-gray-600">{naoLidas} não lida(s)</p>
              )}
            </div>
            {naoLidas > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => marcarTodasComoLidasMutation.mutate()}
                className="text-xs text-blue-600 hover:bg-blue-50"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notificacoes.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notificacoes.map((notif) => (
                <div
                 key={notif.id}
                 className={`p-3 rounded-lg border-l-4 ${
                   notif.tipo === 'Acadêmico' ? 'border-l-red-500' :
                   notif.tipo === 'Carreira' ? 'border-l-green-500' :
                   'border-l-blue-500'
                 } ${!notif.lida ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {getIcon(notif.tipo)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {notif.titulo}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {notif.mensagem}
                      </p>
                    </div>
                    {!notif.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {notif.link_destino && (
                      <a 
                        href={notif.link_destino} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => !notif.lida && marcarComoLidaMutation.mutate(notif.id)}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                          Ver mais
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    )}
                    {!notif.lida && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => marcarComoLidaMutation.mutate(notif.id)}
                        className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}