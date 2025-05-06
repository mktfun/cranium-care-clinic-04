
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bar, 
  Line, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { obterPacientes } from "@/data/mock-data";

// Função para obter os últimos 6 meses em formato MMM/YY
const obterUltimosSeisMeses = () => {
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
    const ano = data.getFullYear().toString().slice(-2);
    meses.push({
      data: data,
      formatado: `${mes}/${ano}`
    });
  }
  return meses;
};

// Função para obter dados simulados de pacientes e medições
const obterDadosGrafico = () => {
  const meses = obterUltimosSeisMeses();
  
  return meses.map(mes => {
    // Simular dados com números aleatórios de pacientes e medições
    const pacientes = Math.floor(Math.random() * 10) + 2;
    const medicoes = Math.floor(Math.random() * 15) + 5; // Geralmente mais medições que pacientes
    
    return {
      mes: mes.formatado,
      pacientes: pacientes,
      medicoes: medicoes
    };
  });
};

interface PacientesMedicoesChartProps {
  altura?: number;
}

export function PacientesMedicoesChart({ altura = 350 }: PacientesMedicoesChartProps) {
  const dados = obterDadosGrafico();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Pacientes e Medições</CardTitle>
        <CardDescription>
          Comparativo entre pacientes registrados e medições realizadas nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <ComposedChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="pacientes" 
              fill="#029daf" 
              name="Pacientes" 
              barSize={40}
              radius={[4, 4, 0, 0]} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="medicoes" 
              stroke="#AF5B5B" 
              name="Medições" 
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
