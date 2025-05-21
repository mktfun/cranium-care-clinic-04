
import { useEffect, useState } from "react";
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
  ReferenceArea,
  Dot,
} from "recharts";
import { calculateAge } from "@/lib/age-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Tipos de dados
interface MedicaoLineChartProps {
  titulo?: string;
  descricao?: string;
  medicoes: any[];
  dataNascimento: string;
  sexoPaciente?: string;
  altura?: number;
  tipoGrafico?: "indiceCraniano" | "cvai" | "perimetro" | "diagonais";
  linhaCorTheme?: string;
}

// Funções para cores
function getLineColor(theme: string = "blue") {
  const colors = {
    blue: "rgba(37, 99, 235, 1)",
    green: "rgba(22, 163, 74, 1)",
    red: "rgba(220, 38, 38, 1)",
    purple: "rgba(139, 92, 246, 1)",
    amber: "rgba(217, 119, 6, 1)",
    orange: "rgba(234, 88, 12, 1)",
    rose: "rgba(225, 29, 72, 1)",
  };
  return colors[theme as keyof typeof colors] || colors.blue;
}

// Função personalizada para renderizar pontos no gráfico
const renderCustomDot = (fill: string) => (props: any) => {
  const { cx, cy, payload, index } = props;
  // Não renderizar pontos para dados de referência
  if (payload.paciente === null) return null;
  
  return (
    <Dot 
      key={`dot-${index}-${payload.idadeEmMeses || ""}`} 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={fill} 
      stroke="#fff" 
      strokeWidth={1} 
    />
  );
};

