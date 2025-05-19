
import { formatAge } from "@/lib/age-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";
import { ResponsiveTable } from "@/components/ui/responsive-container";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";

interface MedicoesHistoricoTableProps {
  medicoes: any[];
  dataNascimento: string;
}

export function MedicoesHistoricoTable({ medicoes, dataNascimento }: MedicoesHistoricoTableProps) {
  const isSmallScreen = useIsMobileOrTabletPortrait();
  
  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (medicoes.length === 0) {
    return <p className="text-muted-foreground italic">Nenhuma medição encontrada.</p>;
  }
  
  return (
    <ResponsiveTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead className={isSmallScreen ? "hidden sm:table-cell" : ""}>Perímetro</TableHead>
            <TableHead>Índice Craniano</TableHead>
            <TableHead>CVAI</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicoes.map((medicao) => {
            const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
            
            return (
              <TableRow key={medicao.id || `medicao-${Math.random()}`}>
                <TableCell className="whitespace-nowrap">{formatData(medicao.data)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatAge(dataNascimento, medicao.data)}</TableCell>
                <TableCell className={`whitespace-nowrap ${isSmallScreen ? "hidden sm:table-cell" : ""}`}>
                  {medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap">{medicao.indice_craniano.toFixed(1)}%</TableCell>
                <TableCell className="whitespace-nowrap">{medicao.cvai.toFixed(1)}%</TableCell>
                <TableCell className="text-right whitespace-nowrap">
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
    </ResponsiveTable>
  );
}
