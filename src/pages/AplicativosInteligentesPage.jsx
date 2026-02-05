import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createPageUrl } from '@/utils';
import { 
  Zap, Building2, Sparkles, Lightbulb, Eye, FileText, Shield, 
  ExternalLink, Newspaper, Image as ImageIcon, ArrowRight, 
  Star, MessageSquare, Send, CheckCircle, Play
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AplicativosInteligentesPage() {
  const queryClient = useQueryClient();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    usuario_nome: '',
    usuario_email: '',
    aplicativo_nome: '',
    avaliacao_estrelas: 5,
    comentario: '',
    aspectos_positivos: '',
    aspectos_melhorar: ''
  });

  const aplicativos = [
    { nome: 'GPO 4.0', categoria: 'Gestão', icon: Zap, gradient: 'from-blue-600 to-indigo-600', badge: 'bg-blue-100 text-blue-800', url: 'https://esuda-gpo.base44.app', descricao: 'Gestão de Projetos e Obras com IA.' },
    { nome: 'Predial 4.0', categoria: 'Manutenção', icon: Building2, gradient: 'from-purple-600 to-pink-600', badge: 'bg-purple-100 text-purple-800', url: 'https://esuda-predial.base44.app', descricao: 'Plano Interativo de Manutenção Predial.' },
    { nome: 'EngenhariaPro AI', categoria: 'Assistente', icon: Sparkles, gradient: 'from-green-600 to-emerald-600', badge: 'bg-green-100 text-green-800', url: 'https://promptdomestre.base44.app', descricao: '500 prompts e assistência técnica.' },
    { nome: 'InteriorOS', categoria: 'Design', icon: Lightbulb, gradient: 'from-orange-600 to-red-600', badge: 'bg-orange-100 text-orange-800', url: 'https://interior-ia.base44.app', descricao: 'Design de Interiores com IA.' },
    { nome: 'Vistoria Cautelar Pro', categoria: 'Vistoria', icon: Shield, gradient: 'from-teal-600 to-cyan-600', badge: 'bg-teal-100 text-teal-800', url: 'https://vistoria-cautelar-pro-34e39a54.base44.app', descricao: 'Laudos de Vizinhança.' },
    { nome: 'SmartVisto', categoria: 'Vistoria', icon: Eye, gradient: 'from-pink-600 to-rose-600', badge: 'bg-pink-100 text-pink-800', url: 'https://smart-visto-vistorias-inteligentes-6f115f68.base44.app', descricao: 'Recebimento de Imóveis.' },
    { nome: 'Amorim Responde', categoria: 'Assistente', icon: Building2, gradient: 'from-indigo-600 to-purple-600', badge: 'bg-indigo-100 text-indigo-800', url: 'https://amorim-responde-manutencao-predial-afd5910a.base44.app', descricao: 'Tire dúvidas técnicas.' },
    { nome: 'LaudoAcess Pro', categoria: 'Laudos', icon: FileText, gradient: 'from-yellow-600 to-amber-600', badge: 'bg-yellow-100 text-yellow-800', url: 'https://amorimtech-acessibilidade.base44.app', descricao: 'Laudos de Acessibilidade.' },
    { nome: 'Gestor Predial 4.0', categoria: 'Gestão Pública', icon: Building2, gradient: 'from-cyan-600 to-blue-600', badge: 'bg-cyan-100 text-cyan-800', url: 'https://gestorpredial-amorimtech.base44.app', descricao: 'CMMS para Órgãos Públicos.' },
    { nome: 'InspeçãoIA', categoria: 'Inspeção', icon: Shield, gradient: 'from-slate-600 to-gray-700', badge: 'bg-slate-100 text-slate-800', url: 'https://laudo-de-inspecao.base44.app', descricao: 'Inspeção Predial Inteligente.' },
    { nome: 'Avalia Predial ESUDA', categoria: 'Educação', icon: FileText, gradient: 'from-red-600 to-pink-600', badge: 'bg-red-100 text-red-800', url: 'https://avalia-predial-esuda.base44.app', descricao: 'Feedback e Planos de Estudo.' },
    { nome: 'Licitações 4.0 - Assistente Virtual', categoria: 'Licitações', icon: FileText, gradient: 'from-emerald-600 to-teal-600', badge: 'bg-emerald-100 text-emerald-800', url: 'https://licitacoesia.base44.app', descricao: 'Otimize seus processos de licitação com inteligência artificial. Garantir conformidade documental, maximizar oportunidades e aumentar seus contratos públicos.' }
  ];

  // --- QUERIES ---
  const { data: noticias = [] } = useQuery({
    queryKey: ['aplicativo-noticias-public'],
    queryFn: () => base44.entities.AplicativoNoticia.list('-data_publicacao', 10)
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['aplicativo-feedbacks-public'],
    queryFn: () => base44.entities.AplicativoFeedback.list('-created_date', 20)
  });

  const { data: midias = [] } = useQuery({
    queryKey: ['aplicativo-midias-public'],
    queryFn: () => base44.entities.AplicativoMidia.list('ordem', 6)
  });

  // Filtrar dados
  const noticiasDestaque = noticias.filter(n => n.destaque).slice(0, 3);
  const outrasNoticias = noticias.filter(n => !n.destaque).slice(0, 6);
  const feedbacksAprovados = feedbacks.filter(f => f.aprovado).slice(0, 6);

  // --- MUTATION FEEDBACK ---
  const createFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      const feedback = await base44.entities.AplicativoFeedback.create({
        ...data,
        aprovado: false 
      });
      return feedback;
    },
    onSuccess: () => {
      toast.success('Feedback enviado! Aguardando moderação.');
      setShowFeedbackForm(false);
      setFeedbackForm({
        usuario_nome: '',
        usuario_email: '',
        aplicativo_nome: '',
        avaliacao_estrelas: 5,
        comentario: '',
        aspectos_positivos: '',
        aspectos_melhorar: ''
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao enviar feedback. Tente novamente.');
    }
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if(!feedbackForm.usuario_nome || !feedbackForm.aplicativo_nome || !feedbackForm.comentario) {
      toast.warning('Preencha os campos obrigatórios');
      return;
    }
    createFeedbackMutation.mutate(feedbackForm);
  };

  return (
    <>
      <Helmet>
        <title>Aplicativos Inteligentes ESUDA | Inovação na Construção Civil</title>
        <meta name="description" content="Conheça os aplicativos inteligentes desenvolvidos pelo coordenador da ESUDA. Ferramentas com IA para gestão de obras, manutenção predial, vistorias e mais." />
      </Helmet>

      <div className="space-y-16 pb-12">
        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1 text-sm rounded-full">
            Tecnologia & Inovação
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Ecossistema de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Aplicativos Inteligentes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma suíte completa de ferramentas potencializadas por IA, desenvolvidas exclusivamente para transformar a engenharia e gestão na construção civil.
          </p>
        </div>

        {/* --- SEÇÃO 1: NOTÍCIAS --- */}
        {(noticiasDestaque.length > 0 || outrasNoticias.length > 0) && (
          <section className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Newspaper className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Novidades e Atualizações</h2>
                  <p className="text-sm text-gray-500">Acompanhe a evolução das nossas ferramentas</p>
                </div>
              </div>
            </div>

            {/* Destaques */}
            {noticiasDestaque.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {noticiasDestaque.map((noticia) => (
                  <Card key={noticia.id} className="border-l-4 border-l-yellow-400 shadow-md hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-5">
                      {noticia.imagem_destaque && (
                        <div className="mb-4 rounded-lg overflow-hidden h-40">
                          <img src={noticia.imagem_destaque} alt={noticia.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <div className="flex gap-2 mb-3">
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">{noticia.aplicativo_nome}</Badge>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">{noticia.tipo}</Badge>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{noticia.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{noticia.descricao}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400">{new Date(noticia.data_publicacao).toLocaleDateString('pt-BR')}</span>
                        {noticia.conteudo_completo && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="text-blue-600 p-0 h-auto font-semibold">Ler tudo</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{noticia.titulo}</DialogTitle>
                                <div className="flex gap-2 mt-2">
                                  <Badge>{noticia.aplicativo_nome}</Badge>
                                  <span className="text-sm text-gray-500">{new Date(noticia.data_publicacao).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </DialogHeader>
                              <div className="prose prose-sm max-w-none mt-4">
                                <ReactMarkdown>{noticia.conteudo_completo}</ReactMarkdown>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- SEÇÃO 2: GALERIA --- */}
        {midias.length > 0 && (
          <section>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="bg-purple-100 p-2 rounded-lg">
                      <ImageIcon className="w-6 h-6 text-purple-700" />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">Galeria em Destaque</h2>
                </div>
                <Link to={createPageUrl('GaleriaMidiasAplicativos')}>
                  <Button variant="ghost" className="text-purple-700 hover:bg-purple-50 group">
                    Ver Galeria Completa <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {midias.map((midia) => (
                  <div key={midia.id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 aspect-square bg-gray-100">
                    {midia.tipo_midia === 'imagem' ? (
                      <img src={midia.url_midia} alt={midia.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                         <Play className="w-8 h-8 text-white opacity-80" />
                         <video src={midia.url_midia} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-bold line-clamp-2">{midia.titulo}</p>
                      <span className="text-[10px] text-gray-300">{midia.aplicativo_nome}</span>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* --- SEÇÃO 3: LISTA DE APLICATIVOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aplicativos.map((app, index) => {
            const Icon = app.icon;
            return (
              <a key={index} href={app.url} target="_blank" rel="noopener noreferrer" className="group">
                <Card className="h-full border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${app.gradient} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4 relative z-10">
                      <div className={`bg-gradient-to-br ${app.gradient} p-3 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-shadow`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {app.nome}
                        </h3>
                        <Badge className={`${app.badge} text-xs`}>{app.categoria}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 h-12 line-clamp-2">
                      {app.descricao}
                    </p>
                    
                    <Button className="w-full bg-gray-900 text-white hover:bg-blue-600 transition-colors">
                      Acessar Agora
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* --- SEÇÃO 4: FEEDBACKS --- */}
        <section className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200">
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">O que dizem os usuários</h2>
                <p className="text-slate-600">Feedback real da nossa comunidade de engenheiros e arquitetos</p>
              </div>
              
              <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    <MessageSquare className="w-4 h-4 mr-2" /> Avaliar um App
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Envie sua Avaliação</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Seu Nome *</Label>
                        <Input 
                          value={feedbackForm.usuario_nome}
                          onChange={e => setFeedbackForm({...feedbackForm, usuario_nome: e.target.value})}
                          placeholder="Ex: João Silva"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                         <Label>Email (Opcional)</Label>
                         <Input 
                           type="email"
                           value={feedbackForm.usuario_email}
                           onChange={e => setFeedbackForm({...feedbackForm, usuario_email: e.target.value})}
                           placeholder="contato@..."
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Qual aplicativo você usou? *</Label>
                       <Select 
                          value={feedbackForm.aplicativo_nome} 
                          onValueChange={v => setFeedbackForm({...feedbackForm, aplicativo_nome: v})}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Selecione..." />
                         </SelectTrigger>
                         <SelectContent>
                           {aplicativos.map(app => (
                             <SelectItem key={app.nome} value={app.nome}>{app.nome}</SelectItem>
                           ))}
                           <SelectItem value="Geral">Avaliação Geral</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label>Nota (1 a 5) *</Label>
                       <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button
                             type="button"
                             key={star}
                             onClick={() => setFeedbackForm({...feedbackForm, avaliacao_estrelas: star})}
                             className="focus:outline-none"
                           >
                             <Star 
                               className={`w-8 h-8 ${feedbackForm.avaliacao_estrelas >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                             />
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Seu Comentário *</Label>
                      <Textarea 
                         value={feedbackForm.comentario}
                         onChange={e => setFeedbackForm({...feedbackForm, comentario: e.target.value})}
                         placeholder="Conte sua experiência..."
                         rows={3}
                         required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-green-700">Pontos Positivos</Label>
                          <Input 
                             className="border-green-200 bg-green-50"
                             value={feedbackForm.aspectos_positivos}
                             onChange={e => setFeedbackForm({...feedbackForm, aspectos_positivos: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-orange-700">A Melhorar</Label>
                          <Input 
                             className="border-orange-200 bg-orange-50"
                             value={feedbackForm.aspectos_melhorar}
                             onChange={e => setFeedbackForm({...feedbackForm, aspectos_melhorar: e.target.value})}
                          />
                       </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createFeedbackMutation.isPending}>
                       {createFeedbackMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
           </div>

           {feedbacksAprovados.length === 0 ? (
             <div className="text-center text-gray-500 py-8 italic">
               Seja o primeiro a avaliar nossos aplicativos!
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {feedbacksAprovados.map((fb, idx) => (
                 <Card key={idx} className="bg-white border-none shadow-sm">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h4 className="font-bold text-gray-900">{fb.usuario_nome}</h4>
                         <Badge variant="secondary" className="mt-1 text-xs">{fb.aplicativo_nome}</Badge>
                       </div>
                       <div className="flex">
                         {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             className={`w-3 h-3 ${i < fb.avaliacao_estrelas ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                           />
                         ))}
                       </div>
                     </div>
                     <p className="text-gray-600 text-sm italic mb-4">"{fb.comentario}"</p>
                     
                     {(fb.aspectos_positivos || fb.aspectos_melhorar) && (
                       <div className="space-y-2 pt-3 border-t border-gray-100">
                         {fb.aspectos_positivos && (
                           <div className="flex items-start gap-2 text-xs text-green-700">
                             <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> {fb.aspectos_positivos}
                           </div>
                         )}
                         {fb.aspectos_melhorar && (
                           <div className="flex items-start gap-2 text-xs text-orange-700">
                             <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" /> {fb.aspectos_melhorar}
                           </div>
                         )}
                       </div>
                     )}

                     {fb.resposta_coordenador && (
                       <div className="mt-4 bg-blue-50 p-3 rounded-lg text-xs">
                         <span className="font-bold text-blue-800 block mb-1">Resposta do Coordenador:</span>
                         <span className="text-blue-700">{fb.resposta_coordenador}</span>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </section>

        {/* CTA Final */}
        <div className="bg-slate-900 rounded-2xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Pronto para inovar na sua gestão?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Nossas ferramentas são gratuitas para alunos da Pós-Graduação ESUDA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('EspecializacoesPage')}>
                <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold shadow-lg shadow-green-500/30">
                  Conhecer Cursos
                </Button>
              </Link>
              <Link to={createPageUrl('Homepage')}>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  Voltar para Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}