
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  TooltipProps,
} from "recharts";
import { obterStatusDistribuicao, obterPacientes, obterMedicoesRecentes } from "@/data/mock-data";
import { 
  ArrowUpRight, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Map, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusTooltip } from "@/components/StatusTooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

export default function Relatorios() {
  const statusDistribuicao = obterStatusDistribuicao();
  const pacientes = obterPacientes();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedTab, setSelectedTab] = useState("visaogeral");
  
  const totalPacientes = pacientes.length;
  const pacientesGraves = statusDistribuicao.moderada + statusDistribuicao.severa;
  const percentualGraves = Math.round((pacientesGraves / totalPacientes) * 100);
  const aumentoGraves = percentualGraves > 15; // Threshold for alert
  
  const statusData = [
    { name: "Normal", value: statusDistribuicao.normal, color: "#2ecc71" },
    { name: "Leve", value: statusDistribuicao.leve, color: "#f1c40f" },
    { name: "Moderada", value: statusDistribuicao.moderada, color: "#e67e22" },
    { name: "Severa", value: statusDistribuicao.severa, color: "#e74c3c" }
  ];
  
  const COLORS = ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c"];
  
  const idadePacientesData = [
    { idade: "0-3 meses", pacientes: pacientes.filter(p => p.idadeEmMeses <= 3).length },
    { idade: "4-6 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 3 && p.idadeEmMeses <= 6).length },
    { idade: "7-9 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 6 && p.idadeEmMeses <= 9).length },
    { idade: "10-12 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 9 && p.idadeEmMeses <= 12).length },
    { idade: "Acima de 12 meses", pacientes: pacientes.filter(p => p.idadeEmMeses > 12).length },
  ];
  
  const evolucaoMensalData = [
    { mes: "Jan", normal: 3, leve: 2, moderada: 1, severa: 0, casosGraves: 1 },
    { mes: "Fev", normal: 3, leve: 3, moderada: 1, severa: 0, casosGraves: 1 },
    { mes: "Mar", normal: 4, leve: 3, moderada: 2, severa: 1, casosGraves: 3 },
    { mes: "Abr", normal: 5, leve: 4, moderada: 1, severa: 0, casosGraves: 1 },
    { mes: "Mai", normal: 6, leve: 3, moderada: 0, severa: 1, casosGraves: 1 },
    { mes: "Jun", normal: 7, leve: 2, moderada: 0, severa: 0, casosGraves: 0 },
  ];
  
  const regiaoData = [
    { regiao: "Zona Sul", pacientes: 8, normal: 5, leve: 2, moderada: 1, severa: 0 },
    { regiao: "Zona Norte", pacientes: 12, normal: 6, leve: 4, moderada: 1, severa: 1 },
    { regiao: "Zona Leste", pacientes: 7, normal: 3, leve: 2, moderada: 2, severa: 0 },
    { regiao: "Zona Oeste", pacientes: 9, normal: 4, leve: 3, moderada: 1, severa: 1 },
    { regiao: "Centro", pacientes: 5, normal: 2, leve: 2, moderada: 0, severa: 1 },
  ];
  
  const casosSeverosData = [
    { mes: "Jan", casos: 1, previsto: null },
    { mes: "Fev", casos: 1, previsto: null },
    { mes: "Mar", casos: 3, previsto: null },
    { mes: "Abr", casos: 1, previsto: null },
    { mes: "Mai", casos: 1, previsto: null }, 
    { mes: "Jun", casos: 0, previsto: null },
    { mes: "Jul", casos: null, previsto: 1 },
    { mes: "Ago", casos: null, previsto: 2 },
  ];
  
  const relatoriosRecentes = [
    { id: 1, titulo: "Relatório Mensal - Maio 2024", tipo: "Mensal", data: "31/05/2024" },
    { id: 2, titulo: "Análise Clínica - Casos Severos", tipo: "Análise", data: "25/05/2024" },
    { id: 3, titulo: "Evolução de Pacientes - Q2 2024", tipo: "Trimestral", data: "15/05/2024" },
    { id: 4, titulo: "Relatório Mensal - Abril 2024", tipo: "Mensal", data: "30/04/2024" },
  ];
  
  const indicadoresResumo = [
    { titulo: "Total de Pacientes", valor: totalPacientes, icone: "Pacientes" },
    { titulo: "Medições Realizadas", valor: pacientes.reduce((sum, p) => sum + p.medicoes.length, 0), icone: "Medições" },
    { titulo: "Média de Idade", valor: `${Math.round(pacientes.reduce((sum, p) => sum + p.idadeEmMeses, 0) / totalPacientes)} meses`, icone: "Idade" },
    { titulo: "Casos Graves", valor: pacientesGraves, destaque: aumentoGraves, icone: "Graves" },
  ];

  const formatStatusName = (name: string) => {
    switch (name) {
      case "Normal": return <span className="text-green-600 dark:text-green-400 font-medium">{name}</span>;
      case "Leve": return <span className="text-yellow-600 dark:text-yellow-400 font-medium">{name}</span>;
      case "Moderada": return <span className="text-orange-600 dark:text-orange-400 font-medium">{name}</span>;
      case "Severa": return <span className="text-red-600 dark:text-red-400 font-medium">{name}</span>;
      default: return name;
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              Visualize e exporte relatórios sobre seus pacientes
            </p>
            <Badge variant="outline" className="bg-background">
              <Calendar className="h-3 w-3 mr-1" /> {selectedPeriod} dias
            </Badge>
            {aumentoGraves && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> Aumento de casos graves
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Período</h4>
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">No último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Faixa Etária</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as idades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as idades</SelectItem>
                      <SelectItem value="0-3">0-3 meses</SelectItem>
                      <SelectItem value="4-6">4-6 meses</SelectItem>
                      <SelectItem value="7-9">7-9 meses</SelectItem>
                      <SelectItem value="10-12">10-12 meses</SelectItem>
                      <SelectItem value="12+">Acima de 12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="severa">Severa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Comparar Períodos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Comparar Períodos</AlertDialogTitle>
                <AlertDialogDescription>
                  Compare dados entre dois períodos distintos para uma análise mais detalhada
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Período 1</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Janeiro</SelectItem>
                        <SelectItem value="2">Fevereiro</SelectItem>
                        <SelectItem value="3">Março</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Período 2</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Janeiro</SelectItem>
                        <SelectItem value="2">Fevereiro</SelectItem>
                        <SelectItem value="3">Março</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Comparar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button className="bg-turquesa hover:bg-turquesa/90">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="grid gap-1">
                  <Button variant="ghost" size="sm" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" /> Exportar PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar Excel
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Download className="h-4 w-4 mr-2" /> Exportar CSV
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {/* Indicadores de Resumo */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {indicadoresResumo.map((indicador, index) => (
          <Card key={index} className={indicador.destaque ? "border-destructive" : ""}>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">{indicador.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={`text-2xl font-bold ${indicador.destaque ? "text-destructive" : ""}`}>
                {indicador.valor}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="visaogeral" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="visaogeral">Visão Geral</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="demograficos">Demográficos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visaogeral" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Status dos Pacientes</CardTitle>
                  <StatusTooltip />
                </div>
                <CardDescription className="flex items-center justify-between">
                  <span>Distribuição de status na última medição</span>
                  <Badge variant="outline">{totalPacientes} pacientes</Badge>
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
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke={entry.color === "#e74c3c" || entry.color === "#e67e22" ? "rgba(0,0,0,0.1)" : undefined}
                            strokeWidth={entry.color === "#e74c3c" || entry.color === "#e67e22" ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value) => formatStatusName(value.toString())}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => [
                          `${value} pacientes (${((value as number) / totalPacientes * 100).toFixed(0)}%)`, 
                          formatStatusName(name.toString())
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto flex items-center text-xs">
                  Mais detalhes <ArrowUpRight className="ml-1 h-3 w-3" />
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
                      <RechartsTooltip 
                        formatter={(value) => [`${value} pacientes`, 'Quantidade']}
                      />
                      <Legend />
                      <Bar dataKey="pacientes" fill="#276FBF" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto flex items-center text-xs">
                  Mais detalhes <ArrowUpRight className="ml-1 h-3 w-3" />
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
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="normal" stroke="#2ecc71" name="Normal" strokeWidth={2} />
                      <Line type="monotone" dataKey="leve" stroke="#f1c40f" name="Leve" strokeWidth={2} />
                      <Line type="monotone" dataKey="moderada" stroke="#e67e22" name="Moderada" strokeWidth={2} />
                      <Line type="monotone" dataKey="severa" stroke="#e74c3c" name="Severa" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto flex items-center text-xs">
                  Mais detalhes <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tendencias" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tendência de Casos Graves</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>
                  Evolução de casos moderados e severos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={casosSeverosData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="casos" 
                        stroke="#e74c3c" 
                        name="Casos Graves" 
                        strokeWidth={2}
                        dot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="previsto" 
                        stroke="#e74c3c" 
                        name="Previsão" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, strokeWidth: 2, stroke: "#e74c3c", fill: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <p>A previsão é baseada nos dados históricos dos últimos 6 meses</p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Distribuição Geográfica</CardTitle>
                  <Map className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>
                  Distribuição de pacientes por região
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regiaoData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="regiao" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="normal" name="Normal" stackId="a" fill="#2ecc71" />
                      <Bar dataKey="leve" name="Leve" stackId="a" fill="#f1c40f" />
                      <Bar dataKey="moderada" name="Moderada" stackId="a" fill="#e67e22" />
                      <Bar dataKey="severa" name="Severa" stackId="a" fill="#e74c3c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <p>Baseado no endereço registrado do paciente</p>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências Mensais</CardTitle>
              <CardDescription>
                Evolução comparativa de indicadores-chave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoMensalData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="normal" 
                      stroke="#2ecc71" 
                      name="Normal" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leve" 
                      stroke="#f1c40f" 
                      name="Leve" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="casosGraves" 
                      stroke="#e74c3c" 
                      name="Casos Graves" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demograficos">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Demográfico</CardTitle>
              <CardDescription>
                Distribuição por região, idade e status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Distribuição Regional</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={regiaoData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="pacientes"
                          nameKey="regiao"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {regiaoData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                "#3498db", "#9b59b6", "#1abc9c", "#e67e22", "#f1c40f"
                              ][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip 
                          formatter={(value) => [`${value} pacientes`, 'Quantidade']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Distribuição por Idade</h3>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={idadePacientesData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="idade" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="pacientes" fill="#276FBF" name="Pacientes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Distribuição por Status</h3>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Relatórios gerados automaticamente para análise clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatoriosRecentes.map((relatorio) => (
                  <div key={relatorio.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
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
                        <PieChartIcon className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Relatórios Anteriores</Button>
              <Button>Gerar Novo Relatório</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
