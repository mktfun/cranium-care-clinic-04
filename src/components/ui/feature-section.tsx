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
  return <div className={cn("py-16 px-4", className)}>
      
    </div>;
}