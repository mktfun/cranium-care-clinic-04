
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Ruler, User } from "lucide-react";

interface ProntuarioCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  pacienteNome: string;
  onCreateWithMeasurement: () => void;
  onCreateWithWizard: () => void;
}

export function ProntuarioCreationDialog({
  open,
  onOpenChange,
  pacienteNome,
  onCreateWithMeasurement,
  onCreateWithWizard
}: ProntuarioCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-turquesa" />
            Nova Consulta - {pacienteNome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground text-center">
            Como você gostaria de iniciar esta consulta?
          </p>
          
          <div className="grid gap-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={onCreateWithMeasurement}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="h-4 w-4 text-turquesa" />
                  Iniciar com Medição Craniana
                </CardTitle>
                <CardDescription>
                  Começar realizando medições cranianas e depois preencher o prontuário
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={onCreateWithWizard}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-turquesa" />
                  Preencher Prontuário Completo
                </CardTitle>
                <CardDescription>
                  Seguir questionário passo-a-passo para criar prontuário completo
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
