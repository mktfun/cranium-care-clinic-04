
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { ResponsiveTable } from "@/components/ui/responsive-container";

interface MeasurementHistoryTableProps {
  medicoes: any[];
  pacienteId: string;
  pacienteDataNascimento: string;
  formatarData: (dataString: string) => string;
  onMedicaoClick: (medicao: any) => void;
}

export function MeasurementHistoryTable({ 
  medicoes, 
  pacienteId, 
  pacienteDataNascimento, 
  formatarData,
  onMedicaoClick
}: MeasurementHistoryTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  if (medicoes.length === 0) {
    return null;
  }

  // Ordenar medições da mais recente para a mais antiga
  const medicoesOrdenadas = [...medicoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
  // Definir colunas visíveis por breakpoint
  const showColumnsPerBreakpoint = {
    xs: ['data', 'cvai', 'ic', 'status', 'acoes'],
    sm: ['data', 'idade', 'cvai', 'ic', 'status', 'acoes'],
    md: ['data', 'idade', 'dif_diag', 'cvai', 'ic', 'pc', 'status', 'acoes'],
    lg: ['data', 'idade', 'comp', 'larg', 'diag_d', 'diag_e', 'dif_diag', 'cvai', 'ic', 'pc', 'status', 'acoes'],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Medições</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveTable 
          compactOnMobile={true}
          showColumnsBreakpoint={showColumnsPerBreakpoint}
          minWidth={isMobile ? "100%" : "768px"}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-column="data">Data</TableHead>
                <TableHead data-column="idade" className={breakpoint === 'xs' ? "hidden" : ""}>Idade</TableHead>
                <TableHead data-column="comp" className={breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}>Comp.</TableHead>
                <TableHead data-column="larg" className={breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}>Larg.</TableHead>
                <TableHead data-column="diag_d" className={breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}>Diag. D</TableHead>
                <TableHead data-column="diag_e" className={breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}>Diag. E</TableHead>
                <TableHead data-column="dif_diag" className={breakpoint === 'xs' || breakpoint === 'sm' ? "hidden" : ""}>Dif. Diag.</TableHead>
                <TableHead data-column="cvai">CVAI</TableHead>
                <TableHead data-column="ic">IC</TableHead>
                <TableHead data-column="pc" className={breakpoint === 'xs' || breakpoint === 'sm' ? "hidden" : ""}>PC</TableHead>
                <TableHead data-column="status">Status</TableHead>
                <TableHead data-column="acoes" className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicoesOrdenadas.map((medicao) => {
                const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
                return (
                  <TableRow key={medicao.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onMedicaoClick(medicao)}>
                    <TableCell data-column="data" className="whitespace-nowrap text-sm">
                      {formatarData(medicao.data)}
                    </TableCell>
                    <TableCell data-column="idade" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' ? "hidden" : ""}`}>
                      {formatAge(pacienteDataNascimento, medicao.data)}
                    </TableCell>
                    <TableCell data-column="comp" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}`}>
                      {medicao.comprimento_maximo || medicao.comprimento} mm
                    </TableCell>
                    <TableCell data-column="larg" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}`}>
                      {medicao.largura_maxima || medicao.largura} mm
                    </TableCell>
                    <TableCell data-column="diag_d" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}`}>
                      {medicao.diagonal_direita || medicao.diagonal_d} mm
                    </TableCell>
                    <TableCell data-column="diag_e" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md' ? "hidden" : ""}`}>
                      {medicao.diagonal_esquerda || medicao.diagonal_e} mm
                    </TableCell>
                    <TableCell data-column="dif_diag" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' ? "hidden" : ""}`}>
                      {medicao.diferenca_diagonais} mm
                    </TableCell>
                    <TableCell data-column="cvai" className="whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {medicao.cvai ? `${medicao.cvai.toFixed(1)}%` : '-'}
                        
                        {(breakpoint === 'xs' || breakpoint === 'sm') && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-1">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center" className="max-w-[200px]">
                                <p>Comp: {medicao.comprimento_maximo || medicao.comprimento} mm</p>
                                <p>Larg: {medicao.largura_maxima || medicao.largura} mm</p>
                                <p>Diag D: {medicao.diagonal_direita || medicao.diagonal_d} mm</p>
                                <p>Diag E: {medicao.diagonal_esquerda || medicao.diagonal_e} mm</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-column="ic" className="whitespace-nowrap text-sm">
                      {medicao.indice_craniano ? `${medicao.indice_craniano.toFixed(1)}%` : '-'}
                    </TableCell>
                    <TableCell data-column="pc" className={`whitespace-nowrap text-sm ${breakpoint === 'xs' || breakpoint === 'sm' ? "hidden" : ""}`}>
                      {medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}
                    </TableCell>
                    <TableCell data-column="status" className="whitespace-nowrap text-sm">
                      <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                    </TableCell>
                    <TableCell data-column="acoes" className="text-right whitespace-nowrap text-sm">
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/pacientes/${pacienteId}/medicao/${medicao.id}/editar`); 
                        }}
                      >
                        {breakpoint === 'xs' ? "Editar" : "Editar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
}
