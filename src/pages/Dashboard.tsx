
import { Users, Activity, Calendar, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PacienteCard } from "@/components/PacienteCard";
import { StatusBadge } from "@/components/StatusBadge";
import { obterPacientes, obterUltimaMedicao, obterStatusDistribuicao } from "@/data/mock-data";

export default function Dashboard() {
  const pacientes = obterPacientes();
  const statusDistribuicao = obterStatusDistribuicao();
  const totalPacientes = pacientes.length;
  
  const pacientesParaCard = pacientes.slice(0, 4).map(paciente => {
    const ultimaMedicao = obterUltimaMedicao(paciente.id);
    return {
      id: paciente.id,
      nome: paciente.nome,
      dataNascimento: paciente.dataNascimento,
      idadeEmMeses: paciente.idadeEmMeses,
      ultimaMedicao: {
        data: ultimaMedicao?.data || '',
        status: ultimaMedicao?.status || 'normal'
      }
    };
  });

  const medicoesRecentes = pacientes.reduce((total, paciente) => total + paciente.medicoes.length, 0);
  const pacientesComAlerta = statusDistribuicao.moderada + statusDistribuicao.severa;
  
  // Cálculo de pacientes que precisam de acompanhamento (aqueles com status moderado ou severo)
  const percentualAcompanhamento = totalPacientes > 0 
    ? Math.round((pacientesComAlerta / totalPacientes) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold">Olá, Dr. Ana</h2>
      <p className="text-muted-foreground">
        Bem-vinda de volta ao painel do CraniumCare. Confira o resumo dos seus pacientes.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total de Pacientes"
          value={totalPacientes}
          description="Ativos no sistema"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Total de Medições"
          value={medicoesRecentes}
          description="Registradas no sistema"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Última Avaliação"
          value="Hoje"
          description="Sofia Oliveira"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Pacientes em Alerta"
          value={pacientesComAlerta}
          description={`${percentualAcompanhamento}% dos pacientes`}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          trend={{
            value: 4,
            isPositive: false,
          }}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <MedicaoLineChart 
            titulo="Evolução dos Índices" 
            descricao="Tendências nas últimas avaliações"
            altura={350}
          />
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Pacientes recentes</h3>
          <div className="space-y-4">
            {pacientesParaCard.map((paciente) => (
              <div key={paciente.id} className="bg-card p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{paciente.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {paciente.idadeEmMeses} meses
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">Última avaliação:</p>
                    <p>{new Date(paciente.ultimaMedicao.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <StatusBadge status={paciente.ultimaMedicao.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Pacientes em Destaque</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pacientesParaCard.map((paciente) => (
            <PacienteCard key={paciente.id} paciente={paciente} />
          ))}
        </div>
      </div>
    </div>
  );
}
