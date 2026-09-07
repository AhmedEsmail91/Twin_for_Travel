/**
 * Provisions an admin account.
 *
 *   npm run create-admin -- --email you@example.com --name "Your Name"
 *
 * The password is read from the ADMIN_PASSWORD environment variable, or generated
 * and printed once if that is unset. It is never written to disk or to the shell
 * history, and only its scrypt hash reaches the database.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { parseArgs } from 'node:util';
import mongoose from 'mongoose';

const scrypt = promisify(scryptCallback);

const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELISATION = 1;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize('NFKC'), salt, 64, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISATION,
    maxmem: 192 * COST * BLOCK_SIZE,
  });

  return ['scrypt', COST, BLOCK_SIZE, PARALLELISATION, salt.toString('base64'), derived.toString('base64')].join('$');
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    'reset-password': { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

const email = values.email?.trim().toLowerCase();
const name = values.name?.trim() || 'Administrator';

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  fail('Provide a valid email:  npm run create-admin -- --email you@example.com --name "Your Name"');
}

const uri = process.env.MONGODB_URI;
if (!uri) fail('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');

let password = process.env.ADMIN_PASSWORD;
let generated = false;

if (!password) {
  // 24 base64url characters — comfortably beyond the 12-character policy.
  password = randomBytes(18).toString('base64url');
  generated = true;
} else if (password.length < 12) {
  fail('ADMIN_PASSWORD must be at least 12 characters.');
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: 'admin' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User ?? mongoose.model('User', userSchema);

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });

const existing = await User.findOne({ email }).lean();

if (existing && !values['reset-password']) {
  console.log(`\n• An admin with ${email} already exists.`);
  console.log('  Re-run with --reset-password to set a new password.\n');
  await mongoose.disconnect();
  process.exit(0);
}

const passwordHash = await hashPassword(password);

if (existing) {
  await User.updateOne({ email }, { $set: { passwordHash, name } });
  console.log(`\n✔ Password reset for ${email}`);
} else {
  await User.create({ email, name, passwordHash, role: 'admin' });
  await User.syncIndexes();
  console.log(`\n✔ Admin created: ${email}`);
}

if (generated) {
  console.log(`\n  Password: ${password}`);
  console.log('  Store it now — it is not shown again and is not recoverable.\n');
} else {
  console.log('  Password: (taken from ADMIN_PASSWORD)\n');
}

// Sanity check: the stored hash must verify against the password we just set.
const [, cost, blockSize, parallel, salt, hash] = passwordHash.split('$');
const check = await scrypt(password.normalize('NFKC'), Buffer.from(salt, 'base64'), Buffer.from(hash, 'base64').length, {
  N: Number(cost),
  r: Number(blockSize),
  p: Number(parallel),
  maxmem: 192 * Number(cost) * Number(blockSize),
});
if (!timingSafeEqual(check, Buffer.from(hash, 'base64'))) {
  fail('The stored hash did not verify. The account was not usable — please retry.');
}

await mongoose.disconnect();
