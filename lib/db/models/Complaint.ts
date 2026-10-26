import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimelineEntry {
  status: string;
  description: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedByRole?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: string; // Human-readable case ID like CASE-2026-0001
  userId: mongoose.Types.ObjectId;
  isAnonymous: boolean;

  // Incident Details
  incidentDate: Date;
  incidentTime?: string;
  location?: string;
  incidentType: string;
  description: string;
  perpetratorInfo?: string;
  witnesses?: string;
  previousIncidents?: string;

  // Optional ML assistance metadata
  mlClassification?: {
    harassmentType: string;
    severity: string;
    typeConfidence?: number;
    severityConfidence?: number;
    modelVersion?: string;
    classifiedAt: Date;
  };

  // Status & Tracking
  status: 'draft' | 'submitted' | 'under_review' | 'investigation' | 'hearing_scheduled' | 'hearing_in_progress' | 'resolution_pending' | 'resolved' | 'closed' | 'appealed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeline: ITimelineEntry[];

  // Assignment
  assignedCommittee?: mongoose.Types.ObjectId;
  assignedNGO?: mongoose.Types.ObjectId;
  assignedMembers: mongoose.Types.ObjectId[];

  // Deadlines (PoSH Act mandates 90-day resolution)
  submittedAt?: Date;
  resolutionDeadline?: Date;
  nextHearingDate?: Date;

  // Submission settings
  isEncrypted: boolean;
  delayedSubmission: boolean;
  scheduledSubmitDate?: Date;

  // Resolution
  resolution?: string;
  resolutionDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TimelineEntrySchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    description: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedByRole: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    caseId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },

    incidentDate: { type: Date, required: true },
    incidentTime: { type: String },
    location: { type: String },
    incidentType: {
      type: String,
      required: true,
      enum: [
        'verbal', 'physical', 'visual', 'quid_pro_quo',
        'hostile_environment', 'online', 'stalking', 'other',
      ],
    },
    description: { type: String, required: true },
    perpetratorInfo: { type: String },
    witnesses: { type: String },
    previousIncidents: { type: String },

    mlClassification: {
      harassmentType: { type: String },
      severity: { type: String },
      typeConfidence: { type: Number },
      severityConfidence: { type: Number },
      modelVersion: { type: String },
      classifiedAt: { type: Date },
    },

    status: {
      type: String,
      enum: [
        'draft', 'submitted', 'under_review', 'investigation',
        'hearing_scheduled', 'hearing_in_progress', 'resolution_pending',
        'resolved', 'closed', 'appealed', 'escalated',
      ],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    timeline: [TimelineEntrySchema],

    assignedCommittee: { type: Schema.Types.ObjectId, ref: 'Committee' },
    assignedNGO: { type: Schema.Types.ObjectId, ref: 'NGO' },
    assignedMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    submittedAt: { type: Date },
    resolutionDeadline: { type: Date },
    nextHearingDate: { type: Date },

    isEncrypted: { type: Boolean, default: true },
    delayedSubmission: { type: Boolean, default: false },
    scheduledSubmitDate: { type: Date },

    resolution: { type: String },
    resolutionDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes
ComplaintSchema.index({ userId: 1, status: 1 });
ComplaintSchema.index({ status: 1, priority: -1 });
ComplaintSchema.index({ assignedCommittee: 1 });
ComplaintSchema.index({ assignedNGO: 1 });
ComplaintSchema.index({ createdAt: -1 });

// Generate caseId BEFORE validation runs (pre('save') fires after validation in Mongoose 9)
ComplaintSchema.pre('validate', async function () {
  if (this.isNew && !this.caseId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    this.caseId = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Set resolution deadline after status is validated and saved
ComplaintSchema.pre('save', async function () {
  if (this.isModified('status') && this.status === 'submitted' && !this.resolutionDeadline) {
    this.submittedAt = new Date();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 90);
    this.resolutionDeadline = deadline;
  }
});

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
