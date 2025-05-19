
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MobileReportControls } from "./MobileReportControls";
import { cn } from "@/lib/utils";

interface ChartItem {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface MobileChartNavigatorProps {
  charts: ChartItem[];
  defaultHeight?: number;
  className?: string;
}

export function MobileChartNavigator({
  charts,
  defaultHeight = 300,
  className
}: MobileChartNavigatorProps) {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  const handleNextChart = () => {
    if (currentChartIndex < charts.length - 1) {
      setCurrentChartIndex(currentChartIndex + 1);
    }
  };
  
  const handlePreviousChart = () => {
    if (currentChartIndex > 0) {
      setCurrentChartIndex(currentChartIndex - 1);
    }
  };
  
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
  
  const currentChart = charts[currentChartIndex];
  const scaledHeight = Math.round(defaultHeight * zoomLevel);
  
  if (charts.length === 0) {
    return null;
  }
  
  return (
    <Card className={cn(
      className,
      isFullscreen ? "fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col rounded-none" : ""
    )}>
      <CardHeader className={cn(
        "pb-2",
        isFullscreen ? "flex-shrink-0 pb-1" : ""
      )}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base sm:text-lg">{currentChart.title}</CardTitle>
            <CardDescription className="text-xs mt-1">{currentChart.description}</CardDescription>
          </div>
          <MobileReportControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleFullscreen={handleToggleFullscreen}
            onToggleScrollLock={handleToggleScrollLock}
            isFullscreen={isFullscreen}
            isScrollLocked={isScrollLocked}
            totalCharts={charts.length}
            currentChart={currentChartIndex + 1}
            onNextChart={handleNextChart}
            onPreviousChart={handlePreviousChart}
            className="ml-auto"
          />
        </div>
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
          {currentChart.content}
        </div>
      </CardContent>
    </Card>
  );
}
