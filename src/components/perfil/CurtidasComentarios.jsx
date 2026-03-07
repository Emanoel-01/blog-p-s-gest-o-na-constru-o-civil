import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Send, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CurtidasComentarios({ discenteId }) {
  const [comentario, setComentario] = useState('');
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: curtidas = [] } = useQuery({
    queryKey: ['curtidas-perfil', discenteId],
    queryFn: () => base44.entities.CurtidaPerfil.filter({ discente_id: discenteId }),
    enabled: !!discenteId
  });

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios-perfil', discenteId],
    queryFn: () => base44.entities.ComentarioPerfil.filter({ discente_id: discenteId }),
    enabled: !!discenteId
  });

  const jaCurtiu = user && curtidas.some(c => c.autor_email === user.email);

  const curtirMutation = useMutation({
    mutationFn: async () => {
      if (!user) { base44.auth.redirectToLogin(); return; }
      if (jaCurtiu) {
        const minha = curtidas.find(c => c.autor_email === user.email);
        await base44.entities.CurtidaPerfil.delete(minha.id);
      } else {
        await base44.entities.CurtidaPerfil.create({ discente_id: discenteId, autor_email: user.email });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['curtidas-perfil', discenteId] })
  });

  const comentarMutation = useMutation({
    mutationFn: () => {
      if (!user) { base44.auth.redirectToLogin(); return; }
      return base44.entities.ComentarioPerfil.create({
        discente_id: discenteId,
        autor_email: user.email,
        autor_nome: user.full_name || user.email,
        conteudo: comentario
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-perfil', discenteId] });
      setComentario('');
      setShowForm(false);
      toast.success('Comentário enviado!');
    }
  });

  const deletarMutation = useMutation({
    mutationFn: (id) => base44.entities.ComentarioPerfil.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comentarios-perfil', discenteId] })
  });

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-5 space-y-4">
        {/* Curtidas */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => curtirMutation.mutate()}
            disabled={curtirMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition-all ${
              jaCurtiu
                ? 'bg-red-50 border-red-400 text-red-600'
                : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${jaCurtiu ? 'fill-red-500 text-red-500' : ''}`} />
            {curtidas.length} {curtidas.length === 1 ? 'curtida' : 'curtidas'}
          </button>

          <button
            onClick={() => {
              if (!user) { base44.auth.redirectToLogin(); return; }
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500 font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {comentarios.length} comentário{comentarios.length !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Formulário de comentário */}
        {showForm && (
          <div className="flex gap-2">
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={() => comentarMutation.mutate()}
              disabled={!comentario.trim() || comentarMutation.isPending}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Lista de comentários */}
        {comentarios.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {comentarios.map(c => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700">{c.autor_nome}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{c.conteudo}</p>
                </div>
                {user && (user.email === c.autor_email || user.role === 'admin') && (
                  <button
                    onClick={() => deletarMutation.mutate(c.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}