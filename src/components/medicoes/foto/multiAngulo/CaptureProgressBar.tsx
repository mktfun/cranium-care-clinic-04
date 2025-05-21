
import React from "react";
import { cn } from "@/lib/utils";

type CaptureProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];  // Optional custom step labels
};

export default function CaptureProgressBar({ 
  currentStep, 
  totalSteps,
  labels = ["Superior", "Lateral", "Frontal", "Revisão"]  // Default labels
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
        {labels.map((label, index) => (
          <div 
            key={index}
            className={cn(
              "text-center transition-colors",
              currentStep >= index ? "text-turquesa font-medium" : "text-muted-foreground"
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
