
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { obterPacientes } from "@/data/mock-data";

// Função para obter os últimos 7 dias em formato DD/MM
const obterUltimosSeteDias = () => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    dias.push({
      data: data,
      formatado: `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`
    });
  }
  return dias;
};

// Função para obter medições realizadas por dia nos últimos 7 dias
const obterDadosGrafico = () => {
  const dias = obterUltimosSeteDias();
  
  return dias.map(dia => {
    // Simular dados com um número aleatório de medições por dia entre 0 e 8
    const medicoesDoDia = Math.floor(Math.random() * 9);
    
    return {
      dia: dia.formatado,
      medicoes: medicoesDoDia
    };
  });
};

interface MedicoesPorDiaChartProps {
  altura?: number;
}

export function MedicoesPorDiaChart({ altura = 350 }: MedicoesPorDiaChartProps) {
  const dados = obterDadosGrafico();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medições Realizadas</CardTitle>
        <CardDescription>
          Medições por dia nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <BarChart data={dados}>
            <XAxis 
              dataKey="dia" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Bar 
              dataKey="medicoes" 
              fill="#276FBF" 
              radius={[4, 4, 0, 0]} 
              name="Medições"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
