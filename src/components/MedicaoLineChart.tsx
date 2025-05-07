
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MedicaoLineChartProps {
  titulo?: string;
  altura?: number;
  medicoes?: any[];
}

export function MedicaoLineChart({ titulo = "Evolução dos Índices", altura = 300, medicoes = [] }) {
  // Dados de exemplo para o gráfico (se não forem fornecidos)
  const dadosProcessados = medicoes.length ? medicoes : [
    { data: "2023-01-05", indiceCraniano: 82, cvai: 2.1, diferencaDiagonais: 2 },
    { data: "2023-02-10", indiceCraniano: 81, cvai: 2.3, diferencaDiagonais: 3 },
    { data: "2023-03-15", indiceCraniano: 80, cvai: 2.8, diferencaDiagonais: 4 },
    { data: "2023-04-20", indiceCraniano: 79, cvai: 2.5, diferencaDiagonais: 3 },
    { data: "2023-05-25", indiceCraniano: 78, cvai: 2.2, diferencaDiagonais: 2 },
    { data: "2023-06-30", indiceCraniano: 79, cvai: 2.0, diferencaDiagonais: 2 },
  ];

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return `${data.getMonth() + 1}/${data.getFullYear().toString().substr(2, 2)}`;
  };

  const formatarTooltipLabel = (label: string) => {
    const data = new Date(label);
    return data.toLocaleDateString('pt-BR');
  };

  const config = {
    indiceCraniano: { color: "#3b82f6", label: "Índice Craniano (%)" }, // azul
    cvai: { color: "#ef4444", label: "CVAI (%)" }, // vermelho
    diferencaDiagonais: { color: "#f59e0b", label: "Diferença Diagonais (mm)" }, // amarelo
  };

  return (
    <div className="w-full">
      {titulo && <div className="font-medium text-lg mb-4">{titulo}</div>}
      <ChartContainer
        className="w-full h-full"
        config={config}
      >
        <ResponsiveContainer width="100%" height={altura}>
          <LineChart
            data={dadosProcessados}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="data" 
              tickFormatter={formatarData}
              minTickGap={15}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatarTooltipLabel(value as string)}
                />
              }
            />
            <Legend verticalAlign="bottom" height={36} />
            <Line
              type="monotone"
              dataKey="indiceCraniano"
              stroke={config.indiceCraniano.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="indiceCraniano"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="cvai"
              stroke={config.cvai.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="cvai"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="diferencaDiagonais"
              stroke={config.diferencaDiagonais.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="diferencaDiagonais"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
