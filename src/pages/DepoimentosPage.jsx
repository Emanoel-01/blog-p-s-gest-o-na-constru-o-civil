import React, { useState, useRef } from 'react';
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
import { Star, Upload, Mic, Square, Play, Pause, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

  const createMutation = useMutation({
    mutationFn: async (data) => {
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

      return base44.entities.Depoimento.create({
        ...data,
        foto_url: fotoUrl,
        depoimento_video_url: videoUrl,
        depoimento_audio_url: audioUrl,
        status: 'Pendente',
      });
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'foto') {
      setSelectedFoto(file);
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
        <title>Depoimentos ESUDA | Veja o que nossos alunos dizem</title>
        <meta name="description" content="Veja depoimentos de alunos, ex-alunos e professores da ESUDA sobre suas experiências com nossa pós-graduação em Construção Civil." />
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            O que nossos alunos dizem
          </h2>

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
                          <div className="flex items-center gap-4 mb-4">
                            {dep.foto_url ? (
                              <img
                                src={dep.foto_url}
                                alt={dep.nome}
                                className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center text-2xl font-bold text-pink-800">
                                {dep.nome.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{dep.nome}</h3>
                              <p className="text-sm text-gray-600">{dep.profissao}</p>
                              <p className="text-xs text-gray-500">{dep.vinculo_pos_graduacao}</p>
                            </div>
                          </div>

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
                            <video controls className="w-full rounded-lg mb-4">
                              <source src={dep.depoimento_video_url} />
                            </video>
                          )}

                          {dep.depoimento_audio_url && (
                            <audio controls className="w-full mb-4">
                              <source src={dep.depoimento_audio_url} />
                            </audio>
                          )}
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