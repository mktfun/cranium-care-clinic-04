
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileReportControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}

export function MobileReportControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  isFullscreen
}: MobileReportControlsProps) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 my-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg",
      isFullscreen ? "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 shadow-md" : ""
    )}>
      <Button variant="outline" size="icon" onClick={onZoomOut} className="h-9 w-9">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onZoomIn} className="h-9 w-9">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onReset} className="h-9 w-9">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onFullscreen} className="h-9 w-9">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );
}
