
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';
import { loadThemeSettings, applyThemeSettings } from '@/lib/theme-utils';

// Carregar e aplicar configurações de tema salvas
const savedSettings = loadThemeSettings();
applyThemeSettings(savedSettings);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
