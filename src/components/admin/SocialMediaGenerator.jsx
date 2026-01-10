import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Instagram, Linkedin, Share2, Copy, Clock, Image, Loader2, Upload, History, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialMediaGenerator({ especializacao }) {
  const [generatedContent, setGeneratedContent] = useState({});
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [customOptions, setCustomOptions] = useState({
    tone: 'profissional',
    keywords: '',
    cta: '',
    modeloFile: null
  });
  const [showHistory, setShowHistory] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Share2
  };

  // Histórico de posts
  const { data: historyPosts = [], refetch: refetchHistory } = useQuery({
    queryKey: ['social-posts-history', especializacao.id],
    queryFn: () => base44.entities.SocialMediaPost.filter({ especializacao_id: especializacao.id }, '-created_date', 20)
  });

  const generateMutation = useMutation({
    mutationFn: async (platform) => {
      let modeloText = null;
      let modeloImageUrl = null;
      
      // Processar arquivo de modelo se fornecido
      if (customOptions.modeloFile) {
        const fileType = customOptions.modeloFile.type;
        
        if (fileType.startsWith('image/')) {
          // Upload da imagem
          const uploadResponse = await base44.integrations.Core.UploadFile({
            file: customOptions.modeloFile
          });
          modeloImageUrl = uploadResponse.file_url;
        } else {
          // Arquivo de texto
          modeloText = await customOptions.modeloFile.text();
        }
      }
      
      const { data } = await base44.functions.invoke('generateSocialMediaPost', {
        especializacao,
        platform,
        tone: customOptions.tone,
        keywords: customOptions.keywords,
        cta: customOptions.cta,
        modelo: modeloText,
        modeloImageUrl: modeloImageUrl
      });
      
      // Salvar no banco de dados
      try {
        await base44.entities.SocialMediaPost.create({
          especializacao_id: especializacao.id,
          especializacao_nome: especializacao.nome,
          platform,
          post_text: data.content.post_text || '',
          image_suggestions: data.content.image_suggestions || [],
          best_time_to_post: data.content.best_time_to_post || '',
          hashtags: data.content.hashtags || [],
          alternative_versions: data.content.alternative_versions || []
        });
        refetchHistory();
      } catch (saveError) {
        console.error('Erro ao salvar post:', saveError);
      }
      
      return { platform, data };
    },
    onSuccess: ({ platform, data }) => {
      setGeneratedContent(prev => ({ ...prev, [platform]: data.content }));
      toast.success(`Post para ${platform} gerado e salvo!`);
    },
    onError: (error) => {
      console.error('Erro ao gerar post:', error);
      toast.error('Erro ao gerar post: ' + error.message);
    }
  });

  const generateImageMutation = useMutation({
    mutationFn: async ({ platform, prompt }) => {
      setGeneratingImage(true);
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Imagem profissional para post de ${platform} sobre: ${prompt}. Estilo moderno, cores vibrantes, foco em construção civil e engenharia.`
      });
      return response.url;
    },
    onSuccess: (imageUrl) => {
      setGeneratingImage(false);
      toast.success('Imagem gerada com sucesso!');
      const img = document.createElement('a');
      img.href = imageUrl;
      img.target = '_blank';
      img.click();
    },
    onError: (error) => {
      setGeneratingImage(false);
      toast.error('Erro ao gerar imagem: ' + error.message);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => base44.entities.SocialMediaPost.delete(postId),
    onSuccess: () => {
      refetchHistory();
      toast.success('Post deletado!');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência!');
  };

  const generateAllPosts = () => {
    ['instagram', 'linkedin', 'twitter'].forEach(platform => {
      generateMutation.mutate(platform);
    });
  };

  const PlatformIcon = platformIcons[selectedPlatform];

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Gerador de Posts para Redes Sociais
        </CardTitle>
        <CardDescription>
          Crie posts profissionais automaticamente com IA para divulgar sua especialização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Especialização:
          </p>
          <p className="text-lg font-bold text-gray-900">{especializacao.nome}</p>
        </div>

        {/* Opções de Personalização */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 space-y-3">
          <h4 className="font-bold text-gray-900 mb-3">⚙️ Personalizar Geração</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-semibold">Tom da Mensagem</Label>
              <Select value={customOptions.tone} onValueChange={(v) => setCustomOptions({...customOptions, tone: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="persuasivo">Persuasivo</SelectItem>
                  <SelectItem value="inspirador">Inspirador</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">CTA Principal</Label>
              <Input
                placeholder="Ex: Inscreva-se agora!"
                value={customOptions.cta}
                onChange={(e) => setCustomOptions({...customOptions, cta: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Palavras-chave (separadas por vírgula)</Label>
            <Input
              placeholder="Ex: BIM, tecnologia, inovação"
              value={customOptions.keywords}
              onChange={(e) => setCustomOptions({...customOptions, keywords: e.target.value})}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Modelo de Publicação (texto ou imagem)</Label>
            <Input
              type="file"
              accept=".txt,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => setCustomOptions({...customOptions, modeloFile: e.target.files[0]})}
            />
            {customOptions.modeloFile && (
              <p className="text-xs text-green-600 mt-1">✓ {customOptions.modeloFile.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Aceita texto (.txt) ou imagens (.jpg, .png)</p>
          </div>
        </div>

        {/* Botão de Histórico */}
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          className="w-full"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Ocultar Histórico' : `Ver Histórico (${historyPosts.length} posts)`}
        </Button>

        {/* Histórico de Posts */}
        {showHistory && (
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 max-h-96 overflow-y-auto space-y-2">
            <h4 className="font-bold text-gray-900 mb-3 sticky top-0 bg-white pb-2">📜 Histórico de Posts</h4>
            {historyPosts.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Nenhum post gerado ainda.</p>
            ) : (
              historyPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="text-xs">{post.platform}</Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.post_text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">{post.post_text}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_date).toLocaleDateString('pt-BR')}</p>
                </div>
              ))
            )}
          </div>
        )}

        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              X / Twitter
            </TabsTrigger>
          </TabsList>

          {['instagram', 'linkedin', 'twitter'].map(platform => (
            <TabsContent key={platform} value={platform} className="space-y-4">
              {!generatedContent[platform] ? (
                <Button
                  onClick={() => generateMutation.mutate(platform)}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando post...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Post para {platform === 'twitter' ? 'X/Twitter' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <PlatformIcon className="w-5 h-5 text-blue-600" />
                        Post Gerado
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedContent[platform].post_text)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent[platform].post_text}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        Melhor Horário
                      </h5>
                      <p className="text-sm text-gray-900">
                        {generatedContent[platform].best_time_to_post}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                        <Image className="w-4 h-4 text-purple-600" />
                        Sugestões de Imagem
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent[platform].image_suggestions?.slice(0, 3).map((sugg, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {sugg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2">Hashtags:</h5>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent[platform].hashtags?.map((tag, i) => (
                        <Badge key={i} className="bg-blue-600 text-white">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {generatedContent[platform].alternative_versions && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-sm text-gray-700 mb-3">
                        Versões Alternativas:
                      </h5>
                      <div className="space-y-3">
                        {generatedContent[platform].alternative_versions.map((alt, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {alt.tone}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(alt.text)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-700">{alt.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => generateMutation.mutate(platform)}
                      variant="outline"
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Novamente
                    </Button>
                    <Button
                      onClick={() => generateImageMutation.mutate({ 
                        platform, 
                        prompt: especializacao.nome 
                      })}
                      disabled={generatingImage}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {generatingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Image className="w-4 h-4 mr-2" />
                      )}
                      Gerar Imagem IA
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Button
          onClick={generateAllPosts}
          disabled={generateMutation.isPending}
          variant="outline"
          className="w-full"
        >
          Gerar Posts para Todas as Plataformas
        </Button>
      </CardContent>
    </Card>
  );
}