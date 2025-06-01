
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePermissions, type Permissions } from "@/hooks/usePermissions";
import { useColaboradores } from "@/hooks/useColaboradores";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { ColaboradorForm } from "./colaboradores/ColaboradorForm";
import { ColaboradorCard } from "./colaboradores/ColaboradorCard";

export function ColaboradoresTab() {
  const [sending, setSending] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const { canManageCollaborators, isOwner } = usePermissions();
  
  const {
    colaboradores,
    loading,
    saveColaborador,
    deleteColaborador,
    sendInvitation
  } = useColaboradores();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    permissao: "visualizar",
    status: "pendente"
  });

  const [permissionForm, setPermissionForm] = useState<Permissions>({
    patients: { view: true, create: false, edit: false, delete: false },
    measurements: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, edit: false },
    collaborators: { view: false, manage: false }
  });

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

  const handleSendInvitation = async (colaborador: any) => {
    setSending(colaborador.id);
    await sendInvitation(colaborador);
    setSending(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveColaborador(formData, permissionForm, editingColaborador);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
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

  const handleEdit = (colaborador: any) => {
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      permissao: colaborador.permissao,
      status: colaborador.status
    });
    
    try {
      if (colaborador.permissions && typeof colaborador.permissions === 'object') {
        setPermissionForm(colaborador.permissions as Permissions);
      } else {
        updatePermissionsByRole(colaborador.permissao);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      updatePermissionsByRole(colaborador.permissao);
    }
    
    setIsDialogOpen(true);
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
                <ColaboradorForm
                  formData={formData}
                  permissionForm={permissionForm}
                  editingColaborador={editingColaborador}
                  onFormDataChange={setFormData}
                  onPermissionFormChange={setPermissionForm}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  updatePermissionsByRole={updatePermissionsByRole}
                />
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
            colaboradores.map((colaborador) => (
              <ColaboradorCard
                key={colaborador.id}
                colaborador={colaborador}
                sending={sending}
                onSendInvitation={handleSendInvitation}
                onEdit={handleEdit}
                onDelete={deleteColaborador}
              />
            ))
          )}
        </div>
      </div>
    </ProtectedComponent>
  );
}
