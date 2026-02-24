import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Image as ImageIcon, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AIBlogPostGenerator({ onPostCreated }) {
  const [formData, setFormData] = useState({
    prompt: '',
    news_source_type: 'nenhuma',
    news_source_value: '',
    keywords: ''
  });
  const [generatedPost, setGeneratedPost] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await base44.functions.invoke('generateAIBlogPost', data);
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedPost(data);
        toast.success('Conteúdo gerado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao gerar post');
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao gerar post com IA. Tente novamente.');
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (postData) => {
      const today = new Date().toLocaleDateString('pt-BR');
      
      return await base44.entities.Post.create({
        titulo: postData.titulo,
        data: today,
        descricao: postData.descricao,
        conteudo_completo: postData.conteudo_completo,
        palavra_chave_principal: postData.palavra_chave_principal || '',
        status: 'Rascunho',
        imagem_destaque: postData.imagens_sugeridas?.[0] || '',
        midias: postData.imagens_sugeridas?.map(url => ({
          tipo: 'imagem',
          url: url,
          titulo: 'Imagem gerada por IA'
        })) || [],
        tags: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        categoria_principal: 'Blog',
        ordem: 0
      });
    },
    onSuccess: () => {
      toast.success('Post salvo como rascunho!');
      setGeneratedPost(null);
      setFormData({ prompt: '', news_source_type: 'nenhuma', news_source_value: '', keywords: '' });
      if (onPostCreated) onPostCreated();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar o post.');
    }
  });

  const handleGenerate = () => {
    if (!formData.prompt) {
      toast.error('O prompt principal é obrigatório!');
      return;
    }
    generateMutation.mutate(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
        Gerador de Posts com IA
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sobre o que será o post? *
          </label>
          <Textarea
            value={formData.prompt}
            onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="Ex: As tendências de sustentabilidade na construção civil para 2026..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonte de Contexto
            </label>
            <Select 
              value={formData.news_source_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, news_source_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma (Apenas IA)</SelectItem>
                <SelectItem value="url">Ler de uma URL/Artigo</SelectItem>
                <SelectItem value="rss_feed">Feed RSS</SelectItem>
                <SelectItem value="search_terms">Busca Web (Google)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.news_source_type !== 'nenhuma' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.news_source_type === 'url' ? 'URL do Artigo' : 
                 formData.news_source_type === 'rss_feed' ? 'URL do Feed RSS' : 
                 'Termos de Busca'}
              </label>
              <Input
                value={formData.news_source_value}
                onChange={(e) => setFormData(prev => ({ ...prev, news_source_value: e.target.value }))}
                placeholder={
                  formData.news_source_type === 'url' ? 'https://exemplo.com/noticia' :
                  formData.news_source_type === 'rss_feed' ? 'https://exemplo.com/feed.xml' :
                  'BIM na construção civil'
                }
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Palavras-chave (separadas por vírgula)
          </label>
          <Input
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            placeholder="Ex: Engenharia, BIM, Gestão de Obras"
          />
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !formData.prompt}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando Conteúdo...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Gerar Post e Imagens
            </>
          )}
        </Button>
      </div>

      {generatedPost && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
            Pré-visualização do Post
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {generatedPost.titulo}
            </h4>
            <p className="text-gray-600 italic mb-6 border-l-4 border-blue-500 pl-4">
              {generatedPost.descricao}
            </p>
            
            {generatedPost.imagens_sugeridas?.length > 0 && (
              <div className="mb-6">
                <span className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1" /> Imagem Sugerida:
                </span>
                <img 
                  src={generatedPost.imagens_sugeridas[0]} 
                  alt="Sugestão da IA" 
                  className="max-w-md rounded-lg shadow-sm"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            <div 
              className="prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: generatedPost.conteudo_completo }}
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => setGeneratedPost(null)}
              disabled={saveMutation.isPending}
            >
              Descartar
            </Button>
            <Button 
              onClick={() => saveMutation.mutate(generatedPost)}
              disabled={saveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Salvar como Rascunho
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}