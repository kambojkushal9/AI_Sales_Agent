import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

class GeminiService {
  private client: GoogleGenAI | null = null;
  private model: string;
  private embeddingModel: string;
  private isAvailable = false;

  constructor() {
    this.model = config.geminiModel;
    this.embeddingModel = config.geminiEmbeddingModel;

    if (config.geminiApiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
        this.isAvailable = true;
        console.log(`✅ Gemini AI initialized (model: ${this.model})`);
      } catch (error) {
        console.error('Failed to initialize Gemini SDK:', error);
      }
    } else {
      console.warn('⚠️  No GEMINI_API_KEY configured — AI features running in Demo Mode');
    }
  }

  get available(): boolean {
    return this.isAvailable && this.client !== null;
  }

  get currentModel(): string {
    return this.model;
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  private async generateWithRetry(params: any): Promise<any> {
    if (!this.client) throw new Error('Gemini client not initialized');
    const candidates = Array.from(
      new Set([params.model || this.model, 'gemini-3.5-flash-lite', 'gemini-3.5-flash'])
    );
    let lastErr: any;
    for (const modelName of candidates) {
      try {
        return await this.withTimeout(
          this.client.models.generateContent({ ...params, model: modelName }),
          12000,
          `Gemini ${modelName}`
        );
      } catch (err: any) {
        lastErr = err;
        // try next fallback model immediately
      }
    }
    throw lastErr;
  }

  async chat(messages: ChatMessage[], systemInstruction?: string): Promise<string> {
    if (!this.client) return this.demoChatResponse(messages);

    try {
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await this.generateWithRetry({
        model: this.model,
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      return response.text || 'I apologize, I could not generate a response right now.';
    } catch (error: any) {
      console.error('Gemini chat error:', error?.message || error);
      return this.demoChatResponse(messages);
    }
  }

  async structuredOutput<T>(prompt: string, systemInstruction?: string): Promise<T> {
    if (!this.client) return this.demoStructuredOutput<T>(prompt);

    try {
      const response = await this.generateWithRetry({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction || undefined,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as T;
    } catch (error: any) {
      console.error('Gemini structuredOutput error:', error?.message || error);
      return this.demoStructuredOutput<T>(prompt);
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) return this.deterministicDemoEmbedding(text);

    try {
      const response = await this.withTimeout(
        this.client.models.embedContent({
          model: this.embeddingModel,
          contents: text,
        }),
        4000,
        'Gemini embed'
      );
      const values = response.embeddings?.[0]?.values;
      if (values && values.length > 0) return values;
      return this.deterministicDemoEmbedding(text);
    } catch (error: any) {
      console.error('Gemini embedding error:', error?.message || error);
      return this.deterministicDemoEmbedding(text);
    }
  }

  async chatWithTools(
    contents: any[],
    functionDeclarations: any[],
    systemInstruction?: string,
    language: string = 'en'
  ): Promise<{ text?: string; functionCalls?: Array<{ name: string; args: Record<string, any> }>; rawParts?: any[] }> {
    if (!this.client) {
      const lastUser = [...contents].reverse().find((c) => c.role === 'user');
      const lastText = lastUser?.parts?.[0]?.text || '';
      return { text: this.demoChatResponse([{ role: 'user', content: lastText }], language) };
    }

    try {
      const response = await this.generateWithRetry({
        model: this.model,
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: 0.7,
          maxOutputTokens: 1024,
          tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      const functionCalls = parts
        .filter((p: any) => p.functionCall)
        .map((p: any) => ({
          name: p.functionCall.name as string,
          args: (p.functionCall.args || {}) as Record<string, any>,
        }));

      if (functionCalls.length > 0) {
        return { functionCalls, rawParts: parts };
      }

      const text = parts
        .map((p: any) => p.text)
        .filter(Boolean)
        .join('')
        .trim();

      return { text: text || response.text || 'How else can I assist you today?' };
    } catch (error: any) {
      console.error('Gemini chatWithTools error:', error?.message || error);
      const lastUser = [...contents].reverse().find((c) => c.role === 'user');
      const lastText = lastUser?.parts?.[0]?.text || '';
      return { text: this.demoChatResponse([{ role: 'user', content: lastText }], language) };
    }
  }

  private demoChatResponse(messages: ChatMessage[], language: string = 'en'): string {
    const last = (messages[messages.length - 1]?.content || '').toLowerCase();
    if (language === 'hi') {
      if (last.includes('price') || last.includes('pricing') || last.includes('कीमत') || last.includes('प्लान') || last.includes('plan')) {
        return 'हमारे पास तीन प्लान हैं: स्टार्टर ₹15,000/माह, ग्रोथ ₹45,000/माह, और एंटरप्राइज ₹1,20,000/माह। आपकी टीम के लिए कौन सा प्लान सही रहेगा?';
      }
      if (last.includes('demo') || last.includes('डेमो') || last.includes('मीटिंग') || last.includes('book')) {
        return 'जी बिल्कुल! मैं आपके लिए लाइव डेमो बुक कर सकता हूँ। कल सुबह 10:00 बजे या दोपहर 3:00 बजे का समय कैसा रहेगा?';
      }
      return 'धन्यवाद! EchoSales AI आपकी सेल्स टीम के लिए 24/7 लीड क्वालिफिकेशन और डेमो बुकिंग में मदद करता है। कृपया अपनी कंपनी और आवश्यकताओं के बारे में बताएं।';
    }
    if (language === 'hi-en') {
      if (last.includes('price') || last.includes('pricing') || last.includes('cost') || last.includes('plan')) {
        return 'Hamare paas 3 plans hain: Starter ₹15,000/month, Growth ₹45,000/month (RAG Knowledge Base aur auto-booking ke saath), aur Enterprise ₹1,20,000/month. Aapki team size ke hisab se kaunsa best rahega?';
      }
      if (last.includes('demo') || last.includes('book') || last.includes('schedule') || last.includes('meeting')) {
        return 'Bilkul! Main aapke liye abhi ek live demo schedule kar sakta hoon. Kal subah 10:00 AM ya dopahar 3:00 PM me se kaunsa time aapko suit karega?';
      }
      return 'Thanks share karne ke liye! EchoSales AI 24/7 aapki leads qualify karta hai aur demos book karta hai. Aap apni team size aur timeline ke baare me thoda batayenge?';
    }
    if (last.includes('price') || last.includes('pricing') || last.includes('cost') || last.includes('plan')) {
      return 'We offer three flexible plans: Starter at ₹15,000/month, Growth at ₹45,000/month (includes full RAG Knowledge Base & autonomous booking), and Enterprise at ₹1,20,000/month. Which tier aligns best with your team size?';
    }
    if (last.includes('demo') || last.includes('book') || last.includes('schedule') || last.includes('meeting')) {
      return 'I would love to schedule a personalized demo for you! I have slots available tomorrow at 10:00 AM, 11:30 AM, and 3:00 PM. Could you share your name, email, and preferred slot?';
    }
    if (last.includes('hindi') || last.includes('hinglish') || last.includes('namaste') || last.includes('kya')) {
      return 'Bilkul! Main English, Hindi aur Hinglish teeno me baat kar sakta hoon. Aap mujhe apni company aur requirements ke baare me batayein, main aapki poori madad karunga.';
    }
    if (last.includes('suggest') || last.includes('increase') || last.includes('lakh') || last.includes('sales') || last.includes('timeline') || last.includes('team')) {
      return 'To double your monthly sales from ₹10L to ₹20L with a 100-person team over 4 months, focus on three steps: 1) Automate instant 24/7 lead qualification so zero inbound leads go cold, 2) Route high-score leads (75+) directly to your top closers with scheduled demos, and 3) Run automated AI follow-ups on stalled proposals. Would you like me to map out how EchoSales AI can deploy this for your 100-member team?';
    }
    return "Got it — I'd love to tailor a concrete plan for your goals. Could you share your biggest current bottleneck, such as lead response time, follow-ups, or demo conversion rate?";
  }

  private demoStructuredOutput<T>(prompt: string): T {
    const lower = prompt.toLowerCase();
    if (lower.includes('lead_score') || lower.includes('qualification')) {
      return {
        lead_score: 76,
        budget: 'Not specified',
        purchase_timeline: 'Within 30-60 days',
        interest_level: 'High',
        sentiment: 'Positive',
        buying_intent: 'Medium',
        qualification_status: 'Qualified',
        main_objection: 'None detected',
        next_action: 'Offer product demo slot',
      } as T;
    }
    if (lower.includes('summary') || lower.includes('summarize')) {
      return {
        summary: 'Customer inquired about EchoSales AI capabilities, pricing, and deployment timeline.',
        painPoints: ['Manual lead follow-up', 'Need for 24/7 qualification'],
        objections: ['Evaluating budget and ROI'],
        buyingSignals: ['Asked about pricing plans', 'Inquired about onboarding time'],
        nextAction: 'Schedule a live product demo',
        sentiment: 'positive',
        buyingIntent: 'medium',
      } as T;
    }
    if (lower.includes('insight')) {
      return {
        salesPerformance: 'Lead qualification rate is trending upward at 48.1% with strong engagement on AI-handled calls.',
        painPoints: ['Manual CRM data entry', 'After-hours missed leads', 'Multilingual customer support'],
        suggestions: ['Enable proactive demo booking earlier in Discovery', 'Upload detailed ROI case studies to Knowledge Base'],
        recommendedActions: ['Follow up with Amit Patel on security review', 'Send Hindi voice sample to HealthPlus'],
      } as T;
    }
    return {} as T;
  }

  private deterministicDemoEmbedding(text: string): number[] {
    const dim = 128;
    const vec = new Array<number>(dim).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);
    for (const w of words) {
      let hash = 0;
      for (let i = 0; i < w.length; i++) {
        hash = (hash * 31 + w.charCodeAt(i)) % dim;
      }
      vec[Math.abs(hash)] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }
}

export { Type };
export const geminiService = new GeminiService();
export default geminiService;
