
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2, Mail, User, Send, Clock } from "lucide-react";
import { ProtectedComponent } from "@/components/ProtectedComponent";

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

interface ColaboradorCardProps {
  colaborador: Colaborador;
  sending: string | null;
  onSendInvitation: (colaborador: Colaborador) => void;
  onEdit: (colaborador: Colaborador) => void;
  onDelete: (id: string) => void;
}

export function ColaboradorCard({
  colaborador,
  sending,
  onSendInvitation,
  onEdit,
  onDelete
}: ColaboradorCardProps) {
  const getStatusBadge = (status: string, inviteExpires?: string) => {
    const now = new Date();
    const expiresAt = inviteExpires ? new Date(inviteExpires) : null;
    const isExpired = expiresAt && now > expiresAt;

    if (status === 'pendente' && isExpired) {
      return <Badge variant="destructive">Convite Expirado</Badge>;
    }

    const variants = {
      ativo: "default",
      pendente: "secondary",
      inativo: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status === 'ativo' ? 'Ativo' : status === 'pendente' ? 'Aguardando' : 'Inativo'}
      </Badge>
    );
  };

  const getPermissaoBadge = (permissao: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      editar: "bg-blue-100 text-blue-800",
      visualizar: "bg-green-100 text-green-800"
    } as const;

    const names = {
      admin: "Administrador",
      editar: "Editor", 
      visualizar: "Visualizador"
    } as const;

    return (
      <Badge className={colors[permissao as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {names[permissao as keyof typeof names] || permissao}
      </Badge>
    );
  };

  const isExpired = colaborador.invite_expires_at && 
    new Date() > new Date(colaborador.invite_expires_at);

  return (
    <Card>
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
              {colaborador.last_login && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  Último login: {new Date(colaborador.last_login).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getPermissaoBadge(colaborador.permissao)}
            {getStatusBadge(colaborador.status, colaborador.invite_expires_at)}
            
            {colaborador.status === 'pendente' && !isExpired && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendInvitation(colaborador)}
                disabled={sending === colaborador.id}
              >
                {sending === colaborador.id ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Send className="h-3 w-3 mr-1" />
                )}
                Reenviar
              </Button>
            )}

            <ProtectedComponent module="collaborators" action="manage" showAlert={false}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(colaborador)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(colaborador.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </ProtectedComponent>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
