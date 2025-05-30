
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";

export function usePDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadPDF = async (
    pdfComponent: React.ReactElement,
    filename: string
  ) => {
    setIsGenerating(true);
    
    try {
      toast.loading("Gerando PDF...");
      
      // Gera o PDF como blob
      const blob = await pdf(pdfComponent).toBlob();
      
      // Cria URL para download
      const url = URL.createObjectURL(blob);
      
      // Cria elemento de link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      
      // Dispara o download
      link.click();
      
      // Limpa recursos
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success("PDF gerado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.dismiss();
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFBlob = async (pdfComponent: React.ReactElement): Promise<Blob> => {
    setIsGenerating(true);
    
    try {
      const blob = await pdf(pdfComponent).toBlob();
      return blob;
    } catch (error) {
      console.error("Erro ao gerar PDF blob:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAndDownloadPDF,
    generatePDFBlob,
    isGenerating
  };
}
