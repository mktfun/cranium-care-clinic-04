
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { formatAge } from "@/lib/age-utils";

interface PatientInfoCardProps {
  sexo: string;
  dataNascimento: string;
  ultimaMedicaoData?: string;
  medicationsCount: number;
  responsaveis: any[];
}

export function PatientInfoCard({ 
  sexo, 
  dataNascimento, 
  ultimaMedicaoData, 
  medicationsCount, 
  responsaveis 
}: PatientInfoCardProps) {
  // Ensure responsaveis is an array
  const responsaveisArray = Array.isArray(responsaveis) ? responsaveis : (responsaveis ? [responsaveis] : []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="h-4 w-4" />
            <span>Informações</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Sexo:</span>
              <span className="ml-2">{sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
            </div>
            {ultimaMedicaoData && (
              <div className="text-sm">
                <span className="text-muted-foreground">Idade na Última Avaliação:</span>
                <span className="ml-2">{formatAge(dataNascimento, ultimaMedicaoData)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span>Total de Medições</span>
          </div>
          <div className="ml-6 text-lg font-medium">
            {medicationsCount} medição(ões)
          </div>
        </div>
        
        <div>
          <div className="text-muted-foreground mb-1">Responsáveis</div>
          {responsaveisArray.length > 0 ? (
            responsaveisArray.map((resp, index) => (
              <div key={index} className="border rounded-md p-3 mb-2">
                <div className="font-medium">{resp.nome}</div>
                {(resp.telefone || resp.email) && (
                  <div className="text-sm text-muted-foreground">
                    {resp.telefone}{resp.telefone && resp.email ? ' • ' : ''}{resp.email}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
