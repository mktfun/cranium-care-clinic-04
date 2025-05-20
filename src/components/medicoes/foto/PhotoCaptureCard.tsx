
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PhotoCaptureCardProps = {
  handleUploadFoto: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCapturarFoto: () => void;
  uploading: boolean;
  processingImage: boolean;
};

export default function PhotoCaptureCard({
  handleUploadFoto,
  handleCapturarFoto,
  uploading,
  processingImage
}: PhotoCaptureCardProps) {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Captura de Imagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30">
          <Camera className="h-16 w-16 text-primary mb-4" />
          <p className="text-xl font-medium mb-2">Capture ou faça upload de uma foto</p>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Posicione a cabeça do paciente centralizada na foto com uma 
            referência de medida visível para melhor precisão
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
              onClick={handleCapturarFoto}
              variant="default"
              disabled={uploading || processingImage}
              className="shadow-md transition-all hover:shadow-lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capturar Foto
            </Button>
            
            <div className="relative">
              <Button 
                variant="outline"
                disabled={uploading || processingImage}
                className="relative shadow-sm hover:shadow-md transition-all"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Fazer Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFoto}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || processingImage}
                />
              </Button>
            </div>
          </div>
          
          {(uploading || processingImage) && (
            <div className="mt-6 flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
              <p className="text-muted-foreground">{uploading ? "Enviando imagem..." : "Processando imagem..."}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
