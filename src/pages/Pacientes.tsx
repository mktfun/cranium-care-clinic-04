import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Trash2, UserPlus, Loader2 } from "lucide-react";
import { AsymmetryType, SeverityLevel } from "@/types";
import { getCranialStatus } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { convertSupabasePacienteToPaciente } from "@/lib/patient-utils";

type Status = SeverityLevel;

type SortConfig = {
  key: "nome" | "data_nascimento" | "ultimaAvaliacao" | "status" | "idadeEmMeses";
  direction: "asc" | "desc";
};

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  perimetro_cefalico: number;
  indice_craniano: number;
  diferenca_diagonais: number;
  cvai: number;
  status: SeverityLevel;
  recomendacoes?: string[];
}

interface PacienteWithMedicao {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  responsaveis: any[];
  local_nascimento?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  dataNascimento?: string;
  idadeEmMeses?: number;
  ultimaMedicaoData?: string;
  statusCalculado: SeverityLevel;
  asymmetryTypeCalculado: AsymmetryType;
}

export default function Pacientes() {
  const [searchParams] = useSearchParams();
  const statusParams = searchParams.get("status");
  const navigate = useNavigate();
  
  const [pacientes, setPacientes] = useState<PacienteWithMedicao[]>([]);
  const [todasMedicoes, setTodasMedicoes] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Sessão expirada. Faça login novamente.");
          navigate("/login");
          return;
        }

        const { data: pacientesData, error: pacientesError } = await supabase
          .from("pacientes")
          .select("*");

        if (pacientesError) {
          console.error("Error loading patients:", pacientesError);
          toast.error("Erro ao carregar pacientes");
          setPacientes([]); 
        } else {
          const pacientesConvertidos = pacientesData?.map(convertSupabasePacienteToPaciente) || [];
          // Transform to include extended properties
          const pacientesExtended: PacienteWithMedicao[] = pacientesConvertidos.map(p => ({
            ...p,
            statusCalculado: "normal" as SeverityLevel,
            asymmetryTypeCalculado: "Normal" as AsymmetryType
          }));
          setPacientes(pacientesExtended);
        }

        const { data: medicoesData, error: medicoesError } = await supabase
          .from("medicoes")
          .select("*")
          .order("data", { ascending: false });

        if (medicoesError) {
          console.error("Error loading measurements:", medicoesError);
          toast.error("Erro ao carregar dados de medições");
        } else {
          setTodasMedicoes(medicoesData as Medicao[] || []);
        }

      } catch (err) {
        console.error("Error:", err);
        toast.error("Ocorreu um erro inesperado ao carregar os dados.");
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [navigate]);
  
  useEffect(() => {
    if (statusParams === "alerta") {
      setFiltroStatus("moderada"); // Ou poderia ser um array ["moderada", "severa"]
    } else if (statusParams === "normal" || statusParams === "leve" || 
               statusParams === "moderada" || statusParams === "severa") {
      setFiltroStatus(statusParams as Status);
    }
  }, [statusParams]);
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };
  
  const calcularIdadeEmMeses = (dataNascimento: string) => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    if (isNaN(nascimento.getTime())) return 0;
    let diffEmMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12;
    diffEmMeses -= nascimento.getMonth();
    diffEmMeses += hoje.getMonth();
    return diffEmMeses <= 0 ? 0 : diffEmMeses;
  };

  const getUltimaMedicaoReal = (pacienteId: string, medicoesList: Medicao[]) => {
    const medicoesDoPaciente = medicoesList.filter(m => m.paciente_id === pacienteId);
    return medicoesDoPaciente.length > 0 ? medicoesDoPaciente[0] : null;
  };
  
  const requestSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  const pacientesFiltrados = [...pacientes]
    .map(paciente => {
      const ultimaMedicao = getUltimaMedicaoReal(paciente.id, todasMedicoes);
      let statusCalculado: SeverityLevel = "normal";
      let asymmetryTypeCalculado: AsymmetryType = "Normal";

      if (ultimaMedicao) {
        const statusInfo = getCranialStatus(ultimaMedicao.indice_craniano, ultimaMedicao.cvai);
        statusCalculado = ultimaMedicao.status || statusInfo.severityLevel;
        asymmetryTypeCalculado = statusInfo.asymmetryType;
      }
      return {
        ...paciente,
        ultimaMedicaoData: ultimaMedicao?.data,
        statusCalculado,
        asymmetryTypeCalculado
      };
    })
    .filter(paciente => {
      const nomeMatch = paciente.nome.toLowerCase().includes(filtroNome.toLowerCase());
      let statusMatch = filtroStatus === "todos";
      if (filtroStatus !== "todos") {
        if (filtroStatus === "moderada" && statusParams === "alerta") {
            statusMatch = paciente.statusCalculado === "moderada" || paciente.statusCalculado === "severa";
        } else {
            statusMatch = paciente.statusCalculado === filtroStatus;
        }
      }
      return nomeMatch && statusMatch;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      if (sortConfig.key === "ultimaAvaliacao") {
        const dateA = a.ultimaMedicaoData ? new Date(a.ultimaMedicaoData).getTime() : 0;
        const dateB = b.ultimaMedicaoData ? new Date(b.ultimaMedicaoData).getTime() : 0;
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === "status") {
        const statusOrder: Record<SeverityLevel, number> = { normal: 0, leve: 1, moderada: 2, severa: 3 };
        const statusA = statusOrder[a.statusCalculado] ?? -1;
        const statusB = statusOrder[b.statusCalculado] ?? -1;
        return sortConfig.direction === "asc" ? statusA - statusB : statusB - statusA;
      }
      
      if (sortConfig.key === "idadeEmMeses") {
        const idadeA = calcularIdadeEmMeses(a.data_nascimento);
        const idadeB = calcularIdadeEmMeses(b.data_nascimento);
        return sortConfig.direction === "asc" ? idadeA - idadeB : idadeB - idadeA;
      }
      
      // Tratamento para chaves que são diretamente campos de Paciente
      const key = sortConfig.key as keyof typeof a;
      const valueA = a[key] || "";
      const valueB = b[key] || "";
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const getSortIcon = (key: SortConfig["key"]) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  const handleAddPaciente = () => navigate("/pacientes/novo");
  
  const handleDeletePaciente = async (pacienteId: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente e todas as suas medições? Esta ação não pode ser desfeita.")) {
      try {
        setLoading(true);
        const { error: medicoesError } = await supabase
          .from("medicoes")
          .delete()
          .eq("paciente_id", pacienteId);

        if (medicoesError) {
          console.error("Error deleting measurements for patient:", medicoesError);
          toast.error("Erro ao excluir medições do paciente: " + medicoesError.message);
          setLoading(false);
          return; 
        }

        const { error: pacienteError } = await supabase
          .from("pacientes")
          .delete()
          .eq("id", pacienteId);
        
        if (pacienteError) {
          console.error("Error deleting patient:", pacienteError);
          toast.error("Erro ao excluir paciente: " + pacienteError.message);
        } else {
          toast.success("Paciente excluído com sucesso");
          setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== pacienteId));
          setTodasMedicoes(prevMedicoes => prevMedicoes.filter(m => m.paciente_id !== pacienteId));
        }
      } catch (err: any) {
        console.error("Error:", err);
        toast.error("Erro ao excluir paciente: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar pacientes:', error);
          toast.error('Erro ao carregar pacientes');
          return;
        }

        // Converter dados do Supabase para o tipo Paciente
        const pacientesConvertidos = data?.map(convertSupabasePacienteToPaciente) || [];
        const pacientesExtended: PacienteWithMedicao[] = pacientesConvertidos.map(p => ({
          ...p,
          statusCalculado: "normal" as SeverityLevel,
          asymmetryTypeCalculado: "Normal" as AsymmetryType
        }));
        setPacientes(pacientesExtended);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold">Pacientes</h2>
        <Button 
          className="bg-turquesa hover:bg-turquesa/90 flex items-center gap-2 w-full sm:w-auto"
          onClick={handleAddPaciente}
        >
          <UserPlus className="h-4 w-4" />
          <span>Adicionar Paciente</span>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
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
        
        <div className="w-full md:w-auto md:min-w-[200px]">
          <Select 
            value={filtroStatus} 
            onValueChange={(value) => setFiltroStatus(value as Status | "todos")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="leve">Leve</SelectItem>
              <SelectItem value="moderada">Moderada (Alerta)</SelectItem>
              <SelectItem value="severa">Severa (Alerta)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort("nome")} className="cursor-pointer hover:bg-accent/50 whitespace-nowrap">
                <div className="flex items-center">Nome {getSortIcon("nome")}</div>
              </TableHead>
              <TableHead onClick={() => requestSort("idadeEmMeses")} className="cursor-pointer hover:bg-accent/50 whitespace-nowrap">
                <div className="flex items-center">Idade {getSortIcon("idadeEmMeses")}</div>
              </TableHead>
              <TableHead onClick={() => requestSort("data_nascimento")} className="hidden sm:table-cell cursor-pointer hover:bg-accent/50 whitespace-nowrap">
                <div className="flex items-center">Nascimento {getSortIcon("data_nascimento")}</div>
              </TableHead>
              <TableHead onClick={() => requestSort("ultimaAvaliacao")} className="hidden md:table-cell cursor-pointer hover:bg-accent/50 whitespace-nowrap">
                <div className="flex items-center">Última Medição {getSortIcon("ultimaAvaliacao")}</div>
              </TableHead>
              <TableHead onClick={() => requestSort("status")} className="cursor-pointer hover:bg-accent/50 whitespace-nowrap">
                <div className="flex items-center">Status {getSortIcon("status")}</div>
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">
                    <Link to={`/pacientes/${paciente.id}`} className="hover:underline text-turquesa">
                      {paciente.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{calcularIdadeEmMeses(paciente.data_nascimento)} meses</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatarData(paciente.data_nascimento)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {paciente.ultimaMedicaoData ? formatarData(paciente.ultimaMedicaoData) : "Nenhuma"}
                  </TableCell>
                  <TableCell>
                    {paciente.ultimaMedicaoData ? (
                      <StatusBadge 
                        status={paciente.statusCalculado}
                        asymmetryType={paciente.asymmetryTypeCalculado}
                        showAsymmetryType={true}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sem medição</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/pacientes/${paciente.id}`}>Ver</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeletePaciente(paciente.id)}
                        title="Excluir Paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {loading ? "Carregando..." : "Nenhum paciente encontrado com os filtros atuais."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
