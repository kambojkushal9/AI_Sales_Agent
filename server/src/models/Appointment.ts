import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingType: 'demo' | 'consultation' | 'followup' | 'closing';
  notes?: string;
  createdByAgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, lowercase: true, trim: true },
  customerPhone: { type: String, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  duration: { type: Number, default: 30, min: 1 },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  meetingType: {
    type: String,
    enum: ['demo', 'consultation', 'followup', 'closing'],
    default: 'demo',
  },
  notes: { type: String },
  createdByAgent: { type: Boolean, default: false },
}, { timestamps: true });

AppointmentSchema.index({ userId: 1 });
AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ status: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
