
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis, type IndividualClassification } from "@/lib/cranial-classification-utils";
import MeasurementEvolutionChart from "./MeasurementEvolutionChart";

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
    perimetro_cefalico?: number; // Campo do banco com underscore
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
  // Calcular índices da medição atual
  const indiceCraniano = (currentMeasurement.largura / currentMeasurement.comprimento) * 100;
  const cvai = (Math.abs(currentMeasurement.diagonalD - currentMeasurement.diagonalE) / Math.max(currentMeasurement.diagonalD, currentMeasurement.diagonalE)) * 100;

  // Normalizar dados do histórico para garantir que perimetroCefalico seja mapeado corretamente
  const normalizedHistory = measurementHistory.map(m => ({
    ...m,
    perimetroCefalico: m.perimetroCefalico || m.perimetro_cefalico || 0
  }));

  // Debug logs para entender os dados
  console.log('CranialVisualization - measurementHistory original:', measurementHistory);
  console.log('CranialVisualization - normalizedHistory:', normalizedHistory);
  console.log('CranialVisualization - currentMeasurement:', currentMeasurement);
  
  // Verificar se existem dados de perímetro cefálico no histórico normalizado
  const hasPerimeterData = normalizedHistory.some(m => {
    const hasPerimeter = m.perimetroCefalico && m.perimetroCefalico > 0;
    console.log('Measurement:', m, 'hasPerimeter:', hasPerimeter);
    return hasPerimeter;
  });
  
  console.log('CranialVisualization - hasPerimeterData:', hasPerimeterData);

  return (
    <div className="space-y-6">
      {/* Evolution Charts Only */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Índice Craniano</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasurementEvolutionChart
              measurementHistory={normalizedHistory}
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
              measurementHistory={normalizedHistory}
              metricType="cvai"
              colorTheme="amber"
              sexoPaciente={sexoPaciente}
              dataNascimento={dataNascimento}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPerimeterData ? (
              <MeasurementEvolutionChart
                measurementHistory={normalizedHistory}
                metricType="perimetroCefalico"
                colorTheme="blue"
                sexoPaciente={sexoPaciente}
                dataNascimento={dataNascimento}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum dado de perímetro cefálico encontrado no histórico.</p>
                <p className="text-sm mt-2">Debug info:</p>
                <pre className="text-xs mt-2 p-2 bg-muted rounded">
                  {JSON.stringify(normalizedHistory.map(m => ({
                    data: m.data,
                    perimetroCefalico: m.perimetroCefalico,
                    perimetro_cefalico: m.perimetro_cefalico
                  })), null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
