
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
import { Download, Search } from "lucide-react";
import { getCranialStatus } from "@/lib/cranial-utils";
import { SeverityLevel, AsymmetryType } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  diferenca_diagonais?: number;
  pacienteNome?: string;
  pacienteNascimento?: string;
}

interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
}

export default function Historico() {
  const [filtro, setFiltro] = useState("");
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);
  
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
          .select('id, nome, data_nascimento');
          
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
          pacienteNascimento: pacientesMap[medicao.paciente_id]?.data_nascimento || ""
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-bold title-gradient">Histórico de Medições</h2>
        <div className="text-sm text-muted-foreground">
          Total de registros: {medicoesFiltradas.length}
        </div>
      </div>
      
      <div className="relative flex-1 max-w-xl mb-6">
        <Input
          placeholder="Buscar por nome do paciente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="pl-10 pr-4 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <Card className="gradient-card shadow-soft border-primary/20 overflow-hidden">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Paciente</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Dif. Diagonais</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Índice Craniano</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">CVAI</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
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
                        <TableRow 
                          key={medicao.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium">{formatarData(medicao.data)}</TableCell>
                          <TableCell>
                            <Link 
                              to={`/pacientes/${medicao.paciente_id}`}
                              className="text-primary hover:underline font-medium"
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
                            <StatusBadge 
                              status={severityLevel} 
                              asymmetryType={asymmetryType} 
                              showAsymmetryType={true} 
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="hidden sm:inline-flex border-primary/20 hover:bg-primary/10"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                              <Button 
                                asChild 
                                variant="outline" 
                                size="sm"
                                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                              >
                                <Link to={`/pacientes/${medicao.paciente_id}/relatorios/${medicao.id}`}>Ver</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
