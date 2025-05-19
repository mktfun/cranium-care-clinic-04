
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/hooks/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus, validatePerimetroCefalico } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, ArrowLeft } from "lucide-react";

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const photoData = location.state?.photoProcessed ? location.state : null;
  
  const [paciente, setPaciente] = useState<any>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  
  const [medicaoData, setMedicaoData] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [diagonalD, setDiagonalD] = useState("");
  const [diagonalE, setDiagonalE] = useState("");
  const [perimetroCefalico, setPerimetroCefalico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  const [perimetroError, setPerimetroError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPacienteData() {
      setLoadingPaciente(true);
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
          
          setMedicaoData(new Date().toISOString().split("T")[0]);
          
          // Redirect to photo measurement if no photoData is present
          if (!photoData) {
            navigate(`/pacientes/${id}/medicao-por-foto`);
            return;
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
        setLoadingPaciente(false);
      }
    }
    
    loadPacienteData();
  }, [id, navigate, photoData]);
  
  // Processar dados da foto, se disponíveis
  useEffect(() => {
    if (photoData?.measurements) {
      const { measurements, photoUrl } = photoData;
      setComprimento(String(measurements.comprimento));
      setLargura(String(measurements.largura));
      setDiagonalD(String(measurements.diagonalD));
      setDiagonalE(String(measurements.diagonalE));
      setPerimetroCefalico(String(measurements.perimetroCefalico));
      setPhotoUrl(photoUrl);
    }
  }, [photoData]);
  
  useEffect(() => {
    if (comprimento && largura && Number(comprimento) > 0) {
      const ic = (Number(largura) / Number(comprimento)) * 100;
      setIndiceCraniano(parseFloat(ic.toFixed(1)));
    } else {
      setIndiceCraniano(null);
    }
    
    if (diagonalD && diagonalE && Number(diagonalD) > 0 && Number(diagonalE) > 0) {
      const diaD = Number(diagonalD);
      const diaE = Number(diagonalE);
      const diff = Math.abs(diaD - diaE);
      setDiferencaDiagonais(diff);
      const longer = Math.max(diaD, diaE);
      const shorter = Math.min(diaD, diaE);
      const cvaiValue = ((longer - shorter) / shorter) * 100;
      setCvai(parseFloat(cvaiValue.toFixed(1)));
    } else {
      setDiferencaDiagonais(null);
      setCvai(null);
    }
  }, [comprimento, largura, diagonalD, diagonalE]);
  
  // Validar o perímetro cefálico quando o valor muda
  useEffect(() => {
    if (perimetroCefalico && paciente) {
      const valor = Number(perimetroCefalico);
      const resultado = validatePerimetroCefalico(valor, paciente.data_nascimento);
      if (!resultado.isValid) {
        setPerimetroError(resultado.message || null);
      } else {
        setPerimetroError(null);
      }
    } else {
      setPerimetroError(null);
    }
  }, [perimetroCefalico, paciente]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paciente) {
        toast({
          title: "Erro",
          description: "Dados do paciente não carregados. Tente novamente.",
          variant: "destructive",
        });
        return;
    }

    if (!medicaoData || !comprimento || !largura || !diagonalD || !diagonalE || !perimetroCefalico) {
      toast({
        title: "Erro",
        description: "Preencha todas as medidas obrigatórias e a data.",
        variant: "destructive",
      });
      return;
    }
    
    // Validar perímetro cefálico
    const perimetroValidation = validatePerimetroCefalico(
      Number(perimetroCefalico),
      paciente.data_nascimento
    );
    
    if (!perimetroValidation.isValid) {
      toast({
        title: "Erro no perímetro cefálico",
        description: perimetroValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    if (indiceCraniano !== null && diferencaDiagonais !== null && cvai !== null) {
      try {
        const { severityLevel } = getCranialStatus(indiceCraniano, cvai);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast({
            title: "Erro",
            description: "Usuário não autenticado. Faça login novamente.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        const novaMedicao = {
          paciente_id: paciente.id,
          user_id: session.user.id,
          data: new Date(medicaoData).toISOString(),
          comprimento: Number(comprimento),
          largura: Number(largura),
          diagonal_d: Number(diagonalD),
          diagonal_e: Number(diagonalE),
          diferenca_diagonais: diferencaDiagonais,
          indice_craniano: indiceCraniano,
          cvai: cvai,
          perimetro_cefalico: Number(perimetroCefalico),
          status: severityLevel,
          observacoes: observacoes || null,
          recomendacoes: generateRecomendacoes(severityLevel)
        };
        
        const { data, error } = await supabase
          .from("medicoes")
          .insert([novaMedicao])
          .select();
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Medição registrada com sucesso!",
          variant: "success",
        });
        
        // Navegar para a visualização do relatório com a nova medição
        if (data && data[0]) {
          navigate(`/pacientes/${paciente.id}/relatorios/${data[0].id}`);
        } else {
          navigate(`/pacientes/${paciente.id}`);
        }
      } catch (error: any) {
        console.error("Error saving measurement:", error);
        toast({
          title: "Erro",
          description: `Erro ao salvar a medição: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Erro ao calcular os valores derivados. Verifique as medições.",
        variant: "destructive",
      });
    }
  };
  
  const generateRecomendacoes = (severity: string) => {
    const baseRecs = [
      "Monitorar posicionamento durante o sono",
      "Estimular tempo de barriga para baixo sob supervisão"
    ];
    if (severity === "normal") return [...baseRecs, "Manter acompanhamento regular a cada 3 meses"];
    if (severity === "leve") return [...baseRecs, "Exercícios de estímulo cervical", "Reavaliação em 2 meses"];
    return [...baseRecs, "Exercícios de estímulo cervical", "Considerar terapia de capacete", "Reavaliação em 1 mês"];
  };
  
  const handleVoltarParaFoto = () => {
    navigate(`/pacientes/${id}/medicao-por-foto`);
  };
  
  if (loadingPaciente || !paciente) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }
  
  // Now we only show the photo review page since we redirected
  // those without photo data to the photo measurement page
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div>
        <h2 className="text-3xl font-bold">Revisão da Medição por Foto</h2>
        <p className="text-muted-foreground">
          Paciente: {paciente.nome} • {formatAgeHeader(paciente.data_nascimento)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            {photoUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <AspectRatio ratio={4/3}>
                  <img 
                    src={photoUrl} 
                    alt="Foto processada do paciente" 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="border rounded-lg p-12 flex items-center justify-center">
                <p className="text-muted-foreground">Foto não disponível</p>
              </div>
            )}
            
            <Button 
              onClick={handleVoltarParaFoto}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para captura de foto
            </Button>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medidas Detectadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comprimento">Comprimento (mm)</Label>
                  <Input
                    id="comprimento"
                    type="number"
                    required
                    value={comprimento}
                    onChange={(e) => setComprimento(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (mm)</Label>
                  <Input
                    id="largura"
                    type="number"
                    required
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagonalD">Diagonal D (mm)</Label>
                  <Input
                    id="diagonalD"
                    type="number"
                    required
                    value={diagonalD}
                    onChange={(e) => setDiagonalD(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagonalE">Diagonal E (mm)</Label>
                  <Input
                    id="diagonalE"
                    type="number"
                    required
                    value={diagonalE}
                    onChange={(e) => setDiagonalE(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perimetroCefalico">Perímetro Cefálico (mm)</Label>
                <Input
                  id="perimetroCefalico"
                  type="number"
                  required
                  value={perimetroCefalico}
                  onChange={(e) => setPerimetroCefalico(e.target.value)}
                  className={perimetroError ? "border-red-500" : ""}
                />
                {perimetroError && (
                  <p className="text-sm text-red-500">{perimetroError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais sobre a medição..."
                />
              </div>
              
              {/* Cálculos derivados */}
              {indiceCraniano !== null && cvai !== null && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Valores Calculados:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Índice Craniano</p>
                      <p className="font-bold">{indiceCraniano.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CVAI</p>
                      <p className="font-bold">{cvai.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                      <p className="font-bold">{diferencaDiagonais?.toFixed(1)} mm</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-turquesa hover:bg-turquesa/90"
                disabled={!!perimetroError}
              >
                <Check className="h-4 w-4 mr-2" />
                Salvar e Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
