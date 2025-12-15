import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Award, BookOpen, Instagram, Linkedin, Globe, Mail, GraduationCap } from 'lucide-react';

export default function PerfilDocente() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const professorId = searchParams.get('id');

  const { data: professores = [], isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list()
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  const professor = professores.find(p => p.id === professorId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Carregando perfil...</p>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil Não Encontrado</h2>
            <p className="text-gray-600">Este perfil de docente não existe ou foi removido.</p>
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
        <title>{professor.nome} | Docente ESUDA</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header do Perfil */}
        <Card className="relative overflow-hidden border-2 border-indigo-300">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600" />
          
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="relative">
                {professor.foto_url ? (
                  <img
                    src={professor.foto_url}
                    alt={professor.nome}
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
                  <h1 className="text-3xl font-bold text-gray-900">{professor.nome}</h1>
                  <p className="text-lg text-indigo-700 font-semibold mt-1 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {professor.titulo}
                  </p>
                  <p className="text-gray-600 mt-1">Docente ESUDA</p>
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

        {/* Botões de Conexão */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {professor.linkedin && (
            <a href={professor.linkedin} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </a>
          )}
          {professor.lattes && (
            <a href={professor.lattes} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Lattes
              </Button>
            </a>
          )}
          {professor.instagram && (
            <a href={professor.instagram} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            </a>
          )}
          {professor.site && (
            <a href={professor.site} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                <Globe className="w-4 h-4 mr-2" />
                Site
              </Button>
            </a>
          )}
        </div>

        {/* Sobre */}
        {professor.mini_bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                {professor.mini_bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Credenciais */}
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
                {professor.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}