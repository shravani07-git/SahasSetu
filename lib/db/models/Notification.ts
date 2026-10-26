import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'status_update' | 'case_assigned' | 'hearing_scheduled' | 'resolution' | 'general';
  title: string;
  message: string;
  relatedCaseId?: string;      // human-readable CASE-YYYY-XXXX
  relatedComplaintId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['status_update', 'case_assigned', 'hearing_scheduled', 'resolution', 'general'],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedCaseId: { type: String },
    relatedComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
