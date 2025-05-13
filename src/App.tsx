
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from '@/components/ui/sonner';

import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import Dashboard from "@/pages/Dashboard";
import Pacientes from "@/pages/Pacientes";
import RegistroPaciente from "@/pages/RegistroPaciente";
import DetalhePaciente from "@/pages/DetalhePaciente";
import NovaMedicao from "@/pages/NovaMedicao";
import RelatorioMedicao from "@/pages/RelatorioMedicao";
import RelatorioVisualizar from "@/pages/RelatorioVisualizar";
import Historico from "@/pages/Historico";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";
import Layout from "@/pages/Layout";
import Index from "@/pages/Index";
import Tarefas from "@/pages/Tarefas";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/registro" element={<RegistroPaciente />} />
            <Route path="/pacientes/:id" element={<DetalhePaciente />} />
            <Route path="/pacientes/:id/nova-medicao" element={<NovaMedicao />} />
            <Route path="/pacientes/:id/relatorio" element={<RelatorioMedicao />} />
            <Route path="/pacientes/:id/relatorios/:medicaoId" element={<RelatorioVisualizar />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/perfil" element={<Configuracoes />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
