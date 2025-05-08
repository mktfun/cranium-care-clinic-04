
import { useState } from "react";
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
import { obterPacientes } from "@/data/mock-data";
import { Download } from "lucide-react";
import { getCranialStatus } from "@/lib/cranial-utils";
import { SeverityLevel, AsymmetryType } from "@/lib/cranial-utils";

export default function Historico() {
  const [filtro, setFiltro] = useState("");
  const pacientes = obterPacientes();
  
  // Obter todas as medições de todos os pacientes
  const todasMedicoes = pacientes.flatMap(paciente => 
    paciente.medicoes.map(medicao => ({
      ...medicao,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome
    }))
  );
  
  // Ordenar por data (mais recente primeiro)
  const medicoesOrdenadas = [...todasMedicoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
  // Filtrar com base na busca
  const medicoesFiltradas = medicoesOrdenadas.filter(medicao => 
    medicao.pacienteNome.toLowerCase().includes(filtro.toLowerCase())
  );
  
  // Formatar data para formato brasileiro
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
                  medicao.indiceCraniano,
                  medicao.cvai
                );
                
                return (
                  <TableRow key={medicao.id}>
                    <TableCell>{formatarData(medicao.data)}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/pacientes/${medicao.pacienteId}`}
                        className="text-turquesa hover:underline"
                      >
                        {medicao.pacienteNome}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {medicao.diferencaDiagonais} mm
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {medicao.indiceCraniano}%
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {medicao.cvai}%
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/pacientes/${medicao.pacienteId}`}>Ver</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhuma medição encontrada para os critérios de busca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
