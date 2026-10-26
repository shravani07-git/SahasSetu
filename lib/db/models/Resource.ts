import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResource extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  
  // File info
  fileName: string;
  filePath: string;
  fileSize: number; // bytes
  mimeType: string;
  
  // Classification
  category: 'legal_guide' | 'posh_handbook' | 'workshop_material' | 'counseling_resource' | 'policy_template' | 'training_video' | 'helpline_directory' | 'other';
  tags: string[];
  
  // Ownership
  ngoId: mongoose.Types.ObjectId; // The NGO user who uploaded this
  ngoName: string; // Denormalized for quick display
  
  // Visibility & status
  visibility: 'public' | 'private' | 'shared';
  status: 'draft' | 'published' | 'archived';
  
  // Stats
  downloadCount: number;
  viewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    
    category: {
      type: String,
      required: true,
      enum: ['legal_guide', 'posh_handbook', 'workshop_material', 'counseling_resource', 'policy_template', 'training_video', 'helpline_directory', 'other'],
    },
    tags: [{ type: String, trim: true }],
    
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ngoName: { type: String, required: true },
    
    visibility: {
      type: String,
      enum: ['public', 'private', 'shared'],
      default: 'public',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ResourceSchema.index({ ngoId: 1, status: 1 });
ResourceSchema.index({ category: 1, status: 1, visibility: 1 });
ResourceSchema.index({ status: 1, visibility: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ title: 'text', description: 'text' });

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
