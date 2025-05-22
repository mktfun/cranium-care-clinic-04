
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SystemSettingsPanel from "@/components/admin/SystemSettingsPanel";

export default function AdminSystemSettings() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Carregando configurações do sistema...</div>
      </div>
    );
  }

  return <SystemSettingsPanel />;
}
