import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Star, Upload, Mic, Square, Play, Pause, Send, AlertCircle, ThumbsUp, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage, optimizationPresets, formatFileSize, isImageFile } from '../components/utils/imageOptimization';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

export default function DepoimentosPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    profissao: '',
    vinculo_pos_graduacao: '',
    depoimento_texto: '',
    avaliacao_estrelas: 5,
  });

  const [errors, setErrors] = useState({});
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const { data: depoimentos = [], isLoading } = useQuery({
    queryKey: ['depoimentos-publicos'],
    queryFn: () => base44.entities.Depoimento.list('-created_date'),
  });

  const [reactions, setReactions] = useState({});

  const handleReaction = async (depId, type) => {
    const dep = depoimentos.find(d => d.id === depId);
    if (!dep) return;

    const field = type === 'likes' ? 'reactions_likes' : 'reactions_hearts';
    const newValue = (dep[field] || 0) + 1;

    try {
      await base44.entities.Depoimento.update(depId, { [field]: newValue });
      queryClient.invalidateQueries(['depoimentos-publicos']);
      toast.success(type === 'likes' ? '👍 Obrigado!' : '❤️ Obrigado!');
    } catch (error) {
      console.error('Erro ao registrar reação:', error);
    }
  };

  // SEO: Cálculo de estatísticas
  const seoStats = useMemo(() => {
    if (!depoimentos.length) return null;
    
    const totalRatings = depoimentos.reduce((sum, dep) => sum + (dep.avaliacao_estrelas || 0), 0);
    const avgRating = (totalRatings / depoimentos.length).toFixed(1);
    const reviewCount = depoimentos.length;
    
    return { avgRating, reviewCount };
  }, [depoimentos]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const base44 = (await import('@/api/base44Client')).base44;
      let fotoUrl = null;
      let videoUrl = null;
      let audioUrl = null;

      if (selectedFoto) {
        const fotoResponse = await base44.integrations.Core.UploadFile({ file: selectedFoto });
        fotoUrl = fotoResponse.file_url;
      }

      if (selectedVideo) {
        const videoResponse = await base44.integrations.Core.UploadFile({ file: selectedVideo });
        videoUrl = videoResponse.file_url;
      }

      if (audioBlob) {
        const audioFile = new File([audioBlob], 'depoimento-audio.webm', { type: 'audio/webm' });
        const audioResponse = await base44.integrations.Core.UploadFile({ file: audioFile });
        audioUrl = audioResponse.file_url;
      }

      // Verificar se existe perfil de usuário com este email
      let userProfileId = null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ email: data.email });
        if (profiles.length > 0) {
          userProfileId = profiles[0].id;
        } else {
          // Criar novo perfil
          const newProfile = await base44.entities.UserProfile.create({
            nome: data.nome,
            email: data.email,
            profissao: data.profissao,
            foto_url: fotoUrl,
            total_depoimentos: 1
          });
          userProfileId = newProfile.id;
        }
      } catch (error) {
        console.error('Erro ao gerenciar perfil de usuário:', error);
      }

      const newDepoimento = await base44.entities.Depoimento.create({
        ...data,
        foto_url: fotoUrl,
        depoimento_video_url: videoUrl,
        depoimento_audio_url: audioUrl,
        user_profile_id: userProfileId,
        status: 'Pendente',
      });

      // Enviar notificação para admin
      try {
        await base44.functions.invoke('sendDepoimentoNotification', {
          depoimentoId: newDepoimento.id,
          action: 'new_submission',
          depoimento: newDepoimento
        });
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }

      return newDepoimento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['depoimentos-publicos']);
      toast.success('Depoimento enviado! Aguardando aprovação da coordenação.');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        profissao: '',
        vinculo_pos_graduacao: '',
        depoimento_texto: '',
        avaliacao_estrelas: 5,
      });
      setErrors({});
      setSelectedFoto(null);
      setSelectedVideo(null);
      setAudioBlob(null);
    },
    onError: (error) => {
      toast.error('Erro ao enviar depoimento: ' + error.message);
    },
  });

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'nome':
        if (!value || value.trim().length < 3) {
          error = 'Nome deve ter pelo menos 3 caracteres';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          error = 'Email inválido';
        }
        break;
      case 'profissao':
        if (!value || value.trim().length < 3) {
          error = 'Profissão deve ter pelo menos 3 caracteres';
        }
        break;
      case 'vinculo_pos_graduacao':
        if (!value || value.trim().length < 3) {
          error = 'Vínculo deve ter pelo menos 3 caracteres';
        }
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validação em tempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos os campos obrigatórios
    const newErrors = {};
    ['nome', 'email', 'profissao', 'vinculo_pos_graduacao'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    if (!formData.depoimento_texto && !selectedVideo && !audioBlob) {
      toast.error('Por favor, forneça um depoimento (texto, vídeo ou áudio)');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'foto') {
      if (isImageFile(file)) {
        const originalSize = formatFileSize(file.size);
        toast.info(`Otimizando imagem... (${originalSize})`);
        
        try {
          const optimizedFile = await optimizeImage(file, optimizationPresets.testimonial);
          const newSize = formatFileSize(optimizedFile.size);
          const reduction = Math.round((1 - optimizedFile.size / file.size) * 100);
          
          setSelectedFoto(optimizedFile);
          toast.success(`Imagem otimizada! ${originalSize} → ${newSize} (${reduction}% menor)`);
        } catch (error) {
          toast.error('Erro ao otimizar imagem: ' + error.message);
          setSelectedFoto(file);
        }
      } else {
        setSelectedFoto(file);
      }
    } else if (type === 'video') {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error('Vídeo muito grande! Tamanho máximo: 50MB');
        e.target.value = '';
        return;
      }
      setSelectedVideo(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size > MAX_AUDIO_SIZE) {
          toast.error('Áudio muito grande! Tamanho máximo: 10MB');
          return;
        }
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Gravação iniciada');
    } catch (error) {
      toast.error('Erro ao acessar microfone: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Gravação finalizada');
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Paginação
  const totalPages = Math.ceil(depoimentos.length / itemsPerPage);
  const currentDepoimentos = depoimentos.slice(0, currentPage * itemsPerPage);
  const hasMore = currentPage < totalPages;

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>Depoimentos ESUDA | {seoStats ? `${seoStats.reviewCount} Avaliações` : 'Veja o que nossos alunos dizem'}</title>
        <meta name="description" content={seoStats 
          ? `Leia ${seoStats.reviewCount} depoimentos autênticos de alunos e ex-alunos da ESUDA. Avaliação média: ${seoStats.avgRating}/5 estrelas. Descubra por que somos referência em pós-graduação em Construção Civil.`
          : 'Veja depoimentos de alunos, ex-alunos e professores da ESUDA sobre suas experiências com nossa pós-graduação em Construção Civil.'
        } />
        <meta name="keywords" content="depoimentos esuda, avaliações esuda, reviews construção civil, pós graduação engenharia opiniões, testemunhos alunos esuda" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/DepoimentosPage" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Depoimentos ESUDA | ${seoStats ? `${seoStats.reviewCount} Avaliações Reais` : 'Reviews de Alunos'}`} />
        <meta property="og:description" content={seoStats 
          ? `${seoStats.reviewCount} depoimentos verificados. Avaliação ${seoStats.avgRating}/5⭐`
          : 'Veja avaliações reais de alunos da ESUDA'
        } />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/DepoimentosPage" />
        <meta property="og:image" content="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Depoimentos ESUDA | ${seoStats?.reviewCount || ''} Avaliações`} />
        <meta name="twitter:description" content={seoStats ? `Avaliação média: ${seoStats.avgRating}/5⭐` : 'Reviews de alunos'} />
        
        {/* Schema Markup - Organization & AggregateRating */}
        {seoStats && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "ESUDA - Escola Superior de Desenvolvimento e Aperfeiçoamento",
              "url": "https://posgraduacao-esuda.base44.app",
              "logo": "https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": seoStats.avgRating,
                "reviewCount": seoStats.reviewCount,
                "bestRating": "5",
                "worstRating": "1"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Recife",
                "addressRegion": "PE",
                "addressCountry": "BR"
              }
            })}
          </script>
        )}
        
        {/* Schema Markup - Individual Reviews */}
        {depoimentos.slice(0, 10).map((dep) => (
          <script key={dep.id} type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Review",
              "itemReviewed": {
                "@type": "Course",
                "name": "Pós-Graduação ESUDA",
                "provider": {
                  "@type": "EducationalOrganization",
                  "name": "ESUDA"
                }
              },
              "author": {
                "@type": "Person",
                "name": dep.nome
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": dep.avaliacao_estrelas,
                "bestRating": "5",
                "worstRating": "1"
              },
              "reviewBody": dep.depoimento_texto || "Depoimento em áudio/vídeo",
              "datePublished": dep.created_date
            })}
          </script>
        ))}
      </Helmet>

      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Depoimentos</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Conheça as experiências de quem já faz parte da nossa comunidade acadêmica
          </p>
        </div>

        {/* Formulário de Envio */}
        <Card className="border-2 border-pink-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <CardTitle className="text-2xl text-pink-800">Deixe seu Depoimento</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome" className="text-base font-semibold">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`mt-2 ${errors.nome ? 'border-red-500' : ''}`}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-base font-semibold">
                    Telefone/WhatsApp
                  </Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="mt-2"
                    placeholder="(81) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="profissao" className="text-base font-semibold">
                    Profissão *
                  </Label>
                  <Input
                    id="profissao"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleInputChange}
                    className={`mt-2 ${errors.profissao ? 'border-red-500' : ''}`}
                    placeholder="Sua profissão"
                  />
                  {errors.profissao && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.profissao}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="vinculo_pos_graduacao" className="text-base font-semibold">
                  Vínculo com a Pós-Graduação *
                </Label>
                <Input
                  id="vinculo_pos_graduacao"
                  name="vinculo_pos_graduacao"
                  value={formData.vinculo_pos_graduacao}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.vinculo_pos_graduacao ? 'border-red-500' : ''}`}
                  placeholder="Ex: Aluno(a), Ex-Aluno(a), Professor(a)"
                />
                {errors.vinculo_pos_graduacao && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.vinculo_pos_graduacao}
                  </motion.p>
                )}
              </div>

              <div>
                <Label htmlFor="depoimento_texto" className="text-base font-semibold">
                  Seu Depoimento
                </Label>
                <Textarea
                  id="depoimento_texto"
                  name="depoimento_texto"
                  value={formData.depoimento_texto}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-2"
                  placeholder="Compartilhe sua experiência..."
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Avaliação</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, avaliacao_estrelas: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          formData.avaliacao_estrelas >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Foto (opcional)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'foto')}
                      className="flex-1"
                    />
                    {selectedFoto && <Upload className="w-5 h-5 text-green-600" />}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Vídeo (opcional, máx. 50MB)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="flex-1"
                    />
                    {selectedVideo && <Upload className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">
                  Áudio (opcional, máx. 10MB)
                </Label>
                <div className="flex gap-3">
                  {!isRecording ? (
                    <Button
                      type="button"
                      onClick={startRecording}
                      variant="outline"
                      className="flex-1 border-pink-300 hover:bg-pink-50"
                    >
                      <Mic className="w-5 h-5 mr-2" /> Gravar Áudio
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Square className="w-5 h-5 mr-2" /> Parar Gravação
                    </Button>
                  )}

                  {audioBlob && (
                    <Button
                      type="button"
                      onClick={toggleAudioPlayback}
                      variant="outline"
                      className="flex-1 border-green-300 hover:bg-green-50"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" /> Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" /> Reproduzir
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {audioBlob && (
                  <audio
                    ref={audioPlayerRef}
                    src={URL.createObjectURL(audioBlob)}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-4 text-lg"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Enviar Depoimento
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center italic">
                * Campos obrigatórios | Seu depoimento será publicado após aprovação
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Depoimentos Aprovados */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              O que nossos alunos dizem
            </h2>
            {seoStats && (
              <div className="flex items-center justify-center gap-2 text-lg">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        parseFloat(seoStats.avgRating) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{seoStats.avgRating}</span>
                <span className="text-gray-600">({seoStats.reviewCount} avaliações)</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando depoimentos...</p>
            </div>
          ) : currentDepoimentos.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 italic">
                  Ainda não há depoimentos aprovados. Seja o primeiro a deixar o seu!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {currentDepoimentos.map((dep, index) => (
                    <motion.div
                      key={dep.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200">
                        <CardContent className="p-6">
                          <Link 
                            to={dep.user_profile_id ? `${createPageUrl('UserProfilePage')}?id=${dep.user_profile_id}` : '#'}
                            className={dep.user_profile_id ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              {dep.foto_url ? (
                                <img
                                  src={dep.foto_url}
                                  alt={dep.nome}
                                  loading="lazy"
                                  className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center text-2xl font-bold text-pink-800">
                                  {dep.nome.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 hover:text-pink-600 transition-colors">
                                  {dep.nome}
                                </h3>
                                <p className="text-sm text-gray-600">{dep.profissao}</p>
                                <p className="text-xs text-gray-500">{dep.vinculo_pos_graduacao}</p>
                              </div>
                            </div>
                          </Link>

                          <div className="flex mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  dep.avaliacao_estrelas >= star
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>

                          {dep.depoimento_texto && (
                            <p className="text-gray-700 mb-4 italic text-sm leading-relaxed">
                              "{dep.depoimento_texto}"
                            </p>
                          )}

                          {dep.depoimento_video_url && (
                            <video controls preload="metadata" className="w-full rounded-lg mb-4">
                              <source src={dep.depoimento_video_url} />
                            </video>
                          )}

                          {dep.depoimento_audio_url && (
                            <audio controls preload="metadata" className="w-full mb-4">
                              <source src={dep.depoimento_audio_url} />
                            </audio>
                          )}

                          {/* Sistema de Reações */}
                          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(dep.id, 'likes')}
                              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">Útil</span>
                              {(dep.reactions_likes || 0) > 0 && (
                                <span className="text-xs font-semibold">
                                  ({dep.reactions_likes})
                                </span>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(dep.id, 'hearts')}
                              className="flex items-center gap-2 hover:bg-pink-50 hover:text-pink-600"
                            >
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">Inspirador</span>
                              {(dep.reactions_hearts || 0) > 0 && (
                                <span className="text-xs font-semibold">
                                  ({dep.reactions_hearts})
                                </span>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 px-8 py-3"
                  >
                    Carregar Mais Depoimentos
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <Link to={createPageUrl('CalendarioDeAula')}>
            <Button variant="outline" className="border-gray-300">
              ← Voltar
            </Button>
          </Link>
          <Link to={createPageUrl('Homepage')}>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              Ir para Home →
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}