
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  calculateCVAI, 
  calculateCranialIndex, 
  determineSeverityLevel 
} from "./cranial-analysis";
import { AsymmetryType, SeverityLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to determine type of asymmetry based on measurements
export function determineAsymmetryType(cranialIndex: number, cvai: number): AsymmetryType {
  // Criteria based on protocols
  const hasBrachy = cranialIndex >= 81;
  const hasDolich = cranialIndex <= 76;
  const hasPlagi = cvai >= 3.5;
  
  if (hasBrachy && hasPlagi) {
    return "Misto";
  } else if (hasDolich && hasPlagi) {
    return "Misto";
  } else if (hasBrachy) {
    return "Braquicefalia";
  } else if (hasDolich) {
    return "Dolicocefalia";
  } else if (hasPlagi) {
    return "Plagiocefalia";
  } else {
    return "Normal";
  }
}

// Function to determine cranial status based on measurements
export function getCranialStatus(indiceCraniano: number, cvai: number): {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
} {
  // Determine the type of asymmetry based on indices
  const asymmetryType = determineAsymmetryType(indiceCraniano, cvai);
  
  // Determine severity level based on type and measurements
  const severityLevel = determineSeverityLevel(asymmetryType, indiceCraniano, cvai);
  
  return {
    asymmetryType,
    severityLevel
  };
}

// Helper function to calculate indices from raw measurements
export function calculateCranialIndices(
  comprimento: number,
  largura: number,
  diagonalD: number,
  diagonalE: number
): {
  indiceCraniano: number;
  cvai: number;
  diferencaDiagonais: number;
} {
  const indiceCraniano = calculateCranialIndex(largura, comprimento);
  const cvai = calculateCVAI(diagonalD, diagonalE);
  const diferencaDiagonais = Math.abs(diagonalD - diagonalE);
  
  return {
    indiceCraniano,
    cvai,
    diferencaDiagonais
  };
}
