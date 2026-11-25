import { geminiService, Type } from './gemini';
import { searchKnowledgeBase } from './knowledgeService';
import { calculateLeadQualification } from './qualificationEngine';
import { config } from '../config';
import { Lead, Appointment, Call, ConversationMemory, FollowUp, AgentConfig } from '../models';
import { demoLeads, demoAppointments, demoAgentConfig } from '../utils/demoData';

interface SessionState {
  sessionId: string;
  history: Array<{ role: 'user' | 'model'; content: string }>;
  customerName?: string;
  leadId?: string;
  conversationStage: string;
  sentiment: string;
  buyingIntent: string;
  leadScore: number;
  qualificationProgress: number;
  toolsUsed: string[];
}

const memorySessions = new Map<string, SessionState>();

const toolDeclarations = [
  {
    name: 'search_knowledge_base',
    description: 'Search the company knowledge base for product features, pricing, security, or FAQs. Always call this before answering product-specific questions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search query about the product, pricing, or policy' },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_lead',
    description: 'Create a new lead record in the CRM when a customer shares their name or contact details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Customer full name' },
        email: { type: Type.STRING, description: 'Customer email address' },
        phone: { type: Type.STRING, description: 'Customer phone number' },
        company: { type: Type.STRING, description: 'Company name' },
        requirements: { type: Type.STRING, description: 'Customer business requirements' },
        budget: { type: Type.STRING, description: 'Stated budget' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_lead',
    description: 'Update an existing lead with newly discovered budget, timeline, requirements, or status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        leadId: { type: Type.STRING, description: 'Lead ID to update' },
        budget: { type: Type.STRING },
        purchaseTimeline: { type: Type.STRING },
        requirements: { type: Type.STRING },
        status: { type: Type.STRING, description: 'new | contacted | qualified | proposal | converted | lost' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'calculate_lead_score',
    description: 'Evaluate the current conversation and compute a 0-100 lead qualification score.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        leadId: { type: Type.STRING, description: 'Optional lead ID' },
      },
    },
  },
  {
    name: 'check_appointment_availability',
    description: 'Check available appointment time slots for a specific date (YYYY-MM-DD).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
      },
      required: ['date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Book a sales demo or consultation appointment for the customer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING },
        customerEmail: { type: Type.STRING },
        date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
        startTime: { type: Type.STRING, description: 'Start time e.g. 10:00' },
        title: { type: Type.STRING, description: 'Meeting title' },
        meetingType: { type: Type.STRING, description: 'demo | consultation | followup | closing' },
      },
      required: ['customerName', 'date', 'startTime', 'title'],
    },
  },
  {
    name: 'create_follow_up',
    description: 'Create a follow-up task for the sales team.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'Follow-up action description' },
        priority: { type: Type.STRING, description: 'high | medium | low' },
      },
      required: ['action'],
    },
  },
  {
    name: 'get_customer_history',
    description: 'Retrieve prior CRM interactions for a customer by email or name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Customer email or name' },
      },
      required: ['query'],
    },
  },
  {
    name: 'mark_lead_qualified',
    description: 'Mark a lead as qualified once budget, timeline, and requirements are confirmed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        leadId: { type: Type.STRING },
        notes: { type: Type.STRING },
      },
      required: ['leadId'],
    },
  },
];

