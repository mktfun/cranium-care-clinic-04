
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface RelatorioFooterProps {
  onVoltar: () => void;
  dataCriacao?: Date;
}

export function RelatorioFooter({ onVoltar, dataCriacao = new Date() }: RelatorioFooterProps) {
  return (
    <>
      <div className="print:hidden">
        <Button variant="outline" onClick={onVoltar} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
      
      <div className="text-center border-t pt-4 text-xs text-muted-foreground mt-8 print:block hidden">
        <p>Este relatório foi gerado pelo sistema CraniumCare em {dataCriacao.toLocaleDateString('pt-BR')}</p>
        <p>Profissional responsável: Dr. Exemplo • Clínica CraniumCare</p>
        <p>Uso exclusivamente clínico</p>
      </div>
    </>
  );
}
