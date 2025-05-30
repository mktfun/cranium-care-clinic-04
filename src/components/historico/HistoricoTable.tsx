
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { BarChart3, FileDown, Loader2 } from "lucide-react";
import { getCranialStatus } from "@/lib/cranial-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  diferenca_diagonais?: number;
  comprimento?: number;
  largura?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  pacienteNome?: string;
  pacienteNascimento?: string;
  pacienteSexo?: 'M' | 'F';
}

interface HistoricoTableProps {
  medicoesFiltradas: Medicao[];
  allMedicoes: Medicao[];
  exportLoading: string | null;
  onExportPDF: (medicao: Medicao, includeCharts: boolean) => void;
}

export function HistoricoTable({ 
  medicoesFiltradas, 
  allMedicoes,
  exportLoading, 
  onExportPDF 
}: HistoricoTableProps) {
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead className="hidden md:table-cell">Dif. Diagonais</TableHead>
                <TableHead className="hidden md:table-cell">Índice Craniano</TableHead>
                <TableHead className="hidden sm:table-cell">CVAI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicoesFiltradas.length > 0 ? (
                medicoesFiltradas.map((medicao) => {
                  const { asymmetryType, severityLevel } = getCranialStatus(
                    medicao.indice_craniano || 0,
                    medicao.cvai || 0
                  );
                  
                  // Verificar se há dados históricos suficientes para gráficos
                  const medicoesPaciente = allMedicoes.filter(m => m.paciente_id === medicao.paciente_id);
                  const hasHistoricalData = medicoesPaciente.length > 1;
                  
                  return (
                    <TableRow key={medicao.id}>
                      <TableCell>{formatarData(medicao.data)}</TableCell>
                      <TableCell>
                        <Link 
                          to={`/pacientes/${medicao.paciente_id}`}
                          className="text-turquesa hover:underline"
                        >
                          {medicao.pacienteNome}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {medicao.diferenca_diagonais ? `${medicao.diferenca_diagonais} mm` : "N/A"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {medicao.indice_craniano ? `${medicao.indice_craniano}%` : "N/A"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {medicao.cvai ? `${medicao.cvai}%` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={severityLevel} asymmetryType={asymmetryType} showAsymmetryType={true} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="hidden sm:inline-flex"
                            onClick={() => onExportPDF(medicao, false)}
                            disabled={exportLoading === medicao.id}
                          >
                            {exportLoading === medicao.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4 mr-2" />
                            )}
                            PDF
                          </Button>
                          {hasHistoricalData && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="hidden lg:inline-flex"
                              onClick={() => onExportPDF(medicao, true)}
                              disabled={exportLoading === medicao.id}
                              title="PDF com gráficos de evolução"
                            >
                              {exportLoading === medicao.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <BarChart3 className="h-4 w-4 mr-2" />
                              )}
                              +Gráficos
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/pacientes/${medicao.paciente_id}/relatorios/${medicao.id}`}>Ver</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {medicoesFiltradas.length === 0 && allMedicoes.length > 0 ? 
                      "Nenhuma medição encontrada para os critérios de busca." : 
                      "Nenhuma medição registrada no sistema."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
