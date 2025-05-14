
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paciente } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/use-debounce";

export default function Relatorios() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPacientes() {
      setLoading(true);
      try {
        let query = supabase
          .from("pacientes")
          .select("*")
          .order("nome", { ascending: true });

        if (debouncedSearchTerm) {
          query = query.ilike("nome", `%${debouncedSearchTerm}%`);
        }

        if (date?.from && date?.to) {
          query = query.gte("data_nascimento", format(date.from, "yyyy-MM-dd"))
                       .lte("data_nascimento", format(date.to, "yyyy-MM-dd"));
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar pacientes:", error);
          toast.error("Erro ao buscar pacientes.");
          return;
        }
        
        // Transform the data to match Paciente interface
        const pacientesProcessados = (data || []).map(paciente => {
          const hoje = new Date();
          const dataNascimento = new Date(paciente.data_nascimento);
          const idadeEmMeses = ((hoje.getFullYear() - dataNascimento.getFullYear()) * 12) +
                             (hoje.getMonth() - dataNascimento.getMonth());
          
          return {
            ...paciente,
            dataNascimento: paciente.data_nascimento,
            idadeEmMeses: idadeEmMeses
          };
        });

        setPacientes(pacientesProcessados);
      } catch (error) {
        console.error("Erro inesperado:", error);
        toast.error("Erro ao buscar pacientes.");
      } finally {
        setLoading(false);
      }
    }

    fetchPacientes();
  }, [debouncedSearchTerm, date]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios de Pacientes</h1>
        <Button onClick={() => navigate("/pacientes/registro")}>
          Novo Paciente
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div>
          <Label htmlFor="search">Pesquisar Paciente</Label>
          <Input
            type="search"
            id="search"
            placeholder="Digite o nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label>Filtrar por Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !date ? "text-muted-foreground" : undefined
                )}
              >
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} -{" "}
                      {format(date.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Nome</TableHead>
            <TableHead className="text-left">Data de Nascimento</TableHead>
            <TableHead className="text-left">Sexo</TableHead>
            <TableHead className="text-left">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Carregando pacientes...
              </TableCell>
            </TableRow>
          ) : pacientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Nenhum paciente encontrado.
              </TableCell>
            </TableRow>
          ) : (
            pacientes.map((paciente) => {
              const dataNascimento = paciente?.data_nascimento;
              return (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>{formatDate(dataNascimento)}</TableCell>
                  <TableCell>{paciente.sexo}</TableCell>
                  <TableCell>
                    <Link to={`/pacientes/${paciente?.id}`} className="text-blue-500 hover:underline">
                      Ver Detalhes
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
