import mongoose from 'mongoose';
import { Lead, Call, Appointment, KnowledgeDocument, KnowledgeChunk, AgentConfig } from '../models';
import { demoLeads, demoCalls, demoAppointments, demoKnowledgeDocs, demoAgentConfig } from './demoData';
import { chunkText } from '../services/knowledgeService';
import { geminiService } from '../services/gemini';

const DEMO_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001');

export async function seedDatabaseIfEmpty() {
  try {
    const leadCount = await Lead.countDocuments({ userId: DEMO_USER_ID });
    if (leadCount === 0) {
      const createdLeads = await Lead.insertMany(
        demoLeads.map(({ _id, ...rest }) => ({ ...rest, userId: DEMO_USER_ID }))
      );
      const firstLeadId = createdLeads[0]?._id;

      await Call.insertMany(
        demoCalls.map(({ _id, leadId, ...rest }) => ({
          ...rest,
          leadId: firstLeadId,
          userId: DEMO_USER_ID,
        }))
      );

      if (firstLeadId) {
        await Appointment.insertMany(
          demoAppointments.map(({ _id, leadId, ...rest }) => ({
            ...rest,
            leadId: firstLeadId,
            userId: DEMO_USER_ID,
          }))
        );
      }
      console.log('🌱 Seeded initial demo Leads, Calls, and Appointments into MongoDB');
    }

    const docCount = await KnowledgeDocument.countDocuments({ userId: DEMO_USER_ID });
    if (docCount === 0) {
      for (const d of demoKnowledgeDocs) {
        const chunks = chunkText(d.content);
        const doc = await KnowledgeDocument.create({
          userId: DEMO_USER_ID,
          title: d.title,
          content: d.content,
          type: d.type,
          originalFilename: d.originalFilename,
          fileSize: d.fileSize,
          chunkCount: chunks.length,
          status: 'ready',
        });
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await geminiService.embed(chunks[i]);
          await KnowledgeChunk.create({
            documentId: doc._id,
            userId: DEMO_USER_ID,
            content: chunks[i],
            embedding,
            chunkIndex: i,
            metadata: { title: d.title, type: d.type },
          });
        }
      }
      console.log('🌱 Seeded initial RAG Knowledge Base documents into MongoDB');
    }

    const cfgCount = await AgentConfig.countDocuments({ userId: DEMO_USER_ID });
    if (cfgCount === 0) {
      const { _id, ...restCfg } = demoAgentConfig;
      await AgentConfig.create({ ...restCfg, userId: DEMO_USER_ID });
    }
  } catch (err: any) {
    console.warn('Seed warning:', err.message);
  }
}
