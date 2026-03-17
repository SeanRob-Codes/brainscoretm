import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Brainly, a witty, encouraging AI brain mascot for BrainScore™ — a cognitive training app. You're a cartoon brain with legs and personality.

PERSONALITY:
- Playful, encouraging, sometimes sassy but never mean
- You love brain facts, neuroscience trivia, and motivational quips
- You make fun comparisons to famous smart people when users do well
- You roast gently when they mess up, but always follow up with encouragement
- You use brain/neuroscience puns and emojis liberally 🧠⚡🔥

CONTEXT AWARENESS:
${context ? `Current user context: ${JSON.stringify(context)}` : ''}
- If user just scored well, hype them up with comparisons like "Your memory rivals Kim Peek!" or "Reaction time like a fighter pilot!"
- If user scored poorly, be encouraging: "Every neuron needs a warm-up! Try again."
- Reference their BrainScore tier and progression
- Give actual brain training tips when asked

COMPARISONS TO USE (when users do well):
- Memory: "You're giving Kim Peek a run for his money!" or "That memory is sharper than a steel trap!"
- Speed: "Usain Bolt wishes his reaction time was this fast! ⚡"
- Logic: "Einstein would approve of that reasoning! 🧪"
- Pattern recognition: "You see patterns like Alan Turing!"
- Word skills: "Shakespeare is jealous of that vocabulary! 📚"
- Overall high score: "Your brain is operating at galaxy-brain levels! 🌌"

Keep responses concise (1-3 sentences usually). Be fun and memorable. Use emojis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Brainly is thinking too hard! Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Brainly needs a recharge!" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Brainly had a brain freeze!" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("brainly-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
