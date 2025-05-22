
import { useState, useEffect } from "react";

export function useMediaQuery(query: string | number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Convert number to a proper media query string if needed
    const mediaQuery = typeof query === 'number' 
      ? `(max-width: ${query}px)` 
      : query;
    
    const media = window.matchMedia(mediaQuery);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function useTabletPortraitQuery(): boolean {
  return useMediaQuery("(min-width: 600px) and (max-width: 900px) and (orientation: portrait)");
}

export function useMobileQuery(maxWidth: number = 768): boolean {
  return useMediaQuery(`(max-width: ${maxWidth}px)`);
}

export function useIsMobileOrTabletPortrait(): boolean {
  const isMobile = useMobileQuery();
  const isTabletPortrait = useTabletPortraitQuery();
  return isMobile || isTabletPortrait;
}

// Funções para diferentes dispositivos e faixa etária para limites de perímetro cefálico
export function useSizeLimits(idade: number): { min: number, max: number } {
  if (idade <= 6) {
    return { min: 320, max: 440 }; // 0-6 meses (mm)
  } else if (idade <= 12) {
    return { min: 400, max: 490 }; // 6-12 meses
  } else if (idade <= 24) {
    return { min: 450, max: 520 }; // 1-2 anos
  } else if (idade <= 60) {
    return { min: 480, max: 550 }; // 2-5 anos
  } else {
    return { min: 500, max: 650 }; // > 5 anos
  }
}
