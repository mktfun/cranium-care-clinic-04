
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileDown, Eye, BarChart2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-media-query";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  relatorioElementId?: string;
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  relatorioElementId
}: RelatorioHeaderProps) {
  const isMobileOrTablet = useIsMobileOrTabletPortrait();
  
  const handleExportPDF = () => {
    if (!relatorioElementId) return;
    
    const element = document.getElementById(relatorioElementId);
    if (!element) return;
    
    // Adiciona uma classe temporária para estilo de impressão
    element.classList.add('printing');
    
    const opt = {
      margin: [10, 10],
      filename: `relatorio-${pacienteNome}-${dataFormatada || 'consolidado'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Converte para PDF
    html2pdf().from(element).set(opt).save().then(() => {
      // Remove a classe temporária após a conversão
      element.classList.remove('printing');
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 print:hidden">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onVoltar}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{pacienteNome}</h1>
          <p className="text-muted-foreground">
            {idadeAtual} {dataFormatada ? ` • Avaliação em: ${dataFormatada}` : ''}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
        <Button
          variant="outline"
          size={isMobileOrTablet ? "sm" : "default"}
          onClick={onModoChange}
          className="flex items-center gap-1"
        >
          {modoConsolidado ? (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Ver avaliação individual</span>
              <span className="sm:hidden">Individual</span>
            </>
          ) : (
            <>
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Ver histórico consolidado</span>
              <span className="sm:hidden">Consolidado</span>
            </>
          )}
        </Button>
        
        {relatorioElementId && (
          <Button
            variant="outline"
            size={isMobileOrTablet ? "sm" : "default"}
            onClick={handleExportPDF}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        )}
      </div>
    </div>
  );
}
