import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X, Trash2, Edit, Calendar, Eye, Clock, CheckCircle, FileText, Sparkles, Loader2 } from 'lucide-react';
import BlogAnalyticsDashboard from '../blog/BlogAnalyticsDashboard';
import { toast } from 'sonner';
import RichTextEditor from '../editor/RichTextEditor';
import AIBlogPostGenerator from './AIBlogPostGenerator';

const categorias = [
  {
    nome: 'Inovação & Empreendedorismo',
    subcategorias: ['Projetos da Incubadora', 'Tecnologia & Tendências', 'Estudos de Caso', 'Mentoria & Desenvolvimento']
  },
  {
    nome: 'Carreira & Mercado',
    subcategorias: ['Desenvolvimento Profissional', 'Oportunidades no Setor', 'Networking', 'Habilidades do Futuro']
  },
  {
    nome: 'Conteúdo Multimídia',
    subcategorias: ['Podcasts & Entrevistas', 'Esudacast', 'Insights 4.0 com Emanoel Amorim', 'Vídeos & Tutoriais YouTube', 'Dicas Rápidas Instagram', 'Webinars & Lives']
  },
  {
    nome: 'Vida Acadêmica ESUDA',
    subcategorias: ['Nossos Cursos', 'Ciclos & Disciplinas', 'Corpo Docente', 'Eventos & Workshops']
  },
  {
    nome: 'Atualidades & Análise',
    subcategorias: ['Notícias do Setor', 'Artigos Científicos', 'Análise de Mercado']
  },
  {
    nome: 'Eventos',
    subcategorias: ['Workshop', 'Masterclass', 'Palestra', 'Seminário', 'Conferência']
  },
  {
    nome: 'Educação',
    subcategorias: ['Aulas', 'Tutoriais', 'Material Didático', 'Pesquisa Acadêmica']
  },
  {
    nome: 'Tecnologia',
    subcategorias: ['BIM', 'Software', 'Automação', 'Inovação']
  },
  {
    nome: 'Mercado',
    subcategorias: ['Tendências', 'Oportunidades', 'Networking', 'Carreira']
  },
  {
    nome: 'Institucional',
    subcategorias: ['Notícias ESUDA', 'Parceiros', 'Depoimentos', 'Conquistas']
  }
];

