
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroLandingPage from "./HeroLandingPage";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        navigate("/dashboard", { replace: true });
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Show landing page if not authenticated
  if (!loading && !session) {
    return <HeroLandingPage />;
  }
  
  // Show loading until navigation occurs
  return <div className="flex items-center justify-center h-screen">Carregando...</div>;
};

export default Index;
