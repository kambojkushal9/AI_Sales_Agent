import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAgentConfig extends Document {
  userId: Types.ObjectId;
  agentName: string;
  companyName?: string;
  companyDescription?: string;
  salesPitch?: string;
  productInfo?: string;
  objectionHandling?: string;
  greeting?: string;
  language: string;
  voiceEnabled: boolean;
  autoQualify: boolean;
  maxToolCalls: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentConfigSchema = new Schema<IAgentConfig>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  agentName: { type: String, default: 'EchoSales AI', trim: true },
  companyName: { type: String, trim: true },
  companyDescription: { type: String },
  salesPitch: { type: String },
  productInfo: { type: String },
  objectionHandling: { type: String },
  greeting: { type: String },
  language: { type: String, default: 'en', trim: true },
  voiceEnabled: { type: Boolean, default: true },
  autoQualify: { type: Boolean, default: true },
  maxToolCalls: { type: Number, default: 10, min: 1 },
}, { timestamps: true });

AgentConfigSchema.index({ userId: 1 });

export default mongoose.model<IAgentConfig>('AgentConfig', AgentConfigSchema);
