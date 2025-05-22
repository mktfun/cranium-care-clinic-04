
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Download,
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Calendar
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SecurityLogDetailsModal } from "./SecurityLogDetailsModal";
import { useSecurityLogExport } from "@/hooks/useSecurityLogExport";

export interface SecurityLog {
  id: string;
  created_at: string;
  action: string;
  user_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  severity: "info" | "warning" | "error" | "critical";
}

export const SecurityLogsList = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [exportLoading, setExportLoading] = useState(false);
  
  const { exportToCSV } = useSecurityLogExport();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setLogs(data as SecurityLog[]);
        setFilteredLogs(data as SecurityLog[]);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((log) => log.severity === severityFilter);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleSort = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    
    const sorted = [...filteredLogs].sort((a, b) => {
      if (newDirection === "asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    setFilteredLogs(sorted);
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      await exportToCSV(filteredLogs);
      toast.success("Logs exportados com sucesso");
      
      // Log the export action
      await supabase.from("security_logs").insert({
        action: "logs_exported",
        user_id: (await supabase.auth.getSession()).data.session?.user.id,
        details: { 
          count: filteredLogs.length,
          filters: {
            search: searchTerm,
            action: actionFilter,
            severity: severityFilter
          }
        },
        severity: "info"
      });
    } catch (error: any) {
      toast.error(`Erro ao exportar logs: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

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

  // Get unique action types for filter
  const actionTypes = Array.from(new Set(logs.map(log => log.action)));
  
  // Get paginated logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-turquesa">Logs de Segurança</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchLogs}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Atualizar
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={exportLoading || filteredLogs.length === 0}
          >
            <Download size={16} />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por detalhes, IP ou ação"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          {searchTerm || actionFilter !== "all" || severityFilter !== "all"
            ? "Nenhum log encontrado com os filtros selecionados."
            : "Nenhum log de segurança disponível."}
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={handleSort}
                  >
                    Data/Hora {sortDirection === "asc" ? "↑" : "↓"}
                  </TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {log.user_id || "—"}
                    </TableCell>
                    <TableCell>{log.ip_address || "—"}</TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailsModalOpen(true);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} de {filteredLogs.length} logs
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(logsPerPage)} onValueChange={(value) => setLogsPerPage(Number(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center mx-2">
                  <span className="text-sm">
                    {currentPage} de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedLog && (
        <SecurityLogDetailsModal
          log={selectedLog}
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};
