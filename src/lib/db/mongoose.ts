import 'server-only';

import mongoose from 'mongoose';

import { env, isProduction } from '@/config/env';

/**
 * A single, cached connection per Node process.
 *
 * Next.js clears the module registry on every hot reload in development and may
 * re-enter this module across serverless invocations in production. Caching on
 * `globalThis` keeps one connection (and one set of registered models) alive
 * across both, instead of opening a new pool on every request.
 */

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __twinForTravelMongoose?: MongooseCache;
};

const cache: MongooseCache = (globalForMongoose.__twinForTravelMongoose ??= {
  connection: null,
  promise: null,
});

// Reject writes that contain fields absent from the schema instead of dropping them.
mongoose.set('strictQuery', true);

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;

  cache.promise ??= mongoose
    .connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
      // Index creation is a deploy-time concern, not a per-request one.
      autoIndex: !isProduction,
    })
    .catch((error: unknown) => {
      // Clear the memoised promise so the next request can retry the connection.
      cache.promise = null;
      throw error;
    });

  cache.connection = await cache.promise;
  return cache.connection;
}

export { mongoose };
