import OpenAI from "openai";

// LLM provider abstraction - can swap between OpenAI, Anthropic, Groq, etc.
const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
});

const SYSTEM_PROMPT = `
You are an insurance claims intake assistant.
Extract structured data from the user's claim description.
Return ONLY valid JSON matching this schema:

{
  "claimType": "string (e.g. Auto, Home, Health, Travel)",
  "incidentDate": "YYYY-MM-DD or null",
  "summary": "1-2 sentence summary",
  "priority": "Low | Medium | High",
  "riskScore": number between 0 and 100
}

Rules:
- Do not invent dates. If not provided, use null.
- Base priority on severity and urgency.
- Base riskScore on likelihood of fraud or complexity.
- No extra text. JSON only.
`;

export interface ClaimResult {
  claimType: string;
  incidentDate: string | null;
  summary: string;
  priority: "Low" | "Medium" | "High";
  riskScore: number;
}

/**
 * Extracts structured claim data from unstructured text using an LLM.
 *
 * Design principles:
 * - Treats LLM output as untrusted by default
 * - Validates against a strict schema before use
 * - Gracefully falls back if the LLM fails
 * - Uses low temperature for deterministic results
 */
export async function extractClaimData(
  userText: string
): Promise<ClaimResult | { error: true; message: string }> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error("Empty LLM response");

    return validateClaim(JSON.parse(raw));
  } catch (err: any) {
    console.error("LLM error:", err.message);
    return { error: true, message: "LLM unavailable" };
  }
}

/**
 * Validates LLM output against expected schema.
 * Rejects malformed data before it reaches the database.
 */
function validateClaim(data: any): ClaimResult {
  const required = ["claimType", "summary", "priority", "riskScore"];

  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  if (!["Low", "Medium", "High"].includes(data.priority)) {
    data.priority = "Medium";
  }

  if (typeof data.riskScore !== "number") {
    data.riskScore = 50;
  }

  return data as ClaimResult;
}
