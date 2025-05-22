
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { GeneralSettings } from "./system-settings/GeneralSettings";
import { SecuritySettings } from "./system-settings/SecuritySettings";
import { NotificationSettings } from "./system-settings/NotificationSettings";
import { MeasurementSettings } from "./system-settings/MeasurementSettings";
import { BackupSettings } from "./system-settings/BackupSettings";
import { SystemSetting } from "./system-settings/types";

export default function SystemSettingsPanel() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [originalSettings, setOriginalSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAdminAuth = async () => {
      setLoading(true);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // If not authenticated, redirect to admin login
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome, admin_role")
        .eq("id", session.user.id)
        .single();

      if (!userData?.admin_role) {
        // If not admin, redirect to regular dashboard
        navigate("/dashboard");
        return;
      }

      setUserName(userData.nome || "Administrator");

      // Fetch system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("system_settings")
        .select("*");

      if (settingsError) {
        setError(settingsError.message);
        toast.error(`Erro ao carregar configurações: ${settingsError.message}`);
      } else if (settingsData) {
        // Ensure data types are properly mapped
        const formattedSettings: SystemSetting[] = settingsData.map((setting: any) => ({
          ...setting,
          // Ensure other fields are properly typed if needed
        }));
        
        setSettings(formattedSettings);
        setOriginalSettings(formattedSettings);
      }

      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prevSettings => {
      const settingIndex = prevSettings.findIndex(s => s.key === key);
      if (settingIndex > -1) {
        const newSettings = [...prevSettings];
        newSettings[settingIndex] = { ...newSettings[settingIndex], value };
        return newSettings;
      } else {
        // When creating a new setting, ensure it has the proper type structure
        return [...prevSettings, { 
          id: '', 
          category: activeTab, 
          key, 
          value, 
          description: '', 
          is_sensitive: false, 
          data_type: 'string', 
          created_at: '', 
          updated_at: '' 
        }];
      }
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);

    // Identify settings that have changed
    const changedSettings = settings.filter((setting, index) => {
      const originalSetting = originalSettings.find(s => s.key === setting.key);
      return originalSetting ? originalSetting.value !== setting.value : true;
    });

    // Update or insert changed settings
    for (const setting of changedSettings) {
      try {
        if (originalSettings.find(s => s.key === setting.key)) {
          // Update existing setting
          const { error: updateError } = await supabase
            .from("system_settings")
            .update({ value: setting.value, updated_at: new Date().toISOString() })
            .eq("key", setting.key);

          if (updateError) {
            setError(updateError.message);
            toast.error(`Erro ao atualizar configuração ${setting.key}: ${updateError.message}`);
            break; // Exit loop on error
          } else {
            toast.success(`Configuração ${setting.key} atualizada com sucesso!`);
          }
        } else {
          // Insert new setting
           const { error: insertError } = await supabase
            .from("system_settings")
            .insert([{ ...setting, category: activeTab }]);

          if (insertError) {
            setError(insertError.message);
            toast.error(`Erro ao inserir nova configuração ${setting.key}: ${insertError.message}`);
            break; // Exit loop on error
          } else {
            toast.success(`Nova configuração ${setting.key} inserida com sucesso!`);
          }
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(`Erro ao salvar configuração ${setting.key}: ${err.message}`);
        break; // Exit loop on error
      }
    }

    if (!error) {
      // If all settings were saved successfully, update originalSettings
      setOriginalSettings([...settings]);
      toast.success("Todas as configurações foram salvas com sucesso!");
    }

    setSaving(false);
  };

  const handleResetChanges = () => {
    setSettings([...originalSettings]);
    toast.info("Configurações redefinidas para os valores originais.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <div>
          <Button
            variant="secondary"
            onClick={handleResetChanges}
            className="mr-2"
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general" onClick={() => setActiveTab("general")}>Geral</TabsTrigger>
          <TabsTrigger value="security" onClick={() => setActiveTab("security")}>Segurança</TabsTrigger>
          <TabsTrigger value="notifications" onClick={() => setActiveTab("notifications")}>Notificações</TabsTrigger>
          <TabsTrigger value="measurements" onClick={() => setActiveTab("measurements")}>Medições</TabsTrigger>
          <TabsTrigger value="backup" onClick={() => setActiveTab("backup")}>Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>
        <TabsContent value="measurements">
          <MeasurementSettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>
        <TabsContent value="backup">
          <BackupSettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
