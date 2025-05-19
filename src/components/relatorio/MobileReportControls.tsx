
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Minimize, LockIcon, UnlockIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileReportControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onToggleScrollLock: () => void;
  isFullscreen: boolean;
  isScrollLocked: boolean;
  totalCharts?: number;
  currentChart?: number;
  onNextChart?: () => void;
  onPreviousChart?: () => void;
  className?: string;
}

export function MobileReportControls({
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleScrollLock,
  isFullscreen,
  isScrollLocked,
  totalCharts,
  currentChart,
  onNextChart,
  onPreviousChart,
  className
}: MobileReportControlsProps) {
  return (
    <div className={cn("flex items-center justify-between bg-muted/20 rounded-md p-1", className)}>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7" 
          onClick={onZoomOut}
          title="Diminuir zoom"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7" 
          onClick={onZoomIn}
          title="Aumentar zoom"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7" 
          onClick={onToggleScrollLock}
          title={isScrollLocked ? "Desbloquear rolagem" : "Bloquear rolagem"}
        >
          {isScrollLocked ? (
            <LockIcon className="h-3.5 w-3.5" />
          ) : (
            <UnlockIcon className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      
      {totalCharts && currentChart && onPreviousChart && onNextChart && (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onPreviousChart}
            disabled={currentChart <= 1}
            title="Gráfico anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {currentChart}/{totalCharts}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNextChart}
            disabled={currentChart >= totalCharts}
            title="Próximo gráfico"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      >
        {isFullscreen ? (
          <Minimize className="h-3.5 w-3.5" />
        ) : (
          <Maximize className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
