
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";

interface MobileChartViewProps {
  paciente?: any;
  dataNascimento?: string;
  sexoPaciente?: string;
  medicoes?: any[];
}

export function MobileChartView({ paciente, dataNascimento, sexoPaciente, medicoes }: MobileChartViewProps) {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  
  // Define chart types available
  const chartTypes = [
    {
      id: "pacientesMedicoes",
      title: "Evolução de Pacientes e Medições",
      description: "Comparativo entre pacientes registrados e medições realizadas"
    },
    {
      id: "indiceCraniano",
      title: "Índice Craniano",
      description: "Evolução do Índice Craniano"
    },
    {
      id: "cvai",
      title: "Plagiocefalia (CVAI)",
      description: "Evolução da Plagiocefalia"
    },
    {
      id: "diagonais",
      title: "Diagonais",
      description: "Evolução das Diagonais"
    },
    {
      id: "perimetro",
      title: "Perímetro Cefálico",
      description: "Evolução do Perímetro Cefálico"
    }
  ];
  
  const nextChart = () => {
    setCurrentChartIndex((prev) => (prev === chartTypes.length - 1 ? 0 : prev + 1));
  };
  
  const prevChart = () => {
    setCurrentChartIndex((prev) => (prev === 0 ? chartTypes.length - 1 : prev - 1));
  };
  
  const currentChart = chartTypes[currentChartIndex];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{currentChart.title}</CardTitle>
        <CardDescription>{currentChart.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {currentChart.id === "pacientesMedicoes" && (
            <PacientesMedicoesChart altura={320} />
          )}
          
          {currentChart.id === "indiceCraniano" && medicoes && medicoes.length > 0 && (
            <MedicaoLineChart 
              titulo="Evolução do Índice Craniano" 
              medicoes={medicoes}
              dataNascimento={dataNascimento || ""}
              tipoGrafico="indiceCraniano"
              sexoPaciente={sexoPaciente || ""}
              linhaCorTheme="rose"
              altura={320}
            />
          )}
          
          {currentChart.id === "cvai" && medicoes && medicoes.length > 0 && (
            <MedicaoLineChart 
              titulo="Evolução da Plagiocefalia (CVAI)" 
              medicoes={medicoes}
              dataNascimento={dataNascimento || ""}
              tipoGrafico="cvai"
              sexoPaciente={sexoPaciente || ""}
              linhaCorTheme="amber"
              altura={320}
            />
          )}
          
          {currentChart.id === "diagonais" && medicoes && medicoes.length > 0 && (
            <MedicaoLineChart 
              titulo="Evolução das Diagonais" 
              medicoes={medicoes}
              dataNascimento={dataNascimento || ""}
              tipoGrafico="diagonais"
              sexoPaciente={sexoPaciente || ""}
              linhaCorTheme="purple"
              altura={320}
            />
          )}
          
          {currentChart.id === "perimetro" && medicoes && medicoes.length > 0 && (
            <MedicaoLineChart 
              titulo="Evolução do Perímetro Cefálico" 
              medicoes={medicoes}
              dataNascimento={dataNascimento || ""}
              tipoGrafico="perimetro"
              sexoPaciente={sexoPaciente || ""}
              linhaCorTheme="green"
              altura={320}
            />
          )}
          
          {medicoes && medicoes.length === 0 && currentChart.id !== "pacientesMedicoes" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Não há medições disponíveis</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm" onClick={prevChart}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={nextChart}>
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
