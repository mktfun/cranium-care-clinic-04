
import { useEffect, useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Import refactored components
import { 
  processChartData, 
  addReferenceData, 
  formatXAxisTick, 
  ChartDataPoint 
} from "./chart/ChartHelpers";
import { CustomTooltip } from "./chart/ChartTooltip";
import { 
  IndiceLines, 
  CvaiLines, 
  DiagonaisLines, 
  PerimetroLines,
  IndiceAreas,
  CvaiAreas,
  DiagonaisAreas
} from "./chart/ChartComponents";

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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState<any>(null);

  useEffect(() => {
    if (medicoes.length === 0) {
      setLoading(false);
      return;
    }

    // Process data points from measurements
    const processedData = processChartData(medicoes, dataNascimento);

    // Add reference data based on chart type
    const chartDataWithReference = addReferenceData(processedData, tipoGrafico, sexoPaciente);
    setChartData(chartDataWithReference);
    setLoading(false);
  }, [medicoes, dataNascimento, tipoGrafico, sexoPaciente]);

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
    } else {
      return (
        <YAxis
          label={{ value: 'Perímetro Cefálico (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          domain={['dataMin - 1', 'dataMax + 1']}
          tickFormatter={(value) => `${value} cm`}
        />
      );
    }
  };

  const renderReferenceAreas = () => {
    if (tipoGrafico === "indiceCraniano") {
      return <IndiceAreas />;
    } else if (tipoGrafico === "cvai") {
      return <CvaiAreas />;
    } else if (tipoGrafico === "diagonais") {
      return <DiagonaisAreas />;
    }
    return null;
  };

  const renderLines = () => {
    if (tipoGrafico === "indiceCraniano") {
      return <IndiceLines lineColor={linhaCorTheme} />;
    } else if (tipoGrafico === "cvai") {
      return <CvaiLines lineColor={linhaCorTheme} />;
    } else if (tipoGrafico === "diagonais") {
      return <DiagonaisLines lineColor={linhaCorTheme} />;
    } else {
      return <PerimetroLines lineColor={linhaCorTheme} />;
    }
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
            <Tooltip content={(props) => <CustomTooltip {...props} tipoGrafico={tipoGrafico} />} />
            <Legend />
            {renderReferenceAreas()}
            {renderLines()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
