
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]"
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress(prev => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature(prev => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn("py-16 px-4", className)}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps Navigation */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-lg border transition-all duration-300 cursor-pointer",
                  index === currentFeature
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index === currentFeature
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-primary">
                        {feature.step}
                      </span>
                      {index === currentFeature && (
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {feature.title && (
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                    )}
                    <p className="text-gray-600 text-sm">{feature.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Image */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn("relative overflow-hidden rounded-lg", imageHeight)}
              >
                <img
                  src={features[currentFeature].image}
                  alt={features[currentFeature].title || features[currentFeature].step}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
