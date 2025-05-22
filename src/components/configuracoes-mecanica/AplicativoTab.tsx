
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Check, Download, Upload } from "lucide-react";
import { settingsStorage, TemaSettings, ExibicaoSettings } from "@/services/localStorageService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { applyTheme, applyDarkMode, applyBorderRadius } from "@/lib/theme-utils";

export function AplicativoTab() {
  const [tema, setTema] = useState<TemaSettings>({
    modo: "claro",
    corPrimaria: "#2563eb",
    corSecundaria: "#f59e0b",
    borderRadius: "medio"
  });
  
  const [exibicao, setExibicao] = useState<ExibicaoSettings>({
    itensPorPagina: 10,
    formatoData: "dd/MM/yyyy",
    formatoHora: "24h"
  });
  
  const [privacidade, setPrivacidade] = useState({
    salvarSessao: true,
    limparDadosAoSair: false
  });
  
  const [carregando, setCarregando] = useState(true);
  const [salvandoTema, setSalvandoTema] = useState(false);
  const [salvandoExibicao, setSalvandoExibicao] = useState(false);
  const [salvandoPrivacidade, setSalvandoPrivacidade] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  
  // Referência para o input de arquivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Carregar dados
  useEffect(() => {
    try {
      const settings = settingsStorage.getAll();
      
      if (settings.aplicativo) {
        setTema(settings.aplicativo.tema);
        setExibicao(settings.aplicativo.exibicao);
        setPrivacidade(settings.aplicativo.privacidade);
      }
      
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
      setCarregando(false);
    }
  }, []);
  
  // Aplicar tema ao carregar
  useEffect(() => {
    if (!carregando) {
      applyDarkMode(tema.modo === "escuro");
      applyBorderRadius(tema.borderRadius as any);
      
      // Aplicar cores customizadas
      document.documentElement.style.setProperty('--primary', tema.corPrimaria);
      document.documentElement.style.setProperty('--secondary', tema.corSecundaria);
    }
  }, [tema, carregando]);
  
  // Salvar tema
  const salvarTema = () => {
    try {
      setSalvandoTema(true);
      
      // Aplicar tema
      applyDarkMode(tema.modo === "escuro");
      applyBorderRadius(tema.borderRadius as any);
      document.documentElement.style.setProperty('--primary', tema.corPrimaria);
      document.documentElement.style.setProperty('--secondary', tema.corSecundaria);
      
      // Salvar no localStorage
      settingsStorage.updateSection('aplicativo', {
        tema
      });
      
      toast.success("Tema atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
      toast.error("Erro ao salvar configurações de tema");
    } finally {
      setSalvandoTema(false);
    }
  };
  
  // Salvar exibição
  const salvarExibicao = () => {
    try {
      setSalvandoExibicao(true);
      
      // Salvar no localStorage
      settingsStorage.updateSection('aplicativo', {
        exibicao
      });
      
      toast.success("Configurações de exibição atualizadas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar exibição:", error);
      toast.error("Erro ao salvar configurações de exibição");
    } finally {
      setSalvandoExibicao(false);
    }
  };
  
  // Salvar privacidade
  const salvarPrivacidade = () => {
    try {
      setSalvandoPrivacidade(true);
      
      // Salvar no localStorage
      settingsStorage.updateSection('aplicativo', {
        privacidade
      });
      
      toast.success("Configurações de privacidade atualizadas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar privacidade:", error);
      toast.error("Erro ao salvar configurações de privacidade");
    } finally {
      setSalvandoPrivacidade(false);
    }
  };
  
  // Exportar configurações
  const exportarConfiguracoes = () => {
    try {
      setExportando(true);
      
      // Obter dados
      const dados = settingsStorage.export();
      
      // Criar arquivo para download
      const blob = new Blob([dados], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecanica-pro-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Configurações exportadas com sucesso");
    } catch (error) {
      console.error("Erro ao exportar configurações:", error);
      toast.error("Erro ao exportar configurações");
    } finally {
      setExportando(false);
    }
  };
  
  // Importar configurações
  const iniciarImportacao = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const processarArquivoImportacao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImportando(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const conteudo = event.target?.result as string;
        
        try {
          // Validar JSON
          JSON.parse(conteudo);
          
          // Importar configurações
          const sucesso = settingsStorage.import(conteudo);
          
          if (sucesso) {
            toast.success("Configurações importadas com sucesso. Recarregando página...");
            
            // Recarregar a página para aplicar as novas configurações
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            toast.error("Formato de arquivo inválido");
          }
        } catch (error) {
          toast.error("Arquivo de configuração inválido");
        }
        
        setImportando(false);
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Erro ao importar configurações:", error);
      toast.error("Erro ao importar configurações");
      setImportando(false);
    }
  };
  
  // Restaurar configurações padrão
  const restaurarPadrao = () => {
    if (confirm("Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.")) {
      try {
        // Resetar configurações
        settingsStorage.reset();
        
        toast.success("Configurações restauradas com sucesso. Recarregando página...");
        
        // Recarregar a página para aplicar as novas configurações
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error("Erro ao restaurar configurações:", error);
        toast.error("Erro ao restaurar configurações");
      }
    }
  };
  
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="tema">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tema">Tema</TabsTrigger>
          <TabsTrigger value="exibicao">Exibição</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="tema" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Personalização de Tema</h3>
              <p className="text-sm text-muted-foreground">
                Customize a aparência do aplicativo de acordo com suas preferências
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Modo</Label>
                <RadioGroup
                  value={tema.modo}
                  onValueChange={(value) => setTema({...tema, modo: value as "claro" | "escuro"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="claro" id="modo-claro" />
                    <Label htmlFor="modo-claro">Claro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="escuro" id="modo-escuro" />
                    <Label htmlFor="modo-escuro">Escuro</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color"
                    id="corPrimaria"
                    value={tema.corPrimaria}
                    onChange={(e) => setTema({...tema, corPrimaria: e.target.value})}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={tema.corPrimaria}
                    onChange={(e) => setTema({...tema, corPrimaria: e.target.value})}
                    className="w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color"
                    id="corSecundaria"
                    value={tema.corSecundaria}
                    onChange={(e) => setTema({...tema, corSecundaria: e.target.value})}
                    className="w-16 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={tema.corSecundaria}
                    onChange={(e) => setTema({...tema, corSecundaria: e.target.value})}
                    className="w-32"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Arredondamento de Bordas</Label>
                <Select 
                  value={tema.borderRadius}
                  onValueChange={(value) => setTema({...tema, borderRadius: value as any})}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={salvarTema}
                  disabled={salvandoTema}
                >
                  {salvandoTema ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Aplicar Tema
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exibicao" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Configurações de Exibição</h3>
              <p className="text-sm text-muted-foreground">
                Configure como as informações são exibidas no aplicativo
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="itensPorPagina">Itens por Página</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number"
                    id="itensPorPagina"
                    value={exibicao.itensPorPagina}
                    onChange={(e) => setExibicao({...exibicao, itensPorPagina: parseInt(e.target.value) || 10})}
                    className="w-20"
                    min={5}
                    max={100}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Formato de Data</Label>
                <RadioGroup
                  value={exibicao.formatoData}
                  onValueChange={(value) => setExibicao({...exibicao, formatoData: value as any})}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dd/MM/yyyy" id="formato-data-1" />
                    <Label htmlFor="formato-data-1">DD/MM/YYYY (31/12/2023)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MM/dd/yyyy" id="formato-data-2" />
                    <Label htmlFor="formato-data-2">MM/DD/YYYY (12/31/2023)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yyyy-MM-dd" id="formato-data-3" />
                    <Label htmlFor="formato-data-3">YYYY-MM-DD (2023-12-31)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Formato de Hora</Label>
                <RadioGroup
                  value={exibicao.formatoHora}
                  onValueChange={(value) => setExibicao({...exibicao, formatoHora: value as any})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12h" id="formato-hora-1" />
                    <Label htmlFor="formato-hora-1">12h (2:30 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="formato-hora-2" />
                    <Label htmlFor="formato-hora-2">24h (14:30)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={salvarExibicao}
                  disabled={salvandoExibicao}
                >
                  {salvandoExibicao ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvar Preferências
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacidade" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Configurações de Privacidade</h3>
              <p className="text-sm text-muted-foreground">
                Configure as opções de privacidade e segurança do aplicativo
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="salvarSessao" className="font-medium">Manter Sessão Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanece conectado mesmo após fechar o navegador
                  </p>
                </div>
                <Switch 
                  id="salvarSessao"
                  checked={privacidade.salvarSessao}
                  onCheckedChange={(checked) => setPrivacidade({...privacidade, salvarSessao: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="limparDados" className="font-medium">Limpar Dados ao Sair</Label>
                  <p className="text-sm text-muted-foreground">
                    Limpa dados sensíveis ao encerrar a sessão
                  </p>
                </div>
                <Switch 
                  id="limparDados"
                  checked={privacidade.limparDadosAoSair}
                  onCheckedChange={(checked) => setPrivacidade({...privacidade, limparDadosAoSair: checked})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={salvarPrivacidade}
                  disabled={salvandoPrivacidade}
                >
                  {salvandoPrivacidade ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Backup e Restauração</h3>
              <p className="text-sm text-muted-foreground">
                Exporte ou importe configurações do aplicativo
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                  onClick={exportarConfiguracoes}
                  disabled={exportando}
                >
                  {exportando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Configurações
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                  onClick={iniciarImportacao}
                  disabled={importando}
                >
                  {importando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Configurações
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={processarArquivoImportacao}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={restaurarPadrao}
                >
                  Restaurar Configurações Padrão
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
