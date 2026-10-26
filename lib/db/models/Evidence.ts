import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvidence extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  
  // File info
  originalName: string;
  mimeType: string;
  fileSize: number;
  
  // Encryption details
  encryptedPath: string; // Path to encrypted file on disk
  encryptionIV: string; // Initialization vector (hex)
  encryptionTag: string; // Auth tag for AES-GCM (hex)
  encryptedFileKey: string; // File key encrypted with master key (hex)

  // Cryptographic integrity / timestamp receipt
  contentHash?: string; // SHA-256 of the original plaintext evidence
  evidenceTimestamp?: Date;
  timestampSignature?: string; // HMAC signature over hash + timestamp + ownership metadata
  receiptHash?: string; // Hash-chained receipt identifier
  previousReceiptHash?: string;
  
  // Metadata
  category: 'image' | 'document' | 'audio' | 'video' | 'other';
  description?: string;
  tags: string[];
  
  // Access control
  accessLog: {
    userId: mongoose.Types.ObjectId;
    action: 'view' | 'download' | 'share';
    timestamp: Date;
    ipAddress?: string;
  }[];
  sharedWith: mongoose.Types.ObjectId[];
  
  isDeleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    
    encryptedPath: { type: String, required: true },
    encryptionIV: { type: String, required: true },
    encryptionTag: { type: String, required: true },
    encryptedFileKey: { type: String, required: true },

    contentHash: { type: String, index: true },
    evidenceTimestamp: { type: Date },
    timestampSignature: { type: String },
    receiptHash: { type: String, unique: true, sparse: true },
    previousReceiptHash: { type: String },
    
    category: {
      type: String,
      enum: ['image', 'document', 'audio', 'video', 'other'],
      default: 'other',
    },
    description: { type: String },
    tags: [{ type: String }],
    
    accessLog: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['view', 'download', 'share'] },
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
      },
    ],
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

EvidenceSchema.index({ userId: 1, isDeleted: 1 });
EvidenceSchema.index({ complaintId: 1 });
EvidenceSchema.index({ category: 1 });
EvidenceSchema.index({ complaintId: 1, evidenceTimestamp: 1 });

const Evidence: Model<IEvidence> =
  mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);

export default Evidence;
