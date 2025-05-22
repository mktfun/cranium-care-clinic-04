
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData } = await supabase
          .from("usuarios")
          .select("admin_role")
          .eq("id", session.user.id)
          .single();

        // If user is authenticated and has admin role, redirect to admin dashboard
        if (userData?.admin_role) {
          navigate("/admin/dashboard");
        } else if (session.user.email?.endsWith("@adminmedikran")) {
          // If user has admin email but no admin role yet, stay on this page
          // They'll need to complete OTP verification
        } else {
          // If user is not admin, redirect to regular dashboard
          navigate("/dashboard");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite dark:bg-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <AdminLoginForm />
      </div>
    </div>
  );
}
