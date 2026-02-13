import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Plus, Send, Users, Calendar, Filter, Eye, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '../editor/RichTextEditor';

export default function CampanhaEmailManager({ currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assunto: '',
    conteudo: '',
    template_id: null,
    agendamento: null
  });
  const [filtros, setFiltros] = useState({
    curso: 'todos',
    status_crm: 'todos',
    inscricao_paga: 'todos',
    grupo: 'todos'
  });
  const [destinatariosPreview, setDestinatariosPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const queryClient = useQueryClient();

  const { data: inscritos = [] } = useQuery({
    queryKey: ['inscritos'],
    queryFn: () => base44.entities.Inscrito.list('-data_inscricao')
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas-email'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date')
  });

  const createCampanhaMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.EmailCampaign.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas-email'] });
      toast.success('Campanha criada com sucesso!');
      resetForm();
    },
    onError: () => toast.error('Erro ao criar campanha')
  });

  const enviarCampanhaMutation = useMutation({
    mutationFn: async ({ campanha_id, destinatarios }) => {
      const { sendBulkEmail } = await import('@/functions/sendBulkEmail');
      const campanha = campanhas.find(c => c.id === campanha_id);
      
      return await sendBulkEmail({
        assunto: campanha.assunto,
        conteudo: campanha.conteudo,
        destinatarios: destinatarios
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas-email'] });
      toast.success('Campanha enviada com sucesso!');
    },
    onError: () => toast.error('Erro ao enviar campanha')
  });

  const cursosDisponiveis = [...new Set(inscritos.map(i => i.nome_curso).filter(Boolean))];

  const aplicarFiltros = () => {
    let filtered = [...inscritos];

    if (filtros.curso !== 'todos') {
      filtered = filtered.filter(i => i.nome_curso?.includes(filtros.curso));
    }

    if (filtros.status_crm !== 'todos') {
      filtered = filtered.filter(i => i.status_crm === filtros.status_crm);
    }

    if (filtros.inscricao_paga !== 'todos') {
      const isPago = filtros.inscricao_paga === 'sim';
      filtered = filtered.filter(i => i.inscricao_paga === isPago);
    }

    if (filtros.grupo !== 'todos') {
      filtered = filtered.filter(i => i.grupo_monitoramento === filtros.grupo);
    }

    const destinatarios = filtered
      .filter(i => i.email && i.email.includes('@'))
      .map(i => ({
        email: i.email,
        nome: i.nome_completo
      }));

    setDestinatariosPreview(destinatarios);
    setShowPreview(true);
  };

  const aplicarTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        assunto: template.assunto,
        conteudo: template.conteudo,
        template_id: templateId
      });
      toast.success('Template aplicado!');
    }
  };

  const handleCriarCampanha = async () => {
    if (!formData.assunto || !formData.conteudo) {
      toast.error('Preencha assunto e conteúdo');
      return;
    }

    if (destinatariosPreview.length === 0) {
      toast.error('Nenhum destinatário selecionado');
      return;
    }

    const data = {
      assunto: formData.assunto,
      conteudo: formData.conteudo,
      total_destinatarios: destinatariosPreview.length,
      destinatarios: destinatariosPreview,
      status: formData.agendamento ? 'Agendado' : 'Enviado',
      template_id: formData.template_id,
      data_envio: formData.agendamento || new Date().toISOString()
    };

    createCampanhaMutation.mutate(data);

    // Se não for agendamento, enviar imediatamente
    if (!formData.agendamento) {
      const campanha = await createCampanhaMutation.mutateAsync(data);
      enviarCampanhaMutation.mutate({
        campanha_id: campanha.id,
        destinatarios: destinatariosPreview
      });
    }
  };

  const resetForm = () => {
    setFormData({
      assunto: '',
      conteudo: '',
      template_id: null,
      agendamento: null
    });
    setFiltros({
      curso: 'todos',
      status_crm: 'todos',
      inscricao_paga: 'todos',
      grupo: 'todos'
    });
    setDestinatariosPreview([]);
    setShowPreview(false);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campanhas de Email</h2>
          <p className="text-gray-600 text-sm">Crie e gerencie campanhas segmentadas para inscritos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50">
            <CardTitle>Criar Nova Campanha de Email</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Filtros de Destinatários */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtrar Destinatários
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Curso</label>
                  <Select value={filtros.curso} onValueChange={(v) => setFiltros({ ...filtros, curso: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Cursos</SelectItem>
                      {cursosDisponiveis.map(curso => (
                        <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status CRM</label>
                  <Select value={filtros.status_crm} onValueChange={(v) => setFiltros({ ...filtros, status_crm: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Novo">Novo</SelectItem>
                      <SelectItem value="Contatado">Contatado</SelectItem>
                      <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                      <SelectItem value="Sem Resposta">Sem Resposta</SelectItem>
                      <SelectItem value="Desistente">Desistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Inscrição Paga</label>
                  <Select value={filtros.inscricao_paga} onValueChange={(v) => setFiltros({ ...filtros, inscricao_paga: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="sim">Sim (Pagos)</SelectItem>
                      <SelectItem value="nao">Não (Pendentes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Grupo</label>
                  <Select value={filtros.grupo} onValueChange={(v) => setFiltros({ ...filtros, grupo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Grupos</SelectItem>
                      <SelectItem value="G1_Cursos_Atuais">G1 - Cursos Atuais</SelectItem>
                      <SelectItem value="G2_Cursos_Legacy_Pos_Ago2024">G2 - Cursos Legacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={aplicarFiltros} className="w-full bg-green-600 hover:bg-green-700">
                <Users className="w-4 h-4 mr-2" />
                Aplicar Filtros e Visualizar Destinatários
              </Button>
            </div>

            {/* Preview de Destinatários */}
            {showPreview && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {destinatariosPreview.length} Destinatários Selecionados
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => setShowPreview(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto bg-white p-3 rounded border">
                  <div className="space-y-1">
                    {destinatariosPreview.slice(0, 10).map((dest, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        {dest.nome} - {dest.email}
                      </p>
                    ))}
                    {destinatariosPreview.length > 10 && (
                      <p className="text-sm text-gray-500 italic">
                        + {destinatariosPreview.length - 10} destinatários...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template */}
            <div>
              <label className="block text-sm font-medium mb-1">Template (opcional)</label>
              <Select value={formData.template_id || ''} onValueChange={aplicarTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum template</SelectItem>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium mb-1">Assunto do Email *</label>
              <Input
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                placeholder="Ex: Última chance para matrícula - Curso BIM"
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label className="block text-sm font-medium mb-1">Conteúdo do Email *</label>
              <RichTextEditor
                value={formData.conteudo}
                onChange={(value) => setFormData({ ...formData, conteudo: value })}
                placeholder="Digite o conteúdo do email..."
              />
            </div>

            {/* Agendamento */}
            <div>
              <label className="block text-sm font-medium mb-1">Agendar Envio (opcional)</label>
              <Input
                type="datetime-local"
                value={formData.agendamento || ''}
                onChange={(e) => setFormData({ ...formData, agendamento: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para enviar imediatamente
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCriarCampanha}
                disabled={createCampanhaMutation.isPending || destinatariosPreview.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {formData.agendamento ? 'Criar e Agendar' : 'Criar e Enviar Agora'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Campanhas */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Campanhas Criadas ({campanhas.length})</h3>
        <div className="space-y-3">
          {campanhas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma campanha criada ainda</p>
          ) : (
            campanhas.map(campanha => (
              <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900">{campanha.assunto}</h4>
                        <Badge className={
                          campanha.status === 'Enviado' ? 'bg-green-600 text-white' :
                          campanha.status === 'Agendado' ? 'bg-blue-600 text-white' :
                          'bg-red-600 text-white'
                        }>
                          {campanha.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {campanha.total_destinatarios} destinatários
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(campanha.data_envio || campanha.created_date).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {campanha.template_id && (
                        <Badge variant="outline" className="text-xs">
                          Template: {templates.find(t => t.id === campanha.template_id)?.nome}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            assunto: campanha.assunto,
                            conteudo: campanha.conteudo,
                            template_id: campanha.template_id,
                            agendamento: null
                          });
                          setDestinatariosPreview(campanha.destinatarios || []);
                          setShowPreview(true);
                          setShowForm(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {campanha.status === 'Agendado' && (
                        <Button
                          size="sm"
                          onClick={() => enviarCampanhaMutation.mutate({
                            campanha_id: campanha.id,
                            destinatarios: campanha.destinatarios
                          })}
                          disabled={enviarCampanhaMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}