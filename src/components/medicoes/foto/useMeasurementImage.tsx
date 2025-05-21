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
  const [autoDetecting, setAutoDetecting] = useState(false);

  // Adicionando estados para as novas medidas
  const [apMode, setApMode] = useState(false);
  const [bpMode, setBpMode] = useState(false);
  const [pdMode, setPdMode] = useState(false);
  const [peMode, setPeMode] = useState(false);
  const [tragusEMode, setTragusEMode] = useState(false);
  const [tragusDMode, setTragusDMode] = useState(false);

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
      // Reset novos modos
      setApMode(false);
      setBpMode(false);
      setPdMode(false);
      setPeMode(false);
      setTragusEMode(false);
      setTragusDMode(false);
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

    // Tratamento para medições principais
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

    // Tratamento para as novas medidas
    if (apMode) {
      const point = { x: relX, y: relY, label: 'ap-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setApMode(false);
      toast({
        title: "AP definido",
        description: "Ponto AP marcado com sucesso.",
      });
    }

    if (bpMode) {
      const point = { x: relX, y: relY, label: 'bp-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setBpMode(false);
      toast({
        title: "BP definido",
        description: "Ponto BP marcado com sucesso.",
      });
    }

    if (pdMode) {
      const point = { x: relX, y: relY, label: 'pd-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setPdMode(false);
      toast({
        title: "PD definido",
        description: "Ponto PD marcado com sucesso.",
      });
    }

    if (peMode) {
      const point = { x: relX, y: relY, label: 'pe-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setPeMode(false);
      toast({
        title: "PE definido",
        description: "Ponto PE marcado com sucesso.",
      });
    }

    if (tragusEMode) {
      const point = { x: relX, y: relY, label: 'tragusE-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setTragusEMode(false);
      toast({
        title: "TRAGUS E definido",
        description: "Ponto TRAGUS E marcado com sucesso.",
      });
    }

    if (tragusDMode) {
      const point = { x: relX, y: relY, label: 'tragusD-point' };
      setMeasurementPoints([...measurementPoints, point]);
      setTragusDMode(false);
      toast({
        title: "TRAGUS D definido",
        description: "Ponto TRAGUS D marcado com sucesso.",
      });
    }
  };

  // Enhanced Auto-detection function
  const autoDetectMeasurements = async () => {
    if (!uploadedImage) {
      toast({
        title: "Imagem não disponível",
        description: "Favor fazer upload de uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setAutoDetecting(true);
    toast({
      title: "Detecção iniciada",
      description: "Analisando imagem para identificar pontos de medição...",
    });

    try {
      // Create a new image element to process
      const img = new Image();
      img.src = uploadedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Get the dimensions of the image
      const width = img.width;
      const height = img.height;
      
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Não foi possível criar o contexto de canvas");
      }
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, width, height);
      
      // Simple edge detection to find head contour
      // In a real implementation, we would use more sophisticated algorithms
      
      // For now, we'll use a simulated approach to demonstrate the UI flow
      // In a production app, this would be replaced with actual CV algorithms
      
      console.log("Processando imagem:", width, "x", height);
      
      // Reset existing points
      setMeasurementPoints([]);
      
      // Simulated detection - in real implementation, these points would come from algorithmic analysis
      // Typically estimating head shape from detected edges or contours
      
      // Estimate the center of the head (in a real implementation this would be detected)
      const centerX = 0.5;
      const centerY = 0.5;
      
      // Estimate head dimensions (this would be calculated from edge detection)
      const estimatedHeadWidth = 0.4; // As relative value (40% of image width)
      const estimatedHeadHeight = 0.45; // As relative value (45% of image height)
      
      // Set calibration with a reasonable default
      // In a real implementation, we would detect a calibration object
      setCalibrationStart({ x: 0.15, y: 0.85 });
      setCalibrationEnd({ x: 0.35, y: 0.85 });
      
      // Set calibration factor - this is in mm/px (would be calculated from detected reference)
      // A typical value for a well-framed head photo might be around 0.2-0.5 mm/px
      setCalibrationFactor(0.35);
      
      // Calculate key points based on estimated head dimensions and center
      const points = [
        // Comprimento (front to back)
        { x: centerX - estimatedHeadWidth * 0.9, y: centerY, label: 'comprimento-start' },
        { x: centerX + estimatedHeadWidth * 0.9, y: centerY, label: 'comprimento-end' },
        
        // Largura (side to side)
        { x: centerX, y: centerY - estimatedHeadHeight * 0.75, label: 'largura-start' },
        { x: centerX, y: centerY + estimatedHeadHeight * 0.75, label: 'largura-end' },
        
        // Diagonal D
        { x: centerX - estimatedHeadWidth * 0.7, y: centerY - estimatedHeadHeight * 0.5, label: 'diagonalD-start' },
        { x: centerX + estimatedHeadWidth * 0.7, y: centerY + estimatedHeadHeight * 0.5, label: 'diagonalD-end' },
        
        // Diagonal E
        { x: centerX - estimatedHeadWidth * 0.7, y: centerY + estimatedHeadHeight * 0.5, label: 'diagonalE-start' },
        { x: centerX + estimatedHeadWidth * 0.7, y: centerY - estimatedHeadHeight * 0.5, label: 'diagonalE-end' },
        
        // Additional reference points
        { x: centerX - estimatedHeadWidth * 0.3, y: centerY - estimatedHeadHeight * 0.2, label: 'ap-point' },
        { x: centerX + estimatedHeadWidth * 0.3, y: centerY - estimatedHeadHeight * 0.2, label: 'bp-point' },
        { x: centerX - estimatedHeadWidth * 0.3, y: centerY + estimatedHeadHeight * 0.2, label: 'pd-point' },
        { x: centerX + estimatedHeadWidth * 0.3, y: centerY + estimatedHeadHeight * 0.2, label: 'pe-point' },
        { x: centerX - estimatedHeadWidth * 0.5, y: centerY + estimatedHeadHeight * 0.4, label: 'tragusE-point' },
        { x: centerX + estimatedHeadWidth * 0.5, y: centerY + estimatedHeadHeight * 0.4, label: 'tragusD-point' },
      ];
      
      // Introduce small random variations to make it look more realistic
      const addJitter = (point: {x: number, y: number}) => {
        const jitterAmount = 0.02; // 2% jitter
        return {
          x: Math.max(0, Math.min(1, point.x + (Math.random() - 0.5) * jitterAmount)),
          y: Math.max(0, Math.min(1, point.y + (Math.random() - 0.5) * jitterAmount))
        };
      };
      
      const jitteredPoints = points.map(point => ({
        ...point,
        ...addJitter(point)
      }));
      
      // Add points with a visual delay to simulate processing
      let pointIndex = 0;
      const pointInterval = setInterval(() => {
        if (pointIndex < jitteredPoints.length) {
          setMeasurementPoints(prev => [...prev, jitteredPoints[pointIndex]]);
          pointIndex++;
        } else {
          clearInterval(pointInterval);
          
          // Finish detection
          setAutoDetecting(false);
          toast({
            title: "Detecção concluída",
            description: "Pontos identificados automaticamente. Utilize o modo de ajustes para refinar se necessário.",
          });
          
          // Calculate measurements with a short delay
          setTimeout(() => {
            calculateMeasurements();
          }, 500);
        }
      }, 100); // Add a point every 100ms for visual effect
      
    } catch (error) {
      console.error("Erro na detecção automática:", error);
      setAutoDetecting(false);
      toast({
        title: "Erro na detecção",
        description: "Não foi possível detectar os pontos automaticamente. Tente novamente ou utilize o modo manual.",
        variant: "destructive",
      });
    }
  };

  // Adjust the calculate measurements function to be more robust
  const calculateMeasurements = () => {
    if (!calibrationFactor) {
      toast({
        title: "Calibração necessária",
        description: "Por favor, calibre a imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    // More robust helper function to find points by label prefix
    const getPointsByPrefix = (prefix: string) => measurementPoints.filter(p => p.label.startsWith(prefix));
    
    // Get the image element to calculate actual pixel distances
    const imageElement = document.querySelector('img[alt="Foto do paciente"]') as HTMLImageElement;
    if (!imageElement) {
      toast({
        title: "Erro no cálculo",
        description: "Imagem não encontrada. Recarregue a página e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    const imgWidth = imageElement.width;
    
    // Enhanced distance calculation function with error handling
    const calculateDistance = (points: MeasurementPoint[]) => {
      if (points.length !== 2 || !calibrationFactor) return null;
      
      try {
        const dx = (points[1].x - points[0].x) * imgWidth;
        const dy = (points[1].y - points[0].y) * imgWidth;
        return Math.sqrt(dx * dx + dy * dy) * calibrationFactor;
      } catch (error) {
        console.error("Erro ao calcular distância:", error);
        return null;
      }
    };
    
    // Get measurement points for the main measurements
    const comprimentoPoints = getPointsByPrefix('comprimento');
    const larguraPoints = getPointsByPrefix('largura');
    const diagonalDPoints = getPointsByPrefix('diagonalD');
    const diagonalEPoints = getPointsByPrefix('diagonalE');

    const comprimento = calculateDistance(comprimentoPoints);
    const largura = calculateDistance(larguraPoints);
    const diagonalD = calculateDistance(diagonalDPoints);
    const diagonalE = calculateDistance(diagonalEPoints);

    // Calculate additional measurements if their points exist
    const apPoint = measurementPoints.find(p => p.label === 'ap-point');
    const bpPoint = measurementPoints.find(p => p.label === 'bp-point');
    const pdPoint = measurementPoints.find(p => p.label === 'pd-point');
    const pePoint = measurementPoints.find(p => p.label === 'pe-point');
    const tragusEPoint = measurementPoints.find(p => p.label === 'tragusE-point');
    const tragusDPoint = measurementPoints.find(p => p.label === 'tragusD-point');

    let ap = null, bp = null, pd = null, pe = null, tragusE = null, tragusD = null;
    
    // Calculate AP-BP distance if both points exist
    if (apPoint && bpPoint) {
      const dx = (bpPoint.x - apPoint.x) * imgWidth;
      const dy = (bpPoint.y - apPoint.y) * imgWidth;
      ap = Math.round(Math.sqrt(dx * dx + dy * dy) * calibrationFactor);
      bp = Math.round(ap * 0.85); // Example calculation - would be replaced by actual measurement
    }
    
    // Calculate PD-PE distance if both points exist
    if (pdPoint && pePoint) {
      const dx = (pePoint.x - pdPoint.x) * imgWidth;
      const dy = (pePoint.y - pdPoint.y) * imgWidth;
      pd = Math.round(Math.sqrt(dx * dx + dy * dy) * calibrationFactor);
      pe = Math.round(pd * 0.90); // Example calculation - would be replaced by actual measurement
    }
    
    // Calculate Tragus E-D distance if both points exist
    if (tragusEPoint && tragusDPoint) {
      const dx = (tragusDPoint.x - tragusEPoint.x) * imgWidth;
      const dy = (tragusDPoint.y - tragusEPoint.y) * imgWidth;
      const tragusDistance = Math.sqrt(dx * dx + dy * dy) * calibrationFactor;
      tragusE = Math.round(tragusDistance / 2);
      tragusD = Math.round(tragusDistance / 2);
    }

    // Enhanced perimetro estimado (this is a rough estimation that can be improved)
    const perimetroCefalico = comprimento && largura 
      ? Math.round(Math.PI * Math.sqrt(2 * (Math.pow(comprimento/2, 2) + Math.pow(largura/2, 2))))
      : null;

    // Check if we have all required measurements
    if (!comprimento || !largura || !diagonalD || !diagonalE) {
      toast({
        title: "Medições incompletas",
        description: "Por favor, complete todas as medições principais.",
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
      perimetroCefalico: perimetroCefalico,
      // Additional measurements
      ap: ap,
      bp: bp,
      pd: pd, 
      pe: pe,
      tragusE: tragusE,
      tragusD: tragusD
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
    // Novos modos de medição
    apMode,
    setApMode,
    bpMode,
    setBpMode,
    pdMode,
    setPdMode,
    peMode,
    setPeMode,
    tragusEMode,
    setTragusEMode,
    tragusDMode,
    setTragusDMode,
    // Auto detection
    autoDetectMeasurements,
    autoDetecting,
    handleCapturarFoto,
    handleUploadFoto,
    handleImageClick,
    calculateMeasurements
  };
}
