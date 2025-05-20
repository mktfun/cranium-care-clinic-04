
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Camera, AlertTriangle, Check } from "lucide-react";

type PhotoReviewCardProps = {
  capturedPhotos: {
    superior: string | null;
    lateral: string | null;
    frontal: string | null;
  };
  onRetakePhoto: (viewType: "superior" | "lateral" | "frontal") => void;
  calibrationObject: {
    type: "ruler" | "coin" | "custom";
    size: number;
    position: { x: number; y: number } | null;
  };
};

export default function PhotoReviewCard({
  capturedPhotos,
  onRetakePhoto,
  calibrationObject
}: PhotoReviewCardProps) {
  const hasAllPhotos = capturedPhotos.superior && capturedPhotos.lateral && capturedPhotos.frontal;
  
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Revisão das Fotos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Superior View */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Vista Superior</h4>
            <div className="border rounded-lg overflow-hidden shadow-md">
              <AspectRatio ratio={4/3}>
                {capturedPhotos.superior ? (
                  <img 
                    src={capturedPhotos.superior} 
                    alt="Vista superior" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onRetakePhoto("superior")}
            >
              {capturedPhotos.superior ? "Refazer" : "Capturar"}
            </Button>
          </div>
          
          {/* Lateral View */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Vista Lateral</h4>
            <div className="border rounded-lg overflow-hidden shadow-md">
              <AspectRatio ratio={4/3}>
                {capturedPhotos.lateral ? (
                  <img 
                    src={capturedPhotos.lateral} 
                    alt="Vista lateral" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onRetakePhoto("lateral")}
            >
              {capturedPhotos.lateral ? "Refazer" : "Capturar"}
            </Button>
          </div>
          
          {/* Frontal View */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Vista Frontal</h4>
            <div className="border rounded-lg overflow-hidden shadow-md">
              <AspectRatio ratio={4/3}>
                {capturedPhotos.frontal ? (
                  <img 
                    src={capturedPhotos.frontal} 
                    alt="Vista frontal" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onRetakePhoto("frontal")}
            >
              {capturedPhotos.frontal ? "Refazer" : "Capturar"}
            </Button>
          </div>
        </div>
        
        {/* Calibration Information */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Informações de Calibração</h4>
          <p className="text-sm text-muted-foreground">
            Objeto de referência: {calibrationObject.type === "ruler" ? "Régua" : 
                                 calibrationObject.type === "coin" ? "Moeda" : "Personalizado"}
          </p>
          <p className="text-sm text-muted-foreground">
            Tamanho: {calibrationObject.size} mm
          </p>
        </div>
        
        {/* Quality Check */}
        <div className={`p-4 rounded-lg ${hasAllPhotos ? "bg-green-50" : "bg-amber-50"}`}>
          {hasAllPhotos ? (
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-1">Todas as fotos capturadas</h4>
                <p className="text-xs text-green-600">
                  Verifique se todas as fotos estão nítidas, bem iluminadas e se o objeto de referência está visível.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-700 mb-1">Algumas fotos não foram capturadas</h4>
                <p className="text-xs text-amber-600">
                  Recomendamos capturar todas as vistas para uma análise mais precisa. Você ainda pode prosseguir com as fotos atuais.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
