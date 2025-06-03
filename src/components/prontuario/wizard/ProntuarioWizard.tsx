
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Prontuario } from "@/types";

import { WizardStep1 } from "./WizardStep1";
import { WizardStep2 } from "./WizardStep2";
import { WizardStep3 } from "./WizardStep3";
import { WizardStep4 } from "./WizardStep4";
import { WizardStep5 } from "./WizardStep5";

interface ProntuarioWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  paciente: any;
  onSuccess: (prontuario: Prontuario) => void;
}

const stepTitles = [
  "Dados da Consulta",
  "Anamnese e Avaliação",
  "Conduta Médica",
  "Diagnóstico",
  "Prescrição"
];

export function ProntuarioWizard({
  open,
  onOpenChange,
  pacienteId,
  paciente,
  onSuccess
}: ProntuarioWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1 - Dados da Consulta
    peso: "",
    altura: "",
    tipo_sanguineo: "",
    alergias: "",
    observacoes_gerais: "",
    
    // Step 2 - Anamnese e Avaliação
    queixa_principal: "",
    idade_gestacional: "",
    idade_corrigida: "",
    observacoes_anamnese: "",
    avaliacao: "",
    
    // Step 3 - Conduta
    conduta: "",
    atestado: "",
    
    // Step 4 - Diagnóstico
    diagnostico: "",
    cid: "",
    
    // Step 5 - Prescrição
    prescricao: ""
  });

  // Criar prontuário inicial ao abrir o wizard
  useEffect(() => {
    if (open && !prontuario) {
      createInitialProntuario();
    }
  }, [open]);

  const createInitialProntuario = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .insert({
          paciente_id: pacienteId,
          data_criacao: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setProntuario(data as Prontuario);
      console.log("Prontuário inicial criado:", data);
    } catch (error) {
      console.error("Erro ao criar prontuário:", error);
      toast.error("Erro ao iniciar prontuário");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentStep = async () => {
    if (!prontuario) return;
    
    setIsLoading(true);
    try {
      let updateData: any = {};
      
      // Determinar quais dados salvar baseado na etapa atual
      switch (currentStep) {
        case 0:
          updateData = {
            peso: formData.peso ? parseFloat(formData.peso) : null,
            altura: formData.altura ? parseFloat(formData.altura) : null,
            tipo_sanguineo: formData.tipo_sanguineo || null,
            alergias: formData.alergias || null,
            observacoes_gerais: formData.observacoes_gerais || null
          };
          break;
        case 1:
          updateData = {
            queixa_principal: formData.queixa_principal || null,
            idade_gestacional: formData.idade_gestacional || null,
            idade_corrigida: formData.idade_corrigida || null,
            observacoes_anamnese: formData.observacoes_anamnese || null,
            avaliacao: formData.avaliacao || null
          };
          break;
        case 2:
          updateData = {
            conduta: formData.conduta || null,
            atestado: formData.atestado || null
          };
          break;
        case 3:
          updateData = {
            diagnostico: formData.diagnostico || null,
            cid: formData.cid || null
          };
          break;
        case 4:
          updateData = {
            prescricao: formData.prescricao || null
          };
          break;
      }
      
      const { error } = await supabase
        .from('prontuarios')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', prontuario.id);
      
      if (error) throw error;
      
      // Atualizar estado local
      setProntuario(prev => prev ? { ...prev, ...updateData } : null);
      
      console.log(`Etapa ${currentStep + 1} salva:`, updateData);
      toast.success(`Etapa ${currentStep + 1} salva com sucesso!`);
      
    } catch (error) {
      console.error("Erro ao salvar etapa:", error);
      toast.error("Erro ao salvar dados da etapa");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await saveCurrentStep();
      
      if (currentStep < stepTitles.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Finalizar wizard
        if (prontuario) {
          onSuccess(prontuario);
          onOpenChange(false);
          navigate(`/pacientes/${pacienteId}/prontuario/${prontuario.id}`);
        }
      }
    } catch (error) {
      // Erro já tratado no saveCurrentStep
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      paciente
    };
    
    switch (currentStep) {
      case 0:
        return <WizardStep1 {...stepProps} />;
      case 1:
        return <WizardStep2 {...stepProps} />;
      case 2:
        return <WizardStep3 {...stepProps} />;
      case 3:
        return <WizardStep4 {...stepProps} />;
      case 4:
        return <WizardStep5 {...stepProps} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / stepTitles.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Prontuário - Etapa {currentStep + 1} de {stepTitles.length}
          </DialogTitle>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {stepTitles[currentStep]}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderCurrentStep()}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-turquesa hover:bg-turquesa/90"
          >
            {isLoading ? (
              "Salvando..."
            ) : currentStep === stepTitles.length - 1 ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
