
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { User, Shield } from "lucide-react";
import { type Permissions } from "@/hooks/usePermissions";

interface ColaboradorFormProps {
  formData: {
    nome: string;
    email: string;
    permissao: string;
    status: string;
  };
  permissionForm: Permissions;
  editingColaborador: any;
  onFormDataChange: (data: any) => void;
  onPermissionFormChange: (permissions: Permissions) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  updatePermissionsByRole: (role: string) => void;
}

export function ColaboradorForm({
  formData,
  permissionForm,
  editingColaborador,
  onFormDataChange,
  onPermissionFormChange,
  onSubmit,
  onCancel,
  updatePermissionsByRole
}: ColaboradorFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => onFormDataChange({...formData, nome: e.target.value})}
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
            onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
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
            onFormDataChange({...formData, permissao: value});
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
                      onPermissionFormChange({
                        ...permissionForm,
                        patients: { ...permissionForm.patients, [action]: !!checked }
                      })
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
                      onPermissionFormChange({
                        ...permissionForm,
                        measurements: { ...permissionForm.measurements, [action]: !!checked }
                      })
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
                      onPermissionFormChange({
                        ...permissionForm,
                        reports: { ...permissionForm.reports, [action]: !!checked }
                      })
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
                      onPermissionFormChange({
                        ...permissionForm,
                        settings: { ...permissionForm.settings, [action]: !!checked }
                      })
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
                      onPermissionFormChange({
                        ...permissionForm,
                        collaborators: { ...permissionForm.collaborators, [action]: !!checked }
                      })
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-turquesa hover:bg-turquesa/90">
          {editingColaborador ? 'Atualizar' : 'Enviar Convite'}
        </Button>
      </div>
    </form>
  );
}
