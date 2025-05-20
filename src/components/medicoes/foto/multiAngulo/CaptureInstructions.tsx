
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CaptureStep } from "@/pages/MultiAngleCapturaPage";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type CaptureInstructionsProps = {
  currentStep: CaptureStep;
  previousPhoto: string | null;
};

export default function CaptureInstructions({
  currentStep,
  previousPhoto
}: CaptureInstructionsProps) {
  const renderStepInstructions = () => {
    switch (currentStep) {
      case "superior":
        return (
          <>
            <div className="border rounded-lg overflow-hidden shadow-md mb-4">
              <AspectRatio ratio={4/3}>
                <div className="flex items-center justify-center h-full bg-muted">
                  {/* This should be a proper silhouette/diagram in production */}
                  <div className="w-1/2 h-1/2 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Vista superior</span>
                  </div>
                </div>
              </AspectRatio>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Posicione a câmera diretamente acima da cabeça</li>
              <li>Mantenha uma distância de aproximadamente 30cm</li>
              <li>Certifique-se que toda a cabeça está visível</li>
              <li>Inclua o objeto de referência ao lado da cabeça</li>
              <li>Certifique-se que o ambiente está bem iluminado</li>
              <li>Evite sombras no crânio</li>
            </ul>
          </>
        );
        
      case "lateral":
        return (
          <>
            <div className="border rounded-lg overflow-hidden shadow-md mb-4 relative">
              <AspectRatio ratio={4/3}>
                <div className="flex items-center justify-center h-full bg-muted">
                  {/* Show previous photo as overlay if available */}
                  {previousPhoto && (
                    <div className="absolute inset-0 opacity-30">
                      <img 
                        src={previousPhoto} 
                        alt="Foto anterior" 
                        className="w-full h-full object-cover opacity-30"
                      />
                    </div>
                  )}
                  
                  {/* Silhouette overlay */}
                  <div className="z-10 h-1/2 w-1/4 bg-primary/20 rounded-l-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Perfil</span>
                  </div>
                </div>
              </AspectRatio>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Posicione a câmera na lateral da cabeça</li>
              <li>Mantenha a mesma distância da foto anterior</li>
              <li>Alinhe com a orelha e perfil visíveis</li>
              <li>Inclua o objeto de referência na mesma posição</li>
              <li>Mantenha a cabeça em posição neutra (olhar para frente)</li>
              <li>Evite rotação ou inclinação</li>
            </ul>
          </>
        );
        
      case "frontal":
        return (
          <>
            <div className="border rounded-lg overflow-hidden shadow-md mb-4 relative">
              <AspectRatio ratio={4/3}>
                <div className="flex items-center justify-center h-full bg-muted">
                  {/* Show previous photo as overlay if available */}
                  {previousPhoto && (
                    <div className="absolute inset-0 opacity-30">
                      <img 
                        src={previousPhoto} 
                        alt="Foto anterior" 
                        className="w-full h-full object-cover opacity-30"
                      />
                    </div>
                  )}
                  
                  {/* Silhouette overlay */}
                  <div className="z-10 h-1/2 w-1/3 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Frontal</span>
                  </div>
                </div>
              </AspectRatio>
            </div>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Posicione a câmera na frente da face</li>
              <li>Mantenha a mesma distância das fotos anteriores</li>
              <li>Certifique-se que o rosto está centralizado</li>
              <li>Inclua o objeto de referência na mesma posição</li>
              <li>Certifique-se que ambas as orelhas estão visíveis</li>
              <li>Mantenha a cabeça em posição neutra (olhar para frente)</li>
            </ul>
          </>
        );
        
      default:
        return <p>Selecione um ângulo para ver as instruções.</p>;
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Instruções para captura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {renderStepInstructions()}
      </CardContent>
    </Card>
  );
}
