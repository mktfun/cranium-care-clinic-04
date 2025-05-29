
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ResponsiveContainer } from 'recharts';

interface CVAIEvolutionChartProps {
  data: Array<{
    ageMonths: number;
    cvai: number;
    date?: string;
  }>;
}

// Faixas de severidade do CVAI baseadas no conhecimento médico (CHOA)
const cvaiRanges = {
  Normal: { min: 0, max: 3.5, color: "#c8e6c9", label: "Normal (0.00% - 3.50%)" },
  Leve: { min: 3.5, max: 6.25, color: "#fff9c4", label: "Leve (3.50% - 6.25%)" },
  Moderada: { min: 6.25, max: 8.75, color: "#ffccbc", label: "Moderada (6.25% - 8.75%)" },
  Grave: { min: 8.75, max: 20, color: "#ffcdd2", label: "Grave (8.75% - 20.00%)" }
};

const CVAIEvolutionChart: React.FC<CVAIEvolutionChartProps> = ({ data }) => {
  // Ordenar dados por idade
  const sortedData = [...data].sort((a, b) => a.ageMonths - b.ageMonths);

  // Calcular range dinâmico para o eixo X
  const minAge = sortedData.length > 0 ? Math.max(0, sortedData[0].ageMonths - 1) : 0;
  const maxAge = sortedData.length > 0 ? sortedData[sortedData.length - 1].ageMonths + 2 : 24;
  
  // Calcular range dinâmico para o eixo Y
  const cvaiValues = sortedData.map(d => d.cvai);
  const minCVAI = cvaiValues.length > 0 ? Math.min(...cvaiValues, 0) : 0;
  const maxCVAI = cvaiValues.length > 0 ? Math.max(...cvaiValues, 10) : 10;
  const yPadding = Math.max(1, (maxCVAI - minCVAI) * 0.1);
  const yMin = Math.max(0, minCVAI - yPadding);
  const yMax = Math.min(15, maxCVAI + yPadding);

  // Gerar ticks dinâmicos para o eixo X
  const generateXTicks = () => {
    const tickInterval = maxAge <= 12 ? 2 : maxAge <= 24 ? 3 : 6;
    const ticks = [];
    for (let i = Math.ceil(minAge / tickInterval) * tickInterval; i <= maxAge; i += tickInterval) {
      ticks.push(i);
    }
    return ticks;
  };

  const formatTooltip = (value: any, name: string) => {
    if (name === "cvai") {
      return [`${value.toFixed(1)}%`, "CVAI"];
    }
    return [value, name];
  };

  const formatXAxisLabel = (value: number) => `${Math.round(value * 10) / 10}m`;
  
  const formatYAxisLabel = (value: number) => `${Math.round(value * 10) / 10}%`;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart 
        data={sortedData} 
        margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="ageMonths"
          label={{ value: 'Idade (meses)', position: 'insideBottom', offset: -10 }}
          type="number"
          domain={[minAge, maxAge]}
          ticks={generateXTicks()}
          tickFormatter={formatXAxisLabel}
        />
        <YAxis
          label={{ value: 'CVAI (%)', angle: -90, position: 'insideLeft' }}
          domain={[yMin, yMax]}
          tickFormatter={formatYAxisLabel}
        />
        <Tooltip 
          formatter={formatTooltip}
          labelFormatter={(label) => `Idade: ${Math.round(label * 10) / 10} meses`}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={60}
          wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
        />

        {/* Faixas de Referência de Severidade */}
        {Object.entries(cvaiRanges).map(([severity, range]) => (
          <ReferenceArea
            key={severity}
            y1={Math.max(range.min, yMin)}
            y2={Math.min(range.max, yMax)}
            strokeOpacity={0.3}
            fill={range.color}
            fillOpacity={0.6}
            ifOverflow="extendDomain"
          />
        ))}

        {/* Linha do paciente */}
        <Line 
          type="monotone" 
          dataKey="cvai"
          name="CVAI Paciente (%)" 
          stroke="#f9a825" 
          strokeWidth={2.5} 
          activeDot={{ r: 6, fill: "#f9a825" }}
          dot={{ r: 4, fill: "#f9a825" }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CVAIEvolutionChart;
