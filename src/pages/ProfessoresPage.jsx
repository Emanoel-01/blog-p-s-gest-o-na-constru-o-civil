import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, Globe, Instagram, User } from 'lucide-react';

export default function ProfessoresPage() {
  const { data: professores = [], isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem')
  });

  return (
    <>
      <Helmet>
        <title>Corpo Docente ESUDA | Professores Especialistas em Construção Civil e BIM</title>
        <meta name="description" content="Conheça os professores especialistas da ESUDA: profissionais com ampla experiência em BIM, Gestão de Obras, Manutenção Predial, Engenharia Legal e Tecnologias 4.0." />
        <meta name="keywords" content="professores construção civil, docentes BIM, mestres engenharia civil, corpo docente ESUDA, especialistas gestão obras" />
        <link rel="canonical" href="https://posgraduacao-esuda.base44.app/ProfessoresPage" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Corpo Docente ESUDA | Professores Especialistas" />
        <meta property="og:description" content="Time de professores com ampla experiência prática e acadêmica em Construção Civil." />
        <meta property="og:url" content="https://posgraduacao-esuda.base44.app/ProfessoresPage" />
      </Helmet>
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Nosso Corpo Docente</h1>
      <p className="text-gray-600 mb-8 text-justify">
        Conheça o time de professores especialistas que compõem o corpo docente de nossas pós-graduações.
      </p>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando professores...</p>
        </div>
      ) : professores.length === 0 ? (
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 italic">
              Os dados completos dos professores serão adicionados em breve pelo administrador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {professores.map((professor) => (
            <Card key={professor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3 text-center">
                {professor.foto_url ? (
                  <img
                    src={professor.foto_url}
                    alt={professor.nome}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 mx-auto mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <h4 className="font-bold text-gray-800 mb-1 text-xs line-clamp-2">{professor.nome}</h4>
                <p className="text-[10px] text-gray-600 mb-2 line-clamp-2">{professor.titulo}</p>
                
                {professor.especializacoes && professor.especializacoes.length > 0 && (
                  <div className="mb-2 text-[9px] text-gray-600 bg-blue-50 rounded px-1 py-0.5">
                    {professor.especializacoes.length} espec.
                  </div>
                )}
                
                <div className="flex justify-center gap-1 flex-wrap">
                  {professor.instagram && (
                    <a href={professor.instagram} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-pink-50">
                        <Instagram className="w-3 h-3 text-pink-600" />
                      </Button>
                    </a>
                  )}
                  {professor.linkedin && (
                    <a href={professor.linkedin} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-blue-50">
                        <Linkedin className="w-3 h-3 text-blue-600" />
                      </Button>
                    </a>
                  )}
                  {professor.lattes && (
                    <a href={professor.lattes} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-yellow-50">
                        <BookOpen className="w-3 h-3 text-yellow-600" />
                      </Button>
                    </a>
                  )}
                  {professor.site && (
                    <a href={professor.site} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-gray-50">
                        <Globe className="w-3 h-3 text-gray-600" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('CoordenadorPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('CorpoDiscentePage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Corpo Discente →
          </Button>
        </Link>
      </div>
    </div>
  );
}