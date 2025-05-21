
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
  
  // Also add touch event support
  useEffect(() => {
    if (!containerRef.current || !onMovePoint) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (draggingPointIndex !== null && containerRef.current && imageRef.current && e.touches[0]) {
        const rect = imageRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        
        // Keep coordinates within bounds (0-1)
        const boundedX = Math.max(0, Math.min(1, x));
        const boundedY = Math.max(0, Math.min(1, y));
        
        onMovePoint(draggingPointIndex, { x: boundedX, y: boundedY });
        e.preventDefault(); // Prevent scrolling while dragging
      }
    };
    
    const handleTouchEnd = () => {
      setDraggingPointIndex(null);
    };
    
    if (draggingPointIndex !== null) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
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

  // Handle touch start for mobile devices
  const handlePointTouchStart = (index: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMovePoint) {
      setDraggingPointIndex(index);
    }
  };

  // Function to get the correct color class for points and lines
  const getColorClass = (label: string) => {
    if (!label) return 'bg-gray-500';
    if (label.startsWith('comprimento')) return 'bg-red-500';
    if (label.startsWith('largura')) return 'bg-textoEscuro';  
    if (label.startsWith('diagonalD')) return 'bg-green-500';
    if (label.startsWith('diagonalE')) return 'bg-purple-500';
    if (label === 'ap-point') return 'bg-orange-500';
    if (label === 'bp-point') return 'bg-blue-500';
    if (label === 'pd-point') return 'bg-teal-500';
    if (label === 'pe-point') return 'bg-pink-500';
    if (label === 'tragusE-point') return 'bg-amber-500';
    if (label === 'tragusD-point') return 'bg-cyan-500';
    return 'bg-gray-500';
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
          onTouchStart={onMovePoint ? handlePointTouchStart(-2) : undefined}
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
          onTouchStart={onMovePoint ? handlePointTouchStart(-1) : undefined}
        />
      )}
      
      {/* Measurement points */}
      {measurementPoints && measurementPoints.map((point, index) => {
        // Skip rendering if point or point properties are undefined
        if (!point || point.x === undefined || point.y === undefined) return null;
        return (
          <div 
            key={index}
            className={`absolute w-3 h-3 rounded-full z-20 ${point.label ? getColorClass(point.label) : 'bg-gray-500'} 
            ${onMovePoint ? 'cursor-move pointer-events-auto shadow-md hover:shadow-lg' : ''}`}
            style={{ 
              left: `${point.x * 100}%`, 
              top: `${point.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              transition: draggingPointIndex === index ? 'none' : 'all 0.1s ease'
            }}
            onMouseDown={onMovePoint ? handlePointMouseDown(index) : undefined}
            onTouchStart={onMovePoint ? handlePointTouchStart(index) : undefined}
            title={point.label ? point.label.replace('-start', '').replace('-end', '') : ''}
          />
        );
      })}
      
      {/* Measurement lines */}
      {['comprimento', 'largura', 'diagonalD', 'diagonalE'].map(prefix => {
        // Ensure we have valid points before proceeding
        if (!measurementPoints) return null;
        const points = measurementPoints.filter(p => p && p.label && p.label.startsWith(prefix));
        if (points.length !== 2 || !points[0] || !points[1]) return null;
        
        const lineColor = 
          prefix === 'comprimento' ? 'bg-red-500' :
          prefix === 'largura' ? 'bg-textoEscuro' : 
          prefix === 'diagonalD' ? 'bg-green-500' :
          'bg-purple-500';
        
        const p1 = { x: points[0].x, y: points[0].y };
        const p2 = { x: points[1].x, y: points[1].y };
        
        // Calculate the distance and angle
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        // Calculate the distance based on the actual image dimensions
        const distance = Math.sqrt(
          Math.pow(dx * (imageRef.current?.width || 0), 2) + 
          Math.pow(dy * (imageRef.current?.height || 0), 2)
        );
        
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Convert to percentage for CSS
        const widthPercent = (distance / (imageRef.current?.width || 1)) * 100;
        
        return (
          <div 
            key={prefix}
            className={`absolute h-0.5 z-5 ${lineColor}`}
            style={{ 
              left: `${p1.x * 100}%`, 
              top: `${p1.y * 100}%`,
              width: `${widthPercent}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0'
            }}
          />
        );
      })}
      
      {/* Additional measurement visualizations for other points */}
      {/* For AP-BP line */}
      {(() => {
        if (!measurementPoints) return null;
        const apPoint = measurementPoints.find(p => p && p.label === 'ap-point');
        const bpPoint = measurementPoints.find(p => p && p.label === 'bp-point');
        
        if (apPoint && bpPoint) {
          const dx = bpPoint.x - apPoint.x;
          const dy = bpPoint.y - apPoint.y;
          const distance = Math.sqrt(
            Math.pow(dx * (imageRef.current?.width || 0), 2) + 
            Math.pow(dy * (imageRef.current?.height || 0), 2)
          );
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const widthPercent = (distance / (imageRef.current?.width || 1)) * 100;
          
          return (
            <div 
              className="absolute h-0.5 z-5 bg-blue-600"
              style={{ 
                left: `${apPoint.x * 100}%`, 
                top: `${apPoint.y * 100}%`,
                width: `${widthPercent}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 0'
              }}
            />
          );
        }
        return null;
      })()}
      
      {/* For PD-PE line */}
      {(() => {
        if (!measurementPoints) return null;
        const pdPoint = measurementPoints.find(p => p && p.label === 'pd-point');
        const pePoint = measurementPoints.find(p => p && p.label === 'pe-point');
        
        if (pdPoint && pePoint) {
          const dx = pePoint.x - pdPoint.x;
          const dy = pePoint.y - pdPoint.y;
          const distance = Math.sqrt(
            Math.pow(dx * (imageRef.current?.width || 0), 2) + 
            Math.pow(dy * (imageRef.current?.height || 0), 2)
          );
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const widthPercent = (distance / (imageRef.current?.width || 1)) * 100;
          
          return (
            <div 
              className="absolute h-0.5 z-5 bg-teal-500"
              style={{ 
                left: `${pdPoint.x * 100}%`, 
                top: `${pdPoint.y * 100}%`,
                width: `${widthPercent}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 0'
              }}
            />
          );
        }
        return null;
      })()}
      
      {/* For tragusE-tragusD line */}
      {(() => {
        if (!measurementPoints) return null;
        const tragusEPoint = measurementPoints.find(p => p && p.label === 'tragusE-point');
        const tragusDPoint = measurementPoints.find(p => p && p.label === 'tragusD-point');
        
        if (tragusEPoint && tragusDPoint) {
          const dx = tragusDPoint.x - tragusEPoint.x;
          const dy = tragusDPoint.y - tragusEPoint.y;
          const distance = Math.sqrt(
            Math.pow(dx * (imageRef.current?.width || 0), 2) + 
            Math.pow(dy * (imageRef.current?.height || 0), 2)
          );
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const widthPercent = (distance / (imageRef.current?.width || 1)) * 100;
          
          return (
            <div 
              className="absolute h-0.5 z-5 bg-amber-500"
              style={{ 
                left: `${tragusEPoint.x * 100}%`, 
                top: `${tragusEPoint.y * 100}%`,
                width: `${widthPercent}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 0'
              }}
            />
          );
        }
        return null;
      })()}
    </div>
  );
}
