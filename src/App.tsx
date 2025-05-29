
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import Dashboard from "@/pages/Dashboard";
import Pacientes from "@/pages/Pacientes";
import RegistroPaciente from "@/pages/RegistroPaciente";
import DetalhePaciente from "@/pages/DetalhePaciente";
import NovaMedicao from "@/pages/NovaMedicao";
import Historico from "@/pages/Historico";
import HistoricoCompletoPaciente from "@/pages/HistoricoCompletoPaciente";
import ProntuarioMedico from "@/pages/ProntuarioMedico";
import ImprimirProntuario from "@/pages/ImprimirProntuario";
import NotFound from "@/pages/NotFound";
import Layout from "@/pages/Layout";
import Index from "@/pages/Index";
import Tarefas from "@/pages/Tarefas";
import NotificacoesPage from "@/pages/NotificacoesPage";
import MedicaoPorFotoPage from "@/pages/MedicaoPorFotoPage";
import RelatorioMedicao from "@/pages/RelatorioMedicao";
import RelatorioVisualizar from "@/pages/RelatorioVisualizar";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminSecurityLogs from "./pages/AdminSecurityLogs";
import AdminSystemSettings from "./pages/AdminSystemSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="cranium-care-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/logs" element={<AdminSecurityLogs />} />
            <Route path="/admin/settings" element={<AdminSystemSettings />} />
            
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="pacientes/novo" element={<RegistroPaciente />} />
              <Route path="pacientes/:id" element={<DetalhePaciente />} />
              <Route path="pacientes/:id/nova-medicao" element={<NovaMedicao />} />
              <Route path="pacientes/:id/historico" element={<HistoricoCompletoPaciente />} />
              <Route path="pacientes/:id/prontuario" element={<ProntuarioMedico />} />
              <Route path="pacientes/:id/prontuario/:prontuarioId" element={<ProntuarioMedico />} />
              <Route path="pacientes/:id/prontuario/imprimir" element={<ImprimirProntuario />} />
              <Route path="pacientes/:id/prontuario/:prontuarioId/imprimir" element={<ImprimirProntuario />} />
              <Route path="pacientes/:id/relatorios" element={<RelatorioMedicao />} />
              <Route path="pacientes/:id/relatorios/:medicaoId" element={<RelatorioVisualizar />} />
              <Route path="historico" element={<Historico />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="tarefas" element={<Tarefas />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="perfil" element={<Configuracoes />} />
              <Route path="notificacoes" element={<NotificacoesPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
