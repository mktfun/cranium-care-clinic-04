import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, BarChart2 } from "lucide-react";
import { AsymmetryType, SeverityLevel } from "@/types";
import CranialSilhouette from './CranialSilhouette';
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type CranialDiagnosis, type IndividualClassification, getIndividualClassificationText } from "@/lib/cranial-classification-utils";

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
  diagnosis?: CranialDiagnosis;
  individualClassifications?: IndividualClassification;
}

export default function CranialVisualization({
  currentMeasurement,
  measurementHistory,
  asymmetryType,
  severity,
  sexoPaciente,
  diagnosis,
  individualClassifications
}: CranialVisualizationProps) {
  const [metricType, setMetricType] = useState<'indiceCraniano' | 'cvai' | 'perimetroCefalico'>('indiceCraniano');

  // Use media queries for responsive design
  const isMobile = useMediaQuery(768);
  const isTablet = useMediaQuery(1024);

  // Calcular índice craniano e CVAI para a medição atual
  const indiceCraniano = currentMeasurement.largura / currentMeasurement.comprimento * 100;
  const diagonalMax = Math.max(currentMeasurement.diagonalD, currentMeasurement.diagonalE);
  const diagonalMin = Math.min(currentMeasurement.diagonalD, currentMeasurement.diagonalE);
  const cvai = (diagonalMax - diagonalMin) / diagonalMax * 100;

  // Adicionar medição atual ao histórico para visualização
  const currentMeasurementWithIndices = {
    ...currentMeasurement,
    indice_craniano: indiceCraniano,
    cvai: cvai
  };

  // Combinar medição atual com histórico para o gráfico
  const allMeasurements = [currentMeasurementWithIndices, ...measurementHistory.filter(m => m.data !== currentMeasurement.data)];
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

  // Adjust chart height based on device size
  const getChartHeight = () => {
    if (isMobile) return 300;
    if (isTablet) return 350;
    return 400;
  };
  const chartHeight = getChartHeight();

  return (
    <div className="border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-card/40 to-card/60">
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Visualização Craniana Científica
          {diagnosis && (
            <div className="ml-auto">
              <StatusBadge 
                status={severity}
                asymmetryType={asymmetryType}
                diagnosis={diagnosis}
                variant="enhanced"
                className="text-xs"
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 px-[25px] py-[45px] my-0">
        <Tabs defaultValue="silhouette" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="silhouette" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Vista Superior
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Evolução
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="silhouette" className="mt-6">
            <div className="space-y-6">
              <CranialSilhouette 
                measurements={currentMeasurement} 
                asymmetryType={asymmetryType} 
                severity={severity} 
                viewType="superior" 
              />
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">Índice Craniano</p>
                  <p className={`text-2xl font-bold ${
                    indiceCraniano >= 91 
                      ? "text-red-600" 
                      : indiceCraniano >= 86 
                        ? "text-amber-600" 
                        : indiceCraniano <= 74 
                          ? "text-orange-600"
                          : "text-green-600"
                  }`}>
                    {indiceCraniano.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {individualClassifications ? 
                      getIndividualClassificationText("braquicefalia", individualClassifications.braquicefalia) :
                      (indiceCraniano >= 91 
                        ? "Braquicefalia" 
                        : indiceCraniano >= 86 
                          ? "Braquicefalia Leve" 
                          : indiceCraniano <= 74 
                            ? "Dolicocefalia" 
                            : "Normal"
                      )
                    }
                  </p>
                </div>
                
                <div className="space-y-2 text-center p-4 rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
                  <p className="text-sm font-medium text-rose-700">CVAI (Assimetria)</p>
                  <p className={`text-2xl font-bold ${
                    cvai >= 8.75 
                      ? "text-red-600" 
                      : cvai >= 6.25 
                        ? "text-amber-600" 
                        : cvai >= 3.5 
                          ? "text-yellow-600" 
                          : "text-green-600"
                  }`}>
                    {cvai.toFixed(1)}%
                  </p>
                  <p className="text-xs text-rose-600 font-medium">
                    {individualClassifications ? 
                      getIndividualClassificationText("plagiocefalia", individualClassifications.plagiocefalia) :
                      (cvai >= 8.75 
                        ? "Grave" 
                        : cvai >= 6.25 
                          ? "Moderada" 
                          : cvai >= 3.5 
                            ? "Leve" 
                            : "Normal"
                      )
                    }
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="evolution" className="mt-4">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="text-sm font-medium">Evolução das Medidas</div>
              <div className="flex flex-wrap gap-2">
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
            
            <div className="chart-container pb-6" style={{
              height: `${chartHeight}px`,
              position: 'relative',
              marginBottom: '40px'
            }}>
              {metricType === "indiceCraniano" && (
                <MedicaoLineChart 
                  titulo="Evolução do Índice Craniano" 
                  descricao="O Índice Craniano mede a proporção entre largura e comprimento do crânio. Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% indicam tendência à dolicocefalia. A área verde representa a faixa de normalidade." 
                  altura={chartHeight} 
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
                  altura={chartHeight} 
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
                  altura={chartHeight} 
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
