
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function DatabaseActivityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['databaseActivity'],
    queryFn: async () => {
      const [
        { data: pacientes },
        { data: medicoes },
        { data: prontuarios },
        { data: consultas }
      ] = await Promise.all([
        supabase.from('pacientes').select('created_at').order('created_at', { ascending: false }).limit(30),
        supabase.from('medicoes').select('created_at').order('created_at', { ascending: false }).limit(30),
        supabase.from('prontuarios').select('created_at').order('created_at', { ascending: false }).limit(30),
        supabase.from('consultas').select('created_at').order('created_at', { ascending: false }).limit(30)
      ]);

      // Agrupar por data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      return last7Days.map(date => {
        const pacientesCount = pacientes?.filter(p => p.created_at?.startsWith(date)).length || 0;
        const medicoesCount = medicoes?.filter(m => m.created_at?.startsWith(date)).length || 0;
        const prontuariosCount = prontuarios?.filter(p => p.created_at?.startsWith(date)).length || 0;
        const consultasCount = consultas?.filter(c => c.created_at?.startsWith(date)).length || 0;

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          pacientes: pacientesCount,
          medicoes: medicoesCount,
          prontuarios: prontuariosCount,
          consultas: consultasCount
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
    consultas: {
      label: "Consultas",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="pacientes" fill="var(--color-pacientes)" />
          <Bar dataKey="medicoes" fill="var(--color-medicoes)" />
          <Bar dataKey="prontuarios" fill="var(--color-prontuarios)" />
          <Bar dataKey="consultas" fill="var(--color-consultas)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
