
import React from "react";
import { cn } from "@/lib/utils";

type CaptureProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export default function CaptureProgressBar({ 
  currentStep, 
  totalSteps 
}: CaptureProgressBarProps) {
  return (
    <div className="w-full relative mb-8">
      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-turquesa transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between absolute w-full top-0 transform -translate-y-1/2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={cn(
              "h-5 w-5 rounded-full border-2 transition-colors",
              index <= currentStep 
                ? "bg-turquesa border-turquesa" 
                : "bg-white border-muted-foreground"
            )}
          />
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between text-xs mt-3">
        <div className={cn(
          "text-center transition-colors",
          currentStep >= 0 ? "text-turquesa font-medium" : "text-muted-foreground"
        )}>
          Superior
        </div>
        <div className={cn(
          "text-center transition-colors",
          currentStep >= 1 ? "text-turquesa font-medium" : "text-muted-foreground"
        )}>
          Lateral
        </div>
        <div className={cn(
          "text-center transition-colors",
          currentStep >= 2 ? "text-turquesa font-medium" : "text-muted-foreground"
        )}>
          Frontal
        </div>
        <div className={cn(
          "text-center transition-colors",
          currentStep >= 3 ? "text-turquesa font-medium" : "text-muted-foreground"
        )}>
          Revisão
        </div>
      </div>
    </div>
  );
}
