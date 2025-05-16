
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';
import { loadThemeSettings, applyThemeSettings } from '@/lib/theme-utils';

// Adicionar estilos globais para melhorar a responsividade
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Estilos globais para melhorar a responsividade */
    body {
      -webkit-tap-highlight-color: transparent;
      overflow-x: hidden;
    }
    
    /* Evitar que campos de texto sejam ampliados automaticamente em dispositivos iOS */
    input, select, textarea {
      font-size: 16px !important; 
    }
    
    /* Melhorar visualização de gráficos em dispositivos móveis */
    .recharts-responsive-container {
      touch-action: pan-y;
    }
    
    /* Ajuste de espaço para o menu de navegação móvel */
    @media (max-width: 767px) {
      body {
        padding-bottom: env(safe-area-inset-bottom, 60px);
      }
    }
  `;
  document.head.appendChild(style);
};

// Carregar e aplicar configurações de tema salvas
const savedSettings = loadThemeSettings();
applyThemeSettings(savedSettings);

// Adicionar estilos globais
addGlobalStyles();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