async function executeTool(
  name: string,
  args: Record<string, any>,
  userId: string,
  session: SessionState
): Promise<any> {
  session.toolsUsed.push(name);

  try {
    switch (name) {
      case 'search_knowledge_base': {
        const results = await searchKnowledgeBase(args.query || '', userId, 3);
        return {
          found: results.length > 0,
          results: results.map((r) => ({ title: r.title, content: r.content, relevance: r.score })),
        };
      }

      case 'create_lead': {
        if (!config.dbConnected) {
          const newLead = {
            _id: `lead-${Date.now()}`,
            name: args.name,
            email: args.email || `${args.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: args.phone || '',
            company: args.company || '',
            requirements: args.requirements || '',
            budget: args.budget || '',
            leadScore: session.leadScore || 50,
            sentiment: session.sentiment || 'positive',
            buyingIntent: session.buyingIntent || 'medium',
            status: 'contacted',
            source: 'AI Agent Call',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          demoLeads.unshift(newLead);
          session.leadId = newLead._id;
          session.customerName = args.name;
          return { success: true, leadId: newLead._id, message: `Lead created for ${args.name}` };
        }
        const lead = await Lead.create({
          userId,
          name: args.name,
          email: args.email || `${args.name.toLowerCase().replace(/\s+/g, '.')}@prospect.ai`,
          phone: args.phone,
          company: args.company,
          requirements: args.requirements,
          budget: args.budget,
          status: 'contacted',
          source: 'AI Agent Call',
          lastInteraction: new Date(),
        });
        session.leadId = String(lead._id);
        session.customerName = args.name;
        return { success: true, leadId: String(lead._id), message: `Lead created for ${args.name}` };
      }

      case 'update_lead': {
        const targetId = args.leadId || session.leadId;
        if (!targetId) return { success: false, error: 'No lead ID available yet' };
        if (!config.dbConnected) {
          const idx = demoLeads.findIndex((l) => l._id === targetId);
          if (idx !== -1) {
            demoLeads[idx] = { ...demoLeads[idx], ...args, updatedAt: new Date().toISOString() };
          }
          return { success: true, leadId: targetId };
        }
        await Lead.findOneAndUpdate({ _id: targetId, userId }, { ...args, lastInteraction: new Date() });
        return { success: true, leadId: targetId };
      }

      case 'calculate_lead_score': {
        const transcriptText = session.history.map((h) => `${h.role}: ${h.content}`).join('\n');
        const qual = await calculateLeadQualification(transcriptText);
        session.leadScore = qual.lead_score;
        session.sentiment = qual.sentiment.toLowerCase();
        session.buyingIntent = qual.buying_intent.toLowerCase();
        session.qualificationProgress = Math.min(100, Math.max(25, qual.lead_score));
        return qual;
      }

      case 'check_appointment_availability': {
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        const targetDate = args.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const booked = demoAppointments
          .filter((a) => String(a.date).startsWith(targetDate) && a.status !== 'cancelled')
          .map((a) => a.startTime);
        const availableSlots = allSlots.filter((s) => !booked.includes(s));
        return { date: targetDate, availableSlots };
      }

      case 'book_appointment': {
        const startTime = args.startTime || '10:00';
        const [h, m] = startTime.split(':').map(Number);
        const endHour = m + 30 >= 60 ? h + 1 : h;
        const endMin = (m + 30) % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        if (!config.dbConnected) {
          const apt = {
            _id: `apt-${Date.now()}`,
            leadId: session.leadId || 'lead-1',
            title: args.title || `Product Demo - ${args.customerName}`,
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            date: new Date(args.date || Date.now() + 86400000).toISOString(),
            startTime,
            endTime,
            duration: 30,
            status: 'scheduled',
            meetingType: args.meetingType || 'demo',
            createdByAgent: true,
            createdAt: new Date().toISOString(),
          };
          demoAppointments.unshift(apt);
          session.conversationStage = 'Closing';
          return { success: true, appointment: apt };
        }

        const leadId = session.leadId || (await Lead.findOne({ userId }))?._id;
        if (!leadId) {
          const created = await Lead.create({
            userId,
            name: args.customerName,
            email: args.customerEmail || 'prospect@echosales.ai',
            status: 'qualified',
          });
          session.leadId = String(created._id);
        }

        const apt = await Appointment.create({
          leadId: session.leadId,
          userId,
          title: args.title || `Product Demo - ${args.customerName}`,
          customerName: args.customerName,
          customerEmail: args.customerEmail,
          date: new Date(args.date || Date.now() + 86400000),
          startTime,
          endTime,
          duration: 30,
          status: 'scheduled',
          meetingType: args.meetingType || 'demo',
          createdByAgent: true,
        });
        session.conversationStage = 'Closing';
        return { success: true, appointmentId: String(apt._id), date: args.date, startTime };
      }

      case 'create_follow_up': {
        if (config.dbConnected && session.leadId) {
          await FollowUp.create({
            leadId: session.leadId,
            userId,
            action: args.action,
            dueDate: new Date(Date.now() + 86400000 * 2),
            priority: args.priority || 'medium',
            createdByAgent: true,
          });
        }
        return { success: true, action: args.action };
      }

      case 'get_customer_history': {
        const q = (args.query || '').toLowerCase();
        const found = demoLeads.find(
          (l) => l.name.toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q)
        );
        return found ? { found: true, lead: found } : { found: false };
      }

      case 'mark_lead_qualified': {
        const targetId = args.leadId || session.leadId;
        if (targetId && !config.dbConnected) {
          const idx = demoLeads.findIndex((l) => l._id === targetId);
          if (idx !== -1) demoLeads[idx].status = 'qualified';
        } else if (targetId && config.dbConnected) {
          await Lead.findOneAndUpdate({ _id: targetId, userId }, { status: 'qualified', notes: args.notes });
        }
        session.conversationStage = 'Proposal';
        return { success: true, status: 'qualified' };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function initializeAgentSession(sessionId: string, userId: string, language = 'en') {
  let agentCfg: any = demoAgentConfig;
  if (config.dbConnected) {
    const dbCfg = await AgentConfig.findOne({ userId }).lean();
    if (dbCfg) agentCfg = dbCfg;
  }

  const session: SessionState = {
    sessionId,
    history: [],
    conversationStage: 'Introduction',
    sentiment: 'neutral',
    buyingIntent: 'medium',
    leadScore: 35,
    qualificationProgress: 20,
    toolsUsed: [],
  };
  memorySessions.set(sessionId, session);

  let greeting = agentCfg.greeting || demoAgentConfig.greeting;
  if (language === 'hi') {
    greeting = 'नमस्ते! मैं EchoSales AI से एरिया बोल रही हूँ। आज मैं आपकी सेल्स टीम की किस प्रकार सहायता कर सकती हूँ?';
  } else if (language === 'hi-en') {
    greeting = 'Namaste! Main Aria hoon EchoSales AI se. Aaj main aapki sales pipeline badhane me kaise help kar sakti hoon?';
  }

  return {
    sessionId,
    greeting,
    agentName: agentCfg.agentName || 'Aria (EchoSales AI)',
    state: {
      conversationStage: session.conversationStage,
      sentiment: session.sentiment,
      buyingIntent: session.buyingIntent,
      leadScore: session.leadScore,
      qualificationProgress: session.qualificationProgress,
    },
  };
}

export async function processAgentMessage(params: {
  sessionId: string;
  userId: string;
  message: string;
  language?: string;
}) {
  const { sessionId, userId, message, language = 'en' } = params;

  let session = memorySessions.get(sessionId);
  if (!session) {
    await initializeAgentSession(sessionId, userId);
    session = memorySessions.get(sessionId)!;
  }

  session.history.push({ role: 'user', content: message });

  // Retrieve relevant RAG context proactively
  const kbResults = await searchKnowledgeBase(message, userId, 3);
  const kbContext = kbResults
    .map((r) => `[Source: ${r.title}] ${r.content}`)
    .join('\n\n');

  let agentCfg: any = demoAgentConfig;
  if (config.dbConnected) {
    const dbCfg = await AgentConfig.findOne({ userId }).lean();
    if (dbCfg) agentCfg = dbCfg;
  }

  const langInstruction =
    language === 'hi'
      ? 'CRITICAL LANGUAGE RULE: You MUST respond ONLY in natural, polite Hindi using Devanagari script (e.g., "नमस्ते, मैं आपकी कैसे मदद कर सकती हूँ?"). Never reply in English even if the user uses English words.'
      : language === 'hi-en'
      ? 'CRITICAL LANGUAGE RULE: You MUST respond in natural conversational Hinglish (Hindi words written in Roman/Latin script mixed with English, e.g., "Bilkul! Main aapki poori help kar sakti hoon, aap apni requirements batayein."). Do NOT reply in pure English or Devanagari.'
      : 'CRITICAL LANGUAGE RULE: You MUST respond in clear, warm, concise English.';

  const systemInstruction = `You are ${agentCfg.agentName}, an autonomous AI Sales Voice Agent for ${agentCfg.companyName}.
Company description: ${agentCfg.companyDescription}
Sales pitch: ${agentCfg.salesPitch}
Objection handling: ${agentCfg.objectionHandling}

Rules:
1. Talk naturally like a sharp, empathetic human sales consultant. Directly address the customer's exact numbers, goals, and questions (e.g., revenue targets, team size, timeline) with concrete, actionable recommendations.
2. Keep responses concise (2-4 sentences) and natural for voice playback, ending with one relevant follow-up question when appropriate.
3. ${langInstruction}
4. Never repeat the same question or phrasing you already used earlier in the conversation.
5. Never invent pricing, discounts, or policies. Use the Knowledge Base context below or call search_knowledge_base.
6. Use tools autonomously when appropriate (create_lead when customer gives name/email, check_appointment_availability & book_appointment when they want a demo, calculate_lead_score as you learn more).

Retrieved Knowledge Base Context:
${kbContext || 'No matching documents found.'}`;

  const contents: any[] = session.history.map((h) => ({
    role: h.role,
    parts: [{ text: h.content }],
  }));

  const toolsUsedThisTurn: string[] = kbResults.length > 0 ? ['search_knowledge_base'] : [];
  let finalText = '';

  // Only attach function-calling tools when the customer message involves CRM/booking/qualification actions;
  // otherwise use fast direct Gemini chat for natural, low-latency human sales conversation.
  const lowerForTools = message.toLowerCase();
  const needsActionTools =
    /\b(book|schedule|demo|appointment|slot|meeting|calendar|email|phone|call me|my name|i am |i'm |budget|qualify)\b/.test(
      lowerForTools
    );

  const activeTools = needsActionTools
    ? toolDeclarations.filter((t) => t.name !== 'search_knowledge_base')
    : [];
  const maxIterations = activeTools.length > 0 ? 2 : 1;

  for (let i = 0; i < maxIterations; i++) {
    const res = await geminiService.chatWithTools(contents, activeTools, systemInstruction, language);

    if (res.functionCalls && res.functionCalls.length > 0) {
      contents.push({
        role: 'model',
        parts: res.rawParts || res.functionCalls.map((fc) => ({ functionCall: fc })),
      });

      const functionResponseParts: any[] = [];
      for (const fc of res.functionCalls) {
        toolsUsedThisTurn.push(fc.name);
        const result = await executeTool(fc.name, fc.args, userId, session);
        functionResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: { result },
          },
        });
      }
      contents.push({ role: 'user', parts: functionResponseParts });
    } else {
      finalText = res.text || 'Could you tell me a bit more about your requirements?';
      break;
    }
  }

  if (!finalText) {
    finalText = 'I have updated your details. How would you like to proceed?';
  }

  session.history.push({ role: 'model', content: finalText });

  // Update stage progression heuristically based on turns & tools
  const turnCount = session.history.filter((h) => h.role === 'user').length;
  if (toolsUsedThisTurn.includes('book_appointment')) {
    session.conversationStage = 'Closing';
  } else if (turnCount >= 4 || session.leadScore >= 75) {
    session.conversationStage = 'Proposal';
  } else if (turnCount >= 2) {
    session.conversationStage = 'Qualification';
  } else {
    session.conversationStage = 'Discovery';
  }

  // Lightweight sentiment & intent update if not already scored by tool
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('great') || lowerMsg.includes('interested') || lowerMsg.includes('demo') || lowerMsg.includes('yes')) {
    session.sentiment = 'positive';
    session.buyingIntent = 'high';
    session.leadScore = Math.min(95, Math.max(session.leadScore, 70 + turnCount * 5));
    session.qualificationProgress = Math.min(100, 30 + turnCount * 15);
  } else if (lowerMsg.includes('expensive') || lowerMsg.includes('not sure') || lowerMsg.includes('no')) {
    session.sentiment = 'neutral';
  } else {
    session.leadScore = Math.min(90, Math.max(session.leadScore, 40 + turnCount * 8));
    session.qualificationProgress = Math.min(100, 20 + turnCount * 15);
  }

  // Persist conversation memory in MongoDB if connected
  if (config.dbConnected) {
    ConversationMemory.findOneAndUpdate(
      { sessionId, userId },
      {
        sessionId,
        userId,
        customerName: session.customerName,
        shortTermMemory: {
          conversationHistory: session.history.slice(-20).map((h) => ({
            role: h.role === 'model' ? 'agent' : 'customer',
            content: h.content,
            timestamp: new Date(),
          })),
          currentIntent: session.buyingIntent,
          conversationStage: session.conversationStage,
          recentQuestions: session.history.filter((h) => h.role === 'user').slice(-3).map((h) => h.content),
        },
      },
      { upsert: true, new: true }
    ).catch((err) => console.error('Memory save error:', err.message));
  }

  return {
    response: finalText,
    sentiment: session.sentiment,
    buyingIntent: session.buyingIntent,
    conversationStage: session.conversationStage,
    leadScore: session.leadScore,
    qualificationProgress: session.qualificationProgress,
    toolsUsed: toolsUsedThisTurn,
    sources: kbResults.slice(0, 2).map((r) => ({ title: r.title, score: r.score })),
  };
}
