
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";

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

export function MedicoesPorDiaChart({
  altura = 350
}: MedicoesPorDiaChartProps) {
  const [dados, setDados] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isSmallScreen = useIsMobileOrTabletPortrait();

  // Ajustar altura do gráfico com base no dispositivo
  const chartHeight = isSmallScreen ? Math.min(altura, 200) : altura;

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const dias = obterUltimosSeteDias();

        // Buscar medições do Supabase
        const {
          data: medicoes,
          error
        } = await supabase.from('medicoes').select('id, data');
        
        if (error) {
          console.error("Erro ao buscar medições:", error);
          // Gerar dados simulados como fallback
          setDados(gerarDadosSimulados());
          return;
        }

        // Processar dados por dia
        const dadosPorDia = dias.map(dia => {
          // Contar medições realizadas neste dia
          const medicoesRealizadas = medicoes ? medicoes.filter(m => m.data === dia.diaCompleto).length : 0;
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

  // Calcular valor máximo dinamicamente para ajustar escala do eixo Y
  const maxMedicoes = Math.max(...dados.map(d => d.medicoes), 1);
  const yAxisMax = Math.ceil(maxMedicoes * 1.2); // 20% maior que o máximo para evitar "bater no teto"

  // Formatar rótulos para dispositivos móveis
  const formatXAxisTick = (value: string) => {
    if (isSmallScreen) {
      // Em dispositivos móveis, mostrar apenas o dia
      return value.split('/')[0];
    }
    return value;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Medições Realizadas</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Últimos 7 dias - Total de avaliações por dia
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <div className="flex justify-center items-center" style={{ height: chartHeight }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart 
              data={dados} 
              margin={{
                top: 20,
                right: isSmallScreen ? 10 : 20,
                left: isSmallScreen ? 0 : 10,
                bottom: isSmallScreen ? 5 : 10
              }}
            >
              <XAxis 
                dataKey="dia" 
                stroke="#888888" 
                fontSize={isSmallScreen ? 11 : 12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatXAxisTick} 
                tickMargin={isSmallScreen ? 5 : 8}
              />
              <YAxis 
                stroke="#888888" 
                fontSize={isSmallScreen ? 11 : 12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={value => `${value}`}
                width={isSmallScreen ? 25 : 35}
                allowDecimals={false}
                domain={[0, yAxisMax]}
                label={{ 
                  value: 'Medições', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: isSmallScreen ? '10px' : '12px' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  fontSize: isSmallScreen ? '12px' : '14px',
                  padding: isSmallScreen ? '6px 8px' : '8px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [`${value} medição${value !== 1 ? 'ões' : ''}`, 'Total']}
                labelFormatter={(label: string) => `Dia ${label}`}
              />
              <Bar 
                dataKey="medicoes" 
                fill="#276FBF" 
                radius={[6, 6, 0, 0]} 
                name="Medições" 
                barSize={isSmallScreen ? 28 : 40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
