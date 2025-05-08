
// Types of cranial asymmetry
export type AsymmetryType = 
  | "Braquicefalia" 
  | "Dolicocefalia" 
  | "Plagiocefalia" 
  | "Assimetria Mista" 
  | "Normal";

// Severity levels
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

// Function to determine asymmetry type based on measurements
export function determineAsymmetryType(
  cranialIndex: number, 
  cvai: number
): AsymmetryType {
  const hasBrachy = cranialIndex >= 81;
  const hasDolich = cranialIndex <= 76;
  const hasPlagi = cvai >= 3.5;
  
  if (hasBrachy && hasPlagi) {
    return "Assimetria Mista";
  } else if (hasDolich && hasPlagi) {
    return "Assimetria Mista";
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

// Function to determine severity level based on asymmetry type and measurements
export function determineSeverityLevel(
  asymmetryType: AsymmetryType, 
  cranialIndex: number, 
  cvai: number
): SeverityLevel {
  if (asymmetryType === "Normal") {
    return "normal";
  }
  
  // For Brachy/Dolicocefalia
  if (asymmetryType === "Braquicefalia") {
    if (cranialIndex >= 90) return "severa";
    if (cranialIndex >= 85) return "moderada";
    return "leve";
  }
  
  if (asymmetryType === "Dolicocefalia") {
    if (cranialIndex <= 70) return "severa";
    if (cranialIndex <= 73) return "moderada";
    return "leve";
  }
  
  // For Plagiocefalia
  if (asymmetryType === "Plagiocefalia" || asymmetryType === "Assimetria Mista") {
    if (cvai >= 8.5) return "severa";
    if (cvai >= 6.25) return "moderada";
    return "leve";
  }
  
  return "leve"; // Default fallback
}

// Combine type and severity for display
export function formatAsymmetryStatus(asymmetryType: AsymmetryType, severityLevel: SeverityLevel): string {
  if (asymmetryType === "Normal") {
    return "Normal";
  }
  return `${asymmetryType} (${severityLevel === 'normal' ? 'leve' : severityLevel})`;
}

// All-in-one function to get formatted status
export function getCranialStatus(cranialIndex: number, cvai: number): {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
  formattedStatus: string;
} {
  const asymmetryType = determineAsymmetryType(cranialIndex, cvai);
  const severityLevel = determineSeverityLevel(asymmetryType, cranialIndex, cvai);
  const formattedStatus = formatAsymmetryStatus(asymmetryType, severityLevel);
  
  return {
    asymmetryType,
    severityLevel,
    formattedStatus
  };
}
