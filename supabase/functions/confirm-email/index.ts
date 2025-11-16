import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmEmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: ConfirmEmailRequest = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Confirming email for user:", userId);
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Update user's email_confirmed_at in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true
      }
    );

    if (userError) {
      console.error("Error confirming email:", userError);
      throw userError;
    }

    console.log("Email confirmed in auth.users");

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        email_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Profile updated successfully");

    // Send welcome email in background
    const welcomeEmailPromise = fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email: userData.user.email,
        userName: userData.user.user_metadata?.first_name || userData.user.email?.split('@')[0]
      })
    }).catch(err => console.error('Error sending welcome email:', err));

    // Don't wait for welcome email to complete
    console.log("Welcome email triggered in background");

    return new Response(
      JSON.stringify({ success: true, message: "Email confirmed successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in confirm-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
