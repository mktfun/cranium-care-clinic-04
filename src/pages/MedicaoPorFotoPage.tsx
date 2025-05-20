import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronLeft, Camera, Upload, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { calculateCranialIndex, calculateCVAI } from "@/lib/cranial-analysis";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";

interface MeasurementPoint {
  x: number;
  y: number;
  label: string;
}

export default function MedicaoPorFotoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1); // 1: upload, 2: review, 3: confirm
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [calibrationFactor, setCalibrationFactor] = useState<number | null>(null);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationStart, setCalibrationStart] = useState<{x: number, y: number} | null>(null);
  const [calibrationEnd, setCalibrationEnd] = useState<{x: number, y: number} | null>(null);
  const [measurementMode, setMeasurementMode] = useState<string | null>(null);
  const [perimetroError, setPerimetroError] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!imageRef.current || !containerRef.current || !uploadedImage) return;

    const rect = imageRef.current.getBoundingClientRect();
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
          const factor = Number(length) / (distance * imageRef.current.width);
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
      
      if (measurementMode === 'comprimento' && existingPoints.length < 2) {
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
            title: "Comprimento definido",
            description: "Agora selecione a próxima medida a ser realizada.",
          });
        }
      } 
      else if (measurementMode === 'largura' && existingPoints.length < 2) {
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
            title: "Largura definida",
            description: "Agora selecione a próxima medida a ser realizada.",
          });
        }
      }
      else if (measurementMode === 'diagonalD' && existingPoints.length < 2) {
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
            title: "Diagonal D definida",
            description: "Agora selecione a próxima medida a ser realizada.",
          });
        }
      }
      else if (measurementMode === 'diagonalE' && existingPoints.length < 2) {
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
            title: "Diagonal E definida",
            description: "Agora selecione a próxima medida a ser realizada.",
          });
        }
      }
    }
  };

  const calculateMeasurements = () => {
    if (!calibrationFactor || !imageRef.current) {
      toast({
        title: "Calibração necessária",
        description: "Por favor, calibre a imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    const imgWidth = imageRef.current.width;
    
    // Helper function to find points by label prefix
    const getPointsByPrefix = (prefix: string) => measurementPoints.filter(p => p.label.startsWith(prefix));
    
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
    const measurements = {
      comprimento: Math.round(comprimento),
      largura: Math.round(largura),
      diagonalD: Math.round(diagonalD),
      diagonalE: Math.round(diagonalE),
      perimetroCefalico: perimetroCefalico
    };

    // Validar o perímetro cefálico calculado
    if (perimetroCefalico && paciente) {
      const validation = validatePerimetroCefalico(perimetroCefalico, paciente.data_nascimento);
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

    setMeasurements(measurements);
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

  const renderMeasurementOverlay = () => {
    if (!uploadedImage || !imageRef.current) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Calibration line */}
        {calibrationStart && (
          <div 
            className="absolute w-2 h-2 bg-yellow-500 rounded-full z-10" 
            style={{ 
              left: `${calibrationStart.x * 100}%`, 
              top: `${calibrationStart.y * 100}%` 
            }}
          />
        )}
        
        {calibrationStart && calibrationEnd && (
          <div 
            className="absolute bg-yellow-500 h-0.5 z-10"
            style={{ 
              left: `${calibrationStart.x * 100}%`, 
              top: `${calibrationStart.y * 100}%`,
              width: `${Math.sqrt(
                Math.pow((calibrationEnd.x - calibrationStart.x) * 100, 2) + 
                Math.pow((calibrationEnd.y - calibrationStart.y) * 100, 2)
              )}%`,
              transform: `rotate(${Math.atan2(
                (calibrationEnd.y - calibrationStart.y),
                (calibrationEnd.x - calibrationStart.x)
              ) * (180 / Math.PI)}deg)`,
              transformOrigin: 'left center'
            }}
          />
        )}
        
        {calibrationEnd && (
          <div 
            className="absolute w-2 h-2 bg-yellow-500 rounded-full z-10" 
            style={{ 
              left: `${calibrationEnd.x * 100}%`, 
              top: `${calibrationEnd.y * 100}%` 
            }}
          />
        )}
        
        {/* Measurement points */}
        {measurementPoints.map((point, index) => (
          <div 
            key={index}
            className={`absolute w-3 h-3 rounded-full z-10 ${
              point.label.startsWith('comprimento') ? 'bg-red-500' :
              point.label.startsWith('largura') ? 'bg-blue-500' :
              point.label.startsWith('diagonalD') ? 'bg-green-500' :
              'bg-purple-500'
            }`}
            style={{ 
              left: `${point.x * 100}%`, 
              top: `${point.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Measurement lines */}
        {['comprimento', 'largura', 'diagonalD', 'diagonalE'].map(prefix => {
          const points = measurementPoints.filter(p => p.label.startsWith(prefix));
          if (points.length !== 2) return null;
          
          const lineColor = 
            prefix === 'comprimento' ? 'bg-red-500' :
            prefix === 'largura' ? 'bg-blue-500' :
            prefix === 'diagonalD' ? 'bg-green-500' :
            'bg-purple-500';
          
          return (
            <div 
              key={prefix}
              className={`absolute h-0.5 z-5 ${lineColor}`}
              style={{ 
                left: `${points[0].x * 100}%`, 
                top: `${points[0].y * 100}%`,
                width: `${Math.sqrt(
                  Math.pow((points[1].x - points[0].x) * 100, 2) + 
                  Math.pow((points[1].y - points[0].y) * 100, 2)
                )}%`,
                transform: `rotate(${Math.atan2(
                  (points[1].y - points[0].y),
                  (points[1].x - points[0].x)
                ) * (180 / Math.PI)}deg)`,
                transformOrigin: 'left center'
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-card/50">
                  <CardTitle className="text-card-foreground">Como tirar uma boa foto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <AspectRatio ratio={4/3}>
                      <img 
                        src="/lovable-uploads/2d224b4c-3e28-41af-9836-25a55082181a.png" 
                        alt="Exemplo de foto para medição" 
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li>Posicione a cabeça do paciente centralizada no quadro</li>
                    <li>Certifique-se que o topo da cabeça e as orelhas estão visíveis</li>
                    <li>Coloque uma régua ou referência de medida ao lado da cabeça</li>
                    <li>Mantenha boa iluminação e fundo sem distrações</li>
                    <li>Tire a foto de cima para baixo em um ângulo de 90°</li>
                    <li>Use a maior resolução possível da câmera</li>
                    <li>Evite sombras fortes que possam obscurecer contornos do crânio</li>
                    <li>Utilize um fundo neutro e contrastante para melhor identificação</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-card/50">
                  <CardTitle className="text-card-foreground">Captura de Imagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30">
                    <Camera className="h-16 w-16 text-primary mb-4" />
                    <p className="text-xl font-medium mb-2">Capture ou faça upload de uma foto</p>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Posicione a cabeça do paciente centralizada na foto com uma 
                      referência de medida visível para melhor precisão
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <Button 
                        onClick={handleCapturarFoto}
                        variant="default"
                        disabled={uploading || processingImage}
                        className="shadow-md transition-all hover:shadow-lg"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar Foto
                      </Button>
                      
                      <div className="relative">
                        <Button 
                          variant="outline"
                          disabled={uploading || processingImage}
                          className="relative shadow-sm hover:shadow-md transition-all"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? "Enviando..." : "Fazer Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadFoto}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading || processingImage}
                          />
                        </Button>
                      </div>
                    </div>
                    
                    {(uploading || processingImage) && (
                      <div className="mt-6 flex flex-col items-center">
                        <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                        <p className="text-muted-foreground">{uploading ? "Enviando imagem..." : "Processando imagem..."}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Imagem para Medição</span>
                    {measurements ? (
                      <Button
                        onClick={() => setMeasurements(null)}
                        variant="outline"
                        size="sm"
                      >
                        Refazer Medições
                      </Button>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden relative" ref={containerRef}>
                    <AspectRatio ratio={4/3}>
                      {uploadedImage && (
                        <img 
                          ref={imageRef}
                          src={uploadedImage} 
                          alt="Foto do paciente" 
                          className={`w-full h-full object-contain ${
                            calibrationMode || measurementMode ? 'cursor-crosshair' : ''
                          }`}
                          onClick={handleImageClick}
                        />
                      )}
                      {renderMeasurementOverlay()}
                    </AspectRatio>
                  </div>

                  {!measurements && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium">Instruções para Medição:</h3>
                      <p className="text-sm text-muted-foreground">
                        1. Primeiro calibre a imagem usando um objeto de tamanho conhecido.
                        <br />
                        2. Em seguida, meça o comprimento, largura e as diagonais.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          onClick={() => {
                            setCalibrationMode(true);
                            setMeasurementMode(null);
                            toast({
                              title: "Modo de calibração",
                              description: "Clique em um extremo da sua régua/referência de medida",
                            });
                          }}
                          variant={calibrationMode ? "default" : "outline"}
                          size="sm"
                          disabled={!!measurements}
                          className={calibrationMode ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        >
                          {calibrationFactor ? "Recalibrar" : "Calibrar"} Imagem
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setMeasurementMode("comprimento");
                            setCalibrationMode(false);
                            toast({
                              title: "Medindo comprimento",
                              description: "Clique nos pontos mais anterior e posterior da cabeça",
                            });
                          }}
                          variant={measurementMode === "comprimento" ? "default" : "outline"}
                          size="sm"
                          disabled={!calibrationFactor || !!measurements}
                          className={measurementMode === "comprimento" ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                          Comprimento
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setMeasurementMode("largura");
                            setCalibrationMode(false);
                            toast({
                              title: "Medindo largura",
                              description: "Clique nos pontos mais laterais da cabeça",
                            });
                          }}
                          variant={measurementMode === "largura" ? "default" : "outline"}
                          size="sm"
                          disabled={!calibrationFactor || !!measurements}
                          className={measurementMode === "largura" ? "bg-blue-500 hover:bg-blue-600" : ""}
                        >
                          Largura
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setMeasurementMode("diagonalD");
                            setCalibrationMode(false);
                            toast({
                              title: "Medindo diagonal direita",
                              description: "Clique para marcar a diagonal direita da cabeça",
                            });
                          }}
                          variant={measurementMode === "diagonalD" ? "default" : "outline"}
                          size="sm"
                          disabled={!calibrationFactor || !!measurements}
                          className={measurementMode === "diagonalD" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          Diagonal D
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setMeasurementMode("diagonalE");
                            setCalibrationMode(false);
                            toast({
                              title: "Medindo diagonal esquerda",
                              description: "Clique para marcar a diagonal esquerda da cabeça",
                            });
                          }}
                          variant={measurementMode === "diagonalE" ? "default" : "outline"}
                          size="sm"
                          disabled={!calibrationFactor || !!measurements}
                          className={measurementMode === "diagonalE" ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          Diagonal E
                        </Button>
                      </div>
                      
                      <Button
                        onClick={calculateMeasurements}
                        className="w-full mt-4 bg-turquesa hover:bg-turquesa/90"
                        disabled={
                          !calibrationFactor || 
                          measurementPoints.filter(p => p.label.startsWith('comprimento')).length !== 2 ||
                          measurementPoints.filter(p => p.label.startsWith('largura')).length !== 2 ||
                          measurementPoints.filter(p => p.label.startsWith('diagonalD')).length !== 2 ||
                          measurementPoints.filter(p => p.label.startsWith('diagonalE')).length !== 2
                        }
                      >
                        Calcular Medidas
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Medidas Detectadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {processingImage ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-turquesa" />
                      <p className="ml-2">Processando medições...</p>
                    </div>
                  ) : measurements ? (
                    renderMeasurementsResults(measurements, perimetroError, calculateCranialIndex, calculateCVAI)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-2">
                        Faça as medições na imagem para ver os resultados aqui.
                      </p>
                      <div className="flex flex-col gap-2 items-start mt-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                          <p>Amarelo - Calibração</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                          <p>Vermelho - Comprimento</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                          <p>Azul - Largura</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                          <p>Verde - Diagonal D</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
                          <p>Roxo - Diagonal E</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
      </div>
    </div>
  );
}

// Função auxiliar para renderizar os resultados das medições com validação de perímetro
const renderMeasurementsResults = (measurements, perimetroError, calculateCranialIndex, calculateCVAI) => {
  if (!measurements) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Comprimento</p>
          <p className="text-2xl font-bold">{measurements.comprimento} mm</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Largura</p>
          <p className="text-2xl font-bold">{measurements.largura} mm</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Diagonal D</p>
          <p className="text-2xl font-bold">{measurements.diagonalD} mm</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Diagonal E</p>
          <p className="text-2xl font-bold">{measurements.diagonalE} mm</p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Perímetro Cefálico (estimado)</p>
        <div className="flex items-center">
          <p className={`text-2xl font-bold ${perimetroError ? "text-red-500" : ""}`}>
            {measurements.perimetroCefalico} mm
          </p>
          {perimetroError && (
            <p className="ml-2 text-sm text-red-500">⚠️ {perimetroError}</p>
          )}
        </div>
      </div>
      
      {/* Cálculos derivados */}
      <div className="pt-4 mt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Índice Craniano</p>
            <p className="text-xl font-bold">
              {calculateCranialIndex(measurements.largura, measurements.comprimento).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">CVAI</p>
            <p className="text-xl font-bold">
              {calculateCVAI(measurements.diagonalD, measurements.diagonalE).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
