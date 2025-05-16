
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface Medicao {
  id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  diferenca_diagonais: number;
  cvai: number;
  indice_craniano: number;
  perimetro_cefalico?: number;
  recomendacoes?: string[];
}

interface MedicoesHistoricoTableProps {
  medicoes: Medicao[];
  dataNascimento: string;
}

export function MedicoesHistoricoTable({ 
  medicoes,
  dataNascimento 
}: MedicoesHistoricoTableProps) {
  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Ordenar por data (mais antigas primeiro)
  const medicoesOrdenadas = [...medicoes].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  return (
    <div className="overflow-x-auto rounded-md border shadow-sm">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-primary/10 dark:bg-primary/20 text-primary-foreground">
            <th className="p-2 text-left text-xs font-medium">Data</th>
            <th className="p-2 text-left text-xs font-medium">Idade</th>
            <th className="p-2 text-left text-xs font-medium">Comp.</th>
            <th className="p-2 text-left text-xs font-medium">Larg.</th>
            <th className="p-2 text-left text-xs font-medium">Diag. D</th>
            <th className="p-2 text-left text-xs font-medium">Diag. E</th>
            <th className="p-2 text-left text-xs font-medium">Dif.</th>
            <th className="p-2 text-left text-xs font-medium">CVAI</th>
            <th className="p-2 text-left text-xs font-medium">IC</th>
            <th className="p-2 text-left text-xs font-medium">PC</th>
            <th className="p-2 text-left text-xs font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {medicoesOrdenadas.map((med, index) => {
            const { asymmetryType, severityLevel } = getCranialStatus(
              med.indice_craniano,
              med.cvai
            );
            
            return (
              <tr 
                key={med.id} 
                className={`${
                  index % 2 === 0 
                    ? "bg-background" 
                    : "bg-muted/30"
                } hover:bg-primary/5 transition-colors`}
              >
                <td className="p-2 text-xs">{formatarData(med.data)}</td>
                <td className="p-2 text-xs">{formatAge(dataNascimento, med.data)}</td>
                <td className="p-2 text-xs">{med.comprimento}</td>
                <td className="p-2 text-xs">{med.largura}</td>
                <td className="p-2 text-xs">{med.diagonal_d}</td>
                <td className="p-2 text-xs">{med.diagonal_e}</td>
                <td className="p-2 text-xs">{med.diferenca_diagonais}</td>
                <td className="p-2 text-xs">{med.cvai}%</td>
                <td className="p-2 text-xs">{med.indice_craniano}%</td>
                <td className="p-2 text-xs">{med.perimetro_cefalico || "-"}</td>
                <td className="p-2">
                  <StatusBadge 
                    status={severityLevel} 
                    asymmetryType={asymmetryType} 
                    showAsymmetryType={true}
                    className="text-xs"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
