import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Pin, Lock, Plus, Search, ChevronRight, User, Trash2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const categorias = ['Dúvidas Técnicas', 'Mercado de Trabalho', 'BIM', 'Gestão de Obras', 'Sustentabilidade', 'Tecnologia & IA', 'Geral'];

const catColors = {
  'Dúvidas Técnicas': 'bg-red-100 text-red-700',
  'Mercado de Trabalho': 'bg-green-100 text-green-700',
  'BIM': 'bg-blue-100 text-blue-700',
  'Gestão de Obras': 'bg-orange-100 text-orange-700',
  'Sustentabilidade': 'bg-teal-100 text-teal-700',
  'Tecnologia & IA': 'bg-purple-100 text-purple-700',
  'Geral': 'bg-gray-100 text-gray-700',
};

const isAdmin = (user) => user && (user.role === 'admin' || ['emanoel.s.amorim@gmail.com','emanoel@esuda.edu.br','vdoval@gmail.com'].includes(user.email));

export default function ForumPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFiltro, setCatFiltro] = useState('todas');
  const [form, setForm] = useState({ titulo: '', conteudo: '', categoria: 'Geral' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: discente } = useQuery({
    queryKey: ['discente-me', user?.email],
    queryFn: () => base44.entities.Discente.filter({ email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: topicos = [], isLoading } = useQuery({
    queryKey: ['forum-topicos'],
    queryFn: () => base44.entities.ForumTopico.list('-created_date')
  });

  const criarMutation = useMutation({
    mutationFn: () => {
      return base44.entities.ForumTopico.create({
        ...form,
        autor_email: user.email,
        autor_nome: user.full_name || user.email,
        autor_foto: discente?.foto_url || '',
        ultima_atividade: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topicos'] });
      setForm({ titulo: '', conteudo: '', categoria: 'Geral' });
      setShowForm(false);
      toast.success('Tópico criado com sucesso!');
    }
  });

  const topicosFiltrados = topicos
    .filter(t => catFiltro === 'todas' || t.categoria === catFiltro)
    .filter(t => !search || t.titulo?.toLowerCase().includes(search.toLowerCase()));

  const pinnedTopicos = topicosFiltrados.filter(t => t.pinned);
  const regularTopicos = topicosFiltrados.filter(t => !t.pinned);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const TopicoCard = ({ topico }) => (
    <Card
      key={topico.id}
      onClick={() => navigate(createPageUrl('ForumTopicoPage') + '?id=' + topico.id)}
      className={`border-2 hover:shadow-md transition-all cursor-pointer ${
        topico.pinned ? 'border-yellow-300 bg-yellow-50/40' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {topico.autor_foto
              ? <img src={topico.autor_foto} alt={topico.autor_nome} className="w-full h-full object-cover" />
              : <User className="w-5 h-5 text-gray-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {topico.pinned && <Pin className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />}
              {topico.fechado && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
              <Badge className={`text-xs ${catColors[topico.categoria] || catColors.Geral}`}>
                {topico.categoria}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">{topico.titulo}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topico.conteudo}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">por {topico.autor_nome} · {formatDate(topico.created_date)}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare className="w-3.5 h-3.5" />
                {topico.total_respostas || 0}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Fórum da Comunidade | ESUDA</title>
        <meta name="description" content="Fórum de discussão acadêmica e profissional da comunidade ESUDA." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">Fórum da Comunidade</h1>
                <p className="text-blue-100 text-sm mt-1">Troque conhecimento com colegas e professores</p>
              </div>
            </div>
            {isAdmin(user) && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" /> Novo Tópico
              </Button>
            )}
          </div>
        </div>

        {/* Formulário novo tópico */}
        {showForm && (
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-blue-50 pb-3">
              <CardTitle className="text-base">Criar Novo Tópico</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Título do tópico..."
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
              />
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Descreva sua dúvida ou tema de discussão..."
                value={form.conteudo}
                onChange={e => setForm({ ...form, conteudo: e.target.value })}
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button
                  onClick={() => criarMutation.mutate()}
                  disabled={!form.titulo.trim() || !form.conteudo.trim() || criarMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Publicar Tópico
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tópico..." className="pl-9" />
          </div>
          <Select value={catFiltro} onValueChange={setCatFiltro}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tópicos */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          </div>
        ) : (
          <div className="space-y-3">
            {pinnedTopicos.map(t => <TopicoCard key={t.id} topico={t} />)}
            {regularTopicos.length === 0 && pinnedTopicos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  Nenhum tópico disponível ainda.
                </CardContent>
              </Card>
            ) : (
              regularTopicos.map(t => <TopicoCard key={t.id} topico={t} />)
            )}
          </div>
        )}
      </div>
    </>
  );
}