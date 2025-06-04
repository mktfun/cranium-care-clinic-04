
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SecureLogin from "./pages/SecureLogin";
import Dashboard from "./pages/Dashboard";
import Layout from "./pages/Layout";
import Registro from "./pages/Registro";
import Pacientes from "./pages/Pacientes";
import RegistroPaciente from "./pages/RegistroPaciente";
import DetalhePaciente from "./pages/DetalhePaciente";
import NovaMedicao from "./pages/NovaMedicao";
import Historico from "./pages/Historico";
import HistoricoCompletoPaciente from "./pages/HistoricoCompletoPaciente";
import ProntuarioMedico from "./pages/ProntuarioMedico";
import ImprimirProntuario from "./pages/ImprimirProntuario";
import NotFound from "./pages/NotFound";
import Tarefas from "./pages/Tarefas";
import NotificacoesPage from "./pages/NotificacoesPage";
import MedicaoPorFotoPage from "./pages/MedicaoPorFotoPage";
import RelatorioMedicao from "./pages/RelatorioMedicao";
import RelatorioVisualizar from "./pages/RelatorioVisualizar";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Colaboradores from "./pages/Colaboradores";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminSecurityLogs from "./pages/AdminSecurityLogs";
import AdminSystemSettings from "./pages/AdminSystemSettings";
import { SecureAuthGuard } from "./components/auth/SecureAuthGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Secure login route */}
            <Route path="/login" element={<SecureLogin />} />
            
            {/* Legacy login for backward compatibility */}
            <Route path="/login-legacy" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <SecureAuthGuard>
                <Layout />
              </SecureAuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
