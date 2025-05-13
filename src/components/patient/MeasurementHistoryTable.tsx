
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
                // Normalize data to handle both snake_case and camelCase properties
                const normalizedMedicao = {
                  id: medicao.id,
                  data: medicao.data,
                  comprimento: medicao.comprimento,
                  largura: medicao.largura,
                  diagonalD: medicao.diagonal_d || medicao.diagonalD,
                  diagonalE: medicao.diagonal_e || medicao.diagonalE,
                  diferencaDiagonais: medicao.diferenca_diagonais || medicao.diferencaDiagonais,
                  indiceCraniano: medicao.indice_craniano || medicao.indiceCraniano,
                  cvai: medicao.cvai,
                  perimetroCefalico: medicao.perimetro_cefalico || medicao.perimetroCefalico
                };
                
                const { asymmetryType, severityLevel } = getCranialStatus(
                  normalizedMedicao.indiceCraniano, 
                  normalizedMedicao.cvai
                );
                
                return (
                  <tr key={medicao.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onMedicaoClick(medicao)}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatarData(normalizedMedicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatAge(pacienteDOB, normalizedMedicao.data)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.comprimento} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.largura} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.diagonalD} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.diagonalE} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.diferencaDiagonais} mm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{normalizedMedicao.cvai ? `${normalizedMedicao.cvai.toFixed(1)}%` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {normalizedMedicao.indiceCraniano 
                        ? `${normalizedMedicao.indiceCraniano.toFixed(1)}%` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {normalizedMedicao.perimetroCefalico 
                        ? `${normalizedMedicao.perimetroCefalico} mm` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge 
                        status={severityLevel} 
                        asymmetryType={asymmetryType}
                        showAsymmetryType={true} 
                      />
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
