import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Copy, RefreshCw, TrendingUp, Mail, Instagram, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingAIStudio() {
  const [selectedType, setSelectedType] = useState('geral');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const queryClient = useQueryClient();

  const { data: especializacoes } = useQuery({
    queryKey: ['especializacoes-marketing'],
    queryFn: () => base44.entities.Especializacao.list()
  });

  const { data: posts } = useQuery({
    queryKey: ['posts-marketing'],
    queryFn: () => base44.entities.Post.list('-created_date', 10)
  });

  const generateMutation = useMutation({
    mutationFn: async ({ type, entity_id }) => {
      const response = await base44.functions.invoke('generateMarketingSuggestions', {
        type,
        entity_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('Sugestões geradas com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao gerar sugestões: ' + error.message);
    }
  });

  const handleGenerate = () => {
    if (selectedType !== 'geral' && !selectedEntityId) {
      toast.error('Selecione um item para gerar sugestões');
      return;
    }

    generateMutation.mutate({
      type: selectedType,
      entity_id: selectedEntityId
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Studio de Marketing IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Tipo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Sugestão:</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === 'geral' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('geral');
                  setSelectedEntityId('');
                  setSuggestions(null);
                }}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Estratégia Geral
              </Button>
              <Button
                variant={selectedType === 'especializacao' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('especializacao');
                  setSelectedEntityId('');
                  setSuggestions(null);
                }}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Especialização
              </Button>
              <Button
                variant={selectedType === 'post' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('post');
                  setSelectedEntityId('');
                  setSuggestions(null);
                }}
                className="gap-2"
              >
                <Instagram className="w-4 h-4" />
                Post/Blog
              </Button>
            </div>
          </div>

          {/* Seleção de Entidade */}
          {selectedType === 'especializacao' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Selecione a Especialização:</label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {especializacoes?.map((espec) => (
                  <option key={espec.id} value={espec.id}>
                    {espec.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedType === 'post' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Selecione o Post:</label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {posts?.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.titulo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Gerando sugestões...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Sugestões com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugestões Geradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedType === 'geral' && (
              <>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Campanhas de Email
                  </h4>
                  {suggestions.suggestions.campanhas_email?.map((camp, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-md mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{camp.titulo}</p>
                          <p className="text-sm text-gray-600">{camp.descricao}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${camp.titulo}\n\n${camp.descricao}`)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Temas para Webinars/Lives</h4>
                  {suggestions.suggestions.temas_webinars?.map((tema, idx) => (
                    <Badge key={idx} className="mr-2 mb-2" variant="outline">
                      {tema}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ideias para Blog</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.suggestions.ideias_blog?.map((ideia, idx) => (
                      <li key={idx} className="text-sm">{ideia}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Promoções Sazonais</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.suggestions.promocoes?.map((promo, idx) => (
                      <li key={idx} className="text-sm">{promo}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Parcerias Estratégicas</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {suggestions.suggestions.parcerias?.map((parceria, idx) => (
                      <li key={idx} className="text-sm">{parceria}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {selectedType === 'especializacao' && (
              <>
                <div>
                  <h4 className="font-semibold mb-2">Títulos para Posts</h4>
                  {suggestions.suggestions.titulos_posts?.map((titulo, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded-md mb-2 flex justify-between items-center">
                      <span className="text-sm">{titulo}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(titulo)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Posts Completos</h4>
                  {suggestions.suggestions.posts_completos?.map((post, idx) => (
                    <div key={idx} className="bg-green-50 p-3 rounded-md mb-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">{post}</p>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(post)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Assuntos de Email</h4>
                  {suggestions.suggestions.assuntos_email?.map((assunto, idx) => (
                    <Badge key={idx} className="mr-2 mb-2">{assunto}</Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Anúncio Google Ads</h4>
                  <div className="bg-yellow-50 p-3 rounded-md flex justify-between items-start">
                    <p className="text-sm">{suggestions.suggestions.anuncio_google}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(suggestions.suggestions.anuncio_google)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </h4>
                  {suggestions.suggestions.hashtags?.map((tag, idx) => (
                    <Badge key={idx} className="mr-2 mb-2" variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {selectedType === 'post' && (
              <>
                <div>
                  <h4 className="font-semibold mb-2">Títulos Alternativos</h4>
                  {suggestions.suggestions.titulos_alternativos?.map((titulo, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded-md mb-2 flex justify-between items-center">
                      <span className="text-sm">{titulo}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(titulo)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Legendas Instagram</h4>
                  {suggestions.suggestions.legendas_instagram?.map((legenda, idx) => (
                    <div key={idx} className="bg-purple-50 p-3 rounded-md mb-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">{legenda}</p>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(legenda)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tweets</h4>
                  {suggestions.suggestions.tweets?.map((tweet, idx) => (
                    <div key={idx} className="bg-cyan-50 p-2 rounded-md mb-2 flex justify-between items-start">
                      <span className="text-sm">{tweet}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(tweet)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ideia de Stories</h4>
                  <div className="bg-pink-50 p-3 rounded-md">
                    <p className="text-sm">{suggestions.suggestions.ideia_stories}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Hashtags</h4>
                  {suggestions.suggestions.hashtags?.map((tag, idx) => (
                    <Badge key={idx} className="mr-2 mb-2" variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}