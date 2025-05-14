
import React from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SeverityLevel } from "@/lib/cranial-utils";
import { cn } from "@/lib/utils";

interface MeasurementResultsProps {
  indiceCraniano: number | null;
  diferencaDiagonais: number | null;
  cvai: number | null;
  getSeverityLevel: () => SeverityLevel;
}

const MeasurementResults: React.FC<MeasurementResultsProps> = ({
  indiceCraniano,
  diferencaDiagonais,
  cvai,
  getSeverityLevel
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>Índice Craniano</Label>
        <div className="font-bold">{indiceCraniano !== null ? indiceCraniano.toFixed(2) : 'N/A'}</div>
      </div>
      <div>
        <Label>Diferença Diagonais</Label>
        <div className="font-bold">{diferencaDiagonais !== null ? diferencaDiagonais.toFixed(2) : 'N/A'}</div>
      </div>
      <div>
        <Label>CVAI</Label>
        <div className="font-bold">
          {cvai !== null ? (
            <>
              {cvai.toFixed(2)}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  cvai <= 2.5 && "bg-green-500 text-white",
                  cvai > 2.5 && cvai <= 5 && "bg-yellow-500 text-black",
                  cvai > 5 && cvai <= 7.5 && "bg-orange-500 text-black",
                  cvai > 7.5 && "bg-red-500 text-white"
                )}
              >
                {getSeverityLevel()}
              </Badge>
            </>
          ) : (
            'N/A'
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementResults;
