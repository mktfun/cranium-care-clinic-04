
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function DataGrowthChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dataGrowth'],
    queryFn: async () => {
      const [
        { data: pacientes },
        { data: medicoes },
        { data: prontuarios }
      ] = await Promise.all([
        supabase.from('pacientes').select('created_at').order('created_at', { ascending: true }),
        supabase.from('medicoes').select('created_at').order('created_at', { ascending: true }),
        supabase.from('prontuarios').select('created_at').order('created_at', { ascending: true })
      ]);

      // Calcular crescimento cumulativo por mês
      const monthlyGrowth = new Map();
      
      const processData = (data: any[], type: string) => {
        data?.forEach(item => {
          if (item.created_at) {
            const month = item.created_at.substring(0, 7); // YYYY-MM
            if (!monthlyGrowth.has(month)) {
              monthlyGrowth.set(month, { month, pacientes: 0, medicoes: 0, prontuarios: 0 });
            }
            monthlyGrowth.get(month)[type]++;
          }
        });
      };

      processData(pacientes, 'pacientes');
      processData(medicoes, 'medicoes');
      processData(prontuarios, 'prontuarios');

      // Converter para array e calcular cumulativo
      const sortedData = Array.from(monthlyGrowth.values())
        .sort((a, b) => a.month.localeCompare(b.month));

      let cumulativePacientes = 0;
      let cumulativeMedicoes = 0;
      let cumulativeProntuarios = 0;

      return sortedData.map(item => {
        cumulativePacientes += item.pacientes;
        cumulativeMedicoes += item.medicoes;
        cumulativeProntuarios += item.prontuarios;

        return {
          month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          pacientes: cumulativePacientes,
          medicoes: cumulativeMedicoes,
          prontuarios: cumulativeProntuarios
        };
      });
    }
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const chartConfig = {
    pacientes: {
      label: "Pacientes",
      color: "hsl(var(--chart-1))",
    },
    medicoes: {
      label: "Medições",
      color: "hsl(var(--chart-2))",
    },
    prontuarios: {
      label: "Prontuários",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area 
            type="monotone" 
            dataKey="pacientes" 
            stackId="1" 
            stroke="var(--color-pacientes)" 
            fill="var(--color-pacientes)"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="medicoes" 
            stackId="1" 
            stroke="var(--color-medicoes)" 
            fill="var(--color-medicoes)"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="prontuarios" 
            stackId="1" 
            stroke="var(--color-prontuarios)" 
            fill="var(--color-prontuarios)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
