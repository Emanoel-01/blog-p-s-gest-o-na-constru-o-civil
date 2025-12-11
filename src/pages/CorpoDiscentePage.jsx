import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Instagram, Linkedin, Globe, BookOpen } from 'lucide-react';

export default function CorpoDiscentePage() {
  const { data: discentes = [], isLoading } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('ordem')
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  // Agrupar discentes por especialização e turma
  const discentesAgrupados = discentes.reduce((acc, discente) => {
    if (!discente.especializacoes || discente.especializacoes.length === 0) {
      if (!acc['sem_curso']) acc['sem_curso'] = {};
      const turma = discente.numero_turma || 'Sem Turma';
      if (!acc['sem_curso'][turma]) acc['sem_curso'][turma] = [];
      acc['sem_curso'][turma].push(discente);
      return acc;
    }

    discente.especializacoes.forEach(especId => {
      if (!acc[especId]) acc[especId] = {};
      const turma = discente.numero_turma || 'Sem Turma';
      if (!acc[especId][turma]) acc[especId][turma] = [];
      acc[especId][turma].push(discente);
    });
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Corpo Discente
      </h2>
      <p className="text-gray-600 mb-8 text-justify">
        Conheça nossos alunos que fazem parte do programa de pós-graduação ESUDA.
      </p>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando alunos...</p>
        </div>
      ) : discentes.length === 0 ? (
        <Card className="bg-purple-50 border border-purple-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 italic">
              Os perfis dos alunos serão adicionados em breve pelo administrador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {discentes.map((discente) => (
            <Card key={discente.id} className="hover:shadow-xl transition-shadow border-2 border-gray-200">
              <CardContent className="p-6 text-center">
                {discente.foto_url && (
                  <img
                    src={discente.foto_url}
                    alt={discente.nome}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-600 shadow-lg mx-auto mb-4"
                  />
                )}
                <h4 className="font-bold text-gray-800 mb-1 text-lg">{discente.nome}</h4>
                <p className="text-sm text-gray-600 mb-4">{discente.titulo}</p>
                
                {discente.especializacoes && discente.especializacoes.length > 0 && (
                  <div className="mb-4 text-xs text-gray-600 bg-purple-50 rounded-lg p-2">
                    <strong>Cursou:</strong> {discente.especializacoes.length} especialização(ões)
                  </div>
                )}
                
                <div className="flex justify-center gap-2 flex-wrap">
                  {discente.instagram && (
                    <a href={discente.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full hover:opacity-90">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                  {discente.linkedin && (
                    <a href={discente.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {discente.lattes && (
                    <a href={discente.lattes} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-full hover:bg-yellow-700">
                      <BookOpen className="w-4 h-4" />
                      Lattes
                    </a>
                  )}
                  {discente.site && (
                    <a href={discente.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700">
                      <Globe className="w-4 h-4" />
                      Site
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8">
        <Link to={createPageUrl('ProfessoresPage')}>
          <Button variant="outline" className="border-gray-300">
            ← Voltar
          </Button>
        </Link>
        <Link to={createPageUrl('ParceirosPage')}>
          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
            Ver Parceiros →
          </Button>
        </Link>
      </div>
    </div>
  );
}