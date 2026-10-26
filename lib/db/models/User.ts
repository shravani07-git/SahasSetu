import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: 'user' | 'admin' | 'ngo' | 'counselor' | 'committee_member';
    organization?: string;
    avatar?: string;
    
    // Counselor / NGO specific fields
    specialization?: string[];
    languages?: string[];
    rating?: number;
    experience?: string;

    isVerified: boolean;
    isActive: boolean;
    anonymousId: string; // Used for anonymous interactions
    twoFactorEnabled: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, sparse: true, trim: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['user', 'admin', 'ngo', 'counselor', 'committee_member'],
            default: 'user',
        },
        organization: { type: String, trim: true },
        avatar: { type: String },
        specialization: [{ type: String }],
        languages: [{ type: String }],
        rating: { type: Number, default: 5.0 },
        experience: { type: String },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        anonymousId: { type: String, required: true, unique: true },
        twoFactorEnabled: { type: Boolean, default: false },
        lastLogin: { type: Date },
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any) {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Index for efficient queries
UserSchema.index({ role: 1 });
UserSchema.index({ organization: 1 });
UserSchema.index({ anonymousId: 1 });

// Account lockout after failed attempts
UserSchema.virtual('isLocked').get(function (this: IUser) {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
