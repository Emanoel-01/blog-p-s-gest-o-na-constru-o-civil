import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, Tag, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogAITools({ onPostCreated }) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);

  const [contentForSummary, setContentForSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState('');

  const [contentForTags, setContentForTags] = useState('');
  const [loadingTags, setLoadingTags] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [suggestedMeta, setSuggestedMeta] = useState('');

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, insira um tópico');
      return;
    }

    setLoading(true);
    try {
      const prompt = `
Crie um post de blog completo e detalhado para a ESUDA (pós-graduação em Construção Civil) sobre o seguinte tópico: "${topic}"
${keywords ? `Palavras-chave para incluir: ${keywords}` : ''}

O post deve incluir:
1. Título atrativo
2. Introdução engajadora
3. Conteúdo principal bem estruturado com subtítulos
4. Conclusão motivadora
5. Linguagem acadêmica mas acessível
6. Contexto da construção civil brasileira

Retorne no formato JSON com:
- titulo: string
- descricao: string (resumo de 1-2 frases)
- conteudo_completo: string (markdown formatado)
- tags: array de strings (5-8 tags relevantes)
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            conteudo_completo: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setGeneratedPost(response);
      toast.success('Post gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar post:', error);
      toast.error('Erro ao gerar post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGeneratedPost = async () => {
    if (!generatedPost) return;

    try {
      await base44.entities.Post.create({
        titulo: generatedPost.titulo,
        descricao: generatedPost.descricao,
        conteudo_completo: generatedPost.conteudo_completo,
        tags: generatedPost.tags,
        data: new Date().toISOString().split('T')[0]
      });

      toast.success('Post salvo como rascunho!');
      setGeneratedPost(null);
      setTopic('');
      setKeywords('');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
    }
  };

  const generateSummary = async () => {
    if (!contentForSummary.trim()) {
      toast.error('Por favor, insira o conteúdo para resumir');
      return;
    }

    setLoadingSummary(true);
    try {
      const prompt = `
Crie um resumo conciso e atrativo (máximo 2-3 frases) do seguinte conteúdo de blog:

${contentForSummary}

O resumo deve capturar a essência do artigo e motivar a leitura.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setSummary(response);
      toast.success('Resumo gerado!');
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao gerar resumo');
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateTagsAndMeta = async () => {
    if (!contentForTags.trim()) {
      toast.error('Por favor, insira o título e descrição');
      return;
    }

    setLoadingTags(true);
    try {
      const prompt = `
Analise o seguinte conteúdo de blog e sugira:
1. 6-10 tags relevantes para categorização
2. Meta description otimizada para SEO (máx 160 caracteres)

Conteúdo:
${contentForTags}

Retorne no formato JSON com:
- tags: array de strings
- meta_description: string
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } },
            meta_description: { type: 'string' }
          }
        }
      });

      setSuggestedTags(response.tags);
      setSuggestedMeta(response.meta_description);
      toast.success('Sugestões geradas!');
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast.error('Erro ao gerar sugestões');
    } finally {
      setLoadingTags(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Geração de Posts Completos */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Gerar Post com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Tópico do Post</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Tendências de BIM em 2025"
            />
          </div>
          <div>
            <Label>Palavras-chave (opcional)</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Ex: BIM, tecnologia, gestão de obras"
            />
          </div>
          <Button
            onClick={generateBlogPost}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Gerando...' : <><Zap className="w-4 h-4 mr-2" /> Gerar Post Completo</>}
          </Button>

          {generatedPost && (
            <div className="mt-6 space-y-4 bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{generatedPost.titulo}</h3>
              <p className="text-gray-700">{generatedPost.descricao}</p>
              <div className="flex flex-wrap gap-2">
                {generatedPost.tags.map((tag, i) => (
                  <span key={i} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <Button onClick={saveGeneratedPost} className="bg-green-600 hover:bg-green-700">
                Salvar como Rascunho
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geração de Resumos */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Gerar Resumo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Conteúdo para Resumir</Label>
            <Textarea
              value={contentForSummary}
              onChange={(e) => setContentForSummary(e.target.value)}
              rows={5}
              placeholder="Cole o conteúdo completo do post aqui..."
            />
          </div>
          <Button
            onClick={generateSummary}
            disabled={loadingSummary}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loadingSummary ? 'Gerando...' : 'Gerar Resumo'}
          </Button>

          {summary && (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <Label className="text-sm font-semibold mb-2 block">Resumo Gerado:</Label>
              <p className="text-gray-700">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões de Tags e Meta */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-green-600" />
            Sugerir Tags e Meta Description
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Título e Descrição do Post</Label>
            <Textarea
              value={contentForTags}
              onChange={(e) => setContentForTags(e.target.value)}
              rows={4}
              placeholder="Cole o título e descrição do post..."
            />
          </div>
          <Button
            onClick={generateTagsAndMeta}
            disabled={loadingTags}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loadingTags ? 'Gerando...' : 'Gerar Sugestões'}
          </Button>

          {suggestedTags.length > 0 && (
            <div className="mt-4 space-y-3 bg-green-50 p-4 rounded-lg">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Tags Sugeridas:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag, i) => (
                    <span key={i} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {suggestedMeta && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Meta Description:</Label>
                  <p className="text-gray-700 text-sm">{suggestedMeta}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}