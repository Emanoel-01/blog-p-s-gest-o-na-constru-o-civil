import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Instagram, Linkedin, Globe, BookOpen, User, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function CorpoDiscentePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('todas');
  const [selectedEspecializacao, setSelectedEspecializacao] = useState('todas');
  const [expandedTurmas, setExpandedTurmas] = useState({});
  const [expandedDiscentes, setExpandedDiscentes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: discentes = [], isLoading } = useQuery({
    queryKey: ['discentes'],
    queryFn: () => base44.entities.Discente.list('ordem')
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  // Extrair todas as turmas únicas
  const turmasDisponiveis = useMemo(() => {
    const turmas = new Set();
    discentes.forEach(d => {
      if (d.numero_turma) turmas.add(d.numero_turma);
    });
    return Array.from(turmas).sort();
  }, [discentes]);

  // Filtrar discentes
  const discentesFiltrados = useMemo(() => {
    return discentes.filter(discente => {
      const matchNome = !searchTerm || discente.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTurma = selectedTurma === 'todas' || discente.numero_turma === selectedTurma;
      const matchEspec = selectedEspecializacao === 'todas' || 
        (discente.especializacoes && discente.especializacoes.includes(selectedEspecializacao));
      
      return matchNome && matchTurma && matchEspec;
    });
  }, [discentes, searchTerm, selectedTurma, selectedEspecializacao]);

  // Agrupar discentes por especialização e turma
  const discentesAgrupados = useMemo(() => {
    const grupos = {};
    
    discentesFiltrados.forEach(discente => {
      if (!discente.especializacoes || discente.especializacoes.length === 0) {
        if (!grupos['sem_curso']) grupos['sem_curso'] = {};
        const turma = discente.numero_turma || 'Sem Turma';
        if (!grupos['sem_curso'][turma]) grupos['sem_curso'][turma] = [];
        grupos['sem_curso'][turma].push(discente);
        return;
      }

      discente.especializacoes.forEach(especId => {
        if (!grupos[especId]) grupos[especId] = {};
        const turma = discente.numero_turma || 'Sem Turma';
        if (!grupos[especId][turma]) grupos[especId][turma] = [];
        grupos[especId][turma].push(discente);
      });
    });
    
    return grupos;
  }, [discentesFiltrados]);

  // Paginação
  const totalPages = Math.ceil(Object.keys(discentesAgrupados).length / itemsPerPage);

  const toggleTurma = (especId, turma) => {
    const key = `${especId}-${turma}`;
    setExpandedTurmas(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDiscente = (discenteId) => {
    setExpandedDiscentes(prev => ({
      ...prev,
      [discenteId]: !prev[discenteId]
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTurma('todas');
    setSelectedEspecializacao('todas');
    setCurrentPage(1);
  };

  // Cores por especialização (verde clarinho para todos)
  const getEspecializacaoColor = (nomeEspec) => {
    return 'from-green-100 to-emerald-200';
  };

  const getTurmaColor = (nomeEspec) => {
    const nome = nomeEspec?.toLowerCase() || '';
    if (nome.includes('bim')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (nome.includes('gestão') || nome.includes('projetos')) return 'bg-red-100 text-red-800 border-red-300';
    if (nome.includes('manutenção')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (nome.includes('legal') || nome.includes('perícia')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <>
      <Helmet>
        <title>Corpo Discente | ESUDA</title>
      </Helmet>

      <div className="space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Corpo Discente
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Conheça nossos alunos que fazem parte do programa de pós-graduação ESUDA
          </p>
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  <Search className="w-4 h-4 inline mr-1" />
                  Buscar por Nome
                </label>
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Digite o nome do aluno..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Filtrar por Turma</label>
                <Select value={selectedTurma} onValueChange={(v) => { setSelectedTurma(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Turmas</SelectItem>
                    {turmasDisponiveis.map(turma => (
                      <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Filtrar por Especialização</label>
                <Select value={selectedEspecializacao} onValueChange={(v) => { setSelectedEspecializacao(v); setCurrentPage(1); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {especializacoes.map(espec => (
                      <SelectItem key={espec.id} value={espec.id}>{espec.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || selectedTurma !== 'todas' || selectedEspecializacao !== 'todas') && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <strong>{discentesFiltrados.length}</strong> aluno(s) encontrado(s)
                </p>
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conteúdo */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando alunos...</p>
          </div>
        ) : discentesFiltrados.length === 0 ? (
          <Card className="bg-yellow-50 border border-yellow-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-700 italic">
                {discentes.length === 0 
                  ? 'Os perfis dos alunos serão adicionados em breve pelo administrador.'
                  : 'Nenhum aluno encontrado com os filtros aplicados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(discentesAgrupados).map(([especId, turmas]) => {
              const espec = especializacoes.find(e => e.id === especId);
              const nomeEspec = espec ? espec.nome : 'Sem Curso Definido';
              const colorClass = getEspecializacaoColor(nomeEspec);

              return (
                <div key={especId}>
                  {/* Header da Especialização */}
                  <div className={`bg-gradient-to-r ${colorClass} text-gray-800 rounded-xl p-4 sm:p-6 shadow-lg mb-4 border-2 border-green-300`}>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {nomeEspec}
                    </h2>
                    <p className="text-sm text-gray-700 mt-1">
                      {Object.values(turmas).flat().length} aluno(s)
                    </p>
                  </div>
                  
                  {/* Turmas em Acordeão */}
                  <div className="space-y-3">
                    {Object.entries(turmas).map(([turma, alunos]) => {
                      const turmaKey = `${especId}-${turma}`;
                      const isExpanded = expandedTurmas[turmaKey];

                      return (
                        <div key={turma}>
                          {/* Cabeçalho da Turma - Clicável */}
                          <button
                            onClick={() => toggleTurma(especId, turma)}
                            className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg border-2 transition-all ${
                              isExpanded 
                                ? `${getTurmaColor(nomeEspec)} border-current shadow-md` 
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`text-base sm:text-lg font-bold ${
                                isExpanded ? 'text-current' : 'text-gray-800'
                              }`}>
                                Turma {turma}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">
                                {alunos.length} aluno{alunos.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>

                          {/* Lista de Alunos */}
                          {isExpanded && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pl-2 sm:pl-4">
                              {alunos.map((discente) => {
                                const isDiscenteExpanded = expandedDiscentes[discente.id];
                                
                                return (
                                  <Card 
                                    key={discente.id} 
                                    className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-green-500 cursor-pointer"
                                    onClick={() => toggleDiscente(discente.id)}
                                  >
                                    <CardContent className="p-3 sm:p-4 text-center">
                                      {/* Foto e Info Básica */}
                                      {discente.foto_url ? (
                                        <img
                                          src={discente.foto_url}
                                          alt={discente.nome}
                                          loading="lazy"
                                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-green-600 mx-auto mb-2"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 mx-auto mb-2 flex items-center justify-center">
                                          <User className="w-8 h-8 text-white" />
                                        </div>
                                      )}
                                      
                                      <h4 className="font-bold text-gray-800 mb-1 text-xs sm:text-sm line-clamp-2 leading-tight">
                                        {discente.nome}
                                      </h4>
                                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2 leading-snug">
                                        {discente.titulo || 'Aluno(a)'}
                                      </p>

                                      {/* Detalhes Expandidos */}
                                      {isDiscenteExpanded && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2" onClick={(e) => e.stopPropagation()}>
                                          <div className="flex justify-center gap-1 flex-wrap">
                                            {discente.instagram && (
                                              <a href={discente.instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-pink-50">
                                                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                                                </Button>
                                              </a>
                                            )}
                                            {discente.linkedin && (
                                              <a href={discente.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-blue-50">
                                                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                                                </Button>
                                              </a>
                                            )}
                                            {discente.lattes && (
                                              <a href={discente.lattes} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-yellow-50">
                                                  <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                                                </Button>
                                              </a>
                                            )}
                                            {discente.site && (
                                              <a href={discente.site} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-green-50">
                                                  <Globe className="w-3.5 h-3.5 text-gray-600" />
                                                </Button>
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Indicador de Expansão */}
                                      <div className="mt-2 text-center">
                                        <span className="text-[10px] text-gray-400">
                                          {isDiscenteExpanded ? '▲ clique para recolher' : '▼ clique para ver mais'}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navegação */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-6">
          <Link to={createPageUrl('ProfessoresPage')} className="w-full sm:w-auto">
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
              ← Voltar
            </Button>
          </Link>
          <Link to={createPageUrl('ParceirosPage')} className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full sm:w-auto">
              Ver Parceiros →
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}