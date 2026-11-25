import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITranscriptEntry {
  role: 'agent' | 'customer';
  content: string;
  timestamp: Date;
}

export interface ICall extends Document {
  leadId?: Types.ObjectId;
  userId: Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  duration: number;
  status: 'active' | 'completed' | 'missed' | 'failed';
  sentiment?: string;
  buyingIntent?: string;
  leadScore?: number;
  outcome?: string;
  transcript: ITranscriptEntry[];
  summary?: Record<string, any>;
  language: string;
  conversationStage?: string;
  qualificationData?: Record<string, any>;
  followUpActions: string[];
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptEntrySchema = new Schema<ITranscriptEntry>({
  role: { type: String, enum: ['agent', 'customer'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const CallSchema = new Schema<ICall>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, trim: true },
  duration: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['active', 'completed', 'missed', 'failed'],
    default: 'active',
  },
  sentiment: { type: String, trim: true },
  buyingIntent: { type: String, trim: true },
  leadScore: { type: Number, min: 0, max: 100 },
  outcome: { type: String, trim: true },
  transcript: { type: [TranscriptEntrySchema], default: [] },
  summary: { type: Schema.Types.Mixed },
  language: { type: String, default: 'en', trim: true },
  conversationStage: { type: String, trim: true },
  qualificationData: { type: Schema.Types.Mixed },
  followUpActions: { type: [String], default: [] },
  recordingUrl: { type: String, trim: true },
}, { timestamps: true });

CallSchema.index({ userId: 1 });
CallSchema.index({ status: 1 });
CallSchema.index({ createdAt: 1 });

export default mongoose.model<ICall>('Call', CallSchema);
