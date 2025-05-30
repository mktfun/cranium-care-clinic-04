
import { useState, useEffect } from "react";
import { validatePerimetroCefalico } from "@/lib/cranial-utils";

type UseMedicaoCalculationsProps = {
  comprimento: string;
  largura: string;
  diagonalD: string;
  diagonalE: string;
  perimetroCefalico: string;
  pacienteDataNascimento?: string;
};

export function useMedicaoCalculations({
  comprimento,
  largura,
  diagonalD,
  diagonalE,
  perimetroCefalico,
  pacienteDataNascimento
}: UseMedicaoCalculationsProps) {
  const [indiceCraniano, setIndiceCraniano] = useState<number | null>(null);
  const [diferencaDiagonais, setDiferencaDiagonais] = useState<number | null>(null);
  const [cvai, setCvai] = useState<number | null>(null);
  const [perimetroError, setPerimetroError] = useState<string | null>(null);

  // Calculate derived measurements
  useEffect(() => {
    if (comprimento && largura && Number(comprimento) > 0) {
      const ic = (Number(largura) / Number(comprimento)) * 100;
      setIndiceCraniano(parseFloat(ic.toFixed(1)));
    } else {
      setIndiceCraniano(null);
    }
    
    if (diagonalD && diagonalE && Number(diagonalD) > 0 && Number(diagonalE) > 0) {
      const diaD = Number(diagonalD);
      const diaE = Number(diagonalE);
      const diff = Math.abs(diaD - diaE);
      setDiferencaDiagonais(diff);
      const longer = Math.max(diaD, diaE);
      const shorter = Math.min(diaD, diaE);
      const cvaiValue = ((longer - shorter) / shorter) * 100;
      setCvai(parseFloat(cvaiValue.toFixed(1)));
    } else {
      setDiferencaDiagonais(null);
      setCvai(null);
    }
  }, [comprimento, largura, diagonalD, diagonalE]);
  
  // Validate head circumference
  useEffect(() => {
    if (perimetroCefalico && pacienteDataNascimento) {
      const valor = Number(perimetroCefalico);
      
      // Calculate age in months from birth date
      const birthDate = new Date(pacienteDataNascimento);
      const currentDate = new Date();
      const ageInMonths = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
      
      const resultado = validatePerimetroCefalico(valor, ageInMonths);
      if (!resultado.isValid) {
        setPerimetroError(resultado.message || null);
      } else {
        setPerimetroError(null);
      }
    } else {
      setPerimetroError(null);
    }
  }, [perimetroCefalico, pacienteDataNascimento]);

  return {
    indiceCraniano,
    diferencaDiagonais,
    cvai,
    perimetroError
  };
}
