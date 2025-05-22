
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SecurityLogsList } from "@/components/admin/SecurityLogsList";

export default function AdminSecurityLogs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAdminAuth = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, redirect to admin login
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome, admin_role")
        .eq("id", session.user.id)
        .single();

      if (!userData?.admin_role) {
        // If not admin, redirect to regular dashboard
        navigate("/dashboard");
        return;
      }

      setUserName(userData.nome || "Administrator");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading admin interface...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-turquesa">Medikran Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {userName}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="mb-4 flex items-center">
        <Button 
          variant="outline" 
          onClick={handleBackToDashboard}
          className="mb-4"
        >
          ← Voltar ao Dashboard
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <SecurityLogsList />
      </div>
    </div>
  );
}
