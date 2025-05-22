
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SystemSetting } from "./types";

interface GeneralSettingsProps {
  settings: SystemSetting[];
  updateSetting: (key: string, value: any) => void;
}

export function GeneralSettings({ settings, updateSetting }: GeneralSettingsProps) {
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
          <CardTitle>Informações da Clínica</CardTitle>
          <CardDescription>
            Configurações básicas e informações de contato da clínica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clinic-name">Nome da Clínica</Label>
              <Input
                id="clinic-name"
                value={getSetting("clinic_name")}
                onChange={(e) => updateSetting("clinic_name", e.target.value)}
                placeholder="Nome da sua clínica"
                disabled={!hasSetting("clinic_name")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Email de Contato</Label>
              <Input
                id="contact-email"
                type="email"
                value={getSetting("contact_email")}
                onChange={(e) => updateSetting("contact_email", e.target.value)}
                placeholder="contato@clinica.com"
                disabled={!hasSetting("contact_email")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Telefone de Contato</Label>
              <Input
                id="contact-phone"
                value={getSetting("contact_phone")}
                onChange={(e) => updateSetting("contact_phone", e.target.value)}
                placeholder="(00) 0000-0000"
                disabled={!hasSetting("contact_phone")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={getSetting("address")}
                onChange={(e) => updateSetting("address", e.target.value)}
                placeholder="Endereço completo da clínica"
                disabled={!hasSetting("address")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={getSetting("timezone", "America/Sao_Paulo")}
                onValueChange={(value) => updateSetting("timezone", value)}
                disabled={!hasSetting("timezone")}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasil - São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Brasil - Manaus (GMT-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Brasil - Rio Branco (GMT-5)</SelectItem>
                  <SelectItem value="America/New_York">EUA - Nova York (GMT-5/4)</SelectItem>
                  <SelectItem value="Europe/Lisbon">Portugal - Lisboa (GMT+0/1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização</CardTitle>
          <CardDescription>
            Configurações de personalização da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="logo-url">URL do Logo</Label>
              <Input
                id="logo-url"
                value={getSetting("logo_url")}
                onChange={(e) => updateSetting("logo_url", e.target.value)}
                placeholder="https://sua-clinica.com/logo.png"
                disabled={!hasSetting("logo_url")}
              />
              <p className="text-sm text-muted-foreground">
                Link para a imagem do logo da clínica
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="primary-color"
                  type="color"
                  value={getSetting("primary_color", "#4C9AFF")}
                  onChange={(e) => updateSetting("primary_color", e.target.value)}
                  className="w-16 h-10"
                  disabled={!hasSetting("primary_color")}
                />
                <Input
                  value={getSetting("primary_color", "#4C9AFF")}
                  onChange={(e) => updateSetting("primary_color", e.target.value)}
                  placeholder="#4C9AFF"
                  disabled={!hasSetting("primary_color")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Cor primária utilizada na interface (formato hexadecimal)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
