
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
        padding-bottom: env(safe-area-inset-bottom, 70px);
      }
    }
    
    /* Melhoria para scrollbars finos em dispositivos touch */
    .scrollbar-thin::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    
    .scrollbar-thin::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: rgba(100, 100, 100, 0.3);
      border-radius: 10px;
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 100, 100, 0.5);
    }
    
    /* Suporte para safe areas do iOS */
    .pt-safe {
      padding-top: env(safe-area-inset-top, 0px);
    }
    
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    
    .pl-safe {
      padding-left: env(safe-area-inset-left, 0px);
    }
    
    .pr-safe {
      padding-right: env(safe-area-inset-right, 0px);
    }
    
    /* Utility para esconder em telas muito pequenas */
    @media (max-width: 360px) {
      .xs\\:inline {
        display: inline;
      }
      .hidden.xs\\:inline {
        display: none;
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

// Adicionar meta viewport com novas configurações para mobile
const updateViewport = () => {
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }
  viewportMeta.setAttribute('content', 
    'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no, maximum-scale=1.0'
  );
};

// Atualizar viewport
updateViewport();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
