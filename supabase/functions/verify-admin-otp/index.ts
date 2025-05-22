
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Handle CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { email, otpCode } = await req.json();

    // Validate input
    if (!email || !otpCode) {
      return new Response(
        JSON.stringify({ error: "Email and OTP code are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify email has aminmedikran.com domain (updated)
    if (!email.endsWith("@aminmedikran.com")) {
      return new Response(
        JSON.stringify({ error: "Only administrative emails can use this function" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Find OTP in database
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("admin_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otpCode)
      .eq("used", false)
      .single();

    if (otpError) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Verification code has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("admin_otps")
      .update({ used: true })
      .eq("id", otpData.id);

    // Update user's admin role
    await supabaseAdmin
      .from("usuarios")
      .update({ admin_role: true })
      .eq("id", otpData.user_id);

    // Log successful verification
    await supabaseAdmin
      .from("security_logs")
      .insert({
        user_id: otpData.user_id,
        action: "admin_login_success",
        details: {
          email_domain: email.split('@')[1],
          verification_method: "otp"
        },
        ip_address: req.headers.get("x-forwarded-for") || "unknown"
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification successful",
        userId: otpData.user_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
