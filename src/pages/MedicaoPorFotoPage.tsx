
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// Import custom components
import MeasurementModeToggle from "@/components/medicao/MeasurementModeToggle";
import PhotoCaptureSection from "@/components/medicao/PhotoCaptureSection";
import PatientInfoForm from "@/components/medicao/PatientInfoForm";
import MeasurementsSection from "@/components/medicao/MeasurementsSection";
import ConfirmationDialog from "@/components/medicao/ConfirmationDialog";

// Import hooks and services
import { useCranialMeasurements } from "@/hooks/use-cranial-measurements";
import { saveMedicaoToDatabase, formatMeasurementDate } from "@/services/medicao-service";

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
      data: formatMeasurementDate(selectedDate),
      comprimento: measurements.comprimento,
      largura: measurements.largura,
      diagonal_d: measurements.diagonalDireita,
      diagonal_e: measurements.diagonalEsquerda,
      diferenca_diagonais: measurements.diferencaDiagonais,
      indice_craniano: measurements.indiceCraniano,
      cvai: measurements.cvai,
      status: getSeverityLevel(),
      observacoes: observacoes,
      recomendacoes: recomendacoes,
    };

    const { success } = await saveMedicaoToDatabase(medicaoData);

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
          <MeasurementModeToggle 
            isManualInput={isManualInput}
            onToggle={handleToggleManualInput}
          />

          <PatientInfoForm
            pacienteId={pacienteId}
            onPacienteIdChange={handlePacienteIdChange}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isIdDisabled={!!params.id}
          />

          {!isManualInput && (
            <PhotoCaptureSection
              showWebcam={showWebcam}
              imageSrc={imageSrc}
              onCapture={handleCapture}
              onRetake={handleRetake}
            />
          )}

          {(isManualInput || imageSrc) && (
            <MeasurementsSection
              measurements={measurements}
              onInputChange={handleFieldInputChange}
              observacoes={observacoes}
              recomendacoes={recomendacoes}
              onObservacoesChange={handleObservacoesChange}
              onRecomendacoesChange={handleRecomendacoesChange}
              getSeverityLevel={getSeverityLevel}
            />
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
