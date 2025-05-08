
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegistroForm } from "@/components/RegistroForm";
import { supabase } from "@/integrations/supabase/client";

export default function Registro() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If user is authenticated, redirect to dashboard
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite dark:bg-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <RegistroForm />
      </div>
    </div>
  );
}
