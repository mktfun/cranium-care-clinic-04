
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Download, FileDown } from "lucide-react";
import { getCranialStatus } from "@/lib/cranial-utils";
import { SeverityLevel, AsymmetryType } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicaoExportUtils } from "@/components/export/MedicaoExportUtils";
import { Loader2 } from "lucide-react";

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
}

interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo?: 'M' | 'F';
}

export default function Historico() {
  const [filtro, setFiltro] = useState("");
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  
  // Carregar dados das medições do Supabase
  useEffect(() => {
    async function loadMedicoes() {
      try {
        setLoading(true);
        
        // Primeiro, obter todas as medições
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .order('data', { ascending: false });
          
        if (medicoesError) {
          console.error("Erro ao carregar medições:", medicoesError);
          toast.error("Erro ao carregar histórico de medições");
          return;
        }
        
        // Depois, obter todos os pacientes para relacionar com as medições
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('pacientes')
          .select('id, nome, data_nascimento, sexo');
          
        if (pacientesError) {
          console.error("Erro ao carregar pacientes:", pacientesError);
          toast.error("Erro ao carregar dados dos pacientes");
          return;
        }
        
        // Criar um mapa para relacionar pacientes com medições
        const pacientesMap = (pacientesData || []).reduce((acc: Record<string, Paciente>, paciente) => {
          acc[paciente.id] = paciente;
          return acc;
        }, {});
        
        // Combinar os dados de medições com os dados de pacientes
        const medicoesCompletas = (medicoesData || []).map(medicao => ({
          ...medicao,
          pacienteNome: pacientesMap[medicao.paciente_id]?.nome || "Paciente desconhecido",
          pacienteNascimento: pacientesMap[medicao.paciente_id]?.data_nascimento || "",
          pacienteSexo: pacientesMap[medicao.paciente_id]?.sexo || 'M'
        }));
        
        setMedicoes(medicoesCompletas);
      } catch (err) {
        console.error("Erro:", err);
        toast.error("Erro ao carregar dados históricos");
      } finally {
        setLoading(false);
      }
    }
    
    loadMedicoes();
  }, []);
  
  // Filtrar com base na busca
  const medicoesFiltradas = medicoes.filter(medicao => 
    medicao.pacienteNome?.toLowerCase().includes(filtro.toLowerCase())
  );
  
  // Formatar data para formato brasileiro
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const handleExportPDF = async (medicao: Medicao) => {
    if (!medicao.pacienteNome || !medicao.pacienteNascimento) {
      toast.error("Dados do paciente incompletos");
      return;
    }

    setExportLoading(medicao.id);
    try {
      const pacienteData = {
        nome: medicao.pacienteNome,
        data_nascimento: medicao.pacienteNascimento,
        sexo: (medicao as any).pacienteSexo || 'M' as 'M' | 'F'
      };

      await MedicaoExportUtils.exportToPDF(
        medicao, 
        pacienteData, 
        [],
        { nome: "CraniumCare Clinic", profissional: "Médico Responsável" }
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold">Histórico de Medições</h2>
      
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nome do paciente..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
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
                      // Get the cranial status for the current measurement
                      const { asymmetryType, severityLevel } = getCranialStatus(
                        (medicao as any).indice_craniano || 0,
                        (medicao as any).cvai || 0
                      );
                      
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
                            {(medicao as any).indice_craniano ? `${(medicao as any).indice_craniano}%` : "N/A"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {(medicao as any).cvai ? `${(medicao as any).cvai}%` : "N/A"}
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
                                onClick={() => handleExportPDF(medicao)}
                                disabled={exportLoading === medicao.id}
                              >
                                {exportLoading === medicao.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <FileDown className="h-4 w-4 mr-2" />
                                )}
                                PDF
                              </Button>
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
                        {filtro ? 
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
      )}
    </div>
  );
}
