import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function LeadCRM({ leads, onUpdate, especializacoes }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [newInteracao, setNewInteracao] = useState({ tipo: 'Nota', conteudo: '' });
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [followUpDays, setFollowUpDays] = useState(3);

  // Calcular leads que precisam de follow-up
  const leadsNeedingFollowUp = useMemo(() => {
    return leads.filter(lead => {
      if (!['Novo', 'Contatado'].includes(lead.status)) return false;
      
      const ultimaInteracao = lead.ultima_interacao || lead.created_date;
      const daysSince = Math.floor((new Date() - new Date(ultimaInteracao)) / (1000 * 60 * 60 * 24));
      
      return daysSince >= followUpDays;
    });
  }, [leads, followUpDays]);

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const statusMatch = filterStatus === 'Todos' || lead.status === filterStatus;
      const categoriaMatch = filterCategoria === 'Todas' || 
        (lead.categoria_interesse && lead.categoria_interesse.includes(filterCategoria));
      const searchMatch = !searchTerm || 
        lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp?.includes(searchTerm) ||
        lead.interesse?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && categoriaMatch && searchMatch;
    });
  }, [leads, filterStatus, filterCategoria, searchTerm]);

  const getEspecializacaoLink = (categorias) => {
    if (!categorias || categorias.length === 0) return null;
    
    const categoria = categorias[0];
    const espec = especializacoes.find(e => 
      e.nome.toLowerCase().includes(categoria.toLowerCase()) ||
      categoria.toLowerCase().includes(e.nome.toLowerCase())
    );
    
    return espec?.link_externo || null;
  };

  const handleAddInteracao = async () => {
    if (!newInteracao.conteudo.trim()) {
      toast.error('Digite o conteúdo da interação');
      return;
    }

    const historico = selectedLead.historico_interacoes || [];
    const user = await base44.auth.me();
    
    const novaInteracao = {
      data: new Date().toISOString(),
      tipo: newInteracao.tipo,
      conteudo: newInteracao.conteudo,
      usuario: user.email
    };

    const updated = {
      historico_interacoes: [...historico, novaInteracao],
      ultima_interacao: new Date().toISOString(),
      precisa_followup: false,
      dias_sem_resposta: 0
    };

    await onUpdate(selectedLead.id, updated);
    setSelectedLead({ ...selectedLead, ...updated });
    setNewInteracao({ tipo: 'Nota', conteudo: '' });
    toast.success('Interação registrada!');
  };

  const handleSaveLead = async () => {
    await onUpdate(editingLead.id, {
      status: editingLead.status,
      categoria_interesse: editingLead.categoria_interesse,
      notas: editingLead.notas,
      interesse: editingLead.interesse
    });
    
    setEditingLead(null);
    if (selectedLead?.id === editingLead.id) {
      setSelectedLead(editingLead);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Novo': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Contatado': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Em Negociação': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Convertido': return 'bg-green-100 text-green-800 border-green-300';
      case 'Perdido': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Painel Esquerdo - Lista de Leads */}
      <div className="lg:col-span-1 space-y-4">
        {/* Alertas de Follow-up */}
        {leadsNeedingFollowUp.length > 0 && (
          <Card className="bg-red-50 border-2 border-red-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-900">
                  {leadsNeedingFollowUp.length} lead(s) precisam de follow-up
                </span>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Sem resposta há {followUpDays}+ dias
              </p>
              <div className="space-y-2">
                {leadsNeedingFollowUp.slice(0, 3).map(lead => (
                  <Button
                    key={lead.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs border-red-300 hover:bg-red-100"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {lead.nome} - {Math.floor((new Date() - new Date(lead.ultima_interacao || lead.created_date)) / (1000 * 60 * 60 * 24))} dias
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <Input
                placeholder="Buscar por nome, WhatsApp ou interesse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Contatado">Contatado</SelectItem>
                  <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                  <SelectItem value="Convertido">Convertido</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Categoria</label>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="BIM">BIM</SelectItem>
                  <SelectItem value="Gestão de Projetos e Obras">GPO</SelectItem>
                  <SelectItem value="Manutenção Predial">Predial</SelectItem>
                  <SelectItem value="Engenharia Legal">Legal</SelectItem>
                  <SelectItem value="Tecnologias 4.0">Tech 4.0</SelectItem>
                  <SelectItem value="Incubadora Profissional">Incubadora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Dias para Follow-up: {followUpDays}
              </label>
              <Input
                type="range"
                min="1"
                max="14"
                value={followUpDays}
                onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Leads */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLeads.map(lead => {
            const needsFollowUp = leadsNeedingFollowUp.some(l => l.id === lead.id);
            
            return (
              <Card
                key={lead.id}
                className={`cursor-pointer transition-all ${
                  selectedLead?.id === lead.id 
                    ? 'border-2 border-green-500 shadow-lg' 
                    : needsFollowUp
                    ? 'border-2 border-red-300'
                    : 'border hover:shadow-md'
                }`}
                onClick={() => setSelectedLead(lead)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-gray-900">{lead.nome}</h5>
                      <p className="text-xs text-gray-500">{lead.whatsapp}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </div>
                  
                  {lead.categoria_interesse && lead.categoria_interesse.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lead.categoria_interesse.slice(0, 2).map((cat, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {needsFollowUp && (
                    <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                      <Clock className="w-3 h-3" />
                      Follow-up necessário
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Painel Direito - Detalhes do Lead */}
      <div className="lg:col-span-2">
        {!selectedLead ? (
          <Card className="h-full">
            <CardContent className="p-12 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <User className="w-16 h-16 mx-auto mb-4" />
                <p>Selecione um lead para ver os detalhes</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Header do Lead */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedLead.nome}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusColor(selectedLead.status)}>
                        {selectedLead.status}
                      </Badge>
                      {selectedLead.categoria_interesse?.map((cat, i) => (
                        <Badge key={i} variant="outline" className="border-green-300 text-green-700">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline font-semibold"
                        >
                          {selectedLead.whatsapp}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {new Date(selectedLead.created_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {selectedLead.interesse && (
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Interesse:</strong> {selectedLead.interesse}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLead(selectedLead)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>

                {/* Formulário de Edição */}
                {editingLead?.id === selectedLead.id && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Status</label>
                      <Select 
                        value={editingLead.status} 
                        onValueChange={(v) => setEditingLead({...editingLead, status: v})}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Novo">Novo</SelectItem>
                          <SelectItem value="Contatado">Contatado</SelectItem>
                          <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                          <SelectItem value="Convertido">Convertido</SelectItem>
                          <SelectItem value="Perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Categorias de Interesse</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['BIM', 'Gestão de Projetos e Obras', 'Manutenção Predial', 'Engenharia Legal', 'Tecnologias 4.0', 'Incubadora Profissional', 'Geral'].map(cat => (
                          <label key={cat} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={editingLead.categoria_interesse?.includes(cat) || false}
                              onChange={(e) => {
                                const cats = editingLead.categoria_interesse || [];
                                setEditingLead({
                                  ...editingLead,
                                  categoria_interesse: e.target.checked
                                    ? [...cats, cat]
                                    : cats.filter(c => c !== cat)
                                });
                              }}
                              className="rounded"
                            />
                            <span className="text-xs">{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Notas</label>
                      <Textarea
                        value={editingLead.notas || ''}
                        onChange={(e) => setEditingLead({...editingLead, notas: e.target.value})}
                        rows={3}
                        placeholder="Notas sobre o lead..."
                        className="text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveLead} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={() => setEditingLead(null)} size="sm" variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Link da Especialização */}
                {selectedLead.categoria_interesse && getEspecializacaoLink(selectedLead.categoria_interesse) && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={getEspecializacaoLink(selectedLead.categoria_interesse)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Página da Especialização
                      </Button>
                    </a>
                  </div>
                )}

                {/* WhatsApp do Coordenador */}
                <div className="mt-3">
                  <a
                    href={`https://wa.me/5581991298803?text=Olá! Sobre o lead ${selectedLead.nome} (${selectedLead.whatsapp})...`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      💬 Falar com Coordenador sobre este Lead
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Interações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Histórico de Interações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Nova Interação */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <h4 className="text-sm font-bold text-green-900 mb-3">Registrar Nova Interação</h4>
                  <div className="space-y-2">
                    <Select 
                      value={newInteracao.tipo} 
                      onValueChange={(v) => setNewInteracao({...newInteracao, tipo: v})}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mensagem Chatbot">Mensagem Chatbot</SelectItem>
                        <SelectItem value="Contato WhatsApp">Contato WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Ligação">Ligação</SelectItem>
                        <SelectItem value="Nota">Nota</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={newInteracao.conteudo}
                      onChange={(e) => setNewInteracao({...newInteracao, conteudo: e.target.value})}
                      rows={3}
                      placeholder="Descreva a interação..."
                      className="text-sm"
                    />
                    <Button onClick={handleAddInteracao} size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Interação
                    </Button>
                  </div>
                </div>

                {/* Timeline de Interações */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedLead.historico_interacoes && selectedLead.historico_interacoes.length > 0 ? (
                    selectedLead.historico_interacoes.map((interacao, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {interacao.tipo}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(interacao.data).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{interacao.conteudo}</p>
                        {interacao.usuario && (
                          <p className="text-xs text-gray-500 mt-1">Por: {interacao.usuario}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-6">
                      Nenhuma interação registrada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Métricas do Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total de Interações</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {selectedLead.historico_interacoes?.length || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Dias Sem Resposta</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {Math.floor((new Date() - new Date(selectedLead.ultima_interacao || selectedLead.created_date)) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}