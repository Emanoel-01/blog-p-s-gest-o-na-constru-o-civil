import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Video, Link as LinkIcon, Image, Download, Search, ExternalLink, Plus, X, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const tipoIcons = {
  Vídeo: Video,
  PDF: FileText,
  Slides: FileText,
  'Link Externo': LinkIcon,
  Imagem: Image,
  Documento: BookOpen,
};

const tipoColors = {
  Vídeo: 'bg-red-100 text-red-700',
  PDF: 'bg-orange-100 text-orange-700',
  Slides: 'bg-yellow-100 text-yellow-700',
  'Link Externo': 'bg-blue-100 text-blue-700',
  Imagem: 'bg-green-100 text-green-700',
  Documento: 'bg-gray-100 text-gray-700',
};

const isAdmin = (user) => user && (user.role === 'admin' || ['emanoel.s.amorim@gmail.com','emanoel@esuda.edu.br','vdoval@gmail.com'].includes(user.email));

const materialVazio = { titulo: '', descricao: '', tipo: 'PDF', file_url: '', turma: '', disciplina_nome: '' };

export default function MaterialTurmaPage() {
  const [turmaFiltro, setTurmaFiltro] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(materialVazio);
  const queryClient = useQueryClient();
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [especFiltro, setEspecFiltro] = useState('todas');
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: discente } = useQuery({
    queryKey: ['discente-me', user?.email],
    queryFn: () => base44.entities.Discente.filter({ email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: materiais = [], isLoading } = useQuery({
    queryKey: ['materiais-turma'],
    queryFn: () => base44.entities.MaterialTurma.list('ordem')
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const turmasDisponiveis = useMemo(() => {
    const set = new Set(materiais.map(m => m.turma).filter(Boolean));
    return Array.from(set).sort();
  }, [materiais]);

  const materiaisFiltrados = useMemo(() => {
    return materiais.filter(m => {
      const matchTurma = turmaFiltro === 'todas' || !m.turma || m.turma === turmaFiltro;
      const matchTipo = tipoFiltro === 'todos' || m.tipo === tipoFiltro;
      const matchEspec = especFiltro === 'todas' || m.especializacao_id === especFiltro;
      const matchSearch = !search || m.titulo?.toLowerCase().includes(search.toLowerCase()) || m.descricao?.toLowerCase().includes(search.toLowerCase());
      return matchTurma && matchTipo && matchEspec && matchSearch;
    });
  }, [materiais, turmaFiltro, tipoFiltro, especFiltro, search]);

  const criarMutation = useMutation({
    mutationFn: () => base44.entities.MaterialTurma.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais-turma'] });
      setForm(materialVazio);
      setShowForm(false);
      toast.success('Material cadastrado!');
    }
  });

  const excluirMutation = useMutation({
    mutationFn: (id) => base44.entities.MaterialTurma.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materiais-turma'] })
  });

  const renderPreview = (material) => {
    const tipo = material.tipo;
    const url = material.file_url;

    if (tipo === 'Vídeo' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      const videoId = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
      return (
        <div className="aspect-video rounded-lg overflow-hidden mt-3">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title={material.titulo}
          />
        </div>
      );
    }
    if (tipo === 'PDF') {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-3 text-orange-600 hover:underline text-sm font-medium">
          <Download className="w-4 h-4" /> Baixar PDF
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-3 text-blue-600 hover:underline text-sm font-medium">
        <ExternalLink className="w-4 h-4" /> Acessar material
      </a>
    );
  };

  if (!user) {
    return (
      <Card className="border-2 border-yellow-300 bg-yellow-50">
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Faça login para acessar os materiais da sua turma.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-yellow-600 hover:bg-yellow-700">
            Entrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Helmet>
        <title>Materiais da Turma | ESUDA</title>
        <meta name="description" content="Vídeos, PDFs, slides e documentos das aulas por turma e especialização." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Materiais da Turma</h1>
          </div>
          <p className="text-emerald-100 text-sm md:text-base">
            Vídeos, PDFs, slides e documentos organizados por turma e disciplina
          </p>
          {discente?.numero_turma && (
            <Badge className="mt-2 bg-white/20 text-white">Sua turma: {discente.numero_turma}</Badge>
          )}
          {isAdmin(user) && (
            <Button onClick={() => setShowForm(!showForm)} className="mt-3 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Novo Material
            </Button>
          )}
        </div>

        {/* Formulário de cadastro — apenas admin */}
        {isAdmin(user) && showForm && (
          <Card className="border-2 border-emerald-300">
            <CardHeader className="bg-emerald-50 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cadastrar Novo Material</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Título do material*" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              <Textarea placeholder="Descrição breve" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} />
              <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Vídeo','PDF','Slides','Link Externo','Imagem','Documento'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="URL do arquivo ou link*" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Turma (ex: T01/2026)" value={form.turma} onChange={e => setForm({...form, turma: e.target.value})} />
                <Input placeholder="Disciplina (opcional)" value={form.disciplina_nome} onChange={e => setForm({...form, disciplina_nome: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button onClick={() => criarMutation.mutate()} disabled={!form.titulo.trim() || !form.file_url.trim() || criarMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  Salvar Material
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar material..." className="pl-9" />
              </div>
              <Select value={turmaFiltro} onValueChange={setTurmaFiltro}>
                <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as turmas</SelectItem>
                  {turmasDisponiveis.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={especFiltro} onValueChange={setEspecFiltro}>
                <SelectTrigger><SelectValue placeholder="Especialização" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {especializacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {['Vídeo', 'PDF', 'Slides', 'Link Externo', 'Imagem', 'Documento'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Materiais */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          </div>
        ) : materiaisFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              Nenhum material encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiaisFiltrados.map(material => {
              const Icon = tipoIcons[material.tipo] || BookOpen;
              const espec = especializacoes.find(e => e.id === material.especializacao_id);
              return (
                <Card key={material.id} className="border-2 border-gray-200 hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${tipoColors[material.tipo] || tipoColors.Documento}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className={`text-xs mb-1 ${tipoColors[material.tipo] || tipoColors.Documento}`}>
                          {material.tipo}
                        </Badge>
                        <CardTitle className="text-sm leading-snug">{material.titulo}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {material.descricao && (
                      <p className="text-xs text-gray-600 line-clamp-2">{material.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {espec && <Badge variant="outline" className="text-xs">{espec.nome}</Badge>}
                      {material.turma && <Badge variant="outline" className="text-xs">Turma {material.turma}</Badge>}
                      {material.disciplina_nome && <Badge variant="outline" className="text-xs">{material.disciplina_nome}</Badge>}
                    </div>
                    {renderPreview(material)}
                    {isAdmin(user) && (
                      <button onClick={() => excluirMutation.mutate(material.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mt-1">
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}