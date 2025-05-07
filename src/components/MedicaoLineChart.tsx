
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Label
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data - in real implementation this would come from API/database
const evolucionData = [
  {
    mes: "Jan",
    cvai: 2.1,
    diagonal: 5,
    ic: 74,
    perimetro: 38,
    p3: 36.2,
    p50: 39,
    p97: 41.8,
  },
  {
    mes: "Fev",
    cvai: 3.5,
    diagonal: 7.5,
    ic: 76,
    perimetro: 39.5,
    p3: 37.6,
    p50: 40.5,
    p97: 43.4,
  },
  {
    mes: "Mar",
    cvai: 5.2,
    diagonal: 9.8,
    ic: 78,
    perimetro: 41,
    p3: 38.7,
    p50: 41.8,
    p97: 44.9,
  },
  {
    mes: "Abr",
    cvai: 4.3,
    diagonal: 8.2,
    ic: 79,
    perimetro: 42.3,
    p3: 39.6,
    p50: 42.8,
    p97: 46,
  },
  {
    mes: "Mai",
    cvai: 3.2,
    diagonal: 6.8,
    ic: 81,
    perimetro: 43.5,
    p3: 40.3,
    p50: 43.5,
    p97: 46.7,
  },
  {
    mes: "Jun",
    cvai: 2.8,
    diagonal: 6.1,
    ic: 83,
    perimetro: 44.2,
    p3: 40.8,
    p50: 44,
    p97: 47.2,
  },
];

// Data for cranial proportion
const cranialData = [
  { mes: "Jan", anteroposterior: 130, lateral: 110, ratio: 1.18 },
  { mes: "Fev", anteroposterior: 135, lateral: 115, ratio: 1.17 },
  { mes: "Mar", anteroposterior: 140, lateral: 122, ratio: 1.15 },
  { mes: "Abr", anteroposterior: 145, lateral: 130, ratio: 1.12 },
  { mes: "Mai", anteroposterior: 150, lateral: 138, ratio: 1.09 },
  { mes: "Jun", anteroposterior: 154, lateral: 143, ratio: 1.08 },
];

// Projected growth data
const projectionData = [
  ...evolucionData,
  {
    mes: "Jul (Proj)",
    cvai: 2.5,
    diagonal: 5.8,
    ic: 84,
    perimetro: 44.8,
    p3: 41.2,
    p50: 44.4,
    p97: 47.6,
    projected: true
  },
  {
    mes: "Ago (Proj)",
    cvai: 2.3,
    diagonal: 5.5,
    ic: 85,
    perimetro: 45.3,
    p3: 41.5,
    p50: 44.7,
    p97: 47.9,
    projected: true
  }
];

interface MedicaoLineChartProps {
  titulo?: string;
  descricao?: string;
  altura?: number;
  patientData?: any;
}

export function MedicaoLineChart({
  titulo = "Evolução das Medições",
  descricao = "Acompanhamento de índices ao longo dos últimos 6 meses",
  altura = 300,
  patientData,
}: MedicaoLineChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("indices");

  // Use patient data if provided, otherwise use sample data
  const data = patientData?.evolution || evolucionData;
  const proportionData = patientData?.cranialProportion || cranialData;
  const futureData = patientData?.projections || projectionData;

  // Check if device is mobile and adjust chart settings
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {titulo}
        </CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 overflow-x-auto flex-wrap md:flex-nowrap justify-start md:justify-center grid-cols-2 md:grid-cols-4" style={{scrollbarWidth: 'none'}}>
            <TabsTrigger value="indices" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Índices Cranianos
            </TabsTrigger>
            <TabsTrigger value="perimetro" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Perímetro Cefálico
            </TabsTrigger>
            <TabsTrigger value="proporcao" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Proporção Craniana
            </TabsTrigger>
            <TabsTrigger value="projecao" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Projeção de Crescimento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="indices" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={data} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis yAxisId="left" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: isMobile ? 10 : 12}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: isMobile ? 10 : 12
                  }}
                />
                <Legend wrapperStyle={{fontSize: isMobile ? 10 : 12}} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cvai"
                  stroke="#029daf"
                  activeDot={{ r: isMobile ? 6 : 8 }}
                  name="CVAI (%)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="diagonal"
                  stroke="#AF5B5B"
                  name="Dif. Diagonal (mm)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ic"
                  stroke="#276FBF"
                  name="Índice Craniano"
                  strokeWidth={2}
                />
                <ReferenceLine y={3.5} yAxisId="left" stroke="red" strokeDasharray="3 3">
                  <Label value="Limite CVAI" position="insideTopRight" fill="red" fontSize={isMobile ? 10 : 12} />
                </ReferenceLine>
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="perimetro" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={data} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: isMobile ? 10 : 12}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: isMobile ? 10 : 12
                  }}
                />
                <Legend wrapperStyle={{fontSize: isMobile ? 10 : 12}} />
                <ReferenceArea y1="p3" y2="p97" fill="#f5f5f5" fillOpacity={0.3} />
                <Line type="monotone" dataKey="p3" stroke="#cccccc" strokeDasharray="3 3" name="Percentil 3" dot={false} />
                <Line type="monotone" dataKey="p50" stroke="#999999" strokeDasharray="3 3" name="Percentil 50" dot={false} />
                <Line type="monotone" dataKey="p97" stroke="#666666" strokeDasharray="3 3" name="Percentil 97" dot={false} />
                <Line
                  type="monotone"
                  dataKey="perimetro"
                  stroke="#EF6C00"
                  name="Perímetro Cefálico (cm)"
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 6 : 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="proporcao" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={proportionData} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis yAxisId="left" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis yAxisId="right" orientation="right" domain={[0.9, 1.3]} tick={{fontSize: isMobile ? 10 : 12}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: isMobile ? 10 : 12
                  }}
                />
                <Legend wrapperStyle={{fontSize: isMobile ? 10 : 12}} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="anteroposterior"
                  stroke="#9C27B0"
                  activeDot={{ r: isMobile ? 6 : 8 }}
                  name="Diâmetro AP (mm)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="lateral"
                  stroke="#2196F3"
                  name="Diâmetro Lateral (mm)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ratio"
                  stroke="#FF5722"
                  name="Proporção AP/Lateral"
                  strokeWidth={2}
                />
                <ReferenceLine y={1.2} yAxisId="right" stroke="red" strokeDasharray="3 3">
                  <Label value="Limite de normalidade" position="insideTopRight" fill="red" fontSize={isMobile ? 10 : 12} />
                </ReferenceLine>
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="projecao" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={futureData} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{fontSize: isMobile ? 10 : 12}} />
                <YAxis tick={{fontSize: isMobile ? 10 : 12}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: isMobile ? 10 : 12
                  }}
                />
                <Legend wrapperStyle={{fontSize: isMobile ? 10 : 12}} />
                <Line
                  type="monotone"
                  dataKey="perimetro"
                  stroke="#EF6C00"
                  name="Perímetro Real (cm)"
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 6 : 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="cvai"
                  stroke="#029daf"
                  name="CVAI Tendência (%)"
                  strokeWidth={2}
                  strokeDasharray={(d) => d.projected ? "5 5" : "0"}
                  // Fix for strokeDasharray TypeScript error
                  // @ts-ignore
                />
                <Line
                  type="monotone"
                  dataKey="ic"
                  stroke="#276FBF"
                  name="Índice Craniano Tendência"
                  strokeWidth={2}
                  strokeDasharray={(d) => d.projected ? "5 5" : "0"}
                  // Fix for strokeDasharray TypeScript error
                  // @ts-ignore
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
