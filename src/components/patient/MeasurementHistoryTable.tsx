
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { StatusBadge } from "@/components/StatusBadge";

interface MeasurementHistoryTableProps {
  medicoes: any[];
  pacienteDOB: string;
  onMedicaoClick: (medicao: any) => void;
  onEditClick: (medicacao: any, event: React.MouseEvent) => void;
}

export function MeasurementHistoryTable({ 
  medicoes, 
  pacienteDOB, 
  onMedicaoClick, 
  onEditClick 
}: MeasurementHistoryTableProps) {
  if (medicoes.length === 0) {
    return null;
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

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
                const { asymmetryType, severityLevel } = getCranialStatus(
                  medicao.indice_craniano || medicao.indiceCraniano, 
                  medicao.cvai
                );
                
                return (
                  <tr key={medicao.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onMedicaoClick(medicao)}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatarData(medicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatAge(pacienteDOB, medicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.comprimento} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.largura} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diagonal_d || medicao.diagonalD} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diagonal_e || medicao.diagonalE} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.diferenca_diagonais || medicao.diferencaDiagonais} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{medicao.cvai ? `${medicao.cvai.toFixed(1)}%` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {(medicao.indice_craniano || medicao.indiceCraniano) 
                        ? `${(medicao.indice_craniano || medicao.indiceCraniano).toFixed(1)}%` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {(medicao.perimetro_cefalico || medicao.perimetroCefalico) 
                        ? `${medicao.perimetro_cefalico || medicao.perimetroCefalico} mm` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={(e) => onEditClick(medicao, e)}
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
