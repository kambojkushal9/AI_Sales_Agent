import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  budget?: string;
  requirements?: string;
  purchaseTimeline?: string;
  leadScore: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  buyingIntent: 'high' | 'medium' | 'low' | 'unknown';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  lastInteraction?: Date;
  notes?: string;
  qualificationData?: Record<string, any>;
  source?: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  industry: { type: String, trim: true },
  budget: { type: String, trim: true },
  requirements: { type: String },
  purchaseTimeline: { type: String, trim: true },
  leadScore: { type: Number, default: 0, min: 0, max: 100 },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'unknown'],
    default: 'unknown',
  },
  buyingIntent: {
    type: String,
    enum: ['high', 'medium', 'low', 'unknown'],
    default: 'unknown',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'],
    default: 'new',
  },
  lastInteraction: { type: Date },
  notes: { type: String },
  qualificationData: { type: Schema.Types.Mixed },
  source: { type: String, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

LeadSchema.index({ status: 1 });
LeadSchema.index({ leadScore: 1 });
LeadSchema.index({ userId: 1 });

export default mongoose.model<ILead>('Lead', LeadSchema);
