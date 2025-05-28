
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CranialVisualization from "@/components/medicoes/visualizacao/CranialVisualization";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis, type IndividualClassification } from "@/lib/cranial-classification-utils";

interface CranialVisualizationCardProps {
  medicao: any;
  medicoes: any[];
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  sexoPaciente?: 'M' | 'F';
  diagnosis?: CranialDiagnosis;
  individualClassifications?: IndividualClassification;
  dataNascimento?: string; // Adicionado para calcular idade correta
}

export default function CranialVisualizationCard({
  medicao,
  medicoes,
  asymmetryType,
  severity,
  sexoPaciente,
  diagnosis,
  individualClassifications,
  dataNascimento
}: CranialVisualizationCardProps) {
  // Transform medicao to the expected format
  const currentMeasurement = {
    comprimento: medicao.comprimento,
    largura: medicao.largura,
    diagonalD: medicao.diagonal_d,
    diagonalE: medicao.diagonal_e,
    perimetroCefalico: medicao.perimetro_cefalico,
    data: medicao.data
  };

  // Transform medicoes to expected format
  const measurementHistory = medicoes.map(m => ({
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
      <CardHeader>
        <CardTitle>Visualização Craniana</CardTitle>
      </CardHeader>
      <CardContent>
        <CranialVisualization
          currentMeasurement={currentMeasurement}
          measurementHistory={measurementHistory}
          asymmetryType={asymmetryType}
          severity={severity}
          sexoPaciente={sexoPaciente}
          diagnosis={diagnosis}
          individualClassifications={individualClassifications}
          dataNascimento={dataNascimento}
        />
      </CardContent>
    </Card>
  );
}
