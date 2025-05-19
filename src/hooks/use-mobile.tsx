
import { useState, useEffect, useCallback } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const checkIfMobile = useCallback(() => {
    setIsMobile(window.innerWidth < breakpoint);
  }, [breakpoint]);
  
  useEffect(() => {
    // Verificar imediatamente
    checkIfMobile();
    
    // Adicionar event listener para verificar em mudanças de tamanho
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);
  
  return isMobile;
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

// Hook para verificar se o dispositivo é realmente um dispositivo touch
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState<boolean>(false);
  
  useEffect(() => {
    const detectTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0
      );
    };
    
    detectTouch();
  }, []);
  
  return isTouch;
}

// Hook para detectar a orientação do dispositivo
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  return orientation;
}

// Hook para calcular a altura segura da tela em dispositivos móveis
// Isso é útil para lidar com as barras de navegação e notch
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  
  useEffect(() => {
    // Tenta obter os valores CSS para áreas seguras quando disponível
    if (typeof window !== 'undefined' && window.CSS && window.CSS.supports) {
      try {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        setInsets({
          top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
          right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
          bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
          left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10)
        });
        
        // Cria um MutationObserver para monitorar mudanças nas variáveis CSS
        const observer = new MutationObserver(() => {
          const style = getComputedStyle(root);
          setInsets({
            top: parseInt(style.getPropertyValue('--sat') || '0', 10),
            right: parseInt(style.getPropertyValue('--sar') || '0', 10),
            bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
            left: parseInt(style.getPropertyValue('--sal') || '0', 10)
          });
        });
        
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['style']
        });
        
        return () => observer.disconnect();
      } catch (e) {
        console.warn('Erro ao obter os safe area insets:', e);
      }
    }
    // Fallback para valores padrão se não for possível obter os valores CSS
    return () => {};
  }, []);
  
  return insets;
}
