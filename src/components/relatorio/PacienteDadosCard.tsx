
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PacienteDadosCardProps {
  nome: string;
  idadeAtual: string;
  dataNascimentoFormatada: string;
  sexo: string;
}

export function PacienteDadosCard({
  nome,
  idadeAtual,
  dataNascimentoFormatada,
  sexo
}: PacienteDadosCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Idade Atual</p>
            <p className="font-medium">{idadeAtual}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            <p className="font-medium">{dataNascimentoFormatada}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sexo</p>
            <p className="font-medium">{sexo === "M" ? "Masculino" : "Feminino"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
