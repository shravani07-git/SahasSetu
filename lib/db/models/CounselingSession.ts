import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounselingSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  
  type: 'video' | 'voice' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  scheduledAt: Date;
  duration?: number; // in minutes
  startedAt?: Date;
  endedAt?: Date;
  
  notes?: string; // Encrypted counselor notes
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  
  voiceDistortion: boolean;
  isAnonymous: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const CounselingSessionSchema = new Schema<ICounselingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    counselorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    
    type: { type: String, enum: ['video', 'voice', 'chat'], required: true },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    
    scheduledAt: { type: Date, required: true },
    duration: { type: Number },
    startedAt: { type: Date },
    endedAt: { type: Date },
    
    notes: { type: String },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      submittedAt: { type: Date },
    },
    
    voiceDistortion: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CounselingSessionSchema.index({ userId: 1, status: 1 });
CounselingSessionSchema.index({ counselorId: 1, scheduledAt: 1 });
CounselingSessionSchema.index({ scheduledAt: 1 });

const CounselingSession: Model<ICounselingSession> =
  mongoose.models.CounselingSession ||
  mongoose.model<ICounselingSession>('CounselingSession', CounselingSessionSchema);

export default CounselingSession;
