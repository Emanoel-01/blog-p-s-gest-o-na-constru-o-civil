import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Send, Users, User, Trash2, Search, BookOpen, Briefcase, MessageCircle, Calendar, Zap, TrendingUp, Eye } from 'lucide-react';

export default function NotificationManager({ allNotificacoes }) {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('manual');
  
  // Estados para envio manual
  const [notifForm, setNotifForm] = useState({
    tipo: 'Acadêmico',
    titulo: '',
    mensagem: '',
    link_destino: ''
  });
  
  const [destinatarioTipo, setDestinatarioTipo] = useState('individual'); // individual, turma, especializacao, todos
  const [destinatarioValor, setDestinatarioValor] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');

  // Buscar discentes e especializações
  const { data: discentes = [] } = useQuery({
    queryKey: ['discentes-notif'],
    queryFn: () => base44.entities.Discente.list('nome')
  });

  const { data: especializacoes = [] } = useQuery({
    queryKey: ['especializacoes-notif'],
    queryFn: () => base44.entities.Especializacao.list('ordem')
  });

  // Extrair turmas únicas
  const turmasDisponiveis = useMemo(() => {
    const turmas = new Set();
    discentes.forEach(d => {
      if (d.numero_turma) turmas.add(d.numero_turma);
    });
    return Array.from(turmas).sort();
  }, [discentes]);

  // Filtrar usuários para busca
  const usuariosFiltrados = useMemo(() => {
    if (!searchUsuario) return [];
    const termo = searchUsuario.toLowerCase();
    return discentes.filter(d => 
      d.nome.toLowerCase().includes(termo) || d.email.toLowerCase().includes(termo)
    ).slice(0, 10);
  }, [discentes, searchUsuario]);

  // Calcular destinatários
  const calcularDestinatarios = () => {
    if (destinatarioTipo === 'individual') {
      const usuario = discentes.find(d => d.id === destinatarioValor);
      return usuario ? [usuario.email] : [];
    }
    
    if (destinatarioTipo === 'turma') {
      return discentes
        .filter(d => d.numero_turma === destinatarioValor)
        .map(d => d.email);
    }
    
    if (destinatarioTipo === 'especializacao') {
      return discentes
        .filter(d => d.especializacoes?.includes(destinatarioValor))
        .map(d => d.email);
    }
    
    if (destinatarioTipo === 'todos') {
      return discentes.map(d => d.email);
    }
    
    return [];
  };

  const destinatariosCalculados = calcularDestinatarios();

  // Mutation para criar notificações
  const createNotifMutation = useMutation({
    mutationFn: async (emails) => {
      const notificacoes = emails.map(email => ({
        destinatario_email: email,
        tipo: notifForm.tipo,
        titulo: notifForm.titulo,
        mensagem: notifForm.mensagem,
        link_destino: notifForm.link_destino || ''
      }));
      
      return await base44.entities.Notificacao.bulkCreate(notificacoes);
    },
    onSuccess: (_, emails) => {
      queryClient.invalidateQueries(['admin-notificacoes']);
      setNotifForm({
        tipo: 'Acadêmico',
        titulo: '',
        mensagem: '',
        link_destino: ''
      });
      setDestinatarioValor('');
      setSearchUsuario('');
      toast.success(`${emails.length} notificação(ões) enviada(s) com sucesso!`);
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificações: ' + error.message);
    }
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id) => base44.entities.Notificacao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notificacoes']);
      toast.success('Notificação removida!');
    }
  });

  const handleEnviar = () => {
    if (!notifForm.titulo || !notifForm.mensagem) {
      toast.error('Título e mensagem são obrigatórios!');
      return;
    }
    
    if (destinatariosCalculados.length === 0) {
      toast.error('Selecione pelo menos um destinatário!');
      return;
    }

    createNotifMutation.mutate(destinatariosCalculados);
  };

  // Templates de notificações automáticas
  const templatesAutomaticos = [
    {
      id: 'boas-vindas',
      categoria: 'Acadêmico',
      titulo: 'Bem-vindo à Comunidade ESUDA!',
      mensagem: 'Seu acesso está liberado. Complete seu perfil agora para se conectar com parceiros e oportunidades.',
      link_destino: '/meu-perfil',
      trigger: 'Primeiro login do usuário',
      status: 'Ativo'
    },
    {
      id: 'lembrete-aula',
      categoria: 'Acadêmico',
      titulo: 'Aula Amanhã: [Nome da Disciplina]',
      mensagem: 'Verifique o horário e a sala da sua aula de amanhã.',
      link_destino: '/calendario',
      trigger: 'Job diário - aula no dia seguinte',
      status: 'Ativo'
    },
    {
      id: 'match-skill',
      categoria: 'Carreira',
      titulo: 'Vaga Compatível Encontrada',
      mensagem: 'Um parceiro busca profissionais com suas competências. Confira os detalhes.',
      link_destino: '/incubadora',
      trigger: 'Nova oportunidade com match de skills',
      status: 'Planejado'
    },
    {
      id: 'lembrete-roi',
      categoria: 'Carreira',
      titulo: 'Atualize seu Portfólio',
      mensagem: 'Teve alguma conquista profissional ou economia em obra este mês? Registre na Incubadora.',
      link_destino: '/incubadora/novo',
      trigger: 'Sem atividade na Incubadora há 30 dias',
      status: 'Ativo'
    },
    {
      id: 'prova-social',
      categoria: 'Carreira',
      titulo: 'Conquista na Comunidade',
      mensagem: 'Veja a nova contratação/conquista de um membro da nossa comunidade.',
      link_destino: '/home',
      trigger: 'Item marcado como Destaque',
      status: 'Planejado'
    },
    {
      id: 'resposta-comentario',
      categoria: 'Engajamento',
      titulo: 'Você recebeu uma resposta!',
      mensagem: 'O Coordenador/Professor comentou na sua publicação. Veja a resposta.',
      link_destino: '/blog/[post_id]',
      trigger: 'Admin/Docente responde comentário',
      status: 'Ativo'
    },
    {
      id: 'visitas-perfil',
      categoria: 'Engajamento',
      titulo: 'Seu perfil está sendo visto',
      mensagem: 'Seu perfil apareceu em buscas de parceiros esta semana. Mantenha-o atualizado!',
      link_destino: '/meu-perfil',
      trigger: 'Job semanal - visualizações de perfil',
      status: 'Planejado'
    }
  ];

  const getCategoryIcon = (categoria) => {
    if (categoria === 'Acadêmico') return <BookOpen className="w-4 h-4" />;
    if (categoria === 'Carreira') return <Briefcase className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const getCategoryColor = (categoria) => {
    if (categoria === 'Acadêmico') return 'bg-red-100 text-red-800 border-red-300';
    if (categoria === 'Carreira') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div>
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="manual">
            <Send className="w-4 h-4 mr-2" />
            Enviar Notificação
          </TabsTrigger>
          <TabsTrigger value="automaticas">
            <Zap className="w-4 h-4 mr-2" />
            Notificações Automáticas
          </TabsTrigger>
          <TabsTrigger value="historico">
            <Eye className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab: Enviar Notificação Manual */}
        <TabsContent value="manual">
          <Card className="bg-violet-50 border-2 border-violet-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-700" />
                Enviar Nova Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção de Destinatários */}
              <div className="bg-white p-4 rounded-lg border-2 border-violet-200">
                <h4 className="text-sm font-bold text-gray-800 mb-3">👥 Selecionar Destinatários</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Envio</label>
                    <Select value={destinatarioTipo} onValueChange={(v) => { setDestinatarioTipo(v); setDestinatarioValor(''); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          <User className="w-4 h-4 inline mr-2" />
                          Usuário Individual
                        </SelectItem>
                        <SelectItem value="turma">
                          <Users className="w-4 h-4 inline mr-2" />
                          Por Turma
                        </SelectItem>
                        <SelectItem value="especializacao">
                          <BookOpen className="w-4 h-4 inline mr-2" />
                          Por Especialização
                        </SelectItem>
                        <SelectItem value="todos">
                          <Bell className="w-4 h-4 inline mr-2" />
                          Todos os Usuários
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seleção específica baseada no tipo */}
                  {destinatarioTipo === 'individual' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar Usuário</label>
                      <div className="relative">
                        <Input
                          value={searchUsuario}
                          onChange={(e) => setSearchUsuario(e.target.value)}
                          placeholder="Digite nome ou email..."
                          className="pr-8"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      </div>
                      {searchUsuario && (
                        <div className="mt-2 bg-white border rounded-lg max-h-48 overflow-y-auto">
                          {usuariosFiltrados.length === 0 ? (
                            <p className="text-sm text-gray-500 p-3 italic">Nenhum usuário encontrado</p>
                          ) : (
                            usuariosFiltrados.map(usuario => (
                              <button
                                key={usuario.id}
                                onClick={() => {
                                  setDestinatarioValor(usuario.id);
                                  setSearchUsuario(usuario.nome);
                                }}
                                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-0 transition-colors"
                              >
                                <p className="font-semibold text-sm text-gray-800">{usuario.nome}</p>
                                <p className="text-xs text-gray-500">{usuario.email}</p>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {destinatarioTipo === 'turma' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Selecionar Turma</label>
                      <Select value={destinatarioValor} onValueChange={setDestinatarioValor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmasDisponiveis.map(turma => (
                            <SelectItem key={turma} value={turma}>
                              Turma {turma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {destinatarioTipo === 'especializacao' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Selecionar Especialização</label>
                      <Select value={destinatarioValor} onValueChange={setDestinatarioValor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha a especialização" />
                        </SelectTrigger>
                        <SelectContent>
                          {especializacoes.map(espec => (
                            <SelectItem key={espec.id} value={espec.id}>
                              {espec.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Contador de destinatários */}
                {destinatariosCalculados.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                    <p className="text-sm font-bold text-green-800">
                      ✅ {destinatariosCalculados.length} destinatário(s) selecionado(s)
                    </p>
                    {destinatarioTipo === 'individual' && destinatarioValor && (
                      <p className="text-xs text-green-700 mt-1">
                        {discentes.find(d => d.id === destinatarioValor)?.email}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Conteúdo da Notificação */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                <Select value={notifForm.tipo} onValueChange={(v) => setNotifForm({...notifForm, tipo: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acadêmico">
                      <BookOpen className="w-4 h-4 inline mr-2 text-red-600" />
                      Acadêmico (Vermelho)
                    </SelectItem>
                    <SelectItem value="Carreira">
                      <Briefcase className="w-4 h-4 inline mr-2 text-green-600" />
                      Carreira (Verde)
                    </SelectItem>
                    <SelectItem value="Engajamento">
                      <MessageCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                      Engajamento (Azul)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Título da Notificação</label>
                <Input
                  value={notifForm.titulo}
                  onChange={(e) => setNotifForm({...notifForm, titulo: e.target.value})}
                  placeholder="Ex: Aula Amanhã: Gestão BIM"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Mensagem</label>
                <Textarea
                  value={notifForm.mensagem}
                  onChange={(e) => setNotifForm({...notifForm, mensagem: e.target.value})}
                  rows={4}
                  placeholder="Digite a mensagem que os usuários receberão..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Link de Destino (Opcional)</label>
                <Input
                  value={notifForm.link_destino}
                  onChange={(e) => setNotifForm({...notifForm, link_destino: e.target.value})}
                  placeholder="Ex: /calendario ou https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco se não houver ação específica
                </p>
              </div>

              <Button
                onClick={handleEnviar}
                disabled={createNotifMutation.isPending || destinatariosCalculados.length === 0}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3"
              >
                {createNotifMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar para {destinatariosCalculados.length} pessoa(s)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Notificações Automáticas */}
        <TabsContent value="automaticas">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-700" />
                Sistema de Notificações Automáticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-6 text-justify">
                Estas notificações são disparadas automaticamente pelo sistema baseadas em gatilhos (triggers) 
                específicos. Elas são gerenciadas pela função backend <code className="bg-gray-200 px-2 py-1 rounded">processNotifications.js</code>.
              </p>

              <div className="space-y-4">
                {templatesAutomaticos.map((template) => (
                  <Card key={template.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getCategoryColor(template.categoria)} border`}>
                              {getCategoryIcon(template.categoria)}
                              <span className="ml-1">{template.categoria}</span>
                            </Badge>
                            <Badge 
                              className={template.status === 'Ativo' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}
                            >
                              {template.status}
                            </Badge>
                          </div>
                          
                          <h4 className="font-bold text-gray-900 mb-1">{template.titulo}</h4>
                          <p className="text-sm text-gray-700 mb-2">{template.mensagem}</p>
                          
                          <div className="bg-gray-50 rounded-md p-2 mt-3">
                            <p className="text-xs text-gray-600">
                              <strong>Trigger:</strong> {template.trigger}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Link:</strong> {template.link_destino}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mt-6">
                <p className="text-sm text-yellow-800">
                  <strong>ℹ️ Nota Técnica:</strong> As notificações automáticas são processadas pela função backend 
                  <code className="mx-1 bg-yellow-200 px-2 py-0.5 rounded">processNotifications.js</code>. 
                  Para editar a lógica dos gatilhos ou adicionar novos, entre em contato com o desenvolvedor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Histórico de Notificações Enviadas</h3>
              <p className="text-sm text-gray-600">
                Total de {allNotificacoes.length} notificação(ões) no sistema
              </p>
            </div>

            <div className="grid gap-3">
              {allNotificacoes.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 italic">Nenhuma notificação enviada ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                allNotificacoes.map((notif) => (
                  <Card key={notif.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getCategoryColor(notif.tipo)} border`}>
                              {getCategoryIcon(notif.tipo)}
                              <span className="ml-1">{notif.tipo}</span>
                            </Badge>
                            {notif.lida ? (
                              <Badge variant="outline" className="text-xs border-gray-300">
                                ✓ Lida
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 text-xs border border-red-300">
                                ● Não lida
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-gray-800 mb-1">{notif.titulo}</h4>
                          <p className="text-sm text-gray-600 mb-2">{notif.mensagem}</p>
                          
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-3">
                            <p>
                              <strong>Para:</strong> {notif.destinatario_email}
                            </p>
                            <p>
                              <strong>Enviada em:</strong> {new Date(notif.created_date).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(notif.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          
                          {notif.link_destino && (
                            <p className="text-xs text-blue-600 mt-2">
                              🔗 Link: {notif.link_destino}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm('Remover esta notificação do histórico?')) {
                              deleteNotifMutation.mutate(notif.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}