
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SystemSetting } from "../SystemSettingsPanel";

interface NotificationSettingsProps {
  settings: SystemSetting[];
  updateSetting: (key: string, value: any) => void;
}

export function NotificationSettings({ settings, updateSetting }: NotificationSettingsProps) {
  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  // Helper function to check if setting exists
  const hasSetting = (key: string) => {
    return settings.some(s => s.key === key);
  };

  // Function to handle notification type change
  const handleNotificationTypeChange = (type: string, enabled: boolean) => {
    const currentTypes = getSetting("notification_types", []);
    let newTypes = [...currentTypes];
    
    if (enabled && !newTypes.includes(type)) {
      newTypes.push(type);
    } else if (!enabled && newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    }
    
    updateSetting("notification_types", newTypes);
  };

  // Check if a notification type is enabled
  const isNotificationTypeEnabled = (type: string) => {
    const types = getSetting("notification_types", []);
    return Array.isArray(types) && types.includes(type);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Email</CardTitle>
          <CardDescription>
            Configure as notificações por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications-enabled">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar o envio de notificações por email
              </p>
            </div>
            <Switch
              id="email-notifications-enabled"
              checked={getSetting("email_notifications_enabled", true)}
              onCheckedChange={(checked) => updateSetting("email_notifications_enabled", checked)}
              disabled={!hasSetting("email_notifications_enabled")}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email-from">Email Remetente</Label>
            <Input
              id="email-from"
              type="email"
              value={getSetting("email_from")}
              onChange={(e) => updateSetting("email_from", e.target.value)}
              placeholder="no-reply@clinica.com"
              disabled={!hasSetting("email_from")}
            />
            <p className="text-sm text-muted-foreground">
              Endereço de email usado como remetente nas notificações
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email-subject-prefix">Prefixo do Assunto</Label>
            <Input
              id="email-subject-prefix"
              value={getSetting("email_subject_prefix")}
              onChange={(e) => updateSetting("email_subject_prefix", e.target.value)}
              placeholder="[Cranium Care]"
              disabled={!hasSetting("email_subject_prefix")}
            />
            <p className="text-sm text-muted-foreground">
              Prefixo adicionado ao assunto de todos os emails enviados
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de SMS</CardTitle>
          <CardDescription>
            Configure as notificações por SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications-enabled">Notificações por SMS</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar o envio de notificações por SMS
              </p>
            </div>
            <Switch
              id="sms-notifications-enabled"
              checked={getSetting("sms_notifications_enabled", false)}
              onCheckedChange={(checked) => updateSetting("sms_notifications_enabled", checked)}
              disabled={!hasSetting("sms_notifications_enabled")}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sms-sender">Remetente SMS</Label>
            <Input
              id="sms-sender"
              value={getSetting("sms_sender_id")}
              onChange={(e) => updateSetting("sms_sender_id", e.target.value)}
              placeholder="CraniumCare"
              disabled={!hasSetting("sms_sender_id") || !getSetting("sms_notifications_enabled", false)}
            />
            <p className="text-sm text-muted-foreground">
              Identificador do remetente nos SMS (quando suportado pelo provedor)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Configure quais tipos de notificações estão habilitados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notification-appointment">Agendamentos</Label>
              <p className="text-sm text-muted-foreground">
                Notificações relacionadas a consultas e agendamentos
              </p>
            </div>
            <Switch
              id="notification-appointment"
              checked={isNotificationTypeEnabled("appointment")}
              onCheckedChange={(checked) => handleNotificationTypeChange("appointment", checked)}
              disabled={!hasSetting("notification_types")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notification-measurement">Medições</Label>
              <p className="text-sm text-muted-foreground">
                Notificações relacionadas a novas medições e resultados
              </p>
            </div>
            <Switch
              id="notification-measurement"
              checked={isNotificationTypeEnabled("measurement")}
              onCheckedChange={(checked) => handleNotificationTypeChange("measurement", checked)}
              disabled={!hasSetting("notification_types")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notification-report">Relatórios</Label>
              <p className="text-sm text-muted-foreground">
                Notificações relacionadas a geração e compartilhamento de relatórios
              </p>
            </div>
            <Switch
              id="notification-report"
              checked={isNotificationTypeEnabled("report")}
              onCheckedChange={(checked) => handleNotificationTypeChange("report", checked)}
              disabled={!hasSetting("notification_types")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notification-system">Sistema</Label>
              <p className="text-sm text-muted-foreground">
                Notificações relacionadas ao sistema e segurança
              </p>
            </div>
            <Switch
              id="notification-system"
              checked={isNotificationTypeEnabled("system")}
              onCheckedChange={(checked) => handleNotificationTypeChange("system", checked)}
              disabled={!hasSetting("notification_types")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
