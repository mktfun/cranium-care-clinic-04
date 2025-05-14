
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useNavigate, useParams } from 'react-router-dom';
import { getCranialStatus, SeverityLevel } from "@/lib/cranial-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

// Function to calculate asymmetry - adding this since it's missing in cranial-utils
function calculateAsymmetry(comprimento: number, largura: number, diagonalDireita: number, diagonalEsquerda: number): number {
  // Calculate CVAI: (|Diagonal A - Diagonal B| / Diagonal Maior) x 100%
  const diagonalDifference = Math.abs(diagonalDireita - diagonalEsquerda);
  const maxDiagonal = Math.max(diagonalDireita, diagonalEsquerda);
  
  if (maxDiagonal === 0) return 0; // Avoid division by zero
  
  return (diagonalDifference / maxDiagonal) * 100;
}

const MedicaoPorFotoPage: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState<boolean>(true);
  const [comprimento, setComprimento] = useState<number | null>(null);
  const [largura, setLargura] = useState<number | null>(null);
  const [diagonalDireita, setDiagonalDireita] = useState<number | null>(null);
  const [diagonalEsquerda, setDiagonalEsquerda] = useState<number | null>(null);
  const [perimetroCefalico, setPerimetroCefalico] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState<string>('');
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  const [pacienteId, setPacienteId] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  const params = useParams();
  const userId = ""; // This should be replaced with your actual auth logic

  useEffect(() => {
    // If we have a pacienteId in the URL params, use it
    if (params.id) {
      setPacienteId(params.id);
    }
  }, [params.id]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imgSrc = webcamRef.current.getScreenshot();
      setImageSrc(imgSrc);
      setShowWebcam(false);
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setShowWebcam(true);
    setComprimento(null);
    setLargura(null);
    setDiagonalDireita(null);
    setDiagonalEsquerda(null);
    setPerimetroCefalico(null);
    setIndiceCraniano(null);
    setDiferencaDiagonais(null);
    setCvai(null);
  };

  useEffect(() => {
    if (comprimento && largura && diagonalDireita && diagonalEsquerda) {
      // Ensure values are not null before calculation
      const ic = (largura / comprimento) * 100;
      const dd = Math.abs(diagonalDireita - diagonalEsquerda);
      const cv = calculateAsymmetry(comprimento, largura, diagonalDireita, diagonalEsquerda);

      setIndiceCraniano(parseFloat(ic.toFixed(2)));
      setDiferencaDiagonais(parseFloat(dd.toFixed(2)));
      setCvai(parseFloat(cv.toFixed(2)));
    } else {
      setIndiceCraniano(null);
      setDiferencaDiagonais(null);
      setCvai(null);
    }
  }, [comprimento, largura, diagonalDireita, diagonalEsquerda]);

  const handleInputChange = (setter: (value: number | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setter(isNaN(value) ? null : value);
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
    setComprimento(null);
    setLargura(null);
    setDiagonalDireita(null);
    setDiagonalEsquerda(null);
    setPerimetroCefalico(null);
    setIndiceCraniano(null);
    setDiferencaDiagonais(null);
    setCvai(null);
  };

  const getSeverityLevel = (): SeverityLevel => {
    if (cvai === null) return "normal";

    if (cvai <= 2.5) {
      return "normal";
    } else if (cvai <= 5) {
      return "leve";
    } else if (cvai <= 7.5) {
      return "moderada";
    } else {
      return "severa";
    }
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

    if (!comprimento || !largura || !diagonalDireita || !diagonalEsquerda) {
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
      data: format(selectedDate, 'yyyy-MM-dd'),
      comprimento: comprimento,
      largura: largura,
      diagonal_d: diagonalDireita,
      diagonal_e: diagonalEsquerda,
      diferenca_diagonais: diferencaDiagonais || 0,
      indice_craniano: indiceCraniano || 0,
      cvai: cvai || 0,
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {!isManualInput && (
            <>
              {showWebcam ? (
                <div className="relative">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-md"
                  />
                  <Button onClick={handleCapture} className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    Capturar Foto
                  </Button>
                </div>
              ) : (
                <>
                  {imageSrc && (
                    <div className="relative">
                      <img src={imageSrc} alt="Captured" className="rounded-md" />
                      <Button onClick={handleRetake} className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        Retirar Foto
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {(isManualInput || imageSrc) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comprimento">Comprimento (cm)</Label>
                  <Input
                    type="number"
                    id="comprimento"
                    value={comprimento !== null ? comprimento.toString() : ''}
                    onChange={handleInputChange(setComprimento)}
                    placeholder="Comprimento"
                  />
                </div>
                <div>
                  <Label htmlFor="largura">Largura (cm)</Label>
                  <Input
                    type="number"
                    id="largura"
                    value={largura !== null ? largura.toString() : ''}
                    onChange={handleInputChange(setLargura)}
                    placeholder="Largura"
                  />
                </div>
                <div>
                  <Label htmlFor="diagonalDireita">Diagonal Direita (cm)</Label>
                  <Input
                    type="number"
                    id="diagonalDireita"
                    value={diagonalDireita !== null ? diagonalDireita.toString() : ''}
                    onChange={handleInputChange(setDiagonalDireita)}
                    placeholder="Diagonal Direita"
                  />
                </div>
                <div>
                  <Label htmlFor="diagonalEsquerda">Diagonal Esquerda (cm)</Label>
                  <Input
                    type="number"
                    id="diagonalEsquerda"
                    value={diagonalEsquerda !== null ? diagonalEsquerda.toString() : ''}
                    onChange={handleInputChange(setDiagonalEsquerda)}
                    placeholder="Diagonal Esquerda"
                  />
                </div>
                <div>
                  <Label htmlFor="perimetroCefalico">Perímetro Cefálico (cm)</Label>
                  <Input
                    type="number"
                    id="perimetroCefalico"
                    value={perimetroCefalico !== null ? perimetroCefalico.toString() : ''}
                    onChange={handleInputChange(setPerimetroCefalico)}
                    placeholder="Perímetro Cefálico"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Índice Craniano</Label>
                  <div className="font-bold">{indiceCraniano !== null ? indiceCraniano.toFixed(2) : 'N/A'}</div>
                </div>
                <div>
                  <Label>Diferença Diagonais</Label>
                  <div className="font-bold">{diferencaDiagonais !== null ? diferencaDiagonais.toFixed(2) : 'N/A'}</div>
                </div>
                <div>
                  <Label>CVAI</Label>
                  <div className="font-bold">
                    {cvai !== null ? (
                      <>
                        {cvai.toFixed(2)}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "ml-2",
                            cvai <= 2.5 && "bg-green-500 text-white",
                            cvai > 2.5 && cvai <= 5 && "bg-yellow-500 text-black",
                            cvai > 5 && cvai <= 7.5 && "bg-orange-500 text-black",
                            cvai > 7.5 && "bg-red-500 text-white"
                          )}
                        >
                          {getSeverityLevel()}
                        </Badge>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais"
                  value={observacoes}
                  onChange={handleObservacoesChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recomendacoes">Recomendações (uma por linha)</Label>
                <Textarea
                  id="recomendacoes"
                  placeholder="Recomendações (uma por linha)"
                  value={recomendacoes.join('\n')}
                  onChange={handleRecomendacoesChange}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!pacienteId || (!isManualInput && !imageSrc)}>
            Salvar Medição
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Salvar</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja salvar esta medição?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSave}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicaoPorFotoPage;
