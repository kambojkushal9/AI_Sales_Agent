import { config } from '../config';
import { KnowledgeDocument, KnowledgeChunk } from '../models';
import { geminiService } from './gemini';
import { demoKnowledgeDocs } from '../utils/demoData';

export function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    chunks.push(cleaned.slice(start, end).trim());
    if (end >= cleaned.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// In-memory store for demo mode when MongoDB is unavailable
const memoryDocs: any[] = [...demoKnowledgeDocs];
const memoryChunks: Array<{ documentId: string; title: string; content: string; embedding: number[] }> = [];

async function ensureDemoChunks() {
  if (memoryChunks.length > 0) return;
  for (const doc of memoryDocs) {
    const parts = chunkText(doc.content);
    for (const part of parts) {
      const embedding = await geminiService.embed(part);
      memoryChunks.push({
        documentId: doc._id,
        title: doc.title,
        content: part,
        embedding,
      });
    }
  }
}

export async function processAndStoreDocument(params: {
  userId: string;
  title: string;
  content: string;
  type: 'pdf' | 'txt' | 'md' | 'manual';
  originalFilename?: string;
  fileSize?: number;
}) {
  const chunks = chunkText(params.content);

  if (!config.dbConnected) {
    const newDoc = {
      _id: `doc-${Date.now()}`,
      title: params.title,
      content: params.content,
      type: params.type,
      originalFilename: params.originalFilename,
      fileSize: params.fileSize || params.content.length,
      chunkCount: chunks.length,
      status: 'ready',
      createdAt: new Date().toISOString(),
    };
    memoryDocs.unshift(newDoc);
    for (const part of chunks) {
      const embedding = await geminiService.embed(part);
      memoryChunks.push({
        documentId: newDoc._id,
        title: newDoc.title,
        content: part,
        embedding,
      });
    }
    return newDoc;
  }

  const doc = await KnowledgeDocument.create({
    userId: params.userId,
    title: params.title,
    content: params.content,
    type: params.type,
    originalFilename: params.originalFilename,
    fileSize: params.fileSize || params.content.length,
    chunkCount: chunks.length,
    status: 'processing',
  });

  try {
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await geminiService.embed(chunks[i]);
      await KnowledgeChunk.create({
        documentId: doc._id,
        userId: params.userId,
        content: chunks[i],
        embedding,
        chunkIndex: i,
        metadata: { title: params.title, type: params.type },
      });
    }
    doc.status = 'ready';
    await doc.save();
  } catch (err: any) {
    doc.status = 'error';
    doc.errorMessage = err.message;
    await doc.save();
  }

  return doc;
}

export async function listDocuments(userId: string) {
  if (!config.dbConnected) {
    return memoryDocs;
  }
  return KnowledgeDocument.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function deleteDocument(docId: string, userId: string) {
  if (!config.dbConnected) {
    const idx = memoryDocs.findIndex((d) => d._id === docId);
    if (idx !== -1) memoryDocs.splice(idx, 1);
    for (let i = memoryChunks.length - 1; i >= 0; i--) {
      if (memoryChunks[i].documentId === docId) memoryChunks.splice(i, 1);
    }
    return true;
  }
  await KnowledgeChunk.deleteMany({ documentId: docId, userId });
  await KnowledgeDocument.findOneAndDelete({ _id: docId, userId });
  return true;
}

export async function searchKnowledgeBase(query: string, userId: string, topK = 4) {
  const queryEmbedding = await geminiService.embed(query);

  if (!config.dbConnected) {
    await ensureDemoChunks();
    const scored = memoryChunks.map((c) => {
      const sim = cosineSimilarity(queryEmbedding, c.embedding);
      const keywordBoost = c.content.toLowerCase().includes(query.toLowerCase()) ? 0.25 : 0;
      return {
        documentId: c.documentId,
        title: c.title,
        content: c.content,
        score: Math.min(1, Number((sim + keywordBoost).toFixed(3))),
      };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  const chunks = await KnowledgeChunk.find({ userId }).lean();
  if (chunks.length === 0) {
    await ensureDemoChunks();
    return memoryChunks
      .map((c) => ({
        documentId: c.documentId,
        title: c.title,
        content: c.content,
        score: Number(cosineSimilarity(queryEmbedding, c.embedding).toFixed(3)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  const scored = chunks.map((c: any) => {
    const sim = cosineSimilarity(queryEmbedding, c.embedding || []);
    const keywordBoost = c.content.toLowerCase().includes(query.toLowerCase()) ? 0.25 : 0;
    return {
      documentId: String(c.documentId),
      title: c.metadata?.title || 'Knowledge Document',
      content: c.content,
      score: Math.min(1, Number((sim + keywordBoost).toFixed(3))),
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
