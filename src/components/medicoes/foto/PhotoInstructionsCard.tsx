
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PhotoInstructionsCard() {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Instruções para Fotografia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div>
          <h3 className="font-semibold mb-2">Para uma medição mais precisa:</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Posicione a cabeça do paciente centralizada na foto</li>
            <li>Inclua uma <span className="font-medium">régua ou objeto de referência</span> próximo à cabeça, no mesmo plano</li>
            <li>Garanta boa iluminação, sem sombras sobre a cabeça</li>
            <li>Tirar a foto em uma vista superior (de cima para baixo)</li>
            <li>Mantenha a câmera paralela à superfície</li>
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-semibold mb-2">Posição correta:</h3>
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="aspect-square bg-green-100 rounded flex items-center justify-center mb-2">
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <p>Cabeça centralizada com régua visível</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="aspect-square bg-red-100 rounded flex items-center justify-center mb-2">
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                  ✗
                </div>
              </div>
              <p>Cabeça cortada ou sem referência de medida</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="text-xs text-muted-foreground">
          <p>O sistema irá detectar automaticamente os pontos de medição, mas você poderá ajustá-los manualmente se necessário.</p>
          <p className="mt-1"><strong>Nota:</strong> As fotos são processadas localmente e não são enviadas para nenhum servidor externo.</p>
        </div>
      </CardContent>
    </Card>
  );
}
