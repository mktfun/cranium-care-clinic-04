import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronLeft, Camera, Upload, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

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
      
      setTimeout(() => {
        setUploading(false);
        setProcessingImage(true);
        
        // Simulação de processamento de imagem
        setTimeout(() => {
          setProcessingImage(false);
          
          // Valores simulados que viriam do processamento de imagem
          const simulatedMeasurements = {
            comprimento: 146,
            largura: 119,
            diagonalD: 158,
            diagonalE: 153,
            perimetroCefalico: 420
          };
          
          setMeasurements(simulatedMeasurements);
          setActiveStep(2); // Avança para revisão
          
          toast({
            title: "Foto processada com sucesso",
            description: "Os valores foram extraídos e estão prontos para revisão.",
            variant: "success",
          });
        }, 3000);
      }, 2000);
      
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

  const handleConfirmMeasurements = () => {
    navigate(`/pacientes/${id}/nova-medicao`, { 
      state: { 
        photoProcessed: true,
        measurements,
        photoUrl: uploadedImage
      } 
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Como tirar uma boa foto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <AspectRatio ratio={4/3}>
                      <img 
                        src="/lovable-uploads/b51ddd39-04ec-4d53-9607-336dfd54259d.png" 
                        alt="Exemplo de foto para medição" 
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <ul className="space-y-2 list-disc pl-5">
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Captura de Imagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30">
                    <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-medium mb-2">Capture ou faça upload de uma foto</p>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Posicione a cabeça do paciente centralizada na foto com uma 
                      referência de medida visível para melhor precisão
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <Button 
                        onClick={handleCapturarFoto}
                        className="bg-turquesa hover:bg-turquesa/90"
                        disabled={uploading || processingImage}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar Foto
                      </Button>
                      
                      <div className="relative">
                        <Button 
                          variant="outline"
                          disabled={uploading || processingImage}
                          className="relative"
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
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <p>{uploading ? "Enviando imagem..." : "Processando imagem..."}</p>
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
                  <CardTitle>Imagem Processada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <AspectRatio ratio={4/3}>
                      {uploadedImage && (
                        <img 
                          src={uploadedImage} 
                          alt="Foto processada do paciente" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </AspectRatio>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Medidas Detectadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {measurements && (
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
                        <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
                        <p className="text-2xl font-bold">{measurements.perimetroCefalico} mm</p>
                      </div>
                      
                      {/* Cálculos derivados */}
                      <div className="pt-4 mt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Índice Craniano</p>
                            <p className="text-xl font-bold">
                              {((measurements.largura / measurements.comprimento) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Diferença Diagonal</p>
                            <p className="text-xl font-bold">
                              {Math.abs(measurements.diagonalD - measurements.diagonalE).toFixed(1)} mm
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setActiveStep(1)}
                        variant="outline"
                        className="mr-2"
                      >
                        Tirar outra foto
                      </Button>
                      
                      <Button 
                        onClick={handleConfirmMeasurements}
                        className="bg-turquesa hover:bg-turquesa/90"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Confirmar e Continuar
                      </Button>
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
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
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
      
      <Separator />
      
      {renderStepContent()}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={() => navigate(`/pacientes/${id}`)}
        >
          Cancelar
        </Button>
        
        {activeStep === 1 && (
          <Button
            onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
            className="bg-turquesa hover:bg-turquesa/90"
          >
            Voltar para Medição Manual
          </Button>
        )}
      </div>
    </div>
  );
}
