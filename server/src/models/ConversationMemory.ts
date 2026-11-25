import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IShortTermMemory {
  conversationHistory: any[];
  currentIntent?: string;
  conversationStage?: string;
  recentQuestions: string[];
}

export interface ILongTermMemory {
  customerName?: string;
  requirements: string[];
  budget?: string;
  purchaseTimeline?: string;
  productPreferences: string[];
  objections: string[];
  previousInteractions: number;
}

export interface IConversationMemory extends Document {
  leadId?: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: string;
  customerName?: string;
  shortTermMemory: IShortTermMemory;
  longTermMemory: ILongTermMemory;
  createdAt: Date;
  updatedAt: Date;
}

const ShortTermMemorySchema = new Schema<IShortTermMemory>({
  conversationHistory: { type: [Object], default: [] },
  currentIntent: { type: String },
  conversationStage: { type: String },
  recentQuestions: { type: [String], default: [] },
}, { _id: false });

const LongTermMemorySchema = new Schema<ILongTermMemory>({
  customerName: { type: String },
  requirements: { type: [String], default: [] },
  budget: { type: String },
  purchaseTimeline: { type: String },
  productPreferences: { type: [String], default: [] },
  objections: { type: [String], default: [] },
  previousInteractions: { type: Number, default: 0 },
}, { _id: false });

const ConversationMemorySchema = new Schema<IConversationMemory>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  customerName: { type: String, trim: true },
  shortTermMemory: { type: ShortTermMemorySchema, default: () => ({}) },
  longTermMemory: { type: LongTermMemorySchema, default: () => ({}) },
}, { timestamps: true });

ConversationMemorySchema.index({ sessionId: 1 });
ConversationMemorySchema.index({ userId: 1 });

export default mongoose.model<IConversationMemory>('ConversationMemory', ConversationMemorySchema);
