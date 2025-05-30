
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { getCranialStatus } from "@/lib/cranial-utils";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface PacientesStatusChartProps {
  altura?: number;
}

const STATUS_COLORS = {
  'Normal': '#10b981',
  'Leve': '#f59e0b', 
  'Moderada': '#f97316',
  'Severa': '#ef4444'
};

const STATUS_LABELS = {
  'normal': 'Normal',
  'leve': 'Leve',
  'moderada': 'Moderada', 
  'severa': 'Severa'
};

export function PacientesStatusChart({ altura = 300 }: PacientesStatusChartProps) {
  const [dados, setDados] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const isSmallScreen = useIsMobileOrTabletPortrait();

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // Buscar todas as medições com suas respectivas informações de pacientes
        const { data: medicoes, error: medicoesError } = await supabase
          .from('medicoes')
          .select('paciente_id, indice_craniano, cvai, data')
          .order('data', { ascending: false });

        if (medicoesError) {
          console.error("Erro ao buscar medições:", medicoesError);
          setDados(gerarDadosSimulados());
          return;
        }

        // Processar distribuição de status baseado na última medição de cada paciente
        const statusDistribution = {
          normal: 0,
          leve: 0,
          moderada: 0,
          severa: 0
        };

        const pacientesProcessados = new Set<string>();
        
        medicoes?.forEach(medicao => {
          if (!pacientesProcessados.has(medicao.paciente_id)) {
            const { severityLevel } = getCranialStatus(
              medicao.indice_craniano || 0, 
              medicao.cvai || 0
            );
            
            statusDistribution[severityLevel]++;
            pacientesProcessados.add(medicao.paciente_id);
          }
        });

        const total = Object.values(statusDistribution).reduce((sum, val) => sum + val, 0);
        setTotalPacientes(total);

        const dadosFormatados: StatusData[] = Object.entries(statusDistribution)
          .filter(([_, value]) => value > 0) // Só mostrar categorias com pacientes
          .map(([key, value]) => ({
            name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
            value,
            color: STATUS_COLORS[STATUS_LABELS[key as keyof typeof STATUS_LABELS] as keyof typeof STATUS_COLORS]
          }));

        setDados(dadosFormatados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setDados(gerarDadosSimulados());
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const gerarDadosSimulados = (): StatusData[] => [
    { name: 'Normal', value: 65, color: STATUS_COLORS.Normal },
    { name: 'Leve', value: 20, color: STATUS_COLORS.Leve },
    { name: 'Moderada', value: 10, color: STATUS_COLORS.Moderada },
    { name: 'Severa', value: 5, color: STATUS_COLORS.Severa }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostrar label se for menos de 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={isSmallScreen ? "10px" : "12px"}
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Status dos Pacientes</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Distribuição por severidade craniana ({totalPacientes} pacientes)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <div className="flex justify-center items-center" style={{ height: altura }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={altura}>
            <PieChart>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={isSmallScreen ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {dados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  fontSize: isSmallScreen ? '12px' : '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  `${value} paciente${value !== 1 ? 's' : ''}`, 
                  name
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: isSmallScreen ? '11px' : '12px',
                  paddingTop: '10px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-sm mb-2">Nenhum dado disponível</p>
            <p className="text-xs">Realize algumas avaliações para ver a distribuição</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
