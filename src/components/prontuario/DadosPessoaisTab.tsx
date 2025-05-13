
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatAge } from "@/lib/age-utils";

interface DadosPessoaisTabProps {
  paciente: any;
  prontuario: any;
}

export function DadosPessoaisTab({ paciente, prontuario }: DadosPessoaisTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    altura: prontuario?.altura || "",
    peso: prontuario?.peso || "",
    tipo_sanguineo: prontuario?.tipo_sanguineo || "",
    alergias: prontuario?.alergias || "",
    observacoes: prontuario?.observacoes_gerais || ""
  });
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };
  
  const idadeFormatada = formatAge(paciente.data_nascimento);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({
          altura: editedData.altura,
          peso: editedData.peso,
          tipo_sanguineo: editedData.tipo_sanguineo,
          alergias: editedData.alergias,
          observacoes_gerais: editedData.observacoes
        })
        .eq('id', prontuario.id);
      
      if (error) {
        toast.error("Erro ao salvar dados: " + error.message);
        return;
      }
      
      toast.success("Dados atualizados com sucesso");
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao atualizar prontuário:", err);
      toast.error("Ocorreu um erro ao atualizar os dados");
    }
  };
  
  const handleCancel = () => {
    setEditedData({
      altura: prontuario?.altura || "",
      peso: prontuario?.peso || "",
      tipo_sanguineo: prontuario?.tipo_sanguineo || "",
      alergias: prontuario?.alergias || "",
      observacoes: prontuario?.observacoes_gerais || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Informações Pessoais</h3>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
            >
              <Check className="h-4 w-4" /> Salvar
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo</Label>
                  <p className="mt-1 font-medium">{paciente?.nome || "N/A"}</p>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <p className="mt-1 font-medium">{formatarData(paciente?.data_nascimento)} ({idadeFormatada})</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sexo</Label>
                  <p className="mt-1 font-medium">{paciente?.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
                </div>
                {isEditing ? (
                  <div>
                    <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
                    <Input
                      id="tipo_sanguineo"
                      name="tipo_sanguineo"
                      value={editedData.tipo_sanguineo}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Tipo Sanguíneo</Label>
                    <p className="mt-1 font-medium">{prontuario?.tipo_sanguineo || "Não informado"}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="altura">Altura (cm)</Label>
                      <Input
                        id="altura"
                        name="altura"
                        type="number"
                        value={editedData.altura}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        name="peso"
                        type="number"
                        value={editedData.peso}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Altura</Label>
                      <p className="mt-1 font-medium">
                        {prontuario?.altura ? `${prontuario.altura} cm` : "Não informado"}
                      </p>
                    </div>
                    <div>
                      <Label>Peso</Label>
                      <p className="mt-1 font-medium">
                        {prontuario?.peso ? `${prontuario.peso} kg` : "Não informado"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                {isEditing ? (
                  <>
                    <Label htmlFor="alergias">Alergias</Label>
                    <Input
                      id="alergias"
                      name="alergias"
                      value={editedData.alergias}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </>
                ) : (
                  <>
                    <Label>Alergias</Label>
                    <p className="mt-1 font-medium">
                      {prontuario?.alergias || "Nenhuma alergia registrada"}
                    </p>
                  </>
                )}
              </div>
              
              <div>
                {isEditing ? (
                  <>
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      value={editedData.observacoes}
                      onChange={handleChange}
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </>
                ) : (
                  <>
                    <Label>Observações Gerais</Label>
                    <p className="mt-1 font-medium">
                      {prontuario?.observacoes_gerais || "Nenhuma observação registrada"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Responsáveis do paciente */}
      {paciente?.responsaveis && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Responsáveis</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Array.isArray(paciente.responsaveis) ? (
                  paciente.responsaveis.map((resp: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <p className="font-medium">{resp.nome}</p>
                      <div className="text-sm text-muted-foreground">
                        {resp.telefone && <span className="block">{resp.telefone}</span>}
                        {resp.email && <span className="block">{resp.email}</span>}
                      </div>
                    </div>
                  ))
                ) : paciente.responsaveis ? (
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">{paciente.responsaveis.nome}</p>
                    <div className="text-sm text-muted-foreground">
                      {paciente.responsaveis.telefone && <span className="block">{paciente.responsaveis.telefone}</span>}
                      {paciente.responsaveis.email && <span className="block">{paciente.responsaveis.email}</span>}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum responsável cadastrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
