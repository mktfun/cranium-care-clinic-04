
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
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

  const navigateToUsers = () => {
    navigate("/admin/users");
  };

  const navigateToLogs = () => {
    navigate("/admin/logs");
  };

  const navigateToSettings = () => {
    navigate("/admin/settings");
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage users and their permissions</p>
            <Button className="w-full" onClick={navigateToUsers}>Manage Users</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View security logs and login attempts</p>
            <Button className="w-full" onClick={navigateToLogs}>View Logs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Configure system settings and parameters</p>
            <Button className="w-full" onClick={navigateToSettings}>System Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
