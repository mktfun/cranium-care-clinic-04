
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface MedicaoDetailsProps {
  medicao: any;
  pacienteNascimento: string;
  compact?: boolean;
}

export function MedicaoDetails({
  medicao,
  pacienteNascimento,
  compact = false
}: MedicaoDetailsProps) {
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  // Calcular idade exata na data da medição
  const idadeNaMedicao = formatAge(pacienteNascimento, medicao.data);
  
  // Obter índice craniano e CVAI da medição
  const indiceCraniano = medicao.indice_craniano || medicao.indiceCraniano || 0;
  const cvai = medicao.cvai || 0;
  
  // Obter tipo e severidade da assimetria
  const { asymmetryType, severityLevel } = getCranialStatus(
    indiceCraniano,
    cvai
  );

  return (
    <Card
      className={`${
        compact ? "border-0 shadow-none p-0" : "border shadow"
      } mb-4`}
    >
      <CardContent className={compact ? "p-0" : "p-6"}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium">
                {formatarData(medicao.data)}
              </div>
              <div className="text-sm text-muted-foreground">
                ({idadeNaMedicao})
              </div>
            </div>

            <div className="mt-2 space-y-3">
              {/* Linha 1: Comprimento, Largura, Índice Craniano */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Comprimento</div>
                  <div className="text-lg font-medium">{medicao.comprimento} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Largura</div>
                  <div className="text-lg font-medium">{medicao.largura} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Índice Craniano</div>
                  <div className="text-lg font-medium">{indiceCraniano}%</div>
                </div>
              </div>
              
              {/* Linha 2: Diagonal D, Diagonal E, Diferença, CVAI */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Diagonal D</div>
                  <div className="text-lg font-medium">{medicao.diagonal_d || medicao.diagonalD} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Diagonal E</div>
                  <div className="text-lg font-medium">{medicao.diagonal_e || medicao.diagonalE} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Diferença</div>
                  <div className="text-lg font-medium">{medicao.diferenca_diagonais || medicao.diferencaDiagonais} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CVAI</div>
                  <div className="text-lg font-medium">{cvai}%</div>
                </div>
              </div>
              
              {/* Perímetro Cefálico (se disponível) */}
              {(medicao.perimetro_cefalico || medicao.perimetroCefalico) && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Perímetro Cefálico</div>
                    <div className="text-lg font-medium">{medicao.perimetro_cefalico || medicao.perimetroCefalico} mm</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
          </div>
        </div>

        {medicao.observacoes && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Observações</div>
            <p className="text-sm mt-1">{medicao.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
