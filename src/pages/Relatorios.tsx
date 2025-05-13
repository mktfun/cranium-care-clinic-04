
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
  ReferenceLine,
} from "recharts";
import { obterStatusDistribuicao, obterPacientes, obterMedicoesRecentes } from "@/data/mock-data";
import { Download, FileText, Filter, Map, TrendingUp, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const STATUS_COLORS = {
  "normal": "#10b981", // Verde mais forte para melhor contraste
  "leve": "#f59e0b",   // Amarelo/Laranja mais forte
  "moderada": "#f97316", // Laranja mais forte
  "severa": "#ef4444",  // Vermelho mais forte
};

const LOCATION_DATA = [
  { regiao: "Centro", pacientes: 12, moderada: 3, severa: 1 },
  { regiao: "Norte", pacientes: 8, moderada: 2, severa: 0 },
  { regiao: "Sul", pacientes: 10, moderada: 1, severa: 1 },
  { regiao: "Leste", pacientes: 7, moderada: 0, severa: 0 },
  { regiao: "Oeste", pacientes: 5, moderada: 1, severa: 2 },
];

// Componente de tooltip customizado para os status
const StatusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const status = payload[0].name;
    const value = payload[0].value;
    
    const statusDescriptions: Record<string, string> = {
      "Normal": "Sem sinais de pressão intracraniana elevada",
      "Leve": "Sinais leves de pressão elevada, requer monitoramento",
      "Moderada": "Pressão elevada significativa, necessita intervenção",
      "Severa": "Condição crítica, requer intervenção imediata"
    };
    
    return (
      <div className="bg-background p-3 border rounded-md shadow-md">
        <p className="font-medium">{`${status}: ${value} pacientes`}</p>
        <p className="text-sm text-muted-foreground mt-1">{statusDescriptions[status]}</p>
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  const statusDistribuicao = obterStatusDistribuicao();
  const pacientes = obterPacientes();
  const totalPacientes = pacientes.length;
  const [periodoSelecionado, setPeriodoSelecionado] = useState("30");
  const [faixaEtariaSelecionada, setFaixaEtariaSelecionada] = useState("todas");
  const [statusSelecionado, setStatusSelecionado] = useState("todos");
  const [compararPeriodos, setCompararPeriodos] = useState(false);
  
  const statusData = [
    { name: "Normal", value: statusDistribuicao.normal, description: "Sem sinais de pressão intracraniana elevada" },
    { name: "Leve", value: statusDistribuicao.leve, description: "Sinais leves de pressão elevada" },
    { name: "Moderada", value: statusDistribuicao.moderada, description: "Pressão elevada significativa" },
    { name: "Severa", value: statusDistribuicao.severa, description: "Condição crítica" },
  ];
  
  const COLORS = Object.values(STATUS_COLORS);
  
  const idadePacientesData = [
    { idade: "0-3 meses", pacientes: pacientes.filter(p => p.idadeEmMeses <= 3).length },
    { idade: "4-6 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 3 && p.idadeEmMeses <= 6).length },
    { idade: "7-9 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 6 && p.idadeEmMeses <= 9).length },
    { idade: "10-12 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 9 && p.idadeEmMeses <= 12).length },
    { idade: "Acima de 12 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 12).length },
  ];
  
  const evolucaoMensalData = [
    { mes: "Jan", normal: 3, leve: 2, moderada: 1, severa: 0, total: 6 },
    { mes: "Fev", normal: 3, leve: 3, moderada: 1, severa: 0, total: 7 },
    { mes: "Mar", normal: 4, leve: 3, moderada: 2, severa: 1, total: 10 },
    { mes: "Abr", normal: 5, leve: 4, moderada: 1, severa: 0, total: 10 },
    { mes: "Mai", normal: 6, leve: 3, moderada: 0, severa: 1, total: 10 },
    { mes: "Jun", normal: 7, leve: 2, moderada: 0, severa: 0, total: 9 },
  ];
  
  // Dados para tendência de casos graves
  const tendenciaCasosGravesData = evolucaoMensalData.map(item => ({
    mes: item.mes,
    "Casos Graves": item.moderada + item.severa,
    "% do Total": ((item.moderada + item.severa) / item.total * 100).toFixed(1)
  }));
  
  const relatoriosRecentes = [
    { id: 1, titulo: "Relatório Mensal - Maio 2024", tipo: "Mensal", data: "31/05/2024" },
    { id: 2, titulo: "Análise Clínica - Casos Severos", tipo: "Análise", data: "25/05/2024" },
    { id: 3, titulo: "Evolução de Pacientes - Q2 2024", tipo: "Trimestral", data: "15/05/2024" },
    { id: 4, titulo: "Relatório Mensal - Abril 2024", tipo: "Mensal", data: "30/04/2024" },
  ];
  
  // Alerta para aumento de casos graves
  const ultimoMes = evolucaoMensalData[evolucaoMensalData.length - 1];
  const penultimoMes = evolucaoMensalData[evolucaoMensalData.length - 2];
  const aumentoCasosGraves = 
    (ultimoMes.moderada + ultimoMes.severa) > (penultimoMes.moderada + penultimoMes.severa);

  const exportarGrafico = (tipoGrafico: string) => {
    toast.success(`Gráfico de ${tipoGrafico} exportado com sucesso!`);
  };
  
  const exportarTodos = () => {
    toast.success("Todos os dados exportados com sucesso!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground mt-1">
            Visualize e exporte relatórios sobre seus pacientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <span className="font-semibold">Total de pacientes:</span> {totalPacientes}
          </Badge>
        </div>
      </div>
      
      {/* Filtros aprimorados */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger id="periodo">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">No último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="faixa-etaria">Faixa Etária</Label>
              <Select value={faixaEtariaSelecionada} onValueChange={setFaixaEtariaSelecionada}>
                <SelectTrigger id="faixa-etaria">
                  <SelectValue placeholder="Faixa Etária" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as idades</SelectItem>
                  <SelectItem value="0-3">0-3 meses</SelectItem>
                  <SelectItem value="4-6">4-6 meses</SelectItem>
                  <SelectItem value="7-12">7-12 meses</SelectItem>
                  <SelectItem value=">12">Acima de 12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={statusSelecionado} onValueChange={setStatusSelecionado}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="severa">Severa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="bg-accent hover:bg-accent/90 gap-2">
              <Filter className="h-4 w-4" />
              Aplicar Filtros
            </Button>
            
            <Button 
              variant={compararPeriodos ? "secondary" : "outline"} 
              onClick={() => setCompararPeriodos(!compararPeriodos)}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Comparar Períodos
            </Button>
            
            <Button className="bg-turquesa hover:bg-turquesa/90 gap-2" onClick={exportarTodos}>
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {aumentoCasosGraves && (
        <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/30 flex items-center gap-2">
          <AlertTriangle className="text-destructive h-5 w-5" />
          <p>
            <span className="font-semibold">Alerta:</span> Aumento de casos graves detectado no último período. 
            Recomenda-se análise detalhada.
          </p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status dos Pacientes</CardTitle>
            <CardDescription>
              Distribuição de status na última medição
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico('Status')}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Faixa Etária</CardTitle>
            <CardDescription>
              Pacientes por idade em meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idadePacientesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="idade" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} pacientes`, 'Quantidade']} />
                  <Legend />
                  <Bar dataKey="pacientes" fill="#276FBF" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico('Faixa Etária')}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Acompanhamento de status por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[240px]">
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportarGrafico('Evolução Mensal')}>
              <Download className="h-3 w-3 mr-1" /> PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="geografica" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geografica">Distribuição Geográfica</TabsTrigger>
          <TabsTrigger value="tendencia">Tendência Casos Graves</TabsTrigger>
          <TabsTrigger value="resumo">Resumo Mensal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geografica">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Distribuição Geográfica
                  </CardTitle>
                  <CardDescription>
                    Análise regional dos pacientes e status de saúde
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportarGrafico('Distribuição Geográfica')}>
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LOCATION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="regiao" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pacientes" fill="#276FBF" name="Total Pacientes" />
                    <Bar dataKey="moderada" fill={STATUS_COLORS.moderada} name="Moderada" />
                    <Bar dataKey="severa" fill={STATUS_COLORS.severa} name="Severa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendência de Casos Graves
                  </CardTitle>
                  <CardDescription>
                    Evolução de casos moderados e severos ao longo do tempo
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportarGrafico('Tendência de Casos Graves')}>
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tendenciaCasosGravesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Casos Graves" 
                      stroke={STATUS_COLORS.severa} 
                      strokeWidth={2} 
                      yAxisId="left" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="% do Total" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      yAxisId="right" 
                    />
                    <ReferenceLine 
                      y={2} 
                      yAxisId="left"
                      label="Limite de alerta" 
                      stroke={STATUS_COLORS.moderada} 
                      strokeDasharray="3 3" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resumo">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resumo de Indicadores - Maio 2024</CardTitle>
                  <CardDescription>
                    Principais métricas do mês atual
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportarGrafico('Resumo Mensal')}>
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                  <p className="text-2xl font-bold">{totalPacientes}</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Idade Média</p>
                  <p className="text-2xl font-bold">7.3 meses</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Casos Normais</p>
                  <p className="text-2xl font-bold">{statusDistribuicao.normal}</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Casos Leves</p>
                  <p className="text-2xl font-bold">{statusDistribuicao.leve}</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Casos Moderados</p>
                  <p className="text-2xl font-bold">{statusDistribuicao.moderada}</p>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Casos Severos</p>
                  <p className="text-2xl font-bold">{statusDistribuicao.severa}</p>
                </div>
                <div className="border rounded-md p-4 sm:col-span-2 md:col-span-3 bg-muted/30">
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {aumentoCasosGraves 
                      ? "Aumento de casos graves em comparação ao mês anterior. Recomenda-se investigação adicional." 
                      : "Estabilidade ou redução nos casos graves em comparação ao mês anterior."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>
            Relatórios gerados automaticamente para análise clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {relatoriosRecentes.map((relatorio) => (
                <div key={relatorio.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-muted">
                      <FileText className="h-6 w-6 text-turquesa" />
                    </div>
                    <div>
                      <p className="font-medium">{relatorio.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {relatorio.tipo} • Gerado em {relatorio.data}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Ver todos os relatórios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
