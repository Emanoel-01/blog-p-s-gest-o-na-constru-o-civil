import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Instagram, Linkedin, Globe, BookOpen, User } from 'lucide-react';

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
        <div className="space-y-12">
          {Object.entries(discentesAgrupados).map(([especId, turmas]) => {
            const espec = especializacoes.find(e => e.id === especId);
            const nomeEspec = espec ? espec.nome : 'Sem Curso Definido';

            return (
              <div key={especId}>
                <h2 className="text-2xl font-bold text-green-700 mb-6 border-b-4 border-green-500 pb-2">
                  {nomeEspec}
                </h2>
                
                {Object.entries(turmas).map(([turma, alunos]) => (
                  <div key={turma} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Turma {turma}
                      </span>
                      <span className="text-sm text-gray-500">({alunos.length} aluno{alunos.length !== 1 ? 's' : ''})</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {alunos.map((discente) => (
                        <Card key={discente.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-3 text-center">
                            {discente.foto_url ? (
                              <img
                                src={discente.foto_url}
                                alt={discente.nome}
                                className="w-16 h-16 rounded-full object-cover border-2 border-purple-600 mx-auto mb-2"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center">
                                <User className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            <h4 className="font-bold text-gray-800 mb-1 text-xs line-clamp-2">{discente.nome}</h4>
                            <p className="text-[10px] text-gray-600 mb-2 line-clamp-2">{discente.titulo}</p>
                            
                            <div className="flex justify-center gap-1 flex-wrap">
                              {discente.instagram && (
                                <a href={discente.instagram} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-pink-50">
                                    <Instagram className="w-3 h-3 text-pink-600" />
                                  </Button>
                                </a>
                              )}
                              {discente.linkedin && (
                                <a href={discente.linkedin} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-blue-50">
                                    <Linkedin className="w-3 h-3 text-blue-600" />
                                  </Button>
                                </a>
                              )}
                              {discente.lattes && (
                                <a href={discente.lattes} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-yellow-50">
                                    <BookOpen className="w-3 h-3 text-yellow-600" />
                                  </Button>
                                </a>
                              )}
                              {discente.site && (
                                <a href={discente.site} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-green-50">
                                    <Globe className="w-3 h-3 text-gray-600" />
                                  </Button>
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
            ← Voltar para Professores
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