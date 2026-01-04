import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Instagram, Linkedin, Share2, Copy, Clock, Image, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialMediaGenerator({ especializacao }) {
  const [generatedContent, setGeneratedContent] = useState({});
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Share2
  };

  const generateMutation = useMutation({
    mutationFn: async (platform) => {
      const response = await base44.functions.invoke('generateSocialMediaPost', {
        especializacao,
        platform
      });
      
      // Salvar no banco de dados
      await base44.entities.SocialMediaPost.create({
        especializacao_id: especializacao.id,
        especializacao_nome: especializacao.nome,
        platform,
        post_text: response.data.content.post_text,
        image_suggestions: response.data.content.image_suggestions || [],
        best_time_to_post: response.data.content.best_time_to_post || '',
        hashtags: response.data.content.hashtags || [],
        alternative_versions: response.data.content.alternative_versions || []
      });
      
      return { platform, data: response.data };
    },
    onSuccess: ({ platform, data }) => {
      setGeneratedContent(prev => ({ ...prev, [platform]: data.content }));
      toast.success(`Post para ${platform} gerado e salvo!`);
    },
    onError: (error) => {
      toast.error('Erro ao gerar post: ' + error.message);
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

                  <Button
                    onClick={() => generateMutation.mutate(platform)}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Novamente
                  </Button>
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