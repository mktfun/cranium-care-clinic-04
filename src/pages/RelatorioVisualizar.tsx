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
import { ChevronLeft, Download, Printer } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { toast } from "sonner";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

export default function RelatorioVisualizar() {
  const { id, medicaoId } = useParams<{ id: string, medicaoId: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  const [carregando, setCarregando] = useState(true);
  const [modoConsolidado, setModoConsolidado] = useState(false); // Novo estado para relatório consolidado
  
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
  
  const medicao = medicaoId && !modoConsolidado 
    ? paciente.medicoes.find(m => m.id === medicaoId) 
    : paciente.medicoes[0];
  
  const todasMedicoes = modoConsolidado
    ? [...paciente.medicoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    : [];
  
  if (!medicao && !modoConsolidado) {
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
  
  // Calcular idade atual do paciente
  const idadeAtual = formatAge(paciente.dataNascimento);
  
  // Obter o status de assimetria para a última medição
  const { asymmetryType, severityLevel } = medicao
    ? getCranialStatus(medicao.indiceCraniano, medicao.cvai)
    : { asymmetryType: "Normal", severityLevel: "normal" };
  
  // Função para gerar e exportar o PDF
  const handleExportarPDF = () => {
    toast.success(`Relatório ${modoConsolidado ? 'consolidado' : 'individual'} exportado em PDF com sucesso!`);
    // Em produção real, aqui seria implementada a geração efetiva do PDF
  };
  
  const handleImprimir = () => {
    toast.success(`Enviando relatório ${modoConsolidado ? 'consolidado' : 'individual'} para impressão...`);
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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto print:mx-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {modoConsolidado ? 'Relatório Consolidado' : 'Relatório de Avaliação'}
            </h2>
            <div className="text-muted-foreground mt-1">
              {paciente.nome} • {idadeAtual}
              {!modoConsolidado && ` • ${formatarData(medicao.data)}`}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setModoConsolidado(!modoConsolidado)}
          >
            {modoConsolidado ? 'Mostrar Relatório Individual' : 'Mostrar Relatório Consolidado'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImprimir}
          >
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportarPDF}
          >
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>
      
      <div className="print:mt-0 print:mb-6">
        <div className="text-center border-b pb-4 print:block hidden">
          <h1 className="text-2xl font-bold mb-2">
            {modoConsolidado 
              ? 'Relatório Consolidado de Avaliações Cranianas' 
              : 'Relatório de Avaliação Craniana'}
          </h1>
          <p>
            Paciente: {paciente.nome} • {idadeAtual} • 
            Data de Nascimento: {formatarData(paciente.dataNascimento)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Profissional: Dr. Exemplo • Clínica: CraniumCare
          </p>
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
                <p className="text-sm text-muted-foreground">Idade Atual</p>
                <p className="font-medium">{idadeAtual}</p>
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
        
        {!modoConsolidado && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Avaliação</CardTitle>
              <CardDescription>
                Data: {formatarData(medicao.data)} • 
                Idade na avaliação: {formatAge(paciente.dataNascimento, medicao.data)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagnóstico</p>
                  <p className="font-medium">
                    {asymmetryType === "Normal" 
                      ? "Desenvolvimento craniano normal" 
                      : `${asymmetryType} ${severityLevel}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Se for relatório consolidado, exibir tabela com todas as medições */}
      {modoConsolidado ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Medições</CardTitle>
            <CardDescription>Evolução cronológica das avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left text-xs">Data</th>
                    <th className="p-2 text-left text-xs">Idade</th>
                    <th className="p-2 text-left text-xs">Comp.</th>
                    <th className="p-2 text-left text-xs">Larg.</th>
                    <th className="p-2 text-left text-xs">Diag. D</th>
                    <th className="p-2 text-left text-xs">Diag. E</th>
                    <th className="p-2 text-left text-xs">Dif.</th>
                    <th className="p-2 text-left text-xs">CVAI</th>
                    <th className="p-2 text-left text-xs">IC</th>
                    <th className="p-2 text-left text-xs">PC</th>
                    <th className="p-2 text-left text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todasMedicoes.map((med: any, index: number) => {
                    const { asymmetryType, severityLevel } = getCranialStatus(
                      med.indiceCraniano,
                      med.cvai
                    );
                    
                    return (
                      <tr key={med.id} className={index % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="p-2 text-xs">{formatarData(med.data)}</td>
                        <td className="p-2 text-xs">{formatAge(paciente.dataNascimento, med.data)}</td>
                        <td className="p-2 text-xs">{med.comprimento}</td>
                        <td className="p-2 text-xs">{med.largura}</td>
                        <td className="p-2 text-xs">{med.diagonalD}</td>
                        <td className="p-2 text-xs">{med.diagonalE}</td>
                        <td className="p-2 text-xs">{med.diferencaDiagonais}</td>
                        <td className="p-2 text-xs">{med.cvai}%</td>
                        <td className="p-2 text-xs">{med.indiceCraniano}%</td>
                        <td className="p-2 text-xs">{med.perimetroCefalico || "-"}</td>
                        <td className="p-2">
                          <StatusBadge 
                            status={severityLevel} 
                            asymmetryType={asymmetryType} 
                            className="text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros Craniais</CardTitle>
            <CardDescription>Medições realizadas em {formatarData(medicao.data)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Comprimento</p>
                <p className="text-lg font-medium">{medicao.comprimento} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Largura</p>
                <p className="text-lg font-medium">{medicao.largura} mm</p>
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
                <p className="text-sm text-muted-foreground">Diagonal D</p>
                <p className="text-lg font-medium">{medicao.diagonalD} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagonal E</p>
                <p className="text-lg font-medium">{medicao.diagonalE} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                <p className="text-lg font-medium">{medicao.diferencaDiagonais} mm</p>
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
              {medicao.perimetroCefalico && (
                <div>
                  <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
                  <p className="text-lg font-medium">{medicao.perimetroCefalico} mm</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Gráficos de Evolução conforme os protocolos */}
      <div className="grid grid-cols-1 gap-6">
        <MedicaoLineChart 
          titulo="Evolução do Índice Craniano" 
          descricao="Conforme protocolo de Braquicefalia e Dolicocefalia" 
          altura={350} 
          medicoes={paciente.medicoes}
          dataNascimento={paciente.dataNascimento}
        />
        
        <MedicaoLineChart 
          titulo="Evolução da Plagiocefalia" 
          descricao="Conforme protocolo de Plagiocefalia" 
          altura={350} 
          medicoes={paciente.medicoes}
          dataNascimento={paciente.dataNascimento}
        />
        
        <MedicaoLineChart 
          titulo="Evolução do Perímetro Cefálico" 
          descricao={`Perímetro cefálico com curvas de referência para ${paciente.sexo === 'M' ? 'meninos' : 'meninas'}`} 
          altura={350} 
          sexoPaciente={paciente.sexo}
          medicoes={paciente.medicoes}
          dataNascimento={paciente.dataNascimento}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Clínicas</CardTitle>
          <CardDescription>Baseadas no protocolo de avaliação craniana</CardDescription>
        </CardHeader>
        <CardContent>
          {medicao?.recomendacoes?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {medicao.recomendacoes.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
              {severityLevel === "moderada" && (
                <li>Considerar avaliação para órtese craniana se não houver melhora em 4-6 semanas</li>
              )}
              {severityLevel === "severa" && (
                <li>Encaminhamento para especialista em órtese craniana recomendado</li>
              )}
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
        <p>Profissional responsável: Dr. Exemplo • Clínica CraniumCare</p>
        <p>Uso exclusivamente clínico</p>
      </div>
    </div>
  );
}
