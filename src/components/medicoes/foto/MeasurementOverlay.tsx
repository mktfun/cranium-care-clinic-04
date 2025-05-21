
import React, { useState, useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  label: string;
};

type MeasurementOverlayProps = {
  uploadedImage: string | null;
  imageRef: React.RefObject<HTMLImageElement>;
  calibrationStart: { x: number; y: number } | null;
  calibrationEnd: { x: number; y: number } | null;
  measurementPoints: Point[];
  onMovePoint?: (index: number, newPos: { x: number, y: number }) => void;
};

const MeasurementOverlay: React.FC<MeasurementOverlayProps> = ({
  uploadedImage,
  imageRef,
  calibrationStart,
  calibrationEnd,
  measurementPoints,
  onMovePoint
}) => {
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const moveHandler = useRef<((e: MouseEvent | TouchEvent) => void) | null>(null);
  const endHandler = useRef<((e: MouseEvent | TouchEvent) => void) | null>(null);
  
  // Setup and cleanup event listeners for dragging
  useEffect(() => {
    // Only setup if we have an onMovePoint function
    if (!onMovePoint) return;
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (draggingPointIndex === null || !imageRef.current || !overlayRef.current) return;
      
      // Get the position based on whether it's a mouse or touch event
      let clientX, clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      // Get the bounds of the image
      const rect = imageRef.current.getBoundingClientRect();
      
      // Calculate new position, constrained to the image bounds
      let newX = (clientX - rect.left) / rect.width;
      let newY = (clientY - rect.top) / rect.height;
      
      // Constrain to image bounds
      newX = Math.max(0, Math.min(1, newX));
      newY = Math.max(0, Math.min(1, newY));
      
      // Update the point through the callback
      if (draggingPointIndex === -2) {
        // Calibration start point
        onMovePoint(-2, { x: newX, y: newY });
      } else if (draggingPointIndex === -1) {
        // Calibration end point
        onMovePoint(-1, { x: newX, y: newY });
      } else if (draggingPointIndex >= 0) {
        // Measurement point
        onMovePoint(draggingPointIndex, { x: newX, y: newY });
      }
    };
    
    const handleMoveEnd = () => {
      setDraggingPointIndex(null);
    };
    
    // Store these handlers for cleanup
    moveHandler.current = handleMove;
    endHandler.current = handleMoveEnd;
    
    // Add event listeners
    if (draggingPointIndex !== null) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMoveEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleMoveEnd);
    }
    
    // Cleanup
    return () => {
      if (moveHandler.current) {
        document.removeEventListener('mousemove', moveHandler.current);
        document.removeEventListener('touchmove', moveHandler.current);
      }
      if (endHandler.current) {
        document.removeEventListener('mouseup', endHandler.current);
        document.removeEventListener('touchend', endHandler.current);
      }
    };
  }, [draggingPointIndex, imageRef, onMovePoint]);

  // Handlers for mouse/touch events on points
  const handlePointMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingPointIndex(index);
  };
  
  const handlePointTouchStart = (index: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    setDraggingPointIndex(index);
  };

  // Function to get the correct color class for points and lines
  const getColorClass = (label: string) => {
    if (!label) return 'bg-gray-500';
    if (label.startsWith('comprimento')) return 'bg-red-500';
    if (label.startsWith('largura')) return 'bg-textoEscuro';  
    if (label.startsWith('diagonalD')) return 'bg-green-500';
    if (label.startsWith('diagonalE')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  // Don't render if no image
  if (!uploadedImage) return null;

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: '100%',
        height: '100%'
      }}
    >
      {/* Calibration line */}
      {calibrationStart && calibrationEnd && (
        <>
          <div 
            className="absolute w-2 h-2 rounded-full z-20 bg-yellow-500"
            style={{ 
              left: `${calibrationStart.x * 100}%`, 
              top: `${calibrationStart.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={onMovePoint ? handlePointMouseDown(-2) : undefined}
            onTouchStart={onMovePoint ? handlePointTouchStart(-2) : undefined}
          />
          <div 
            className="absolute w-2 h-2 rounded-full z-20 bg-yellow-500"
            style={{ 
              left: `${calibrationEnd.x * 100}%`, 
              top: `${calibrationEnd.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={onMovePoint ? handlePointMouseDown(-1) : undefined}
            onTouchStart={onMovePoint ? handlePointTouchStart(-1) : undefined}
          />
          <div 
            className="absolute bg-yellow-500 z-10"
            style={{
              left: `${calibrationStart.x * 100}%`,
              top: `${calibrationStart.y * 100}%`,
              width: `${Math.sqrt(
                Math.pow((calibrationEnd.x - calibrationStart.x) * 100, 2) +
                Math.pow((calibrationEnd.y - calibrationStart.y) * 100, 2)
              )}%`,
              height: '2px',
              transformOrigin: 'left center',
              transform: `rotate(${Math.atan2(
                (calibrationEnd.y - calibrationStart.y),
                (calibrationEnd.x - calibrationStart.x)
              )}rad)`,
            }}
          />
        </>
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
          prefix === 'diagonalE' ? 'bg-purple-500' :
          'bg-gray-500';
        
        // Calculate line position and rotation
        const startX = points[0].x * 100;
        const startY = points[0].y * 100;
        const endX = points[1].x * 100;
        const endY = points[1].y * 100;
        
        // Calculate the distance and angle for the line
        const distance = Math.sqrt(
          Math.pow(endX - startX, 2) +
          Math.pow(endY - startY, 2)
        );
        
        const angle = Math.atan2(
          endY - startY,
          endX - startX
        );
        
        return (
          <div 
            key={prefix}
            className={`absolute z-10 ${lineColor}`}
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              width: `${distance}%`,
              height: '2px',
              transformOrigin: 'left center',
              transform: `rotate(${angle}rad)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default MeasurementOverlay;
