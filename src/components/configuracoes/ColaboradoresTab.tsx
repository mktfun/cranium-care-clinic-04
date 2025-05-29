
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  permissao: string;
  status: string;
  empresa_id: string;
  empresa_nome: string;
  created_at: string;
  updated_at: string;
}

export function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    permissao: "visualizar",
    status: "ativo"
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

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

      // Buscar colaboradores da empresa do usuário atual
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.clinica_nome) {
      toast.error('Nome da clínica não encontrado');
      return;
    }

    try {
      const colaboradorData = {
        ...formData,
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
      setEditingColaborador(null);
      setFormData({ nome: "", email: "", permissao: "visualizar", status: "ativo" });
      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      permissao: colaborador.permissao,
      status: colaborador.status
    });
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

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      pendente: "secondary",
      inativo: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPermissaoBadge = (permissao: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      editar: "bg-blue-100 text-blue-800",
      visualizar: "bg-green-100 text-green-800"
    } as const;

    return (
      <Badge className={colors[permissao as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {permissao.charAt(0).toUpperCase() + permissao.slice(1)}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Colaboradores</h3>
          <p className="text-sm text-muted-foreground">
            Adicione e gerencie os membros da sua equipe
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-turquesa hover:bg-turquesa/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="permissao">Permissão</Label>
                <Select 
                  value={formData.permissao} 
                  onValueChange={(value) => setFormData({...formData, permissao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visualizar">Visualizar</SelectItem>
                    <SelectItem value="editar">Editar</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingColaborador(null);
                    setFormData({ nome: "", email: "", permissao: "visualizar", status: "ativo" });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-turquesa hover:bg-turquesa/90">
                  {editingColaborador ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {colaboradores.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione membros à sua equipe para começar a colaborar.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-turquesa hover:bg-turquesa/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Colaborador
              </Button>
            </CardContent>
          </Card>
        ) : (
          colaboradores.map((colaborador) => (
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPermissaoBadge(colaborador.permissao)}
                    {getStatusBadge(colaborador.status)}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
