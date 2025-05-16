
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface RelatorioFooterProps {
  onVoltar: () => void;
  dataCriacao?: Date;
}

export function RelatorioFooter({ onVoltar, dataCriacao = new Date() }: RelatorioFooterProps) {
  const [clinicaNome, setClinicaNome] = useState<string>("CraniumCare");
  const [profissionalNome, setProfissionalNome] = useState<string>("Dr. Exemplo");
  
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome')
            .eq('id', user.id)
            .single();
              
          if (data) {
            setProfissionalNome(data.nome || "Dr. Exemplo");
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
      <div className="print:hidden">
        <Button variant="outline" onClick={onVoltar} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
      
      <div className="text-center border-t pt-4 text-xs text-muted-foreground mt-8 print:block hidden">
        <p>Este relatório foi gerado pelo sistema CraniumCare em {dataCriacao.toLocaleDateString('pt-BR')}</p>
        <p>Profissional responsável: {profissionalNome} • Clínica: {clinicaNome}</p>
        <p>Uso exclusivamente clínico</p>
      </div>
    </>
  );
}
