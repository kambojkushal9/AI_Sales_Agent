import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKnowledgeDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  type: 'pdf' | 'txt' | 'md' | 'manual';
  originalFilename?: string;
  fileSize?: number;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['pdf', 'txt', 'md', 'manual'],
    required: true,
  },
  originalFilename: { type: String, trim: true },
  fileSize: { type: Number, min: 0 },
  chunkCount: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing',
  },
  errorMessage: { type: String },
}, { timestamps: true });

KnowledgeDocumentSchema.index({ userId: 1 });

export default mongoose.model<IKnowledgeDocument>('KnowledgeDocument', KnowledgeDocumentSchema);
