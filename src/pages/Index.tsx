
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Show loading until navigation occurs
  return <div className="flex items-center justify-center h-screen">Carregando...</div>;
};

export default Index;
