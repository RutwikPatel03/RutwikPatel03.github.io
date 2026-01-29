import { Redis } from '@upstash/redis';

// Initialize Redis client using environment variables
// Vercel automatically sets these when you connect Upstash
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Keys for different stats
export const REDIS_KEYS = {
  VISITOR_COUNT: 'portfolio:visitor_count',
  UNIQUE_VISITORS: 'portfolio:unique_visitors',
} as const;

