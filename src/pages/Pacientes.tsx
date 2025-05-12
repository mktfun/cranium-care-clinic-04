
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
import { obterPacientes, obterUltimaMedicao } from "@/data/mock-data";
import { Paciente, Status } from "@/data/mock-data";
import { ArrowDown, ArrowUp, Trash2, UserPlus } from "lucide-react";
import { AsymmetryType, getCranialStatus } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SortConfig = {
  key: keyof Paciente | "ultimaAvaliacao" | "status";
  direction: "asc" | "desc";
};

export default function Pacientes() {
  const [searchParams] = useSearchParams();
  const statusParams = searchParams.get("status");
  const navigate = useNavigate();
  
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Load patients from Supabase
  useEffect(() => {
    async function loadPacientes() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('pacientes')
          .select('*');
        
        if (error) {
          console.error("Error loading patients:", error);
          toast.error("Erro ao carregar pacientes");
          // Fallback to mock data
          const mockPacientes = obterPacientes();
          setPacientes(mockPacientes);
        } else {
          setPacientes(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        // Fallback to mock data
        const mockPacientes = obterPacientes();
        setPacientes(mockPacientes);
      } finally {
        setLoading(false);
      }
    }
    
    loadPacientes();
  }, []);
  
  // Aplicar filtro de URL se existir
  useEffect(() => {
    if (statusParams === "alerta") {
      setFiltroStatus("moderada"); // Considerando moderada e severa como alerta
    } else if (statusParams === "normal" || statusParams === "leve" || 
               statusParams === "moderada" || statusParams === "severa") {
      setFiltroStatus(statusParams as Status);
    }
  }, [statusParams]);
  
  // Formatar data para formato brasileiro
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Função para cálculo de idade em meses
  const calcularIdadeEmMeses = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffEmMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + 
                        (hoje.getMonth() - nascimento.getMonth());
    return diffEmMeses;
  };
  
  // Função para ordenação
  const requestSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  // Filtrar e ordenar pacientes
  const pacientesFiltrados = [...pacientes]
    .filter(paciente => {
      // Filtro por nome
      const nomeMatch = paciente.nome.toLowerCase().includes(filtroNome.toLowerCase());
      
      // Filtro por status
      const ultimaMedicao = obterUltimaMedicao(paciente.id);
      let statusMatch = filtroStatus === "todos";
      
      if (filtroStatus === "moderada" && statusParams === "alerta") {
        // Caso especial: filtro de "alerta" inclui moderada e severa
        statusMatch = ultimaMedicao && (ultimaMedicao.status === "moderada" || ultimaMedicao.status === "severa");
      } else {
        statusMatch = filtroStatus === "todos" || (ultimaMedicao && ultimaMedicao.status === filtroStatus);
      }
      
      return nomeMatch && statusMatch;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      if (sortConfig.key === "ultimaAvaliacao") {
        const ultimaMedicaoA = obterUltimaMedicao(a.id);
        const ultimaMedicaoB = obterUltimaMedicao(b.id);
        const dateA = ultimaMedicaoA ? new Date(ultimaMedicaoA.data).getTime() : 0;
        const dateB = ultimaMedicaoB ? new Date(ultimaMedicaoB.data).getTime() : 0;
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === "status") {
        const ultimaMedicaoA = obterUltimaMedicao(a.id);
        const ultimaMedicaoB = obterUltimaMedicao(b.id);
        const statusOrder = { normal: 0, leve: 1, moderada: 2, severa: 3 };
        const statusA = ultimaMedicaoA ? statusOrder[ultimaMedicaoA.status as keyof typeof statusOrder] : -1;
        const statusB = ultimaMedicaoB ? statusOrder[ultimaMedicaoB.status as keyof typeof statusOrder] : -1;
        return sortConfig.direction === "asc" ? statusA - statusB : statusB - statusA;
      }
      
      // For idadeEmMeses, calculate it if it's coming from Supabase (data_nascimento instead of dataNascimento)
      if (sortConfig.key === "idadeEmMeses") {
        const idadeA = a.idadeEmMeses || calcularIdadeEmMeses(a.dataNascimento || a.data_nascimento);
        const idadeB = b.idadeEmMeses || calcularIdadeEmMeses(b.dataNascimento || b.data_nascimento);
        return sortConfig.direction === "asc" ? idadeA - idadeB : idadeB - idadeA;
      }
      
      // Special handling for dataNascimento field from Supabase vs mock
      if (sortConfig.key === "dataNascimento") {
        const dateA = new Date(a.dataNascimento || a.data_nascimento).getTime();
        const dateB = new Date(b.dataNascimento || b.data_nascimento).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // Ordenação padrão para as outras colunas
      const valueA = a[sortConfig.key] || "";
      const valueB = b[sortConfig.key] || "";
      
      if (valueA < valueB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Render sort icon
  const getSortIcon = (key: SortConfig["key"]) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
  };

  // Handle navigation to registro page
  const handleAddPaciente = () => {
    navigate("/registro");
  };
  
  // Handle delete patient
  const handleDeletePaciente = async (pacienteId: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('pacientes')
          .delete()
          .eq('id', pacienteId);
        
        if (error) {
          console.error("Error deleting patient:", error);
          toast.error("Erro ao excluir paciente");
        } else {
          toast.success("Paciente excluído com sucesso");
          // Atualizar a lista de pacientes
          setPacientes(pacientes.filter(p => p.id !== pacienteId));
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("Erro ao excluir paciente");
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Pacientes</h2>
        <Button 
          className="bg-turquesa hover:bg-turquesa/90 flex items-center gap-2"
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
        
        <div className="w-full md:w-[200px]">
          <Select 
            value={filtroStatus} 
            onValueChange={(value) => setFiltroStatus(value as Status | "todos")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="leve">Leve</SelectItem>
              <SelectItem value="moderada">Moderada</SelectItem>
              <SelectItem value="severa">Severa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => requestSort("nome")} 
                className="cursor-pointer hover:bg-accent/50"
              >
                <div className="flex items-center">
                  Nome {getSortIcon("nome")}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort("idadeEmMeses")} 
                className="cursor-pointer hover:bg-accent/50"
              >
                <div className="flex items-center">
                  Idade {getSortIcon("idadeEmMeses")}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort("dataNascimento")} 
                className="hidden sm:table-cell cursor-pointer hover:bg-accent/50"
              >
                <div className="flex items-center">
                  Data de Nascimento {getSortIcon("dataNascimento")}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort("ultimaAvaliacao")} 
                className="hidden md:table-cell cursor-pointer hover:bg-accent/50"
              >
                <div className="flex items-center">
                  Última Avaliação {getSortIcon("ultimaAvaliacao")}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => requestSort("status")} 
                className="cursor-pointer hover:bg-accent/50"
              >
                <div className="flex items-center">
                  Status {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => {
                const idadeEmMeses = paciente.idadeEmMeses || 
                  calcularIdadeEmMeses(paciente.dataNascimento || paciente.data_nascimento);
                  
                const dataNascimento = paciente.dataNascimento || paciente.data_nascimento;
                const ultimaMedicao = obterUltimaMedicao(paciente.id);
                
                // Fix: Handle both snake_case and camelCase property names for cranial index
                const { asymmetryType } = ultimaMedicao ? 
                  getCranialStatus(
                    ultimaMedicao.indiceCraniano || ultimaMedicao.indice_craniano || 0, 
                    ultimaMedicao.cvai || 0
                  ) : 
                  { asymmetryType: "Normal" as AsymmetryType };
                
                return (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">{paciente.nome}</TableCell>
                    <TableCell>{idadeEmMeses} meses</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatarData(dataNascimento)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ultimaMedicao ? formatarData(ultimaMedicao.data) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {ultimaMedicao ? (
                        <StatusBadge 
                          status={ultimaMedicao.status} 
                          asymmetryType={asymmetryType}
                          showAsymmetryType={true}
                        />
                      ) : (
                        "N/A"
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
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePaciente(paciente.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum paciente encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
