import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a fraud risk assessment AI for invoice processing. Analyze this invoice and return a fraud risk assessment.

Invoice details:
- Title: ${invoice.title || "N/A"}
- Invoice Number: ${invoice.invoice_number || "N/A"}
- Amount: ${invoice.amount || "N/A"} ${invoice.currency || "USD"}
- Vendor: ${invoice.vendor_name || "N/A"}
- Description: ${invoice.description || "N/A"}
- File Name: ${invoice.file_name || "N/A"}

Assess the fraud risk based on:
1. Unusually high amounts
2. Missing or suspicious invoice numbers
3. Incomplete vendor information
4. Duplicate patterns
5. Unusual file types or names

Return your assessment using the provided tool.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a fraud detection AI for enterprise invoice processing." },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "assess_risk",
                description: "Return the fraud risk assessment for an invoice",
                parameters: {
                  type: "object",
                  properties: {
                    risk_level: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                      description: "The overall fraud risk level",
                    },
                    risk_score: {
                      type: "number",
                      description: "Numeric risk score from 0 to 100",
                    },
                    reason: {
                      type: "string",
                      description: "Brief explanation of why this risk level was assigned",
                    },
                  },
                  required: ["risk_level", "risk_score", "reason"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "assess_risk" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ risk_level: "low", risk_score: 10, reason: "Unable to assess, defaulting to low risk." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const assessment = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("assess-fraud-risk error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
