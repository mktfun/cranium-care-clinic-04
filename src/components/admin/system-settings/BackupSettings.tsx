
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SystemSetting } from "../SystemSettingsPanel";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BackupSettingsProps {
  settings: SystemSetting[];
  updateSetting: (key: string, value: any) => void;
}

export function BackupSettings({ settings, updateSetting }: BackupSettingsProps) {
  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  // Helper function to check if setting exists
  const hasSetting = (key: string) => {
    return settings.some(s => s.key === key);
  };

  // Função para acionar backup manual (simulado)
  const handleManualBackup = () => {
    alert("Esta funcionalidade iniciaria um backup manual.\nEm um ambiente de produção, isso iniciaria o processo de backup no servidor.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Backup</CardTitle>
          <CardDescription>
            Configure o comportamento dos backups automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-backup-enabled">Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar backup automático do banco de dados
              </p>
            </div>
            <Switch
              id="auto-backup-enabled"
              checked={getSetting("auto_backup_enabled", true)}
              onCheckedChange={(checked) => updateSetting("auto_backup_enabled", checked)}
              disabled={!hasSetting("auto_backup_enabled")}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="backup-frequency">Frequência</Label>
            <Select
              id="backup-frequency"
              value={getSetting("backup_frequency", "daily")}
              onValueChange={(value) => updateSetting("backup_frequency", value)}
              disabled={!hasSetting("backup_frequency") || !getSetting("auto_backup_enabled", true)}
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </Select>
            <p className="text-sm text-muted-foreground">
              Frequência com que os backups automáticos são realizados
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="backup-time">Horário do Backup</Label>
            <Input
              id="backup-time"
              type="time"
              value={getSetting("backup_time", "02:00")}
              onChange={(e) => updateSetting("backup_time", e.target.value)}
              disabled={!hasSetting("backup_time") || !getSetting("auto_backup_enabled", true)}
            />
            <p className="text-sm text-muted-foreground">
              Horário para execução do backup automático (formato 24h)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="backup-retention">Período de Retenção (dias)</Label>
            <Input
              id="backup-retention"
              type="number"
              min="1"
              max="365"
              value={getSetting("backup_retention_days", 30)}
              onChange={(e) => updateSetting("backup_retention_days", Number(e.target.value))}
              disabled={!hasSetting("backup_retention_days")}
            />
            <p className="text-sm text-muted-foreground">
              Número de dias que os backups serão mantidos antes de serem excluídos automaticamente
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="include-images">Incluir Imagens</Label>
              <p className="text-sm text-muted-foreground">
                Incluir arquivos de imagem no backup (aumenta significativamente o tamanho)
              </p>
            </div>
            <Switch
              id="include-images"
              checked={getSetting("include_images", true)}
              onCheckedChange={(checked) => updateSetting("include_images", checked)}
              disabled={!hasSetting("include_images")}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleManualBackup}
            >
              <Download className="h-4 w-4" />
              Iniciar Backup Manual
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Inicia um backup manual imediato com as configurações atuais
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manutenção do Sistema</CardTitle>
          <CardDescription>
            Configure opções de manutenção e limpeza do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300">Atenção</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  As opções de manutenção podem afetar o desempenho do sistema. Recomenda-se executar estas operações fora do horário comercial.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="cleanup">
            <TabsList className="w-full">
              <TabsTrigger value="cleanup">Limpeza de Dados</TabsTrigger>
              <TabsTrigger value="performance">Otimização</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cleanup" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Limpar Logs Antigos
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Remove logs com mais de 90 dias
                </p>
              </div>
              
              <div className="grid gap-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Limpar Arquivos Temporários
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Remove arquivos temporários não utilizados
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reindexar Banco de Dados
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Otimiza índices do banco de dados para melhor desempenho
                </p>
              </div>
              
              <div className="grid gap-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Limpar Cache do Sistema
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Limpa caches temporários do sistema
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
