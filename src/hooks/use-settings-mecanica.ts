
import { useEffect, useState } from "react";
import { settingsStorage, MecanicaSettings } from "@/services/localStorageService";
import { applyDarkMode, applyBorderRadius } from "@/lib/theme-utils";

export function useMecanicaSettings() {
  const [settings, setSettings] = useState<MecanicaSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar configurações
  useEffect(() => {
    try {
      const loadedSettings = settingsStorage.getAll();
      setSettings(loadedSettings);
      
      // Aplicar tema
      if (loadedSettings.aplicativo?.tema) {
        const { tema } = loadedSettings.aplicativo;
        
        // Aplicar modo claro/escuro
        applyDarkMode(tema.modo === "escuro");
        
        // Aplicar raio das bordas
        applyBorderRadius(tema.borderRadius as any);
        
        // Aplicar cores customizadas
        document.documentElement.style.setProperty('--primary', tema.corPrimaria);
        document.documentElement.style.setProperty('--secondary', tema.corSecundaria);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setLoading(false);
    }
  }, []);

  // Atualizar configurações
  const updateSettings = (newSettings: Partial<MecanicaSettings>) => {
    try {
      settingsStorage.update(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
    }
  };

  // Atualizar seção específica
  const updateSection = <K extends keyof MecanicaSettings>(
    section: K,
    data: Partial<MecanicaSettings[K]>
  ) => {
    try {
      settingsStorage.updateSection(section, data);
      
      // Atualizar estado local
      setSettings(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          [section]: {
            ...prev[section],
            ...data
          }
        };
      });
    } catch (error) {
      console.error(`Erro ao atualizar seção ${String(section)}:`, error);
    }
  };

  return { settings, loading, updateSettings, updateSection };
}
