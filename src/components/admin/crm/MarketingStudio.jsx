import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Download, Image as ImageIcon, Mail, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MarketingStudio({ inscritos }) {
  const [activeStudio, setActiveStudio] = useState('texto');
  const [prompt, setPrompt] = useState('');
  const [tipo, setTipo] = useState('email');
  const [conteudoGerado, setConteudoGerado] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [campanhaForm, setCampanhaForm] = useState({
    nome: '',
    assunto: ''
  });

  const handleGerarTexto = async () => {
    if (!prompt) {
      toast.error('Digite um prompt');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateMarketingContent', {
        prompt,
        tipo,
        contexto: {
          total_leads: inscritos.length,
          cursos_disponiveis: [...new Set(inscritos.map(i => i.nome_curso))]
        }
      });

      if (data.success) {
        setConteudoGerado(data.content);
        toast.success('Conteúdo gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar conteúdo');
      }
    } catch (error) {
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarImagem = async () => {
    if (!prompt) {
      toast.error('Digite um prompt');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateCampaignImage', {
        prompt
      });

      if (data.success) {
        setImagemUrl(data.image_url);
        toast.success('Imagem gerada com sucesso!');
      } else {
        toast.error('Erro ao gerar imagem');
      }
    } catch (error) {
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarCampanha = async () => {
    if (!campanhaForm.nome || !conteudoGerado) {
      toast.error('Preencha o nome da campanha e gere o conteúdo');
      return;
    }

    try {
      await base44.entities.CampanhaMarketing.create({
        nome_campanha: campanhaForm.nome,
        tipo: tipo === 'email' ? 'Email' : 'WhatsApp',
        assunto_email: tipo === 'email' ? campanhaForm.assunto : '',
        conteudo_texto: conteudoGerado,
        imagem_url: imagemUrl,
        prompt_ia_texto: prompt,
        status: 'Rascunho',
        total_destinatarios: inscritos.length
      });

      toast.success('Campanha salva como rascunho!');
      setConteudoGerado('');
      setImagemUrl('');
      setPrompt('');
      setCampanhaForm({ nome: '', assunto: '' });
    } catch (error) {
      toast.error('Erro ao salvar campanha');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button
          onClick={() => setActiveStudio('texto')}
          variant={activeStudio === 'texto' ? 'default' : 'outline'}
          className={activeStudio === 'texto' ? 'bg-blue-600' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Texto
        </Button>
        <Button
          onClick={() => setActiveStudio('imagem')}
          variant={activeStudio === 'imagem' ? 'default' : 'outline'}
          className={activeStudio === 'imagem' ? 'bg-purple-600' : ''}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Gerar Imagem
        </Button>
      </div>

      {activeStudio === 'texto' && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Studio de Textos com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Mensagem</label>
              <div className="flex gap-3">
                <Button
                  onClick={() => setTipo('email')}
                  variant={tipo === 'email' ? 'default' : 'outline'}
                  size="sm"
                  className={tipo === 'email' ? 'bg-blue-600' : ''}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => setTipo('whatsapp')}
                  variant={tipo === 'whatsapp' ? 'default' : 'outline'}
                  size="sm"
                  className={tipo === 'whatsapp' ? 'bg-green-600' : ''}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Prompt para IA</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Ex: Crie um email promocional para divulgar o curso de Gestão de Projetos e Obras, destacando os diferenciais e oferecendo 10% de desconto..."
              />
            </div>

            <Button
              onClick={handleGerarTexto}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar {tipo === 'email' ? 'Email' : 'Mensagem WhatsApp'}
                </>
              )}
            </Button>

            {conteudoGerado && (
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-gray-800 mb-3">Conteúdo Gerado:</h4>
                <Textarea
                  value={conteudoGerado}
                  onChange={(e) => setConteudoGerado(e.target.value)}
                  rows={10}
                  className="mb-3"
                />
                
                <div className="space-y-3 border-t pt-3">
                  <Input
                    placeholder="Nome da Campanha"
                    value={campanhaForm.nome}
                    onChange={(e) => setCampanhaForm({...campanhaForm, nome: e.target.value})}
                  />
                  {tipo === 'email' && (
                    <Input
                      placeholder="Assunto do Email"
                      value={campanhaForm.assunto}
                      onChange={(e) => setCampanhaForm({...campanhaForm, assunto: e.target.value})}
                    />
                  )}
                  <Button onClick={handleSalvarCampanha} className="w-full bg-green-600">
                    Salvar como Rascunho
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeStudio === 'imagem' && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Studio de Imagens com IA (DALL-E 3)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Descrição da Imagem</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Ex: Crie uma imagem profissional mostrando engenheiros usando BIM em um canteiro de obras moderno, com destaque para tecnologia e inovação..."
              />
            </div>

            <Button
              onClick={handleGerarImagem}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando imagem... (10-15 segundos)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Imagem com DALL-E 3
                </>
              )}
            </Button>

            {imagemUrl && (
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <h4 className="font-bold text-gray-800 mb-3">Imagem Gerada:</h4>
                <img src={imagemUrl} alt="Gerada pela IA" className="w-full rounded-lg mb-3" />
                <a href={imagemUrl} download target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Imagem
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}