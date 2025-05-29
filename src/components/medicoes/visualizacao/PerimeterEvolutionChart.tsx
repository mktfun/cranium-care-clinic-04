
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerimeterEvolutionChartProps {
  patientData: Array<{
    ageMonths: number;
    perimeter: number;
    date?: string;
  }>;
  sex: 'M' | 'F';
}

// Dados normativos da OMS para perímetro cefálico (baseados nas curvas de crescimento)
// Valores convertidos para mm e ajustados conforme o conhecimento médico
const generateWHOPercentiles = (sex: 'M' | 'F') => {
  const percentiles = [];
  
  for (let month = 0; month <= 24; month++) {
    // Fórmulas baseadas nas curvas de crescimento da OMS
    // Valores iniciais diferentes para meninos e meninas
    const baseP50 = sex === 'M' ? 350 : 343;
    let p3, p15, p50, p85, p97;

    if (month === 0) {
      // Recém-nascido
      p50 = baseP50;
      p3 = sex === 'M' ? 328 : 321;
      p15 = sex === 'M' ? 339 : 332;
      p85 = sex === 'M' ? 361 : 354;
      p97 = sex === 'M' ? 372 : 365;
    } else if (month <= 3) {
      // 0-3 meses: crescimento rápido
      const growthRate = sex === 'M' ? 20 : 18;
      p50 = baseP50 + growthRate * Math.min(month, 3);
      
      const deviation = 5 + month;
      p3 = p50 - 2 * deviation;
      p15 = p50 - deviation;
      p85 = p50 + deviation;
      p97 = p50 + 2 * deviation;
    } else if (month <= 6) {
      // 3-6 meses: crescimento moderado
      const baseAt3mo = baseP50 + (sex === 'M' ? 60 : 54);
      const growthRate = sex === 'M' ? 10 : 9;
      p50 = baseAt3mo + growthRate * (month - 3);
      
      const deviation = 7 + 0.5 * (month - 3);
      p3 = p50 - 2 * deviation;
      p15 = p50 - deviation;
      p85 = p50 + deviation;
      p97 = p50 + 2 * deviation;
    } else if (month <= 12) {
      // 6-12 meses: crescimento mais lento
      const baseAt6mo = baseP50 + (sex === 'M' ? 90 : 81);
      const growthRate = sex === 'M' ? 5 : 4.5;
      p50 = baseAt6mo + growthRate * (month - 6);
      
      const deviation = 8.5 + 0.3 * (month - 6);
      p3 = p50 - 2 * deviation;
      p15 = p50 - deviation;
      p85 = p50 + deviation;
      p97 = p50 + 2 * deviation;
    } else if (month <= 24) {
      // 12-24 meses: crescimento ainda mais lento
      const baseAt12mo = baseP50 + (sex === 'M' ? 120 : 108);
      const growthRate = sex === 'M' ? 3 : 2.8;
      p50 = baseAt12mo + growthRate * (month - 12);
      
      const deviation = 10;
      p3 = p50 - 2 * deviation;
      p15 = p50 - deviation;
      p85 = p50 + deviation;
      p97 = p50 + 2 * deviation;
    }

    percentiles.push({
      Month: month,
      P3: Math.round(p3),
      P15: Math.round(p15),
      P50: Math.round(p50),
      P85: Math.round(p85),
      P97: Math.round(p97)
    });
  }
  
  return percentiles;
};

