
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Import custom components
import WebcamCapture from "@/components/medicao/WebcamCapture";
import CapturedImage from "@/components/medicao/CapturedImage";
import MeasurementInputs from "@/components/medicao/MeasurementInputs";
import MeasurementResults from "@/components/medicao/MeasurementResults";
import NotesAndRecommendations from "@/components/medicao/NotesAndRecommendations";
import DatePicker from "@/components/medicao/DatePicker";
import ConfirmationDialog from "@/components/medicao/ConfirmationDialog";
import { useCranialMeasurements } from "@/hooks/use-cranial-measurements";
import { SeverityLevel } from "@/lib/cranial-utils";

// Function to convert SeverityLevel to Database status_medicao enum
function convertSeverityToStatus(severity: SeverityLevel): Database["public"]["Enums"]["status_medicao"] {
  // Map the severity to the database enum values
  switch (severity) {
    case "normal":
      return "normal";
    case "leve":
      return "leve";
    case "moderada":
      return "moderada";
    case "severa":
      return "severa";
    default:
      return "normal"; // Default fallback
  }
}

const MedicaoPorFotoPage: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState<string>('');
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [pacienteId, setPacienteId] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const navigate = useNavigate();
  const params = useParams();
  const userId = ""; // This should be replaced with your actual auth logic

  const { measurements, handleInputChange, resetMeasurements, getSeverityLevel } = useCranialMeasurements();

  useEffect(() => {
    // If we have a pacienteId in the URL params, use it
    if (params.id) {
      setPacienteId(params.id);
    }
  }, [params.id]);

  const handleCapture = (imgSrc: string) => {
    setImageSrc(imgSrc);
    setShowWebcam(false);
  };

  const handleRetake = () => {
    setImageSrc(null);
    setShowWebcam(true);
    resetMeasurements();
  };

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoes(e.target.value);
  };

  const handleRecomendacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecomendacoes(e.target.value.split('\n'));
  };

  const handlePacienteIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPacienteId(e.target.value);
  };

  const handleToggleManualInput = () => {
    setIsManualInput(!isManualInput);
    resetMeasurements();
  };

  const handleFieldInputChange = (field: string, value: number | null) => {
    handleInputChange(field, value);
  };

  async function saveMedicaoToDatabase(medicaoData: any) {
    try {
      // Convert severity to proper enum value
      const dbStatus = convertSeverityToStatus(medicaoData.status);
      
      const { error } = await supabase
        .from('medicoes')
        .insert({
          paciente_id: medicaoData.paciente_id,
          user_id: medicaoData.user_id,
          data: medicaoData.data,
          comprimento: medicaoData.comprimento,
          largura: medicaoData.largura,
          diagonal_d: medicaoData.diagonal_d,
          diagonal_e: medicaoData.diagonal_e,
          diferenca_diagonais: medicaoData.diferenca_diagonais,
          indice_craniano: medicaoData.indice_craniano,
          cvai: medicaoData.cvai,
          status: dbStatus,
          observacoes: medicaoData.observacoes,
          recomendacoes: medicaoData.recomendacoes,
        });

      if (error) {
        console.error("Erro ao salvar medição:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao salvar medição:", error);
      return false;
    }
  }

  const handleSave = async () => {
    if (!pacienteId) {
      toast({
        title: "Erro!",
        description: "Por favor, insira o ID do paciente.",
        variant: "destructive",
      });
      return;
    }

    if (!measurements.comprimento || !measurements.largura || 
        !measurements.diagonalDireita || !measurements.diagonalEsquerda) {
      toast({
        title: "Erro!",
        description: "Por favor, preencha todos os campos de medição.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Erro!",
        description: "Por favor, selecione a data da medição.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSave = async () => {
    setShowConfirmation(false);

    if (!userId) {
      toast({
        title: "Erro!",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    const medicaoData = {
      paciente_id: pacienteId,
      user_id: userId,
      data: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      comprimento: measurements.comprimento,
      largura: measurements.largura,
      diagonal_d: measurements.diagonalDireita,
      diagonal_e: measurements.diagonalEsquerda,
      diferenca_diagonais: measurements.diferencaDiagonais || 0,
      indice_craniano: measurements.indiceCraniano || 0,
      cvai: measurements.cvai || 0,
      status: getSeverityLevel(),
      observacoes: observacoes,
      recomendacoes: recomendacoes,
    };

    const success = await saveMedicaoToDatabase(medicaoData);

    if (success) {
      toast({
        title: "Medição salva com sucesso!",
        variant: "success",
      });
      navigate('/pacientes');
    } else {
      toast({
        title: "Erro ao salvar medição!",
        variant: "destructive",
      });
    }
  };

  const cancelSave = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Medição por Foto</CardTitle>
          <CardDescription>Capture ou insira as medidas do paciente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="manualInput">Entrada Manual</Label>
            <Switch id="manualInput" checked={isManualInput} onCheckedChange={handleToggleManualInput} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pacienteId">ID do Paciente</Label>
            <Input
              type="text"
              id="pacienteId"
              value={pacienteId}
              onChange={handlePacienteIdChange}
              disabled={!!params.id}
            />
          </div>

          <DatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          {!isManualInput && (
            <>
              {showWebcam ? (
                <WebcamCapture onCapture={handleCapture} />
              ) : (
                <>
                  {imageSrc && (
                    <CapturedImage 
                      imageSrc={imageSrc}
                      onRetake={handleRetake}
                    />
                  )}
                </>
              )}
            </>
          )}

          {(isManualInput || imageSrc) && (
            <>
              <MeasurementInputs
                comprimento={measurements.comprimento}
                largura={measurements.largura}
                diagonalDireita={measurements.diagonalDireita}
                diagonalEsquerda={measurements.diagonalEsquerda}
                perimetroCefalico={measurements.perimetroCefalico}
                onInputChange={handleFieldInputChange}
              />

              <Separator className="my-4" />

              <MeasurementResults
                indiceCraniano={measurements.indiceCraniano}
                diferencaDiagonais={measurements.diferencaDiagonais}
                cvai={measurements.cvai}
                getSeverityLevel={getSeverityLevel}
              />

              <Separator className="my-4" />

              <NotesAndRecommendations
                observacoes={observacoes}
                recomendacoes={recomendacoes}
                onObservacoesChange={handleObservacoesChange}
                onRecomendacoesChange={handleRecomendacoesChange}
              />
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!pacienteId || (!isManualInput && !imageSrc)}>
            Salvar Medição
          </Button>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={confirmSave}
        onCancel={cancelSave}
      />
    </div>
  );
};

export default MedicaoPorFotoPage;
