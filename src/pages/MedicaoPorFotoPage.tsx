
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";

// Import our new components
import PhotoInstructionsCard from "@/components/medicoes/foto/PhotoInstructionsCard";
import PhotoCaptureCard from "@/components/medicoes/foto/PhotoCaptureCard";
import MeasurementImageCard from "@/components/medicoes/foto/MeasurementImageCard";
import MeasurementResultsCard from "@/components/medicoes/foto/MeasurementResultsCard";
import useMeasurementImage from "@/components/medicoes/foto/useMeasurementImage";

export default function MedicaoPorFotoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use our custom hook to handle the photo measurement functionality
  const {
    uploadedImage,
    measurements,
    setMeasurements,
    processingImage,
    uploading,
    activeStep,
    setActiveStep,
    measurementPoints,
    calibrationFactor,
    calibrationMode,
    setCalibrationMode,
    calibrationStart,
    calibrationEnd,
    measurementMode,
    setMeasurementMode,
    perimetroError,
    handleCapturarFoto,
    handleUploadFoto,
    handleImageClick,
    calculateMeasurements
  } = useMeasurementImage(paciente?.data_nascimento || "");

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

  const handleConfirmMeasurements = () => {
    // Verificar novamente o perímetro cefálico antes de continuar
    if (measurements && paciente) {
      const validation = validatePerimetroCefalico(
        measurements.perimetroCefalico, 
        paciente.data_nascimento
      );
      
      if (!validation.isValid) {
        toast({
          title: "Erro no perímetro cefálico",
          description: `${validation.message} - Ajuste a calibração ou corrija o valor manualmente na próxima tela.`,
          variant: "destructive",
        });
      }
    }
    
    navigate(`/pacientes/${id}/nova-medicao`, { 
      state: { 
        photoProcessed: true,
        measurements,
        photoUrl: uploadedImage
      } 
    });
  };

  const handleGoToManualForm = () => {
    console.log("Navigating to manual form with fromManualButton=true");
    
    // If we have measurements from the photo, pass them to manual form
    if (measurements) {
      navigate(`/pacientes/${id}/nova-medicao`, { 
        state: { 
          photoProcessed: true,
          measurements,
          photoUrl: uploadedImage,
          fromManualButton: true  // Flag to indicate this came from manual button
        },
        replace: true  // Use replace to prevent back navigation to photo page
      });
    } else {
      // If no measurements yet, just navigate to manual form
      navigate(`/pacientes/${id}/nova-medicao`, { 
        state: { fromManualButton: true },
        replace: true  // Use replace to prevent back navigation to photo page
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoInstructionsCard />
              <PhotoCaptureCard
                handleUploadFoto={handleUploadFoto}
                handleCapturarFoto={handleCapturarFoto}
                uploading={uploading}
                processingImage={processingImage}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MeasurementImageCard
                uploadedImage={uploadedImage}
                calibrationMode={calibrationMode}
                setCalibrationMode={setCalibrationMode}
                measurementMode={measurementMode}
                setMeasurementMode={setMeasurementMode}
                calibrationFactor={calibrationFactor}
                calibrationStart={calibrationStart}
                calibrationEnd={calibrationEnd}
                measurementPoints={measurementPoints}
                measurements={measurements}
                handleImageClick={handleImageClick}
                calculateMeasurements={calculateMeasurements}
                setMeasurements={setMeasurements}
              />
              
              <MeasurementResultsCard
                processingImage={processingImage}
                measurements={measurements}
                perimetroError={perimetroError}
              />
            </div>
          </div>
        );
      default:
        return null;
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
            <h2 className="text-3xl font-bold">Medição por Foto</h2>
            {paciente && (
              <p className="text-muted-foreground">
                Paciente: {paciente.nome} • {formatAgeHeader(paciente.data_nascimento)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="bg-primary/20" />
      
      {renderStepContent()}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={() => navigate(`/pacientes/${id}`)}
          className="border-primary/20 hover:border-primary/40 transition-colors"
        >
          Cancelar
        </Button>
        
        {activeStep === 1 && (
          <Button
            onClick={handleGoToManualForm}
            className="shadow-md hover:shadow-lg transition-all"
          >
            Voltar para Medição Manual
          </Button>
        )}
        
        {activeStep === 2 && measurements && (
          <Button 
            onClick={handleConfirmMeasurements}
            className="bg-turquesa hover:bg-turquesa/90 shadow-md hover:shadow-lg transition-all"
          >
            Confirmar e Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
