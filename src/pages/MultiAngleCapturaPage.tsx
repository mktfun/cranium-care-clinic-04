
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";

import CaptureProgressBar from "@/components/medicoes/foto/multiAngulo/CaptureProgressBar";
import CaptureInstructions from "@/components/medicoes/foto/multiAngulo/CaptureInstructions";
import PhotoCaptureView from "@/components/medicoes/foto/multiAngulo/PhotoCaptureView";
import PhotoReviewCard from "@/components/medicoes/foto/multiAngulo/PhotoReviewCard";
import useMultiAngleCapture from "@/components/medicoes/foto/multiAngulo/useMultiAngleCapture";

// Enum for capture steps
export type CaptureStep = "superior" | "lateral" | "frontal" | "review";

export default function MultiAngleCapturaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use custom hook for managing the capture process
  const {
    currentStep,
    capturedPhotos,
    isCapturing,
    isProcessing,
    calibrationObject,
    setCalibrationObject,
    handleCapturePhoto,
    handleUploadPhoto,
    handleRetakePhoto,
    goToNextStep,
    goToPreviousStep,
    handleConfirmAllPhotos
  } = useMultiAngleCapture();

  useEffect(() => {
    async function loadPacienteData() {
      setLoading(true);
      try {
        if (id) {
          const { data: pacienteData, error } = await supabase
            .from("pacientes")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          
          if (error || !pacienteData) {
            toast({
              title: "Erro",
              description: "Paciente não encontrado ou erro ao carregar.",
              variant: "destructive",
            });
            navigate("/pacientes");
            return;
          } else {
            setPaciente(pacienteData);
          }
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do paciente",
          variant: "destructive",
        });
        navigate("/pacientes");
      } finally {
        setLoading(false);
      }
    }
    
    loadPacienteData();
  }, [id, navigate]);

  // Function to get step index for progress bar
  const getStepIndex = () => {
    switch (currentStep) {
      case "superior": return 0;
      case "lateral": return 1;
      case "frontal": return 2;
      case "review": return 3;
      default: return 0;
    }
  };

  // Function to get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case "superior": return "Vista Superior (Topo)";
      case "lateral": return "Vista Lateral";
      case "frontal": return "Vista Frontal";
      case "review": return "Revisão das Fotos";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/pacientes/${id}`)}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Medição Multi-Ângulo</h2>
            {paciente && (
              <p className="text-muted-foreground">
                Paciente: {paciente.nome} • {formatAgeHeader(paciente.data_nascimento)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="bg-primary/20" />

      {/* Progress Bar */}
      <CaptureProgressBar currentStep={getStepIndex()} totalSteps={4} />
      
      {/* Step Title */}
      <h3 className="text-2xl font-bold text-center">{getStepTitle()}</h3>
      
      {/* Main Content */}
      <div className="space-y-6">
        {currentStep !== "review" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructions Card */}
            <CaptureInstructions 
              currentStep={currentStep} 
              previousPhoto={currentStep === "superior" ? null : capturedPhotos[currentStep === "lateral" ? "superior" : "lateral"]}
            />
            
            {/* Photo Capture Card */}
            <PhotoCaptureView
              currentStep={currentStep}
              previousPhoto={currentStep === "superior" ? null : capturedPhotos[currentStep === "lateral" ? "superior" : "lateral"]}
              isCapturing={isCapturing}
              isProcessing={isProcessing}
              onCapturePhoto={handleCapturePhoto}
              onUploadPhoto={handleUploadPhoto}
              calibrationObject={calibrationObject}
              setCalibrationObject={setCalibrationObject}
            />
          </div>
        ) : (
          /* Review Screen */
          <PhotoReviewCard 
            capturedPhotos={capturedPhotos} 
            onRetakePhoto={handleRetakePhoto}
            calibrationObject={calibrationObject}
          />
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={currentStep === "superior" 
            ? () => navigate(`/pacientes/${id}`) 
            : goToPreviousStep}
          className="border-primary/20 hover:border-primary/40 transition-colors"
        >
          {currentStep === "superior" ? "Cancelar" : "Voltar"}
        </Button>
        
        {currentStep !== "review" ? (
          <Button
            onClick={goToNextStep}
            disabled={currentStep !== "superior" && !capturedPhotos[currentStep]}
            className="bg-turquesa hover:bg-turquesa/90 shadow-md hover:shadow-lg transition-all"
          >
            {capturedPhotos[currentStep] ? "Próximo" : "Pular (Não Recomendado)"}
          </Button>
        ) : (
          <Button 
            onClick={() => handleConfirmAllPhotos(id)}
            className="bg-turquesa hover:bg-turquesa/90 shadow-md hover:shadow-lg transition-all"
          >
            Confirmar e Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
