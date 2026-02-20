import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, User, Briefcase, Link as LinkIcon, Upload, Edit, Award, BookOpen, Instagram, Linkedin, Globe, Mail, GraduationCap, Book, LayoutDashboard } from 'lucide-react';
import PainelDocente from '@/components/docente/PainelDocente';

export default function MeuPerfilDocente() {
  const [user, setUser] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('painel');
  const [formData, setFormData] = useState({
    foto_url: '',
    mini_bio: '',
    instagram: '',
    linkedin: '',
    lattes: '',
    site: ''
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem'),
    enabled: !!professor
  });

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allProfessores = await base44.entities.Professor.list();
        const myProfile = allProfessores.find(p => p.email === currentUser.email);

        if (myProfile) {
          setProfessor(myProfile);
          setFormData({
            foto_url: myProfile.foto_url || '',
            mini_bio: myProfile.mini_bio || '',
            instagram: myProfile.instagram || '',
            linkedin: myProfile.linkedin || '',
            lattes: myProfile.lattes || '',
            site: myProfile.site || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUserAndProfile();
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Professor.update(professor.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['professores']);
      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
      setProfessor({ ...professor, ...formData });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_url: file_url });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Helmet>
          <title>Perfil Não Encontrado | ESUDA</title>
        </Helmet>
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil de Docente Não Encontrado</h2>
            <p className="text-gray-600 mb-6">
              Seu e-mail ({user?.email}) não está registrado como professor. 
              Entre em contato com a coordenação para registrar seu perfil.
            </p>
            <Link to={createPageUrl('Homepage')}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Página Inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minhasEspecializacoes = (professor?.especializacoes || [])
    .map(id => especializacoes.find(e => e.id === id))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{professor?.nome || 'Meu Perfil'} | Docente ESUDA</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header do Perfil - Estilo Profissional */}
        <Card className="relative overflow-hidden border-2 border-indigo-300">
          {/* Banner Superior */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600" />
          
          {/* Área do Avatar e Info Principal */}
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                {formData.foto_url ? (
                  <img
                    src={formData.foto_url}
                    alt={professor.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Nome e Credenciais */}
              <div className="flex-1 mt-16 md:mt-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{professor.nome}</h1>
                    <p className="text-lg text-indigo-700 font-semibold mt-1 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {professor.titulo}
                    </p>
                    <p className="text-gray-600 mt-1">Docente ESUDA</p>
                  </div>
                  {user && professor.email === user.email && (
                    <Button
                      onClick={() => setEditing(!editing)}
                      variant={editing ? "outline" : "default"}
                      className={editing ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {editing ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                  )}
                </div>

                {minhasEspecializacoes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {minhasEspecializacoes.map(espec => (
                      <Badge key={espec.id} className="bg-indigo-100 text-indigo-800 border-indigo-300">
                        {espec.nome}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Conexão Rápida */}
        {!editing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            {formData.instagram && (
              <a href={formData.instagram} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              </a>
            )}
            {formData.site && (
              <a href={formData.site} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  Site
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Formulário de Edição */}
        {editing && (
          <Card className="border-2 border-indigo-300">
            <CardHeader className="bg-indigo-50">
              <CardTitle>Editar Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mini Biografia de Mercado</label>
                <Textarea
                  value={formData.mini_bio}
                  onChange={(e) => setFormData({ ...formData, mini_bio: e.target.value })}
                  placeholder="Descreva sua experiência profissional, consultorias, obras realizadas, perícias..."
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Destaque sua atuação prática no mercado para transmitir autoridade.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/seu-perfil"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Pessoal</label>
                  <Input
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="https://seu-site.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      foto_url: professor.foto_url || '',
                      mini_bio: professor.mini_bio || '',
                      instagram: professor.instagram || '',
                      linkedin: professor.linkedin || '',
                      lattes: professor.lattes || '',
                      site: professor.site || ''
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

        {/* Sobre - Mini Bio */}
        {!editing && formData.mini_bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                {formData.mini_bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Disciplinas que Leciono */}
        {!editing && minhasEspecializacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-700" />
                Disciplinas que Leciono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {minhasEspecializacoes.map(espec => (
                  <div key={espec.id} className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-indigo-900 mb-2">{espec.nome}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-indigo-100 text-indigo-800">
                        {espec.carga_horaria_total}h
                      </Badge>
                      {espec.formato_aulas?.map((formato, idx) => (
                        <Badge key={idx} variant="outline" className="border-indigo-300 text-indigo-700">
                          {formato}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credenciais Acadêmicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-700" />
              Credenciais Acadêmicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
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
                <p className="text-sm text-gray-500 mt-1">{professor.titulo} • Corpo Docente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        {!editing && (
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
                  {professor.email}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}