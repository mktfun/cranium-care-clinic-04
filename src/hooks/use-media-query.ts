
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
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
