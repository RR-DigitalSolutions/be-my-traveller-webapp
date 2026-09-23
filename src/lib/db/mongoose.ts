// ============================================================
// MongoDB Connection Singleton
// Prevents multiple Mongoose connections in Next.js dev
// hot-reload and serverless function invocations.
// ============================================================

import mongoose from "mongoose";
import dns from "dns";

// Fix Windows / ISP DNS SRV resolution issues for MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
} catch (e) {
  // Ignore if not supported in environment
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI environment variable is not set. " +
      "Add it to your .env.local file."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global type so we can safely attach to it
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.__mongooseCache) {
  global.__mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      connectTimeoutMS: 10_000,
    };

    cache.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log("[MongoDB] Connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cache.promise = null; // allow retry on next call
        console.error("[MongoDB] Connection error:", err);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
