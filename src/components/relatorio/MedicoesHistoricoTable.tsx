
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-2 text-left text-xs font-semibold">Data</th>
            <th className="p-2 text-left text-xs font-semibold">Idade</th>
            <th className="p-2 text-left text-xs font-semibold">Comp.</th>
            <th className="p-2 text-left text-xs font-semibold">Larg.</th>
            <th className="p-2 text-left text-xs font-semibold">Diag. D</th>
            <th className="p-2 text-left text-xs font-semibold">Diag. E</th>
            <th className="p-2 text-left text-xs font-semibold">Dif.</th>
            <th className="p-2 text-left text-xs font-semibold">CVAI</th>
            <th className="p-2 text-left text-xs font-semibold">IC</th>
            <th className="p-2 text-left text-xs font-semibold">PC</th>
            <th className="p-2 text-left text-xs font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {medicoesOrdenadas.map((med, index) => {
            const { asymmetryType, severityLevel } = getCranialStatus(
              med.indice_craniano,
              med.cvai
            );
            
            return (
              <tr key={med.id} className={index % 2 === 0 ? "" : "bg-muted/20"}>
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
