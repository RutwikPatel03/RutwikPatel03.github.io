import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/lib/redis';

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
    
    // Create a simple hash of the IP for privacy
    const visitorHash = Buffer.from(ip).toString('base64').slice(0, 12);
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

