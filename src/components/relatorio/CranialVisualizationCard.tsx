
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AsymmetryType, SeverityLevel } from "@/types";
import CranialVisualization from "../medicoes/visualizacao/CranialVisualization";

interface CranialVisualizationCardProps {
  medicao: {
    id: string;
    data: string;
    comprimento: number;
    largura: number;
    diagonal_d: number;
    diagonal_e: number;
    perimetro_cefalico?: number;
    indice_craniano: number;
    cvai: number;
  };
  medicoes: any[];
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  sexoPaciente?: 'M' | 'F';
}

export default function CranialVisualizationCard({
  medicao,
  medicoes,
  asymmetryType,
  severity,
  sexoPaciente
}: CranialVisualizationCardProps) {
  // Formatar os dados da medição atual para o componente de visualização
  const currentMeasurement = {
    comprimento: medicao.comprimento,
    largura: medicao.largura,
    diagonalD: medicao.diagonal_d,
    diagonalE: medicao.diagonal_e,
    perimetroCefalico: medicao.perimetro_cefalico,
    data: medicao.data
  };
  
  // Formatar o histórico de medições para o componente de visualização
  const measurementHistory = medicoes
    .filter((m: any) => m.id !== medicao.id) // Excluir medição atual
    .map((m: any) => ({
      data: m.data,
      comprimento: m.comprimento,
      largura: m.largura,
      diagonalD: m.diagonal_d,
      diagonalE: m.diagonal_e,
      perimetroCefalico: m.perimetro_cefalico,
      indice_craniano: m.indice_craniano,
      cvai: m.cvai
    }));
    
  return (
    <Card>
      <CardContent className="p-0">
        <CranialVisualization
          currentMeasurement={currentMeasurement}
          measurementHistory={measurementHistory}
          asymmetryType={asymmetryType}
          severity={severity}
          sexoPaciente={sexoPaciente}
        />
      </CardContent>
    </Card>
  );
}
