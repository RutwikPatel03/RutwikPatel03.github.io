import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/lib/redis';

/**
 * Salts the per-visitor key so the stored value cannot be reversed into an IP
 * by hashing the candidate address space, which is small enough to enumerate.
 * A missing salt is not fatal, it just makes the digest guessable, so the
 * counter keeps working rather than failing the request.
 */
const IP_SALT = process.env.VISITOR_HASH_SALT || 'portfolio-visitor';

function hashIp(ip: string): string {
  return createHash('sha256').update(`${IP_SALT}:${ip}`).digest('hex').slice(0, 16);
}

// GET - Retrieve current visitor count
export async function GET() {
  try {
    const count = await redis.get<number>(REDIS_KEYS.VISITOR_COUNT);
    return NextResponse.json({ 
      count: count || 0,
      success: true 
    });
  } catch (error) {
    console.error('Failed to get visitor count:', error);
    return NextResponse.json(
      { count: 0, success: false, error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}

// POST - Increment visitor count (called once per session)
export async function POST(request: NextRequest) {
  try {
    // Get visitor identifier from request (use IP or forwarded header)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    
    // Base64 is encoding, not hashing: the previous version was reversible and
    // truncation collided nearby addresses into one key. This is a real digest.
    const visitorHash = hashIp(ip);
    const visitorKey = `${REDIS_KEYS.UNIQUE_VISITORS}:${visitorHash}`;
    
    // Check if this visitor was already counted today
    const existingVisitor = await redis.get(visitorKey);
    
    let count: number;
    let isNewVisitor = false;
    
    if (!existingVisitor) {
      // New visitor - increment count and mark as visited
      count = await redis.incr(REDIS_KEYS.VISITOR_COUNT);
      // Set visitor key with 24 hour expiry (so same person counts again tomorrow)
      await redis.set(visitorKey, '1', { ex: 86400 });
      isNewVisitor = true;
    } else {
      // Returning visitor - just get current count
      count = (await redis.get<number>(REDIS_KEYS.VISITOR_COUNT)) || 0;
    }
    
    return NextResponse.json({ 
      count,
      isNewVisitor,
      success: true 
    });
  } catch (error) {
    console.error('Failed to update visitor count:', error);
    return NextResponse.json(
      { count: 0, isNewVisitor: false, success: false, error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

