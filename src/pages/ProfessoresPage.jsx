import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Linkedin, BookOpen, Globe, Instagram } from 'lucide-react';

export default function ProfessoresPage() {
  const { data: professores = [], isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: () => base44.entities.Professor.list('ordem')
  });

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Nosso Corpo Docente</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {professores.map((professor) => (
            <Card key={professor.id} className="hover:shadow-xl transition-shadow border-2 border-gray-200">
              <CardContent className="p-6 text-center">
                {professor.foto_url && (
                  <img
                    src={professor.foto_url}
                    alt={professor.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-600 shadow-lg mx-auto mb-4"
                  />
                )}
                <h4 className="font-bold text-gray-800 mb-1 text-lg">{professor.nome}</h4>
                <p className="text-sm text-gray-600 mb-4">{professor.titulo}</p>
                
                {professor.especializacoes && professor.especializacoes.length > 0 && (
                  <div className="mb-4 text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                    <strong>Leciona em:</strong> {professor.especializacoes.length} especialização(ões)
                  </div>
                )}
                
                <div className="flex justify-center gap-2 flex-wrap">
                  {professor.instagram && (
                    <a href={professor.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full hover:opacity-90">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                  {professor.linkedin && (
                    <a href={professor.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {professor.lattes && (
                    <a href={professor.lattes} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-full hover:bg-yellow-700">
                      <BookOpen className="w-4 h-4" />
                      Lattes
                    </a>
                  )}
                  {professor.site && (
                    <a href={professor.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700">
                      <Globe className="w-4 h-4" />
                      Site
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