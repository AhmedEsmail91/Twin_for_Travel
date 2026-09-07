import 'server-only';

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';
import { promisify } from 'node:util';

/**
 * `promisify` cannot pick the options-carrying overload, so the signature is
 * restated here rather than losing the tuning parameters below.
 */
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/**
 * Password hashing with scrypt.
 *
 * scrypt is a memory-hard KDF in Node's standard library, so it gives bcrypt-class
 * resistance to GPU cracking without a third dependency and without bcrypt's
 * 72-byte input truncation. Parameters follow the OWASP recommendation
 * (N = 2^15, r = 8, p = 1 → 32 MiB per hash). CLAUDE.md §9.
 *
 * Stored format:  scrypt$N$r$p$<salt-base64>$<hash-base64>
 * The parameters travel with the hash so they can be raised later without
 * invalidating existing passwords.
 */

const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELISATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// scrypt needs maxmem > 128 * N * r; the default 32 MiB is exactly at the limit.
const MAX_MEMORY = 192 * COST * BLOCK_SIZE;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISATION,
    maxmem: MAX_MEMORY,
  });

  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELISATION,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, costRaw, blockSizeRaw, parallelRaw, saltRaw, hashRaw] = parts;

  const cost = Number(costRaw);
  const blockSize = Number(blockSizeRaw);
  const parallelisation = Number(parallelRaw);
  if (!Number.isFinite(cost) || !Number.isFinite(blockSize) || !Number.isFinite(parallelisation)) {
    return false;
  }

  const salt = Buffer.from(saltRaw ?? '', 'base64');
  const expected = Buffer.from(hashRaw ?? '', 'base64');
  if (salt.length === 0 || expected.length === 0) return false;

  const derived = await scrypt(password.normalize('NFKC'), salt, expected.length, {
    N: cost,
    r: blockSize,
    p: parallelisation,
    maxmem: 192 * cost * blockSize,
  });

  // Constant-time comparison so response timing cannot reveal a partial match.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
