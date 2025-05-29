
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Baby, User, Heart, Scale, Ruler, Droplet, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

interface DadosPessoaisTabProps {
  paciente: any;
  prontuario: Prontuario;
  onUpdate?: (field: string, value: any) => void;
}

export function DadosPessoaisTab({ paciente, prontuario, onUpdate }: DadosPessoaisTabProps) {
  const [localPeso, setLocalPeso] = useState("");
  const [localAltura, setLocalAltura] = useState("");
  const [localTipoSanguineo, setLocalTipoSanguineo] = useState("");
  const [localAlergias, setLocalAlergias] = useState("");
  const [localObservacoesGerais, setLocalObservacoesGerais] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    console.log("Carregando dados do prontuário:", prontuario);
    const peso = prontuario?.peso?.toString() || "";
    const altura = prontuario?.altura?.toString() || "";
    const tipoSanguineo = prontuario?.tipo_sanguineo || "";
    const alergias = prontuario?.alergias || "";
    const observacoesGerais = prontuario?.observacoes_gerais || "";

    setLocalPeso(peso);
    setLocalAltura(altura);
    setLocalTipoSanguineo(tipoSanguineo);
    setLocalAlergias(alergias);
    setLocalObservacoesGerais(observacoesGerais);
    setHasChanges(false);

    console.log("Estados locais definidos:", { peso, altura, tipoSanguineo, alergias, observacoesGerais });
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    if (!prontuario) return;

    const currentPeso = prontuario?.peso?.toString() || "";
    const currentAltura = prontuario?.altura?.toString() || "";
    const currentTipoSanguineo = prontuario?.tipo_sanguineo || "";
    const currentAlergias = prontuario?.alergias || "";
    const currentObservacoesGerais = prontuario?.observacoes_gerais || "";

    const changed = 
      localPeso !== currentPeso ||
      localAltura !== currentAltura ||
      localTipoSanguineo !== currentTipoSanguineo ||
      localAlergias !== currentAlergias ||
      localObservacoesGerais !== currentObservacoesGerais;

    setHasChanges(changed);
  }, [localPeso, localAltura, localTipoSanguineo, localAlergias, localObservacoesGerais, prontuario]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      const currentPeso = prontuario?.peso?.toString() || "";
      const currentAltura = prontuario?.altura?.toString() || "";
      const currentTipoSanguineo = prontuario?.tipo_sanguineo || "";
      const currentAlergias = prontuario?.alergias || "";
      const currentObservacoesGerais = prontuario?.observacoes_gerais || "";

      if (localPeso !== currentPeso) {
        const pesoValue = localPeso.trim() ? parseFloat(localPeso) : null;
        updates.push(onUpdate?.("peso", pesoValue));
        console.log("Salvando peso:", pesoValue);
      }
      
      if (localAltura !== currentAltura) {
        const alturaValue = localAltura.trim() ? parseFloat(localAltura) : null;
        updates.push(onUpdate?.("altura", alturaValue));
        console.log("Salvando altura:", alturaValue);
      }
      
      if (localTipoSanguineo !== currentTipoSanguineo) {
        const tipoValue = localTipoSanguineo.trim() || null;
        updates.push(onUpdate?.("tipo_sanguineo", tipoValue));
        console.log("Salvando tipo sanguíneo:", tipoValue);
      }
      
      if (localAlergias !== currentAlergias) {
        const alergiasValue = localAlergias.trim() || null;
        updates.push(onUpdate?.("alergias", alergiasValue));
        console.log("Salvando alergias:", alergiasValue);
      }
      
      if (localObservacoesGerais !== currentObservacoesGerais) {
        const observacoesValue = localObservacoesGerais.trim() || null;
        updates.push(onUpdate?.("observacoes_gerais", observacoesValue));
        console.log("Salvando observações gerais:", observacoesValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Dados de Nascimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-turquesa" />
            Dados de Nascimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input value={paciente?.nome || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input value={formatarData(paciente?.data_nascimento)} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Sexo</Label>
              <Input value={paciente?.sexo || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Local de Nascimento</Label>
              <Input value={paciente?.local_nascimento || "Não informado"} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Atuais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-turquesa" />
              Dados Atuais da Consulta
            </CardTitle>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">
                <Scale className="h-4 w-4 inline mr-1" />
                Peso (kg)
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder="Ex: 3.5"
                value={localPeso}
                onChange={(e) => setLocalPeso(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="altura">
                <Ruler className="h-4 w-4 inline mr-1" />
                Altura (cm)
              </Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                placeholder="Ex: 50.5"
                value={localAltura}
                onChange={(e) => setLocalAltura(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipo_sanguineo">
                <Droplet className="h-4 w-4 inline mr-1" />
                Tipo Sanguíneo
              </Label>
              <Input
                id="tipo_sanguineo"
                placeholder="Ex: O+"
                value={localTipoSanguineo}
                onChange={(e) => setLocalTipoSanguineo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alergias">
              <Heart className="h-4 w-4 inline mr-1" />
              Alergias Conhecidas
            </Label>
            <Textarea
              id="alergias"
              placeholder="Descreva alergias conhecidas, medicamentosas ou alimentares..."
              value={localAlergias}
              onChange={(e) => setLocalAlergias(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
            <Textarea
              id="observacoes_gerais"
              placeholder="Observações gerais sobre o paciente..."
              value={localObservacoesGerais}
              onChange={(e) => setLocalObservacoesGerais(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Há alterações não salvas nesta aba.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
