
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface Medicao {
  id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonalD: number;
  diagonalE: number;
  diferencaDiagonais: number;
  cvai: number;
  indiceCraniano: number;
  perimetroCefalico?: number;
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
            <th className="p-2 text-left text-xs">Data</th>
            <th className="p-2 text-left text-xs">Idade</th>
            <th className="p-2 text-left text-xs">Comp.</th>
            <th className="p-2 text-left text-xs">Larg.</th>
            <th className="p-2 text-left text-xs">Diag. D</th>
            <th className="p-2 text-left text-xs">Diag. E</th>
            <th className="p-2 text-left text-xs">Dif.</th>
            <th className="p-2 text-left text-xs">CVAI</th>
            <th className="p-2 text-left text-xs">IC</th>
            <th className="p-2 text-left text-xs">PC</th>
            <th className="p-2 text-left text-xs">Status</th>
          </tr>
        </thead>
        <tbody>
          {medicoesOrdenadas.map((med, index) => {
            const { asymmetryType, severityLevel } = getCranialStatus(
              med.indiceCraniano,
              med.cvai
            );
            
            return (
              <tr key={med.id} className={index % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="p-2 text-xs">{formatarData(med.data)}</td>
                <td className="p-2 text-xs">{formatAge(dataNascimento, med.data)}</td>
                <td className="p-2 text-xs">{med.comprimento}</td>
                <td className="p-2 text-xs">{med.largura}</td>
                <td className="p-2 text-xs">{med.diagonalD}</td>
                <td className="p-2 text-xs">{med.diagonalE}</td>
                <td className="p-2 text-xs">{med.diferencaDiagonais}</td>
                <td className="p-2 text-xs">{med.cvai}%</td>
                <td className="p-2 text-xs">{med.indiceCraniano}%</td>
                <td className="p-2 text-xs">{med.perimetroCefalico || "-"}</td>
                <td className="p-2">
                  <StatusBadge 
                    status={severityLevel} 
                    asymmetryType={asymmetryType} 
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
