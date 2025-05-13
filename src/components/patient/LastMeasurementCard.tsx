
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

  // Get asymmetry type and severity level
  const { asymmetryType, severityLevel } = getCranialStatus(
    ultimaMedicao.indice_craniano || ultimaMedicao.indiceCraniano, 
    ultimaMedicao.cvai
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Última Medição</CardTitle>
        <CardDescription>
          {formatarData(ultimaMedicao.data)} • {formatAge(dataNascimento, ultimaMedicao.data)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <MedicaoDetails 
            medicao={ultimaMedicao}
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
                <strong>Perímetro Cefálico:</strong> {ultimaMedicao.perimetro_cefalico ? 
                  `${ultimaMedicao.perimetro_cefalico} mm` : 'Não medido'}
              </p>
              <p className="text-sm">
                <strong>Recomendações:</strong>
              </p>
              <ul className="list-disc list-inside text-sm pl-2">
                {ultimaMedicao.recomendacoes?.map((rec: string, idx: number) => (
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
