import { geminiService } from './gemini';

export interface QualificationResult {
  lead_score: number;
  budget: string;
  purchase_timeline: string;
  interest_level: 'High' | 'Medium' | 'Low';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  buying_intent: 'High' | 'Medium' | 'Low';
  qualification_status: 'Qualified' | 'In Progress' | 'Unqualified';
  main_objection: string;
  next_action: string;
}

export async function calculateLeadQualification(
  transcriptText: string
): Promise<QualificationResult> {
  const prompt = `Analyze the following sales conversation transcript and evaluate the lead strictly based on facts present in the conversation. Do NOT invent missing budget or timeline details — mark them as "Not specified" if absent.

Score breakdown (0 to 100 total):
- Budget fit: up to 20 points
- Purchase timeline: up to 20 points
- Interest level: up to 20 points
- Requirements fit: up to 20 points
- Decision authority: up to 10 points
- Engagement: up to 10 points

Return JSON with exact keys:
{
  "lead_score": number (0-100),
  "budget": string,
  "purchase_timeline": string,
  "interest_level": "High" | "Medium" | "Low",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "buying_intent": "High" | "Medium" | "Low",
  "qualification_status": "Qualified" | "In Progress" | "Unqualified",
  "main_objection": string,
  "next_action": string
}

Transcript:
${transcriptText}`;

  const raw = await geminiService.structuredOutput<Partial<QualificationResult>>(
    prompt,
    'You are an expert B2B sales qualification engine. Always output valid JSON.'
  );

  // Validate and normalize
  const score = typeof raw.lead_score === 'number' ? Math.max(0, Math.min(100, Math.round(raw.lead_score))) : 55;
  return {
    lead_score: score,
    budget: raw.budget || 'Not specified',
    purchase_timeline: raw.purchase_timeline || 'Not specified',
    interest_level: (['High', 'Medium', 'Low'].includes(raw.interest_level || '') ? raw.interest_level : 'Medium') as any,
    sentiment: (['Positive', 'Neutral', 'Negative'].includes(raw.sentiment || '') ? raw.sentiment : 'Neutral') as any,
    buying_intent: (['High', 'Medium', 'Low'].includes(raw.buying_intent || '') ? raw.buying_intent : 'Medium') as any,
    qualification_status: (['Qualified', 'In Progress', 'Unqualified'].includes(raw.qualification_status || '')
      ? raw.qualification_status
      : score >= 70
      ? 'Qualified'
      : 'In Progress') as any,
    main_objection: raw.main_objection || 'None',
    next_action: raw.next_action || 'Continue discovery',
  };
}
