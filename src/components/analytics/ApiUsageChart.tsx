
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function ApiUsageChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['apiUsage'],
    queryFn: async () => {
      // Simular dados de uso da API baseado nos dados reais do banco
      const [
        { count: pacientesOperations },
        { count: medicoesOperations },
        { count: prontuariosOperations },
        { count: colaboradoresOperations }
      ] = await Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }),
        supabase.from('medicoes').select('*', { count: 'exact', head: true }),
        supabase.from('prontuarios').select('*', { count: 'exact', head: true }),
        supabase.from('colaboradores').select('*', { count: 'exact', head: true })
      ]);

      // Simular diferentes tipos de operações
      return [
        {
          endpoint: 'Pacientes',
          get: Math.floor((pacientesOperations || 0) * 3.2),
          post: pacientesOperations || 0,
          put: Math.floor((pacientesOperations || 0) * 0.8),
          delete: Math.floor((pacientesOperations || 0) * 0.1)
        },
        {
          endpoint: 'Medições',
          get: Math.floor((medicoesOperations || 0) * 2.8),
          post: medicoesOperations || 0,
          put: Math.floor((medicoesOperations || 0) * 0.6),
          delete: Math.floor((medicoesOperations || 0) * 0.05)
        },
        {
          endpoint: 'Prontuários',
          get: Math.floor((prontuariosOperations || 0) * 4.1),
          post: prontuariosOperations || 0,
          put: Math.floor((prontuariosOperations || 0) * 1.2),
          delete: Math.floor((prontuariosOperations || 0) * 0.02)
        },
        {
          endpoint: 'Colaboradores',
          get: Math.floor((colaboradoresOperations || 0) * 2.5),
          post: colaboradoresOperations || 0,
          put: Math.floor((colaboradoresOperations || 0) * 0.3),
          delete: Math.floor((colaboradoresOperations || 0) * 0.1)
        }
      ];
    }
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const chartConfig = {
    get: {
      label: "GET",
      color: "hsl(var(--chart-1))",
    },
    post: {
      label: "POST",
      color: "hsl(var(--chart-2))",
    },
    put: {
      label: "PUT",
      color: "hsl(var(--chart-3))",
    },
    delete: {
      label: "DELETE",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <XAxis type="number" />
          <YAxis dataKey="endpoint" type="category" width={80} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="get" fill="var(--color-get)" />
          <Bar dataKey="post" fill="var(--color-post)" />
          <Bar dataKey="put" fill="var(--color-put)" />
          <Bar dataKey="delete" fill="var(--color-delete)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
