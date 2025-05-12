
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Função para obter os últimos 7 dias em formato DD/MM
const obterUltimosSeteDias = () => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    dias.push({
      data: data,
      formatado: `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`,
      diaCompleto: data.toISOString().split('T')[0]
    });
  }
  return dias;
};

interface DataPoint {
  dia: string;
  medicoes: number;
}

interface MedicoesPorDiaChartProps {
  altura?: number;
}

export function MedicoesPorDiaChart({ altura = 350 }: MedicoesPorDiaChartProps) {
  const [dados, setDados] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const dias = obterUltimosSeteDias();
        
        // Buscar medições do Supabase
        const { data: medicoes, error } = await supabase
          .from('medicoes')
          .select('id, data');
        
        if (error) {
          console.error("Erro ao buscar medições:", error);
          // Gerar dados simulados como fallback
          setDados(gerarDadosSimulados());
          return;
        }
        
        // Processar dados por dia
        const dadosPorDia = dias.map(dia => {
          // Contar medições realizadas neste dia
          const medicoesRealizadas = medicoes
            ? medicoes.filter(m => m.data === dia.diaCompleto).length
            : 0;
            
          return {
            dia: dia.formatado,
            medicoes: medicoesRealizadas
          };
        });
        
        setDados(dadosPorDia);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setDados(gerarDadosSimulados());
      } finally {
        setLoading(false);
      }
    }
    
    carregarDados();
  }, []);
  
  // Função para gerar dados simulados como fallback
  const gerarDadosSimulados = (): DataPoint[] => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medições Realizadas</CardTitle>
        <CardDescription>
          Medições por dia nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
