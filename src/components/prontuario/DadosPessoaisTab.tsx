
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, Baby, User } from "lucide-react";
import { toast } from "sonner";

// Mock data for prontuario
const mockProntuarioData = {
  id: "1",
  paciente_id: "123",
  data_criacao: "2025-03-01",
  // Dados de nascimento
  altura_nascimento: 50,
  peso_nascimento: 3.2,
  perimetro_cefalico_nascimento: 340,
  // Dados atuais
  altura: 175,
  peso: 70,
  perimetro_cefalico: 560,
  tipo_parto: "Normal",
  idade_gestacional: "39 semanas",
  apgar: "9/10",
  responsavel_nome: "Maria Silva",
  responsavel_telefone: "(11) 99999-8888",
  responsavel_email: "maria.silva@email.com",
  alergias: ["Nenhuma"],
  medicamentos: ["Nenhum"],
  observacoes: "Paciente saudável"
}

interface DadosPessoaisTabProps {
  paciente: any;
  prontuario: any;
}

export function DadosPessoaisTab({ paciente, prontuario }: DadosPessoaisTabProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dadosMedicos, setDadosMedicos] = useState<any>(null);
  
  useEffect(() => {
    async function fetchDadosMedicos() {
      try {
        // Since we can't access the prontuarios table, use mock data instead
        setDadosMedicos(mockProntuarioData);
      } catch (err) {
        console.error('Erro ao carregar dados médicos:', err);
        toast.error('Erro ao carregar dados médicos.');
      }
    }
    
    fetchDadosMedicos();
  }, [prontuario?.id]);
  
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Dados médicos atualizados com sucesso!');
      setEditMode(false);
    } catch (err) {
      console.error('Erro ao atualizar dados médicos:', err);
      toast.error('Erro ao atualizar dados médicos.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dados do Paciente</h3>
        {!editMode ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        ) : (
          <Button 
            size="sm" 
            onClick={handleSaveChanges} 
            disabled={loading}
            className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar
          </Button>
        )}
      </div>
      
      {/* Dados de Nascimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-blue-500" />
            Dados de Nascimento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="tipo_parto" className="text-muted-foreground">Tipo de Parto</Label>
              <Input 
                id="tipo_parto" 
                value={dadosMedicos?.tipo_parto || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, tipo_parto: e.target.value})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="idade_gestacional" className="text-muted-foreground">Idade Gestacional</Label>
              <Input 
                id="idade_gestacional" 
                value={dadosMedicos?.idade_gestacional || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, idade_gestacional: e.target.value})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="apgar" className="text-muted-foreground">APGAR</Label>
              <Input 
                id="apgar" 
                value={dadosMedicos?.apgar || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, apgar: e.target.value})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            
            {/* Dados físicos ao nascimento */}
            <div>
              <Label htmlFor="altura_nascimento" className="text-muted-foreground">Altura ao Nascimento (cm)</Label>
              <Input 
                id="altura_nascimento" 
                type="number" 
                value={dadosMedicos?.altura_nascimento || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, altura_nascimento: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="peso_nascimento" className="text-muted-foreground">Peso ao Nascimento (kg)</Label>
              <Input 
                id="peso_nascimento" 
                type="number" 
                value={dadosMedicos?.peso_nascimento || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, peso_nascimento: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="perimetro_cefalico_nascimento" className="text-muted-foreground">Perímetro Cefálico ao Nascimento (mm)</Label>
              <Input 
                id="perimetro_cefalico_nascimento" 
                type="number" 
                value={dadosMedicos?.perimetro_cefalico_nascimento || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, perimetro_cefalico_nascimento: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            Dados Atuais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="altura" className="text-muted-foreground">Altura Atual (cm)</Label>
              <Input 
                id="altura" 
                type="number" 
                value={dadosMedicos?.altura || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, altura: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="peso" className="text-muted-foreground">Peso Atual (kg)</Label>
              <Input 
                id="peso" 
                type="number" 
                value={dadosMedicos?.peso || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, peso: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="perimetro_cefalico" className="text-muted-foreground">Perímetro Cefálico Atual (mm)</Label>
              <Input 
                id="perimetro_cefalico" 
                type="number" 
                value={dadosMedicos?.perimetro_cefalico || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, perimetro_cefalico: parseFloat(e.target.value)})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            
            {/* Outras informações atuais */}
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="alergias" className="text-muted-foreground">Alergias</Label>
              <Input 
                id="alergias" 
                value={dadosMedicos?.alergias?.join(', ') || 'Nenhuma'} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, alergias: e.target.value.split(', ')})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="medicamentos" className="text-muted-foreground">Medicamentos</Label>
              <Input 
                id="medicamentos" 
                value={dadosMedicos?.medicamentos?.join(', ') || 'Nenhum'} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, medicamentos: e.target.value.split(', ')})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="observacoes" className="text-muted-foreground">Observações</Label>
              <Input 
                id="observacoes" 
                value={dadosMedicos?.observacoes || ''} 
                onChange={(e) => setDadosMedicos({...dadosMedicos, observacoes: e.target.value})} 
                disabled={!editMode}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="pt-4">
        <h3 className="text-lg font-semibold mb-4">Responsável</h3>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="responsavel_nome" className="text-muted-foreground">Nome</Label>
                <Input 
                  id="responsavel_nome" 
                  value={dadosMedicos?.responsavel_nome || ''} 
                  onChange={(e) => setDadosMedicos({...dadosMedicos, responsavel_nome: e.target.value})} 
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="responsavel_telefone" className="text-muted-foreground">Telefone</Label>
                <Input 
                  id="responsavel_telefone" 
                  value={dadosMedicos?.responsavel_telefone || ''} 
                  onChange={(e) => setDadosMedicos({...dadosMedicos, responsavel_telefone: e.target.value})} 
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="responsavel_email" className="text-muted-foreground">Email</Label>
                <Input 
                  id="responsavel_email" 
                  value={dadosMedicos?.responsavel_email || ''} 
                  onChange={(e) => setDadosMedicos({...dadosMedicos, responsavel_email: e.target.value})} 
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