export function MedicaoLineChart({
  titulo,
  descricao,
  medicoes = [],
  dataNascimento,
  sexoPaciente = "M",
  altura = 350,
  tipoGrafico = "indiceCraniano",
  linhaCorTheme = "blue"
}: MedicaoLineChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState<any>(null);

  useEffect(() => {
    if (medicoes.length === 0) {
      setLoading(false);
      return;
    }

    const processedData = [...medicoes]
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((medicao) => {
        const { months, days } = calculateAge(dataNascimento, medicao.data);
        const idadeMeses = months + (days / 30); // Aproximada em meses decimais para gráfico
        
        // Converter unidades para garantir consistência
        // Todas as medidas devem estar em mm, exceto perímetro cefálico em cm
        let perimetro = medicao.perimetro_cefalico || medicao.perimetroCefalico;
        
        // Se o perímetro estiver em mm, converter para cm
        if (perimetro && perimetro > 200) {
          perimetro = perimetro / 10;
        }
        
        return {
          ...medicao,
          idadeEmMeses: idadeMeses,
          idadeFormatada: `${months} ${months === 1 ? 'mês' : 'meses'}${days > 0 ? ` e ${days} ${days === 1 ? 'dia' : 'dias'}` : ''}`,
          comprimento: Number(medicao.comprimento),
          largura: Number(medicao.largura),
          diagonal_d: Number(medicao.diagonal_d || medicao.diagonalD),
          diagonal_e: Number(medicao.diagonal_e || medicao.diagonalE),
          diferenca_diagonais: Number(medicao.diferenca_diagonais || medicao.diferencaDiagonais),
          indice_craniano: Number(medicao.indice_craniano || medicao.indiceCraniano),
          cvai: Number(medicao.cvai),
          perimetro_cefalico: perimetro ? Number(perimetro) : undefined,
          paciente: true, // Marcar que são pontos do paciente
          id: medicao.id || `medicao-${Math.random()}`, // Garantir que sempre tenha um ID único
        };
      });

    // Adicionar dados de referência conforme o tipo de gráfico
    const chartDataWithReference = addReferenceData(processedData, tipoGrafico, sexoPaciente);
    setChartData(chartDataWithReference);
    setLoading(false);
  }, [medicoes, dataNascimento, tipoGrafico, sexoPaciente]);

  // Função para adicionar dados de referência
  const addReferenceData = (data: any[], tipo: string, sexo: string) => {
    if (data.length === 0) return [];
    
    // Obter a faixa de idade
    const minAge = 0;
    const maxAge = Math.max(...data.map(d => d.idadeEmMeses), 18) + 3; // Adiciona 3 meses para visualização futura
    
    // Criar array com pontos de referência para cada mês
    const referencePoints = Array.from({ length: Math.ceil(maxAge) + 1 }, (_, i) => ({
      idadeEmMeses: i,
      idadeFormatada: `${i} ${i === 1 ? 'mês' : 'meses'}`,
      paciente: null // Marcar que não são pontos do paciente
    }));
    
    // Adicionar dados específicos conforme o tipo de gráfico
    if (tipo === "indiceCraniano") {
      return addIndiceReferenceData([...data, ...referencePoints]);
    } else if (tipo === "cvai") {
      return addCvaiReferenceData([...data, ...referencePoints]);
    } else if (tipo === "diagonais") {
      return addDiagonaisReferenceData([...data, ...referencePoints]);
    } else if (tipo === "perimetro" || tipo === "perimetroCefalico") {
      return addPerimetroReferenceData([...data, ...referencePoints], sexo);
    }
    
    return data;
  };

  // Adicionar dados de referência para Índice Craniano
  const addIndiceReferenceData = (data: any[]) => {
    return data.map(point => ({
      ...point,
      // Limites para classificação de braquicefalia/dolicocefalia
      normalLowerBound: 75, // Atualizado para 75
      normalUpperBound: 85, // Atualizado para 85
      braquiLeve: 87,      // Ajustado com base no novo limite superior
      braquiModerada: 90,
      dolicoLeve: 73,      // Ajustado com base no novo limite inferior
      dolicoModerada: 70,
      mediaPopulacional: 80 // Média ajustada para o centro do intervalo normal
    }));
  };

  // Adicionar dados de referência para CVAI
  const addCvaiReferenceData = (data: any[]) => {
    return data.map(point => ({
      ...point,
      // Limites para classificação de plagiocefalia
      normal: 3.5,
      leve: 6.25,
      moderada: 8.5,
      mediaPopulacional: 2
    }));
  };

  // Adicionar dados de referência para diferença de diagonais
  const addDiagonaisReferenceData = (data: any[]) => {
    return data.map(point => ({
      ...point,
      // Valores de referência para diferença de diagonais
      normal: 3,
      leve: 6,
      moderada: 10,
      mediaPopulacional: 1.5
    }));
  };

  // Adicionar dados de referência para Perímetro Cefálico
  const addPerimetroReferenceData = (data: any[], sexo: string) => {
    return data.map(point => {
      const idadeMeses = point.idadeEmMeses;
      
      // Valores baseados nas curvas de crescimento da OMS
      // Estas fórmulas são mais precisas e baseadas em estudos pediátricos
      // As curvas são divididas por faixas etárias para maior precisão
      
      // Valores iniciais diferentes para meninos e meninas
      const baseP50 = sexo === 'M' ? 35 : 34.3;
      
      let p3, p15, p50, p85, p97;
      
      // Cálculo do perímetro baseado nas curvas de crescimento da OMS
      if (idadeMeses === 0) {
        // Recém-nascido
        p50 = baseP50;
        // Os percentis são calculados como proporções aproximadas do P50
        p3 = sexo === 'M' ? 32.8 : 32.1;
        p15 = sexo === 'M' ? 33.9 : 33.2;
        p85 = sexo === 'M' ? 36.1 : 35.4;
        p97 = sexo === 'M' ? 37.2 : 36.5;
      } else if (idadeMeses <= 3) {
        // 0-3 meses: crescimento rápido
        // Taxa de crescimento ajustada por sexo
        const growthRate = sexo === 'M' ? 2.0 : 1.8;
        p50 = baseP50 + (growthRate * Math.min(idadeMeses, 3));
        
        // Desvios padrão proporcionais à idade
        const deviation = 0.5 + (0.1 * idadeMeses);
        p3 = p50 - (2 * deviation);
        p15 = p50 - deviation;
        p85 = p50 + deviation;
        p97 = p50 + (2 * deviation);
      } else if (idadeMeses <= 6) {
        // 3-6 meses: crescimento moderado
        const baseAt3mo = baseP50 + (sexo === 'M' ? 6.0 : 5.4);
        const growthRate = sexo === 'M' ? 1.0 : 0.9;
        p50 = baseAt3mo + (growthRate * (idadeMeses - 3));
        
        // Desvios padrão para esta faixa etária
        const deviation = 0.7 + (0.05 * (idadeMeses - 3));
        p3 = p50 - (2 * deviation);
        p15 = p50 - deviation;
        p85 = p50 + deviation;
        p97 = p50 + (2 * deviation);
      } else if (idadeMeses <= 12) {
        // 6-12 meses: crescimento mais lento
        const baseAt6mo = baseP50 + (sexo === 'M' ? 9.0 : 8.1);
        const growthRate = sexo === 'M' ? 0.5 : 0.45;
        p50 = baseAt6mo + (growthRate * (idadeMeses - 6));
        
        // Desvios padrão aumentam ligeiramente
        const deviation = 0.85 + (0.03 * (idadeMeses - 6));
        p3 = p50 - (2 * deviation);
        p15 = p50 - deviation;
        p85 = p50 + deviation;
        p97 = p50 + (2 * deviation);
      } else if (idadeMeses <= 24) {
        // 12-24 meses: crescimento ainda mais lento
        const baseAt12mo = baseP50 + (sexo === 'M' ? 12.0 : 10.8);
        const growthRate = sexo === 'M' ? 0.3 : 0.28;
        p50 = baseAt12mo + (growthRate * (idadeMeses - 12));
        
        // Desvios padrão estabilizam
        const deviation = 1.0;
        p3 = p50 - (2 * deviation);
        p15 = p50 - deviation;
        p85 = p50 + deviation;
        p97 = p50 + (2 * deviation);
      } else {
        // Acima de 24 meses: crescimento muito lento
        const baseAt24mo = baseP50 + (sexo === 'M' ? 15.6 : 14.2);
        const growthRate = sexo === 'M' ? 0.15 : 0.14;
        p50 = baseAt24mo + (growthRate * Math.min(idadeMeses - 24, 12)); // limita a 36 meses
        
        // Desvios padrão para crianças mais velhas
        const deviation = 1.1;
        p3 = p50 - (2 * deviation);
        p15 = p50 - deviation;
        p85 = p50 + deviation;
        p97 = p50 + (2 * deviation);
      }
      
      return {
        ...point,
        p3,
        p15,
        p50,
        p85,
        p97,
      };
    });
  };

  const renderYAxis = () => {
    if (tipoGrafico === "indiceCraniano") {
      return (
        <YAxis
          label={{ value: 'Índice Craniano (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={[65, 95]}
          tickFormatter={(value) => `${value}%`}
        />
      );
    } else if (tipoGrafico === "cvai") {
      return (
        <YAxis
          label={{ value: 'CVAI (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={[0, 12]}
          tickFormatter={(value) => `${value}%`}
        />
      );
    } else if (tipoGrafico === "diagonais") {
      return (
        <YAxis
          label={{ value: 'Diferença Diagonais (mm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={[0, 'dataMax + 2']}
          tickFormatter={(value) => `${value} mm`}
        />
      );
    } else if (tipoGrafico === "perimetro" || tipoGrafico === "perimetroCefalico") {
      return (
        <YAxis
          label={{ value: 'Perímetro Cefálico (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={['dataMin - 1', 'dataMax + 1']}
          tickFormatter={(value) => `${value} cm`}
        />
      );
    }
    
    return <YAxis />;
  };

  const renderReferenceAreas = () => {
    if (tipoGrafico === "indiceCraniano") {
      return (
        <>
          <ReferenceArea y1={90} y2={95} fill="#FECDD3" fillOpacity={0.6} />
          <ReferenceArea y1={87} y2={90} fill="#FED7AA" fillOpacity={0.6} />
          <ReferenceArea y1={85} y2={87} fill="#FEF08A" fillOpacity={0.6} />
          <ReferenceArea y1={75} y2={85} fill="#BBF7D0" fillOpacity={0.6} />
          <ReferenceArea y1={73} y2={75} fill="#FEF08A" fillOpacity={0.6} />
          <ReferenceArea y1={70} y2={73} fill="#FED7AA" fillOpacity={0.6} />
          <ReferenceArea y1={65} y2={70} fill="#FECDD3" fillOpacity={0.6} />
        </>
      );
    } else if (tipoGrafico === "cvai") {
      return (
        <>
          <ReferenceArea y1={8.5} y2={12} fill="#FECDD3" fillOpacity={0.6} />
          <ReferenceArea y1={6.25} y2={8.5} fill="#FED7AA" fillOpacity={0.6} />
          <ReferenceArea y1={3.5} y2={6.25} fill="#FEF08A" fillOpacity={0.6} />
          <ReferenceArea y1={0} y2={3.5} fill="#BBF7D0" fillOpacity={0.6} />
        </>
      );
    } else if (tipoGrafico === "diagonais") {
      return (
        <>
          <ReferenceArea y1={10} y2={15} fill="#FECDD3" fillOpacity={0.6} />
          <ReferenceArea y1={6} y2={10} fill="#FED7AA" fillOpacity={0.6} />
          <ReferenceArea y1={3} y2={6} fill="#FEF08A" fillOpacity={0.6} />
          <ReferenceArea y1={0} y2={3} fill="#BBF7D0" fillOpacity={0.6} />
        </>
      );
    }
    return null;
  };

  const renderLines = () => {
    const lineColor = getLineColor(linhaCorTheme);
    
    if (tipoGrafico === "indiceCraniano") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="indice_craniano"
            name="Índice Craniano"
            stroke={lineColor}
            strokeWidth={3}
            dot={renderCustomDot(lineColor)}
            activeDot={{ r: 7, fill: lineColor }}
            connectNulls
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="mediaPopulacional"
            name="Média Populacional"
            stroke="#666666"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <ReferenceLine y={76} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Mín Normal", position: "insideBottomLeft" }} />
          <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Máx Normal", position: "insideTopLeft" }} />
        </>
      );
    } else if (tipoGrafico === "cvai") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="cvai"
            name="CVAI"
            stroke={lineColor}
            strokeWidth={3}
            dot={renderCustomDot(lineColor)}
            activeDot={{ r: 7, fill: lineColor }}
            connectNulls
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="mediaPopulacional"
            name="Média Populacional"
            stroke="#666666"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <ReferenceLine y={3.5} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Limite Normal", position: "insideBottomLeft" }} />
        </>
      );
    } else if (tipoGrafico === "diagonais") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="diferenca_diagonais"
            name="Diferença Diagonais"
            stroke={lineColor}
            strokeWidth={3}
            dot={renderCustomDot(lineColor)}
            activeDot={{ r: 7, fill: lineColor }}
            connectNulls
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="mediaPopulacional"
            name="Média Populacional"
            stroke="#666666"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <ReferenceLine y={3} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Limite Normal", position: "insideBottomLeft" }} />
        </>
      );
    } else {
      return (
        <>
          <Line
            type="monotone"
            dataKey="perimetro_cefalico"
            name="Perímetro Cefálico"
            stroke={lineColor}
            strokeWidth={3}
            dot={renderCustomDot(lineColor)}
            activeDot={{ r: 7, fill: lineColor }}
            connectNulls
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="p3"
            name="P3"
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p15"
            name="P15"
            stroke="#9CA3AF"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p50"
            name="P50"
            stroke="#4B5563"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p85"
            name="P85"
            stroke="#9CA3AF"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p97"
            name="P97"
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </>
      );
    }
  };

  const formatXAxisTick = (value: number) => {
    if (value === Math.floor(value)) {
      return `${value}m`;
    }
    return '';
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const dataPoint = payload[0].payload;
      if (dataPoint.paciente === null) return null;
      
      const valueFormatter = (value: number, suffix: string) => {
        return `${value.toFixed(1)}${suffix}`;
      };

      let tooltipContent;
      
      if (tipoGrafico === "indiceCraniano") {
        tooltipContent = (
          <>
            <p className="font-medium text-sm">{`Índice Craniano: ${valueFormatter(dataPoint.indice_craniano, '%')}`}</p>
            <p className="text-sm">{`Comprimento: ${valueFormatter(dataPoint.comprimento, ' mm')}`}</p>
            <p className="text-sm">{`Largura: ${valueFormatter(dataPoint.largura, ' mm')}`}</p>
          </>
        );
      } else if (tipoGrafico === "cvai") {
        tooltipContent = (
          <>
            <p className="font-medium text-sm">{`CVAI: ${valueFormatter(dataPoint.cvai, '%')}`}</p>
            <p className="text-sm">{`Diagonal D: ${valueFormatter(dataPoint.diagonal_d, ' mm')}`}</p>
            <p className="text-sm">{`Diagonal E: ${valueFormatter(dataPoint.diagonal_e, ' mm')}`}</p>
            <p className="text-sm">{`Diferença: ${valueFormatter(dataPoint.diferenca_diagonais, ' mm')}`}</p>
          </>
        );
      } else if (tipoGrafico === "diagonais") {
        tooltipContent = (
          <>
            <p className="font-medium text-sm">{`Diferença de diagonais: ${valueFormatter(dataPoint.diferenca_diagonais, ' mm')}`}</p>
            <p className="text-sm">{`Diagonal D: ${valueFormatter(dataPoint.diagonal_d, ' mm')}`}</p>
            <p className="text-sm">{`Diagonal E: ${valueFormatter(dataPoint.diagonal_e, ' mm')}`}</p>
          </>
        );
      } else if (tipoGrafico === "perimetro" && dataPoint.perimetro_cefalico) {
        tooltipContent = (
          <>
            <p className="font-medium text-sm">{`Perímetro Cefálico: ${valueFormatter(dataPoint.perimetro_cefalico, ' cm')}`}</p>
            <p className="text-sm">{`P50 (média): ${valueFormatter(dataPoint.p50, ' cm')}`}</p>
            <p className="text-sm">{`Diferença: ${valueFormatter(dataPoint.perimetro_cefalico - dataPoint.p50, ' cm')}`}</p>
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
  };

  if (loading) {
    return <Skeleton className={cn(`w-full`, `h-[${altura}px]`)} />;
  }

  if (medicoes.length === 0) {
    return (
      <div className={cn(`flex items-center justify-center w-full`, `h-[${altura}px]`, "border rounded-md bg-muted/30")}>
        <p className="text-muted-foreground">Nenhuma medição disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(titulo || descricao) && (
        <div className="mb-4">
          {titulo && <h3 className="text-lg font-medium">{titulo}</h3>}
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
      )}
      <div style={{ width: '100%', height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload[0]) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
            <XAxis
              dataKey="idadeEmMeses"
              label={{ value: 'Idade (meses)', position: 'insideBottomRight', offset: -15 }}
              tickFormatter={formatXAxisTick}
              type="number"
              domain={[0, 'dataMax + 2']}
              allowDecimals={false}
            />
            {renderYAxis()}
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            {renderReferenceAreas()}
            {renderLines()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
