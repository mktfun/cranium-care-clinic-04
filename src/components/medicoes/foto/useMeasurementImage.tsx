
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";

interface MeasurementPoint {
  x: number;
  y: number;
  label: string;
}

export default function useMeasurementImage(pacienteDataNascimento: string) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: upload, 2: review
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [calibrationFactor, setCalibrationFactor] = useState<number | null>(null);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationStart, setCalibrationStart] = useState<{x: number, y: number} | null>(null);
  const [calibrationEnd, setCalibrationEnd] = useState<{x: number, y: number} | null>(null);
  const [measurementMode, setMeasurementMode] = useState<string | null>(null);
  const [perimetroError, setPerimetroError] = useState<string | null>(null);

  const handleCapturarFoto = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A captura de fotos estará disponível em breve.",
    });
  };

  const handleUploadFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Criar um objeto URL para a prévia da imagem
      const fileUrl = URL.createObjectURL(file);
      setUploadedImage(fileUrl);
      setUploading(false);
      setActiveStep(2); // Avança para o modo de medição
      // Reset measurement points
      setMeasurementPoints([]);
      setCalibrationFactor(null);
      setCalibrationMode(false);
      setCalibrationStart(null);
      setCalibrationEnd(null);
      setMeasurementMode(null);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da foto.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const imageElement = event.currentTarget;
    if (!imageElement || !uploadedImage) return;

    const rect = imageElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to relative coordinates within the image
    const relX = x / rect.width;
    const relY = y / rect.height;

    if (calibrationMode) {
      if (!calibrationStart) {
        setCalibrationStart({ x: relX, y: relY });
        toast({
          title: "Ponto inicial definido",
          description: "Agora clique no ponto final da régua/referência.",
        });
      } else {
        setCalibrationEnd({ x: relX, y: relY });
        // Ask the user for the real-world length
        const length = prompt("Informe o comprimento real em milímetros:");
        if (length && !isNaN(Number(length))) {
          // Calculate calibration factor (mm/px)
          const dx = relX - calibrationStart.x;
          const dy = relY - calibrationStart.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const factor = Number(length) / (distance * imageElement.width);
          setCalibrationFactor(factor);
          setCalibrationMode(false);
          toast({
            title: "Calibração concluída",
            description: `Fator de calibração: ${factor.toFixed(4)} mm/px`,
          });
        } else {
          toast({
            title: "Erro de calibração",
            description: "Por favor, informe um valor numérico válido.",
            variant: "destructive",
          });
          setCalibrationStart(null);
          setCalibrationEnd(null);
        }
      }
      return;
    }

    if (measurementMode) {
      // Add the point based on the current measurement mode
      const existingPoints = measurementPoints.filter(p => p.label.startsWith(measurementMode));
      
      if (existingPoints.length < 2) {
        const label = existingPoints.length === 0 
          ? `${measurementMode}-start` 
          : `${measurementMode}-end`;
        
        setMeasurementPoints([
          ...measurementPoints,
          { x: relX, y: relY, label }
        ]);
        
        if (existingPoints.length === 1) {
          setMeasurementMode(null);
          toast({
            title: `${measurementMode === 'comprimento' ? 'Comprimento' : 
                    measurementMode === 'largura' ? 'Largura' : 
                    measurementMode === 'diagonalD' ? 'Diagonal D' : 'Diagonal E'} definido`,
            description: "Agora selecione a próxima medida a ser realizada.",
          });
        }
      }
    }
  };

  const calculateMeasurements = () => {
    if (!calibrationFactor) {
      toast({
        title: "Calibração necessária",
        description: "Por favor, calibre a imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    // Helper function to find points by label prefix
    const getPointsByPrefix = (prefix: string) => measurementPoints.filter(p => p.label.startsWith(prefix));
    
    // Get the image element to calculate actual pixel distances
    const imageElement = document.querySelector('img[alt="Foto do paciente"]') as HTMLImageElement;
    if (!imageElement) return;
    
    const imgWidth = imageElement.width;
    
    // Calculate distances
    const calculateDistance = (points: MeasurementPoint[]) => {
      if (points.length !== 2) return null;
      
      const dx = (points[1].x - points[0].x) * imgWidth;
      const dy = (points[1].y - points[0].y) * imgWidth;
      return Math.sqrt(dx * dx + dy * dy) * calibrationFactor;
    };

    const comprimentoPoints = getPointsByPrefix('comprimento');
    const larguraPoints = getPointsByPrefix('largura');
    const diagonalDPoints = getPointsByPrefix('diagonalD');
    const diagonalEPoints = getPointsByPrefix('diagonalE');

    const comprimento = calculateDistance(comprimentoPoints);
    const largura = calculateDistance(larguraPoints);
    const diagonalD = calculateDistance(diagonalDPoints);
    const diagonalE = calculateDistance(diagonalEPoints);

    // Simple perimetro estimado (this is a rough estimation that can be improved)
    const perimetroCefalico = comprimento && largura 
      ? Math.round(2 * Math.PI * Math.sqrt((Math.pow(comprimento/2, 2) + Math.pow(largura/2, 2)) / 2))
      : null;

    // Check if we have all required measurements
    if (!comprimento || !largura || !diagonalD || !diagonalE) {
      toast({
        title: "Medições incompletas",
        description: "Por favor, complete todas as medições necessárias.",
        variant: "destructive",
      });
      return;
    }

    // Round to integers for display
    const newMeasurements = {
      comprimento: Math.round(comprimento),
      largura: Math.round(largura),
      diagonalD: Math.round(diagonalD),
      diagonalE: Math.round(diagonalE),
      perimetroCefalico: perimetroCefalico
    };

    // Validar o perímetro cefálico calculado
    if (perimetroCefalico && pacienteDataNascimento) {
      const validation = validatePerimetroCefalico(perimetroCefalico, pacienteDataNascimento);
      if (!validation.isValid) {
        setPerimetroError(validation.message || "Perímetro cefálico calculado está fora dos limites esperados");
        toast({
          title: "Atenção",
          description: `${validation.message} - Verifique se a calibração está correta`,
          variant: "destructive",
        });
      } else {
        setPerimetroError(null);
      }
    }

    setMeasurements(newMeasurements);
    setProcessingImage(true);
    
    // Simulate processing time for UX
    setTimeout(() => {
      setProcessingImage(false);
      toast({
        title: "Foto processada com sucesso",
        description: "Os valores foram extraídos e estão prontos para revisão.",
      });
    }, 800);
  };

  return {
    uploadedImage,
    setUploadedImage,
    measurements,
    setMeasurements,
    processingImage,
    setProcessingImage,
    uploading,
    setUploading,
    activeStep,
    setActiveStep,
    measurementPoints,
    setMeasurementPoints,
    calibrationFactor,
    setCalibrationFactor,
    calibrationMode,
    setCalibrationMode,
    calibrationStart,
    setCalibrationStart,
    calibrationEnd,
    setCalibrationEnd,
    measurementMode,
    setMeasurementMode,
    perimetroError,
    setPerimetroError,
    handleCapturarFoto,
    handleUploadFoto,
    handleImageClick,
    calculateMeasurements
  };
}
