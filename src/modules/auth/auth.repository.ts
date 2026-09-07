import 'server-only';

import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel, type UserDocument } from './user.model';
import type { AdminUser } from './auth.types';

function toAdminUser(document: UserDocument): AdminUser {
  return {
    id: String(document._id),
    email: document.email,
    name: document.name,
    role: document.role,
    createdAt: document.createdAt.toISOString(),
    lastLoginAt: document.lastLoginAt?.toISOString() ?? null,
  };
}

/** Includes the password hash, which is `select: false` by default. */
export async function findUserWithHashByEmail(
  email: string,
): Promise<(AdminUser & { passwordHash: string }) | null> {
  await connectToDatabase();

  const document = await UserModel.findOne({ email: email.toLowerCase() })
    .select('+passwordHash')
    .lean<UserDocument>()
    .exec();

  if (!document) return null;
  return { ...toAdminUser(document), passwordHash: document.passwordHash };
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  await connectToDatabase();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;

  const document = await UserModel.findById(id).lean<UserDocument>().exec();
  return document ? toAdminUser(document) : null;
}

export async function touchLastLogin(id: string): Promise<void> {
  await connectToDatabase();
  await UserModel.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }).exec();
}

export async function countUsers(): Promise<number> {
  await connectToDatabase();
  return UserModel.countDocuments().exec();
}
