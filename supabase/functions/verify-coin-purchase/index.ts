import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session ID");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const coinsToAdd = parseInt(session.metadata?.coins || "0");
    if (coinsToAdd <= 0) throw new Error("Invalid coin amount");

    // Check if already credited (idempotency)
    const { data: existing } = await supabase
      .from("coin_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("reason", `stripe:${sessionId}`)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_credited: true, coins: coinsToAdd }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Credit coins
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins")
      .eq("user_id", user.id)
      .single();

    const newBalance = (profile?.coins || 0) + coinsToAdd;

    await supabase.from("profiles").update({ coins: newBalance }).eq("user_id", user.id);
    await supabase.from("coin_transactions").insert({
      user_id: user.id,
      amount: coinsToAdd,
      reason: `stripe:${sessionId}`,
    });

    return new Response(JSON.stringify({ success: true, coins: coinsToAdd, new_balance: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
