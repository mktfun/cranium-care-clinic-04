
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Permissions } from "@/hooks/usePermissions";

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

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
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

  const saveColaborador = async (
    formData: { nome: string; email: string; permissao: string; status: string },
    permissionForm: Permissions,
    editingColaborador?: Colaborador | null
  ) => {
    if (!currentUser?.clinica_nome) {
      toast.error('Nome da clínica não encontrado');
      return false;
    }

    try {
      const colaboradorData = {
        ...formData,
        permissions: permissionForm as any,
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

      await fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
      return false;
    }
  };

  const deleteColaborador = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return false;

    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Colaborador removido com sucesso!');
      await fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error);
      toast.error(`Erro ao remover: ${error.message}`);
      return false;
    }
  };

  const sendInvitation = async (colaborador: Colaborador) => {
    if (!currentUser?.nome) {
      toast.error('Dados do usuário não encontrados');
      return false;
    }

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
        await fetchColaboradores();
        return true;
      } else {
        throw new Error(result.error || 'Erro ao enviar convite');
      }
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
      return false;
    }
  };

  return {
    colaboradores,
    loading,
    currentUser,
    fetchColaboradores,
    saveColaborador,
    deleteColaborador,
    sendInvitation
  };
}
