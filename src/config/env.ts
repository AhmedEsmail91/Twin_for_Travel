/**
 * Environment configuration.
 *
 * Validated once, at import time, so a misconfigured deployment fails immediately
 * with a readable message instead of throwing deep inside a database query.
 *
 * This module is server-only. Never import it from a Client Component — only
 * `NEXT_PUBLIC_*` values may cross to the browser, and those are re-exported
 * from `src/config/site.ts`.
 */
import 'server-only';

import { z } from 'zod';

const STORAGE_PROVIDERS = ['local', 'cloudinary'] as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    MONGODB_URI: z
      .string()
      .min(1, 'MONGODB_URI is required')
      .refine(
        (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
        'MONGODB_URI must start with mongodb:// or mongodb+srv://',
      ),

    AUTH_SECRET: z
      .string()
      .min(32, 'AUTH_SECRET must be at least 32 characters — generate one with `node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"`'),

    NEXT_PUBLIC_APP_URL: z
      .string()
      .url('NEXT_PUBLIC_APP_URL must be an absolute URL, e.g. http://localhost:3000')
      .default('http://localhost:3000'),

    SITE_TIMEZONE: z.string().min(1).default('Africa/Cairo'),

    STORAGE_PROVIDER: z.enum(STORAGE_PROVIDERS).default('local'),
    UPLOAD_DIR: z.string().min(1).default('public/uploads'),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLOUDINARY_FOLDER: z.string().default('twin-for-travel'),
  })
  .superRefine((value, ctx) => {
    if (value.STORAGE_PROVIDER !== 'cloudinary') return;

    for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const) {
      if (!value[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required when STORAGE_PROVIDER=cloudinary`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment configuration.\n${details}\n\nSee .env.example for the documented list of variables.`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
