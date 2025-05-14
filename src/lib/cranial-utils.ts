
// Define types for asymmetry and severity
export type AsymmetryType = "Braquicefalia" | "Dolicocefalia" | "Plagiocefalia" | "Misto" | "Normal";
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

// Threshold values
const CVAI_THRESHOLDS = {
  NORMAL: 3.5,
  LEVE: 6.25,
  MODERADA: 8.75,
  // Above 8.75 is considered 'severa'
};

const IC_THRESHOLDS = {
  DOLICOCEFALIA_UPPER: 76, // Below this is dolicocefalia
  NORMAL_UPPER: 81, // 76-81 is normal
  BRAQUICEFALIA_MODERATE: 90, // 81-90 is moderate braquicefalia
  // Above 90 is severe braquicefalia
};

interface CranialStatus {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
}

/**
 * Determines the cranial status based on the cranial index and CVAI
 * @param indiceCraniano - Cranial index (cephalic index) as a percentage
 * @param cvai - Cranial Vault Asymmetry Index as a percentage
 * @returns Object with asymmetry type and severity level
 */
export function getCranialStatus(indiceCraniano: number, cvai: number): CranialStatus {
  // Default status
  let asymmetryType: AsymmetryType = "Normal";
  let severityLevel: SeverityLevel = "normal";

  // Determine asymmetry type based on cranial index
  if (indiceCraniano < IC_THRESHOLDS.DOLICOCEFALIA_UPPER) {
    asymmetryType = "Dolicocefalia";
  } else if (indiceCraniano > IC_THRESHOLDS.NORMAL_UPPER) {
    asymmetryType = "Braquicefalia";
  } 
  
  // Determine if there's plagiocephaly based on CVAI
  if (cvai > CVAI_THRESHOLDS.NORMAL) {
    // If already has another asymmetry type, it's a mixed asymmetry
    if (asymmetryType !== "Normal") {
      asymmetryType = "Misto";
    } else {
      asymmetryType = "Plagiocefalia";
    }
  }

  // Determine severity level
  // For braquicefalia/dolicocefalia
  if (asymmetryType === "Braquicefalia") {
    if (indiceCraniano > IC_THRESHOLDS.BRAQUICEFALIA_MODERATE) {
      severityLevel = "severa";
    } else if (indiceCraniano > IC_THRESHOLDS.NORMAL_UPPER) {
      severityLevel = "moderada";
    }
  } else if (asymmetryType === "Dolicocefalia") {
    // Lower is more severe for dolicocefalia
    if (indiceCraniano < IC_THRESHOLDS.DOLICOCEFALIA_UPPER - 5) {
      severityLevel = "moderada";
    } else if (indiceCraniano < IC_THRESHOLDS.DOLICOCEFALIA_UPPER - 10) {
      severityLevel = "severa";
    }
  }

  // For plagiocephaly (or mixed cases)
  if (cvai > CVAI_THRESHOLDS.MODERADA) {
    severityLevel = "severa";
  } else if (cvai > CVAI_THRESHOLDS.LEVE) {
    severityLevel = "moderada";
  } else if (cvai > CVAI_THRESHOLDS.NORMAL) {
    severityLevel = "leve";
  }

  // Return the determined status
  return { asymmetryType, severityLevel };
}

/**
 * Calculates the Cranial Vault Asymmetry Index (CVAI)
 * @param comprimento - Cranial length in mm
 * @param largura - Cranial width in mm
 * @param diagonalDireita - Right diagonal measurement in mm
 * @param diagonalEsquerda - Left diagonal measurement in mm
 * @returns CVAI as a percentage
 */
export function calculateAsymmetry(
  comprimento: number, 
  largura: number, 
  diagonalDireita: number, 
  diagonalEsquerda: number
): number {
  // Calculate CVAI: (|Diagonal A - Diagonal B| / Diagonal Maior) x 100%
  const diagonalDifference = Math.abs(diagonalDireita - diagonalEsquerda);
  const maxDiagonal = Math.max(diagonalDireita, diagonalEsquerda);
  
  if (maxDiagonal === 0) return 0; // Avoid division by zero
  
  return (diagonalDifference / maxDiagonal) * 100;
}
