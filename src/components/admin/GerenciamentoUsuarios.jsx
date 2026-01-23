import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Edit2, Save, X, Shield, Users, Key, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function GerenciamentoUsuarios() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviteCrmAccess, setInviteCrmAccess] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users;
    },
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['userActivityLogs'],
    queryFn: () => base44.entities.CRMActivityLog.list('-timestamp', 100),
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role, crmAccess }) => {
      await base44.users.inviteUser(email, role);
      
      // Log da ação
      await base44.entities.CRMActivityLog.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'usuario_convidado',
        details: {
          email_convidado: email,
          role: role,
          crm_access: crmAccess,
        },
      });
      
      return { email, role, crmAccess };
    },
    onSuccess: () => {
      toast.success('Usuário convidado com sucesso! Um email foi enviado.');
      setInviteEmail('');
      setInviteRole('user');
      setInviteCrmAccess(false);
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['userActivityLogs']);
    },
    onError: (error) => {
      toast.error(`Erro ao convidar usuário: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      await base44.asServiceRole.entities.User.update(userId, updates);
      
      // Log da ação
      await base44.entities.CRMActivityLog.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'usuario_atualizado',
        details: {
          usuario_id: userId,
          alteracoes: updates,
        },
      });
      
      return { userId, updates };
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      setEditingUser(null);
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['userActivityLogs']);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast.error('Por favor, insira um email válido.');
      return;
    }
    inviteUserMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      crmAccess: inviteCrmAccess,
    });
  };

  const handleSaveEdit = (user) => {
    updateUserMutation.mutate({
      userId: user.id,
      updates: {
        role: user.role,
        crm_access: user.crm_access,
      },
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserActivityCount = (userEmail) => {
    return activityLogs.filter((log) => log.user_email === userEmail).length;
  };

  const isSuperAdmin = (email) => {
    return email === 'emanoel.s.amorim@gmail.com' || 
           email === 'emanoel@esuda.edu.br' || 
           email === 'vdoval@gmail.com';
  };

  const getAccessBadge = (user) => {
    if (isSuperAdmin(user.email)) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Super Admin</Badge>;
    }
    if (user.role === 'admin') {
      return <Badge className="bg-red-500 text-white">Administrador</Badge>;
    }
    if (user.crm_access) {
      return <Badge className="bg-blue-500 text-white">Acesso CRM</Badge>;
    }
    return <Badge variant="outline">Usuário Comum</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Card de Convite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Novo Usuário
          </CardTitle>
          <CardDescription>
            Convide um novo usuário e defina suas permissões de acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="inviteEmail">Email do Usuário</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="usuario@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inviteRole">Função</Label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inviteCrmAccess"
                  checked={inviteCrmAccess}
                  onCheckedChange={setInviteCrmAccess}
                />
                <Label htmlFor="inviteCrmAccess" className="text-sm">
                  Acesso CRM
                </Label>
              </div>
            </div>
          </div>
          <Button
            onClick={handleInviteUser}
            disabled={inviteUserMutation.isPending}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {inviteUserMutation.isPending ? 'Convidando...' : 'Enviar Convite'}
          </Button>
        </CardContent>
      </Card>

      {/* Card de Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Gerencie os usuários e suas permissões de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isEditing = editingUser?.id === user.id;
              const isSelf = user.email === currentUser?.email;
              const canEdit = !isSelf && !isSuperAdmin(user.email);

              return (
                <Card key={user.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{user.full_name || 'Nome não definido'}</h4>
                          {getAccessBadge(user)}
                          {isSelf && <Badge variant="outline">Você</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {getUserActivityCount(user.email)} ações registradas
                          </span>
                          <span>Criado em: {new Date(user.created_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                          {isEditing ? (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs">Função</Label>
                                <select
                                  value={editingUser.role}
                                  onChange={(e) =>
                                    setEditingUser({ ...editingUser, role: e.target.value })
                                  }
                                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                                >
                                  <option value="user">Usuário Comum</option>
                                  <option value="admin">Administrador</option>
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={editingUser.crm_access || false}
                                  onCheckedChange={(checked) =>
                                    setEditingUser({ ...editingUser, crm_access: checked })
                                  }
                                />
                                <Label className="text-xs">Acesso CRM</Label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(editingUser)}
                                  disabled={updateUserMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUser(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser({ ...user })}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar Permissões
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Legenda de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Níveis de Acesso ao Painel de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-1">
                Super Admin
              </Badge>
              <div className="flex-1">
                <p className="font-medium">Super Administrador</p>
                <p className="text-sm text-gray-600">
                  Acesso total a todas as funcionalidades do painel + ferramentas de desenvolvimento do Base44
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-red-500 text-white mt-1">Administrador</Badge>
              <div className="flex-1">
                <p className="font-medium">Administrador</p>
                <p className="text-sm text-gray-600">
                  Acesso total a todas as abas de gerenciamento de conteúdo. <strong>Não</strong> tem acesso às ferramentas de desenvolvimento do Base44.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-500 text-white mt-1">Acesso CRM</Badge>
              <div className="flex-1">
                <p className="font-medium">Usuário com Acesso CRM</p>
                <p className="text-sm text-gray-600">
                  Acesso total a todas as abas de gerenciamento de conteúdo. Todas as ações são registradas no log de atividades.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">Usuário Comum</Badge>
              <div className="flex-1">
                <p className="font-medium">Usuário Comum</p>
                <p className="text-sm text-gray-600">
                  Acesso apenas às páginas públicas do aplicativo. Sem acesso ao painel de administrador.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}