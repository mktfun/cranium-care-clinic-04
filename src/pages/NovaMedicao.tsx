
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Upload, Save } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { toast } from "sonner";

export default function NovaMedicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  
  const [comprimento, setComprimento] = useState<string>("");
  const [largura, setLargura] = useState<string>("");
  const [diagonalD, setDiagonalD] = useState<string>("");
  const [diagonalE, setDiagonalE] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  
  // Estados para upload de imagens
  const [imagemSuperior, setImagemSuperior] = useState<File | null>(null);
  const [imagemLateral, setImagemLateral] = useState<File | null>(null);
  const [analisandoImagem, setAnalisandoImagem] = useState<boolean>(false);
  
  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Lista</Button>
      </div>
    );
  }
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'superior' | 'lateral') => {
    if (e.target.files && e.target.files.length > 0) {
      if (tipo === 'superior') {
        setImagemSuperior(e.target.files[0]);
      } else {
        setImagemLateral(e.target.files[0]);
      }
    }
  };
  
  const analisarImagens = () => {
    if (!imagemSuperior || !imagemLateral) {
      toast.error("Por favor, faça upload de ambas as imagens.");
      return;
    }
    
    setAnalisandoImagem(true);
    
    // Simulando análise de imagem
    setTimeout(() => {
      setComprimento("140");
      setLargura("110");
      setDiagonalD("160");
      setDiagonalE("158");
      
      setAnalisandoImagem(false);
      toast.success("Imagens analisadas com sucesso!");
    }, 2000);
  };
  
  const calcularIndices = () => {
    // Validar inputs
    if (!comprimento || !largura || !diagonalD || !diagonalE) {
      return null;
    }
    
    const comp = parseFloat(comprimento);
    const larg = parseFloat(largura);
    const diagD = parseFloat(diagonalD);
    const diagE = parseFloat(diagonalE);
    
    // Cálculo da diferença das diagonais
    const diferenca = Math.abs(diagD - diagE);
    
    // Cálculo do índice craniano (largura / comprimento * 100)
    const indiceCraniano = Math.round((larg / comp) * 100);
    
    // Cálculo do CVAI (diagonal maior / diagonal menor - 1) * 100
    const diagMaior = Math.max(diagD, diagE);
    const diagMenor = Math.min(diagD, diagE);
    const cvai = Math.round(((diagMaior / diagMenor) - 1) * 100);
    
    // Classificação
    let status: 'normal' | 'leve' | 'moderada' | 'severa' = 'normal';
    if (diferenca > 15) {
      status = 'severa';
    } else if (diferenca > 7) {
      status = 'moderada';
    } else if (diferenca > 4) {
      status = 'leve';
    }
    
    return {
      diferencaDiagonais: diferenca.toFixed(1),
      indiceCraniano,
      cvai,
      status
    };
  };
  
  const indices = calcularIndices();
  
  const handleSalvar = () => {
    if (!comprimento || !largura || !diagonalD || !diagonalE) {
      toast.error("Por favor, preencha todos os dados das medições.");
      return;
    }
    
    toast.success("Medição salva com sucesso!");
    navigate(`/pacientes/${id}/relatorio`);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(`/pacientes/${id}`)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Nova Medição</h2>
          <div className="text-muted-foreground mt-1">
            Paciente: {paciente.nome} • {paciente.idadeEmMeses} meses • 
            Nasc.: {formatarData(paciente.dataNascimento)}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          <TabsTrigger value="imagens">Análise de Imagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrada Manual de Medições</CardTitle>
              <CardDescription>
                Insira as medidas cranianas manualmente nos campos abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comprimento">Comprimento (mm)</Label>
                  <Input 
                    id="comprimento"
                    type="number" 
                    placeholder="Ex: 140" 
                    value={comprimento}
                    onChange={(e) => setComprimento(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (mm)</Label>
                  <Input 
                    id="largura"
                    type="number" 
                    placeholder="Ex: 110" 
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagonalD">Diagonal Direita (mm)</Label>
                  <Input 
                    id="diagonalD"
                    type="number" 
                    placeholder="Ex: 160" 
                    value={diagonalD}
                    onChange={(e) => setDiagonalD(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagonalE">Diagonal Esquerda (mm)</Label>
                  <Input 
                    id="diagonalE"
                    type="number" 
                    placeholder="Ex: 158" 
                    value={diagonalE}
                    onChange={(e) => setDiagonalE(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <textarea 
                  id="observacoes"
                  className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Observações sobre a medição..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="imagens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Imagem</CardTitle>
              <CardDescription>
                Faça upload das imagens do crânio para análise automática.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-dashed rounded-lg p-4 text-center">
                  <div className="space-y-2">
                    <h3 className="font-medium">Vista Superior</h3>
                    <div className="h-36 flex items-center justify-center bg-muted/30 rounded">
                      {imagemSuperior ? (
                        <div className="text-sm">
                          Arquivo: {imagemSuperior.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Arraste ou selecione uma imagem
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <Label htmlFor="upload-superior" className="w-full">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2 cursor-pointer w-full">
                          <Upload className="h-4 w-4 mr-2" /> Selecionar imagem
                        </span>
                      </Label>
                      <Input 
                        type="file" 
                        id="upload-superior" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => handleArquivoSelecionado(e, 'superior')} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border border-dashed rounded-lg p-4 text-center">
                  <div className="space-y-2">
                    <h3 className="font-medium">Vista Lateral</h3>
                    <div className="h-36 flex items-center justify-center bg-muted/30 rounded">
                      {imagemLateral ? (
                        <div className="text-sm">
                          Arquivo: {imagemLateral.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Arraste ou selecione uma imagem
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <Label htmlFor="upload-lateral" className="w-full">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2 cursor-pointer w-full">
                          <Upload className="h-4 w-4 mr-2" /> Selecionar imagem
                        </span>
                      </Label>
                      <Input 
                        type="file" 
                        id="upload-lateral" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => handleArquivoSelecionado(e, 'lateral')} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={analisarImagens}
                  disabled={!imagemSuperior || !imagemLateral || analisandoImagem}
                  className="bg-turquesa hover:bg-turquesa/90"
                >
                  {analisandoImagem ? "Analisando..." : "Analisar Imagens"}
                </Button>
              </div>
              
              {analisandoImagem && (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                      Carregando...
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Processando imagens...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Resultados calculados */}
        {indices && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados Calculados</CardTitle>
              <CardDescription>
                Índices calculados com base nas medidas inseridas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Diferença das Diagonais</p>
                  <p className="text-lg font-medium">{indices.diferencaDiagonais} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Índice Craniano</p>
                  <p className="text-lg font-medium">{indices.indiceCraniano}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CVAI</p>
                  <p className="text-lg font-medium">{indices.cvai}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={indices.status} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSalvar} className="bg-turquesa hover:bg-turquesa/90 w-full">
                <Save className="h-4 w-4 mr-2" /> Salvar Medição
              </Button>
            </CardFooter>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
