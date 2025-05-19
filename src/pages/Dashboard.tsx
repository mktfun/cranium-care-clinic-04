
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";
import { PacienteCard } from "@/components/PacienteCard";
import { UrgentTasksCard } from "@/components/UrgentTasksCard";
import { Users, BarChart3, CalendarCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileChartView } from "@/components/MobileChartView";
import { PatientTasks } from "@/components/PatientTasks";

export default function Dashboard() {
  const isMobile = useIsMobile();

  // Dados de pacientes formatados para o componente PacienteCard
  const pacientesMock = [
    {
      id: "1",
      nome: "Ana Clara Silva",
      dataNascimento: "2023-11-19", // 6 meses atrás
      idadeEmMeses: 6, // Changed from string to number
      ultimaMedicao: {
        data: "2023-05-18",
        status: "moderada" as const,
        asymmetryType: "plagiocefalia" as const
      }
    },
    {
      id: "2",
      nome: "Lucas Oliveira",
      dataNascimento: "2024-02-19", // 3 meses atrás
      idadeEmMeses: 3, // Changed from string to number
      ultimaMedicao: {
        data: "2023-05-20",
        status: "leve" as const,
        asymmetryType: "plagiocefalia" as const
      }
    },
    {
      id: "3",
      nome: "Sofia Cardoso",
      dataNascimento: "2023-09-19", // 8 meses atrás
      idadeEmMeses: 8, // Changed from string to number
      ultimaMedicao: {
        data: "2023-05-15",
        status: "moderada" as const,
        asymmetryType: "braquicefalia" as const
      }
    },
    {
      id: "4",
      nome: "Pedro Santos",
      dataNascimento: "2023-12-19", // 5 meses atrás
      idadeEmMeses: 5, // Changed from string to number
      ultimaMedicao: {
        data: "2023-05-19",
        status: "leve" as const,
        asymmetryType: "mista" as const
      }
    }
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Pacientes"
          value={132}
          description="Total de pacientes registrados"
          icon={<Users className="w-4 h-4 text-blue-600" />}
          trend={{
            value: "+12%",
            isPositive: true,
            description: "desde último mês"
          }}
        />
        <StatsCard
          title="Medições"
          value={547}
          description="Total de medições realizadas"
          icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
          trend={{
            value: "+8%",
            isPositive: true,
            description: "desde último mês"
          }}
        />
        <StatsCard
          title="Tarefas"
          value={23}
          description="Tarefas em andamento"
          icon={<CalendarCheck className="w-4 h-4 text-amber-600" />}
          trend={{
            value: "-5%",
            isPositive: false,
            description: "desde última semana"
          }}
        />
        <UrgentTasksCard />
      </div>
      
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PacientesMedicoesChart />
          </div>
          <div>
            <PatientTasks patientId="1" />
          </div>
        </div>
      )}

      {isMobile && (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <MobileChartView />
          <PatientTasks patientId="1" />
        </div>
      )}
      
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pacientes Recentes</h2>
        <Button variant="link" size="sm" asChild>
          <Link to="/pacientes" className="flex items-center">
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pacientesMock.map((paciente) => (
          <PacienteCard key={paciente.id} paciente={paciente} />
        ))}
      </div>
    </div>
  );
}
