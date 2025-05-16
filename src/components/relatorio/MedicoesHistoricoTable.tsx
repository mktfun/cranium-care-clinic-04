
import { formatAge } from "@/lib/age-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";

interface MedicoesHistoricoTableProps {
  medicoes: any[];
  dataNascimento: string;
}

export function MedicoesHistoricoTable({ medicoes, dataNascimento }: MedicoesHistoricoTableProps) {
  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (medicoes.length === 0) {
    return <p className="text-muted-foreground italic">Nenhuma medição encontrada.</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Perímetro</TableHead>
            <TableHead>Índice Craniano</TableHead>
            <TableHead>CVAI</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicoes.map((medicao) => {
            const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
            
            return (
              <TableRow key={medicao.id || `medicao-${Math.random()}`}>
                <TableCell>{formatData(medicao.data)}</TableCell>
                <TableCell>{formatAge(dataNascimento, medicao.data)}</TableCell>
                <TableCell>{medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}</TableCell>
                <TableCell>{medicao.indice_craniano.toFixed(1)}%</TableCell>
                <TableCell>{medicao.cvai.toFixed(1)}%</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={severityLevel}
                    asymmetryType={asymmetryType}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
