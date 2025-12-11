import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Search, Image, Video, FileText, File, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function GerenciadorDeMidiaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterTag, setFilterTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ['mediaItems'],
    queryFn: () => base44.entities.MediaItem.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MediaItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['mediaItems']);
      toast.success('Mídia adicionada com sucesso!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MediaItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['mediaItems']);
      setEditingItem(null);
      toast.success('Mídia atualizada!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['mediaItems']);
      toast.success('Mídia excluída!');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const tipoArquivo = file.type.startsWith('image/') ? 'imagem' :
                          file.type.startsWith('video/') ? 'video' :
                          file.type === 'application/pdf' ? 'pdf' : 'documento';

      await createMutation.mutateAsync({
        nome: file.name,
        url_arquivo: file_url,
        tipo_arquivo: tipoArquivo,
        tamanho_kb: Math.round(file.size / 1024),
        tags: []
      });
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      nome: item.nome,
      descricao: item.descricao || '',
      tags: item.tags?.join(', ') || ''
    });
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: editingItem,
      data: {
        ...editForm,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
    });
  };

  const allTags = [...new Set(mediaItems.flatMap(item => item.tags || []))];

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || item.tipo_arquivo === filterType;
    const matchesTag = !filterTag || item.tags?.includes(filterTag);
    return matchesSearch && matchesType && matchesTag;
  });

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'imagem': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Mídia</h1>
        <label>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          <Button disabled={uploading} className="bg-green-600 hover:bg-green-700">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Enviando...' : 'Upload'}
          </Button>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de arquivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="imagem">Imagens</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="documento">Documentos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas as tags</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-gray-600">Carregando mídias...</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Nenhuma mídia encontrada. Faça upload para começar!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.nome}
                      onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                      placeholder="Nome"
                    />
                    <Textarea
                      value={editForm.descricao}
                      onChange={(e) => setEditForm({...editForm, descricao: e.target.value})}
                      placeholder="Descrição"
                      rows={2}
                    />
                    <Input
                      value={editForm.tags}
                      onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                      placeholder="Tags (separadas por vírgula)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="flex-1">Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.tipo_arquivo === 'imagem' && (
                      <img src={item.url_arquivo} alt={item.nome} className="w-full h-32 object-cover rounded mb-3" />
                    )}
                    {item.tipo_arquivo === 'video' && (
                      <video src={item.url_arquivo} className="w-full h-32 object-cover rounded mb-3" />
                    )}
                    {(item.tipo_arquivo === 'pdf' || item.tipo_arquivo === 'documento') && (
                      <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                        {getIcon(item.tipo_arquivo)}
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{item.nome}</h3>
                    {item.descricao && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.descricao}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">{item.tipo_arquivo}</Badge>
                      {item.tamanho_kb && (
                        <Badge variant="outline" className="text-xs">{item.tamanho_kb} KB</Badge>
                      )}
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} className="text-xs bg-green-100 text-green-700">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm('Deseja excluir esta mídia?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}