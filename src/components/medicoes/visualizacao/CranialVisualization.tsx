
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

      {/* Evolution Charts Only */}
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
    </div>
  );
}
