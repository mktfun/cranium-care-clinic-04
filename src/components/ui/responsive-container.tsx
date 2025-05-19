
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-media-query";

interface ResponsiveContainerProps {
  className?: string;
  children: React.ReactNode;
  allowHorizontalScroll?: boolean;
  minWidth?: string;
}

export function ResponsiveContainer({ 
  className, 
  children, 
  allowHorizontalScroll = true,
  minWidth = "500px" 
}: ResponsiveContainerProps) {
  const isSmallScreen = useIsMobileOrTabletPortrait();
  
  return (
    <div 
      className={cn(
        "w-full",
        allowHorizontalScroll ? 
          "overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent" : 
          "overflow-x-hidden",
        className
      )}
    >
      <div style={{ minWidth: allowHorizontalScroll ? minWidth : undefined }}>
        {children}
      </div>
    </div>
  );
}

export function ResponsiveTable({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
      <div className={cn("min-w-[500px]", className)}>
        {children}
      </div>
    </div>
  );
}

export function ResponsiveChart({
  className,
  children,
  height = 350,
  mobileHeight,
}: {
  className?: string;
  children: React.ReactNode;
  height?: number;
  mobileHeight?: number;
}) {
  const isSmallScreen = useIsMobileOrTabletPortrait();
  
  // Use mobile height if provided, otherwise fallback to 70% of standard height
  const actualMobileHeight = mobileHeight || Math.round(height * 0.7);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:block" style={{ height }}>
        {children}
      </div>
      <div className="md:hidden" style={{ height: actualMobileHeight }}>
        {children}
      </div>
    </div>
  );
}
