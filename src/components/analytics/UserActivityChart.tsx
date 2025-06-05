
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function UserActivityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('created_at, nome')
        .order('created_at', { ascending: false });

      // Simular atividade baseada em dados existentes
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      return last7Days.map(date => {
        const registros = usuarios?.filter(u => u.created_at?.startsWith(date)).length || 0;
        // Simular logins (seria melhor ter uma tabela de sessions)
        const logins = Math.floor(Math.random() * 10) + registros * 2;
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          registros,
          logins,
          atividade: logins + registros
        };
      });
    }
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const chartConfig = {
    registros: {
      label: "Registros",
      color: "hsl(var(--chart-1))",
    },
    logins: {
      label: "Logins",
      color: "hsl(var(--chart-2))",
    },
    atividade: {
      label: "Atividade Total",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="registros" 
            stroke="var(--color-registros)" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="logins" 
            stroke="var(--color-logins)" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="atividade" 
            stroke="var(--color-atividade)" 
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
