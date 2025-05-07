
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
  ReferenceLine,
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

interface PerimetroCefalicoChartProps {
  titulo?: string;
  altura?: number;
  medicoes?: any[];
}

export function PerimetroCefalicoChart({ titulo = "Evolução do Perímetro Cefálico", altura = 300, medicoes = [] }: PerimetroCefalicoChartProps) {
  // Dados de exemplo para perímetro cefálico (em centímetros)
  const dadosProcessados = medicoes.length ? medicoes : [
    { data: "2023-01-05", idade: 1, perimetroCefalico: 36.2, p3: 34.5, p50: 36.1, p97: 37.9 },
    { data: "2023-02-10", idade: 2, perimetroCefalico: 38.5, p3: 36.2, p50: 37.9, p97: 39.5 },
    { data: "2023-03-15", idade: 3, perimetroCefalico: 40.1, p3: 37.3, p50: 39.1, p97: 40.8 },
    { data: "2023-04-20", idade: 4, perimetroCefalico: 41.5, p3: 38.1, p50: 40.1, p97: 41.8 },
    { data: "2023-05-25", idade: 5, perimetroCefalico: 42.6, p3: 38.9, p50: 40.9, p97: 42.7 },
    { data: "2023-06-30", idade: 6, perimetroCefalico: 43.7, p3: 39.5, p50: 41.5, p97: 43.4 },
  ];

  // Calcular projeção para próximos 3 meses
  const projecao = [];
  if (dadosProcessados.length >= 2) {
    const ultimosDados = dadosProcessados.slice(-2);
    const ultimaMedicao = ultimosDados[1];
    const penultimaMedicao = ultimosDados[0];
    
    const mudancaPorMes = (ultimaMedicao.perimetroCefalico - penultimaMedicao.perimetroCefalico) / 
                          (ultimaMedicao.idade - penultimaMedicao.idade);
    
    for (let i = 1; i <= 3; i++) {
      const novaIdade = ultimaMedicao.idade + i;
      const novoPerimetro = ultimaMedicao.perimetroCefalico + (mudancaPorMes * i);
      
      // Valores aproximados para os percentis futuros (simplificados)
      const p3Futuro = ultimaMedicao.p3 + (ultimaMedicao.p3 - penultimaMedicao.p3) / 
                      (ultimaMedicao.idade - penultimaMedicao.idade) * i;
      const p50Futuro = ultimaMedicao.p50 + (ultimaMedicao.p50 - penultimaMedicao.p50) / 
                       (ultimaMedicao.idade - penultimaMedicao.idade) * i;
      const p97Futuro = ultimaMedicao.p97 + (ultimaMedicao.p97 - penultimaMedicao.p97) / 
                       (ultimaMedicao.idade - penultimaMedicao.idade) * i;
      
      projecao.push({
        data: `Projeção ${i}m`,
        idade: novaIdade,
        perimetroCefalico: parseFloat(novoPerimetro.toFixed(1)),
        p3: parseFloat(p3Futuro.toFixed(1)),
        p50: parseFloat(p50Futuro.toFixed(1)),
        p97: parseFloat(p97Futuro.toFixed(1)),
        projecao: true
      });
    }
  }

  const dadosComProjecao = [...dadosProcessados, ...projecao];

  const formatarData = (dataString: string) => {
    if (dataString.includes("Projeção")) return dataString;
    const data = new Date(dataString);
    return `${data.getMonth() + 1}/${data.getFullYear().toString().substr(2, 2)}`;
  };

  const formatarTooltipLabel = (label: string) => {
    if (label.includes("Projeção")) return label;
    const data = new Date(label);
    return data.toLocaleDateString('pt-BR');
  };

  const config = {
    paciente: { color: "#10b981", label: "Paciente" }, // verde
    p3: { color: "#94a3b8", label: "Percentil 3%" }, // cinza
    p50: { color: "#3b82f6", label: "Percentil 50%" }, // azul
    p97: { color: "#94a3b8", label: "Percentil 97%" }, // cinza
    projecao: { color: "#f59e0b", label: "Projeção" }, // amarelo
  };

  return (
    <div className="w-full">
      <div className="font-medium text-lg mb-2">{titulo}</div>
      <div className="text-xs text-muted-foreground mb-4">
        Comparação com percentis da OMS (P3, P50, P97)
      </div>
      <ChartContainer
        className="w-full h-full"
        config={config}
      >
        <ResponsiveContainer width="100%" height={altura}>
          <LineChart
            data={dadosComProjecao}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="data" 
              tickFormatter={formatarData}
              minTickGap={15}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              label={{ 
                value: "Perímetro (cm)", 
                angle: -90, 
                position: "insideLeft",
                style: { textAnchor: "middle" },
                offset: 0
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
            <Line
              type="monotone"
              dataKey="p3"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
              name="p3"
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
              name="p50"
            />
            <Line
              type="monotone"
              dataKey="p97"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
              name="p97"
            />
            <Line
              type="monotone"
              dataKey="perimetroCefalico"
              stroke={config.paciente.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="paciente"
              connectNulls
            />
            {/* Linha pontilhada dividindo dados reais e projeção */}
            {projecao.length > 0 && (
              <ReferenceLine
                x={dadosProcessados[dadosProcessados.length-1].data}
                stroke="#6b7280"
                strokeDasharray="3 3"
                label={{
                  value: "Atual",
                  position: "insideTopRight",
                  fill: "#6b7280",
                }}
              />
            )}
            {/* Linha de projeção */}
            {projecao.length > 0 && (
              <Line
                type="monotone"
                dataKey="perimetroCefalico"
                stroke={config.projecao.color}
                strokeWidth={2}
                strokeDasharray="5 3"
                activeDot={{ r: 6 }}
                dot={{ r: 4 }}
                name="projecao"
                connectNulls
                hide={projecao.length === 0}
                data={projecao}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
