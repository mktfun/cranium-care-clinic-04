
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface LastMeasurementCardProps {
  paciente: {
    id: string;
    data_nascimento: string;
  };
  ultimaMedicao: any | null;
  formatarData: (dataString: string) => string;
}

export function LastMeasurementCard({ paciente, ultimaMedicao, formatarData }: LastMeasurementCardProps) {
  const navigate = useNavigate();
  
  // Only calculate if ultimaMedicao exists
  const { asymmetryType, severityLevel } = ultimaMedicao
    ? getCranialStatus(ultimaMedicao.indice_craniano, ultimaMedicao.cvai)
    : { asymmetryType: "Normal", severityLevel: "normal" };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Última Medição</CardTitle>
        {ultimaMedicao && (
          <CardDescription>
            {formatarData(ultimaMedicao.data)} • {formatAge(paciente.data_nascimento, ultimaMedicao.data)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {ultimaMedicao ? (
          <div>
            <MedicaoDetails 
              medicao={ultimaMedicao}
              pacienteNascimento={paciente.data_nascimento}
            />
            <div className="mt-4">
              <h4 className="font-medium mb-2">Resumo para o Pediatra</h4>
              <div className="border p-3 rounded-md bg-muted/20 dark:bg-gray-800/30">
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
                  )) ?? <li>Nenhuma recomendação específica.</li>}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/pacientes/${paciente.id}/relatorio`)}
                className="flex items-center gap-2"
              >
                Gerar Relatório <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhuma medição registrada para este paciente.</p>
            <Button 
              className="bg-turquesa hover:bg-turquesa/90"
              onClick={() => navigate(`/pacientes/${paciente.id}/nova-medicao`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Nova Medição
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
