import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, GraduationCap, Briefcase, MessageCircle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificacoesPanel({ notificacoes }) {
  const queryClient = useQueryClient();

  const marcarComoLidaMutation = useMutation({
    mutationFn: (id) => base44.entities.Notificacao.update(id, { lida: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificacoes']);
    }
  });

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'Acadêmico': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'Carreira': return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'Engajamento': return <MessageCircle className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorClass = (tipo) => {
    switch(tipo) {
      case 'Acadêmico': return 'bg-blue-50 border-blue-200';
      case 'Carreira': return 'bg-green-50 border-green-200';
      case 'Engajamento': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!notificacoes || notificacoes.length === 0) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Nenhuma notificação no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Bell className="w-5 h-5 text-blue-600" />
        Notificações Recentes
        {notificacoes.filter(n => !n.lida).length > 0 && (
          <Badge className="bg-red-500 text-white">
            {notificacoes.filter(n => !n.lida).length}
          </Badge>
        )}
      </h3>
      <div className="space-y-2">
        {notificacoes.slice(0, 5).map((notif) => (
          <Card 
            key={notif.id} 
            className={`${getColorClass(notif.tipo)} border ${!notif.lida ? 'border-2' : ''} hover:shadow-md transition-all`}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900">{notif.titulo}</p>
                    {!notif.lida && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{notif.mensagem}</p>
                  <div className="flex items-center gap-2">
                    {notif.link_destino && (
                      <a 
                        href={notif.link_destino} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => marcarComoLidaMutation.mutate(notif.id)}
                      >
                        <Button size="sm" variant="outline" className="h-7 text-xs">
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
                        className="h-7 text-xs"
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}