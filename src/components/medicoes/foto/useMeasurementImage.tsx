
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";
import { 
  detectEdges, 
  detectHeadContour, 
  findMeasurementPoints, 
  detectCalibrationObject,
  refineDetectedPoints,
  estimateHeadParameters
} from "@/lib/image-detection-utils";

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
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [canvasElem, setCanvasElem] = useState<HTMLCanvasElement | null>(null);

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
  };

  // Enhanced Auto-detection function that uses real image processing techniques
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
    setDetectionProgress(10);
    
    toast({
      title: "Detecção iniciada",
      description: "Analisando imagem para identificar pontos de medição...",
    });

    try {
      // Create a new image element to process
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = uploadedImage;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Get the dimensions of the image
      const width = img.width;
      const height = img.height;
      
      setDetectionProgress(20);
      
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Não foi possível criar o contexto de canvas");
      }
      
      // Set canvas for debugging/visualization if needed
      setCanvasElem(canvas);
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, width, height);
      
      setDetectionProgress(30);
      
      // Step 1: Detect edges in the image
      const edgeData = detectEdges(imageData, width, height);
      
      // Optional: Draw edges to canvas for debugging
      // ctx.putImageData(edgeData, 0, 0);
      
      setDetectionProgress(50);
      
      // Step 2: Detect head contour from edges
      const contourPoints = detectHeadContour(edgeData, width, height);
      
      setDetectionProgress(65);
      
      // Step 3: Find key measurement points from contour
      const initialPoints = findMeasurementPoints(contourPoints);
      
      setDetectionProgress(75);
      
      // Step 4: Refine detected points
      const refinedPoints = refineDetectedPoints(initialPoints, imageData, width, height);
      
      setDetectionProgress(85);
      
      // Reset existing points
      setMeasurementPoints([]);
      
      // Format points for the existing system
      const formattedPoints: MeasurementPoint[] = [
        // Comprimento (front to back)
        { x: refinedPoints.comprimentoStart.x, y: refinedPoints.comprimentoStart.y, label: 'comprimento-start' },
        { x: refinedPoints.comprimentoEnd.x, y: refinedPoints.comprimentoEnd.y, label: 'comprimento-end' },
        
        // Largura (side to side)
        { x: refinedPoints.larguraStart.x, y: refinedPoints.larguraStart.y, label: 'largura-start' },
        { x: refinedPoints.larguraEnd.x, y: refinedPoints.larguraEnd.y, label: 'largura-end' },
        
        // Diagonal D
        { x: refinedPoints.diagonalDStart.x, y: refinedPoints.diagonalDStart.y, label: 'diagonalD-start' },
        { x: refinedPoints.diagonalDEnd.x, y: refinedPoints.diagonalDEnd.y, label: 'diagonalD-end' },
        
        // Diagonal E
        { x: refinedPoints.diagonalEStart.x, y: refinedPoints.diagonalEStart.y, label: 'diagonalE-start' },
        { x: refinedPoints.diagonalEEnd.x, y: refinedPoints.diagonalEEnd.y, label: 'diagonalE-end' },
      ];
      
      // Step 5: Look for calibration object if no calibration is set
      if (!calibrationFactor) {
        const detectedCalibration = detectCalibrationObject(imageData, width, height);
        if (detectedCalibration) {
          setCalibrationStart(detectedCalibration.start);
          setCalibrationEnd(detectedCalibration.end);
          
          // Ask user to confirm the calibration
          setTimeout(() => {
            toast({
              title: "Objeto de calibração detectado",
              description: "Por favor, confirme o tamanho do objeto de referência.",
            });
            
            const defaultSize = 100; // 10cm in mm
            const sizeInput = prompt("Confirme o tamanho do objeto de calibração em milímetros:", defaultSize.toString());
            
            if (sizeInput && !isNaN(Number(sizeInput))) {
              const realSize = Number(sizeInput);
              const dx = (detectedCalibration.end.x - detectedCalibration.start.x) * width;
              const dy = (detectedCalibration.end.y - detectedCalibration.start.y) * width;
              const pixelDistance = Math.sqrt(dx * dx + dy * dy);
              const factor = realSize / pixelDistance;
              
              setCalibrationFactor(factor);
            } else {
              toast({
                title: "Calibração manual necessária",
                description: "Não foi possível configurar calibração automaticamente. Por favor, calibre manualmente.",
                variant: "warning"
              });
            }
          }, 1000);
        }
      }
      
      setDetectionProgress(95);
      
      // Add points with a visual delay to simulate processing
      let pointIndex = 0;
      const pointInterval = setInterval(() => {
        if (pointIndex < formattedPoints.length) {
          setMeasurementPoints(prev => [...prev, formattedPoints[pointIndex]]);
          pointIndex++;
        } else {
          clearInterval(pointInterval);
          
          // Finish detection
          setAutoDetecting(false);
          setDetectionProgress(100);
          
          toast({
            title: "Detecção concluída",
            description: "Pontos identificados automaticamente. Utilize o modo de ajustes para refinar se necessário.",
            variant: "success"
          });
          
          // Calculate measurements with a short delay
          setTimeout(() => {
            if (calibrationFactor) {
              calculateMeasurements();
            } else {
              toast({
                title: "Calibração necessária",
                description: "Por favor, calibre a imagem antes de calcular as medidas.",
                variant: "warning"
              });
            }
          }, 500);
        }
      }, 100); // Add a point every 100ms for visual effect
      
    } catch (error) {
      console.error("Erro na detecção automática:", error);
      setAutoDetecting(false);
      setDetectionProgress(0);
      
      toast({
        title: "Erro na detecção",
        description: "Não foi possível detectar os pontos automaticamente. Tente novamente ou utilize o modo manual.",
        variant: "destructive",
      });
    }
  };

  // Updated to use the new estimateHeadParameters function
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
    const getPointsByPrefix = (prefix: string) => measurementPoints.filter(p => p && p.label && p.label.startsWith(prefix));
    
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
        variant: "success",
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
    // Auto detection
    autoDetectMeasurements,
    autoDetecting,
    detectionProgress,
    canvasElem,
    handleCapturarFoto,
    handleUploadFoto,
    handleImageClick,
    calculateMeasurements
  };
}
