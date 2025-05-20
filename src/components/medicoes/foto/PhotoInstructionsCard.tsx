
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function PhotoInstructionsCard() {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Como tirar uma boa foto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="border rounded-lg overflow-hidden shadow-md">
          <AspectRatio ratio={4/3}>
            <img 
              src="/lovable-uploads/2d224b4c-3e28-41af-9836-25a55082181a.png" 
              alt="Exemplo de foto para medição" 
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
        <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
          <li>Posicione a cabeça do paciente centralizada no quadro</li>
          <li>Certifique-se que o topo da cabeça e as orelhas estão visíveis</li>
          <li>Coloque uma régua ou referência de medida ao lado da cabeça</li>
          <li>Mantenha boa iluminação e fundo sem distrações</li>
          <li>Tire a foto de cima para baixo em um ângulo de 90°</li>
          <li>Use a maior resolução possível da câmera</li>
          <li>Evite sombras fortes que possam obscurecer contornos do crânio</li>
          <li>Utilize um fundo neutro e contrastante para melhor identificação</li>
        </ul>
      </CardContent>
    </Card>
  );
}
