
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileDown, Eye, BarChart2, Loader2 } from "lucide-react";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-media-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  onExportPDF?: () => void;
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  onExportPDF
}: RelatorioHeaderProps) {
  const isMobileOrTablet = useIsMobileOrTabletPortrait();
  const { isGenerating } = usePDFGeneration();
  const [clinicaInfo, setClinicaInfo] = useState<{
    nome: string;
    logo_url: string | null;
    profissional: string;
  }>({
    nome: "CraniumCare Clinic",
    logo_url: null,
    profissional: "",
  });
  
  useEffect(() => {
    async function fetchClinicaInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome, clinica_logo')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Erro ao buscar informações da clínica:", error);
            return;
          }
            
          if (data) {
            setClinicaInfo({
              nome: data.clinica_nome || "CraniumCare Clinic",
              logo_url: data.clinica_logo || null,
              profissional: data.nome || "Médico Responsável",
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar informações da clínica:", error);
      }
    }
    
    fetchClinicaInfo();
  }, []);

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
        
        {onExportPDF && (
          <Button
            variant="outline"
            size={isMobileOrTablet ? "sm" : "default"}
            onClick={onExportPDF}
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isGenerating ? "Gerando..." : "Exportar PDF"}
            </span>
            <span className="sm:hidden">
              {isGenerating ? "..." : "PDF"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
