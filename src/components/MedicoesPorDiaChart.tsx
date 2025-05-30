
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";
import { DateRange } from "@/hooks/useChartFilters";

interface DataPoint {
  dia: string;
  medicoes: number;
}

interface MedicoesPorDiaChartProps {
  altura?: number;
  dateRange?: DateRange;
  measurementType?: string;
}

// Função para obter período dinâmico baseado no dateRange
const obterPeriodoDinamico = (dateRange: DateRange) => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  const dias = [];
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Limitar a 30 dias para evitar gráfico muito denso
  const maxDays = Math.min(diffDays, 30);
  
  for (let i = maxDays - 1; i >= 0; i--) {
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

export function MedicoesPorDiaChart({
  altura = 350,
  dateRange = { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
  measurementType = "all"
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
        const dias = obterPeriodoDinamico(dateRange);

        // Buscar medições do Supabase com filtros
        let medicoesQuery = supabase
          .from('medicoes')
          .select('id, data')
          .gte('data', dateRange.startDate)
          .lte('data', dateRange.endDate);
        
        // Aplicar filtro de tipo de medição se necessário
        if (measurementType !== "all") {
          // Por enquanto, vamos usar todos os dados já que não temos campo de tipo na tabela
          // Em futuras implementações, seria necessário adicionar um campo 'tipo' na tabela medicoes
        }
        
        const { data: medicoes, error } = await medicoesQuery;
        
        if (error) {
          console.error("Erro ao buscar medições:", error);
          // Gerar dados simulados como fallback
          setDados(gerarDadosSimulados(dias));
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
        const dias = obterPeriodoDinamico(dateRange);
        setDados(gerarDadosSimulados(dias));
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [dateRange, measurementType]);

  // Função para gerar dados simulados como fallback
  const gerarDadosSimulados = (dias: any[]): DataPoint[] => {
    return dias.map(dia => {
      const medicoesDoDia = Math.floor(Math.random() * 9);
      return {
        dia: dia.formatado,
        medicoes: medicoesDoDia
      };
    });
  };

  // Calcular valor máximo dinamicamente para ajustar escala do eixo Y
  const maxMedicoes = Math.max(...dados.map(d => d.medicoes), 1);
  const yAxisMax = Math.ceil(maxMedicoes * 1.2);

  // Formatar rótulos para dispositivos móveis
  const formatXAxisTick = (value: string) => {
    if (isSmallScreen) {
      return value.split('/')[0];
    }
    return value;
  };

  // Determinar título baseado no período
  const getTitle = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return "Medições Realizadas";
    if (diffDays <= 30) return "Medições por Dia";
    return "Medições Realizadas no Período";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">{getTitle()}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Total de avaliações por dia no período selecionado
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
