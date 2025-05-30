
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoricoMedicoes } from "@/hooks/useHistoricoMedicoes";
import { useHistoricoExport } from "@/hooks/useHistoricoExport";
import { HistoricoHeader } from "@/components/historico/HistoricoHeader";
import { HistoricoTable } from "@/components/historico/HistoricoTable";

export default function Historico() {
  const [filtro, setFiltro] = useState("");
  const { medicoes, loading } = useHistoricoMedicoes();
  const { exportLoading, handleExportPDF } = useHistoricoExport(medicoes);
  
  // Filtrar com base na busca
  const medicoesFiltradas = medicoes.filter(medicao => 
    medicao.pacienteNome?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HistoricoHeader 
        filtro={filtro}
        onFiltroChange={setFiltro}
      />
      
      <HistoricoTable
        medicoesFiltradas={medicoesFiltradas}
        allMedicoes={medicoes}
        exportLoading={exportLoading}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
}
