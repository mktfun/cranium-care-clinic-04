
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface Permissions {
  patients: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  measurements: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  reports: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
  collaborators: {
    view: boolean;
    manage: boolean;
  };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Verificar se é dono da empresa (usuario principal)
      const { data: ownerData } = await supabase
        .from('usuarios')
        .select('id, nome, clinica_nome')
        .eq('id', session.user.id)
        .single();

      if (ownerData) {
        // É o dono da empresa - tem todas as permissões
        setIsOwner(true);
        setUserRole('owner');
        setPermissions({
          patients: { view: true, create: true, edit: true, delete: true },
          measurements: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
          collaborators: { view: true, manage: true }
        });
      } else {
        // Verificar se é colaborador
        const { data: colaboradorData } = await supabase
          .from('colaboradores')
          .select('permissions, permissao, status')
          .eq('email', session.user.email)
          .eq('status', 'ativo')
          .single();

        if (colaboradorData) {
          setUserRole(colaboradorData.permissao);
          
          // Conversão segura de Json para Permissions
          let userPermissions: Permissions;
          try {
            if (colaboradorData.permissions && typeof colaboradorData.permissions === 'object') {
              userPermissions = colaboradorData.permissions as unknown as Permissions;
            } else {
              // Fallback para permissões padrão baseadas no cargo
              userPermissions = getDefaultPermissionsByRole(colaboradorData.permissao);
            }
          } catch (error) {
            console.error('Erro ao processar permissões:', error);
            userPermissions = getDefaultPermissionsByRole(colaboradorData.permissao);
          }
          
          setPermissions(userPermissions);
        } else {
          // Usuário não autorizado
          navigate('/acesso-negado');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPermissionsByRole = (role: string): Permissions => {
    switch (role) {
      case 'admin':
        return {
          patients: { view: true, create: true, edit: true, delete: true },
          measurements: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
          collaborators: { view: true, manage: true }
        };
      case 'editar':
        return {
          patients: { view: true, create: true, edit: true, delete: false },
          measurements: { view: true, create: true, edit: true, delete: false },
          reports: { view: true, create: true, edit: false, delete: false },
          settings: { view: false, edit: false },
          collaborators: { view: false, manage: false }
        };
      case 'visualizar':
      default:
        return {
          patients: { view: true, create: false, edit: false, delete: false },
          measurements: { view: true, create: false, edit: false, delete: false },
          reports: { view: true, create: false, edit: false, delete: false },
          settings: { view: false, edit: false },
          collaborators: { view: false, manage: false }
        };
    }
  };

  const hasPermission = (module: keyof Permissions, action: string): boolean => {
    if (isOwner) return true;
    if (!permissions) return false;
    
    const modulePermissions = permissions[module] as any;
    return modulePermissions?.[action] || false;
  };

  const canManageCollaborators = (): boolean => {
    return isOwner || hasPermission('collaborators', 'manage') || userRole === 'admin';
  };

  return {
    permissions,
    loading,
    isOwner,
    userRole,
    hasPermission,
    canManageCollaborators,
    refreshPermissions: fetchUserPermissions
  };
}
