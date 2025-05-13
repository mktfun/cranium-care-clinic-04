
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { formatAge } from "@/lib/age-utils";

interface ResponsavelType {
  nome: string;
  telefone?: string;
  email?: string;
}

interface PatientInfoCardProps {
  paciente: {
    sexo: string;
    data_nascimento: string;
    responsaveis?: ResponsavelType[] | ResponsavelType;
  };
  ultimaMedicao?: {
    data: string;
  } | null;
  medicoesCount: number;
}

export function PatientInfoCard({ paciente, ultimaMedicao, medicoesCount }: PatientInfoCardProps) {
  const responsaveisArray = paciente.responsaveis ? 
    (Array.isArray(paciente.responsaveis) ? paciente.responsaveis : [paciente.responsaveis]) 
    : [];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 ml-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Sexo:</span>
              <span className="ml-2">{paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
            </div>
            {ultimaMedicao && (
              <div className="text-sm">
                <span className="text-muted-foreground">Idade na Última Avaliação:</span>
                <span className="ml-2">{formatAge(paciente.data_nascimento, ultimaMedicao.data)}</span>
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
            {medicoesCount} medição(ões)
          </div>
        </div>
        
        <div>
          <div className="text-muted-foreground mb-1">Responsáveis</div>
          {responsaveisArray.length > 0 ? responsaveisArray.map((resp: ResponsavelType, index: number) => (
            <div key={index} className="border rounded-md p-3 mb-2 dark:border-gray-700">
              <div className="font-medium">{resp.nome}</div>
              { (resp.telefone || resp.email) && (
                <div className="text-sm text-muted-foreground">
                  {resp.telefone}{resp.telefone && resp.email ? ' • ' : ''}{resp.email}
                </div>
              )}
            </div>
          )) : (
              <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
