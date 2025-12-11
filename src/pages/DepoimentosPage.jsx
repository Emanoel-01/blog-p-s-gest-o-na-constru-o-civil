import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star, UserCircle, Mic, Video, Camera, Plus } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function DepoimentosPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    profissao: '',
    vinculo_pos_graduacao: '',
    depoimento_texto: '',
    foto_file: null,
    video_file: null,
    audio_file: null,
    avaliacao_estrelas: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const { data: depoimentos = [], isLoading } = useQuery({
    queryKey: ['depoimentos'],
    queryFn: () => base44.entities.Depoimento.filter({ status: 'Aprovado' }, '-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { foto_file, video_file, audio_file, ...depoimentoData } = data;
      const uploadedUrls = {};

      if (foto_file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: foto_file });
        uploadedUrls.foto_url = file_url;
      }
      if (video_file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: video_file });
        uploadedUrls.depoimento_video_url = file_url;
      }
      if (audio_file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: audio_file });
        uploadedUrls.depoimento_audio_url = file_url;
      }

      return base44.entities.Depoimento.create({ ...depoimentoData, ...uploadedUrls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['depoimentos']);
      toast.success('Depoimento enviado! Será publicado após moderação.');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        profissao: '',
        vinculo_pos_graduacao: '',
        depoimento_texto: '',
        foto_file: null,
        video_file: null,
        audio_file: null,
        avaliacao_estrelas: 0,
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileType) => {
    setFormData((prev) => ({ ...prev, [fileType]: e.target.files[0] }));
  };

  const handleRatingChange = (stars) => {
    setFormData((prev) => ({ ...prev, avaliacao_estrelas: stars }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];
      audioRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      audioRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setFormData((prev) => ({ ...prev, audio_file: audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };
      audioRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Gravação iniciada...');
    } catch (err) {
      toast.error('Erro ao acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Gravação finalizada.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!formData.nome || !formData.email || !formData.profissao || !formData.vinculo_pos_graduacao) {
      toast.error('Preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <>
      <Helmet>
        <title>Depoimentos ESUDA | Avaliações de Alunos da Pós-Graduação em Construção Civil</title>
        <meta name="description" content="Leia depoimentos reais de alunos e ex-alunos da pós-graduação ESUDA em Construção Civil. Compartilhe sua experiência e inspire futuros profissionais." />
        <meta name="keywords" content="depoimentos ESUDA, avaliações pós-graduação, opinião alunos, reviews construção civil, testemunhos ESUDA" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/DepoimentosPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Depoimentos ESUDA | O que dizem nossos alunos" />
        <meta property="og:description" content="Conheça as experiências reais de quem fez a pós-graduação ESUDA em Construção Civil." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/DepoimentosPage" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Depoimentos de Alunos ESUDA",
            "description": "Avaliações e depoimentos de alunos da pós-graduação ESUDA",
            "itemListElement": depoimentos.slice(0, 5).map((dep, index) => ({
              "@type": "Review",
              "position": index + 1,
              "author": {
                "@type": "Person",
                "name": dep.nome
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": dep.avaliacao_estrelas,
                "bestRating": 5
              },
              "reviewBody": dep.depoimento_texto,
              "itemReviewed": {
                "@type": "EducationalOrganization",
                "name": "ESUDA - Pós-Graduação em Construção Civil"
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="px-2 sm:px-0">
        <Breadcrumb />
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Deixe seu Depoimento
          </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto">
          Sua opinião é importante. Compartilhe sua experiência e inspire futuros alunos.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto mb-8 p-4 sm:p-6 border-2 border-green-600 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold text-green-700">Compartilhe sua Experiência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
                <Input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp</Label>
              <Input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profissao">Profissão <span className="text-red-500">*</span></Label>
                <Input type="text" id="profissao" name="profissao" value={formData.profissao} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="vinculo_pos_graduacao">Vínculo <span className="text-red-500">*</span></Label>
                <Input type="text" id="vinculo_pos_graduacao" name="vinculo_pos_graduacao" placeholder="Ex: Aluno, Professor..." value={formData.vinculo_pos_graduacao} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="depoimento_texto">Seu Depoimento</Label>
              <Textarea id="depoimento_texto" name="depoimento_texto" value={formData.depoimento_texto} onChange={handleChange} rows={5} />
            </div>

            <div>
              <Label>Avaliação (1-5 Estrelas)</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${formData.avaliacao_estrelas >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleRatingChange(star)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="foto_file" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Foto
                </Label>
                <Input type="file" id="foto_file" onChange={(e) => handleFileChange(e, 'foto_file')} accept="image/*" />
                {formData.foto_file && <span className="text-xs text-gray-500">{formData.foto_file.name}</span>}
              </div>
              <div>
                <Label htmlFor="video_file" className="flex items-center gap-2">
                  <Video className="w-4 h-4" /> Vídeo
                </Label>
                <Input type="file" id="video_file" onChange={(e) => handleFileChange(e, 'video_file')} accept="video/*" />
                {formData.video_file && <span className="text-xs text-gray-500">{formData.video_file.name}</span>}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Áudio
                </Label>
                <div className="flex gap-2">
                  <Button type="button" onClick={isRecording ? stopRecording : startRecording} variant="outline" size="sm">
                    {isRecording ? 'Parar' : 'Gravar'}
                  </Button>
                  <Input type="file" id="audio_file" onChange={(e) => handleFileChange(e, 'audio_file')} accept="audio/*" />
                </div>
                {formData.audio_file && <span className="text-xs text-gray-500">Áudio gravado</span>}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              * Email e telefone não serão divulgados publicamente.
            </p>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Enviar Depoimento
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
        Depoimentos
      </h2>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
        </div>
      ) : depoimentos.length === 0 ? (
        <Card className="max-w-3xl mx-auto bg-gray-50 p-6 text-center">
          <p className="text-gray-500 italic">Seja o primeiro a compartilhar!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {depoimentos.map((dep) => (
            <Card key={dep.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {dep.foto_url ? (
                    <img src={dep.foto_url} alt={dep.nome} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-green-500" />
                  ) : (
                    <UserCircle className="w-12 h-12 text-gray-400 mr-4" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{dep.nome}</h3>
                    <p className="text-sm text-gray-600">{dep.profissao} - {dep.vinculo_pos_graduacao}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${dep.avaliacao_estrelas >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>

                {dep.depoimento_texto && (
                  <p className="text-gray-700 leading-relaxed mb-4 italic">"{dep.depoimento_texto}"</p>
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
          ))}
        </div>
      )}
      
      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('EmAcaoPage')}>
          <Button variant="outline">← Voltar</Button>
        </Link>
        <Link to={createPageUrl('CalendarioDeAula')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700">Calendário →</Button>
        </Link>
      </div>
    </div>
    </>
  );
}