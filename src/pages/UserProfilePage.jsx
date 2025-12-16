import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Star, UserCircle, Briefcase, Building, CheckCircle, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfilePage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profileId = searchParams.get('id');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', profileId],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      return profiles[0] || null;
    },
    enabled: !!profileId,
  });

  const { data: depoimentos = [], isLoading: depoimentosLoading } = useQuery({
    queryKey: ['user-depoimentos', profileId],
    queryFn: async () => {
      return await base44.entities.Depoimento.filter({ user_profile_id: profileId });
    },
    enabled: !!profileId,
  });

  if (profileLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-12 text-center">
          <p className="text-gray-500 italic mb-4">Perfil não encontrado</p>
          <Link to={createPageUrl('DepoimentosPage')}>
            <Button variant="outline">Voltar para Depoimentos</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const avgRating = depoimentos.length > 0
    ? (depoimentos.reduce((sum, d) => sum + (d.avaliacao_estrelas || 0), 0) / depoimentos.length).toFixed(1)
    : 0;

  return (
    <>
      <Helmet>
        <title>{profile.nome} | Perfil de Avaliador ESUDA</title>
        <meta name="description" content={`Veja todos os depoimentos de ${profile.nome} sobre a ESUDA. ${depoimentos.length} avaliações com média ${avgRating}/5 estrelas.`} />
        <meta name="keywords" content={`${profile.nome}, depoimentos esuda, avaliações ${profile.profissao}`} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile.nome,
            "jobTitle": profile.profissao,
            "worksFor": profile.empresa ? {
              "@type": "Organization",
              "name": profile.empresa
            } : undefined,
            "image": profile.foto_url,
            "description": profile.bio
          })}
        </script>
      </Helmet>

      <div className="space-y-8">
        {/* Cabeçalho do Perfil */}
        <Card className="border-2 border-pink-200 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {profile.foto_url ? (
                <img
                  src={profile.foto_url}
                  alt={profile.nome}
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
                  <UserCircle className="w-20 h-20 text-pink-600" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.nome}</h1>
                  {profile.verificado && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verificado
                    </Badge>
                  )}
                </div>

                {profile.profissao && (
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">{profile.profissao}</span>
                  </div>
                )}

                {profile.empresa && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <span>{profile.empresa}</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-gray-600 mb-3 leading-relaxed">{profile.bio}</p>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            parseFloat(avgRating) >= star
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{avgRating}</span>
                    <span className="text-gray-600">({depoimentos.length} depoimentos)</span>
                  </div>

                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Depoimentos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Depoimentos de {profile.nome}
          </h2>

          {depoimentosLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando depoimentos...</p>
            </div>
          ) : depoimentos.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 italic">
                  Este usuário ainda não tem depoimentos aprovados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {depoimentos.map((dep, index) => (
                <motion.div
                  key={dep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex">
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
                        <Badge variant="outline" className="text-xs">
                          {dep.vinculo_pos_graduacao}
                        </Badge>
                      </div>

                      {dep.depoimento_texto && (
                        <p className="text-gray-700 mb-4 italic leading-relaxed">
                          "{dep.depoimento_texto}"
                        </p>
                      )}

                      {dep.depoimento_video_url && (
                        <video controls className="w-full rounded-lg mb-4 max-w-2xl">
                          <source src={dep.depoimento_video_url} />
                        </video>
                      )}

                      {dep.depoimento_audio_url && (
                        <audio controls className="w-full mb-4">
                          <source src={dep.depoimento_audio_url} />
                        </audio>
                      )}

                      <p className="text-sm text-gray-500">
                        Publicado em {new Date(dep.created_date).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <Link to={createPageUrl('DepoimentosPage')}>
            <Button variant="outline" className="border-gray-300">
              ← Voltar para Todos os Depoimentos
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}