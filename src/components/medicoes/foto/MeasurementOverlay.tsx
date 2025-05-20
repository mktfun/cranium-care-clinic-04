import React, { useRef, useEffect } from "react";

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
  onMovePoint?: (index: number, newPos: {x: number, y: number}) => void;
};

export default function MeasurementOverlay({
  uploadedImage,
  imageRef,
  calibrationStart,
  calibrationEnd,
  measurementPoints,
  onMovePoint
}: MeasurementOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track which point is being dragged
  const [draggingPointIndex, setDraggingPointIndex] = React.useState<number | null>(null);
  
  // Setup drag event handlers
  useEffect(() => {
    if (!containerRef.current || !onMovePoint) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingPointIndex !== null && containerRef.current && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Keep coordinates within bounds (0-1)
        const boundedX = Math.max(0, Math.min(1, x));
        const boundedY = Math.max(0, Math.min(1, y));
        
        onMovePoint(draggingPointIndex, { x: boundedX, y: boundedY });
      }
    };
    
    const handleMouseUp = () => {
      setDraggingPointIndex(null);
    };
    
    if (draggingPointIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPointIndex, onMovePoint, imageRef]);
  
  if (!uploadedImage || !imageRef.current) return null;

  const handlePointMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMovePoint) {
      setDraggingPointIndex(index);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Calibration line */}
      {calibrationStart && (
        <div 
          className={`absolute w-3 h-3 bg-yellow-500 rounded-full z-20 ${onMovePoint ? 'cursor-move pointer-events-auto' : ''}`}
          style={{ 
            left: `${calibrationStart.x * 100}%`, 
            top: `${calibrationStart.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={onMovePoint ? handlePointMouseDown(-2) : undefined}
        />
      )}
      
      {calibrationStart && calibrationEnd && (
        <div 
          className="absolute bg-yellow-500 h-0.5 z-10"
          style={{ 
            left: `${calibrationStart.x * 100}%`, 
            top: `${calibrationStart.y * 100}%`,
            width: `${Math.sqrt(
              Math.pow((calibrationEnd.x - calibrationStart.x) * imageRef.current.width, 2) + 
              Math.pow((calibrationEnd.y - calibrationStart.y) * imageRef.current.height, 2)
            ) / imageRef.current.width * 100}%`,
            transform: `rotate(${Math.atan2(
              (calibrationEnd.y - calibrationStart.y),
              (calibrationEnd.x - calibrationStart.x)
            ) * (180 / Math.PI)}deg)`,
            transformOrigin: '0 0'
          }}
        />
      )}
      
      {calibrationEnd && (
        <div 
          className={`absolute w-3 h-3 bg-yellow-500 rounded-full z-20 ${onMovePoint ? 'cursor-move pointer-events-auto' : ''}`}
          style={{ 
            left: `${calibrationEnd.x * 100}%`, 
            top: `${calibrationEnd.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={onMovePoint ? handlePointMouseDown(-1) : undefined}
        />
      )}
      
      {/* Measurement points */}
      {measurementPoints.map((point, index) => (
        <div 
          key={index}
          className={`absolute w-3 h-3 rounded-full z-20 ${
            point.label.startsWith('comprimento') ? 'bg-red-500' :
            point.label.startsWith('largura') ? 'bg-textoEscuro' :  
            point.label.startsWith('diagonalD') ? 'bg-green-500' :
            point.label.startsWith('diagonalE') ? 'bg-purple-500' :
            point.label === 'ap-point' ? 'bg-orange-500' :
            point.label === 'bp-point' ? 'bg-blue-500' :
            point.label === 'pd-point' ? 'bg-teal-500' :
            point.label === 'pe-point' ? 'bg-pink-500' :
            point.label === 'tragusE-point' ? 'bg-amber-500' :
            point.label === 'tragusD-point' ? 'bg-cyan-500' :
            'bg-gray-500'
          } ${onMovePoint ? 'cursor-move pointer-events-auto' : ''}`}
          style={{ 
            left: `${point.x * 100}%`, 
            top: `${point.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={onMovePoint ? handlePointMouseDown(index) : undefined}
        />
      ))}
      
      {/* Measurement lines */}
      {['comprimento', 'largura', 'diagonalD', 'diagonalE'].map(prefix => {
        const points = measurementPoints.filter(p => p.label.startsWith(prefix));
        if (points.length !== 2) return null;
        
        const lineColor = 
          prefix === 'comprimento' ? 'bg-red-500' :
          prefix === 'largura' ? 'bg-textoEscuro' : 
          prefix === 'diagonalD' ? 'bg-green-500' :
          'bg-purple-500';
        
        const p1 = { x: points[0].x, y: points[0].y };
        const p2 = { x: points[1].x, y: points[1].y };
        
        // Calculate the distance between points in pixels
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(
          Math.pow(dx * imageRef.current.width, 2) + 
          Math.pow(dy * imageRef.current.height, 2)
        ) / imageRef.current.width * 100;
        
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return (
          <div 
            key={prefix}
            className={`absolute h-0.5 z-5 ${lineColor}`}
            style={{ 
              left: `${p1.x * 100}%`, 
              top: `${p1.y * 100}%`,
              width: `${distance}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0'
            }}
          />
        );
      })}
    </div>
  );
}
