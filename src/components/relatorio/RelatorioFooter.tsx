
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface RelatorioFooterProps {
  onVoltar: () => void;
  dataCriacao?: Date;
  onExportPDF?: () => void;
}

export function RelatorioFooter({ 
  onVoltar, 
  dataCriacao = new Date(),
  onExportPDF 
}: RelatorioFooterProps) {
  const [clinicaNome, setClinicaNome] = useState<string>("CraniumCare");
  const [profissionalNome, setProfissionalNome] = useState<string>("");
  
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome')
            .eq('id', user.id)
            .single();
              
          if (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            return;
          }
              
          if (data) {
            setProfissionalNome(data.nome || "");
            setClinicaNome(data.clinica_nome || "CraniumCare");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
    
    fetchUserInfo();
  }, []);

  return (
    <>
      <div className="print:hidden flex flex-wrap gap-2">
        <Button variant="outline" onClick={onVoltar} size="sm">
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        
        {onExportPDF && (
          <Button 
            variant="default" 
            onClick={onExportPDF} 
            size="sm"
            className="bg-turquesa hover:bg-turquesa/90"
          >
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        )}
      </div>
      
      <div className="text-center border-t pt-4 text-xs text-muted-foreground mt-8 hidden print:block">
        <p>Relatório gerado pelo sistema CraniumCare em {dataCriacao.toLocaleDateString('pt-BR')} às {dataCriacao.toLocaleTimeString('pt-BR')}</p>
        <p>Profissional responsável: {profissionalNome || "Médico Responsável"} • Clínica: {clinicaNome}</p>
        <p>© {new Date().getFullYear()} {clinicaNome} - Uso exclusivamente clínico</p>
      </div>
    </>
  );
}
