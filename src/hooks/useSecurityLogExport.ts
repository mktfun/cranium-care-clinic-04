
import { SecurityLog } from "@/components/admin/SecurityLogsList";

export const useSecurityLogExport = () => {
  const exportToCSV = async (logs: SecurityLog[]) => {
    if (!logs || logs.length === 0) {
      throw new Error("Nenhum log para exportar");
    }

    try {
      // Format logs for CSV export
      const formattedLogs = logs.map(log => ({
        ID: log.id,
        Data: formatDate(log.created_at),
        Hora: formatTime(log.created_at),
        Acao: log.action,
        Usuario_ID: log.user_id || "N/A",
        IP: log.ip_address || "N/A",
        Severidade: log.severity,
        Detalhes: JSON.stringify(log.details),
        User_Agent: log.user_agent || "N/A"
      }));

      // Create CSV headers
      const headers = Object.keys(formattedLogs[0]);
      
      // Function to escape CSV values
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) {
          return '';
        }
        
        const stringValue = String(value);
        
        // If value contains comma, quotes or newline, wrap in quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          // Replace quotes with double quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };

      // Create CSV rows
      const csvRows = [
        // Headers
        headers.join(','),
        
        // Data rows
        ...formattedLogs.map(row => 
          headers.map(header => escapeCSV(row[header as keyof typeof row])).join(',')
        )
      ];
      
      // Join rows with newline
      const csvContent = csvRows.join('\n');
      
      // Create blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      
      // Generate file name with current date
      const fileName = `security-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      
      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      // Add link to document
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  };

  // Helper functions for date formatting
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR');
  };

  return { exportToCSV };
};
