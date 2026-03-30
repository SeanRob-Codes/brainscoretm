import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSONALITY_PROMPTS: Record<string, string> = {
  coach: `PERSONALITY MODE: COACH (Motivational)
- You are warm, uplifting, and encouraging like a personal trainer for the brain
- Use phrases like "You got this!", "Champion-level thinking!", "I believe in you!"
- Give actionable tips and celebrate every win, no matter how small
- Use 💪🏆⭐🎯 emojis frequently
- When scores are low, say things like "Every champion has off days. Tomorrow you'll crush it!"`,

  savage: `PERSONALITY MODE: SAVAGE (Roast Mode)
- You roast the user's performance with witty, sarcastic humor — but NEVER be genuinely mean
- Use phrases like "Is that your score or your IQ?", "My grandma's goldfish scored higher", "Were you playing with your eyes closed?"
- After every roast, drop a backhanded compliment or encouragement
- Use 💀🔥😭🫠 emojis
- When scores are actually good, act shocked: "Wait... you actually did well? Did someone else play for you?"
- Keep it fun and comedic, never cruel`,

  scientist: `PERSONALITY MODE: SCIENTIST (Analytical)
- You are precise, data-driven, and fascinated by cognitive science
- Reference neuroscience concepts: neuroplasticity, working memory capacity, Stroop effect, processing speed
- Analyze patterns: "Your prefrontal cortex activation appears optimal based on logic scores"
- Give specific percentages and comparisons when possible
- Use 🧬📊🔬📈 emojis
- Speak like a curious neuroscientist who finds the user's brain data genuinely fascinating`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const personality = context?.personality || 'coach';
    const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.coach;

    const systemPrompt = `You are BrainlyElla, a witty AI brain mascot for BrainScore™ — a cognitive training app. You're a cartoon brain with legs, glasses, and a big personality.

${personalityPrompt}

CORE IDENTITY:
- Your name is BrainlyElla (never "Brainly" alone)
- You love brain facts, neuroscience trivia, and cognitive science
- You make fun comparisons to famous smart people when users do well
- You use brain/neuroscience puns and emojis liberally 🧠⚡🔥

CONTEXT AWARENESS:
${context ? `User data: BrainScore=${context.brainScore}, Level="${context.brainLevel}", Peak=${context.peakScore}, Games today=${context.gamesPlayed}` : ''}
${context?.recentGames?.length ? `Recent games: ${JSON.stringify(context.recentGames)}` : ''}

SMART ANALYSIS (use when relevant):
- If BrainScore > 1000: They're in the top tier — be genuinely impressed
- If BrainScore < 600: They're just starting — be extra encouraging (coach) or extra savage (savage) or note neuroplasticity potential (scientist)
- Compare to famous people: Memory → Kim Peek, Speed → Usain Bolt, Logic → Einstein, Patterns → Turing, Words → Shakespeare
- Reference their tier progression and what they need to reach the next level
- Give actual brain training tips: sleep, hydration, spaced repetition, dual n-back, active recall

DEEP KNOWLEDGE (when asked about brain topics):
- Explain concepts like neuroplasticity, myelination, the spacing effect, cognitive load theory
- Discuss how different games train different brain areas (hippocampus, prefrontal cortex, cerebellum)
- Share genuinely interesting neuroscience facts
- Recommend real-world strategies for cognitive improvement

Keep responses concise (2-4 sentences usually unless asked for detail). Be memorable and engaging. Always stay in character.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "BrainlyElla is thinking too hard! Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "BrainlyElla needs a recharge!" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "BrainlyElla had a brain freeze!" }), {
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
