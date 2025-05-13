
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RegistroPaciente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState<"M" | "F">("M");
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user information
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          toast.error("Usuário não autenticado. Faça login novamente.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error getting user session:", error);
        toast.error("Erro ao obter sessão do usuário.");
        navigate("/login");
      }
    }
    
    getCurrentUser();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Usuário não autenticado. Faça login novamente.");
      navigate("/login");
      return;
    }
    
    if (!nome || !dataNascimento || !sexo) {
      toast.error("Preencha todos os dados obrigatórios do paciente.");
      return;
    }

    setLoading(true);

    try {
      // First create the patient record
      const novoPaciente = {
        nome,
        data_nascimento: dataNascimento,
        sexo,
        user_id: userId, // Include the user_id here
        responsaveis: responsavelNome ? {
          nome: responsavelNome,
          telefone: responsavelTelefone,
          email: responsavelEmail
        } : null
      };
      
      const { data: paciente, error } = await supabase
        .from("pacientes")
        .insert(novoPaciente)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("Paciente cadastrado com sucesso!");
      
      // Navigate to the patient details page
      navigate(`/pacientes/${paciente.id}`);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      toast.error(`Erro ao cadastrar paciente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div>
        <h2 className="text-3xl font-bold">Cadastro de Paciente</h2>
        <p className="text-muted-foreground">
          Preencha os dados do paciente para iniciar o acompanhamento.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input 
                    id="nome" 
                    placeholder="Nome do paciente" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input 
                    id="dataNascimento" 
                    type="date" 
                    value={dataNascimento} 
                    onChange={(e) => setDataNascimento(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Sexo *</Label>
                  <RadioGroup value={sexo} onValueChange={(value) => setSexo(value as "M" | "F")} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="M" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="F" id="feminino" />
                      <Label htmlFor="feminino">Feminino</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Dados do Responsável</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavelNome">Nome do responsável</Label>
                  <Input 
                    id="responsavelNome" 
                    placeholder="Nome do responsável" 
                    value={responsavelNome} 
                    onChange={(e) => setResponsavelNome(e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavelTelefone">Telefone</Label>
                    <Input 
                      id="responsavelTelefone" 
                      placeholder="(00) 00000-0000" 
                      value={responsavelTelefone} 
                      onChange={(e) => setResponsavelTelefone(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavelEmail">E-mail</Label>
                    <Input 
                      id="responsavelEmail" 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      value={responsavelEmail} 
                      onChange={(e) => setResponsavelEmail(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate("/pacientes")}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-turquesa hover:bg-turquesa/90" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Paciente"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
