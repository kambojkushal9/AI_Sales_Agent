import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFollowUp extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  callId?: Types.ObjectId;
  action: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdByAgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  callId: { type: Schema.Types.ObjectId, ref: 'Call' },
  action: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: { type: String },
  createdByAgent: { type: Boolean, default: false },
}, { timestamps: true });

FollowUpSchema.index({ userId: 1 });
FollowUpSchema.index({ status: 1 });
FollowUpSchema.index({ dueDate: 1 });

export default mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
