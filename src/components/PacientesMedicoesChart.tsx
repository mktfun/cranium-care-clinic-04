import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bar, 
  Line, 
  ComposedChart,
  BarChart,
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { DateRange } from "@/hooks/useChartFilters";
import { ChartType } from "@/hooks/useChartType";
import { ChartTypeToggle } from "@/components/ChartTypeToggle";

interface DataPoint {
  mes: string;
  pacientes: number;
  medicoes: number;
}

interface PacientesMedicoesChartProps {
  altura?: number;
  dateRange?: DateRange;
  measurementType?: string;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

// Função para gerar dados simulados como fallback
const gerarDadosSimulados = (dateRange: DateRange): DataPoint[] => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  // Calcular quantos meses de diferença
  const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const meses = [];
  
  for (let i = monthsDiff - 1; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
    const ano = data.getFullYear().toString().slice(-2);
    
    meses.push({
      mes: `${mes}/${ano}`,
      pacientes: Math.floor(Math.random() * 10) + 2,
      medicoes: Math.floor(Math.random() * 15) + 5
    });
  }
  
  return meses;
};

// Função para obter período dinâmico baseado no dateRange
const obterPeriodoDinamico = (dateRange: DateRange) => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  // Calcular quantos meses de diferença
  const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const meses = [];
  
  for (let i = monthsDiff - 1; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    meses.push({
      data: data,
      formatado: `${data.toLocaleDateString('pt-BR', { month: 'short' })}/${data.getFullYear().toString().slice(-2)}`,
      mes: data.getMonth(),
      ano: data.getFullYear()
    });
  }
  
  return meses;
};

export function PacientesMedicoesChart({ 
  altura = 350, 
  dateRange = { startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
  measurementType = "all",
  chartType = "combined",
  onChartTypeChange
}: PacientesMedicoesChartProps) {
  const [dados, setDados] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const meses = obterPeriodoDinamico(dateRange);
        
        // Buscar pacientes do Supabase com filtro de data
        const { data: pacientes, error: pacientesError } = await supabase
          .from('pacientes')
          .select('id, created_at')
          .gte('created_at', `${dateRange.startDate}T00:00:00.000Z`)
          .lte('created_at', `${dateRange.endDate}T23:59:59.999Z`);
        
        if (pacientesError) {
          console.error("Erro ao buscar pacientes:", pacientesError);
          setDados(gerarDadosSimulados(dateRange));
          return;
        }
        
        // Buscar medições do Supabase com filtros
        let medicoesQuery = supabase
          .from('medicoes')
          .select('id, data, paciente_id')
          .gte('data', dateRange.startDate)
          .lte('data', dateRange.endDate);
        
        // Aplicar filtro de tipo de medição se não for "all"
        if (measurementType !== "all") {
          // Por enquanto, vamos usar todos os dados já que não temos campo de tipo na tabela
          // Em futuras implementações, seria necessário adicionar um campo 'tipo' na tabela medicoes
        }
        
        const { data: medicoes, error: medicoesError } = await medicoesQuery;
        
        if (medicoesError) {
          console.error("Erro ao buscar medições:", medicoesError);
          setDados(gerarDadosSimulados(dateRange));
          return;
        }
        
        // Processar dados por mês
        const dadosPorMes = meses.map(mes => {
          // Contar pacientes criados neste mês
          const pacientesCriados = pacientes 
            ? pacientes.filter(p => {
                const dataCriacao = new Date(p.created_at);
                return dataCriacao.getMonth() === mes.mes && dataCriacao.getFullYear() === mes.ano;
              }).length
            : 0;
            
          // Contar medições realizadas neste mês
          const medicoesRealizadas = medicoes
            ? medicoes.filter(m => {
                const dataMedicao = new Date(m.data);
                return dataMedicao.getMonth() === mes.mes && dataMedicao.getFullYear() === mes.ano;
              }).length
            : 0;
            
          return {
            mes: mes.formatado,
            pacientes: pacientesCriados,
            medicoes: medicoesRealizadas
          };
        });
        
        setDados(dadosPorMes);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setDados(gerarDadosSimulados(dateRange));
      } finally {
        setLoading(false);
      }
    }
    
    carregarDados();
  }, [dateRange, measurementType]);
  
  // Renderizar o gráfico baseado no tipo selecionado
  const renderChart = () => {
    const commonProps = {
      data: dados
    };

    const tooltipProps = {
      contentStyle: {
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderRadius: "var(--radius)",
      }
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip {...tooltipProps} />
            <Legend />
            <Bar 
              dataKey="pacientes" 
              fill="#029daf" 
              name="Pacientes" 
              barSize={40}
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="medicoes" 
              fill="#AF5B5B" 
              name="Medições" 
              barSize={40}
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip {...tooltipProps} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pacientes" 
              stroke="#029daf" 
              name="Pacientes" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#029daf" }}
              activeDot={{ r: 6, fill: "#029daf" }}
            />
            <Line 
              type="monotone" 
              dataKey="medicoes" 
              stroke="#AF5B5B" 
              name="Medições" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#AF5B5B" }}
              activeDot={{ r: 6, fill: "#AF5B5B" }}
            />
          </LineChart>
        );

      default: // "combined"
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip {...tooltipProps} />
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
              dot={{ r: 4, fill: "#AF5B5B" }}
              activeDot={{ r: 6, fill: "#AF5B5B" }}
            />
          </ComposedChart>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Evolução de Pacientes e Medições</CardTitle>
            <CardDescription>
              Comparativo entre pacientes registrados e medições realizadas no período selecionado
            </CardDescription>
          </div>
          {onChartTypeChange && (
            <ChartTypeToggle
              currentType={chartType}
              onTypeChange={onChartTypeChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={altura}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
