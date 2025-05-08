
// Function to calculate age in months and days
export function calculateAge(birthDate: string, referenceDate: string | Date = new Date()): { months: number; days: number } {
  const birth = new Date(birthDate);
  const reference = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  
  // Calculate total days difference
  const diffTime = Math.abs(reference.getTime() - birth.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate months
  const months = Math.floor(diffDays / 30);
  // Calculate remaining days
  const days = diffDays % 30;
  
  return { months, days };
}

// Format age as "X meses e Y dias" or "X anos Y meses"
export function formatAge(birthDate: string, referenceDate: string | Date = new Date()): string {
  const { months, days } = calculateAge(birthDate, referenceDate);
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}${days > 0 ? ` e ${days} ${days === 1 ? 'dia' : 'dias'}` : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    return `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
  }
}

// Format age for header (more compact)
export function formatAgeHeader(birthDate: string): string {
  const { months } = calculateAge(birthDate);
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    return `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths > 0 ? ` ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
  }
}
