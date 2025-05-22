import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Generate a random 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const { userId, email } = await req.json();

    // Validate input
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User ID and email are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify email has proper admin domain (either aminmedikran.com or adminmedikran.com)
    if (!email.endsWith("@aminmedikran.com") && !email.endsWith("@adminmedikran.com")) {
      return new Response(
        JSON.stringify({ error: "Only administrative emails can use this function" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Check rate limiting
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from("admin_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    if (rateLimitData) {
      const lastAttempt = new Date(rateLimitData.last_attempt);

      // If last attempt was within the last 15 minutes
      if (lastAttempt > fifteenMinutesAgo) {
        // If already exceeded 5 attempts in the last 15 minutes
        if (rateLimitData.attempts >= 5) {
          return new Response(
            JSON.stringify({ 
              error: "Too many login attempts. Please try again later." 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
          );
        }

        // Increment attempt counter
        await supabaseAdmin
          .from("admin_rate_limits")
          .update({ 
            attempts: rateLimitData.attempts + 1,
            last_attempt: now.toISOString()
          })
          .eq("user_id", userId);
      } else {
        // Reset counter if last attempt was more than 15 minutes ago
        await supabaseAdmin
          .from("admin_rate_limits")
          .update({ 
            attempts: 1,
            last_attempt: now.toISOString()
          })
          .eq("user_id", userId);
      }
    } else {
      // Create new rate limiting record
      await supabaseAdmin
        .from("admin_rate_limits")
        .insert({ 
          user_id: userId,
          attempts: 1,
          last_attempt: now.toISOString()
        });
    }

    // Generate OTP
    const otpCode = generateOTP();
    
    // Calculate expiration time (10 minutes)
    const expiresAt = new Date(now.getTime() + 600 * 1000).toISOString();
    
    // Store OTP in the database
    const { error: otpError } = await supabaseAdmin
      .from("admin_otps")
      .upsert({ 
        user_id: userId,
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        used: false
      });
    
    if (otpError) {
      throw otpError;
    }
    
    // Log OTP generation
    await supabaseAdmin
      .from("security_logs")
      .insert({
        user_id: userId,
        action: "otp_sent",
        details: {
          email_domain: email.split('@')[1],
          expires_at: expiresAt
        },
        ip_address: req.headers.get("x-forwarded-for") || "unknown"
      });

    // For testing, include the OTP in the response
    // In production, you'd send this via email using another Edge Function
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully",
        otp: otpCode // Remove in production, this is only for testing
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
