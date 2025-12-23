import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FeedbackForm({ aplicativoNome }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    usuario_nome: '',
    usuario_email: '',
    avaliacao_estrelas: 5,
    comentario: '',
    aspectos_positivos: '',
    aspectos_melhorar: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AplicativoFeedback.create({
      ...data,
      aplicativo_nome: aplicativoNome,
      aprovado: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedbacks', aplicativoNome]);
      toast.success('Feedback enviado! Obrigado pela sua avaliação.');
      setFormData({
        usuario_nome: '',
        usuario_email: '',
        avaliacao_estrelas: 5,
        comentario: '',
        aspectos_positivos: '',
        aspectos_melhorar: ''
      });
    },
    onError: (error) => {
      toast.error('Erro ao enviar feedback: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.usuario_nome || !formData.avaliacao_estrelas) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <MessageSquare className="w-6 h-6" />
          Envie seu Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usuario_nome" className="font-semibold">Nome *</Label>
              <Input
                id="usuario_nome"
                value={formData.usuario_nome}
                onChange={(e) => setFormData({...formData, usuario_nome: e.target.value})}
                placeholder="Seu nome"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="usuario_email" className="font-semibold">Email (opcional)</Label>
              <Input
                id="usuario_email"
                type="email"
                value={formData.usuario_email}
                onChange={(e) => setFormData({...formData, usuario_email: e.target.value})}
                placeholder="seu@email.com"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold mb-3 block">Avaliação *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, avaliacao_estrelas: star })}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      formData.avaliacao_estrelas >= star
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comentario" className="font-semibold">Comentário Geral</Label>
            <Textarea
              id="comentario"
              value={formData.comentario}
              onChange={(e) => setFormData({...formData, comentario: e.target.value})}
              rows={4}
              placeholder="Compartilhe sua experiência com este aplicativo..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="aspectos_positivos" className="font-semibold">O que você mais gostou?</Label>
            <Textarea
              id="aspectos_positivos"
              value={formData.aspectos_positivos}
              onChange={(e) => setFormData({...formData, aspectos_positivos: e.target.value})}
              rows={3}
              placeholder="Aspectos positivos..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="aspectos_melhorar" className="font-semibold">O que poderia melhorar?</Label>
            <Textarea
              id="aspectos_melhorar"
              value={formData.aspectos_melhorar}
              onChange={(e) => setFormData({...formData, aspectos_melhorar: e.target.value})}
              rows={3}
              placeholder="Sugestões de melhoria..."
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Enviando...' : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 text-center italic">
            Seu feedback será publicado após aprovação do coordenador
          </p>
        </form>
      </CardContent>
    </Card>
  );
}