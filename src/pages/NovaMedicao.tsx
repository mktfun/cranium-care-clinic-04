
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { generateRecomendacoes } from "@/lib/medicao-utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMedicaoCalculations } from "@/hooks/useMedicaoCalculations";
import MedicaoForm from "@/components/medicoes/MedicaoForm";
import PhotoPreview from "@/components/medicoes/PhotoPreview";
import { Button } from "@/components/ui/button";

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("NovaMedicao - Location state:", location.state);
  
  // Check if coming from photo page with measurements or from manual button
  const fromManualButton = location.state?.fromManualButton === true;
  const photoData = location.state?.photoProcessed ? location.state : null;
  
  console.log("fromManualButton:", fromManualButton);
  console.log("photoData:", photoData);
  
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
  
  // Use the custom hook for calculations
  const { 
    indiceCraniano, 
    diferencaDiagonais, 
    cvai, 
    perimetroError 
  } = useMedicaoCalculations({
    comprimento,
    largura,
    diagonalD,
    diagonalE,
    perimetroCefalico,
    pacienteDataNascimento: paciente?.data_nascimento
  });
  
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
          
          // Fixed the redirection logic to respect fromManualButton
          console.log("Checking navigation conditions");
          console.log("photoData:", !!photoData);
          console.log("fromManualButton:", fromManualButton);
          
          // Only redirect if there's no photo data AND we didn't explicitly come from manual button
          if (!photoData && !fromManualButton) {
            console.log("Redirecting to photo page - no data and not from manual button");
            navigate(`/pacientes/${id}/medicao-por-foto`, { replace: true });
            return;
          } else {
            console.log("Staying on manual form page");
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
  }, [id, navigate, photoData, fromManualButton]);
  
  // Processar dados da foto, se disponíveis
  useEffect(() => {
    if (photoData?.measurements) {
      const { measurements, photoUrl } = photoData;
      setComprimento(String(measurements.comprimento || ''));
      setLargura(String(measurements.largura || ''));
      setDiagonalD(String(measurements.diagonalD || ''));
      setDiagonalE(String(measurements.diagonalE || ''));
      setPerimetroCefalico(String(measurements.perimetroCefalico || ''));
      setPhotoUrl(photoUrl);
    }
  }, [photoData]);
  
  const handlePhotoCapture = () => {
    if (id) {
      navigate(`/pacientes/${id}/medicao-por-foto`);
    }
  };
  
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
    
    if (perimetroError) {
      toast({
        title: "Erro no perímetro cefálico",
        description: perimetroError,
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
  
  if (loadingPaciente || !paciente) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">
            {photoData ? "Revisão da Medição por Foto" : "Medição Manual"}
          </h2>
          <p className="text-muted-foreground">
            Paciente: {paciente.nome} • {formatAgeHeader(paciente.data_nascimento)}
          </p>
        </div>
        {!photoData && (
          <Button 
            onClick={handlePhotoCapture}
            className="bg-turquesa hover:bg-turquesa/90 flex items-center gap-2 md:hidden"
          >
            <Camera className="h-4 w-4" />
            Medir por Foto
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {photoData && (
          <PhotoPreview 
            photoUrl={photoUrl} 
            pacienteId={id || ""}
          />
        )}
        
        <MedicaoForm
          comprimento={comprimento}
          setComprimento={setComprimento}
          largura={largura}
          setLargura={setLargura}
          diagonalD={diagonalD}
          setDiagonalD={setDiagonalD}
          diagonalE={diagonalE}
          setDiagonalE={setDiagonalE}
          perimetroCefalico={perimetroCefalico}
          setPerimetroCefalico={setPerimetroCefalico}
          observacoes={observacoes}
          setObservacoes={setObservacoes}
          indiceCraniano={indiceCraniano}
          diferencaDiagonais={diferencaDiagonais}
          cvai={cvai}
          perimetroError={perimetroError}
          paciente={paciente}
          onSubmit={handleSubmit}
          onPhotoCapture={!photoData ? handlePhotoCapture : undefined}
        />
      </div>
    </div>
  );
}
