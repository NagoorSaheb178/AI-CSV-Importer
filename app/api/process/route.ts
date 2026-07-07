import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { CRMRecord } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ALLOWED_STATUSES = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const ALLOWED_SOURCES = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];

function buildBatchPrompt(records: Record<string, any>[]): string {
  return `You are a strict data extraction AI. Extract and map the following CSV rows into a JSON array of CRM records.
RULES:
1. Map values to these EXACT keys: name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description.
2. email: Extract the FIRST valid email found.
3. mobile_without_country_code: Extract the FIRST valid phone number (digits only).
4. MULTIPLE EMAILS/PHONES: If the row contains additional emails or phone numbers, YOU MUST APPEND THEM TO the \`crm_note\` field (e.g. "Extra email: test@example.com").
5. country_code: Default to "+91" if not specified.
6. Analyze the lead status intelligently based on the following crm_status values:
   - GOOD_LEAD_FOLLOW_UP: Use only when customer is interested, wants callback, wants demo, asked details, or follow up needed.
   - DID_NOT_CONNECT: Use when call not answered, unreachable, busy, try later, or no response.
   - BAD_LEAD: Use when not interested, wrong number, invalid lead, or rejected.
   - SALE_DONE: Use when deal closed, payment done, booked, or purchased.
   CRITICAL RULE: If the row does NOT contain explicit words matching the above, you MUST set "crm_status": "UNKNOWN_STATUS". Do NOT guess. Do NOT default to GOOD_LEAD_FOLLOW_UP.
7. data_source: MUST be one of [${ALLOWED_SOURCES.join(", ")}]. If unknown, use "".
8. CRITICAL: DO NOT skip any rows! You MUST return an array of objects that has the exact same number of items as the input rows.

OUTPUT ONLY A VALID JSON ARRAY OF OBJECTS (no markdown formatting, no explanations):
[
  { "name": "", "email": "", "mobile_without_country_code": "", "crm_note": "", "crm_status": "", "data_source": "" }
]

INPUT ROWS:
${JSON.stringify(records)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { batch } = await req.json();

    if (!Array.isArray(batch)) {
      return NextResponse.json({ error: "Invalid payload: batch must be an array" }, { status: 400 });
    }

    const prompt = buildBatchPrompt(batch);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_completion_tokens: 4000,
    });

    const rawText = completion.choices[0]?.message?.content || "[]";
    
    let parsed: any = null;
    try {
      const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
       return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

    if (!Array.isArray(parsed)) {
       if (parsed.imported && Array.isArray(parsed.imported)) {
           parsed = parsed.imported;
       } else {
           return NextResponse.json({ error: "AI did not return an array" }, { status: 500 });
       }
    }

    return NextResponse.json({ extracted: parsed }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing batch with Groq:", error);
    return NextResponse.json({ error: error?.message || "Failed to process batch" }, { status: 500 });
  }
}
