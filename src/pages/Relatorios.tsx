import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, FileText, Filter, TrendingUp, AlertTriangle, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SeverityLevel, getCranialStatus } from "@/lib/cranial-utils";
import { subDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COLORS: Record<SeverityLevel, string> = {
  normal: "#10b981",
  leve: "#f59e0b",
  moderada: "#f97316",
  severa: "#ef4444",
};

interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: "M" | "F";
  cidade?: string; // Adicionado para distribuição geográfica
  estado?: string; // Adicionado para distribuição geográfica
  // Outros campos necessários
}

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano: number;
  cvai: number;
  status: SeverityLevel;
  // Outros campos necessários
}

interface StatusDataPoint {
  name: string;
  value: number;
  description: string;
}

interface AgeGroupDataPoint {
  idade: string;
  pacientes: number;
}

interface MonthlyEvolutionDataPoint {
  mes: string;
  normal: number;
  leve: number;
  moderada: number;
  severa: number;
  total: number;
}

interface LocationDataPoint {
  regiao: string; // Cidade ou Estado
  pacientes: number;
  moderada: number;
  severa: number;
}

// Componente de tooltip customizado para os status
const StatusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const status = payload[0].name;
    const value = payload[0].value;
    const description = payload[0].payload.description;
    
    return (
      <div className="bg-background p-3 border rounded-md shadow-md">
        <p className="font-medium">{`${status}: ${value} pacientes`}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [statusDistribuicao, setStatusDistribuicao] = useState<StatusDataPoint[]>([]);
  const [idadePacientesData, setIdadePacientesData] = useState<AgeGroupDataPoint[]>([]);
  const [evolucaoMensalData, setEvolucaoMensalData] = useState<MonthlyEvolutionDataPoint[]>([]);
  const [locationData, setLocationData] = useState<LocationDataPoint[]>([]);
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState("30");
  const [faixaEtariaSelecionada, setFaixaEtariaSelecionada] = useState("todas");
  const [statusSelecionado, setStatusSelecionado] = useState<SeverityLevel | "todos">("todos");
  const [compararPeriodos, setCompararPeriodos] = useState(false); // Funcionalidade de comparação não implementada neste escopo
  const [aumentoCasosGraves, setAumentoCasosGraves] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Sessão não encontrada. Faça login novamente.");
          setLoading(false);
          return;
        }

        // 1. Total de Pacientes
        const { count: pacientesCount, error: countError } = await supabase
          .from("pacientes")
          .select("*", { count: "exact", head: true });
        if (countError) throw countError;
        setTotalPacientes(pacientesCount || 0);

        // 2. Carregar todos os pacientes e todas as medições para processamento
        const { data: todosPacientes, error: pacientesError } = await supabase
          .from("pacientes")
          .select("id, data_nascimento, cidade, estado");
        if (pacientesError) throw pacientesError;

        const { data: todasMedicoes, error: medicoesError } = await supabase
          .from("medicoes")
          .select("paciente_id, data, indice_craniano, cvai, status");
        if (medicoesError) throw medicoesError;

        if (!todosPacientes || !todasMedicoes) {
            toast.error("Não foi possível carregar todos os dados para os relatórios.");
            setLoading(false);
            return;
        }

        // Processar dados para os gráficos
        // 2.1 Distribuição de Status (baseado na última medição de cada paciente)
        const ultimasMedicoesMap = new Map<string, Medicao>();
        todasMedicoes.forEach(m => {
          const medicaoAtual = ultimasMedicoesMap.get(m.paciente_id);
          if (!medicaoAtual || new Date(m.data) > new Date(medicaoAtual.data)) {
            ultimasMedicoesMap.set(m.paciente_id, m as Medicao);
          }
        });

        const statusCounts: Record<SeverityLevel, number> = { normal: 0, leve: 0, moderada: 0, severa: 0 };
        ultimasMedicoesMap.forEach(med => statusCounts[med.status]++);
        
        setStatusDistribuicao([
          { name: "Normal", value: statusCounts.normal, description: "Sem sinais de pressão intracraniana elevada" },
          { name: "Leve", value: statusCounts.leve, description: "Sinais leves de pressão elevada" },
          { name: "Moderada", value: statusCounts.moderada, description: "Pressão elevada significativa" },
          { name: "Severa", value: statusCounts.severa, description: "Condição crítica" },
        ]);

        // 2.2 Distribuição por Faixa Etária
        const hoje = new Date();
        const ageCounts: Record<string, number> = {
          "0-3 meses": 0, "4-6 meses": 0, "7-9 meses": 0, "10-12 meses": 0, "Acima de 12 meses": 0
        };
        todosPacientes.forEach(p => {
          const nascimento = new Date(p.data_nascimento);
          let diffEmMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12;
          diffEmMeses -= nascimento.getMonth();
          diffEmMeses += hoje.getMonth();
          if (diffEmMeses <= 3) ageCounts["0-3 meses"]++;
          else if (diffEmMeses <= 6) ageCounts["4-6 meses"]++;
          else if (diffEmMeses <= 9) ageCounts["7-9 meses"]++;
          else if (diffEmMeses <= 12) ageCounts["10-12 meses"]++;
          else ageCounts["Acima de 12 meses"]++;
        });
        setIdadePacientesData(Object.entries(ageCounts).map(([key, value]) => ({ idade: key, pacientes: value })));

        // 2.3 Evolução Mensal (últimos 6 meses)
        const seisMesesAtras = startOfMonth(subDays(hoje, 30 * 5)); // Aproximadamente 6 meses
        const mesesIntervalo = eachMonthOfInterval({ start: seisMesesAtras, end: startOfMonth(hoje) });
        
        const evolucaoData: MonthlyEvolutionDataPoint[] = mesesIntervalo.map(mesInicio => {
          const mesFim = endOfMonth(mesInicio);
          const medicoesNoMes = todasMedicoes.filter(m => {
            const dataMedicao = parseISO(m.data);
            return dataMedicao >= mesInicio && dataMedicao <= mesFim;
          });
          // Para simplificar, vamos pegar o status da última medição de cada paciente NO MÊS
          const ultimasMedicoesMesMap = new Map<string, Medicao>();
          medicoesNoMes.forEach(m => {
            const medicaoAtual = ultimasMedicoesMesMap.get(m.paciente_id);
            if (!medicaoAtual || new Date(m.data) > new Date(medicaoAtual.data)) {
                ultimasMedicoesMesMap.set(m.paciente_id, m as Medicao);
            }
          });

          const counts: Record<SeverityLevel, number> = { normal: 0, leve: 0, moderada: 0, severa: 0 };
          ultimasMedicoesMesMap.forEach(med => counts[med.status]++);
          
          return {
            mes: format(mesInicio, "MMM/yy", { locale: ptBR }),
            normal: counts.normal,
            leve: counts.leve,
            moderada: counts.moderada,
            severa: counts.severa,
            total: ultimasMedicoesMesMap.size,
          };
        });
        setEvolucaoMensalData(evolucaoData);

        // Alerta de casos graves
        if (evolucaoData.length >= 2) {
          const ultimo = evolucaoData[evolucaoData.length - 1];
          const penultimo = evolucaoData[evolucaoData.length - 2];
          if ((ultimo.moderada + ultimo.severa) > (penultimo.moderada + penultimo.severa)) {
            setAumentoCasosGraves(true);
          }
        }

        // 2.4 Distribuição Geográfica (por cidade, simplificado)
        const cityCounts: Record<string, { pacientes: number; moderada: number; severa: number }> = {};
        todosPacientes.forEach(p => {
            const cidade = p.cidade || "Não informada";
            if (!cityCounts[cidade]) {
                cityCounts[cidade] = { pacientes: 0, moderada: 0, severa: 0 };
            }
            cityCounts[cidade].pacientes++;
            const ultimaMedicaoPaciente = ultimasMedicoesMap.get(p.id);
            if (ultimaMedicaoPaciente) {
                if (ultimaMedicaoPaciente.status === "moderada") cityCounts[cidade].moderada++;
                if (ultimaMedicaoPaciente.status === "severa") cityCounts[cidade].severa++;
            }
        });
        setLocationData(Object.entries(cityCounts).map(([key, value]) => ({ regiao: key, ...value })).slice(0, 10)); // Limitar a 10 cidades

      } catch (error: any) {
        console.error("Erro ao carregar dados dos relatórios:", error);
        toast.error(`Falha ao carregar dados: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [periodoSelecionado, faixaEtariaSelecionada, statusSelecionado]); // Recarregar se filtros mudarem (filtros não implementados no backend ainda)

  const COLORS = Object.values(STATUS_COLORS);

  const exportarGrafico = (tipoGrafico: string) => {
    toast.info(`Funcionalidade de exportar gráfico de ${tipoGrafico} ainda em desenvolvimento.`);
  };
  
  const exportarTodos = () => {
    toast.info("Funcionalidade de exportar todos os dados ainda em desenvolvimento.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
        <p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Relatórios Gerenciais</h2>
          <p className="text-muted-foreground mt-1">
            Insights sobre a saúde craniana dos seus pacientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <span className="font-semibold">Total de pacientes ativos:</span> {totalPacientes}
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="periodo">Período (Filtro Visual)</Label>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado} disabled>
                <SelectTrigger id="periodo">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  {/* Outras opções podem ser adicionadas e implementadas no backend */}
                </SelectContent>
              </Select>
            </div>
            {/* Outros filtros podem ser adicionados aqui e sua lógica implementada no useEffect e queries Supabase */}
            <Button className="bg-turquesa hover:bg-turquesa/90 gap-2" onClick={exportarTodos}>
              <Download className="h-4 w-4" />
              Exportar Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {aumentoCasosGraves && (
        <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/30 flex items-center gap-2">
          <AlertTriangle className="text-destructive h-5 w-5" />
          <p>
            <span className="font-semibold">Alerta:</span> Aumento de casos graves (moderados + severos) detectado no último mês comparado ao anterior.
          </p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status dos Pacientes</CardTitle>
            <CardDescription>
              Distribuição da última medição registrada
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] flex items-center justify-center">
              {statusDistribuicao.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribuicao}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribuicao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<StatusTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground">Sem dados de status.</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico("Status dos Pacientes")}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Distribuição por Faixa Etária</CardTitle>
            <CardDescription>
              Contagem de pacientes por idade
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
            {idadePacientesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idadePacientesData} layout="vertical" margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="idade" type="category" width={100} />
                  <Tooltip formatter={(value: number) => [`${value} pacientes`, "Quantidade"]} />
                  <Bar dataKey="pacientes" fill="#276FBF" name="Pacientes" />
                </BarChart>
              </ResponsiveContainer>
              ) : <p className="text-muted-foreground">Sem dados de faixa etária.</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico("Faixa Etária")}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Evolução Mensal de Status</CardTitle>
            <CardDescription>
              Acompanhamento dos status (últimos 6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
            {evolucaoMensalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoMensalData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normal" stroke={STATUS_COLORS.normal} name="Normal" />
                  <Line type="monotone" dataKey="leve" stroke={STATUS_COLORS.leve} name="Leve" />
                  <Line type="monotone" dataKey="moderada" stroke={STATUS_COLORS.moderada} name="Moderada" />
                  <Line type="monotone" dataKey="severa" stroke={STATUS_COLORS.severa} name="Severa" />
                </LineChart>
              </ResponsiveContainer>
              ) : <p className="text-muted-foreground">Sem dados de evolução mensal.</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico("Evolução Mensal")}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="geografica" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geografica">Distribuição Geográfica (Top 10 Cidades)</TabsTrigger>
          {/* Outras abas podem ser adicionadas com mais relatórios */}
        </TabsList>
        
        <TabsContent value="geografica">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Pacientes por Cidade
                  </CardTitle>
                  <CardDescription>
                    Distribuição de pacientes e casos graves (moderado/severo) por cidade.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportarGrafico("Distribuição Geográfica")}>
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
              {locationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="regiao" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pacientes" stackId="a" fill="#276FBF" name="Total Pacientes" />
                    <Bar dataKey="moderada" stackId="a" fill={STATUS_COLORS.moderada} name="Moderada" />
                    <Bar dataKey="severa" stackId="a" fill={STATUS_COLORS.severa} name="Severa" />
                  </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground">Sem dados de localização para exibir.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

