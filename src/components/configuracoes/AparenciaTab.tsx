
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  ThemeOption, 
  AnimationSpeed, 
  DensityOption, 
  BorderRadiusOption,
  BackgroundPatternOption,
  ThemeSettings,
  defaultThemeSettings,
  applyThemeSettings,
  loadThemeSettings,
  saveThemeSettings
} from "@/lib/theme-utils";

interface ThemePreviewProps {
  theme: ThemeOption;
  isDarkMode: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function ThemePreview({ theme, isDarkMode, isSelected, onClick }: ThemePreviewProps) {
  // Definir cores para cada tema
  const themeColors = {
    default: {
      primary: isDarkMode ? "#25c4e1" : "#029daf",
      secondary: isDarkMode ? "#cd5d5d" : "#AF5B5B",
      accent: isDarkMode ? "#4c8ade" : "#276FBF",
      background: isDarkMode ? "#192c33" : "#f9fafa"
    },
    ocean: {
      primary: isDarkMode ? "#33a5cc" : "#0c7eb3",
      secondary: isDarkMode ? "#4287d6" : "#2563da",
      accent: isDarkMode ? "#5d68e6" : "#3b47cc",
      background: isDarkMode ? "#192c37" : "#f5f9fc"
    },
    nature: {
      primary: isDarkMode ? "#40b07f" : "#25996a",
      secondary: isDarkMode ? "#6bba6b" : "#4a994a",
      accent: isDarkMode ? "#30c9b0" : "#0ba692",
      background: isDarkMode ? "#1a2c20" : "#f5fcf7"
    },
    sunset: {
      primary: isDarkMode ? "#f56d42" : "#d94c1e",
      secondary: isDarkMode ? "#f8a145" : "#dd8112",
      accent: isDarkMode ? "#e64c72" : "#cb2c52",
      background: isDarkMode ? "#2a1b17" : "#fffaf5"
    },
    purple: {
      primary: isDarkMode ? "#9967e6" : "#7c4dde",
      secondary: isDarkMode ? "#b070e0" : "#9b52ce",
      accent: isDarkMode ? "#8378e8" : "#6457d8",
      background: isDarkMode ? "#201a33" : "#f9f7fe"
    },
    "high-contrast": {
      primary: isDarkMode ? "#408cff" : "#0051ce",
      secondary: isDarkMode ? "#ffffff" : "#000000",
      accent: isDarkMode ? "#408cff" : "#0051ce",
      background: isDarkMode ? "#000000" : "#ffffff"
    }
  };
  
  const colors = themeColors[theme];
  
  return (
    <div 
      className={`
        relative rounded-lg border p-3 cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}
      `}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
          <Check size={12} />
        </div>
      )}
      
      <div className="text-xs font-medium mb-2 text-center">
        {theme === 'default' ? 'Padrão' : 
         theme === 'ocean' ? 'Oceano' : 
         theme === 'nature' ? 'Natureza' : 
         theme === 'sunset' ? 'Pôr do Sol' : 
         theme === 'purple' ? 'Roxo' : 
         'Alto Contraste'}
      </div>
      
      <div 
        className="h-16 rounded-md mb-2 relative overflow-hidden" 
        style={{ backgroundColor: colors.background }}
      >
        <div className="absolute top-2 left-2 right-2 h-4 rounded" style={{ backgroundColor: colors.primary }}></div>
        <div className="absolute top-8 left-2 w-6 h-6 rounded" style={{ backgroundColor: colors.secondary }}></div>
        <div className="absolute top-8 left-10 right-2 h-3 rounded" style={{ backgroundColor: colors.accent }}></div>
      </div>
    </div>
  );
}

export default function AparenciaTab() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  
  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = loadThemeSettings();
    setSettings(savedSettings);
    setPreviewMode(savedSettings.isDark ? 'dark' : 'light');
  }, []);
  
  // Aplicar configurações quando elas mudarem
  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);
  
  // Atualizar configurações
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveThemeSettings(updatedSettings);
  };
  
  // Restaurar configurações padrão
  const resetToDefaults = () => {
    setSettings(defaultThemeSettings);
    saveThemeSettings(defaultThemeSettings);
    applyThemeSettings(defaultThemeSettings);
    toast.success("Configurações visuais restauradas para o padrão");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do sistema conforme sua preferência.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seleção de tema */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Tema</Label>
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'light' | 'dark')}>
              <TabsList className="grid w-[160px] grid-cols-2">
                <TabsTrigger value="light">Claro</TabsTrigger>
                <TabsTrigger value="dark">Escuro</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ThemePreview
              theme="default"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'default'}
              onClick={() => updateSettings({ theme: 'default' })}
            />
            
            <ThemePreview
              theme="ocean"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'ocean'}
              onClick={() => updateSettings({ theme: 'ocean' })}
            />
            
            <ThemePreview
              theme="nature"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'nature'}
              onClick={() => updateSettings({ theme: 'nature' })}
            />
            
            <ThemePreview
              theme="sunset"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'sunset'}
              onClick={() => updateSettings({ theme: 'sunset' })}
            />
            
            <ThemePreview
              theme="purple"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'purple'}
              onClick={() => updateSettings({ theme: 'purple' })}
            />
            
            <ThemePreview
              theme="high-contrast"
              isDarkMode={previewMode === 'dark'}
              isSelected={settings.theme === 'high-contrast'}
              onClick={() => updateSettings({ theme: 'high-contrast' })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="dark-mode"
              checked={settings.isDark}
              onCheckedChange={(checked) => updateSettings({ isDark: checked })}
            />
            <Label htmlFor="dark-mode">Modo Escuro</Label>
          </div>
        </div>
        
        {/* Personalizações de Layout e Animações */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Densidade da Interface</Label>
            <Select 
              value={settings.density}
              onValueChange={(value) => updateSettings({ density: value as DensityOption })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a densidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Confortável</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Bordas Arredondadas</Label>
            <Select 
              value={settings.borderRadius}
              onValueChange={(value) => updateSettings({ borderRadius: value as BorderRadiusOption })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o arredondamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem arredondamento</SelectItem>
                <SelectItem value="small">Leve</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Animações e Padrões de Fundo */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Velocidade das Animações</Label>
            <Select 
              value={settings.animationSpeed}
              onValueChange={(value) => updateSettings({ animationSpeed: value as AnimationSpeed })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a velocidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Rápida</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="slow">Lenta</SelectItem>
                <SelectItem value="none">Sem animações</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Padrão de Fundo</Label>
            <Select 
              value={settings.backgroundPattern}
              onValueChange={(value) => updateSettings({ backgroundPattern: value as BackgroundPatternOption })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem padrão</SelectItem>
                <SelectItem value="dots">Pontilhado</SelectItem>
                <SelectItem value="grid">Grade</SelectItem>
                <SelectItem value="waves">Ondas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Botão para restaurar configurações */}
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center"
            onClick={resetToDefaults}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restaurar Configurações Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
