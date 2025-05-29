
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MedicaoForm from "./MedicaoForm";

interface CompleteMedicaoFormProps {
  pacienteId: string;
  pacienteNome: string;
  prontuarioId?: string;
  prontuarios: any[];
  onSuccess: () => void;
}

export default function CompleteMedicaoForm({
  pacienteId,
  pacienteNome,
  prontuarioId,
  prontuarios,
  onSuccess
}: CompleteMedicaoFormProps) {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [diagonalD, setDiagonalD] = useState("");
  const [diagonalE, setDiagonalE] = useState("");
  const [perimetroCefalico, setPerimetroCefalico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selectedProntuarioId, setSelectedProntuarioId] = useState(prontuarioId || "");
  const [paciente, setPaciente] = useState<any>(null);
  
  // Estados calculados
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  const [perimetroError, setPerimetroError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaciente() {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();
      
      if (data) setPaciente(data);
    }
    
    fetchPaciente();
  }, [pacienteId]);

  // Calcular valores derivados
  useEffect(() => {
    if (comprimento && largura && diagonalD && diagonalE) {
      const comp = parseFloat(comprimento);
      const larg = parseFloat(largura);
      const diagD = parseFloat(diagonalD);
      const diagE = parseFloat(diagonalE);
      
      if (comp > 0 && larg > 0) {
        const ic = (larg / comp) * 100;
        setIndiceCraniano(ic);
        
        const diffDiag = Math.abs(diagD - diagE);
        setDiferencaDiagonais(diffDiag);
        
        const maiorDiagonal = Math.max(diagD, diagE);
        const cvaiCalc = (diffDiag / maiorDiagonal) * 100;
        setCvai(cvaiCalc);
      }
    }
  }, [comprimento, largura, diagonalD, diagonalE]);

  // Validar perímetro cefálico
  useEffect(() => {
    if (perimetroCefalico && paciente) {
      const validation = validatePerimetroCefalico(parseFloat(perimetroCefalico), paciente.data_nascimento);
      setPerimetroError(validation.isValid ? null : validation.message || null);
    } else {
      setPerimetroError(null);
    }
  }, [perimetroCefalico, paciente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProntuarioId) {
      toast.error("Selecione um prontuário para associar a medição");
      return;
    }

    if (perimetroError) {
      toast.error("Corrija os erros antes de continuar");
      return;
    }

    try {
      // Obter o user_id da sessão atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const medicaoData = {
        paciente_id: pacienteId,
        prontuario_id: selectedProntuarioId,
        user_id: user.id,
        data: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        comprimento: parseFloat(comprimento),
        largura: parseFloat(largura),
        diagonal_d: parseFloat(diagonalD),
        diagonal_e: parseFloat(diagonalE),
        perimetro_cefalico: perimetroCefalico ? parseFloat(perimetroCefalico) : null,
        indice_craniano: indiceCraniano || 0,
        diferenca_diagonais: diferencaDiagonais || 0,
        cvai: cvai || 0,
        observacoes: observacoes || null,
        status: 'normal' as const, // Valor padrão conforme o enum
      };

      const { data, error } = await supabase
        .from('medicoes')
        .insert([medicaoData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Medição salva com sucesso!");
      navigate(`/pacientes/${pacienteId}/relatorios/${data.id}`);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      toast.error("Erro ao salvar medição");
    }
  };

  const handlePhotoCapture = () => {
    navigate('/medicao-por-foto');
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Prontuário */}
      {!prontuarioId && prontuarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="prontuario">Prontuário para associar a medição</Label>
              <Select 
                value={selectedProntuarioId} 
                onValueChange={setSelectedProntuarioId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um prontuário..." />
                </SelectTrigger>
                <SelectContent>
                  {prontuarios.map((prontuario) => (
                    <SelectItem key={prontuario.id} value={prontuario.id}>
                      {new Date(prontuario.data_criacao).toLocaleDateString('pt-BR')} 
                      {prontuario.observacoes_gerais && ` - ${prontuario.observacoes_gerais.substring(0, 50)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Medição */}
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
        onPhotoCapture={handlePhotoCapture}
      />
    </div>
  );
}
