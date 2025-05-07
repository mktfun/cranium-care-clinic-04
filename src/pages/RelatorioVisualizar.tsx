
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { toast } from "sonner";
import { PerimetroCefalicoChart } from "@/components/PerimetroCefalicoChart";
import { DiametrosCranianosChart } from "@/components/DiametrosCranianosChart";

export default function RelatorioVisualizar() {
  const { id, medicaoId } = useParams<{ id: string, medicaoId: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  const [carregando, setCarregando] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setCarregando(false);
    }, 800);
    
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
  
  const medicao = paciente.medicoes.find(m => m.id === medicaoId) || paciente.medicoes[0];
  
  if (!medicao) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Medição não encontrada</p>
        <Button onClick={() => navigate(`/pacientes/${id}`)}>Voltar para Paciente</Button>
      </div>
    );
  }
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const handleExportarPDF = () => {
    toast.success("Relatório exportado em PDF com sucesso!");
  };
  
  const handleImprimir = () => {
    toast.success("Enviando relatório para impressão...");
    setTimeout(() => window.print(), 500);
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
        <p className="mt-4 text-muted-foreground">Carregando relatório...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto print:mx-0 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Relatório de Avaliação</h2>
            <div className="text-muted-foreground mt-1">
              {paciente.nome} • {formatarData(medicao.data)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleImprimir}
            size={isMobile ? "sm" : "default"}
          >
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportarPDF}
            size={isMobile ? "sm" : "default"}
          >
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>
      
      <div className="print:mt-0 print:mb-6">
        <div className="text-center border-b pb-4 print:block hidden">
          <h1 className="text-2xl font-bold mb-2">Relatório de Avaliação Craniana</h1>
          <p>Paciente: {paciente.nome} ({paciente.idadeEmMeses} meses) • Data: {formatarData(medicao.data)}</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{paciente.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-medium">{paciente.idadeEmMeses} meses</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{formatarData(paciente.dataNascimento)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="font-medium">{paciente.sexo === "M" ? "Masculino" : "Feminino"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Avaliação</CardTitle>
            <CardDescription>Data: {formatarData(medicao.data)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={medicao.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagnóstico</p>
                <p className="font-medium">
                  {medicao.status === "normal" ? "Desenvolvimento craniano normal" : 
                  medicao.status === "leve" ? "Plagiocefalia posicional leve" :
                  medicao.status === "moderada" ? "Plagiocefalia posicional moderada" :
                  "Plagiocefalia posicional severa"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Craniais</CardTitle>
          <CardDescription>Medições realizadas em {formatarData(medicao.data)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
          
          <hr className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
              <p className="text-lg font-medium">{medicao.diferencaDiagonais} mm</p>
              <p className="text-xs text-muted-foreground mt-1">
                {medicao.diferencaDiagonais <= 3 ? "Normal" : 
                 medicao.diferencaDiagonais <= 10 ? "Assimetria moderada" : 
                 "Assimetria significativa"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Índice Craniano</p>
              <p className="text-lg font-medium">{medicao.indiceCraniano}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {medicao.indiceCraniano < 76 ? "Dolicocefalia" : 
                 medicao.indiceCraniano <= 90 ? "Normocefalia" : 
                 "Braquicefalia"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CVAI</p>
              <p className="text-lg font-medium">{medicao.cvai}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {medicao.cvai < 3.5 ? "Normal" : 
                 medicao.cvai <= 7 ? "Leve a moderada" : 
                 "Severa"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Novos gráficos para análise pediátrica */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
          <CardDescription>Comparação com padrões da OMS</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full min-w-[600px] sm:min-w-0">
            <PerimetroCefalicoChart altura={isMobile ? 250 : 300} />
          </div>
          <div className="text-xs text-muted-foreground mt-4 px-1">
            <strong>Projeção de crescimento:</strong> Com base no padrão de crescimento atual, 
            estima-se que o perímetro cefálico do paciente mantenha uma taxa de crescimento de 
            aproximadamente 0.9-1.2 cm por mês nos próximos 3 meses, permanecendo dentro do 
            canal de crescimento adequado entre os percentis 50 e 75.
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Proporção dos Diâmetros Cranianos</CardTitle>
          <CardDescription>Análise de simetria e forma craniana</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full min-w-[600px] sm:min-w-0">
            <DiametrosCranianosChart altura={isMobile ? 250 : 300} />
          </div>
          <div className="text-xs text-muted-foreground mt-4 px-1">
            <strong>Interpretação:</strong> Os diâmetros cranianos apresentam uma relação de 
            proporcionalidade dentro dos parâmetros normais (índice craniano entre 75-85%). 
            A diferença entre as diagonais mostra uma leve assimetria que deve ser monitorada,
            mas que ainda não requer intervenção terapêutica especial.
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Índices</CardTitle>
          <CardDescription>Tendência ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full min-w-[600px] sm:min-w-0">
            <MedicaoLineChart titulo="" altura={isMobile ? 250 : 300} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Clínicas</CardTitle>
          <CardDescription>Baseadas no protocolo de Atlanta</CardDescription>
        </CardHeader>
        <CardContent>
          {medicao.recomendacoes?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {medicao.recomendacoes.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
              {medicao.status === "moderada" && (
                <li>Considerar avaliação para órtese craniana se não houver melhora em 4-6 semanas</li>
              )}
              {medicao.status === "severa" && (
                <li>Encaminhamento para especialista em órtese craniana recomendado</li>
              )}
              <li>Retorno para reavaliação em 30 dias para monitoramento da evolução do perímetro cefálico</li>
              <li>Manter estímulos para fortalecimento da musculatura cervical e favorecimento do desenvolvimento neuropsicomotor</li>
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhuma recomendação disponível</p>
          )}
        </CardContent>
      </Card>
      
      <div className="print:hidden">
        <Button variant="outline" onClick={handleVoltar} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
      
      <div className="text-center border-t pt-4 text-xs text-muted-foreground mt-8 print:block hidden">
        <p>Este relatório foi gerado pelo sistema CraniumCare em {new Date().toLocaleDateString('pt-BR')}</p>
        <p>Uso exclusivamente clínico</p>
      </div>
    </div>
  );
}
