
import { Separator } from "@/components/ui/separator";

export default function MeasurementLegend() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Guia de Medições:</h4>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Comprimento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-textoEscuro"></div>
          <span>Largura</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Diagonal D</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Diagonal E</span>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="text-xs">
        <p>O processo de medição deve seguir estas etapas:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-1">
          <li>Calibrar a imagem com um objeto de tamanho conhecido</li>
          <li>Marcar os pontos para comprimento, largura e diagonais</li>
          <li>Adicionar medidas adicionais (AP, BP, etc.) se necessário</li>
          <li>Calcular as medidas finais</li>
        </ol>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p className="italic">Posicione uma régua ou cartão padrão ao lado da cabeça para maior precisão na calibração.</p>
      </div>
    </div>
  );
}
