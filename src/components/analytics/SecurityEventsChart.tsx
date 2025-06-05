
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function SecurityEventsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['securityEvents'],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from('security_logs')
        .select('action')
        .order('created_at', { ascending: false })
        .limit(100);

      // Agrupar por tipo de ação
      const actionCounts = logs?.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(actionCounts).map(([action, count]) => ({
        name: action,
        value: count,
      }));
    }
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartConfig = {
    events: {
      label: "Eventos",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
