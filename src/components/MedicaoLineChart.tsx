
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
import { getHeadCircumferenceReferenceData, generateProtocolReferenceData } from "@/lib/cranial-analysis";
import { formatAge } from "@/lib/age-utils";

// Gerar dados de protocolo
const { brachyDolichoProtocolData, plagioProtocolData } = generateProtocolReferenceData();

// Dados para exibição de evolução
interface EvolutionData {
  mes: string;
  data: string;
  idade: number;
  idadeFormatada: string;
  cvai: number;
  diagonal: number;
  ic: number;
  perimetro: number;
  p3: number;
  p50: number;
  p97: number;
  projected?: boolean;
}

interface MedicaoLineChartProps {
  titulo?: string;
  descricao?: string;
  altura?: number;
  patientData?: any;
  sexoPaciente?: 'M' | 'F';
  medicoes?: any[];
  dataNascimento?: string;
}

export function MedicaoLineChart({
  titulo = "Evolução das Medições",
  descricao = "Acompanhamento de índices ao longo do tempo",
  altura = 300,
  patientData,
  sexoPaciente = 'M',
  medicoes = [],
  dataNascimento,
}: MedicaoLineChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("indices");
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [headCircumferenceData, setHeadCircumferenceData] = useState<any[]>([]);

  // Use patient data if provided, otherwise process medicoes
  useEffect(() => {
    if (patientData?.evolution) {
      setEvolutionData(patientData.evolution);
    } else if (medicoes.length > 0 && dataNascimento) {
      // Processar dados das medições
      const processedData = medicoes
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map((medicao: any) => {
          const dataObj = new Date(medicao.data);
          const nascimentoObj = new Date(dataNascimento);
          
          // Calcular idade na data da medição
          const diffTime = Math.abs(dataObj.getTime() - nascimentoObj.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const idadeMeses = Math.floor(diffDays / 30);
          const idadeDias = diffDays % 30;
          
          const idadeFormatada = formatAge(dataNascimento, medicao.data);
          const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short' });
          
          return {
            mes: `${mes}/${dataObj.getFullYear().toString().slice(-2)}`,
            data: medicao.data,
            idade: idadeMeses + (idadeDias / 30), // Idade em meses com fração decimal para precisão
            idadeFormatada,
            cvai: medicao.cvai || 0,
            diagonal: medicao.diferencaDiagonais || 0,
            ic: medicao.indiceCraniano || 0,
            perimetro: medicao.perimetroCefalico || 0,
            // Valores de referência (serão substituídos pelos reais em produção)
            p3: 0,
            p50: 0,
            p97: 0
          };
        });
      
      setEvolutionData(processedData);
    }
  }, [patientData, medicoes, dataNascimento]);
  
  // Carregar dados de referência do perímetro cefálico baseados no sexo
  useEffect(() => {
    const referenceData = getHeadCircumferenceReferenceData(sexoPaciente);
    setHeadCircumferenceData(referenceData);
  }, [sexoPaciente]);

  // Check if device is mobile and adjust chart settings
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Função para mesclar dados de evolução com dados de referência
  const getMergedDataForHeadCircumference = () => {
    if (!evolutionData.length) return [];
    
    return evolutionData.map(dataPoint => {
      // Encontrar o valor de referência mais próximo para a idade
      const closestReference = headCircumferenceData.reduce((prev, curr) => {
        return Math.abs(curr.age - dataPoint.idade) < Math.abs(prev.age - dataPoint.idade) ? curr : prev;
      }, headCircumferenceData[0]);
      
      return {
        ...dataPoint,
        p3: closestReference.p3,
        p15: closestReference.p15,
        p50: closestReference.p50,
        p85: closestReference.p85,
        p97: closestReference.p97
      };
    });
  };

  // Função para preparar dados para o gráfico de Índice Craniano (Protocolo)
  const prepareCranialIndexData = () => {
    if (!evolutionData.length) return [];
    
    // Mesclar dados do paciente com dados do protocolo
    return evolutionData.map(dataPoint => {
      // Encontrar o dado do protocolo mais próximo para a idade
      const closestProtocol = brachyDolichoProtocolData.reduce((prev, curr) => {
        return Math.abs(curr.age - dataPoint.idade) < Math.abs(prev.age - dataPoint.idade) ? curr : prev;
      }, brachyDolichoProtocolData[0]);
      
      return {
        ...dataPoint,
        ...closestProtocol
      };
    });
  };
  
  // Função para preparar dados para o gráfico de Plagiocefalia (Protocolo)
  const preparePlagiocephalyData = () => {
    if (!evolutionData.length) return [];
    
    // Mesclar dados do paciente com dados do protocolo
    return evolutionData.map(dataPoint => {
      // Encontrar o dado do protocolo mais próximo para a idade
      const closestProtocol = plagioProtocolData.reduce((prev, curr) => {
        return Math.abs(curr.age - dataPoint.idade) < Math.abs(prev.age - dataPoint.idade) ? curr : prev;
      }, plagioProtocolData[0]);
      
      return {
        ...dataPoint,
        ...closestProtocol
      };
    });
  };

  // Dados para perímetro cefálico
  const headCircumferenceChartData = getMergedDataForHeadCircumference();
  
  // Dados para protocolo de índice craniano
  const cranialIndexProtocolData = prepareCranialIndexData();
  
  // Dados para protocolo de plagiocefalia
  const plagiocephalyProtocolData = preparePlagiocephalyData();

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
            <TabsTrigger value="indice-craniano" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Índice Craniano
            </TabsTrigger>
            <TabsTrigger value="plagiocefalia" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Plagiocefalia
            </TabsTrigger>
            <TabsTrigger value="perimetro" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Perímetro Cefálico
            </TabsTrigger>
            <TabsTrigger value="indices" className="text-xs md:text-sm py-1 px-2 md:px-4 flex-grow">
              Índices Gerais
            </TabsTrigger>
          </TabsList>
          
          {/* Gráfico de Índice Craniano conforme Protocolo */}
          <TabsContent value="indice-craniano" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={cranialIndexProtocolData}
                margin={{ top: 5, right: isMobile ? 5 : 30, left: isMobile ? 5 : 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="idade"
                  type="number"
                  domain={[0, 'auto']}
                  tickCount={isMobile ? 5 : 10}
                  tickFormatter={(value) => `${Math.floor(value)}m`}
                  label={{ value: "Idade (meses)", position: "insideBottom", offset: -5 }}
                />
                <YAxis 
                  domain={[60, 110]}
                  tickCount={10}
                  label={{ value: "Índice Craniano (%)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "ic") return [`${value}%`, "Índice Craniano"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const dataPoint = cranialIndexProtocolData.find(d => d.idade === label);
                    return dataPoint ? `Idade: ${dataPoint.idadeFormatada}` : `${Math.floor(label)} meses`;
                  }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                
                {/* Zonas de Classificação */}
                <ReferenceArea y1={90} y2={110} fill="#FF9999" fillOpacity={0.3} label={{ value: "Braquicefalia Severa", position: "insideRight" }} />
                <ReferenceArea y1={85} y2={90} fill="#FFCC99" fillOpacity={0.3} label={{ value: "Braquicefalia Moderada", position: "insideRight" }} />
                <ReferenceArea y1={81} y2={85} fill="#FFFF99" fillOpacity={0.3} label={{ value: "Braquicefalia Leve", position: "insideRight" }} />
                <ReferenceArea y1={76} y2={81} fill="#CCFFCC" fillOpacity={0.3} label={{ value: "Normal", position: "insideRight" }} />
                <ReferenceArea y1={73} y2={76} fill="#FFFF99" fillOpacity={0.3} label={{ value: "Dolicocefalia Leve", position: "insideRight" }} />
                <ReferenceArea y1={70} y2={73} fill="#FFCC99" fillOpacity={0.3} label={{ value: "Dolicocefalia Moderada", position: "insideRight" }} />
                <ReferenceArea y1={60} y2={70} fill="#FF9999" fillOpacity={0.3} label={{ value: "Dolicocefalia Severa", position: "insideRight" }} />
                
                {/* Linha de Referência (Média da população) */}
                <ReferenceLine y={80} stroke="#666" strokeDasharray="3 3">
                  <Label value="Média da população" position="insideBottomRight" />
                </ReferenceLine>
                
                {/* Linha do Paciente */}
                <Line
                  type="monotone"
                  dataKey="ic"
                  stroke="#276FBF"
                  activeDot={{ r: 8 }}
                  name="Índice Craniano"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {/* Gráfico de Plagiocefalia conforme Protocolo */}
          <TabsContent value="plagiocefalia" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={plagiocephalyProtocolData}
                margin={{ top: 5, right: isMobile ? 5 : 30, left: isMobile ? 5 : 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="idade"
                  type="number"
                  domain={[0, 'auto']}
                  tickCount={isMobile ? 5 : 10}
                  tickFormatter={(value) => `${Math.floor(value)}m`}
                  label={{ value: "Idade (meses)", position: "insideBottom", offset: -5 }}
                />
                <YAxis 
                  domain={[0, 15]}
                  tickCount={8}
                  label={{ value: "CVAI (%)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "cvai") return [`${value}%`, "CVAI"];
                    if (name === "diagonal") return [`${value} mm`, "Diferença Diagonais"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const dataPoint = plagiocephalyProtocolData.find(d => d.idade === label);
                    return dataPoint ? `Idade: ${dataPoint.idadeFormatada}` : `${Math.floor(label)} meses`;
                  }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                
                {/* Zonas de Classificação */}
                <ReferenceArea y1={8.5} y2={15} fill="#FF9999" fillOpacity={0.3} label={{ value: "Plagiocefalia Severa", position: "insideRight" }} />
                <ReferenceArea y1={6.25} y2={8.5} fill="#FFCC99" fillOpacity={0.3} label={{ value: "Plagiocefalia Moderada", position: "insideRight" }} />
                <ReferenceArea y1={3.5} y2={6.25} fill="#FFFF99" fillOpacity={0.3} label={{ value: "Plagiocefalia Leve", position: "insideRight" }} />
                <ReferenceArea y1={0} y2={3.5} fill="#CCFFCC" fillOpacity={0.3} label={{ value: "Normal", position: "insideRight" }} />
                
                {/* Linha de Referência (Média da população) */}
                <ReferenceLine y={2} stroke="#666" strokeDasharray="3 3">
                  <Label value="Média da população" position="insideBottomRight" />
                </ReferenceLine>
                
                {/* Linhas do Paciente */}
                <Line
                  type="monotone"
                  dataKey="cvai"
                  stroke="#029daf"
                  activeDot={{ r: 8 }}
                  name="CVAI (%)"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="diagonal"
                  stroke="#AF5B5B"
                  name="Dif. Diagonal (mm)"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {/* Gráfico de Perímetro Cefálico com curvas por sexo */}
          <TabsContent value="perimetro" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={headCircumferenceChartData} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="idade"
                  type="number"
                  domain={[0, 'auto']}
                  tickCount={isMobile ? 5 : 10}
                  tickFormatter={(value) => `${Math.floor(value)}m`}
                  label={{ value: "Idade (meses)", position: "insideBottom", offset: -5 }}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tickCount={8}
                  label={{ value: "Perímetro (cm)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "perimetro") return [`${value} cm`, "Perímetro Cefálico"];
                    if (name === "p3") return [`${value} cm`, "Percentil 3"];
                    if (name === "p15") return [`${value} cm`, "Percentil 15"];
                    if (name === "p50") return [`${value} cm`, "Percentil 50"];
                    if (name === "p85") return [`${value} cm`, "Percentil 85"];
                    if (name === "p97") return [`${value} cm`, "Percentil 97"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const dataPoint = headCircumferenceChartData.find(d => d.idade === label);
                    return dataPoint ? `Idade: ${dataPoint.idadeFormatada}` : `${Math.floor(label)} meses`;
                  }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                
                {/* Área de Referência para Normalidade */}
                <ReferenceArea y1="p3" y2="p97" fill="#f5f5f5" fillOpacity={0.3} />
                
                {/* Linhas de Percentis por Sexo */}
                <Line type="monotone" dataKey="p3" stroke="#cccccc" strokeDasharray="3 3" name="Percentil 3" dot={false} />
                <Line type="monotone" dataKey="p15" stroke="#bbbbbb" strokeDasharray="3 3" name="Percentil 15" dot={false} />
                <Line type="monotone" dataKey="p50" stroke="#999999" strokeDasharray="3 3" name="Percentil 50" dot={false} />
                <Line type="monotone" dataKey="p85" stroke="#777777" strokeDasharray="3 3" name="Percentil 85" dot={false} />
                <Line type="monotone" dataKey="p97" stroke="#666666" strokeDasharray="3 3" name="Percentil 97" dot={false} />
                
                {/* Linha do Paciente */}
                <Line
                  type="monotone"
                  dataKey="perimetro"
                  stroke="#EF6C00"
                  name="Perímetro Cefálico (cm)"
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 6 : 8 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-center mt-2 text-muted-foreground">
              Curvas de referência para sexo: {sexoPaciente === 'M' ? 'Masculino' : 'Feminino'}
            </div>
          </TabsContent>
          
          {/* Gráfico de Índices Gerais (original) */}
          <TabsContent value="indices" className="mt-0">
            <ResponsiveContainer width="100%" height={altura}>
              <LineChart 
                data={evolutionData} 
                margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="idadeFormatada" 
                  tick={{fontSize: isMobile ? 10 : 12}} 
                />
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
