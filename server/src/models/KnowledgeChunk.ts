import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKnowledgeChunk extends Document {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  embedding: number[];
  chunkIndex: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeChunkSchema = new Schema<IKnowledgeChunk>({
  documentId: { type: Schema.Types.ObjectId, ref: 'KnowledgeDocument', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  chunkIndex: { type: Number, required: true, min: 0 },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

KnowledgeChunkSchema.index({ documentId: 1 });
KnowledgeChunkSchema.index({ userId: 1 });

export default mongoose.model<IKnowledgeChunk>('KnowledgeChunk', KnowledgeChunkSchema);
