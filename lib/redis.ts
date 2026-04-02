import { Redis } from "ioredis";

// Centralized Redis Client for V2 caching & session management
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // Automatically mock/skip connection in development if URL is missing
    lazyConnect: true,
    maxRetriesPerRequest: 0,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
