
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea, ResponsiveContainer } from 'recharts';

interface ICEvolutionChartProps {
  data: Array<{
    ageMonths: number;
    ic: number;
    date?: string;
  }>;
}

// Definição das faixas normais de IC por idade baseadas no conhecimento médico
const icNormalRanges = [
  { min_age: 0, max_age: 3, min_ic: 75, max_ic: 95, label: "0-3m" },
  { min_age: 3, max_age: 6, min_ic: 74, max_ic: 94, label: "3-6m" },
  { min_age: 6, max_age: 12, min_ic: 73, max_ic: 93, label: "6-12m" },
  { min_age: 12, max_age: 18, min_ic: 72, max_ic: 92, label: "12-18m" },
  { min_age: 18, max_age: 24, min_ic: 72, max_ic: 92, label: "18-24m" }
];

const ICEvolutionChart: React.FC<ICEvolutionChartProps> = ({ data }) => {
  // Ordenar dados por idade
  const sortedData = [...data].sort((a, b) => a.ageMonths - b.ageMonths);

  const formatTooltip = (value: any, name: string) => {
    if (name === "ic") {
      return [`${value.toFixed(1)}%`, "Índice Craniano"];
    }
    return [value, name];
  };

  const formatXAxisLabel = (value: number) => `${value}m`;

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
          domain={[0, 'dataMax + 2']}
          tickFormatter={formatXAxisLabel}
        />
        <YAxis
          label={{ value: 'Índice Craniano (%)', angle: -90, position: 'insideLeft' }}
          domain={[70, 100]}
        />
        <Tooltip 
          formatter={formatTooltip}
          labelFormatter={(label) => `Idade: ${label} meses`}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Legend verticalAlign="top" height={36}/>

        {/* Faixas de Referência Normais por Idade */}
        {icNormalRanges.map((range, index) => (
          <ReferenceArea
            key={index}
            x1={range.min_age}
            x2={range.max_age}
            y1={range.min_ic}
            y2={range.max_ic}
            strokeOpacity={0.3}
            fill="#e8f5e8"
            fillOpacity={0.4}
            ifOverflow="extendDomain"
          />
        ))}

        {/* Linha do paciente */}
        <Line 
          type="monotone" 
          dataKey="ic" 
          name="Índice Craniano Paciente (%)" 
          stroke="#e53935" 
          strokeWidth={2.5} 
          activeDot={{ r: 6, fill: "#e53935" }}
          dot={{ r: 4, fill: "#e53935" }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ICEvolutionChart;
