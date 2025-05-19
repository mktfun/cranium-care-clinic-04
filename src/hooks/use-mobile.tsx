
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Verificar imediatamente
    checkIfMobile();
    
    // Adicionar event listener para verificar em mudanças de tamanho
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [breakpoint]);
  
  return isMobile;
}

export function useTabletPortrait() {
  const [isTabletPortrait, setIsTabletPortrait] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfTabletPortrait = () => {
      // Tablet em modo retrato: largura entre 600 e 900px, altura > largura
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsTabletPortrait(width >= 600 && width <= 900 && height > width);
    };
    
    checkIfTabletPortrait();
    window.addEventListener('resize', checkIfTabletPortrait);
    return () => window.removeEventListener('resize', checkIfTabletPortrait);
  }, []);
  
  return isTabletPortrait;
}

export function useIsMobileOrTabletPortrait(mobileBreakpoint: number = 768) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const isTabletPortrait = useTabletPortrait();
  
  return isMobile || isTabletPortrait;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs');
  
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 480) setBreakpoint('xs');
      else if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);
  
  return breakpoint;
}
