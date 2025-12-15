import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, User, Briefcase, Link as LinkIcon, Upload } from 'lucide-react';

export default function MeuPerfilDocente() {
  const [user, setUser] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editing, setEditing] = useState(false);
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

  return (
    <>
      <Helmet>
        <title>Meu Perfil - Docente | ESUDA</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil - Docente</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-green-600 hover:bg-green-700">
              <User className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>

        {/* Informações Institucionais (Read-Only) */}
        <Card className="border-2 border-gray-300">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-gray-600" />
              Informações Institucionais (Somente Leitura)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
              <Input value={professor.nome} readOnly className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail de Login</label>
              <Input value={professor.email} readOnly className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Titulação Acadêmica</label>
              <Input value={professor.titulo} readOnly className="bg-gray-100" />
            </div>
            <p className="text-xs text-gray-500 italic">
              * Estes dados são gerenciados pela coordenação e não podem ser alterados por você.
            </p>
          </CardContent>
        </Card>

        {/* Informações Editáveis (Networking) */}
        <Card className="border-2 border-green-300">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="w-5 h-5 text-green-600" />
              Informações Profissionais (Editável)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                {formData.foto_url && (
                  <img 
                    src={formData.foto_url} 
                    alt="Foto de perfil" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-600"
                  />
                )}
                {editing && (
                  <div>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="mb-2"
                    />
                    {uploading && <p className="text-sm text-gray-500">Enviando...</p>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mini Biografia</label>
              <Textarea
                value={formData.mini_bio}
                onChange={(e) => setFormData({ ...formData, mini_bio: e.target.value })}
                disabled={!editing}
                placeholder="Descreva brevemente sua experiência profissional..."
                rows={4}
                className={!editing ? 'bg-gray-100' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn</label>
              <Input
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                disabled={!editing}
                placeholder="https://linkedin.com/in/seu-perfil"
                className={!editing ? 'bg-gray-100' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lattes</label>
              <Input
                value={formData.lattes}
                onChange={(e) => setFormData({ ...formData, lattes: e.target.value })}
                disabled={!editing}
                placeholder="http://lattes.cnpq.br/seu-lattes"
                className={!editing ? 'bg-gray-100' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                disabled={!editing}
                placeholder="https://instagram.com/seu-perfil"
                className={!editing ? 'bg-gray-100' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Site Pessoal</label>
              <Input
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                disabled={!editing}
                placeholder="https://seu-site.com"
                className={!editing ? 'bg-gray-100' : ''}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Link to={createPageUrl('Homepage')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Página Inicial
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}