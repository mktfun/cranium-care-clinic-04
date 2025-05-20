
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PhotoPreviewProps = {
  photoUrl: string | null;
  pacienteId: string;
};

export default function PhotoPreview({ photoUrl, pacienteId }: PhotoPreviewProps) {
  const navigate = useNavigate();

  const handleNavigateToPhotoCapture = () => {
    console.log("Navigating to photo capture page");
    navigate(`/pacientes/${pacienteId}/medicao-por-foto`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {photoUrl ? (
          <div className="border rounded-lg overflow-hidden">
            <AspectRatio ratio={4/3}>
              <img 
                src={photoUrl} 
                alt="Foto processada do paciente" 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="border rounded-lg p-12 flex items-center justify-center">
            <p className="text-muted-foreground">Foto não disponível</p>
          </div>
        )}
        
        <Button 
          onClick={handleNavigateToPhotoCapture}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para captura de foto
        </Button>
      </CardContent>
    </Card>
  );
}
