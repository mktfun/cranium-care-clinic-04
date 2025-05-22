
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { Shield, Pencil, Trash, Plus, Search } from "lucide-react";

export type UserRole = "admin" | "doctor" | "nurse" | "receptionist" | "standard";

export interface User {
  id: string;
  email: string;
  nome: string;
  admin_role: boolean;
  created_at: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user: Partial<User>) => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email!,
        password: "12345678", // Temporary password
        email_confirm: true
      });
      
      if (authError) {
        throw authError;
      }

      // Then add user to usuarios table
      const { error } = await supabase.from("usuarios").insert({
        id: authData.user.id,
        email: user.email,
        nome: user.nome,
        admin_role: user.admin_role
      });

      if (error) throw error;
      
      // Get current session to get user ID for the log
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user.id;
      
      // Add security log with the required user_id
      await supabase.from("security_logs").insert({
        user_id: currentUserId || authData.user.id, // Use current user ID or the new user ID as fallback
        action: "user_created",
        details: { email: user.email }
      });

      toast.success("Usuário adicionado com sucesso!");
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erro ao adicionar usuário: ${error.message}`);
    }
  };

  const handleEditUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({
          nome: user.nome,
          admin_role: user.admin_role
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Get current session to get user ID for the log
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user.id;
      
      // Add security log with the required user_id
      await supabase.from("security_logs").insert({
        user_id: currentUserId || user.id, // Use current user ID or the edited user ID as fallback
        action: "user_updated",
        details: { email: user.email }
      });

      toast.success("Usuário atualizado com sucesso!");
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // First, get the user email for logging
      const { data: userData } = await supabase
        .from("usuarios")
        .select("email")
        .eq("id", userId)
        .single();
      
      // Delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        throw authError;
      }
      
      // The delete cascade should remove from usuarios table, but let's be sure
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", userId);

      if (error && error.code !== "PGRST116") throw error; // PGRST116 means no rows affected
      
      // Get current session to get user ID for the log
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user.id;
      
      // Add security log with the required user_id
      await supabase.from("security_logs").insert({
        user_id: currentUserId || "00000000-0000-0000-0000-000000000000", // Use current user ID or a placeholder UUID
        action: "user_deleted",
        details: { email: userData?.email || "unknown" }
      });

      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-turquesa">Gerenciamento de Usuários</h2>
        <Button 
          onClick={() => setAddModalOpen(true)}
          className="bg-turquesa hover:bg-turquesa/90 flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar Usuário
        </Button>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando usuários...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          {searchTerm ? "Nenhum usuário encontrado para esta busca." : "Nenhum usuário cadastrado."}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome || "---"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.admin_role ? "default" : "outline"}>
                      {user.admin_role ? "Administrador" : "Padrão"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddUserModal 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={selectedUser}
            onEditUser={handleEditUser}
          />
          <DeleteUserModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            user={selectedUser}
            onDeleteUser={handleDeleteUser}
          />
        </>
      )}
    </div>
  );
};
