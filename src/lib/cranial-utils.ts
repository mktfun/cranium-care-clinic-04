
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  calculateCVAI, 
  calculateCranialIndex, 
  determineAsymmetryType, 
  determineSeverityLevel 
} from "./cranial-analysis";

// Export both types 
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";
export type AsymmetryType = "Normal" | "Plagiocefalia" | "Braquicefalia" | "Dolicocefalia" | "Misto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
