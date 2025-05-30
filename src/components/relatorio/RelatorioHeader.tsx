
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, BarChart3 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  onExportPDF?: () => void;
  onExportPDFWithCharts?: () => void;
  exportLoading?: boolean;
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  onExportPDF,
  onExportPDFWithCharts,
  exportLoading = false
}: RelatorioHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onVoltar} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            {modoConsolidado ? 'Histórico Completo' : 'Relatório de Medição'}
          </h1>
          <p className="text-muted-foreground">
            {pacienteNome} • {idadeAtual}
            {dataFormatada && !modoConsolidado && ` • ${dataFormatada}`}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="modo-consolidado"
            checked={modoConsolidado}
            onCheckedChange={onModoChange}
          />
          <Label htmlFor="modo-consolidado" className="text-sm">
            Modo histórico
          </Label>
        </div>
        
        {!modoConsolidado && (
          <div className="flex gap-2">
            {onExportPDF && (
              <Button 
                variant="outline" 
                onClick={onExportPDF}
                disabled={exportLoading}
                className="shrink-0"
              >
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
            )}
            {onExportPDFWithCharts && (
              <Button 
                variant="outline" 
                onClick={onExportPDFWithCharts}
                disabled={exportLoading}
                className="shrink-0"
                title="PDF com gráficos de evolução"
              >
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                PDF + Gráficos
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
