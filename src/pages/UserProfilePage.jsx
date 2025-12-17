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
        {/* Cover Photo */}
        {profile.cover_photo_url && (
          <div className="w-full h-48 md:h-64 rounded-t-2xl overflow-hidden">
            <img
              src={profile.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Cabeçalho do Perfil */}
        <Card className={`border-2 border-pink-200 shadow-xl ${profile.cover_photo_url ? '-mt-20' : ''}`}>
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

                <div className="flex flex-wrap items-center gap-3 mb-3">
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
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-black flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X / Twitter
                    </a>
                  )}
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
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

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      <span className="font-semibold">
                        {depoimentos.reduce((sum, d) => sum + (d.reactions_likes || 0), 0)} Úteis
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span className="font-semibold">
                        {depoimentos.reduce((sum, d) => sum + (d.reactions_hearts || 0), 0)} Inspiradores
                      </span>
                    </div>
                  </div>
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