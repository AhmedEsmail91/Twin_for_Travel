import 'server-only';

import { Schema, model, models, type Model, type Types } from 'mongoose';

import { baseToJSON } from '@/lib/db/schema-helpers';
import { USER_ROLES, type UserRole } from './auth.types';

export type UserDocument = {
  _id: Types.ObjectId;
  email: string;
  name: string;
  /** Always a scrypt hash. Plaintext never reaches this model. */
  passwordHash: string;
  role: UserRole;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'admin', required: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: baseToJSON, toObject: baseToJSON },
);

// One account per address; also the index behind the login lookup.
userSchema.index({ email: 1 }, { unique: true });

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument>) ?? model<UserDocument>('User', userSchema);
