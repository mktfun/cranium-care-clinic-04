
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
            <PatientTasks />
          </div>
        </div>
      )}

      {isMobile && (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <MobileChartView />
          <PatientTasks />
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
        <PacienteCard
          nome="Ana Clara Silva"
          idade="6 meses"
          sexo="F"
          statusPlagio="moderado"
          statusBraq="normal"
          ultimaMedicao="18/05/2023"
        />
        <PacienteCard
          nome="Lucas Oliveira"
          idade="3 meses"
          sexo="M"
          statusPlagio="leve"
          statusBraq="normal"
          ultimaMedicao="20/05/2023"
        />
        <PacienteCard
          nome="Sofia Cardoso"
          idade="8 meses"
          sexo="F"
          statusPlagio="normal"
          statusBraq="moderado"
          ultimaMedicao="15/05/2023"
        />
        <PacienteCard
          nome="Pedro Santos"
          idade="5 meses"
          sexo="M"
          statusPlagio="leve"
          statusBraq="leve"
          ultimaMedicao="19/05/2023"
        />
      </div>
    </div>
  );
}
