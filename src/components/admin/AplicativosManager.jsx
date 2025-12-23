import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Star, Check, X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AplicativosManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('noticias');
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [showNoticiaDialog, setShowNoticiaDialog] = useState(false);
  const [editingMidia, setEditingMidia] = useState(null);
  const [showMidiaDialog, setShowMidiaDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const aplicativosNomes = [
    'GPO 4.0', 'Predial 4.0', 'EngenhariaPro AI', 'InteriorOS',
    'Vistoria Cautelar Pro', 'SmartVisto', 'Amorim Responde',
    'LaudoAcess Pro', 'Avalia Predial ESUDA', 'Geral'
  ];

  // Queries
  const { data: noticias = [] } = useQuery({
    queryKey: ['aplicativo-noticias'],
    queryFn: () => base44.entities.AplicativoNoticia.list('-data_publicacao')
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['aplicativo-feedbacks'],
    queryFn: () => base44.entities.AplicativoFeedback.list('-created_date')
  });

  const { data: midias = [] } = useQuery({
    queryKey: ['aplicativo-midias'],
    queryFn: () => base44.entities.AplicativoMidia.list('ordem')
  });

  // Mutations - Notícias
  const createNoticiaMutation = useMutation({
    mutationFn: (data) => base44.entities.AplicativoNoticia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-noticias']);
      toast.success('Notícia criada!');
      setShowNoticiaDialog(false);
      setEditingNoticia(null);
    }
  });

  const updateNoticiaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AplicativoNoticia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-noticias']);
      toast.success('Notícia atualizada!');
      setShowNoticiaDialog(false);
      setEditingNoticia(null);
    }
  });

  const deleteNoticiaMutation = useMutation({
    mutationFn: (id) => base44.entities.AplicativoNoticia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-noticias']);
      toast.success('Notícia deletada!');
    }
  });

  // Mutations - Feedback
  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AplicativoFeedback.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-feedbacks']);
      toast.success('Feedback atualizado!');
    }
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: (id) => base44.entities.AplicativoFeedback.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-feedbacks']);
      toast.success('Feedback deletado!');
    }
  });

  // Mutations - Mídias
  const createMidiaMutation = useMutation({
    mutationFn: (data) => base44.entities.AplicativoMidia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-midias']);
      toast.success('Mídia adicionada!');
      setShowMidiaDialog(false);
      setEditingMidia(null);
    }
  });

  const updateMidiaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AplicativoMidia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-midias']);
      toast.success('Mídia atualizada!');
      setShowMidiaDialog(false);
      setEditingMidia(null);
    }
  });

  const deleteMidiaMutation = useMutation({
    mutationFn: (id) => base44.entities.AplicativoMidia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['aplicativo-midias']);
      toast.success('Mídia deletada!');
    }
  });

  const handleFileUpload = async (file) => {
    setUploadingFile(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      toast.success('Arquivo enviado!');
      return response.file_url;
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleNoticiaSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.destaque = formData.get('destaque') === 'on';

    if (editingNoticia) {
      updateNoticiaMutation.mutate({ id: editingNoticia.id, data });
    } else {
      createNoticiaMutation.mutate(data);
    }
  };

  const handleMidiaSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.ordem = parseInt(data.ordem) || 0;
    data.tags = data.tags ? data.tags.split(',').map(t => t.trim()) : [];

    if (editingMidia) {
      updateMidiaMutation.mutate({ id: editingMidia.id, data });
    } else {
      createMidiaMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Gerenciar Aplicativos Inteligentes</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="noticias">Notícias ({noticias.length})</TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks ({feedbacks.filter(f => !f.aprovado).length} pendentes)</TabsTrigger>
          <TabsTrigger value="midias">Galeria ({midias.length})</TabsTrigger>
        </TabsList>

        {/* Notícias */}
        <TabsContent value="noticias" className="space-y-4">
          <Button onClick={() => { setEditingNoticia(null); setShowNoticiaDialog(true); }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Nova Notícia
          </Button>

          <div className="grid gap-4">
            {noticias.map((noticia) => (
              <Card key={noticia.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{noticia.titulo}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-blue-100 text-blue-800">{noticia.aplicativo_nome}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">{noticia.tipo}</Badge>
                        {noticia.destaque && <Badge className="bg-yellow-100 text-yellow-800">⭐ Destaque</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingNoticia(noticia); setShowNoticiaDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteNoticiaMutation.mutate(noticia.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{noticia.descricao}</p>
                  <p className="text-xs text-gray-500">{noticia.data_publicacao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedbacks */}
        <TabsContent value="feedbacks" className="space-y-4">
          <div className="grid gap-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} className={`border-2 ${feedback.aprovado ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{feedback.usuario_nome}</h4>
                      <Badge className="bg-blue-100 text-blue-800 mt-1">{feedback.aplicativo_nome}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${feedback.avaliacao_estrelas >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {!feedback.aprovado && (
                        <Button size="sm" className="bg-green-600" onClick={() => updateFeedbackMutation.mutate({ id: feedback.id, data: { aprovado: true } })}>
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => deleteFeedbackMutation.mutate(feedback.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {feedback.comentario && <p className="text-gray-700 text-sm mb-2">{feedback.comentario}</p>}
                  {feedback.aspectos_positivos && (
                    <div className="bg-green-50 p-2 rounded mb-2">
                      <p className="text-xs font-semibold text-green-800">Positivos:</p>
                      <p className="text-xs text-green-700">{feedback.aspectos_positivos}</p>
                    </div>
                  )}
                  {feedback.aspectos_melhorar && (
                    <div className="bg-orange-50 p-2 rounded mb-2">
                      <p className="text-xs font-semibold text-orange-800">A melhorar:</p>
                      <p className="text-xs text-orange-700">{feedback.aspectos_melhorar}</p>
                    </div>
                  )}
                  <Input
                    placeholder="Resposta do coordenador..."
                    defaultValue={feedback.resposta_coordenador || ''}
                    onBlur={(e) => {
                      if (e.target.value !== feedback.resposta_coordenador) {
                        updateFeedbackMutation.mutate({ id: feedback.id, data: { resposta_coordenador: e.target.value } });
                      }
                    }}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mídias */}
        <TabsContent value="midias" className="space-y-4">
          <Button onClick={() => { setEditingMidia(null); setShowMidiaDialog(true); }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Nova Mídia
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {midias.map((midia) => (
              <Card key={midia.id} className="border-2">
                <CardContent className="p-4">
                  {midia.tipo_midia === 'imagem' ? (
                    <img src={midia.url_midia} alt={midia.titulo} className="w-full h-40 object-cover rounded-lg mb-3" />
                  ) : (
                    <video src={midia.url_midia} controls className="w-full h-40 rounded-lg mb-3" />
                  )}
                  <h4 className="font-bold text-sm mb-1">{midia.titulo}</h4>
                  <div className="flex gap-1 mb-2">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{midia.aplicativo_nome}</Badge>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">{midia.categoria}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingMidia(midia); setShowMidiaDialog(true); }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMidiaMutation.mutate(midia.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Notícia */}
      <Dialog open={showNoticiaDialog} onOpenChange={setShowNoticiaDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNoticia ? 'Editar' : 'Nova'} Notícia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoticiaSubmit} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input name="titulo" defaultValue={editingNoticia?.titulo} required />
            </div>
            <div>
              <Label>Descrição *</Label>
              <Textarea name="descricao" defaultValue={editingNoticia?.descricao} required rows={2} />
            </div>
            <div>
              <Label>Conteúdo Completo (Markdown)</Label>
              <Textarea name="conteudo_completo" defaultValue={editingNoticia?.conteudo_completo} rows={6} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Aplicativo *</Label>
                <Select name="aplicativo_nome" defaultValue={editingNoticia?.aplicativo_nome}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aplicativosNomes.map(nome => (
                      <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select name="tipo" defaultValue={editingNoticia?.tipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nova Funcionalidade">Nova Funcionalidade</SelectItem>
                    <SelectItem value="Melhoria">Melhoria</SelectItem>
                    <SelectItem value="Lançamento">Lançamento</SelectItem>
                    <SelectItem value="Atualização">Atualização</SelectItem>
                    <SelectItem value="Correção">Correção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data de Publicação *</Label>
              <Input type="date" name="data_publicacao" defaultValue={editingNoticia?.data_publicacao} required />
            </div>
            <div>
              <Label>URL Imagem de Destaque</Label>
              <Input name="imagem_destaque" defaultValue={editingNoticia?.imagem_destaque} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="destaque" id="destaque" defaultChecked={editingNoticia?.destaque} />
              <Label htmlFor="destaque">Marcar como destaque</Label>
            </div>
            <Button type="submit" className="w-full">Salvar Notícia</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Mídia */}
      <Dialog open={showMidiaDialog} onOpenChange={setShowMidiaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMidia ? 'Editar' : 'Nova'} Mídia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMidiaSubmit} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input name="titulo" defaultValue={editingMidia?.titulo} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea name="descricao" defaultValue={editingMidia?.descricao} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Aplicativo *</Label>
                <Select name="aplicativo_nome" defaultValue={editingMidia?.aplicativo_nome}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aplicativosNomes.map(nome => (
                      <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select name="tipo_midia" defaultValue={editingMidia?.tipo_midia}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select name="categoria" defaultValue={editingMidia?.categoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Demonstração">Demonstração</SelectItem>
                  <SelectItem value="Interface">Interface</SelectItem>
                  <SelectItem value="Resultado">Resultado</SelectItem>
                  <SelectItem value="Caso de Uso">Caso de Uso</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL da Mídia *</Label>
              <Input name="url_midia" defaultValue={editingMidia?.url_midia} required />
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await handleFileUpload(file);
                      if (url) {
                        e.target.form.querySelector('[name="url_midia"]').value = url;
                      }
                    }
                  }}
                  disabled={uploadingFile}
                />
                {uploadingFile && <p className="text-xs text-gray-500 mt-1">Enviando arquivo...</p>}
              </div>
            </div>
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input name="tags" defaultValue={editingMidia?.tags?.join(', ')} placeholder="tutorial, inicial, exemplo" />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" name="ordem" defaultValue={editingMidia?.ordem || 0} />
            </div>
            <Button type="submit" className="w-full">Salvar Mídia</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}