
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileDown, Eye, BarChart2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-media-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  relatorioElementId?: string;
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  relatorioElementId
}: RelatorioHeaderProps) {
  const isMobileOrTablet = useIsMobileOrTabletPortrait();
  const [clinicaInfo, setClinicaInfo] = useState<{
    nome: string;
    logo_url: string | null;
    profissional: string;
  }>({
    nome: "CraniumCare Clinic",
    logo_url: null,
    profissional: "",
  });
  
  useEffect(() => {
    async function fetchClinicaInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome, clinica_logo')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setClinicaInfo({
              nome: data.clinica_nome || "CraniumCare Clinic",
              logo_url: data.clinica_logo || null,
              profissional: data.nome || "Médico Responsável",
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar informações da clínica:", error);
      }
    }
    
    fetchClinicaInfo();
  }, []);
  
  const handleExportPDF = () => {
    if (!relatorioElementId) return;
    
    const element = document.getElementById(relatorioElementId);
    if (!element) {
      toast.error("Elemento do relatório não encontrado");
      return;
    }
    
    // Adiciona uma classe temporária para estilo de impressão
    element.classList.add('printing');
    
    // Prepara o cabeçalho personalizado para o PDF
    const dataHora = new Date().toLocaleString('pt-BR');
    
    const headerHtml = `
      <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${clinicaInfo.logo_url ? `<img src="${clinicaInfo.logo_url}" alt="Logo" style="height: 50px; max-width: 150px; object-fit: contain;">` : ''}
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #6E59A5;">${clinicaInfo.nome}</h1>
            <p style="margin: 0; font-size: 14px; color: #8E9196;">Relatório de Avaliação Craniana</p>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px;">Data: ${dataFormatada || dataHora.split(',')[0]}</p>
          <p style="margin: 0; font-size: 14px;">Hora: ${dataHora.split(',')[1]}</p>
          <p style="margin: 0; font-size: 14px;">Profissional: ${clinicaInfo.profissional}</p>
        </div>
      </div>
    `;
    
    // Adiciona o cabeçalho temporariamente
    const headerDiv = document.createElement('div');
    headerDiv.id = 'pdf-header-temp';
    headerDiv.innerHTML = headerHtml;
    headerDiv.style.display = 'none';
    document.body.appendChild(headerDiv);
    
    // Configuração do PDF
    const opt = {
      margin: [15, 15],
      filename: `relatorio-craniano-${pacienteNome.toLowerCase().replace(/\s/g, '-')}-${dataFormatada || 'consolidado'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      header: {
        height: '50mm',
        contents: {
          first: headerHtml,
          default: headerHtml,
        }
      },
      footer: {
        height: '20mm',
        contents: {
          default: `
            <div style="text-align: center; font-size: 10px; color: #8E9196; padding: 10px; border-top: 1px solid #e2e8f0;">
              <p>Documento gerado pelo sistema CraniumCare em ${dataHora}</p>
              <p>© ${new Date().getFullYear()} ${clinicaInfo.nome} - Uso exclusivamente clínico</p>
            </div>
          `,
        }
      }
    };
    
    // Converte para PDF
    toast.loading("Gerando PDF...");
    html2pdf().from(element).set(opt).save().then(() => {
      // Remove a classe temporária após a conversão
      element.classList.remove('printing');
      // Remove o header temporário
      const headerTemp = document.getElementById('pdf-header-temp');
      if (headerTemp) document.body.removeChild(headerTemp);
      toast.dismiss();
      toast.success("PDF gerado com sucesso!");
    }).catch(error => {
      console.error("Erro ao gerar PDF:", error);
      element.classList.remove('printing');
      const headerTemp = document.getElementById('pdf-header-temp');
      if (headerTemp) document.body.removeChild(headerTemp);
      toast.dismiss();
      toast.error("Erro ao gerar PDF. Tente novamente.");
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 print:hidden">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onVoltar}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{pacienteNome}</h1>
          <p className="text-muted-foreground">
            {idadeAtual} {dataFormatada ? ` • Avaliação em: ${dataFormatada}` : ''}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
        <Button
          variant="outline"
          size={isMobileOrTablet ? "sm" : "default"}
          onClick={onModoChange}
          className="flex items-center gap-1"
        >
          {modoConsolidado ? (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Ver avaliação individual</span>
              <span className="sm:hidden">Individual</span>
            </>
          ) : (
            <>
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Ver histórico consolidado</span>
              <span className="sm:hidden">Consolidado</span>
            </>
          )}
        </Button>
        
        {relatorioElementId && (
          <Button
            variant="outline"
            size={isMobileOrTablet ? "sm" : "default"}
            onClick={handleExportPDF}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        )}
      </div>
    </div>
  );
}
