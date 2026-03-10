import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Search, Plus, X, Upload, Shield, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import MaterialCard from '@/components/materiais/MaterialCard';
import MaterialProgressoTab from '@/components/materiais/MaterialProgressoTab';
import { notificarNovoMaterial } from '@/functions/notificarNovoMaterial';

const isAdminUser = (user) =>
  user && (user.role === 'admin' || ['emanoel.s.amorim@gmail.com','emanoel@esuda.edu.br','vdoval@gmail.com'].includes(user.email));

const TIPOS_UPLOAD = ['PDF', 'Slides', 'Imagem', 'Documento', 'Vídeo'];

const materialVazio = { titulo: '', descricao: '', tipo: 'PDF', file_url: '', turma: '', disciplina_nome: '', permitir_download: false };

export default function MaterialTurmaPage() {
  const [aba, setAba] = useState('materiais'); // 'materiais' | 'progresso'
  const [turmaFiltro, setTurmaFiltro] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(materialVazio);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [especFiltro, setEspecFiltro] = useState('todas');
  const [search, setSearch] = useState('');
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
    mutationFn: (data) => base44.entities.MaterialTurma.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais-turma'] });
      setForm(materialVazio);
      setUploadFile(null);
      setShowForm(false);
      toast.success('Material cadastrado!');
    }
  });

  const excluirMutation = useMutation({
    mutationFn: (id) => base44.entities.MaterialTurma.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materiais-turma'] })
  });

  const handleTipoChange = (v) => {
    setForm({ ...form, tipo: v, file_url: '' });
    setUploadFile(null);
  };

  const handleSalvar = async () => {
    const isUploadTipo = TIPOS_UPLOAD.includes(form.tipo);

    if (isUploadTipo && !uploadFile) {
      toast.error('Selecione um arquivo para upload.');
      return;
    }
    if (!isUploadTipo && !form.file_url.trim()) {
      toast.error('Informe o URL do link externo.');
      return;
    }

    let file_url = form.file_url;

    if (isUploadTipo && uploadFile) {
      setUploading(true);
      try {
        // Upload privado — arquivo não terá URL pública direta
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: uploadFile });
        file_url = file_uri;
      } finally {
        setUploading(false);
      }
    }

    criarMutation.mutate({ ...form, file_url });
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

  const isUploadTipo = TIPOS_UPLOAD.includes(form.tipo);
  const isAdmin = isAdminUser(user);

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
          {isAdmin && (
            <Button onClick={() => setShowForm(!showForm)} className="mt-3 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Novo Material
            </Button>
          )}
        </div>

        {/* Formulário de cadastro — apenas admin */}
        {isAdmin && showForm && (
          <Card className="border-2 border-emerald-300">
            <CardHeader className="bg-emerald-50 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cadastrar Novo Material</CardTitle>
              <button onClick={() => { setShowForm(false); setUploadFile(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Título do material*" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              <Textarea placeholder="Descrição breve" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} />

              <Select value={form.tipo} onValueChange={handleTipoChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Vídeo','PDF','Slides','Link Externo','Imagem','Documento'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>

              {isUploadTipo ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Upload className="w-4 h-4 inline mr-1" /> Selecionar arquivo (upload privado)
                  </label>
                  <input
                    type="file"
                    accept={
                      form.tipo === 'PDF' ? '.pdf' :
                      form.tipo === 'Slides' ? '.ppt,.pptx,.pdf' :
                      form.tipo === 'Imagem' ? 'image/*' :
                      form.tipo === 'Documento' ? '.doc,.docx,.pdf,.txt' :
                      form.tipo === 'Vídeo' ? 'video/*' : '*'
                    }
                    onChange={e => setUploadFile(e.target.files[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg p-1"
                  />
                  {uploadFile && <p className="text-xs text-emerald-600">✓ {uploadFile.name}</p>}
                </div>
              ) : (
                <Input placeholder="URL do link externo*" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} />
              )}

              {/* Controle de download */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Shield className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Permitir download?</p>
                  <p className="text-xs text-gray-500">Se não, apenas visualização online via URL temporária protegida</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({...form, permitir_download: true})}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${form.permitir_download ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    Sim
                  </button>
                  <button type="button" onClick={() => setForm({...form, permitir_download: false})}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!form.permitir_download ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    Não
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Turma (ex: T01/2026)" value={form.turma} onChange={e => setForm({...form, turma: e.target.value})} />
                <Input placeholder="Disciplina (opcional)" value={form.disciplina_nome} onChange={e => setForm({...form, disciplina_nome: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setUploadFile(null); }}>Cancelar</Button>
                <Button
                  onClick={handleSalvar}
                  disabled={!form.titulo.trim() || uploading || criarMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? 'Enviando arquivo...' : criarMutation.isPending ? 'Salvando...' : 'Salvar Material'}
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
            {materiaisFiltrados.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                especializacoes={especializacoes}
                isAdmin={isAdmin}
                onExcluir={(id) => excluirMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}