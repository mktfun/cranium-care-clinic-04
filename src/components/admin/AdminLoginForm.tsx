
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const navigate = useNavigate();

  // Updated to allow both aminmedikran.com and adminmedikran.com domains
  const isAdminEmail = (email: string) => {
    return email.endsWith("@aminmedikran.com") || email.endsWith("@adminmedikran.com");
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    // Password criteria
    const hasMinLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const passedCriteria = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (passedCriteria <= 2) {
      setPasswordStrength("weak");
    } else if (passedCriteria <= 4) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  // Effect to check password strength when it changes
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }

    // Check if it's an admin email
    if (!isAdminEmail(email)) {
      setError("This login is exclusively for administrators");
      return;
    }

    // Validate password
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      // Try login with Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        throw loginError;
      }

      if (data.user) {
        // Temporary: Set admin_role to true for this user
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({ admin_role: true })
          .eq("id", data.user.id);

        if (updateError) {
          console.error("Error updating admin role:", updateError);
          // Continue anyway
        }

        // Add security log
        await supabase
          .from("security_logs")
          .insert({
            user_id: data.user.id,
            action: "admin_login_success",
            details: {
              email_domain: email.split('@')[1],
              verification_method: "direct" // Temporary direct login
            }
          });

        toast.success("Admin login successful!");
        
        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-turquesa">Admin Access</CardTitle>
        <CardDescription>
          Secure administrative access to Medikran
        </CardDescription>
        {!process.env.NODE_ENV || process.env.NODE_ENV === "development" ? (
          <p className="text-amber-500 text-xs mt-2 p-1 bg-amber-50 rounded">
            Desenvolvimento: Acesso sem verificação OTP
          </p>
        ) : null}
      </CardHeader>
      
      {error && (
        <CardContent className="pt-0">
          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        </CardContent>
      )}
      
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-username@aminmedikran.com or your-username@adminmedikran.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Only authorized administrative accounts can access this area.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            
            {/* Password strength indicator */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full ${
                        passwordStrength === "weak" ? "w-1/3 bg-red-500" : 
                        passwordStrength === "medium" ? "w-2/3 bg-yellow-500" : 
                        "w-full bg-green-500"
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {passwordStrength === "weak" ? "Weak" : 
                     passwordStrength === "medium" ? "Medium" : 
                     "Strong"}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  Secure passwords should have at least 12 characters including uppercase & lowercase letters, numbers, and symbols.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-turquesa hover:bg-turquesa/90" 
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Login to Admin"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
