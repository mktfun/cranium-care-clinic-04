
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
  tipoGrafico?: "indiceCraniano" | "cvai" | "perimetro";
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

export function MedicaoLineChart({
  titulo,
  descricao,
  medicoes = [],
  dataNascimento,
  sexoPaciente = "M",
  altura = 300,
  tipoGrafico = "indiceCraniano",
  linhaCorTheme = "blue"
}: MedicaoLineChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (medicoes.length === 0) {
      setLoading(false);
      return;
    }

    const processedData = [...medicoes]
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((medicao) => {
        const { months } = calculateAge(dataNascimento, medicao.data);
        
        return {
          ...medicao,
          idadeEmMeses: months,
          comprimento: Number(medicao.comprimento),
          largura: Number(medicao.largura),
          diagonal_d: Number(medicao.diagonal_d),
          diagonal_e: Number(medicao.diagonal_e),
          indice_craniano: Number(medicao.indice_craniano),
          cvai: Number(medicao.cvai),
          perimetro_cefalico: medicao.perimetro_cefalico ? Number(medicao.perimetro_cefalico) : undefined,
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
    const maxAge = Math.max(...data.map(d => d.idadeEmMeses), 18);
    
    // Criar array com pontos de referência para cada mês
    const referencePoints = Array.from({ length: maxAge + 1 }, (_, i) => ({
      idadeEmMeses: i,
      paciente: null // Marcar que não são pontos do paciente
    }));
    
    // Adicionar dados específicos conforme o tipo de gráfico
    if (tipo === "indiceCraniano") {
      return addIndiceReferenceData([...data, ...referencePoints]);
    } else if (tipo === "cvai") {
      return addCvaiReferenceData([...data, ...referencePoints]);
    } else if (tipo === "perimetro") {
      return addPerimetroReferenceData([...data, ...referencePoints], sexo);
    }
    
    return data;
  };

  // Adicionar dados de referência para Índice Craniano
  const addIndiceReferenceData = (data: any[]) => {
    return data.map(point => ({
      ...point,
      // Limites para classificação de braquicefalia/dolicocefalia
      normalLowerBound: 76,
      normalUpperBound: 80,
      braquiLeve: 84,
      braquiModerada: 90,
      dolicoLeve: 73,
      dolicoModerada: 70,
      mediaPopulacional: 78
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

  // Adicionar dados de referência para Perímetro Cefálico
  const addPerimetroReferenceData = (data: any[], sexo: string) => {
    return data.map(point => {
      const idadeMeses = point.idadeEmMeses;
      
      // Valores aproximados baseados em curvas de crescimento
      const baseP50 = sexo === 'M' ? 35 : 34;
      const growthRate = sexo === 'M' ? 1.5 : 1.4;
      let p50 = 0;
      
      // Cálculo do perímetro dependendo da faixa etária
      if (idadeMeses === 0) {
        p50 = baseP50;
      } else if (idadeMeses <= 3) {
        p50 = baseP50 + (growthRate * idadeMeses);
      } else if (idadeMeses <= 6) {
        p50 = baseP50 + (growthRate * 3) + (0.8 * (idadeMeses - 3));
      } else if (idadeMeses <= 12) {
        p50 = baseP50 + (growthRate * 3) + (0.8 * 3) + (0.5 * (idadeMeses - 6));
      } else {
        p50 = baseP50 + (growthRate * 3) + (0.8 * 3) + (0.5 * 6) + (0.3 * (idadeMeses - 12));
      }
      
      return {
        ...point,
        p3: p50 * 0.94,
        p15: p50 * 0.97,
        p50,
        p85: p50 * 1.03,
        p97: p50 * 1.06,
      };
    });
  };

  const renderYAxis = () => {
    if (tipoGrafico === "indiceCraniano") {
      return (
        <YAxis
          label={{ value: 'Índice Craniano (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={[65, 95]}
        />
      );
    } else if (tipoGrafico === "cvai") {
      return (
        <YAxis
          label={{ value: 'CVAI (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={[0, 12]}
        />
      );
    } else {
      return (
        <YAxis
          label={{ value: 'Perímetro Cefálico (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={['auto', 'auto']}
        />
      );
    }
  };

  const renderReferenceAreas = () => {
    if (tipoGrafico === "indiceCraniano") {
      return (
        <>
          <ReferenceArea y1={90} y2={95} fill="#FECDD3" fillOpacity={0.6} />
          <ReferenceArea y1={84} y2={90} fill="#FED7AA" fillOpacity={0.6} />
          <ReferenceArea y1={80} y2={84} fill="#FEF08A" fillOpacity={0.6} />
          <ReferenceArea y1={76} y2={80} fill="#BBF7D0" fillOpacity={0.6} />
          <ReferenceArea y1={73} y2={76} fill="#FEF08A" fillOpacity={0.6} />
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
    }
    return null;
  };

  const renderLines = () => {
    if (tipoGrafico === "indiceCraniano") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="indice_craniano"
            name="Índice Craniano"
            stroke={getLineColor(linhaCorTheme)}
            strokeWidth={3}
            dot={{ fill: getLineColor(linhaCorTheme), r: 5 }}
            activeDot={{ r: 7 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mediaPopulacional"
            name="Média Populacional"
            stroke="#666666"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        </>
      );
    } else if (tipoGrafico === "cvai") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="cvai"
            name="CVAI"
            stroke={getLineColor(linhaCorTheme)}
            strokeWidth={3}
            dot={{ fill: getLineColor(linhaCorTheme), r: 5 }}
            activeDot={{ r: 7 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="mediaPopulacional"
            name="Média Populacional"
            stroke="#666666"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        </>
      );
    } else {
      return (
        <>
          <Line
            type="monotone"
            dataKey="perimetro_cefalico"
            name="Perímetro Cefálico"
            stroke={getLineColor(linhaCorTheme)}
            strokeWidth={3}
            dot={{ fill: getLineColor(linhaCorTheme), r: 5 }}
            activeDot={{ r: 7 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p3"
            name="P3"
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p15"
            name="P15"
            stroke="#9CA3AF"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p50"
            name="P50"
            stroke="#4B5563"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p85"
            name="P85"
            stroke="#9CA3AF"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p97"
            name="P97"
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            dot={false}
            connectNulls
          />
        </>
      );
    }
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const dataPoint = payload[0].payload;
      if (dataPoint.paciente === null) return null;
      
      return (
        <div className="bg-white/90 dark:bg-slate-800/90 p-3 border rounded shadow-lg">
          <p className="font-medium">{`Idade: ${label} meses`}</p>
          <div className="space-y-1 mt-1">
            {tipoGrafico === "indiceCraniano" && (
              <>
                <p>{`Índice Craniano: ${dataPoint.indice_craniano}%`}</p>
                <p>{`Comprimento: ${dataPoint.comprimento} mm`}</p>
                <p>{`Largura: ${dataPoint.largura} mm`}</p>
              </>
            )}
            
            {tipoGrafico === "cvai" && (
              <>
                <p>{`CVAI: ${dataPoint.cvai}%`}</p>
                <p>{`Diagonal D: ${dataPoint.diagonal_d} mm`}</p>
                <p>{`Diagonal E: ${dataPoint.diagonal_e} mm`}</p>
                <p>{`Diferença: ${dataPoint.diferenca_diagonais} mm`}</p>
              </>
            )}
            
            {tipoGrafico === "perimetro" && dataPoint.perimetro_cefalico && (
              <p>{`Perímetro Cefálico: ${dataPoint.perimetro_cefalico} mm`}</p>
            )}
            
            <p className="text-xs text-muted-foreground pt-1">
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
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
            <XAxis
              dataKey="idadeEmMeses"
              label={{ value: 'Idade (meses)', position: 'insideBottomRight', offset: -15 }}
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
