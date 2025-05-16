
// Tipos para os temas e configurações visuais
export type ThemeOption = 'default' | 'ocean' | 'nature' | 'sunset' | 'purple' | 'high-contrast';
export type AnimationSpeed = 'fast' | 'normal' | 'slow' | 'none';
export type DensityOption = 'compact' | 'normal' | 'comfortable';
export type BorderRadiusOption = 'none' | 'small' | 'medium' | 'large' | 'full';
export type BackgroundPatternOption = 'none' | 'dots' | 'grid' | 'waves';

export interface ThemeSettings {
  theme: ThemeOption;
  isDark: boolean;
  animationSpeed: AnimationSpeed;
  density: DensityOption;
  borderRadius: BorderRadiusOption;
  backgroundPattern: BackgroundPatternOption;
}

// Valores padrão para configurações de tema
export const defaultThemeSettings: ThemeSettings = {
  theme: 'default',
  isDark: false,
  animationSpeed: 'normal',
  density: 'normal',
  borderRadius: 'medium',
  backgroundPattern: 'none'
};

// Funções para aplicar configurações de tema
export function applyTheme(theme: ThemeOption = 'default'): void {
  // Remover todas as classes de tema existentes
  document.documentElement.classList.remove(
    'theme-ocean',
    'theme-nature',
    'theme-sunset',
    'theme-purple',
    'theme-high-contrast'
  );
  
  // Aplicar o novo tema, se não for o padrão
  if (theme !== 'default') {
    document.documentElement.classList.add(`theme-${theme}`);
  }
}

export function applyDarkMode(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

export function applyAnimationSpeed(speed: AnimationSpeed): void {
  // Remover todas as classes de velocidade de animação existentes
  document.documentElement.classList.remove(
    'animation-fast',
    'animation-normal',
    'animation-slow',
    'animation-none'
  );
  
  // Aplicar a nova velocidade, se não for a normal
  if (speed !== 'normal') {
    document.documentElement.classList.add(`animation-${speed}`);
  }
}

export function applyDensity(density: DensityOption): void {
  // Remover todas as classes de densidade existentes
  document.documentElement.classList.remove(
    'density-compact',
    'density-normal',
    'density-comfortable'
  );
  
  // Aplicar a nova densidade, se não for a normal
  if (density !== 'normal') {
    document.documentElement.classList.add(`density-${density}`);
  }
}

export function applyBorderRadius(radius: BorderRadiusOption): void {
  let radiusValue = '0.75rem'; // medium (default)
  
  switch (radius) {
    case 'none':
      radiusValue = '0';
      break;
    case 'small':
      radiusValue = '0.375rem';
      break;
    case 'large':
      radiusValue = '1rem';
      break;
    case 'full':
      radiusValue = '9999px';
      break;
  }
  
  document.documentElement.style.setProperty('--radius', radiusValue);
}

export function applyBackgroundPattern(pattern: BackgroundPatternOption): void {
  // Remover todos os padrões de fundo existentes
  document.body.classList.remove(
    'pattern-dots',
    'pattern-grid',
    'pattern-waves'
  );
  
  // Aplicar o novo padrão, se não for nenhum
  if (pattern !== 'none') {
    document.body.classList.add(`pattern-${pattern}`);
  }
}

export function applyThemeSettings(settings: ThemeSettings): void {
  applyTheme(settings.theme);
  applyDarkMode(settings.isDark);
  applyAnimationSpeed(settings.animationSpeed);
  applyDensity(settings.density);
  applyBorderRadius(settings.borderRadius);
  applyBackgroundPattern(settings.backgroundPattern);
}

// Função para carregar configurações do localStorage
export function loadThemeSettings(): ThemeSettings {
  try {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings) as ThemeSettings;
    }
  } catch (error) {
    console.error("Erro ao carregar configurações de tema:", error);
  }
  
  return defaultThemeSettings;
}

// Função para salvar configurações no localStorage
export function saveThemeSettings(settings: ThemeSettings): void {
  try {
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  } catch (error) {
    console.error("Erro ao salvar configurações de tema:", error);
  }
}
