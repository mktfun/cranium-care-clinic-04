
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MeasurementResults from "./MeasurementResults";
import MeasurementLegend from "./MeasurementLegend";

type MeasurementResultsCardProps = {
  processingImage: boolean;
  measurements: any;
  perimetroError: string | null;
};

export default function MeasurementResultsCard({
  processingImage,
  measurements,
  perimetroError
}: MeasurementResultsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medidas Detectadas</CardTitle>
      </CardHeader>
      <CardContent>
        {processingImage ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-turquesa" />
            <p className="ml-2">Processando medições...</p>
          </div>
        ) : measurements ? (
          <MeasurementResults 
            measurements={measurements} 
            perimetroError={perimetroError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">
              Faça as medições na imagem para ver os resultados aqui.
            </p>
            <MeasurementLegend />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
