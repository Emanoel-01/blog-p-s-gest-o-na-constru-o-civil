import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EmailCampaignLog() {
  const [expandedId, setExpandedId] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['emailCampaigns'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date'),
    initialData: []
  });

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Histórico de Campanhas de Email</h2>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">
            Nenhuma campanha enviada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{campaign.assunto}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.status === 'Enviado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {campaign.total_destinatarios} destinatário{campaign.total_destinatarios !== 1 ? 's' : ''} • {' '}
                      {campaign.data_envio && format(new Date(campaign.data_envio), 'dd MMM yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === campaign.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              {expandedId === campaign.id && (
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Conteúdo do Email</h3>
                    <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 max-h-48 overflow-y-auto prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: campaign.conteudo }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Destinatários ({campaign.destinatarios?.length || 0})</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {campaign.destinatarios?.map((dest, idx) => (
                        <div key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                          <p className="font-medium">{dest.nome}</p>
                          <p className="text-gray-600">{dest.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}