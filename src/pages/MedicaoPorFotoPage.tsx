
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Camera, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

export default function MedicaoPorFotoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

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
    // Aqui seria implementada a integração com a câmera do dispositivo
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
      // Upload da foto para storage do Supabase (em uma implementação futura)
      // const { data, error } = await supabase.storage.from('medicoes').upload(`${id}/${Date.now()}`, file);
      
      // Simulação de upload bem-sucedido
      setTimeout(() => {
        setUploading(false);
        setProcessingImage(true);
        
        // Simulação de processamento de imagem
        setTimeout(() => {
          setProcessingImage(false);
          
          // Redirecionar para o formulário de medição com a foto processada
          navigate(`/pacientes/${id}/nova-medicao`, { 
            state: { 
              photoProcessed: true,
              // Valores simulados que viriam do processamento de imagem
              measurements: {
                comprimento: 146,
                largura: 119,
                diagonalD: 158,
                diagonalE: 153,
                perimetroCefalico: 420
              }
            } 
          });
          
          toast({
            title: "Foto processada com sucesso",
            description: "Os valores foram extraídos e estão prontos para revisão.",
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

      <Card>
        <CardHeader>
          <CardTitle>Captura de Imagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate(`/pacientes/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              Voltar para Medição Manual
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
