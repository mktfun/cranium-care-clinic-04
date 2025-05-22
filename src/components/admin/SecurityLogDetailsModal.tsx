
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SecurityLog } from "./SecurityLogsList";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SecurityLogDetailsModalProps {
  log: SecurityLog;
  open: boolean;
  onClose: () => void;
}

export const SecurityLogDetailsModal: React.FC<SecurityLogDetailsModalProps> = ({
  log,
  open,
  onClose,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "info":
        return <Badge variant="default">Info</Badge>;
      case "warning":
        return <Badge variant="warning">Aviso</Badge>;
      case "error":
        return <Badge variant="danger">Erro</Badge>;
      case "critical":
        return <Badge variant="danger" className="bg-purple-600">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Detalhes do Log {getSeverityBadge(log.severity)}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="raw">Dados Brutos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID do Log</p>
                <p className="text-sm break-all">{log.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data/Hora</p>
                <p className="text-sm">{formatDateTime(log.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ação</p>
                <p className="text-sm">{log.action}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Severidade</p>
                <div>{getSeverityBadge(log.severity)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuário ID</p>
                <p className="text-sm break-all">{log.user_id || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço IP</p>
                <p className="text-sm">{log.ip_address || "—"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User Agent</p>
              <p className="text-sm break-all mt-1">{log.user_agent || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Detalhes</p>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[300px]">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
