
import { QueixaPrincipalSection } from "./QueixaPrincipalSection";
import { CondutaSection } from "./CondutaSection";
import { DiagnosticoSection } from "./DiagnosticoSection";
import { HistoricoGestacionalSection } from "./HistoricoGestacionalSection";
import { AtestadoSection } from "./AtestadoSection";
import { Separator } from "@/components/ui/separator";

interface AvaliacaoTabProps {
  prontuario: any;
  pacienteId: string;
}

export function AvaliacaoTab({ prontuario, pacienteId }: AvaliacaoTabProps) {
  return (
    <div className="space-y-6">
      <QueixaPrincipalSection 
        prontuarioId={prontuario.id} 
        initialValue={prontuario.queixa_principal}
      />
      
      <HistoricoGestacionalSection 
        prontuarioId={prontuario.id}
        initialData={{
          idadeGestacional: prontuario.idade_gestacional,
          idadeCorrigida: prontuario.idade_corrigida,
          observacoesAnamnese: prontuario.observacoes_anamnese
        }}
      />
      
      <Separator />
      
      <DiagnosticoSection 
        prontuarioId={prontuario.id}
        initialDiagnostico={prontuario.diagnostico}
        initialCid={prontuario.cid}
      />
      
      <CondutaSection 
        prontuarioId={prontuario.id} 
        initialValue={prontuario.conduta}
      />
      
      <AtestadoSection 
        prontuarioId={prontuario.id} 
        initialValue={prontuario.atestado}
      />
    </div>
  );
}
