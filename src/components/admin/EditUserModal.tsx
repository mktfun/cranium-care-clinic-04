
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "./UsersManagement";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onEditUser: (user: User) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onEditUser,
}) => {
  const [nome, setNome] = useState(user.nome || "");
  const [adminRole, setAdminRole] = useState(user.admin_role || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Update local state when user changes
    if (user) {
      setNome(user.nome || "");
      setAdminRole(user.admin_role || false);
    }
  }, [user]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      await onEditUser({
        ...user,
        nome,
        admin_role: adminRole,
      });
      handleClose();
    } catch (error: any) {
      setError(error.message || "Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl text-turquesa">Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-gray-500">O email não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do usuário"
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="admin"
              checked={adminRole}
              onCheckedChange={(checked) => setAdminRole(!!checked)}
              disabled={loading}
            />
            <Label htmlFor="admin" className="text-sm font-medium leading-none">
              Usuário é administrador
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-turquesa hover:bg-turquesa/90">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
