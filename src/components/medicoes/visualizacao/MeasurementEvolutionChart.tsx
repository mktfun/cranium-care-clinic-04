
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
import { useMediaQuery } from "@/hooks/use-media-query";

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
  dataNascimento?: string; // Adicionado para calcular idade correta
}

// Função para calcular idade em meses com precisão decimal
function calcularIdadeEmMeses(dataNascimento: string, dataMedicao: string): number {
  const nascimento = new Date(dataNascimento);
  const medicao = new Date(dataMedicao);
  
  // Calcular diferença em anos e meses
  let anos = medicao.getFullYear() - nascimento.getFullYear();
  let meses = medicao.getMonth() - nascimento.getMonth();
  let dias = medicao.getDate() - nascimento.getDate();
  
  // Ajustar se os dias são negativos
  if (dias < 0) {
    meses--;
    // Adicionar os dias do mês anterior
    const ultimoDiaMesAnterior = new Date(medicao.getFullYear(), medicao.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  
  // Ajustar se os meses são negativos
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  // Converter para meses decimais (aproximando dias como fração do mês)
  const totalMeses = anos * 12 + meses + (dias / 30);
  
  return Math.round(totalMeses * 100) / 100; // Arredondar para 2 casas decimais
}

export default function MeasurementEvolutionChart({
  measurementHistory,
  metricType = 'indiceCraniano',
  colorTheme = "blue",
  sexoPaciente,
  dataNascimento
}: MeasurementHistoryProps) {
  const isMobile = useMediaQuery(768);
  
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
    
    // Calcular a idade em meses corretamente usando a data de nascimento
    let idadeEmMeses = 0;
    if (dataNascimento) {
      idadeEmMeses = calcularIdadeEmMeses(dataNascimento, m.data);
    } else {
      // Fallback: usar índice da medição se não tiver data de nascimento
      console.warn('Data de nascimento não fornecida para cálculo correto da idade');
      idadeEmMeses = sortedHistory.indexOf(m) * 2; // Aproximação de 2 meses entre medições
    }
    
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
      dataCompleta: m.data,
      idadeEmMeses: idadeEmMeses,
      idadeFormatada: formatarIdade(idadeEmMeses)
    };
  });
  
  // Função para formatar idade de forma legível
  function formatarIdade(meses: number): string {
    const mesesInteiros = Math.floor(meses);
    const diasRestantes = Math.round((meses - mesesInteiros) * 30);
    
    if (mesesInteiros === 0) {
      return `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
    } else if (diasRestantes === 0) {
      return `${mesesInteiros} ${mesesInteiros === 1 ? 'mês' : 'meses'}`;
    } else {
      return `${mesesInteiros} ${mesesInteiros === 1 ? 'mês' : 'meses'} e ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
    }
  }
  
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
  
  // Ajustar tamanhos e margens baseados no dispositivo
  const getFontSize = () => isMobile ? 10 : 12;
  const getLabelSize = () => isMobile ? 10 : 12;
  const getMargin = () => isMobile 
    ? { top: 5, right: 10, left: 5, bottom: 20 }
    : { top: 5, right: 30, left: 20, bottom: 5 };
  
  // Ajustar a exibição de labels para dispositivos móveis
  const renderYAxisLabel = () => {
    if (isMobile) {
      return null; // Em dispositivos móveis, não mostrar o label para economizar espaço
    }
    
    return { 
      value: yAxisLabel, 
      angle: -90, 
      position: 'insideLeft',
      style: { textAnchor: 'middle', fontSize: getLabelSize(), fill: '#64748b' } 
    };
  };
  
  // Determinar o domínio do eixo X baseado na idade máxima
  const maxIdade = Math.max(...chartData.map(d => d.idadeEmMeses), 12); // Mínimo de 12 meses para visualização
  const xDomain = [0, Math.ceil(maxIdade * 1.1)]; // Adicionar 10% de margem
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={getMargin()}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
          <XAxis 
            dataKey="idadeEmMeses" 
            stroke="#64748b"
            tick={{ fontSize: getFontSize() }}
            tickMargin={10}
            domain={xDomain}
            type="number"
            tickFormatter={(value) => `${Math.round(value)}m`}
            label={{ 
              value: 'Idade (meses)', 
              position: 'insideBottomRight', 
              offset: -10,
              style: { fontSize: getFontSize(), fill: '#64748b' }
            }}
          />
          <YAxis 
            domain={yDomain}
            stroke="#64748b"
            tick={{ fontSize: getFontSize() }}
            tickMargin={5}
            width={isMobile ? 30 : 50}
            label={renderYAxisLabel()}
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
          
          {/* Linhas de referência - mostrar menos referências em dispositivos móveis */}
          {(isMobile ? referenceLines.slice(0, 2) : referenceLines).map((line, index) => (
            <ReferenceLine 
              key={index}
              y={line.value}
              label={isMobile ? undefined : { 
                value: line.label,
                position: 'right',
                fill: line.color,
                fontSize: getFontSize() - 1
              }}
              stroke={line.color}
              strokeDasharray="3 3"
            />
          ))}
          
          <Tooltip
            formatter={(value, name) => [valueFormatter(value as number), name]}
            labelFormatter={(value) => `Idade: ${formatarIdade(value as number)}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={isMobile ? 30 : 36} 
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line 
            type="monotone" 
            dataKey="valor" 
            name={yAxisLabel}
            stroke={colorTheme === "blue" ? "#3b82f6" : 
                   colorTheme === "rose" ? "#e11d48" : 
                   colorTheme === "amber" ? "#f59e0b" : 
                   "#3b82f6"}
            strokeWidth={2.5}
            activeDot={{ r: isMobile ? 4 : 6 }}
            dot={{ 
              r: isMobile ? 3 : 4, 
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
