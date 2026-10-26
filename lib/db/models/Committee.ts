import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommitteeMember {
  userId: mongoose.Types.ObjectId;
  role: 'presiding_officer' | 'member' | 'external_member' | 'secretary';
  name: string;
  email: string;
  designation?: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface ICommittee extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: 'ICC' | 'LCC'; // Internal Complaints Committee / Local Complaints Committee
  description?: string;
  
  // Organization
  organizationName: string;
  organizationId?: mongoose.Types.ObjectId;
  
  // Members
  members: ICommitteeMember[];
  
  // Jurisdiction
  district?: string;
  state?: string;
  
  // PoSH Compliance
  constitutedOn: Date;
  validUntil: Date;
  isConstitutedAsPerAct: boolean;
  hasExternalMember: boolean;
  hasWomenMajority: boolean;
  
  // Contact
  email: string;
  phone?: string;
  address?: string;
  
  // Partnership
  partnerNGOs: mongoose.Types.ObjectId[];
  
  // Stats
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  avgResolutionDays: number;
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const CommitteeMemberSchema = new Schema<ICommitteeMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  role: {
    type: String,
    enum: ['presiding_officer', 'member', 'external_member', 'secretary'],
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  designation: { type: String },
  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const CommitteeSchema = new Schema<ICommittee>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['ICC', 'LCC'], required: true },
    description: { type: String },
    
    organizationName: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId },
    
    members: [CommitteeMemberSchema],
    
    district: { type: String },
    state: { type: String },
    
    constitutedOn: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isConstitutedAsPerAct: { type: Boolean, default: false },
    hasExternalMember: { type: Boolean, default: false },
    hasWomenMajority: { type: Boolean, default: false },
    
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    
    partnerNGOs: [{ type: Schema.Types.ObjectId, ref: 'NGO' }],
    
    totalCases: { type: Number, default: 0 },
    resolvedCases: { type: Number, default: 0 },
    pendingCases: { type: Number, default: 0 },
    avgResolutionDays: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CommitteeSchema.index({ type: 1, isActive: 1 });
CommitteeSchema.index({ organizationName: 1 });
CommitteeSchema.index({ state: 1, district: 1 });

const Committee: Model<ICommittee> =
  mongoose.models.Committee || mongoose.model<ICommittee>('Committee', CommitteeSchema);

export default Committee;
