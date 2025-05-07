
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

interface DiametrosCranianosChartProps {
  titulo?: string;
  altura?: number;
  medicoes?: any[];
}

export function DiametrosCranianosChart({ 
  titulo = "Proporção dos Diâmetros Cranianos", 
  altura = 300, 
  medicoes = [] 
}: DiametrosCranianosChartProps) {
  // Dados de exemplo para os diâmetros cranianos (em milímetros)
  const dadosProcessados = medicoes.length ? medicoes : [
    { 
      data: "2023-01-05", 
      idade: 1, 
      anteroposterior: 120, // Comprimento (diâmetro AP)
      lateral: 95,         // Largura (diâmetro lateral)
      indiceProporc: 79.17, // (lateral/anteroposterior) * 100
      diagonalD: 135,
      diagonalE: 134,
      diferencaDiagonais: 1,
      rangeMeta: [75, 85]  // Faixa ideal do índice craniano
    },
    { 
      data: "2023-02-10", 
      idade: 2, 
      anteroposterior: 126, 
      lateral: 101,
      indiceProporc: 80.16,
      diagonalD: 140,
      diagonalE: 138,
      diferencaDiagonais: 2,
      rangeMeta: [75, 85]
    },
    { 
      data: "2023-03-15", 
      idade: 3, 
      anteroposterior: 130, 
      lateral: 105,
      indiceProporc: 80.77,
      diagonalD: 144,
      diagonalE: 141,
      diferencaDiagonais: 3,
      rangeMeta: [75, 85]
    },
    { 
      data: "2023-04-20", 
      idade: 4, 
      anteroposterior: 133, 
      lateral: 109,
      indiceProporc: 81.95,
      diagonalD: 148,
      diagonalE: 144,
      diferencaDiagonais: 4,
      rangeMeta: [75, 85]
    },
    { 
      data: "2023-05-25", 
      idade: 5, 
      anteroposterior: 136, 
      lateral: 113,
      indiceProporc: 83.09,
      diagonalD: 151,
      diagonalE: 146,
      diferencaDiagonais: 5,
      rangeMeta: [75, 85]
    },
    { 
      data: "2023-06-30", 
      idade: 6, 
      anteroposterior: 138, 
      lateral: 114,
      indiceProporc: 82.61,
      diagonalD: 153,
      diagonalE: 147,
      diferencaDiagonais: 6,
      rangeMeta: [75, 85]
    },
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
    anteroposterior: { color: "#3b82f6", label: "Comprimento" }, // azul
    lateral: { color: "#10b981", label: "Largura" }, // verde
    indiceProporc: { color: "#f59e0b", label: "Índice Craniano" }, // amarelo
    diagonalD: { color: "#8b5cf6", label: "Diagonal Direita" }, // roxo
    diagonalE: { color: "#ec4899", label: "Diagonal Esquerda" }, // rosa
    diferencaDiagonais: { color: "#ef4444", label: "Diferença Diagonais" }, // vermelho
    rangeMeta: { color: "rgba(148, 163, 184, 0.2)", label: "Faixa Normal" }, // cinza transparente
  };

  return (
    <div className="w-full">
      <div className="font-medium text-lg mb-2">{titulo}</div>
      <div className="text-xs text-muted-foreground mb-4">
        Comprimento (AP) vs. Largura e Índice Craniano (%)
      </div>
      <ChartContainer
        className="w-full h-full"
        config={config}
      >
        <ResponsiveContainer width="100%" height={altura}>
          <ComposedChart
            data={dadosProcessados}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="data" 
              tickFormatter={formatarData}
              minTickGap={15}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              domain={[
                (dataMin: number) => Math.round(dataMin * 0.9),
                (dataMax: number) => Math.round(dataMax * 1.1)
              ]}
              label={{ 
                value: "Medidas (mm)", 
                angle: -90, 
                position: "insideLeft",
                style: { textAnchor: "middle" }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[60, 100]}
              label={{ 
                value: "Índice Craniano (%)", 
                angle: 90, 
                position: "insideRight",
                style: { textAnchor: "middle" }
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatarTooltipLabel(value as string)}
                />
              }
            />
            <Legend verticalAlign="bottom" height={36} />
            
            {/* Área sombreada para faixa normal do índice craniano */}
            <Bar
              dataKey="rangeMeta"
              yAxisId="right"
              name="rangeMeta"
              fill={config.rangeMeta.color}
              stroke="transparent"
              fillOpacity={0.5}
              isAnimationActive={false}
              barSize={30}
              radius={0}
              legendType="none"
            />
            
            {/* Diâmetros cranianos (eixo esquerdo) */}
            <Line
              type="monotone"
              dataKey="anteroposterior"
              yAxisId="left"
              stroke={config.anteroposterior.color}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="anteroposterior"
            />
            <Line
              type="monotone"
              dataKey="lateral"
              yAxisId="left"
              stroke={config.lateral.color}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="lateral"
            />
            
            {/* Diagonais */}
            <Line
              type="monotone"
              dataKey="diagonalD"
              yAxisId="left"
              stroke={config.diagonalD.color}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3 }}
              name="diagonalD"
            />
            <Line
              type="monotone"
              dataKey="diagonalE"
              yAxisId="left"
              stroke={config.diagonalE.color}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3 }}
              name="diagonalE"
            />
            
            {/* Índice Craniano (eixo direito) */}
            <Line
              type="monotone"
              dataKey="indiceProporc"
              yAxisId="right"
              stroke={config.indiceProporc.color}
              strokeWidth={3}
              dot={{ r: 5, fill: config.indiceProporc.color }}
              activeDot={{ r: 7 }}
              name="indiceProporc"
            />
            
            {/* Linha para referência da faixa normal (índice craniano entre 75-85%) */}
            <ReferenceLine y={75} yAxisId="right" stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine y={85} yAxisId="right" stroke="#94a3b8" strokeDasharray="3 3" />
            
            {/* Diferença entre diagonais (opcional, pode ser ativado) */}
            <Line
              type="monotone"
              dataKey="diferencaDiagonais"
              yAxisId="left"
              stroke={config.diferencaDiagonais.color}
              strokeWidth={1.5}
              dot={{ r: 3 }}
              name="diferencaDiagonais"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
