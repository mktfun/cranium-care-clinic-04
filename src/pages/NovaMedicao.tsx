
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { obterPacientePorId } from "@/data/mock-data";
import { formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  
  // Form state
  const [activeTab, setActiveTab] = useState("manual");
  const [data, setData] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [diagonalD, setDiagonalD] = useState("");
  const [diagonalE, setDiagonalE] = useState("");
  const [perimetroCefalico, setPerimetroCefalico] = useState(""); // New field
  const [observacoes, setObservacoes] = useState("");
  
  // Calculated values
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  
  // Load patient data
  useEffect(() => {
    if (id) {
      const pacienteData = obterPacientePorId(id);
      if (pacienteData) {
        setPaciente(pacienteData);
        // Set default date to today
        setData(new Date().toISOString().split('T')[0]);
      }
    }
  }, [id]);
  
  // Calculate derived measurements when primary measurements change
  useEffect(() => {
    // Calculate Cranial Index
    if (comprimento && largura && Number(comprimento) > 0) {
      const ic = (Number(largura) / Number(comprimento)) * 100;
      setIndiceCraniano(parseFloat(ic.toFixed(1)));
    } else {
      setIndiceCraniano(null);
    }
    
    // Calculate Diagonal Difference and CVAI
    if (diagonalD && diagonalE && Number(diagonalD) > 0 && Number(diagonalE) > 0) {
      const diaD = Number(diagonalD);
      const diaE = Number(diagonalE);
      
      // Difference in mm
      const diff = Math.abs(diaD - diaE);
      setDiferencaDiagonais(diff);
      
      // CVAI in percentage
      const longer = Math.max(diaD, diaE);
      const shorter = Math.min(diaD, diaE);
      const cvaiValue = ((longer - shorter) / shorter) * 100;
      setCvai(parseFloat(cvaiValue.toFixed(1)));
    } else {
      setDiferencaDiagonais(null);
      setCvai(null);
    }
  }, [comprimento, largura, diagonalD, diagonalE]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!comprimento || !largura || !diagonalD || !diagonalE) {
      toast.error("Preencha todas as medidas obrigatórias");
      return;
    }
    
    // All required values are calculated or provided
    if (indiceCraniano !== null && diferencaDiagonais !== null && cvai !== null) {
      // Determine status based on measurements
      const { asymmetryType, severityLevel } = getCranialStatus(indiceCraniano, cvai);
      
      // Create new measurement object
      const novaMedicao = {
        id: `m${Date.now()}`,
        data: new Date(data).toISOString(),
        comprimento: Number(comprimento),
        largura: Number(largura),
        diagonalD: Number(diagonalD),
        diagonalE: Number(diagonalE),
        diferencaDiagonais,
        indiceCraniano,
        cvai,
        perimetroCefalico: perimetroCefalico ? Number(perimetroCefalico) : undefined,
        status: severityLevel,
        asymmetryType,
        observacoes: observacoes || undefined
      };
      
      // In a real app, here we would save the measurement to the database
      
      toast.success("Medição registrada com sucesso!");
      // Navigate back to patient details
      navigate(`/pacientes/${id}`);
    } else {
      toast.error("Erro ao calcular os valores derivados");
    }
  };
  
  if (!paciente) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Nova Medição</h2>
        <p className="text-muted-foreground">
          Paciente: {paciente.nome} • {formatAgeHeader(paciente.dataNascimento)} • {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          <TabsTrigger value="scanner">Scanner 3D</TabsTrigger>
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
                    <Input 
                      id="data" 
                      type="date" 
                      value={data} 
                      onChange={(e) => setData(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comprimento">Comprimento Máximo (mm)</Label>
                    <Input 
                      id="comprimento" 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={comprimento} 
                      onChange={(e) => setComprimento(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="largura">Largura Máxima (mm)</Label>
                    <Input 
                      id="largura" 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={largura} 
                      onChange={(e) => setLargura(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagonalD">Diagonal Direita (mm)</Label>
                    <Input 
                      id="diagonalD" 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={diagonalD} 
                      onChange={(e) => setDiagonalD(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagonalE">Diagonal Esquerda (mm)</Label>
                    <Input 
                      id="diagonalE" 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={diagonalE} 
                      onChange={(e) => setDiagonalE(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* New Perímetro Cefálico field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perimetroCefalico">Perímetro Cefálico (mm)</Label>
                    <Input 
                      id="perimetroCefalico" 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={perimetroCefalico} 
                      onChange={(e) => setPerimetroCefalico(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    value={observacoes} 
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="p-4 border rounded-md bg-muted/30">
                  <h4 className="font-medium mb-3">Valores Calculados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Índice Craniano</Label>
                      <div className="font-medium mt-1">{indiceCraniano !== null ? `${indiceCraniano}%` : '-'}</div>
                    </div>
                    <div>
                      <Label>Diferença das Diagonais</Label>
                      <div className="font-medium mt-1">{diferencaDiagonais !== null ? `${diferencaDiagonais} mm` : '-'}</div>
                    </div>
                    <div>
                      <Label>CVAI</Label>
                      <div className="font-medium mt-1">{cvai !== null ? `${cvai}%` : '-'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => navigate(`/pacientes/${id}`)}>
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
                <Button variant="outline">Conectar ao Scanner</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
