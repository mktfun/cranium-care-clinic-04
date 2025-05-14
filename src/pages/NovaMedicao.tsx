
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera, Ruler } from "lucide-react";

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  
  const [activeTab, setActiveTab] = useState("manual");
  const [medicaoData, setMedicaoData] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [diagonalD, setDiagonalD] = useState("");
  const [diagonalE, setDiagonalE] = useState("");
  const [perimetroCefalico, setPerimetroCefalico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  
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
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do paciente",
          variant: "destructive",
        });
        navigate("/pacientes"); // Navega de volta em caso de erro inesperado
      } finally {
        setLoadingPaciente(false);
      }
    }
    
    loadPacienteData();
  }, [id, navigate]);
  
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
        
        const { error } = await supabase
          .from("medicoes")
          .insert([novaMedicao])
          .select();
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Medição registrada com sucesso!",
        });
        navigate(`/pacientes/${paciente.id}`);
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
  
  // Redirecionar automaticamente para a medição por foto após carregar o paciente
  useEffect(() => {
    if (paciente && !loadingPaciente) {
      navigate(`/pacientes/${id}/medicao-por-foto`);
    }
  }, [paciente, loadingPaciente, id, navigate]);
  
  if (loadingPaciente || !paciente) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div>
        <h2 className="text-3xl font-bold">Nova Medição</h2>
        <p className="text-muted-foreground">
          Paciente: {paciente.nome} • {formatAgeHeader(paciente.data_nascimento)} • {new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Escolha o método de medição</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button 
              onClick={() => navigate(`/pacientes/${id}/medicao-por-foto`)}
              className="bg-turquesa hover:bg-turquesa/90 p-8 flex flex-col items-center"
            >
              <Camera className="h-12 w-12 mb-4" />
              <span className="text-lg font-medium">Medição por Foto</span>
              <span className="text-sm text-white/80 mt-2">Recomendado</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("manual")}
              variant="outline" 
              className="p-8 flex flex-col items-center"
            >
              <Ruler className="h-12 w-12 mb-4" />
              <span className="text-lg font-medium">Medição Manual</span>
              <span className="text-sm text-muted-foreground mt-2">Entrada manual de medidas</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
