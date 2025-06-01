
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedComponentProps {
  module: 'patients' | 'measurements' | 'reports' | 'settings' | 'collaborators';
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAlert?: boolean;
}

export function ProtectedComponent({ 
  module, 
  action, 
  children, 
  fallback,
  showAlert = true 
}: ProtectedComponentProps) {
  const { hasPermission, loading, isOwner } = usePermissions();

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  const hasAccess = isOwner || hasPermission(module, action);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAlert) {
      return (
        <Alert className="border-destructive/50">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para {action === 'view' ? 'visualizar' : 
              action === 'create' ? 'criar' : 
              action === 'edit' ? 'editar' : 
              action === 'delete' ? 'excluir' : 
              'gerenciar'} {module === 'patients' ? 'pacientes' : 
              module === 'measurements' ? 'medições' : 
              module === 'reports' ? 'relatórios' : 
              module === 'settings' ? 'configurações' : 
              'colaboradores'}.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}
