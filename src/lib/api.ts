import { NextResponse } from 'next/server';

// ===========================================
// API Response Helpers
// ===========================================

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  status = 500,
  code?: string
): NextResponse {
  const body: ApiError = { error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

// Common error responses
export const ApiErrors = {
  badRequest: (message = 'Bad request') => errorResponse(message, 400, 'BAD_REQUEST'),
  unauthorized: (message = 'Unauthorized') => errorResponse(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Forbidden') => errorResponse(message, 403, 'FORBIDDEN'),
  notFound: (message = 'Not found') => errorResponse(message, 404, 'NOT_FOUND'),
  methodNotAllowed: (message = 'Method not allowed') => errorResponse(message, 405, 'METHOD_NOT_ALLOWED'),
  tooManyRequests: (message = 'Too many requests') => errorResponse(message, 429, 'TOO_MANY_REQUESTS'),
  internalError: (message = 'Internal server error') => errorResponse(message, 500, 'INTERNAL_ERROR'),
  serviceUnavailable: (message = 'Service unavailable') => errorResponse(message, 503, 'SERVICE_UNAVAILABLE'),
} as const;

// ===========================================
// Validation Helpers
// ===========================================

export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): string | null {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  if (options?.minLength && value.length < options.minLength) {
    return `${fieldName} must be at least ${options.minLength} characters`;
  }
  if (options?.maxLength && value.length > options.maxLength) {
    return `${fieldName} must be at most ${options.maxLength} characters`;
  }
  return null;
}

// ===========================================
// Rate Limiting (Simple in-memory)
// ===========================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

