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
import { BookOpen, FileText, Video, Link as LinkIcon, Image, Download, Search, ExternalLink, Plus, X, Trash2, Upload, Lock, Shield, Eye } from 'lucide-react';
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

const isAdminUser = (user) => user && (user.role === 'admin' || ['emanoel.s.amorim@gmail.com','emanoel@esuda.edu.br','vdoval@gmail.com'].includes(user.email));

const TIPOS_UPLOAD = ['PDF', 'Slides', 'Imagem', 'Documento', 'Vídeo'];
const TIPOS_LINK = ['Link Externo'];

const materialVazio = { titulo: '', descricao: '', tipo: 'PDF', file_url: '', turma: '', disciplina_nome: '', permitir_download: false };

export default function MaterialTurmaPage() {
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
    let file_url = form.file_url;
    const isUploadTipo = TIPOS_UPLOAD.includes(form.tipo);

    if (isUploadTipo && uploadFile) {
      setUploading(true);
      const { file_url: url } = await base44.integrations.Core.UploadFile({ file: uploadFile });
      file_url = url;
      setUploading(false);
    }

    if (!file_url.trim()) {
      toast.error('Por favor, selecione um arquivo ou informe o URL.');
      return;
    }

    criarMutation.mutate({ ...form, file_url });
  };

  const renderPreview = (material) => {
    const tipo = material.tipo;
    const url = material.file_url;
    const podeDownload = material.permitir_download;

    if (tipo === 'Vídeo' && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'))) {
      let embedUrl = url;
      if (url.includes('youtu.be')) {
        embedUrl = `https://www.youtube.com/embed/${url.split('/').pop().split('?')[0]}`;
      } else if (url.includes('youtube.com')) {
        embedUrl = `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
      }
      return (
        <div className="aspect-video rounded-lg overflow-hidden mt-3">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={material.titulo} />
        </div>
      );
    }

    if (tipo === 'Imagem') {
      return (
        <div className="mt-3 relative group">
          <img
            src={url}
            alt={material.titulo}
            className="w-full rounded-lg max-h-48 object-cover"
            onContextMenu={podeDownload ? undefined : (e) => e.preventDefault()}
            style={podeDownload ? {} : { userSelect: 'none', pointerEvents: 'none' }}
          />
          {!podeDownload && (
            <div className="absolute inset-0 bg-transparent rounded-lg" />
          )}
          {podeDownload && (
            <a href={url} download target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-green-600 hover:underline text-sm font-medium">
              <Download className="w-4 h-4" /> Baixar imagem
            </a>
          )}
        </div>
      );
    }

    if (tipo === 'PDF') {
      if (podeDownload) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 text-orange-600 hover:underline text-sm font-medium">
            <Download className="w-4 h-4" /> Baixar PDF
          </a>
        );
      }
      return (
        <div className="mt-3">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-64 rounded-lg border"
            title={material.titulo}
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
          </p>
        </div>
      );
    }

    if (tipo === 'Slides') {
      if (podeDownload) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 text-yellow-600 hover:underline text-sm font-medium">
            <Download className="w-4 h-4" /> Baixar Slides
          </a>
        );
      }
      return (
        <div className="mt-3">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-64 rounded-lg border"
            title={material.titulo}
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
          </p>
        </div>
      );
    }

    if (tipo === 'Documento') {
      if (podeDownload) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 text-gray-600 hover:underline text-sm font-medium">
            <Download className="w-4 h-4" /> Baixar documento
          </a>
        );
      }
      return (
        <div className="mt-3">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-64 rounded-lg border"
            title={material.titulo}
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Apenas visualização — download não permitido
          </p>
        </div>
      );
    }

    // Link Externo
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 mt-3 text-blue-600 hover:underline text-sm font-medium">
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

  const isUploadTipo = TIPOS_UPLOAD.includes(form.tipo);

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
          {isAdminUser(user) && (
            <Button onClick={() => setShowForm(!showForm)} className="mt-3 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Novo Material
            </Button>
          )}
        </div>

        {/* Formulário de cadastro — apenas admin */}
        {isAdminUser(user) && showForm && (
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

              {/* Upload ou URL conforme o tipo */}
              {isUploadTipo ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Upload className="w-4 h-4 inline mr-1" /> Selecionar arquivo para upload
                  </label>
                  <input
                    type="file"
                    accept={
                      form.tipo === 'PDF' ? '.pdf' :
                      form.tipo === 'Slides' ? '.ppt,.pptx,.pdf' :
                      form.tipo === 'Imagem' ? 'image/*' :
                      form.tipo === 'Documento' ? '.doc,.docx,.pdf,.txt' :
                      form.tipo === 'Vídeo' ? 'video/*' :
                      '*'
                    }
                    onChange={e => setUploadFile(e.target.files[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg p-1"
                  />
                  {uploadFile && (
                    <p className="text-xs text-emerald-600">✓ {uploadFile.name}</p>
                  )}
                </div>
              ) : (
                <Input placeholder="URL do link externo*" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} />
              )}

              {/* Controle de download */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Shield className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Permitir download?</p>
                  <p className="text-xs text-gray-500">Se não, o arquivo ficará protegido — apenas visualização online</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({...form, permitir_download: true})}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${form.permitir_download ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, permitir_download: false})}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!form.permitir_download ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
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
                  disabled={!form.titulo.trim() || (!uploadFile && !form.file_url.trim()) || uploading || criarMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? 'Enviando...' : 'Salvar Material'}
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs ${tipoColors[material.tipo] || tipoColors.Documento}`}>
                            {material.tipo}
                          </Badge>
                          {material.tipo !== 'Link Externo' && (
                            <Badge className={`text-xs flex items-center gap-1 ${material.permitir_download ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {material.permitir_download ? <Download className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {material.permitir_download ? 'Download liberado' : 'Só visualização'}
                            </Badge>
                          )}
                        </div>
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
                    {isAdminUser(user) && (
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