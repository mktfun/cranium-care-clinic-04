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
  dataNascimento?: string; // Adicionado para calcular idade correta
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
  const [activeTab, setActiveTab] = useState("overview");

  // Calcular índices da medição atual
  const indiceCraniano = (currentMeasurement.largura / currentMeasurement.comprimento) * 100;
  const diferencaDiagonais = Math.abs(currentMeasurement.diagonalD - currentMeasurement.diagonalE);
  const cvai = (diferencaDiagonais / Math.max(currentMeasurement.diagonalD, currentMeasurement.diagonalE)) * 100;

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

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="shape">Formato</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Comprimento</h4>
                  <p className="text-lg font-semibold">{currentMeasurement.comprimento} mm</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Largura</h4>
                  <p className="text-lg font-semibold">{currentMeasurement.largura} mm</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Diagonal D</h4>
                  <p className="text-lg font-semibold">{currentMeasurement.diagonalD} mm</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Diagonal E</h4>
                  <p className="text-lg font-semibold">{currentMeasurement.diagonalE} mm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
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

        <TabsContent value="shape" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Formato Craniano</CardTitle>
            </CardHeader>
            <CardContent>
              <CranialSilhouette
                comprimento={currentMeasurement.comprimento}
                largura={currentMeasurement.largura}
                diagonalD={currentMeasurement.diagonalD}
                diagonalE={currentMeasurement.diagonalE}
                asymmetryType={asymmetryType}
                severity={severity}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Índice Craniano</h4>
                    <p className="text-xl font-bold">{indiceCraniano.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">
                      (Largura ÷ Comprimento) × 100
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">CVAI</h4>
                    <p className="text-xl font-bold">{cvai.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">
                      Índice de Assimetria da Abóbada Craniana
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Diferença de Diagonais</h4>
                    <p className="text-xl font-bold">{diferencaDiagonais.toFixed(1)} mm</p>
                    <p className="text-xs text-muted-foreground">
                      |Diagonal D - Diagonal E|
                    </p>
                  </div>
                  {currentMeasurement.perimetroCefalico && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Perímetro Cefálico</h4>
                      <p className="text-xl font-bold">{currentMeasurement.perimetroCefalico} mm</p>
                      <p className="text-xs text-muted-foreground">
                        Circunferência da cabeça
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
