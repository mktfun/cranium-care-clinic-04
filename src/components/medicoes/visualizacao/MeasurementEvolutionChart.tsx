
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer, 
  ReferenceLine,
  Area
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface MeasurementHistoryProps {
  measurementHistory: Array<{
    data: string;
    comprimento?: number;
    largura?: number;
    diagonalD?: number;
    diagonalE?: number;
    perimetroCefalico?: number;
    indice_craniano?: number;
    cvai?: number;
  }>;
  metricType: 'indiceCraniano' | 'cvai' | 'perimetroCefalico';
  colorTheme?: string;
  sexoPaciente?: 'M' | 'F';
}

export default function MeasurementEvolutionChart({
  measurementHistory,
  metricType = 'indiceCraniano',
  colorTheme = "blue",
  sexoPaciente
}: MeasurementHistoryProps) {
  if (!measurementHistory || measurementHistory.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <CardContent className="pt-4">Sem dados históricos disponíveis</CardContent>
      </Card>
    );
  }
  
  // Ordenar medições por data
  const sortedHistory = [...measurementHistory].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  // Ajustar o formato dos dados para o gráfico
  const chartData = sortedHistory.map(m => {
    const date = new Date(m.data);
    
    // Calcular a idade em meses para o eixo X
    const dataPartes = m.data.split('T')[0].split('-');
    const medicaoData = new Date(parseInt(dataPartes[0]), parseInt(dataPartes[1]) - 1, parseInt(dataPartes[2]));
    
    // Escolher o campo correto baseado no tipo de métrica
    let value;
    if (metricType === 'indiceCraniano') {
      value = m.indice_craniano;
    } else if (metricType === 'cvai') {
      value = m.cvai;
    } else {
      value = m.perimetroCefalico;
    }
    
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: value,
      dataCompleta: m.data
    };
  });
  
  // Configurar limites e referências baseados no tipo de métrica
  let yDomain, normalMin, normalMax, referenceLines, gradientColors;
  
  if (metricType === 'indiceCraniano') {
    yDomain = [70, 95];
    normalMin = 76;
    normalMax = 81;
    gradientColors = ["#10b981", "#f59e0b", "#ef4444"];
    
    referenceLines = [
      { value: 76, label: "Limite Dolicocefalia", color: "#f59e0b" },
      { value: 81, label: "Limite Braquicefalia", color: "#f59e0b" }
    ];
  } else if (metricType === 'cvai') {
    yDomain = [0, 12];
    normalMin = 0;
    normalMax = 3.5;
    gradientColors = ["#10b981", "#f59e0b", "#ef4444"];
    
    referenceLines = [
      { value: 3.5, label: "Limite Normal", color: "#f59e0b" },
      { value: 6.25, label: "Moderada", color: "#f97316" },
      { value: 8.75, label: "Severa", color: "#ef4444" }
    ];
  } else {
    // Para perímetro cefálico, os limites dependem da idade e sexo
    yDomain = undefined; // Auto
    normalMin = undefined;
    normalMax = undefined;
    gradientColors = ["#3b82f6"];
    referenceLines = [];
  }
  
  // Configurar o título e formato do eixo Y
  let yAxisLabel, valueFormatter;
  
  if (metricType === 'indiceCraniano') {
    yAxisLabel = "Índice Craniano (%)";
    valueFormatter = (value: number) => `${value.toFixed(1)}%`;
  } else if (metricType === 'cvai') {
    yAxisLabel = "CVAI (%)";
    valueFormatter = (value: number) => `${value.toFixed(1)}%`;
  } else {
    yAxisLabel = "Perímetro Cefálico (mm)";
    valueFormatter = (value: number) => `${value}mm`;
  }
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yDomain}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' } 
            }}
          />
          
          {/* Áreas de normalidade/severidade */}
          {metricType === 'indiceCraniano' && (
            <>
              <Area 
                type="monotone"
                dataKey="dummyForNormalArea"
                stroke="none"
                fill="#10b98120"
                fillOpacity={0.3}
                baseValue={normalMin}
                stackId="stack"
              />
              <Area 
                type="monotone"
                dataKey={() => normalMax - normalMin}
                stroke="none"
                fill="#10b98120"
                fillOpacity={0.3}
                baseValue={normalMin}
                stackId="stack"
              />
            </>
          )}
          
          {metricType === 'cvai' && (
            <Area 
              type="monotone"
              dataKey={() => normalMax}
              stroke="none"
              fill="#10b98120"
              fillOpacity={0.3}
              baseValue={0}
            />
          )}
          
          {/* Linhas de referência */}
          {referenceLines.map((line, index) => (
            <ReferenceLine 
              key={index}
              y={line.value}
              label={{ 
                value: line.label,
                position: 'right',
                fill: line.color,
                fontSize: 11
              }}
              stroke={line.color}
              strokeDasharray="3 3"
            />
          ))}
          
          <Tooltip
            formatter={valueFormatter}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="valor" 
            name={yAxisLabel}
            stroke={colorTheme === "blue" ? "#3b82f6" : 
                   colorTheme === "rose" ? "#e11d48" : 
                   colorTheme === "amber" ? "#f59e0b" : 
                   "#3b82f6"}
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={{ 
              r: 4, 
              stroke: colorTheme === "blue" ? "#3b82f6" : 
                      colorTheme === "rose" ? "#e11d48" : 
                      colorTheme === "amber" ? "#f59e0b" : 
                      "#3b82f6", 
              fill: "white", 
              strokeWidth: 2 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
