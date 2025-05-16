
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RelatorioHeaderProps {
  pacienteNome: string;
  idadeAtual: string;
  dataFormatada?: string;
  modoConsolidado: boolean;
  onModoChange: () => void;
  onVoltar: () => void;
  hideControls?: boolean;
  relatorioElementId?: string; // ID do elemento a ser exportado
}

export function RelatorioHeader({
  pacienteNome,
  idadeAtual,
  dataFormatada,
  modoConsolidado,
  onModoChange,
  onVoltar,
  hideControls = false,
  relatorioElementId // Receber o ID como prop
}: RelatorioHeaderProps) {
  const [profissionalNome, setProfissionalNome] = useState<string>("Dr. Exemplo");
  const [clinicaNome, setClinicaNome] = useState<string>("CraniumCare");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setProfissionalNome(data.nome || "Dr. Exemplo");
            setClinicaNome(data.clinica_nome || "CraniumCare");
            setAvatarUrl(data.avatar_url || "");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    carregarDadosUsuario();
  }, []);

  const handleExportarPDF = () => {
    if (!relatorioElementId) {
      toast.error("Erro ao exportar PDF: Elemento do relatório não encontrado.");
      return;
    }

    const element = document.getElementById(relatorioElementId);

    if (!element) {
      toast.error("Erro ao exportar PDF: Conteúdo do relatório não pôde ser localizado para exportação.");
      return;
    }

    // Clonar o elemento para evitar modificações no original e remover botões de controle
    const elementToExport = element.cloneNode(true) as HTMLElement;
    
    // Corrigido o seletor CSS
    const controlsElements = elementToExport.querySelectorAll('.print\\:hidden');
    controlsElements.forEach(control => {
      if (control.parentNode) {
        control.parentNode.removeChild(control);
      }
    });
    
    // Adicionar um título visível no PDF que pode estar oculto na tela
    const pdfTitleElement = document.createElement('div');
    
    // Avatar do profissional (se disponível)
    const avatarHtml = avatarUrl ? 
      `<img src="${avatarUrl}" alt="Profissional" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" />` :
      '';

    pdfTitleElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding-top: 20px;">
        ${avatarHtml}
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
          ${modoConsolidado ? 'Relatório Consolidado de Avaliações Cranianas' : 'Relatório de Avaliação Craniana'}
        </h1>
        <p style="font-size: 14px;">
          Paciente: ${pacienteNome} • Idade na Avaliação: ${idadeAtual}
          ${!modoConsolidado && dataFormatada ? ` • Data da Avaliação: ${dataFormatada}` : ''}
        </p>
        <p style="font-size: 12px; color: #555; margin-top: 4px;">
          Profissional: ${profissionalNome} • Clínica: ${clinicaNome}
        </p>
      </div>
    `;
    elementToExport.insertBefore(pdfTitleElement, elementToExport.firstChild);


    const opt = {
      margin:       [10, 10, 10, 10], // margens em mm (top, left, bottom, right)
      filename:     `relatorio_${pacienteNome.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0, windowWidth: elementToExport.scrollWidth, windowHeight: elementToExport.scrollHeight },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    toast.info("Gerando PDF... Isso pode levar alguns segundos.");

    html2pdf().from(elementToExport).set(opt).save()
      .then(() => {
        toast.success(`Relatório ${modoConsolidado ? 'consolidado' : 'individual'} exportado em PDF com sucesso!`);
      })
      .catch((err) => {
        console.error("Erro ao gerar PDF:", err);
        toast.error("Erro ao gerar PDF. Verifique o console para mais detalhes.");
      });
  };
  
  const handleImprimir = () => {
    toast.success(`Enviando relatório ${modoConsolidado ? 'consolidado' : 'individual'} para impressão...`);
    setTimeout(() => window.print(), 500);
  };

  return (
    <>
      {/* Div dos botões de controle, que será removido no clone para exportação PDF */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {modoConsolidado ? 'Relatório Consolidado' : 'Relatório de Avaliação'}
            </h2>
            <div className="text-muted-foreground mt-1">
              {pacienteNome} • {idadeAtual}
              {!modoConsolidado && dataFormatada && ` • ${dataFormatada}`}
            </div>
          </div>
        </div>
        {!hideControls && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onModoChange}
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
        )}
      </div>
      
      {/* Este título é para a visualização de impressão do navegador, não para o PDF gerado por html2pdf.js */}
      <div className="print:mt-0 print:mb-6">
        <div className="text-center border-b pb-4 print:block hidden">
          <h1 className="text-2xl font-bold mb-2">
            {modoConsolidado 
              ? 'Relatório Consolidado de Avaliações Cranianas' 
              : 'Relatório de Avaliação Craniana'}
          </h1>
          <p>
            Paciente: {pacienteNome} • {idadeAtual} • 
            {dataFormatada && ` Data: ${dataFormatada}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Profissional: {profissionalNome} • Clínica: {clinicaNome}
          </p>
        </div>
      </div>
    </>
  );
}
