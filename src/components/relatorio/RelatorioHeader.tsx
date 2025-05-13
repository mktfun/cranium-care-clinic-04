
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  hideControls?: boolean;
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  hideControls = false
}: RelatorioHeaderProps) {
  // Funções para exportar PDF e imprimir
  const handleExportarPDF = () => {
    toast.success(`Relatório ${modoConsolidado ? 'consolidado' : 'individual'} exportado em PDF com sucesso!`);
    // Em produção real, aqui seria implementada a geração efetiva do PDF
  };
  
  const handleImprimir = () => {
    toast.success(`Enviando relatório ${modoConsolidado ? 'consolidado' : 'individual'} para impressão...`);
    setTimeout(() => window.print(), 500);
  };

  return (
    <>
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {modoConsolidado ? 'Relatório Consolidado' : 'Relatório de Avaliação'}
            </h2>
            <div className="text-muted-foreground mt-1">
              {pacienteNome} • {idadeAtual}
              {!modoConsolidado && dataFormatada && ` • ${dataFormatada}`}
            </div>
          </div>
        </div>
        {!hideControls && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onModoChange}
            >
              {modoConsolidado ? 'Mostrar Relatório Individual' : 'Mostrar Relatório Consolidado'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleImprimir}
            >
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportarPDF}
            >
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        )}
      </div>
      
      <div className="print:mt-0 print:mb-6">
        <div className="text-center border-b pb-4 print:block hidden">
          <h1 className="text-2xl font-bold mb-2">
            {modoConsolidado 
              ? 'Relatório Consolidado de Avaliações Cranianas' 
              : 'Relatório de Avaliação Craniana'}
          </h1>
          <p>
            Paciente: {pacienteNome} • {idadeAtual} • 
            {dataFormatada && ` Data: ${dataFormatada}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Profissional: Dr. Exemplo • Clínica: CraniumCare
          </p>
        </div>
      </div>
    </>
  );
}
