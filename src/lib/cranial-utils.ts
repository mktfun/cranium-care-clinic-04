
// Re-export SeverityLevel from types
export { type AsymmetryType, type SeverityLevel } from '@/types';

// Original functionality remains
export function getCranialStatus(indiceCraniano: number = 0, cvai: number = 0): { asymmetryType: AsymmetryType, severityLevel: SeverityLevel } {
  // Get asymmetry type
  let asymmetryType: AsymmetryType = "Normal";
  
  if (indiceCraniano > 81 && cvai < 3.5) {
    asymmetryType = "Braquicefalia";
  } else if (indiceCraniano < 75 && cvai < 3.5) {
    asymmetryType = "Dolicocefalia";
  } else if (cvai >= 3.5 && indiceCraniano < 81 && indiceCraniano > 75) {
    asymmetryType = "Plagiocefalia";
  } else if (cvai >= 3.5 && (indiceCraniano >= 81 || indiceCraniano <= 75)) {
    asymmetryType = "Misto";
  }
  
  // Get severity level
  let severityLevel: SeverityLevel = "normal";
  
  if (cvai >= 8.75 || indiceCraniano >= 90 || indiceCraniano <= 70) {
    severityLevel = "severa";
  } else if (cvai >= 6.25 || indiceCraniano >= 85 || indiceCraniano <= 72) {
    severityLevel = "moderada";
  } else if (cvai >= 3.5 || indiceCraniano >= 81 || indiceCraniano <= 75) {
    severityLevel = "leve";
  }
  
  return { asymmetryType, severityLevel };
}
