import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // En cas d'erreur de config, on laisse passer l'image (fail-open)
      return new Response(
        JSON.stringify({ safe: true, reason: "Moderation unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing image for moderation:", imageUrl.substring(0, 100) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un modérateur de contenu pour une marketplace. Analyse l'image et détermine si elle est appropriée pour une annonce de vente.

CONTENUS INTERDITS (répondre "unsafe"):
- Nudité ou contenu sexuel/pornographique
- Violence graphique, sang, gore
- Armes à feu, couteaux de combat, armes blanches
- Drogues, substances illicites, accessoires de drogue
- Symboles haineux, racistes ou discriminatoires
- Contenu terroriste ou extrémiste
- Documents d'identité, cartes bancaires
- Contenu impliquant des mineurs de manière inappropriée

CONTENUS AUTORISÉS:
- Produits de consommation courante
- Vêtements, accessoires, bijoux
- Électronique, meubles, décoration
- Véhicules, pièces automobiles
- Outils, équipements de bricolage
- Nourriture, produits alimentaires
- Animaux de compagnie (photos appropriées)
- Art, livres, médias
- Tout objet légal à vendre

Réponds UNIQUEMENT avec un JSON valide:
{"safe": true} ou {"safe": false, "reason": "brève explication en français"}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyse cette image pour modération:"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ safe: true, reason: "Rate limit - modération différée" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ safe: true, reason: "Quota exceeded - modération différée" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Fail-open pour ne pas bloquer les utilisateurs
      return new Response(
        JSON.stringify({ safe: true, reason: "Moderation service unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI moderation response:", content);

    // Parser la réponse JSON
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      const result = JSON.parse(cleanContent);
      const isSafe = result.safe === true;
      const reason = result.reason || null;
      
      // Log moderation result to database
      try {
        await supabase.from("image_moderation_logs").insert({
          image_url: imageUrl,
          user_id: userId || null,
          is_safe: isSafe,
          reason: reason,
        });
        console.log("Moderation log saved:", isSafe ? "safe" : "unsafe");
      } catch (logError) {
        console.error("Failed to save moderation log:", logError);
      }
      
      return new Response(
        JSON.stringify({
          safe: isSafe,
          reason: reason
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", content);
      
      // Analyse basique du texte en cas d'échec du parsing
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('"safe": false') || lowerContent.includes('"safe":false')) {
        // Log rejected image
        try {
          await supabase.from("image_moderation_logs").insert({
            image_url: imageUrl,
            user_id: userId || null,
            is_safe: false,
            reason: "Contenu potentiellement inapproprié détecté",
          });
        } catch (logError) {
          console.error("Failed to save moderation log:", logError);
        }
        
        return new Response(
          JSON.stringify({ safe: false, reason: "Contenu potentiellement inapproprié détecté" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Par défaut, on laisse passer
      return new Response(
        JSON.stringify({ safe: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Moderation error:", error);
    
    // Fail-open: en cas d'erreur, on laisse passer l'image
    return new Response(
      JSON.stringify({ safe: true, reason: "Error during moderation" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
