
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { useNavigate } from "react-router-dom";

interface LastMeasurementCardProps {
  pacienteId: string;
  ultimaMedicao: any | null;
  dataNascimento: string;
}

export function LastMeasurementCard({ pacienteId, ultimaMedicao, dataNascimento }: LastMeasurementCardProps) {
  const navigate = useNavigate();

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (!ultimaMedicao) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Última Medição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhuma medição registrada.</p>
            <Button 
              className="bg-turquesa hover:bg-turquesa/90" 
              onClick={() => navigate(`/pacientes/${pacienteId}/nova-medicao`)}
            >
              Nova Medição
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normalize data fields to work with both camelCase and snake_case property names
  const normalizedMedicao = {
    id: ultimaMedicao.id,
    data: ultimaMedicao.data,
    comprimento: ultimaMedicao.comprimento,
    largura: ultimaMedicao.largura,
    diagonalD: ultimaMedicao.diagonal_d || ultimaMedicao.diagonalD,
    diagonalE: ultimaMedicao.diagonal_e || ultimaMedicao.diagonalE,
    diferencaDiagonais: ultimaMedicao.diferenca_diagonais || ultimaMedicao.diferencaDiagonais,
    indiceCraniano: ultimaMedicao.indice_craniano || ultimaMedicao.indiceCraniano,
    cvai: ultimaMedicao.cvai,
    perimetroCefalico: ultimaMedicao.perimetro_cefalico || ultimaMedicao.perimetroCefalico,
    recomendacoes: ultimaMedicao.recomendacoes || []
  };

  // Get asymmetry type and severity level based on measurements
  const { asymmetryType, severityLevel } = getCranialStatus(
    normalizedMedicao.indiceCraniano, 
    normalizedMedicao.cvai
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Última Medição</CardTitle>
        <CardDescription>
          {formatarData(normalizedMedicao.data)} • {formatAge(dataNascimento, normalizedMedicao.data)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <MedicaoDetails 
            medicao={normalizedMedicao}
            pacienteNascimento={dataNascimento}
          />
          <div className="mt-4">
            <h4 className="font-medium mb-2">Resumo para o Pediatra</h4>
            <div className="border p-3 rounded-md bg-muted/20">
              <p className="text-sm mb-2">
                <strong>Diagnóstico:</strong> {asymmetryType === "Normal" ? "Desenvolvimento craniano normal" : 
                  `${asymmetryType} ${severityLevel !== 'normal' ? severityLevel : 'leve'}`}
              </p>
              <p className="text-sm mb-2">
                <strong>Perímetro Cefálico:</strong> {normalizedMedicao.perimetroCefalico ? 
                  `${normalizedMedicao.perimetroCefalico} mm` : 'Não medido'}
              </p>
              <p className="text-sm">
                <strong>Recomendações:</strong>
              </p>
              <ul className="list-disc list-inside text-sm pl-2">
                {normalizedMedicao.recomendacoes?.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/pacientes/${pacienteId}/relatorio`)}
              className="flex items-center gap-2"
            >
              Gerar Relatório <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
