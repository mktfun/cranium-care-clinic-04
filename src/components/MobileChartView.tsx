
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
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
  const [chartHeight, setChartHeight] = useState(320);
  
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

  const increaseHeight = () => {
    setChartHeight(prev => Math.min(prev + 50, 550));
  };

  const decreaseHeight = () => {
    setChartHeight(prev => Math.max(prev - 50, 200));
  };
  
  const currentChart = chartTypes[currentChartIndex];

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{currentChart.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">{currentChart.description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={decreaseHeight}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={increaseHeight}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="touch-auto overflow-x-auto overflow-y-hidden pb-2" style={{ height: chartHeight }}>
          {currentChart.id === "pacientesMedicoes" && (
            <PacientesMedicoesChart altura={chartHeight - 10} />
          )}
          
          {currentChart.id === "indiceCraniano" && medicoes && medicoes.length > 0 && (
            <MedicaoLineChart 
              titulo="Evolução do Índice Craniano" 
              medicoes={medicoes}
              dataNascimento={dataNascimento || ""}
              tipoGrafico="indiceCraniano"
              sexoPaciente={sexoPaciente || ""}
              linhaCorTheme="rose"
              altura={chartHeight - 10}
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
              altura={chartHeight - 10}
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
              altura={chartHeight - 10}
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
              altura={chartHeight - 10}
            />
          )}
          
          {medicoes && medicoes.length === 0 && currentChart.id !== "pacientesMedicoes" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Não há medições disponíveis</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-3">
          <Button variant="outline" size="sm" onClick={prevChart} className="px-2 py-1 h-8 text-xs">
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={nextChart} className="px-2 py-1 h-8 text-xs">
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
