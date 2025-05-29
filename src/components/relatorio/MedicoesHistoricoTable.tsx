
import { formatAge } from "@/lib/age-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface MedicoesHistoricoTableProps {
  medicoes: any[];
  dataNascimento: string;
  pacienteId?: string;
  showFullHistoryButton?: boolean;
  className?: string;
}

export function MedicoesHistoricoTable({ 
  medicoes, 
  dataNascimento, 
  pacienteId,
  showFullHistoryButton = false,
  className
}: MedicoesHistoricoTableProps) {
  const isSmallScreen = useIsMobileOrTabletPortrait();
  const navigate = useNavigate();
  
  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (medicoes.length === 0) {
    return <p className="text-muted-foreground italic">Nenhuma medição encontrada.</p>;
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Histórico de Medições</h3>
        
        {showFullHistoryButton && pacienteId && (
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate(`/pacientes/${pacienteId}/historico`)}
          >
            Ver histórico completo
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-1">
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
        </div>
      </ScrollArea>
    </div>
  );
}
