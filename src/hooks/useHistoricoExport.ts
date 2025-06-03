
import { useState } from "react";
import { toast } from "sonner";
import { MedicaoExportUtils } from "@/components/export/MedicaoExportUtils";

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  diferenca_diagonais?: number;
  comprimento?: number;
  largura?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  pacienteNome?: string;
  pacienteNascimento?: string;
  pacienteSexo?: 'M' | 'F';
}

export function useHistoricoExport(allMedicoes: Medicao[]) {
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const handleExportPDF = async (medicao: Medicao, includeCharts: boolean = false) => {
    if (!medicao.pacienteNome || !medicao.pacienteNascimento || !medicao.pacienteSexo) {
      toast.error("Dados do paciente incompletos");
      return;
    }

    setExportLoading(medicao.id);
    
    // Mostrar toast de loading com informação sobre gráficos
    const loadingMessage = includeCharts 
      ? "Gerando PDF com gráficos (2 páginas)..." 
      : "Gerando PDF...";
    
    const loadingToast = toast.loading(loadingMessage);
    
    try {
      const pacienteData = {
        nome: medicao.pacienteNome,
        data_nascimento: medicao.pacienteNascimento,
        sexo: medicao.pacienteSexo
      };

      const medicaoParaExport = {
        ...medicao,
        indice_craniano: medicao.indice_craniano || 0,
        cvai: medicao.cvai || 0
      };

      // Se incluir gráficos, buscar todas as medições do paciente
      let todasMedicoes: Medicao[] = [];
      if (includeCharts) {
        todasMedicoes = allMedicoes.filter(m => m.paciente_id === medicao.paciente_id);
        
        // Verificar se há dados suficientes para gráficos
        if (todasMedicoes.length < 2) {
          toast.warning("Dados insuficientes para gráficos. Gerando PDF simples.");
          includeCharts = false;
        }
      }

      await MedicaoExportUtils.exportToPDF(
        medicaoParaExport, 
        pacienteData, 
        todasMedicoes,
        [],
        { nome: "CraniumCare Clinic", profissional: "Médico Responsável" },
        includeCharts
      );
      
      toast.dismiss(loadingToast);
      const successMessage = includeCharts 
        ? "PDF com gráficos gerado com sucesso!" 
        : "PDF gerado com sucesso!";
      toast.success(successMessage);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportLoading(null);
    }
  };

  return { exportLoading, handleExportPDF };
}
