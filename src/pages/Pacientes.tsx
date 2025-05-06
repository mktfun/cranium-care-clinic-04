
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

export default function Pacientes() {
  const [searchParams] = useSearchParams();
  const statusParams = searchParams.get("status");
  
  const todosPacientes = obterPacientes();
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "todos">("todos");
  
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
  
  // Filtrar pacientes
  const pacientesFiltrados = todosPacientes.filter(paciente => {
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
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Pacientes</h2>
        <Button className="bg-turquesa hover:bg-turquesa/90">
          Adicionar Paciente
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
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead className="hidden sm:table-cell">Data de Nascimento</TableHead>
              <TableHead className="hidden md:table-cell">Última Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => {
                const ultimaMedicao = obterUltimaMedicao(paciente.id);
                
                return (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">{paciente.nome}</TableCell>
                    <TableCell>{paciente.idadeEmMeses} meses</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatarData(paciente.dataNascimento)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ultimaMedicao ? formatarData(ultimaMedicao.data) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {ultimaMedicao ? (
                        <StatusBadge status={ultimaMedicao.status} />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/pacientes/${paciente.id}`}>Ver</Link>
                      </Button>
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
