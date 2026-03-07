import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, User, CheckCircle2, Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function ForumTopicoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const topicoId = new URLSearchParams(location.search).get('id');
  const [resposta, setResposta] = useState('');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: discente } = useQuery({
    queryKey: ['discente-me', user?.email],
    queryFn: () => base44.entities.Discente.filter({ email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: topicos = [] } = useQuery({
    queryKey: ['forum-topico-single', topicoId],
    queryFn: () => base44.entities.ForumTopico.filter({ id: topicoId }),
    enabled: !!topicoId
  });
  const topico = topicos[0];

  const { data: respostas = [] } = useQuery({
    queryKey: ['forum-respostas', topicoId],
    queryFn: () => base44.entities.ForumResposta.filter({ topico_id: topicoId }, 'created_date'),
    enabled: !!topicoId
  });

  const responderMutation = useMutation({
    mutationFn: () => {
      if (!user) { base44.auth.redirectToLogin(); return; }
      return base44.entities.ForumResposta.create({
        topico_id: topicoId,
        conteudo: resposta,
        autor_email: user.email,
        autor_nome: user.full_name || user.email,
        autor_foto: discente?.foto_url || ''
      });
    },
    onSuccess: async () => {
      await base44.entities.ForumTopico.update(topicoId, {
        total_respostas: respostas.length + 1,
        ultima_atividade: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['forum-respostas', topicoId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topico-single', topicoId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topicos'] });
      setResposta('');
      toast.success('Resposta publicada!');
    }
  });

  const marcarMelhorMutation = useMutation({
    mutationFn: (respostaId) => base44.entities.ForumResposta.update(respostaId, { melhor_resposta: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-respostas', topicoId] })
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  if (!topico) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
      </div>
    );
  }

  const podeMarcarMelhor = user && (user.email === topico.autor_email || user.role === 'admin');

  return (
    <>
      <Helmet>
        <title>{topico.titulo} | Fórum ESUDA</title>
      </Helmet>

      <div className="space-y-5 max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => navigate(createPageUrl('ForumPage'))} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Fórum
        </Button>

        {/* Tópico original */}
        <Card className="border-2 border-blue-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {topico.autor_foto
                  ? <img src={topico.autor_foto} alt={topico.autor_nome} className="w-full h-full object-cover" />
                  : <User className="w-6 h-6 text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{topico.autor_nome}</span>
                  <span className="text-xs text-gray-400">{formatDate(topico.created_date)}</span>
                  <Badge className="text-xs bg-blue-100 text-blue-700">{topico.categoria}</Badge>
                  {topico.fechado && <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" />Fechado</Badge>}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{topico.titulo}</h1>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{topico.conteudo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respostas */}
        {respostas.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-600">{respostas.length} resposta(s)</p>
            {respostas.map(r => (
              <Card key={r.id} className={`border-2 ${r.melhor_resposta ? 'border-green-400 bg-green-50/40' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {r.autor_foto
                        ? <img src={r.autor_foto} alt={r.autor_nome} className="w-full h-full object-cover" />
                        : <User className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{r.autor_nome}</span>
                        <span className="text-xs text-gray-400">{formatDate(r.created_date)}</span>
                        {r.melhor_resposta && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Melhor Resposta
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{r.conteudo}</p>
                      {podeMarcarMelhor && !r.melhor_resposta && (
                        <button
                          onClick={() => marcarMelhorMutation.mutate(r.id)}
                          className="text-xs text-green-600 hover:underline mt-2"
                        >
                          ✓ Marcar como melhor resposta
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Formulário de resposta */}
        {!topico.fechado ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Sua resposta</p>
              <Textarea
                placeholder={user ? 'Escreva sua resposta...' : 'Faça login para responder'}
                value={resposta}
                onChange={e => setResposta(e.target.value)}
                rows={4}
                disabled={!user}
              />
              <div className="flex justify-end gap-2">
                {!user && (
                  <Button variant="outline" onClick={() => base44.auth.redirectToLogin()}>
                    Entrar para responder
                  </Button>
                )}
                {user && (
                  <Button
                    onClick={() => responderMutation.mutate()}
                    disabled={!resposta.trim() || responderMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" /> Publicar Resposta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-4 text-center text-gray-500 text-sm">
              <Lock className="w-4 h-4 inline mr-1" /> Este tópico está fechado para novas respostas.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}