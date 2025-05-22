
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SystemSetting } from "./types";

interface SecuritySettingsProps {
  settings: SystemSetting[];
  updateSetting: (key: string, value: any) => void;
}

export function SecuritySettings({ settings, updateSetting }: SecuritySettingsProps) {
  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  // Helper function to check if setting exists
  const hasSetting = (key: string) => {
    return settings.some(s => s.key === key);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Política de Senhas</CardTitle>
          <CardDescription>
            Configure os requisitos de segurança para senhas de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password-min-length">Comprimento Mínimo</Label>
              <Input
                id="password-min-length"
                type="number"
                min="6"
                max="32"
                value={getSetting("password_min_length", 8)}
                onChange={(e) => updateSetting("password_min_length", parseInt(e.target.value))}
                disabled={!hasSetting("password_min_length")}
              />
              <p className="text-sm text-muted-foreground">
                Número mínimo de caracteres para senhas de usuários
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="password-require-uppercase">Exigir Letra Maiúscula</Label>
                <p className="text-sm text-muted-foreground">
                  Exige pelo menos uma letra maiúscula nas senhas
                </p>
              </div>
              <Switch
                id="password-require-uppercase"
                checked={getSetting("password_require_uppercase", true)}
                onCheckedChange={(checked) => updateSetting("password_require_uppercase", checked)}
                disabled={!hasSetting("password_require_uppercase")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="password-require-lowercase">Exigir Letra Minúscula</Label>
                <p className="text-sm text-muted-foreground">
                  Exige pelo menos uma letra minúscula nas senhas
                </p>
              </div>
              <Switch
                id="password-require-lowercase"
                checked={getSetting("password_require_lowercase", true)}
                onCheckedChange={(checked) => updateSetting("password_require_lowercase", checked)}
                disabled={!hasSetting("password_require_lowercase")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="password-require-number">Exigir Número</Label>
                <p className="text-sm text-muted-foreground">
                  Exige pelo menos um número nas senhas
                </p>
              </div>
              <Switch
                id="password-require-number"
                checked={getSetting("password_require_number", true)}
                onCheckedChange={(checked) => updateSetting("password_require_number", checked)}
                disabled={!hasSetting("password_require_number")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="password-require-special">Exigir Caractere Especial</Label>
                <p className="text-sm text-muted-foreground">
                  Exige pelo menos um caractere especial nas senhas (ex: !@#$%^&*)
                </p>
              </div>
              <Switch
                id="password-require-special"
                checked={getSetting("password_require_special", false)}
                onCheckedChange={(checked) => updateSetting("password_require_special", checked)}
                disabled={!hasSetting("password_require_special")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação e Sessão</CardTitle>
          <CardDescription>
            Configure os parâmetros de autenticação e sessão de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="session-timeout">Tempo de Expiração de Sessão (minutos)</Label>
              <Input
                id="session-timeout"
                type="number"
                min="5"
                max="1440"
                value={getSetting("session_timeout_minutes", 60)}
                onChange={(e) => updateSetting("session_timeout_minutes", parseInt(e.target.value))}
                disabled={!hasSetting("session_timeout_minutes")}
              />
              <p className="text-sm text-muted-foreground">
                Tempo de inatividade após o qual a sessão do usuário expira
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="max-login-attempts">Máximo de Tentativas de Login</Label>
              <Input
                id="max-login-attempts"
                type="number"
                min="1"
                max="10"
                value={getSetting("max_login_attempts", 5)}
                onChange={(e) => updateSetting("max_login_attempts", parseInt(e.target.value))}
                disabled={!hasSetting("max_login_attempts")}
              />
              <p className="text-sm text-muted-foreground">
                Número máximo de tentativas de login falhas antes do bloqueio temporário
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lockout-duration">Duração do Bloqueio (minutos)</Label>
              <Input
                id="lockout-duration"
                type="number"
                min="1"
                max="60"
                value={getSetting("lockout_duration_minutes", 15)}
                onChange={(e) => updateSetting("lockout_duration_minutes", parseInt(e.target.value))}
                disabled={!hasSetting("lockout_duration_minutes")}
              />
              <p className="text-sm text-muted-foreground">
                Tempo de bloqueio após exceder o número máximo de tentativas de login
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-email-verification">Exigir Verificação de Email</Label>
                <p className="text-sm text-muted-foreground">
                  Exige que novos usuários verifiquem seu email antes de fazer login
                </p>
              </div>
              <Switch
                id="require-email-verification"
                checked={getSetting("require_email_verification", true)}
                onCheckedChange={(checked) => updateSetting("require_email_verification", checked)}
                disabled={!hasSetting("require_email_verification")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
