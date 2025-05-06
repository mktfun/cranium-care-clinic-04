
import { Users, Activity, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PacienteCard } from "@/components/PacienteCard";
import { StatusBadge } from "@/components/StatusBadge";
import { obterPacientes, obterUltimaMedicao, obterStatusDistribuicao } from "@/data/mock-data";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const pacientes = obterPacientes();
  const statusDistribuicao = obterStatusDistribuicao();
  const totalPacientes = pacientes.length;
  
  // Encontrar paciente com medição mais recente
  const pacienteComMedicaoMaisRecente = [...pacientes]
    .sort((a, b) => {
      const ultimaMedicaoA = a.medicoes.length > 0 ? 
        new Date(a.medicoes.sort((x, y) => new Date(y.data).getTime() - new Date(x.data).getTime())[0].data).getTime() : 0;
      const ultimaMedicaoB = b.medicoes.length > 0 ? 
        new Date(b.medicoes.sort((x, y) => new Date(y.data).getTime() - new Date(x.data).getTime())[0].data).getTime() : 0;
      return ultimaMedicaoB - ultimaMedicaoA;
    })[0];
  
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

  // Função para navegar para página de pacientes com filtro
  const navegarParaPacientesComFiltro = (filtroStatus) => {
    navigate(`/pacientes?status=${filtroStatus}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold">Olá, Dr. Ana</h2>
      <p className="text-muted-foreground">
        Bem-vinda de volta ao painel do CraniumCare. Confira o resumo dos seus pacientes.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate("/pacientes")} className="cursor-pointer">
          <StatsCard 
            title="Total de Pacientes"
            value={totalPacientes}
            description="Ativos no sistema"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navigate("/historico")} className="cursor-pointer">
          <StatsCard 
            title="Total de Medições"
            value={medicoesRecentes}
            description="Registradas no sistema"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navigate(`/pacientes/${pacienteComMedicaoMaisRecente.id}`)} className="cursor-pointer">
          <StatsCard 
            title="Última Avaliação"
            value="Hoje"
            description={pacienteComMedicaoMaisRecente.nome}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navegarParaPacientesComFiltro("alerta")} className="cursor-pointer">
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
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <PacientesMedicoesChart altura={350} />
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Pacientes recentes</h3>
          <div className="space-y-4">
            {pacientesParaCard.map((paciente) => (
              <div 
                key={paciente.id} 
                className="bg-card p-4 rounded-lg border cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors duration-200"
                onClick={() => navigate(`/pacientes/${paciente.id}`)}
              >
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
            <div key={paciente.id} onClick={() => navigate(`/pacientes/${paciente.id}`)} className="cursor-pointer">
              <PacienteCard paciente={paciente} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