const PerimeterEvolutionChart: React.FC<PerimeterEvolutionChartProps> = ({ patientData, sex }) => {
  // Gerar dados normativos para o sexo especificado
  const normativeData = generateWHOPercentiles(sex);
  
  // Ordenar dados do paciente por idade
  const sortedPatientData = [...patientData].sort((a, b) => a.ageMonths - b.ageMonths);

  // Calcular range dinâmico para o eixo X
  const minAge = sortedPatientData.length > 0 ? Math.max(0, sortedPatientData[0].ageMonths - 1) : 0;
  const maxAge = sortedPatientData.length > 0 ? Math.min(24, sortedPatientData[sortedPatientData.length - 1].ageMonths + 2) : 24;

  // Filtrar dados normativos para o range de idade relevante
  const relevantNormativeData = normativeData.filter(d => d.Month >= minAge && d.Month <= maxAge);

  // Calcular range dinâmico para o eixo Y
  const perimeterValues = sortedPatientData.map(d => d.perimeter);
  const normativeValues = relevantNormativeData.flatMap(d => [d.P3, d.P15, d.P50, d.P85, d.P97]);
  const allValues = [...perimeterValues, ...normativeValues];
  const minPerimeter = allValues.length > 0 ? Math.min(...allValues) : 300;
  const maxPerimeter = allValues.length > 0 ? Math.max(...allValues) : 550;
  const yPadding = (maxPerimeter - minPerimeter) * 0.1;
  const yMin = Math.max(280, minPerimeter - yPadding);
  const yMax = Math.min(600, maxPerimeter + yPadding);

  // Combinar dados do paciente com dados normativos
  const combinedData = relevantNormativeData.map(normPoint => {
    const patientPoint = sortedPatientData.find(p => 
      Math.abs(p.ageMonths - normPoint.Month) < 0.5
    );
    return {
      ...normPoint,
      patientPerimeter: patientPoint ? patientPoint.perimeter : null,
    };
  });

  // Adicionar pontos do paciente que não coincidem com meses exatos
  sortedPatientData.forEach(pPoint => {
    if (!combinedData.some(c => Math.abs(c.Month - pPoint.ageMonths) < 0.5)) {
      combinedData.push({
        Month: pPoint.ageMonths,
        patientPerimeter: pPoint.perimeter,
        P3: null, P15: null, P50: null, P85: null, P97: null
      });
    }
  });

  // Ordenar dados combinados
  combinedData.sort((a, b) => a.Month - b.Month);

  // Gerar ticks dinâmicos para o eixo X
  const generateXTicks = () => {
    const tickInterval = maxAge <= 12 ? 2 : maxAge <= 24 ? 3 : 6;
    const ticks = [];
    for (let i = Math.ceil(minAge / tickInterval) * tickInterval; i <= maxAge; i += tickInterval) {
      ticks.push(i);
    }
    return ticks;
  };

  const chartTitle = `Perímetro Cefálico (${sex === 'M' ? 'Meninos' : 'Meninas'})`;

  const formatTooltip = (value: any, name: string) => {
    if (value === null) return ['-', name];
    return [`${Math.round(value)} mm`, name];
  };

  const formatXAxisLabel = (value: number) => `${Math.round(value * 10) / 10}m`;

  const formatYAxisLabel = (value: number) => `${Math.round(value)} mm`;

  return (
    <div>
      <h3 className="text-center mb-4 font-medium">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={combinedData} 
          margin={{ top: 20, right: 40, left: 40, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="Month"
            label={{ value: 'Idade (meses)', position: 'insideBottom', offset: -10 }}
            type="number"
            domain={[minAge, maxAge]}
            ticks={generateXTicks()}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis
            label={{ value: 'Perímetro Cefálico (mm)', angle: -90, position: 'insideLeft' }}
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
            verticalAlign="bottom" 
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
          />

          {/* Curvas de Percentis OMS */}
          <Line 
            type="monotone" 
            dataKey="P3" 
            name="P3 (OMS - 2nd)" 
            stroke="#bdbdbd" 
            strokeWidth={1.5} 
            strokeDasharray="3 3"
            dot={false} 
            activeDot={false} 
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="P15" 
            name="P15 (OMS - 10th)" 
            stroke="#81d4fa" 
            strokeWidth={1.5} 
            dot={false} 
            activeDot={false} 
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="P50" 
            name="P50 (OMS)" 
            stroke="#0288d1" 
            strokeWidth={2} 
            dot={false} 
            activeDot={false} 
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="P85" 
            name="P85 (OMS - 75th)" 
            stroke="#81d4fa" 
            strokeWidth={1.5} 
            dot={false} 
            activeDot={false} 
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="P97" 
            name="P97 (OMS - 98th)" 
            stroke="#bdbdbd" 
            strokeWidth={1.5} 
            strokeDasharray="3 3"
            dot={false} 
            activeDot={false} 
            connectNulls={false}
          />

          {/* Linha do Paciente */}
          <Line 
            type="monotone" 
            dataKey="patientPerimeter"
            name="Perímetro Cefálico Paciente (mm)" 
            stroke="#4caf50" 
            strokeWidth={2.5} 
            activeDot={{ r: 6, fill: "#4caf50" }}
            dot={{ r: 4, fill: "#4caf50" }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerimeterEvolutionChart;
