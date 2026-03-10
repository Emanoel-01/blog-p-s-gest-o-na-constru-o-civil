import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MaterialComentarios({ materialId, user, discente, isProfessor }) {
  const [texto, setTexto] = useState('');
  const [respostaTexto, setRespostaTexto] = useState({});
  const [respondendoId, setRespondendoId] = useState(null);
  const queryClient = useQueryClient();

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios-material', materialId],
    queryFn: () => base44.entities.MaterialComentario.filter({ material_id: materialId }, '-created_date'),
    enabled: !!materialId
  });

  const criarMutation = useMutation({
    mutationFn: (data) => base44.entities.MaterialComentario.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-material', materialId] });
      setTexto('');
      toast.success('Dúvida enviada!');
    }
  });

  const responderMutation = useMutation({
    mutationFn: ({ id, resposta }) => base44.entities.MaterialComentario.update(id, {
      resposta,
      respondido_por: user?.full_name || 'Professor',
      respondido_em: new Date().toISOString()
    }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-material', materialId] });
      setRespondendoId(null);
      setRespostaTexto(prev => ({ ...prev, [vars.id]: '' }));
      toast.success('Resposta enviada!');
    }
  });

  const excluirMutation = useMutation({
    mutationFn: (id) => base44.entities.MaterialComentario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-material', materialId] });
      toast.success('Comentário excluído.');
    }
  });

  const handleEnviar = () => {
    if (!texto.trim()) return;
    criarMutation.mutate({
      material_id: materialId,
      autor_email: user?.email,
      autor_nome: user?.full_name || discente?.nome || user?.email,
      autor_foto: discente?.foto_url || '',
      conteudo: texto.trim(),
      turma: discente?.numero_turma || ''
    });
  };

  const handleResponder = (id) => {
    const r = respostaTexto[id];
    if (!r?.trim()) return;
    responderMutation.mutate({ id, resposta: r.trim() });
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-gray-700">
          Dúvidas ({comentarios.length})
        </span>
      </div>

      {/* Campo para enviar dúvida (alunos) */}
      {user && !isProfessor && (
        <div className="flex gap-2 mb-4">
          <Textarea
            placeholder="Escreva sua dúvida sobre este material..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleEnviar}
            disabled={!texto.trim() || criarMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-3">
        {comentarios.map(c => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {c.autor_foto && (
                    <img src={c.autor_foto} alt={c.autor_nome} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span className="font-semibold text-gray-800 text-xs">{c.autor_nome}</span>
                  {c.turma && <span className="text-xs text-gray-400">· {c.turma}</span>}
                  <span className="text-xs text-gray-400">
                    · {c.created_date ? format(new Date(c.created_date), "dd/MM 'às' HH:mm", { locale: ptBR }) : ''}
                  </span>
                </div>
                <p className="text-gray-700">{c.conteudo}</p>

                {/* Resposta do professor */}
                {c.resposta && (
                  <div className="mt-2 bg-emerald-50 border-l-2 border-emerald-400 pl-3 py-2 rounded-r-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">{c.respondido_por || 'Professor'}</span>
                      {c.respondido_em && (
                        <span className="text-xs text-gray-400">
                          · {format(new Date(c.respondido_em), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-xs">{c.resposta}</p>
                  </div>
                )}

                {/* Form de resposta (apenas professor) */}
                {isProfessor && respondendoId === c.id && (
                  <div className="mt-2 flex gap-2">
                    <Textarea
                      placeholder="Sua resposta..."
                      value={respostaTexto[c.id] || ''}
                      onChange={e => setRespostaTexto(prev => ({ ...prev, [c.id]: e.target.value }))}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex flex-col gap-1">
                      <Button size="sm" onClick={() => handleResponder(c.id)} className="bg-emerald-600 hover:bg-emerald-700">
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRespondendoId(null)}>✕</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações do professor */}
              {isProfessor && (
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  {!c.resposta && respondendoId !== c.id && (
                    <button
                      onClick={() => setRespondendoId(c.id)}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Responder
                    </button>
                  )}
                  <button
                    onClick={() => excluirMutation.mutate(c.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {comentarios.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Nenhuma dúvida ainda.</p>
        )}
      </div>
    </div>
  );
}