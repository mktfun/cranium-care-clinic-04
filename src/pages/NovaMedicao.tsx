import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// import { obterPacientePorId } from "@/data/mock-data"; // Mock data import removido
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react"; // Adicionado Loader2

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true); // Estado de loading para o paciente
  
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
            toast.error("Paciente não encontrado ou erro ao carregar.");
            navigate("/pacientes");
            return;
          } else {
            setPaciente(pacienteData);
          }
          
          setMedicaoData(new Date().toISOString().split("T")[0]);
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast.error("Erro ao carregar dados do paciente");
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
        toast.error("Dados do paciente não carregados. Tente novamente.");
        return;
    }

    if (!medicaoData || !comprimento || !largura || !diagonalD || !diagonalE || !perimetroCefalico) {
      toast.error("Preencha todas as medidas obrigatórias e a data.");
      return;
    }
    
    if (indiceCraniano !== null && diferencaDiagonais !== null && cvai !== null) {
      try {
        const { severityLevel } = getCranialStatus(indiceCraniano, cvai);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast.error("Usuário não autenticado. Faça login novamente.");
          navigate("/login");
          return;
        }
        
        const novaMedicao = {
          paciente_id: paciente.id, // Usar o ID do paciente carregado
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
        
        toast.success("Medição registrada com sucesso!");
        navigate(`/pacientes/${paciente.id}`);
      } catch (error: any) {
        console.error("Error saving measurement:", error);
        toast.error(`Erro ao salvar a medição: ${error.message}`);
      }
    } else {
      toast.error("Erro ao calcular os valores derivados. Verifique as medições.");
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          <TabsTrigger value="scanner" disabled>Scanner 3D (Em breve)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Entrada Manual de Medições</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data da Medição</Label>
                    <Input id="data" type="date" value={medicaoData} onChange={(e) => setMedicaoData(e.target.value)} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comprimento">Comprimento Máximo (mm)</Label>
                    <Input id="comprimento" type="number" min="0" step="0.1" value={comprimento} onChange={(e) => setComprimento(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="largura">Largura Máxima (mm)</Label>
                    <Input id="largura" type="number" min="0" step="0.1" value={largura} onChange={(e) => setLargura(e.target.value)} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagonalD">Diagonal Direita (mm)</Label>
                    <Input id="diagonalD" type="number" min="0" step="0.1" value={diagonalD} onChange={(e) => setDiagonalD(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagonalE">Diagonal Esquerda (mm)</Label>
                    <Input id="diagonalE" type="number" min="0" step="0.1" value={diagonalE} onChange={(e) => setDiagonalE(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perimetroCefalico">Perímetro Cefálico (mm)</Label>
                    <Input id="perimetroCefalico" type="number" min="0" step="0.1" value={perimetroCefalico} onChange={(e) => setPerimetroCefalico(e.target.value)} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
                </div>
                
                <div className="p-4 border rounded-md bg-muted/30 dark:bg-gray-800/30">
                  <h4 className="font-medium mb-3">Valores Calculados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Índice Craniano</Label>
                      <div className="font-medium mt-1">{indiceCraniano !== null ? `${indiceCraniano.toFixed(1)}%` : "-"}</div>
                    </div>
                    <div>
                      <Label>Diferença das Diagonais</Label>
                      <div className="font-medium mt-1">{diferencaDiagonais !== null ? `${diferencaDiagonais.toFixed(1)} mm` : "-"}</div>
                    </div>
                    <div>
                      <Label>CVAI</Label>
                      <div className="font-medium mt-1">{cvai !== null ? `${cvai.toFixed(1)}%` : "-"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => navigate(`/pacientes/${paciente.id}`)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-turquesa hover:bg-turquesa/90">
                    Salvar Medição
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>Scanner 3D</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Esta funcionalidade estará disponível em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
