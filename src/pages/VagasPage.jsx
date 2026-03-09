import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Clock, Search, ExternalLink, Zap, Plus, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const tipoColors = {
  CLT: 'bg-green-100 text-green-800 border-green-300',
  Freelancer: 'bg-blue-100 text-blue-800 border-blue-300',
  Estágio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PJ: 'bg-purple-100 text-purple-800 border-purple-300',
  Voluntário: 'bg-gray-100 text-gray-800 border-gray-300',
};

const modalidadeColors = {
  Presencial: 'bg-orange-100 text-orange-700',
  Remoto: 'bg-teal-100 text-teal-700',
  Híbrido: 'bg-indigo-100 text-indigo-700',
};

const isAdmin = (user) => user && (user.role === 'admin' || ['emanoel.s.amorim@gmail.com','emanoel@esuda.edu.br','vdoval@gmail.com'].includes(user.email));

const vagaVazia = { titulo: '', descricao: '', tipo: 'CLT', modalidade: 'Presencial', empresa_nome: '', link_inscricao: '', prazo_final: '', tags_competencia: [] };

export default function VagasPage() {
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(vagaVazia);
  const [tagsInput, setTagsInput] = useState('');
  const queryClient = useQueryClient();

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ['vagas'],
    queryFn: () => base44.entities.Vaga.filter({ status: 'Aberta' }, '-created_date')
  });

  const { data: parceiros = [] } = useQuery({
    queryKey: ['parceiros'],
    queryFn: () => base44.entities.Parceiro.list('nome')
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: discente } = useQuery({
    queryKey: ['discente-me', user?.email],
    queryFn: () => base44.entities.Discente.filter({ email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const vagasFiltradas = useMemo(() => {
    return vagas.filter(v => {
      const matchSearch = !search ||
        v.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        v.descricao?.toLowerCase().includes(search.toLowerCase()) ||
        v.empresa_nome?.toLowerCase().includes(search.toLowerCase());
      const matchTipo = tipoFiltro === 'todos' || v.tipo === tipoFiltro;
      const matchModalidade = modalidadeFiltro === 'todas' || v.modalidade === modalidadeFiltro;
      return matchSearch && matchTipo && matchModalidade;
    });
  }, [vagas, search, tipoFiltro, modalidadeFiltro]);

  // Vagas com match de competências do aluno logado
  const vagasComMatch = useMemo(() => {
    if (!discente?.tags_competencia?.length) return new Set();
    const minhasComp = discente.tags_competencia.map(t => t.toLowerCase());
    return new Set(
      vagasFiltradas
        .filter(v => v.tags_competencia?.some(t => minhasComp.includes(t.toLowerCase())))
        .map(v => v.id)
    );
  }, [vagasFiltradas, discente]);

  const getParceiro = (id) => parceiros.find(p => p.id === id);

  const criarMutation = useMutation({
    mutationFn: () => base44.entities.Vaga.create({ ...form, status: 'Aberta' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vagas'] });
      setForm(vagaVazia);
      setTagsInput('');
      setShowForm(false);
      toast.success('Vaga cadastrada!');
    }
  });

  const excluirMutation = useMutation({
    mutationFn: (id) => base44.entities.Vaga.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vagas'] })
  });

  return (
    <>
      <Helmet>
        <title>Vagas | ESUDA</title>
        <meta name="description" content="Oportunidades de emprego e freelance para alunos ESUDA vinculadas à Incubadora Profissional." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Vagas & Oportunidades</h1>
          </div>
          <p className="text-indigo-100 text-sm md:text-base">
            Oportunidades selecionadas pelos nossos parceiros para alunos ESUDA
          </p>
          {isAdmin(user) && (
            <Button onClick={() => setShowForm(!showForm)} className="mt-3 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Nova Vaga
            </Button>
          )}
        </div>

        {/* Formulário de cadastro — apenas admin */}
        {isAdmin(user) && showForm && (
          <Card className="border-2 border-indigo-300">
            <CardHeader className="bg-indigo-50 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cadastrar Nova Vaga</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Título da vaga*" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              <Input placeholder="Nome da empresa" value={form.empresa_nome} onChange={e => setForm({...form, empresa_nome: e.target.value})} />
              <Textarea placeholder="Descrição da vaga*" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['CLT','Freelancer','Estágio','PJ','Voluntário'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.modalidade} onValueChange={v => setForm({...form, modalidade: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Presencial','Remoto','Híbrido'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Link de inscrição (URL)" value={form.link_inscricao} onChange={e => setForm({...form, link_inscricao: e.target.value})} />
              <Input type="date" placeholder="Prazo final" value={form.prazo_final} onChange={e => setForm({...form, prazo_final: e.target.value})} />
              <Input
                placeholder="Competências (separe por vírgula)"
                value={tagsInput}
                onChange={e => { setTagsInput(e.target.value); setForm({...form, tags_competencia: e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}); }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button onClick={() => criarMutation.mutate()} disabled={!form.titulo.trim() || !form.descricao.trim() || criarMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  Salvar Vaga
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar vaga ou empresa..."
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Estágio">Estágio</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                  <SelectItem value="Voluntário">Voluntário</SelectItem>
                </SelectContent>
              </Select>
              <Select value={modalidadeFiltro} onValueChange={setModalidadeFiltro}>
                <SelectTrigger><SelectValue placeholder="Modalidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as modalidades</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {discente && vagasComMatch.size > 0 && (
              <p className="text-xs text-indigo-700 mt-3 font-medium">
                <Zap className="w-3 h-3 inline mr-1" />
                {vagasComMatch.size} vaga(s) com match nas suas competências!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
            <p className="text-gray-500">Carregando vagas...</p>
          </div>
        ) : vagasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              Nenhuma vaga encontrada com os filtros aplicados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vagasFiltradas.map(vaga => {
              const parceiro = getParceiro(vaga.empresa_parceira_id);
              const isMatch = vagasComMatch.has(vaga.id);

              return (
                <Card
                  key={vaga.id}
                  className={`border-2 hover:shadow-lg transition-all ${
                    isMatch ? 'border-indigo-400 bg-indigo-50/40' : 'border-gray-200'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {isMatch && (
                          <Badge className="bg-indigo-600 text-white mb-2 text-xs">
                            <Zap className="w-3 h-3 mr-1" /> Match!
                          </Badge>
                        )}
                        <CardTitle className="text-base md:text-lg leading-tight">{vaga.titulo}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          {parceiro?.nome || vaga.empresa_nome || 'Empresa parceira'}
                        </p>
                      </div>
                      {parceiro?.logo_url && (
                        <img src={parceiro.logo_url} alt={parceiro.nome} className="w-12 h-12 object-contain rounded-lg border" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={tipoColors[vaga.tipo] || tipoColors.CLT}>{vaga.tipo}</Badge>
                      {vaga.modalidade && (
                        <Badge className={`${modalidadeColors[vaga.modalidade]} border-0`}>
                          <MapPin className="w-3 h-3 mr-1" />{vaga.modalidade}
                        </Badge>
                      )}
                      {vaga.prazo_final && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />Prazo: {vaga.prazo_final}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-3">{vaga.descricao}</p>

                    {vaga.tags_competencia?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {vaga.tags_competencia.map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {vaga.link_inscricao && (
                      <a href={vaga.link_inscricao} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                          <ExternalLink className="w-4 h-4 mr-2" /> Candidatar-se
                        </Button>
                      </a>
                    )}
                    {isAdmin(user) && (
                      <button onClick={() => excluirMutation.mutate(vaga.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">
                        Excluir vaga
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}