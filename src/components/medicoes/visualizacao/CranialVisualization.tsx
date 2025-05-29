

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis, type IndividualClassification } from "@/lib/cranial-classification-utils";
import MeasurementEvolutionChart from "./MeasurementEvolutionChart";
import CranialSilhouette from "./CranialSilhouette";

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
  dataNascimento?: string;
}

export default function CranialVisualization({
  currentMeasurement,
  measurementHistory,
  asymmetryType,
  severity,
  sexoPaciente,
  diagnosis,
  individualClassifications,
  dataNascimento
}: CranialVisualizationProps) {
  const [activeTab, setActiveTab] = useState("resumo");

  // Calcular índices da medição atual
  const indiceCraniano = (currentMeasurement.largura / currentMeasurement.comprimento) * 100;
  const diferencaDiagonais = Math.abs(currentMeasurement.diagonalD - currentMeasurement.diagonalE);
  const cvai = (diferencaDiagonais / Math.max(currentMeasurement.diagonalD, currentMeasurement.diagonalE)) * 100;

  // Função para determinar a classe de cor com base no valor do índice craniano
  const getIndiceClasse = (valor: number) => {
    if (valor >= 76 && valor <= 81) return "text-green-600"; // Normal
    if (valor > 81) return "text-amber-500"; // Braquicefalia
    return "text-amber-500"; // Dolicocefalia
  };

  // Função para determinar a classe de cor com base no valor do CVAI
  const getCvaiClasse = (valor: number) => {
    if (valor < 3.5) return "text-green-600"; // Normal
    if (valor < 6.25) return "text-yellow-500"; // Leve
    if (valor < 8.75) return "text-amber-500"; // Moderada
    return "text-red-500"; // Severa
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge 
              status={severity} 
              asymmetryType={asymmetryType}
              diagnosis={diagnosis}
              variant="enhanced"
              showIcon={true}
              className="w-full justify-center"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Índice Craniano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indiceCraniano.toFixed(1)}%</div>
            {individualClassifications && (
              <Badge variant="outline" className="mt-1">
                {individualClassifications.braquicefalia === 'normal' ? 'Normal' : 
                 `Braquicefalia ${individualClassifications.braquicefalia}`}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CVAI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cvai.toFixed(1)}%</div>
            {individualClassifications && (
              <Badge variant="outline" className="mt-1">
                {individualClassifications.plagiocefalia === 'normal' ? 'Normal' : 
                 `Plagiocefalia ${individualClassifications.plagiocefalia}`}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs - Removed "Métricas" tab to eliminate redundancy */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Parâmetros Cranianos</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="formato">Formato</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros Cranianos Completos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Consolidated section with all cranial parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Medições Básicas */}
                <div>
                  <p className="text-sm text-muted-foreground">Comprimento</p>
                  <p className="text-lg font-medium">{currentMeasurement.comprimento} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Largura</p>
                  <p className="text-lg font-medium">{currentMeasurement.largura} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Índice Craniano</p>
                  <p className={`text-lg font-medium ${getIndiceClasse(indiceCraniano)}`}>
                    {indiceCraniano.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Normal: 76-81%</p>
                </div>
                
                {/* Diagonais */}
                <div>
                  <p className="text-sm text-muted-foreground">Diagonal D</p>
                  <p className="text-lg font-medium">{currentMeasurement.diagonalD} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagonal E</p>
                  <p className="text-lg font-medium">{currentMeasurement.diagonalE} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                  <p className="text-lg font-medium">{diferencaDiagonais.toFixed(1)} mm</p>
                  <p className="text-xs text-muted-foreground">
                    |Diagonal D - Diagonal E|
                  </p>
                </div>
                
                {/* CVAI e Status */}
                <div>
                  <p className="text-sm text-muted-foreground">CVAI</p>
                  <p className={`text-lg font-medium ${getCvaiClasse(cvai)}`}>
                    {cvai.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Normal: &lt; 3.5%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Geral</p>
                  <div className="mt-1">
                    <StatusBadge 
                      status={severity} 
                      asymmetryType={asymmetryType}
                      diagnosis={diagnosis}
                      showAsymmetryType={true}
                    />
                  </div>
                </div>
                
                {/* Perímetro Cefálico */}
                {currentMeasurement.perimetroCefalico && (
                  <div>
                    <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
                    <p className="text-lg font-medium">{currentMeasurement.perimetroCefalico} mm</p>
                    <p className="text-xs text-muted-foreground">
                      Circunferência da cabeça
                    </p>
                  </div>
                )}
              </div>

              {/* Fórmulas de Referência */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Fórmulas de Cálculo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Índice Craniano:</span> (Largura ÷ Comprimento) × 100
                  </div>
                  <div>
                    <span className="font-medium">CVAI:</span> (|Diagonal D - Diagonal E| ÷ Diagonal Maior) × 100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Índice Craniano</CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementEvolutionChart
                  measurementHistory={measurementHistory}
                  metricType="indiceCraniano"
                  colorTheme="rose"
                  sexoPaciente={sexoPaciente}
                  dataNascimento={dataNascimento}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução da Plagiocefalia (CVAI)</CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementEvolutionChart
                  measurementHistory={measurementHistory}
                  metricType="cvai"
                  colorTheme="amber"
                  sexoPaciente={sexoPaciente}
                  dataNascimento={dataNascimento}
                />
              </CardContent>
            </Card>

            {measurementHistory.some(m => m.perimetroCefalico) && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
                </CardHeader>
                <CardContent>
                  <MeasurementEvolutionChart
                    measurementHistory={measurementHistory}
                    metricType="perimetroCefalico"
                    colorTheme="blue"
                    sexoPaciente={sexoPaciente}
                    dataNascimento={dataNascimento}
                  />
                </CardContent>
                </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="formato" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Formato Craniano</CardTitle>
            </CardHeader>
            <CardContent>
              <CranialSilhouette
                measurements={{
                  comprimento: currentMeasurement.comprimento,
                  largura: currentMeasurement.largura,
                  diagonalD: currentMeasurement.diagonalD,
                  diagonalE: currentMeasurement.diagonalE,
                  perimetroCefalico: currentMeasurement.perimetroCefalico
                }}
                asymmetryType={asymmetryType}
                severity={severity}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

