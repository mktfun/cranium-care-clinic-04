
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { useNavigate } from "react-router-dom";

interface MeasurementHistoryTableProps {
  medicoes: any[];
  pacienteId: string;
  pacienteDataNascimento: string;
  formatarData: (dataString: string) => string;
  onMedicaoClick: (medicao: any) => void;
}

export function MeasurementHistoryTable({ 
  medicoes, 
  pacienteId, 
  pacienteDataNascimento, 
  formatarData,
  onMedicaoClick
}: MeasurementHistoryTableProps) {
  const navigate = useNavigate();

  if (medicoes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Medições</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Idade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Comp.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Larg.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Diag. D</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Diag. E</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dif. Diag.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CVAI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">PC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {medicoes.map((medicao) => {
                const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
                return (
                  <tr key={medicao.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onMedicaoClick(medicao)}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatarData(medicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatAge(pacienteDataNascimento, medicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.comprimento_maximo} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.largura_maxima} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diagonal_direita || medicao.diagonal_d} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diagonal_esquerda || medicao.diagonal_e} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diferenca_diagonais} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.cvai ? `${medicao.cvai.toFixed(1)}%` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.indice_craniano ? `${medicao.indice_craniano.toFixed(1)}%` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/pacientes/${pacienteId}/medicao/${medicao.id}/editar`); 
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
