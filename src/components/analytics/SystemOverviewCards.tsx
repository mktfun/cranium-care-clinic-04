
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity, Database } from 'lucide-react';

export function SystemOverviewCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['systemOverview'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalPatients },
        { count: totalMeasurements },
        { count: totalRecords }
      ] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('pacientes').select('*', { count: 'exact', head: true }),
        supabase.from('medicoes').select('*', { count: 'exact', head: true }),
        supabase.from('prontuarios').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalPatients: totalPatients || 0,
        totalMeasurements: totalMeasurements || 0,
        totalRecords: totalRecords || 0
      };
    }
  });

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Usuários registrados no sistema'
    },
    {
      title: 'Total de Pacientes',
      value: stats?.totalPatients || 0,
      icon: Activity,
      description: 'Pacientes cadastrados'
    },
    {
      title: 'Total de Medições',
      value: stats?.totalMeasurements || 0,
      icon: FileText,
      description: 'Medições realizadas'
    },
    {
      title: 'Total de Prontuários',
      value: stats?.totalRecords || 0,
      icon: Database,
      description: 'Prontuários médicos'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : card.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
