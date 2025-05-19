
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MobileReportControls } from "./MobileReportControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveReportChartProps {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultHeight?: number;
  mobileHeight?: number;
  className?: string;
}

export function ResponsiveReportChart({
  title,
  description,
  children,
  defaultHeight = 350,
  mobileHeight,
  className
}: ResponsiveReportChartProps) {
  const isMobile = useIsMobile();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  // Calculate effective height based on device and zoom
  const effectiveMobileHeight = mobileHeight || Math.round(defaultHeight * 0.7);
  const baseHeight = isMobile ? effectiveMobileHeight : defaultHeight;
  const scaledHeight = Math.round(baseHeight * zoomLevel);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.0));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };
  
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // If entering fullscreen, set zoom to fit the chart better
      setZoomLevel(1.2);
    } else {
      // If exiting fullscreen, reset zoom
      setZoomLevel(1);
    }
  };
  
  const handleToggleScrollLock = () => {
    setIsScrollLocked(!isScrollLocked);
  };
  
  return (
    <Card className={cn(
      className, 
      isFullscreen ? "fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col rounded-none" : ""
    )}>
      <CardHeader className={cn(
        "print:pb-2", 
        isFullscreen ? "flex-shrink-0 pb-1" : ""
      )}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="print:text-lg">{title}</CardTitle>
            {!isFullscreen && !isMobile && (
              <CardDescription className="print:text-xs">{description}</CardDescription>
            )}
          </div>
          {isMobile && (
            <MobileReportControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onToggleFullscreen={handleToggleFullscreen}
              onToggleScrollLock={handleToggleScrollLock}
              isFullscreen={isFullscreen}
              isScrollLocked={isScrollLocked}
              className="ml-auto"
            />
          )}
        </div>
        {isMobile && !isFullscreen && (
          <CardDescription className="text-xs mt-1 print:text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn(
        "p-0 overflow-hidden", 
        isFullscreen ? "flex-grow flex items-center justify-center" : "",
        isScrollLocked ? "overflow-hidden" : "overflow-x-auto scrollbar-thin"
      )}>
        <div 
          className={cn(
            "min-w-full",
            isScrollLocked ? "overflow-hidden touch-none" : "touch-auto"
          )} 
          style={{ height: scaledHeight }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
