
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronLeft, Download, ArrowRight } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { toast } from "sonner";

export default function RelatorioMedicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setCarregando(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Lista</Button>
      </div>
    );
  }
  
  // Supor que a medição mais recente seja a última medição adicionada
  const medicao = {
    id: "nova-medicao",
    data: new Date().toISOString(),
    comprimento: 140,
    largura: 110,
    diagonalD: 160,
    diagonalE: 158,
    diferencaDiagonais: 2,
    indiceCraniano: 79,
    cvai: 1.3,
    status: "normal" as "normal" | "leve" | "moderada" | "severa",
    observacoes: "",
    recomendacoes: [
      "Manter acompanhamento regular",
      "Estimular mudanças de posição durante o sono",
      "Realizar exercícios de fortalecimento cervical"
    ]
  };
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const handleExportarPDF = () => {
    toast.success("Relatório exportado em PDF com sucesso!");
  };
  
  const handleVoltar = () => {
    navigate(`/pacientes/${id}`);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Carregando...
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">Gerando relatório...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Relatório de Avaliação</h2>
            <div className="text-muted-foreground mt-1">
              Paciente: {paciente.nome} • {formatarData(medicao.data)}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="bg-white" 
          onClick={handleExportarPDF}
        >
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Avaliação</CardTitle>
            <CardDescription>Medições realizadas em {formatarData(medicao.data)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Comprimento</p>
                <p className="text-lg font-medium">{medicao.comprimento} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Largura</p>
                <p className="text-lg font-medium">{medicao.largura} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagonal D</p>
                <p className="text-lg font-medium">{medicao.diagonalD} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagonal E</p>
                <p className="text-lg font-medium">{medicao.diagonalE} mm</p>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                <p className="text-lg font-medium">{medicao.diferencaDiagonais} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Índice Craniano</p>
                <p className="text-lg font-medium">{medicao.indiceCraniano}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CVAI</p>
                <p className="text-lg font-medium">{medicao.cvai}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={medicao.status} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Clínicas</CardTitle>
            <CardDescription>Baseadas no protocolo de Atlanta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Diagnóstico</p>
                <p className="font-medium">
                  {medicao.status === "normal" ? "Desenvolvimento craniano normal" : 
                   medicao.status === "leve" ? "Plagiocefalia posicional leve" :
                   medicao.status === "moderada" ? "Plagiocefalia posicional moderada" :
                   "Plagiocefalia posicional severa"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Recomendações</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {medicao.recomendacoes.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Próxima avaliação</p>
                <p className="font-medium">
                  {medicao.status === "normal" ? "3 meses" : 
                   medicao.status === "leve" ? "2 meses" :
                   "1 mês"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <MedicaoLineChart titulo="Evolução do Paciente" altura={350} />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleVoltar}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar ao Paciente
        </Button>
        <Button onClick={() => navigate(`/pacientes/${id}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
          Nova Medição <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
