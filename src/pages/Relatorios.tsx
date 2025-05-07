
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { obterStatusDistribuicao, obterPacientes, obterMedicoesRecentes } from "@/data/mock-data";
import { Download, FileText } from "lucide-react";

export default function Relatorios() {
  const statusDistribuicao = obterStatusDistribuicao();
  const pacientes = obterPacientes();
  
  const statusData = [
    { name: "Normal", value: statusDistribuicao.normal },
    { name: "Leve", value: statusDistribuicao.leve },
    { name: "Moderada", value: statusDistribuicao.moderada },
    { name: "Severa", value: statusDistribuicao.severa },
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
    { mes: "Jan", normal: 3, leve: 2, moderada: 1, severa: 0 },
    { mes: "Fev", normal: 3, leve: 3, moderada: 1, severa: 0 },
    { mes: "Mar", normal: 4, leve: 3, moderada: 2, severa: 1 },
    { mes: "Abr", normal: 5, leve: 4, moderada: 1, severa: 0 },
    { mes: "Mai", normal: 6, leve: 3, moderada: 0, severa: 1 },
    { mes: "Jun", normal: 7, leve: 2, moderada: 0, severa: 0 },
  ];
  
  const relatoriosRecentes = [
    { id: 1, titulo: "Relatório Mensal - Maio 2024", tipo: "Mensal", data: "31/05/2024" },
    { id: 2, titulo: "Análise Clínica - Casos Severos", tipo: "Análise", data: "25/05/2024" },
    { id: 3, titulo: "Evolução de Pacientes - Q2 2024", tipo: "Trimestral", data: "15/05/2024" },
    { id: 4, titulo: "Relatório Mensal - Abril 2024", tipo: "Mensal", data: "30/04/2024" },
  ];

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
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">No último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-turquesa hover:bg-turquesa/90">
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </Button>
        </div>
      </div>
      
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
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} pacientes`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
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
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pacientes" fill="#276FBF" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
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
                  <Line type="monotone" dataKey="normal" stroke="#2ecc71" name="Normal" />
                  <Line type="monotone" dataKey="leve" stroke="#f1c40f" name="Leve" />
                  <Line type="monotone" dataKey="moderada" stroke="#e67e22" name="Moderada" />
                  <Line type="monotone" dataKey="severa" stroke="#e74c3c" name="Severa" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
