import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Save, Upload } from 'lucide-react';

export default function MeuPerfilDiscente() {
  const [user, setUser] = useState(null);
  const [discente, setDiscente] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    cargo_atual: '',
    empresa: '',
    tags_competencia: [],
    foto_url: '',
    instagram: '',
    linkedin: '',
    lattes: '',
    site: ''
  });
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
          foto_url: meuPerfil.foto_url || '',
          instagram: meuPerfil.instagram || '',
          linkedin: meuPerfil.linkedin || '',
          lattes: meuPerfil.lattes || '',
          site: meuPerfil.site || ''
        });
      }
    }
  }, [user, discentes]);

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

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_url: file_url });
      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da foto.');
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

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const minhasEspecializacoes = (discente.especializacoes || [])
    .map(id => especializacoes.find(e => e.id === id))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>Meu Perfil Discente | ESUDA</title>
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <User className="w-6 h-6" />
              Meu Perfil Discente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações Fixas */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">Informações do Cadastro</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nome:</strong> {discente.nome}</p>
                <p><strong>Email:</strong> {discente.email}</p>
                <p><strong>Turma:</strong> {discente.numero_turma || 'Não definida'}</p>
                <div>
                  <strong>Especializações:</strong>
                  {minhasEspecializacoes.length > 0 ? (
                    <ul className="list-disc list-inside mt-1">
                      {minhasEspecializacoes.map(e => (
                        <li key={e.id}>{e.nome}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 italic"> Nenhuma</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                ℹ️ Estas informações são gerenciadas pela coordenação e não podem ser editadas.
              </p>
            </div>

            {/* Campos Editáveis */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Perfil Profissional</h3>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                    Editar
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título/Formação
                    </label>
                    <Input
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Engenheiro Civil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-3">
                      {formData.foto_url && (
                        <img src={formData.foto_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-green-600" />
                      )}
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md border border-gray-300">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Carregar Foto</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="https://instagram.com/seuperfil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/seuperfil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currículo Lattes
                    </label>
                    <Input
                      value={formData.lattes}
                      onChange={(e) => setFormData({ ...formData, lattes: e.target.value })}
                      placeholder="http://lattes.cnpq.br/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Pessoal
                    </label>
                    <Input
                      value={formData.site}
                      onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                      placeholder="https://seusite.com"
                    />
                  </div>

                  <div className="flex gap-3">
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
                        // Resetar formulário
                        setFormData({
                          titulo: discente.titulo || '',
                          foto_url: discente.foto_url || '',
                          instagram: discente.instagram || '',
                          linkedin: discente.linkedin || '',
                          lattes: discente.lattes || '',
                          site: discente.site || ''
                        });
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {formData.foto_url && (
                    <img src={formData.foto_url} alt={discente.nome} className="w-20 h-20 rounded-full object-cover border-2 border-green-600 mb-2" />
                  )}
                  <p><strong>Título:</strong> {formData.titulo || 'Não informado'}</p>
                  <p><strong>Instagram:</strong> {formData.instagram || 'Não informado'}</p>
                  <p><strong>LinkedIn:</strong> {formData.linkedin || 'Não informado'}</p>
                  <p><strong>Lattes:</strong> {formData.lattes || 'Não informado'}</p>
                  <p><strong>Site:</strong> {formData.site || 'Não informado'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}