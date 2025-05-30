
import { useState } from "react";

export type ChartType = "bar" | "line" | "combined";

interface ChartTypeState {
  [chartId: string]: ChartType;
}

export function useChartType() {
  const [chartTypes, setChartTypes] = useState<ChartTypeState>({
    pacientesMedicoes: "combined",
    medicoesPorDia: "bar"
  });

  const updateChartType = (chartId: string, type: ChartType) => {
    setChartTypes(prev => ({
      ...prev,
      [chartId]: type
    }));
  };

  const getChartType = (chartId: string): ChartType => {
    return chartTypes[chartId] || "bar";
  };

  return {
    chartTypes,
    updateChartType,
    getChartType
  };
}
