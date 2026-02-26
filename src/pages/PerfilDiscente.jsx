import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Briefcase, MessageCircle, Linkedin, Instagram, BookOpen, Globe, Mail, GraduationCap, Building2 } from 'lucide-react';

export default function PerfilDiscente() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const discenteId = searchParams.get('id');

  const { data: discentes = [], isLoading } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list()
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const discente = discentes.find(d => d.id === discenteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Carregando perfil...</p>
      </div>
    );
  }

  if (!discente) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil Não Encontrado</h2>
            <p className="text-gray-600">Este perfil de aluno não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minhasEspecializacoes = (discente.especializacoes || [])
    .map(id => especializacoes.find(e => e.id === id))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{discente.nome} | Perfil ESUDA</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header do Perfil */}
        <Card className="relative overflow-hidden border-2 border-green-300">
          <div className="h-32 bg-gradient-to-r from-green-600 via-blue-600 to-teal-600" />
          
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="relative">
                {discente.foto_url ? (
                  <img
                    src={discente.foto_url}
                    alt={discente.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 mt-16 md:mt-0">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{discente.nome}</h1>
                  <p className="text-lg text-gray-700 mt-1">{discente.titulo || 'Aluno(a) ESUDA'}</p>
                  {discente.cargo_atual && discente.empresa && (
                    <p className="text-gray-600 mt-1">
                      {discente.cargo_atual} na {discente.empresa}
                    </p>
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

        {/* Botões de Conexão */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {discente.whatsapp && (
            <a href={`https://wa.me/${discente.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          )}
          {discente.linkedin && (
            <a href={discente.linkedin} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </a>
          )}
          {discente.lattes && (
            <a href={discente.lattes} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Lattes
              </Button>
            </a>
          )}
          {discente.site && (
            <a href={discente.site} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                <Globe className="w-4 h-4 mr-2" />
                Portfólio
              </Button>
            </a>
          )}
        </div>

        {/* Experiência Profissional */}
        {(discente.cargo_atual || discente.empresa) && (
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
                  <h3 className="font-bold text-gray-900">{discente.cargo_atual}</h3>
                  <p className="text-gray-600">{discente.empresa}</p>
                  <p className="text-sm text-gray-500 mt-1">Atualmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competências */}
        {discente.tags_competencia && discente.tags_competencia.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-700" />
                Competências Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {discente.tags_competencia.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-700" />
              Formação Acadêmica
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
                {minhasEspecializacoes.map(espec => (
                  <p key={espec.id} className="text-sm text-gray-700">Pós-Graduação em {espec.nome}</p>
                ))}
                {discente.numero_turma && (
                  <p className="text-sm text-gray-500 mt-1">Turma {discente.numero_turma}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
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
              {discente.whatsapp && (
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  {discente.whatsapp}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}