
import React from "react";
import { ChartDataPoint } from "./ChartHelpers";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  tipoGrafico: string;
}

export function CustomTooltip({ active, payload, label, tipoGrafico }: TooltipProps) {
  if (active && payload && payload.length > 0) {
    const dataPoint = payload[0].payload as ChartDataPoint;
    if (dataPoint.paciente === null) return null;
    
    const valueFormatter = (value: number, suffix: string) => {
      return `${value.toFixed(1)}${suffix}`;
    };

    let tooltipContent;
    
    if (tipoGrafico === "indiceCraniano") {
      tooltipContent = (
        <>
          <p className="font-medium text-sm">{`Índice Craniano: ${valueFormatter(dataPoint.indice_craniano || 0, '%')}`}</p>
          <p className="text-sm">{`Comprimento: ${valueFormatter(dataPoint.comprimento || 0, ' mm')}`}</p>
          <p className="text-sm">{`Largura: ${valueFormatter(dataPoint.largura || 0, ' mm')}`}</p>
        </>
      );
    } else if (tipoGrafico === "cvai") {
      tooltipContent = (
        <>
          <p className="font-medium text-sm">{`CVAI: ${valueFormatter(dataPoint.cvai || 0, '%')}`}</p>
          <p className="text-sm">{`Diagonal D: ${valueFormatter(dataPoint.diagonal_d || 0, ' mm')}`}</p>
          <p className="text-sm">{`Diagonal E: ${valueFormatter(dataPoint.diagonal_e || 0, ' mm')}`}</p>
          <p className="text-sm">{`Diferença: ${valueFormatter(dataPoint.diferenca_diagonais || 0, ' mm')}`}</p>
        </>
      );
    } else if (tipoGrafico === "diagonais") {
      tooltipContent = (
        <>
          <p className="font-medium text-sm">{`Diferença de diagonais: ${valueFormatter(dataPoint.diferenca_diagonais || 0, ' mm')}`}</p>
          <p className="text-sm">{`Diagonal D: ${valueFormatter(dataPoint.diagonal_d || 0, ' mm')}`}</p>
          <p className="text-sm">{`Diagonal E: ${valueFormatter(dataPoint.diagonal_e || 0, ' mm')}`}</p>
        </>
      );
    } else if (tipoGrafico === "perimetro" && dataPoint.perimetro_cefalico) {
      tooltipContent = (
        <>
          <p className="font-medium text-sm">{`Perímetro Cefálico: ${valueFormatter(dataPoint.perimetro_cefalico, ' cm')}`}</p>
          <p className="text-sm">{`P50 (média): ${valueFormatter(dataPoint.p50, ' cm')}`}</p>
        </>
      );
    } else {
      return null;
    }
    
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 p-3 border rounded shadow-lg">
        <p className="font-medium">{`Idade: ${dataPoint.idadeFormatada}`}</p>
        <div className="space-y-1 mt-2">
          {tooltipContent}
          <p className="text-xs text-muted-foreground pt-2">
            {`Data da medição: ${new Date(dataPoint.data).toLocaleDateString('pt-BR')}`}
          </p>
        </div>
      </div>
    );
  }
  return null;
}
