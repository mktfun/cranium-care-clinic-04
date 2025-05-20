
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CaptureStep } from "@/pages/MultiAngleCapturaPage";

// Type definitions
type CapturedPhotos = {
  superior: string | null;
  lateral: string | null;
  frontal: string | null;
};

type CalibrationObject = {
  type: "ruler" | "coin" | "custom";
  size: number; // in millimeters
  position: { x: number; y: number } | null;
};

export default function useMultiAngleCapture() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CaptureStep>("superior");
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos>({
    superior: null,
    lateral: null,
    frontal: null
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calibrationObject, setCalibrationObject] = useState<CalibrationObject>({
    type: "ruler",
    size: 100, // Default 10cm ruler
    position: null
  });
  
  // Reference to camera element
  const cameraRef = useRef<HTMLVideoElement | null>(null);

  // Handle capturing a photo
  const handleCapturePhoto = useCallback(async () => {
    setIsCapturing(true);
    try {
      // In a real implementation, this would access the camera and take a photo
      // For now, let's simulate a capture with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here we would actually capture from camera stream and convert to base64
      // For now, let's use a placeholder image
      const photoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUh..."; // Placeholder data
      
      // Update captured photos with the new photo
      setCapturedPhotos(prev => ({
        ...prev,
        [currentStep]: photoBase64
      }));
      
      toast({
        title: "Foto capturada",
        description: `Vista ${currentStep} capturada com sucesso.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível capturar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  }, [currentStep]);

  // Handle uploading a photo
  const handleUploadPhoto = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update captured photos with the uploaded photo
        setCapturedPhotos(prev => ({
          ...prev,
          [currentStep]: base64String
        }));
        
        toast({
          title: "Foto carregada",
          description: `Imagem para vista ${currentStep} carregada com sucesso.`,
          variant: "success",
        });
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [currentStep]);

  // Handle retaking a photo
  const handleRetakePhoto = useCallback((step: keyof CapturedPhotos) => {
    setCapturedPhotos(prev => ({
      ...prev,
      [step]: null
    }));
    setCurrentStep(step);
    
    toast({
      title: "Refazer foto",
      description: `Você pode capturar novamente a vista ${step}.`,
    });
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    switch (currentStep) {
      case "superior":
        setCurrentStep("lateral");
        break;
      case "lateral":
        setCurrentStep("frontal");
        break;
      case "frontal":
        setCurrentStep("review");
        break;
      default:
        break;
    }
  }, [currentStep]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    switch (currentStep) {
      case "lateral":
        setCurrentStep("superior");
        break;
      case "frontal":
        setCurrentStep("lateral");
        break;
      case "review":
        setCurrentStep("frontal");
        break;
      default:
        break;
    }
  }, [currentStep]);

  // Handle confirming all photos and continuing to measurements
  const handleConfirmAllPhotos = useCallback((pacienteId: string | undefined) => {
    if (!pacienteId) {
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if at least one photo was captured
    const hasAtLeastOnePhoto = Object.values(capturedPhotos).some(photo => photo !== null);
    
    if (!hasAtLeastOnePhoto) {
      toast({
        title: "Erro",
        description: "Capture pelo menos uma foto para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to measurement page with the photos
    navigate(`/pacientes/${pacienteId}/nova-medicao`, {
      state: {
        multiAnglePhotos: capturedPhotos,
        calibrationObject
      }
    });
    
  }, [capturedPhotos, calibrationObject, navigate]);

  return {
    currentStep,
    capturedPhotos,
    isCapturing,
    isProcessing,
    calibrationObject,
    setCalibrationObject,
    cameraRef,
    handleCapturePhoto,
    handleUploadPhoto,
    handleRetakePhoto,
    goToNextStep,
    goToPreviousStep,
    handleConfirmAllPhotos
  };
}
