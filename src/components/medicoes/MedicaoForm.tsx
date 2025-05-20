
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";

type MedicaoFormProps = {
  comprimento: string;
  setComprimento: (value: string) => void;
  largura: string;
  setLargura: (value: string) => void;
  diagonalD: string;
  setDiagonalD: (value: string) => void;
  diagonalE: string;
  setDiagonalE: (value: string) => void;
  perimetroCefalico: string;
  setPerimetroCefalico: (value: string) => void;
  observacoes: string;
  setObservacoes: (value: string) => void;
  indiceCraniano: number | null;
  diferencaDiagonais: number | null;
  cvai: number | null;
  perimetroError: string | null;
  paciente: any;
  onSubmit: (e: React.FormEvent) => void;
};

export default function MedicaoForm({
  comprimento,
  setComprimento,
  largura,
  setLargura,
  diagonalD,
  setDiagonalD,
  diagonalE,
  setDiagonalE,
  perimetroCefalico,
  setPerimetroCefalico,
  observacoes,
  setObservacoes,
  indiceCraniano,
  diferencaDiagonais,
  cvai,
  perimetroError,
  paciente,
  onSubmit
}: MedicaoFormProps) {
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inserir Medidas Manuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comprimento">Comprimento (mm)</Label>
              <Input
                id="comprimento"
                type="number"
                required
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="largura">Largura (mm)</Label>
              <Input
                id="largura"
                type="number"
                required
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagonalD">Diagonal D (mm)</Label>
              <Input
                id="diagonalD"
                type="number"
                required
                value={diagonalD}
                onChange={(e) => setDiagonalD(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagonalE">Diagonal E (mm)</Label>
              <Input
                id="diagonalE"
                type="number"
                required
                value={diagonalE}
                onChange={(e) => setDiagonalE(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="perimetroCefalico">Perímetro Cefálico (mm)</Label>
            <Input
              id="perimetroCefalico"
              type="number"
              required
              value={perimetroCefalico}
              onChange={(e) => setPerimetroCefalico(e.target.value)}
              className={perimetroError ? "border-red-500" : ""}
            />
            {perimetroError && (
              <p className="text-sm text-red-500">{perimetroError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre a medição..."
            />
          </div>
          
          {/* Cálculos derivados */}
          {indiceCraniano !== null && cvai !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Valores Calculados:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Índice Craniano</p>
                  <p className="font-bold">{indiceCraniano.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CVAI</p>
                  <p className="font-bold">{cvai.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                  <p className="font-bold">{diferencaDiagonais?.toFixed(1)} mm</p>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-turquesa hover:bg-turquesa/90"
            disabled={!!perimetroError}
          >
            <Check className="h-4 w-4 mr-2" />
            Salvar e Gerar Relatório
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
