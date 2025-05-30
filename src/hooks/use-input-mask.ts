
import { useState, useCallback } from 'react';

export const useInputMask = () => {
  const formatCPF = useCallback((value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CPF: 000.000.000-00
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }, []);

  const formatCEP = useCallback((value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CEP: 00000-000
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }, []);

  const validateCPF = useCallback((cpf: string) => {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false;
    
    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(numbers[9]) !== digit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(numbers[10]) !== digit) return false;
    
    return true;
  }, []);

  const validateCEP = useCallback((cep: string) => {
    // Remove caracteres não numéricos
    const numbers = cep.replace(/\D/g, '');
    
    // Verifica se tem 8 dígitos
    return numbers.length === 8;
  }, []);

  return {
    formatCPF,
    formatCEP,
    validateCPF,
    validateCEP
  };
};
