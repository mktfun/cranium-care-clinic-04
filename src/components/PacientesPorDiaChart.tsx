import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ChartDataPoint {
  dia: string;
  pacientes: number;
}

// Função para obter os últimos 7 dias em formato DD/MM
const obterUltimosSeteDiasFormatados = () => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    dias.push({
      dataISO: data.toISOString().split('T')[0], // YYYY-MM-DD para comparação
      formatado: `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`
    });
  }
  return dias;
};

interface PacientesPorDiaChartProps {
  altura?: number;
}

export function PacientesPorDiaChart({ altura = 350 }: PacientesPorDiaChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPacientesPorDia() {
      setLoading(true);
      try {
        const diasReferencia = obterUltimosSeteDiasFormatados();
        const dataInicioPeriodo = diasReferencia[0].dataISO; // Primeiro dia do período de 7 dias
        const dataFimPeriodo = diasReferencia[diasReferencia.length - 1].dataISO; // Último dia do período de 7 dias

        const { data: pacientesRegistrados, error } = await supabase
          .from('pacientes')
          .select('id, created_at')
          .gte('created_at', `${dataInicioPeriodo}T00:00:00.000Z`) // Inclui todo o primeiro dia
          .lte('created_at', `${dataFimPeriodo}T23:59:59.999Z`); // Inclui todo o último dia

        if (error) {
          console.error("Erro ao buscar pacientes registrados:", error);
          setChartData(diasReferencia.map(dia => ({ dia: dia.formatado, pacientes: 0 }))); // Retorna zerado em caso de erro
          return;
        }

        const contagemPorDia: { [key: string]: number } = {};
        diasReferencia.forEach(dia => {
          contagemPorDia[dia.dataISO] = 0;
        });

        if (pacientesRegistrados) {
          pacientesRegistrados.forEach(paciente => {
            const dataRegistro = paciente.created_at.split('T')[0]; // YYYY-MM-DD
            if (contagemPorDia.hasOwnProperty(dataRegistro)) {
              contagemPorDia[dataRegistro]++;
            }
          });
        }

        const dadosFinaisGrafico = diasReferencia.map(dia => ({
          dia: dia.formatado,
          pacientes: contagemPorDia[dia.dataISO] || 0
        }));

        setChartData(dadosFinaisGrafico);

      } catch (err) {
        console.error("Erro ao processar dados do gráfico de pacientes por dia:", err);
        // Em caso de erro, preenche com zeros para manter a estrutura do gráfico
        const diasFormatados = obterUltimosSeteDiasFormatados();
        setChartData(diasFormatados.map(dia => ({ dia: dia.formatado, pacientes: 0 })));
      } finally {
        setLoading(false);
      }
    }

    fetchPacientesPorDia();
  }, []);
  
  if (loading) {
    return (
      <Card className="flex flex-col justify-center items-center" style={{ height: altura + 80 }}> {/* +80 para header/padding */}
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-2">Carregando dados...</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes Registrados</CardTitle>
        <CardDescription>
          Novos pacientes por dia nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
              allowDecimals={false} // Garante que apenas inteiros sejam mostrados no eixo Y
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.5rem', backdropFilter: 'blur(5px)' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Bar 
              dataKey="pacientes" 
              fill="#029daf" 
              radius={[4, 4, 0, 0]} 
              name="Novos Pacientes"
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

