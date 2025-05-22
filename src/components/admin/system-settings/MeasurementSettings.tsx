
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { SystemSetting } from "../SystemSettingsPanel";

interface MeasurementSettingsProps {
  settings: SystemSetting[];
  updateSetting: (key: string, value: any) => void;
}

export function MeasurementSettings({ settings, updateSetting }: MeasurementSettingsProps) {
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
          <CardTitle>Unidades de Medida</CardTitle>
          <CardDescription>
            Configure as unidades de medida para medições cranianas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="default-unit">Unidade Padrão</Label>
            <Select 
              value={getSetting("default_unit", "mm")}
              onValueChange={(value) => updateSetting("default_unit", value)}
              disabled={!hasSetting("default_unit")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">Milímetros (mm)</SelectItem>
                <SelectItem value="cm">Centímetros (cm)</SelectItem>
                <SelectItem value="in">Polegadas (in)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Unidade padrão utilizada para exibir medições cranianas
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="precision">Precisão Decimal</Label>
            <Select
              value={getSetting("precision", "1")}
              onValueChange={(value) => updateSetting("precision", value)}
              disabled={!hasSetting("precision")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a precisão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 casas decimais</SelectItem>
                <SelectItem value="1">1 casa decimal</SelectItem>
                <SelectItem value="2">2 casas decimais</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Número de casas decimais exibidas nas medições
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faixas de Normalidade</CardTitle>
          <CardDescription>
            Configure as faixas de normalidade para índices cranianos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Índice Craniano (IC)</Label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={getSetting("cranial_index_min", 75)}
                onChange={(e) => updateSetting("cranial_index_min", Number(e.target.value))}
                disabled={!hasSetting("cranial_index_min")}
                className="w-20"
              />
              <span>a</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={getSetting("cranial_index_max", 85)}
                onChange={(e) => updateSetting("cranial_index_max", Number(e.target.value))}
                disabled={!hasSetting("cranial_index_max")}
                className="w-20"
              />
              <span>%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Faixa de normalidade para o Índice Craniano (largura/comprimento)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label>Índice de Assimetria Craniana (CVAI)</Label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={getSetting("cvai_threshold", 3.5)}
                onChange={(e) => updateSetting("cvai_threshold", Number(e.target.value))}
                disabled={!hasSetting("cvai_threshold")}
                className="w-20"
              />
              <span>%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Limiar para diagnóstico de plagiocefalia (valores acima são considerados anormais)
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid gap-2">
            <Label>Classificação de Severidade da Plagiocefalia</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Leve:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getSetting("plagiocephaly_mild_min", 3.5)}
                    onChange={(e) => updateSetting("plagiocephaly_mild_min", Number(e.target.value))}
                    disabled={!hasSetting("plagiocephaly_mild_min")}
                    className="w-20"
                  />
                  <span>a</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getSetting("plagiocephaly_mild_max", 7.0)}
                    onChange={(e) => updateSetting("plagiocephaly_mild_max", Number(e.target.value))}
                    disabled={!hasSetting("plagiocephaly_mild_max")}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Moderada:</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getSetting("plagiocephaly_moderate_min", 7.0)}
                    onChange={(e) => updateSetting("plagiocephaly_moderate_min", Number(e.target.value))}
                    disabled={!hasSetting("plagiocephaly_moderate_min")}
                    className="w-20"
                  />
                  <span>a</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getSetting("plagiocephaly_moderate_max", 12.0)}
                    onChange={(e) => updateSetting("plagiocephaly_moderate_max", Number(e.target.value))}
                    disabled={!hasSetting("plagiocephaly_moderate_max")}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Severa:</span>
                <div className="flex items-center space-x-2">
                  <span>Acima de</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getSetting("plagiocephaly_severe_min", 12.0)}
                    onChange={(e) => updateSetting("plagiocephaly_severe_min", Number(e.target.value))}
                    disabled={!hasSetting("plagiocephaly_severe_min")}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Classificação de severidade baseada no Índice de Assimetria Craniana (CVAI)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
