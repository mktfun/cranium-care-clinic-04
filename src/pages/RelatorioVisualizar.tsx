
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { obterPacientePorId } from "@/data/mock-data";
import { formatAge } from "@/lib/age-utils";
import { AsymmetryType, SeverityLevel, getCranialStatus } from "@/lib/cranial-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatorioHeader } from "@/components/relatorio/RelatorioHeader";
import { PacienteDadosCard } from "@/components/relatorio/PacienteDadosCard";
import { ResumoAvaliacaoCard } from "@/components/relatorio/ResumoAvaliacaoCard";
import { MedicoesHistoricoTable } from "@/components/relatorio/MedicoesHistoricoTable";
import { ParametrosCraniaisCard } from "@/components/relatorio/ParametrosCraniaisCard";
import { RecomendacoesCard } from "@/components/relatorio/RecomendacoesCard";
import { RelatorioFooter } from "@/components/relatorio/RelatorioFooter";

export default function RelatorioVisualizar() {
  const { id, medicaoId } = useParams<{ id: string, medicaoId: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  const [carregando, setCarregando] = useState(true);
  const [modoConsolidado, setModoConsolidado] = useState(false);
  
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
        <button onClick={() => navigate("/pacientes")}>Voltar para Lista</button>
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
        <button onClick={() => navigate(`/pacientes/${id}`)}>Voltar para Paciente</button>
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
    : { asymmetryType: "Normal" as AsymmetryType, severityLevel: "normal" as SeverityLevel };
  
  const handleVoltar = () => {
    navigate(`/pacientes/${id}`);
  };

  const handleToggleModo = () => {
    setModoConsolidado(!modoConsolidado);
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
      <RelatorioHeader 
        pacienteNome={paciente.nome}
        idadeAtual={idadeAtual}
        dataFormatada={medicao?.data ? formatarData(medicao.data) : undefined}
        modoConsolidado={modoConsolidado}
        onModoChange={handleToggleModo}
        onVoltar={handleVoltar}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <PacienteDadosCard 
          nome={paciente.nome}
          idadeAtual={idadeAtual}
          dataNascimentoFormatada={formatarData(paciente.dataNascimento)}
          sexo={paciente.sexo}
        />
        
        {!modoConsolidado && medicao && (
          <ResumoAvaliacaoCard 
            dataFormatada={formatarData(medicao.data)}
            idadeNaAvaliacao={formatAge(paciente.dataNascimento, medicao.data)}
            severityLevel={severityLevel}
            asymmetryType={asymmetryType}
          />
        )}
      </div>
      
      {modoConsolidado ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Medições</CardTitle>
            <CardDescription>Evolução cronológica das avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicoesHistoricoTable 
              medicoes={todasMedicoes}
              dataNascimento={paciente.dataNascimento}
            />
          </CardContent>
        </Card>
      ) : medicao ? (
        <ParametrosCraniaisCard 
          dataFormatada={formatarData(medicao.data)}
          comprimento={medicao.comprimento}
          largura={medicao.largura}
          indiceCraniano={medicao.indiceCraniano}
          diagonalD={medicao.diagonalD}
          diagonalE={medicao.diagonalE}
          diferencaDiagonais={medicao.diferencaDiagonais}
          cvai={medicao.cvai}
          perimetroCefalico={medicao.perimetroCefalico}
        />
      ) : null}
      
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
      
      {medicao && (
        <RecomendacoesCard 
          recomendacoes={medicao.recomendacoes}
          severityLevel={severityLevel}
        />
      )}
      
      <RelatorioFooter onVoltar={handleVoltar} />
    </div>
  );
}
