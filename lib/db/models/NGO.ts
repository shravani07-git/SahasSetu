import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INGO extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  registrationNumber?: string;
  
  // Contact
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Geo location for proximity search
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  
  // Services
  services: ('legal_aid' | 'counseling' | 'shelter' | 'employment' | 'advocacy' | 'training' | 'mediation')[];
  specializations: string[];
  
  // Team
  contactPerson: string;
  teamSize?: number;
  
  // Verification
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // Stats
  casesHandled: number;
  rating?: number;
  reviewCount: number;
  
  isActive: boolean;
  logo?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const NGOSchema = new Schema<INGO>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    registrationNumber: { type: String, trim: true },
    
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    
    services: [{
      type: String,
      enum: ['legal_aid', 'counseling', 'shelter', 'employment', 'advocacy', 'training', 'mediation'],
    }],
    specializations: [{ type: String }],
    
    contactPerson: { type: String, required: true },
    teamSize: { type: Number },
    
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    
    casesHandled: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
    logo: { type: String },
  },
  { timestamps: true }
);

NGOSchema.index({ coordinates: '2dsphere' });
NGOSchema.index({ services: 1 });
NGOSchema.index({ city: 1, state: 1 });
NGOSchema.index({ verified: 1, isActive: 1 });

const NGO: Model<INGO> = mongoose.models.NGO || mongoose.model<INGO>('NGO', NGOSchema);

export default NGO;
