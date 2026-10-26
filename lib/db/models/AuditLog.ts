import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: string;
  
  action: string;
  entityType: 'user' | 'complaint' | 'evidence' | 'counseling' | 'ngo' | 'committee' | 'system';
  entityId?: string;
  
  description: string;
  metadata?: Record<string, unknown>;
  
  ipAddress?: string;
  userAgent?: string;
  
  severity: 'info' | 'warning' | 'critical';
  
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    userRole: { type: String },
    
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['user', 'complaint', 'evidence', 'counseling', 'ngo', 'committee', 'system'],
      required: true,
    },
    entityId: { type: String },
    
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    
    ipAddress: { type: String },
    userAgent: { type: String },
    
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
