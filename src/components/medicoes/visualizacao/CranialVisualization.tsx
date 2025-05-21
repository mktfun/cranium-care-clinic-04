
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, BarChart2 } from "lucide-react";
import { AsymmetryType, SeverityLevel } from "@/types";
import CranialSilhouette from './CranialSilhouette';
import { MedicaoLineChart } from "@/components/MedicaoLineChart";

interface CranialVisualizationProps {
  currentMeasurement: {
    comprimento: number;
    largura: number;
    diagonalD: number;
    diagonalE: number;
    perimetroCefalico?: number;
    data: string;
  };
  measurementHistory: Array<{
    data: string;
    comprimento: number;
    largura: number;
    diagonalD: number;
    diagonalE: number;
    perimetroCefalico?: number;
    indice_craniano: number;
    cvai: number;
  }>;
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  sexoPaciente?: 'M' | 'F';
}

export default function CranialVisualization({
  currentMeasurement,
  measurementHistory,
  asymmetryType,
  severity,
  sexoPaciente
}: CranialVisualizationProps) {
  const [viewType, setViewType] = useState<"superior" | "frontal" | "lateral">("superior");
  const [metricType, setMetricType] = useState<'indiceCraniano' | 'cvai' | 'perimetroCefalico'>('indiceCraniano');
  
  // Calcular índice craniano e CVAI para a medição atual
  const indiceCraniano = (currentMeasurement.largura / currentMeasurement.comprimento) * 100;
  const diagonalMax = Math.max(currentMeasurement.diagonalD, currentMeasurement.diagonalE);
  const diagonalMin = Math.min(currentMeasurement.diagonalD, currentMeasurement.diagonalE);
  const cvai = ((diagonalMax - diagonalMin) / diagonalMax) * 100;
  
  // Adicionar medição atual ao histórico para visualização
  const currentMeasurementWithIndices = {
    ...currentMeasurement,
    indice_craniano: indiceCraniano,
    cvai: cvai
  };
  
  // Combinar medição atual com histórico para o gráfico
  const allMeasurements = [
    currentMeasurementWithIndices,
    ...measurementHistory.filter(m => m.data !== currentMeasurement.data)
  ];
  
  const medicoesFiltradas = allMeasurements.map(m => ({
    id: Math.random().toString(),
    paciente_id: '',
    data: m.data,
    comprimento: m.comprimento,
    largura: m.largura,
    diagonal_d: m.diagonalD || 0,
    diagonal_e: m.diagonalE || 0,
    indice_craniano: m.indice_craniano,
    diferenca_diagonais: Math.abs((m.diagonalD || 0) - (m.diagonalE || 0)),
    cvai: m.cvai,
    perimetro_cefalico: m.perimetroCefalico || undefined,
    status: severity
  }));
  
  return (
    <div className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground flex items-center justify-between">
          <span>Visualização Craniana</span>
          <div className="flex space-x-2">
            <Button 
              variant={viewType === "superior" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewType("superior")}
              className="h-8 px-2"
            >
              Superior
            </Button>
            <Button 
              variant={viewType === "frontal" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewType("frontal")}
              className="h-8 px-2"
            >
              Frontal
            </Button>
            <Button 
              variant={viewType === "lateral" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewType("lateral")}
              className="h-8 px-2"
            >
              Lateral
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="silhouette" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="silhouette" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Silhueta
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Evolução
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="silhouette" className="mt-4">
            <CranialSilhouette 
              measurements={currentMeasurement}
              asymmetryType={asymmetryType}
              severity={severity}
              viewType={viewType}
            />
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">Índice Craniano</p>
                <p className={`text-xl font-bold ${
                  indiceCraniano >= 85 || indiceCraniano <= 75 ? "text-red-500" :
                  indiceCraniano >= 81 || indiceCraniano <= 76 ? "text-amber-500" : 
                  "text-green-600"
                }`}>
                  {indiceCraniano.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm text-muted-foreground">CVAI</p>
                <p className={`text-xl font-bold ${
                  cvai >= 8.75 ? "text-red-500" : 
                  cvai >= 6.25 ? "text-amber-500" : 
                  cvai >= 3.5 ? "text-yellow-500" : "text-green-600"
                }`}>
                  {cvai.toFixed(2)}%
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="evolution" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm font-medium">Evolução das Medidas</div>
              <div className="flex space-x-2">
                <Button 
                  variant={metricType === "indiceCraniano" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setMetricType("indiceCraniano")}
                  className="h-7 px-2 text-xs"
                >
                  Índice Craniano
                </Button>
                <Button 
                  variant={metricType === "cvai" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setMetricType("cvai")}
                  className="h-7 px-2 text-xs"
                >
                  CVAI
                </Button>
                <Button 
                  variant={metricType === "perimetroCefalico" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setMetricType("perimetroCefalico")}
                  className="h-7 px-2 text-xs"
                >
                  Perímetro
                </Button>
              </div>
            </div>
            
            <div className="chart-container" style={{ height: '400px', position: 'relative', marginBottom: '20px' }}>
              {metricType === "indiceCraniano" && (
                <MedicaoLineChart
                  titulo="Evolução do Índice Craniano"
                  descricao="O Índice Craniano mede a proporção entre largura e comprimento do crânio. Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% indicam tendência à dolicocefalia. A área verde representa a faixa de normalidade."
                  altura={400}
                  medicoes={medicoesFiltradas}
                  dataNascimento={new Date().toISOString()}
                  tipoGrafico="indiceCraniano"
                  linhaCorTheme="rose"
                />
              )}
              
              {metricType === "cvai" && (
                <MedicaoLineChart
                  titulo="Evolução da Plagiocefalia"
                  descricao="O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana. Valores acima de 3.5% indicam assimetria leve, acima de 6.25% moderada, e acima de 8.5% severa. A área verde representa a faixa de normalidade."
                  altura={400}
                  medicoes={medicoesFiltradas}
                  dataNascimento={new Date().toISOString()}
                  tipoGrafico="cvai"
                  linhaCorTheme="amber"
                />
              )}
              
              {metricType === "perimetroCefalico" && (
                <MedicaoLineChart
                  titulo="Evolução do Perímetro Cefálico"
                  descricao="O perímetro cefálico é o contorno da cabeça medido na altura da testa e da parte mais protuberante do occipital. As linhas coloridas representam os percentis de referência para meninos da mesma idade, sendo P50 a média populacional."
                  altura={400}
                  medicoes={medicoesFiltradas}
                  dataNascimento={new Date().toISOString()}
                  tipoGrafico="perimetro"
                  sexoPaciente={sexoPaciente}
                  linhaCorTheme="blue"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
