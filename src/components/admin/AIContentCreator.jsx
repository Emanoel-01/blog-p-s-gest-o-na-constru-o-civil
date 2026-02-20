import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, Copy, RefreshCw, Save, Loader2, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIContentCreator() {
  const [selectedTool, setSelectedTool] = useState('blog');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');

  const { data: atividades = [] } = useQuery({
    queryKey: ['atividades-recentes'],
    queryFn: async () => {
      const [freelancers, eventos] = await Promise.all([
        base44.entities.FreelancerNetwork.list('-data', 10),
        base44.entities.Evento.list('-data', 10)
      ]);
      return [...freelancers, ...eventos];
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async ({ tool, userPrompt }) => {
      let systemPrompt = '';

      if (tool === 'blog') {
        systemPrompt = `Você é um redator especializado em educação e construção civil. Gere um post completo para o blog da ESUDA com base no seguinte tema:

${userPrompt}

O post deve incluir:
1. Título chamativo e otimizado para SEO
2. Introdução envolvente
3. Desenvolvimento com subtópicos relevantes
4. Conclusão com call-to-action
5. Sugestões de tags e categoria

Use markdown para formatação. Seja profissional, informativo e inspirador.`;
      } else if (tool === 'especializacao') {
        systemPrompt = `Você é um especialista em marketing educacional. Crie uma descrição comercial atraente para uma especialização com base nas informações:

${userPrompt}

A descrição deve incluir:
1. Título/nome sugerido da especialização
2. Resumo publicitário (2-3 parágrafos)
3. Descrição detalhada
4. Benefícios e diferenciais
5. Público-alvo ideal
6. Sugestões de habilidades e conhecimentos adquiridos

Use markdown para formatação. Seja persuasivo e focado em resultados.`;
      } else if (tool === 'feed') {
        systemPrompt = `Você é um gestor de comunidade acadêmica. Analise as atividades recentes e sugira tópicos relevantes para o feed de sucesso:

Atividades Recentes:
${JSON.stringify(atividades, null, 2)}

Informações adicionais:
${userPrompt}

Sugira 5-7 tópicos para posts no feed de sucesso que celebrem conquistas, engajem a comunidade e inspirem outros alunos. Para cada tópico, inclua:
1. Título do post
2. Descrição breve
3. Tipo de conteúdo (conquista, dica, inspiração, etc.)
4. Aluno/projeto relacionado (se aplicável)

Use markdown para formatação.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: tool === 'blog'
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success('Conteúdo gerado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao gerar conteúdo: ' + error.message);
    }
  });

  const saveContentMutation = useMutation({
    mutationFn: async () => {
      if (selectedTool === 'blog') {
        await base44.entities.Post.create({
          titulo: title || 'Novo Post (sem título)',
          data: new Date().toLocaleDateString('pt-BR'),
          descricao: generatedContent.substring(0, 200),
          conteudo_completo: generatedContent,
          status: 'Rascunho',
          tags: ['IA', 'Gerado Automaticamente']
        });
      } else if (selectedTool === 'especializacao') {
        // Salvar como nota/rascunho temporário
        toast.info('Descrição salva como rascunho. Finalize a especialização no gerenciador.');
      }
    },
    onSuccess: () => {
      toast.success('Conteúdo salvo com sucesso!');
      setGeneratedContent('');
      setPrompt('');
      setTitle('');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Conteúdo copiado para a área de transferência!');
  };

  const tools = [
    {
      id: 'blog',
      title: 'Rascunho de Post',
      description: 'Gere posts completos para o blog ou notícias',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'especializacao',
      title: 'Descrição de Curso',
      description: 'Crie descrições e resumos para especializações',
      icon: BookOpen,
      color: 'green'
    },
    {
      id: 'feed',
      title: 'Tópicos para Feed',
      description: 'Sugira tópicos relevantes baseados em atividades',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-pink-300">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Criador de Conteúdo com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedTool === tool.id
                      ? `border-${tool.color}-500 bg-${tool.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-lg bg-${tool.color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 text-${tool.color}-600`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">
                {selectedTool === 'blog' ? 'Tema do Post' : 
                 selectedTool === 'especializacao' ? 'Informações sobre a Especialização' : 
                 'Contexto Adicional'}
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedTool === 'blog' ? 'Ex: Tendências de BIM em 2026, Importância da manutenção preditiva...' :
                  selectedTool === 'especializacao' ? 'Ex: Especialização em BIM para Infraestrutura, carga horária 360h, foco em Revit e Navisworks...' :
                  'Ex: Foco em conquistas de alunos em projetos de retrofit...'
                }
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={() => generateContentMutation.mutate({ tool: selectedTool, userPrompt: prompt })}
              disabled={!prompt.trim() || generateContentMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              {generateContentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Conteúdo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Conteúdo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle>Conteúdo Gerado</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  onClick={() => generateContentMutation.mutate({ tool: selectedTool, userPrompt: prompt })}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar
                </Button>
                {selectedTool === 'blog' && (
                  <Button onClick={() => saveContentMutation.mutate()} variant="default" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar como Rascunho
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTool === 'blog' && (
              <div className="mb-4">
                <Label htmlFor="title">Título do Post</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do post"
                  className="mt-1"
                />
              </div>
            )}
            <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg border">
              <ReactMarkdown>{generatedContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}