export default function BlogManager({
  posts,
  editingPost,
  setEditingPost,
  showPostForm,
  setShowPostForm,
  postForm,
  setPostForm,
  onSave,
  onDelete,
  uploadingMidia,
  especializacoes,
  ciclos,
  professores,
  parceiros
}) {
  const [novaTag, setNovaTag] = useState('');
  const [editorMode, setEditorMode] = useState('visual');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaSubcategoria, setNovaSubcategoria] = useState('');
  const [mostrarCamposPersonalizados, setMostrarCamposPersonalizados] = useState(false);

  const handleUploadImagemDestaque = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { base44 } = await import('@/api/base44Client');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPostForm(prev => ({ ...prev, imagem_destaque: file_url }));
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar: ' + error.message);
    }
  };

  const handleAddMidia = () => {
    setPostForm(prev => ({
      ...prev,
      midias: [...prev.midias, { tipo: 'imagem', url: '', titulo: '', cta: null }]
    }));
  };

  const handleRemoveMidia = (index) => {
    setPostForm(prev => ({
      ...prev,
      midias: prev.midias.filter((_, i) => i !== index)
    }));
  };

  const handleMidiaChange = (index, field, value) => {
    setPostForm(prev => ({
      ...prev,
      midias: prev.midias.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const handleToggleCTA = (index) => {
    setPostForm(prev => ({
      ...prev,
      midias: prev.midias.map((m, i) => 
        i === index 
          ? { ...m, cta: m.cta ? null : { texto: '', link: '', cor: 'azul' } }
          : m
      )
    }));
  };

  const handleCTAChange = (index, field, value) => {
    setPostForm(prev => ({
      ...prev,
      midias: prev.midias.map((m, i) => 
        i === index && m.cta
          ? { ...m, cta: { ...m.cta, [field]: value } }
          : m
      )
    }));
  };

  const handleUploadMidiaFile = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { base44 } = await import('@/api/base44Client');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleMidiaChange(index, 'url', file_url);
      toast.success('Arquivo enviado!');
    } catch (error) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleAddTag = () => {
    const tag = novaTag.trim();
    if (tag && !postForm.tags.includes(tag)) {
      setPostForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNovaTag('');
      toast.success('Tag adicionada!');
    }
  };

  const handleRemoveTag = (index) => {
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const subcategoriasDisponiveis = categorias.find(c => c.nome === postForm.categoria_principal)?.subcategorias || [];

  const getStatusBadge = (status) => {
    const configs = {
      'Rascunho': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Agendado': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Publicado': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Arquivado': { bg: 'bg-orange-100', text: 'text-orange-800', icon: FileText }
    };
    const config = configs[status] || configs['Rascunho'];
    const Icon = config.icon;
    return (
      <Badge className={`${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gerenciar Posts do Blog</h3>
        <Button onClick={() => setShowPostForm(!showPostForm)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Post
        </Button>
      </div>

      {/* Gerador de Posts com IA */}
      <AIBlogPostGenerator onPostCreated={() => {
        window.location.reload();
      }} />

      {showPostForm && (
        <Card className="mb-6 bg-pink-50 border-pink-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{editingPost ? 'Editar Post' : 'Novo Post'}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={editorMode === 'visual' ? 'default' : 'outline'}
                  onClick={() => setEditorMode('visual')}
                  className={editorMode === 'visual' ? 'bg-pink-600' : ''}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visual
                </Button>
                <Button
                  size="sm"
                  variant={editorMode === 'codigo' ? 'default' : 'outline'}
                  onClick={() => setEditorMode('codigo')}
                  className={editorMode === 'codigo' ? 'bg-pink-600' : ''}
                >
                  {'</>'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status e Agendamento */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Status e Publicação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <Select
                    value={postForm.status || 'Rascunho'}
                    onValueChange={(v) => setPostForm({...postForm, status: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rascunho">📝 Rascunho</SelectItem>
                      <SelectItem value="Agendado">⏰ Agendado</SelectItem>
                      <SelectItem value="Publicado">✅ Publicado</SelectItem>
                      <SelectItem value="Arquivado">📦 Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Data/Hora de Publicação {postForm.status === 'Agendado' && '*'}
                  </label>
                  <Input
                    type="datetime-local"
                    value={postForm.data_publicacao || ''}
                    onChange={(e) => setPostForm({...postForm, data_publicacao: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {postForm.status === 'Agendado' 
                      ? 'Obrigatório para posts agendados' 
                      : 'Opcional - deixe vazio para publicar imediatamente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Título do Post *</label>
                <Input
                  value={postForm.titulo}
                  onChange={(e) => setPostForm({...postForm, titulo: e.target.value})}
                  placeholder="Ex: Workshop BIM na Prática"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data do Evento/Post *</label>
                <Input
                  value={postForm.data}
                  onChange={(e) => setPostForm({...postForm, data: e.target.value})}
                  placeholder="Ex: 15/01/2025"
                />
              </div>
            </div>

            {/* Sistema de Categorias em Árvore */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-3">📂 Categorização</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Categoria Principal</label>
                  <Select
                    value={postForm.categoria_principal || ''}
                    onValueChange={(v) => {
                      if (v === '__outra__') {
                        setMostrarCamposPersonalizados(true);
                        setPostForm({...postForm, categoria_principal: '', subcategoria: ''});
                      } else {
                        setMostrarCamposPersonalizados(false);
                        setPostForm({...postForm, categoria_principal: v, subcategoria: ''});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.nome} value={cat.nome}>{cat.nome}</SelectItem>
                      ))}
                      <SelectItem value="__outra__">➕ Criar Nova Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subcategoria</label>
                  <Select
                    value={postForm.subcategoria || ''}
                    onValueChange={(v) => setPostForm({...postForm, subcategoria: v})}
                    disabled={!postForm.categoria_principal || mostrarCamposPersonalizados}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriasDisponiveis.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos Personalizados */}
              {mostrarCamposPersonalizados && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-300 space-y-3">
                  <p className="text-xs font-semibold text-purple-800">✨ Criar Categoria Personalizada</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Nome da Categoria</label>
                      <Input
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Ex: Mestre Amorim"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Subcategoria (opcional)</label>
                      <Input
                        value={novaSubcategoria}
                        onChange={(e) => setNovaSubcategoria(e.target.value)}
                        placeholder="Ex: Dicas Rápidas"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (novaCategoria.trim()) {
                          setPostForm({
                            ...postForm,
                            categoria_principal: novaCategoria.trim(),
                            subcategoria: novaSubcategoria.trim()
                          });
                          setMostrarCamposPersonalizados(false);
                          setNovaCategoria('');
                          setNovaSubcategoria('');
                          toast.success('Categoria personalizada definida!');
                        } else {
                          toast.error('Digite o nome da categoria');
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMostrarCamposPersonalizados(false);
                        setNovaCategoria('');
                        setNovaSubcategoria('');
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {postForm.categoria_principal && !mostrarCamposPersonalizados && (
                <div className="mt-3 text-xs text-purple-700">
                  📍 {postForm.categoria_principal} {postForm.subcategoria && `→ ${postForm.subcategoria}`}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Descrição Resumida *</label>
              <Textarea
                value={postForm.descricao}
                onChange={(e) => setPostForm({...postForm, descricao: e.target.value})}
                rows={3}
                placeholder="Breve descrição que aparece no card..."
              />
            </div>

            {/* Editor WYSIWYG */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Conteúdo Completo - Modo: {editorMode === 'visual' ? 'Visual (WYSIWYG)' : 'Código HTML'}
              </label>
              {editorMode === 'visual' ? (
                <RichTextEditor
                  value={postForm.conteudo_completo}
                  onChange={(value) => setPostForm({...postForm, conteudo_completo: value})}
                  placeholder="Escreva o conteúdo detalhado do post..."
                />
              ) : (
                <Textarea
                  value={postForm.conteudo_completo}
                  onChange={(e) => setPostForm({...postForm, conteudo_completo: e.target.value})}
                  rows={12}
                  placeholder="Cole ou edite o HTML do conteúdo..."
                  className="font-mono text-xs"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Imagem de Destaque (Thumbnail)</label>
              {postForm.imagem_destaque && (
                <div className="mb-2">
                  <img src={postForm.imagem_destaque} alt="Destaque" loading="lazy" className="w-full max-w-md h-48 object-cover rounded-lg border" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImagemDestaque}
                  disabled={uploadingMidia}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
              {postForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border">
                  {postForm.tags.map((tag, index) => (
                    <Badge key={index} className="bg-pink-100 text-pink-800 px-3 py-1 flex items-center gap-2">
                      {tag}
                      <button onClick={() => handleRemoveTag(index)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={novaTag}
                  onChange={(e) => setNovaTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Digite uma tag e pressione Enter"
                  className="flex-1"
                />
                <Button onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Mídias Anexadas</label>
                <Button onClick={handleAddMidia} size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Mídia
                </Button>
              </div>
              <div className="space-y-3">
                {postForm.midias.map((midia, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-600">Mídia {index + 1}</span>
                      <Button onClick={() => handleRemoveMidia(index)} size="icon" variant="ghost" className="h-6 w-6 text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Select value={midia.tipo} onValueChange={(v) => handleMidiaChange(index, 'tipo', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imagem">Imagem</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="audio">Áudio/Podcast</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="link">Link Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    {(midia.tipo === 'imagem' || midia.tipo === 'video' || midia.tipo === 'audio' || midia.tipo === 'pdf') && (
                      <Input
                        type="file"
                        accept={
                          midia.tipo === 'imagem' ? 'image/*' : 
                          midia.tipo === 'video' ? 'video/*' : 
                          midia.tipo === 'audio' ? 'audio/*' :
                          'application/pdf'
                        }
                        onChange={(e) => handleUploadMidiaFile(e, index)}
                        disabled={uploadingMidia}
                        className="text-sm"
                      />
                    )}
                    {midia.tipo === 'link' && (
                      <Input
                        value={midia.url}
                        onChange={(e) => handleMidiaChange(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="text-sm"
                      />
                    )}
                    <Input
                      value={midia.titulo}
                      onChange={(e) => handleMidiaChange(index, 'titulo', e.target.value)}
                      placeholder="Título/descrição da mídia"
                      className="text-sm"
                    />

                    {/* CTA */}
                    <div className="border-t pt-3 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-700">Call-to-Action</label>
                        <Button
                          onClick={() => handleToggleCTA(index)}
                          size="sm"
                          variant={midia.cta ? 'destructive' : 'outline'}
                          className="h-7 text-xs"
                        >
                          {midia.cta ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                          {midia.cta ? 'Remover CTA' : 'Adicionar CTA'}
                        </Button>
                      </div>
                      {midia.cta && (
                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                          <Input
                            value={midia.cta.texto}
                            onChange={(e) => handleCTAChange(index, 'texto', e.target.value)}
                            placeholder="Ex: Inscreva-se Agora"
                            className="text-sm"
                          />
                          <Input
                            value={midia.cta.link}
                            onChange={(e) => handleCTAChange(index, 'link', e.target.value)}
                            placeholder="https://..."
                            className="text-sm"
                          />
                          <Select value={midia.cta.cor} onValueChange={(v) => handleCTAChange(index, 'cor', v)}>
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="azul">🔵 Azul</SelectItem>
                              <SelectItem value="verde">🟢 Verde</SelectItem>
                              <SelectItem value="vermelho">🔴 Vermelho</SelectItem>
                              <SelectItem value="laranja">🟠 Laranja</SelectItem>
                              <SelectItem value="roxo">🟣 Roxo</SelectItem>
                              <SelectItem value="rosa">🌸 Rosa</SelectItem>
                              <SelectItem value="cinza">⚫ Cinza</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
              <Input
                type="number"
                value={postForm.ordem}
                onChange={(e) => setPostForm({...postForm, ordem: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={onSave} className="bg-pink-600 hover:bg-pink-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => {
                setShowPostForm(false);
                setEditingPost(null);
              }} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Posts */}
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum post cadastrado ainda.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {post.imagem_destaque && (
                    <img src={post.imagem_destaque} alt={post.titulo} loading="lazy" className="w-32 h-24 rounded-lg object-cover border" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h4 className="font-bold text-gray-800 flex-1">{post.titulo}</h4>
                      {getStatusBadge(post.status || 'Publicado')}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-xs text-gray-500">{post.data}</p>
                      {post.categoria_principal && (
                        <Badge variant="outline" className="text-xs">
                          {post.categoria_principal} {post.subcategoria && `→ ${post.subcategoria}`}
                        </Badge>
                      )}
                    </div>
                    {post.status === 'Agendado' && post.data_publicacao && (
                      <p className="text-xs text-blue-600 mb-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Publicação: {new Date(post.data_publicacao).toLocaleString('pt-BR')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">{post.descricao}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-pink-100 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setPostForm({
                          titulo: post.titulo,
                          data: post.data,
                          descricao: post.descricao,
                          conteudo_completo: post.conteudo_completo || '',
                          midias: post.midias || [],
                          imagem_destaque: post.imagem_destaque || '',
                          tags: post.tags || [],
                          categoria_principal: post.categoria_principal || '',
                          subcategoria: post.subcategoria || '',
                          status: post.status || 'Rascunho',
                          data_publicacao: post.data_publicacao || '',
                          especializacoes: post.especializacoes || [],
                          ciclos: post.ciclos || [],
                          professores: post.professores || [],
                          parceiros: post.parceiros || [],
                          ordem: post.ordem || 0
                        });
                        setEditingPost(post);
                        setShowPostForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}