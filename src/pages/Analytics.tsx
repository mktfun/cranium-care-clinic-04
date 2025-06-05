
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsAccess } from '@/hooks/useAnalyticsAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DatabaseActivityChart } from '@/components/analytics/DatabaseActivityChart';
import { UserActivityChart } from '@/components/analytics/UserActivityChart';
import { SecurityEventsChart } from '@/components/analytics/SecurityEventsChart';
import { SystemOverviewCards } from '@/components/analytics/SystemOverviewCards';
import { DataGrowthChart } from '@/components/analytics/DataGrowthChart';
import { ApiUsageChart } from '@/components/analytics/ApiUsageChart';

export default function Analytics() {
  const navigate = useNavigate();
  const { hasAccess, loading } = useAnalyticsAccess();

  useEffect(() => {
    if (!loading && !hasAccess) {
      navigate('/dashboard');
    }
  }, [hasAccess, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics do Sistema</h1>
          <p className="text-muted-foreground">
            Visualização completa da arquitetura e performance do backend
          </p>
        </div>
      </div>

      {/* Cards de Overview */}
      <SystemOverviewCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade do Banco */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade do Banco de Dados</CardTitle>
            <CardDescription>
              Operações realizadas nas principais tabelas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseActivityChart />
          </CardContent>
        </Card>

        {/* Atividade dos Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade dos Usuários</CardTitle>
            <CardDescription>
              Logins e ações dos usuários por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>

        {/* Eventos de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Segurança</CardTitle>
            <CardDescription>
              Logs de segurança e auditoria do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityEventsChart />
          </CardContent>
        </Card>

        {/* Crescimento de Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Dados</CardTitle>
            <CardDescription>
              Evolução do volume de dados ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataGrowthChart />
          </CardContent>
        </Card>

        {/* Uso da API */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uso da API</CardTitle>
            <CardDescription>
              Utilização das principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiUsageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
