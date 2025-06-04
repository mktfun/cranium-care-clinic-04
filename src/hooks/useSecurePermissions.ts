
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { createAuditLog } from '@/lib/security-utils';

export interface SecurePermissions {
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

export function useSecurePermissions() {
  const [permissions, setPermissions] = useState<SecurePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [clinicName, setClinicName] = useState<string>('');
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

      // Log permission check
      await createAuditLog('permission_check', 'usuarios', session.user.id);

      // Check if user is clinic owner
      const { data: ownerData } = await supabase
        .from('usuarios')
        .select('id, nome, clinica_nome')
        .eq('id', session.user.id)
        .single();

      if (ownerData) {
        // Is clinic owner - has all permissions
        setIsOwner(true);
        setUserRole('owner');
        setClinicName(ownerData.clinica_nome || '');
        setPermissions({
          patients: { view: true, create: true, edit: true, delete: true },
          measurements: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
          collaborators: { view: true, manage: true }
        });
      } else {
        // Check if is collaborator
        const { data: colaboradorData } = await supabase
          .from('colaboradores')
          .select('id, permissions, permissao, status, empresa_nome')
          .eq('email', session.user.email)
          .eq('status', 'ativo')
          .single();

        if (colaboradorData) {
          setUserRole(colaboradorData.permissao);
          setClinicName(colaboradorData.empresa_nome || '');
          
          // Parse permissions safely
          let userPermissions: SecurePermissions;
          try {
            if (colaboradorData.permissions && typeof colaboradorData.permissions === 'object') {
              userPermissions = colaboradorData.permissions as unknown as SecurePermissions;
            } else {
              userPermissions = getDefaultPermissionsByRole(colaboradorData.permissao);
            }
          } catch (error) {
            console.error('Error parsing permissions:', error);
            userPermissions = getDefaultPermissionsByRole(colaboradorData.permissao);
          }
          
          setPermissions(userPermissions);
          
          // Log collaborator access
          await createAuditLog('collaborator_access', 'colaboradores', colaboradorData.id);
        } else {
          // Unauthorized user
          await createAuditLog('unauthorized_access_attempt', 'usuarios', session.user.id);
          navigate('/acesso-negado');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      await createAuditLog('permission_fetch_error', undefined, undefined, { error: error.message });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPermissionsByRole = (role: string): SecurePermissions => {
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

  const hasPermission = (module: keyof SecurePermissions, action: string): boolean => {
    if (isOwner) return true;
    if (!permissions) return false;
    
    const modulePermissions = permissions[module] as any;
    return modulePermissions?.[action] || false;
  };

  const canManageCollaborators = (): boolean => {
    return isOwner || hasPermission('collaborators', 'manage');
  };

  const logSecurityAction = async (action: string, details?: any) => {
    await createAuditLog(action, undefined, undefined, details);
  };

  return {
    permissions,
    loading,
    isOwner,
    userRole,
    clinicName,
    hasPermission,
    canManageCollaborators,
    logSecurityAction,
    refreshPermissions: fetchUserPermissions
  };
}
