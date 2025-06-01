import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Edit, Trash2, Mail, User, Send, Shield, Clock, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { ProtectedComponent } from "@/components/ProtectedComponent";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  permissao: string;
  status: string;
  empresa_id: string;
  empresa_nome: string;
  permissions: any;
  invite_token?: string;
  invite_expires_at?: string;
  accepted_at?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface PermissionForm {
  patients: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  measurements: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  reports: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  settings: { view: boolean; edit: boolean };
  collaborators: { view: boolean; manage: boolean };
}

export function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { canManageCollaborators, isOwner } = usePermissions();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    permissao: "visualizar",
    status: "pendente"
  });

  const [permissionForm, setPermissionForm] = useState<PermissionForm>({
    patients: { view: true, create: false, edit: false, delete: false },
    measurements: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, edit: false },
    collaborators: { view: false, manage: false }
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchColaboradores();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
    }
  };

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data: userData } = await supabase
        .from('usuarios')
        .select('clinica_nome')
        .eq('id', session.user.id)
        .single();

      if (userData?.clinica_nome) {
        const { data: colaboradoresData, error } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('empresa_nome', userData.clinica_nome)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setColaboradores(colaboradoresData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const updatePermissionsByRole = (role: string) => {
    switch (role) {
      case 'admin':
        setPermissionForm({
          patients: { view: true, create: true, edit: true, delete: true },
          measurements: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
          collaborators: { view: true, manage: true }
        });
        break;
      case 'editar':
        setPermissionForm({
          patients: { view: true, create: true, edit: true, delete: false },
          measurements: { view: true, create: true, edit: true, delete: false },
          reports: { view: true, create: true, edit: false, delete: false },
          settings: { view: false, edit: false },
          collaborators: { view: false, manage: false }
        });
        break;
      case 'visualizar':
        setPermissionForm({
          patients: { view: true, create: false, edit: false, delete: false },
          measurements: { view: true, create: false, edit: false, delete: false },
          reports: { view: true, create: false, edit: false, delete: false },
          settings: { view: false, edit: false },
          collaborators: { view: false, manage: false }
        });
        break;
    }
  };

  const sendInvitation = async (colaborador: Colaborador) => {
    if (!currentUser?.nome) {
      toast.error('Dados do usuário não encontrados');
      return;
    }

    setSending(colaborador.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/v1/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: colaborador.email,
          nome: colaborador.nome,
          permissao: colaborador.permissao,
          permissions: colaborador.permissions,
          empresa_nome: currentUser.clinica_nome,
          invited_by_name: currentUser.nome
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Convite enviado com sucesso!');
        fetchColaboradores();
      } else {
        throw new Error(result.error || 'Erro ao enviar convite');
      }
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    } finally {
      setSending(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.clinica_nome) {
      toast.error('Nome da clínica não encontrado');
      return;
    }

    try {
      const colaboradorData = {
        ...formData,
        permissions: permissionForm,
        empresa_nome: currentUser.clinica_nome,
        empresa_id: currentUser.id
      };

      if (editingColaborador) {
        const { error } = await supabase
          .from('colaboradores')
          .update(colaboradorData)
          .eq('id', editingColaborador.id);

        if (error) throw error;
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('colaboradores')
          .insert(colaboradorData);

        if (error) throw error;
        toast.success('Colaborador adicionado com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const resetForm = () => {
    setEditingColaborador(null);
    setFormData({ nome: "", email: "", permissao: "visualizar", status: "pendente" });
    setPermissionForm({
      patients: { view: true, create: false, edit: false, delete: false },
      measurements: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, edit: false },
      collaborators: { view: false, manage: false }
    });
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      permissao: colaborador.permissao,
      status: colaborador.status
    });
    setPermissionForm(colaborador.permissions || permissionForm);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return;

    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Colaborador removido com sucesso!');
      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error);
      toast.error(`Erro ao remover: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string, inviteExpires?: string) => {
    const now = new Date();
    const expiresAt = inviteExpires ? new Date(inviteExpires) : null;
    const isExpired = expiresAt && now > expiresAt;

    if (status === 'pendente' && isExpired) {
      return <Badge variant="destructive">Convite Expirado</Badge>;
    }

    const variants = {
      ativo: "default",
      pendente: "secondary",
      inativo: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status === 'ativo' ? 'Ativo' : status === 'pendente' ? 'Aguardando' : 'Inativo'}
      </Badge>
    );
  };

  const getPermissaoBadge = (permissao: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      editar: "bg-blue-100 text-blue-800",
      visualizar: "bg-green-100 text-green-800"
    } as const;

    const names = {
      admin: "Administrador",
      editar: "Editor", 
      visualizar: "Visualizador"
    } as const;

    return (
      <Badge className={colors[permissao as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {names[permissao as keyof typeof names] || permissao}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedComponent module="collaborators" action="view">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Gerenciar Colaboradores</h3>
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'Gerencie sua equipe e configure permissões' : 'Visualize os membros da equipe'}
            </p>
          </div>
          
          <ProtectedComponent module="collaborators" action="manage" showAlert={false}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-turquesa hover:bg-turquesa/90" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingColaborador ? 'Editar Colaborador' : 'Convidar Novo Colaborador'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        placeholder="Nome do colaborador"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="permissao">Cargo / Hierarquia</Label>
                    <Select 
                      value={formData.permissao} 
                      onValueChange={(value) => {
                        setFormData({...formData, permissao: value});
                        updatePermissionsByRole(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visualizar">Visualizador - Apenas visualizar</SelectItem>
                        <SelectItem value="editar">Editor - Criar e editar</SelectItem>
                        <SelectItem value="admin">Administrador - Controle total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Permissões Detalhadas</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure exatamente o que este colaborador pode fazer no sistema
                    </p>
                    
                    <div className="space-y-4">
                      {/* Pacientes */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Pacientes
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`patients-${action}`}
                                checked={permissionForm.patients[action]}
                                onCheckedChange={(checked) => 
                                  setPermissionForm(prev => ({
                                    ...prev,
                                    patients: { ...prev.patients, [action]: !!checked }
                                  }))
                                }
                              />
                              <Label htmlFor={`patients-${action}`} className="text-sm">
                                {action === 'view' ? 'Ver' : 
                                 action === 'create' ? 'Criar' : 
                                 action === 'edit' ? 'Editar' : 'Excluir'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medições */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Medições</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`measurements-${action}`}
                                checked={permissionForm.measurements[action]}
                                onCheckedChange={(checked) => 
                                  setPermissionForm(prev => ({
                                    ...prev,
                                    measurements: { ...prev.measurements, [action]: !!checked }
                                  }))
                                }
                              />
                              <Label htmlFor={`measurements-${action}`} className="text-sm">
                                {action === 'view' ? 'Ver' : 
                                 action === 'create' ? 'Criar' : 
                                 action === 'edit' ? 'Editar' : 'Excluir'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relatórios */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Relatórios</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`reports-${action}`}
                                checked={permissionForm.reports[action]}
                                onCheckedChange={(checked) => 
                                  setPermissionForm(prev => ({
                                    ...prev,
                                    reports: { ...prev.reports, [action]: !!checked }
                                  }))
                                }
                              />
                              <Label htmlFor={`reports-${action}`} className="text-sm">
                                {action === 'view' ? 'Ver' : 
                                 action === 'create' ? 'Criar' : 
                                 action === 'edit' ? 'Editar' : 'Excluir'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Configurações */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Configurações do Sistema
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {(['view', 'edit'] as const).map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`settings-${action}`}
                                checked={permissionForm.settings[action]}
                                onCheckedChange={(checked) => 
                                  setPermissionForm(prev => ({
                                    ...prev,
                                    settings: { ...prev.settings, [action]: !!checked }
                                  }))
                                }
                              />
                              <Label htmlFor={`settings-${action}`} className="text-sm">
                                {action === 'view' ? 'Visualizar' : 'Editar'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Colaboradores */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Gerenciar Colaboradores</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {(['view', 'manage'] as const).map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`collaborators-${action}`}
                                checked={permissionForm.collaborators[action]}
                                onCheckedChange={(checked) => 
                                  setPermissionForm(prev => ({
                                    ...prev,
                                    collaborators: { ...prev.collaborators, [action]: !!checked }
                                  }))
                                }
                              />
                              <Label htmlFor={`collaborators-${action}`} className="text-sm">
                                {action === 'view' ? 'Visualizar' : 'Gerenciar'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-turquesa hover:bg-turquesa/90">
                      {editingColaborador ? 'Atualizar' : 'Enviar Convite'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </ProtectedComponent>
        </div>

        <div className="grid gap-4">
          {colaboradores.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {canManageCollaborators() 
                    ? 'Adicione membros à sua equipe para começar a colaborar.'
                    : 'Aguarde ser adicionado como colaborador.'
                  }
                </p>
                <ProtectedComponent module="collaborators" action="manage" showAlert={false}>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(true);
                    }}
                    className="bg-turquesa hover:bg-turquesa/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Convidar Primeiro Colaborador
                  </Button>
                </ProtectedComponent>
              </CardContent>
            </Card>
          ) : (
            colaboradores.map((colaborador) => {
              const isExpired = colaborador.invite_expires_at && 
                new Date() > new Date(colaborador.invite_expires_at);
              
              return (
                <Card key={colaborador.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-turquesa/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-turquesa" />
                        </div>
                        <div>
                          <h4 className="font-medium">{colaborador.nome}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {colaborador.email}
                          </div>
                          {colaborador.last_login && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              Último login: {new Date(colaborador.last_login).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getPermissaoBadge(colaborador.permissao)}
                        {getStatusBadge(colaborador.status, colaborador.invite_expires_at)}
                        
                        {colaborador.status === 'pendente' && !isExpired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendInvitation(colaborador)}
                            disabled={sending === colaborador.id}
                          >
                            {sending === colaborador.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Send className="h-3 w-3 mr-1" />
                            )}
                            Reenviar
                          </Button>
                        )}

                        <ProtectedComponent module="collaborators" action="manage" showAlert={false}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(colaborador)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(colaborador.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </ProtectedComponent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ProtectedComponent>
  );
}
