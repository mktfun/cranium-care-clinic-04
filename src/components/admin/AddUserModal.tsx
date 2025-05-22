
import React, { useState } from "react";
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

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (user: Partial<User>) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onAddUser,
}) => {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [adminRole, setAdminRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setNome("");
    setAdminRole(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email) {
      setError("Email é obrigatório");
      return;
    }
    
    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    if (!nome) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      await onAddUser({
        email,
        nome,
        admin_role: adminRole,
      });
      handleClose();
    } catch (error: any) {
      setError(error.message || "Erro ao adicionar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl text-turquesa">Adicionar Novo Usuário</DialogTitle>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              disabled={loading}
            />
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
              {loading ? "Adicionando..." : "Adicionar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
