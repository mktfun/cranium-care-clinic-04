
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { supabase } from "@/integrations/supabase/client";
import { createAuditLog } from "@/lib/security-utils";

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Log admin login attempt
        await createAuditLog('admin_login_attempt', 'usuarios', session.user.id);
        
        const { data: userData } = await supabase
          .from("usuarios")
          .select("admin_role")
          .eq("id", session.user.id)
          .single();

        // SECURITY FIX: Remove automatic admin role assignment
        // Only proceed if user already has admin role verified
        if (userData?.admin_role) {
          await createAuditLog('admin_access_granted', 'usuarios', session.user.id);
          navigate("/admin/dashboard");
        } else {
          // Log unauthorized admin access attempt
          await createAuditLog('unauthorized_admin_attempt', 'usuarios', session.user.id, {
            email: session.user.email,
            reason: 'No admin role assigned'
          });
          
          // Redirect to regular dashboard instead of auto-assigning admin role
          navigate("/dashboard");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite dark:bg-gray-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            ⚠️ Acesso Administrativo
          </h1>
          <p className="text-sm text-gray-600">
            Apenas usuários autorizados podem acessar esta área
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
