import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { User, Save, Upload, Briefcase, Edit, MessageCircle, Linkedin, Instagram, BookOpen, Globe, Mail, GraduationCap, Building2, User as UserIcon, Award, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseRecommendations from '../components/student/CourseRecommendations';
import NavigationAssistant from '../components/student/NavigationAssistant';

export default function MeuPerfilDiscente() {
  const [user, setUser] = useState(null);
  const [discente, setDiscente] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    cargo_atual: '',
    empresa: '',
    status_carreira: '',
    sobre: '',
    tags_competencia: [],
    foto_url: '',
    instagram: '',
    linkedin: '',
    lattes: '',
    site: '',
    whatsapp: ''
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Buscar usuário logado
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        toast.error('Você precisa estar logado para acessar esta página.');
      }
    }
    fetchUser();
  }, []);

  // Buscar perfil do discente baseado no email do usuário logado
  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list(),
    enabled: !!user
  });

  useEffect(() => {
    if (user && discentes.length > 0) {
      const meuPerfil = discentes.find(d => d.email === user.email);
      if (meuPerfil) {
        setDiscente(meuPerfil);
        setFormData({
          titulo: meuPerfil.titulo || '',
          cargo_atual: meuPerfil.cargo_atual || '',
          empresa: meuPerfil.empresa || '',
          status_carreira: meuPerfil.status_carreira || '',
          sobre: meuPerfil.sobre || '',
          tags_competencia: meuPerfil.tags_competencia || [],
          foto_url: meuPerfil.foto_url || '',
          instagram: meuPerfil.instagram || '',
          linkedin: meuPerfil.linkedin || '',
          lattes: meuPerfil.lattes || '',
          site: meuPerfil.site || '',
          whatsapp: meuPerfil.whatsapp || ''
        });
      }
    }
  }, [user, discentes]);

  // Buscar especializações (ANTES dos returns condicionais)
  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Discente.update(discente.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_url: file_url });
      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!discente) {
    return (
      <Card className="bg-yellow-50 border-2 border-yellow-300">
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Perfil Não Encontrado</h2>
          <p className="text-gray-700">
            Seu email <strong>{user.email}</strong> ainda não foi cadastrado como discente.
            Entre em contato com a coordenação para solicitar seu cadastro.
          </p>
        </CardContent>
      </Card>
    );
  }

  const perfilIncompleto = !discente.sobre && !discente.foto_url && !discente.cargo_atual;

  // Auto-abrir edição se perfil incompleto no primeiro acesso
  React.useEffect(() => {
    if (perfilIncompleto && !isEditing) {
      setIsEditing(true);
    }
  }, [perfilIncompleto]);

  const minhasEspecializacoes = (discente.especializacoes || [])
    .map(id => especializacoes.find(e => e.id === id))
    .filter(Boolean);

  const especializacoesCursadas = minhasEspecializacoes;

  return (
    <>
      <Helmet>
        <title>{discente.nome} | Perfil ESUDA</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner de boas-vindas para perfil incompleto */}
        {perfilIncompleto && (
          <Card className="bg-gradient-to-r from-green-600 to-teal-600 border-0 text-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="text-3xl">🎓</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Bem-vindo(a) à comunidade ESUDA, {discente.nome.split(' ')[0]}!</h3>
                <p className="text-green-100 text-sm mt-1">
                  Você foi matriculado(a) na <strong>Turma {discente.numero_turma}</strong>. 
                  Complete seu perfil abaixo para ser encontrado(a) pelos colegas e parceiros.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Header do Perfil - Estilo LinkedIn */}
        <Card className="relative overflow-hidden border-2 border-green-300">
          {/* Banner Superior */}
          <div className="h-32 bg-gradient-to-r from-green-600 via-blue-600 to-teal-600" />
          
          {/* Área do Avatar e Info Principal */}
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                {formData.foto_url ? (
                  <img
                    src={formData.foto_url}
                    alt={discente.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Nome e Info Principal */}
              <div className="flex-1 mt-16 md:mt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{discente.nome}</h1>
                    <p className="text-lg text-gray-700 mt-1">{formData.titulo || 'Aluno(a) ESUDA'}</p>
                    {formData.cargo_atual && formData.empresa && (
                      <p className="text-gray-600 mt-1">
                        {formData.cargo_atual} na {formData.empresa}
                      </p>
                    )}
                    {formData.status_carreira && (
                      <Badge className={`mt-2 ${
                        formData.status_carreira === 'Open to Work' ? 'bg-green-600 text-white' :
                        formData.status_carreira === 'Contratado' ? 'bg-blue-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {formData.status_carreira === 'Open to Work' ? '🟢' : 
                         formData.status_carreira === 'Contratado' ? '🔵' : '🟣'} {formData.status_carreira}
                      </Badge>
                    )}
                  </div>
                  {user && discente.email === user.email && (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "outline" : "default"}
                      className={isEditing ? "" : "bg-green-600 hover:bg-green-700"}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {discente.numero_turma && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Turma {discente.numero_turma}
                    </Badge>
                  )}
                  {minhasEspecializacoes.map(espec => (
                    <Badge key={espec.id} className="bg-green-100 text-green-800 border-green-300">
                      {espec.nome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Conexão Rápida */}
        {!isEditing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formData.whatsapp && (
              <a href={`https://wa.me/${formData.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </a>
            )}
            {formData.linkedin && (
              <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </a>
            )}
            {formData.lattes && (
              <a href={formData.lattes} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lattes
                </Button>
              </a>
            )}
            {formData.site && (
              <a href={formData.site} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  Portfólio
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Formulário de Edição */}
        {isEditing && (
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-blue-50">
              <CardTitle>Editar Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título/Formação</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Engenheiro Civil, Arquiteta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status de Carreira</label>
                <Select 
                  value={formData.status_carreira} 
                  onValueChange={(v) => setFormData({ ...formData, status_carreira: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    <SelectItem value="Open to Work">🟢 Open to Work</SelectItem>
                    <SelectItem value="Contratado">🔵 Contratado</SelectItem>
                    <SelectItem value="Freelancer">🟣 Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobre Você (Bio Profissional)</label>
                <Textarea
                  value={formData.sobre}
                  onChange={(e) => setFormData({ ...formData, sobre: e.target.value })}
                  rows={4}
                  placeholder="Conte um pouco sobre sua trajetória profissional, experiências e objetivos..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Atual</label>
                  <Input
                    value={formData.cargo_atual}
                    onChange={(e) => setFormData({ ...formData, cargo_atual: e.target.value })}
                    placeholder="Ex: Coordenador BIM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <Input
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Ex: Construtora XYZ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Ex: 5581999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competências Técnicas (separadas por vírgula)
                </label>
                <Input
                  value={formData.tags_competencia.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags_competencia: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="Ex: BIM, Revit, MS Project, Lean Construction"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/seuperfil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/seuperfil"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currículo Lattes</label>
                  <Input
                    value={formData.lattes}
                    onChange={(e) => setFormData({ ...formData, lattes: e.target.value })}
                    placeholder="http://lattes.cnpq.br/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site/Portfólio</label>
                  <Input
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      titulo: discente.titulo || '',
                      cargo_atual: discente.cargo_atual || '',
                      empresa: discente.empresa || '',
                      tags_competencia: discente.tags_competencia || [],
                      foto_url: discente.foto_url || '',
                      instagram: discente.instagram || '',
                      linkedin: discente.linkedin || '',
                      lattes: discente.lattes || '',
                      site: discente.site || '',
                      whatsapp: discente.whatsapp || ''
                    });
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sobre */}
        {!isEditing && formData.sobre && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-700" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                {formData.sobre}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Experiência Profissional */}
        {!isEditing && (formData.cargo_atual || formData.empresa) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-700" />
                Experiência Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{formData.cargo_atual}</h3>
                  <p className="text-gray-600">{formData.empresa}</p>
                  <p className="text-sm text-gray-500 mt-1">Atualmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competências */}
        {!isEditing && formData.tags_competencia.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-700" />
                Competências Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.tags_competencia.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formação Acadêmica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-700" />
              Formação Acadêmica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-12 h-12 flex-shrink-0">
                  <img 
                    src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png" 
                    alt="ESUDA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">ESUDA</h3>
                  <p className="text-gray-600">Faculdade ESUDA</p>
                  {minhasEspecializacoes.map(espec => (
                    <p key={espec.id} className="text-sm text-gray-700">Pós-Graduação em {espec.nome}</p>
                  ))}
                  {discente.numero_turma && (
                    <p className="text-sm text-gray-500 mt-1">Turma {discente.numero_turma}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                ℹ️ As informações de formação acadêmica são gerenciadas pela coordenação.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-700" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {discente.email}
                </p>
                {formData.whatsapp && (
                  <p className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    {formData.whatsapp}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <NavigationAssistant />
    </>
  );
}