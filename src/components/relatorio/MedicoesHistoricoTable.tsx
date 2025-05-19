
import { formatAge } from "@/lib/age-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";
import { ResponsiveTable } from "@/components/ui/responsive-container";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MedicoesHistoricoTableProps {
  medicoes: any[];
  dataNascimento: string;
}

export function MedicoesHistoricoTable({ medicoes, dataNascimento }: MedicoesHistoricoTableProps) {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (medicoes.length === 0) {
    return <p className="text-muted-foreground italic">Nenhuma medição encontrada.</p>;
  }
  
  // Definir quais colunas mostrar em diferentes breakpoints
  const showColumnsPerBreakpoint = {
    xs: ['data', 'cvai', 'status'],
    sm: ['data', 'idade', 'ic', 'cvai', 'status'],
    md: ['data', 'idade', 'perimetro', 'ic', 'cvai', 'status'],
    lg: ['data', 'idade', 'perimetro', 'ic', 'cvai', 'status'],
  };
  
  // Ordenar medições da mais recente para a mais antiga
  const medicoesOrdenadas = [...medicoes].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });
  
  return (
    <ResponsiveTable
      compactOnMobile={true}
      showColumnsBreakpoint={showColumnsPerBreakpoint}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-column="data">Data</TableHead>
            <TableHead data-column="idade" className={isMobile ? "hidden sm:table-cell" : ""}>Idade</TableHead>
            <TableHead data-column="perimetro" className={breakpoint === 'xs' ? "hidden" : (breakpoint === 'sm' ? "hidden" : "")}>Perímetro</TableHead>
            <TableHead data-column="ic" className={breakpoint === 'xs' ? "hidden" : ""}>Índice Craniano</TableHead>
            <TableHead data-column="cvai">CVAI</TableHead>
            <TableHead data-column="status" className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicoesOrdenadas.map((medicao) => {
            const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
            
            return (
              <TableRow key={medicao.id || `medicao-${Math.random()}`}>
                <TableCell data-column="data" className="whitespace-nowrap">
                  {formatData(medicao.data)}
                </TableCell>
                <TableCell data-column="idade" className={`whitespace-nowrap ${isMobile ? "hidden sm:table-cell" : ""}`}>
                  {formatAge(dataNascimento, medicao.data)}
                </TableCell>
                <TableCell data-column="perimetro" className={`whitespace-nowrap ${breakpoint === 'xs' ? "hidden" : (breakpoint === 'sm' ? "hidden" : "")}`}>
                  {medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}
                </TableCell>
                <TableCell data-column="ic" className={`whitespace-nowrap ${breakpoint === 'xs' ? "hidden" : ""}`}>
                  {medicao.indice_craniano?.toFixed(1)}%
                </TableCell>
                <TableCell data-column="cvai" className="whitespace-nowrap">
                  <div className="flex items-center">
                    {medicao.cvai?.toFixed(1)}%
                    {isMobile && breakpoint === 'xs' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="ml-1">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>IC: {medicao.indice_craniano?.toFixed(1)}%</p>
                            <p>Perímetro: {medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : 'N/D'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell data-column="status" className="text-right whitespace-nowrap">
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
