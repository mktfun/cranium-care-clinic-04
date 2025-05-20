
import React from "react";

type MeasurementPoint = {
  x: number;
  y: number;
  label: string;
};

type MeasurementOverlayProps = {
  uploadedImage: string | null;
  imageRef: React.RefObject<HTMLImageElement>;
  calibrationStart: {x: number, y: number} | null;
  calibrationEnd: {x: number, y: number} | null;
  measurementPoints: MeasurementPoint[];
};

export default function MeasurementOverlay({
  uploadedImage,
  imageRef,
  calibrationStart,
  calibrationEnd,
  measurementPoints
}: MeasurementOverlayProps) {
  if (!uploadedImage || !imageRef.current) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Calibration line */}
      {calibrationStart && (
        <div 
          className="absolute w-2 h-2 bg-yellow-500 rounded-full z-10" 
          style={{ 
            left: `${calibrationStart.x * 100}%`, 
            top: `${calibrationStart.y * 100}%` 
          }}
        />
      )}
      
      {calibrationStart && calibrationEnd && (
        <div 
          className="absolute bg-yellow-500 h-0.5 z-10"
          style={{ 
            left: `${calibrationStart.x * 100}%`, 
            top: `${calibrationStart.y * 100}%`,
            width: `${Math.sqrt(
              Math.pow((calibrationEnd.x - calibrationStart.x) * 100, 2) + 
              Math.pow((calibrationEnd.y - calibrationStart.y) * 100, 2)
            )}%`,
            transform: `rotate(${Math.atan2(
              (calibrationEnd.y - calibrationStart.y),
              (calibrationEnd.x - calibrationStart.x)
            ) * (180 / Math.PI)}deg)`,
            transformOrigin: 'left center'
          }}
        />
      )}
      
      {calibrationEnd && (
        <div 
          className="absolute w-2 h-2 bg-yellow-500 rounded-full z-10" 
          style={{ 
            left: `${calibrationEnd.x * 100}%`, 
            top: `${calibrationEnd.y * 100}%` 
          }}
        />
      )}
      
      {/* Measurement points */}
      {measurementPoints.map((point, index) => (
        <div 
          key={index}
          className={`absolute w-3 h-3 rounded-full z-10 ${
            point.label.startsWith('comprimento') ? 'bg-red-500' :
            point.label.startsWith('largura') ? 'bg-textoEscuro' :  // Mudado de bg-blue-500 para bg-textoEscuro
            point.label.startsWith('diagonalD') ? 'bg-green-500' :
            'bg-purple-500'
          }`}
          style={{ 
            left: `${point.x * 100}%`, 
            top: `${point.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      
      {/* Measurement lines */}
      {['comprimento', 'largura', 'diagonalD', 'diagonalE'].map(prefix => {
        const points = measurementPoints.filter(p => p.label.startsWith(prefix));
        if (points.length !== 2) return null;
        
        const lineColor = 
          prefix === 'comprimento' ? 'bg-red-500' :
          prefix === 'largura' ? 'bg-textoEscuro' :  // Mudado de bg-blue-500 para bg-textoEscuro
          prefix === 'diagonalD' ? 'bg-green-500' :
          'bg-purple-500';
        
        return (
          <div 
            key={prefix}
            className={`absolute h-0.5 z-5 ${lineColor}`}
            style={{ 
              left: `${points[0].x * 100}%`, 
              top: `${points[0].y * 100}%`,
              width: `${Math.sqrt(
                Math.pow((points[1].x - points[0].x) * 100, 2) + 
                Math.pow((points[1].y - points[0].y) * 100, 2)
              )}%`,
              transform: `rotate(${Math.atan2(
                (points[1].y - points[0].y),
                (points[1].x - points[0].x)
              ) * (180 / Math.PI)}deg)`,
              transformOrigin: 'left center'
            }}
          />
        );
      })}
    </div>
  );
}
