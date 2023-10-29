import { NextRequest, NextResponse } from 'next/server';

import { ERROR_CODES } from '@/shared/constants/errorCodes';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests in the time window
}

const rateLimiterStore: Record<
  string,
  { lastRequestTimestamp: number; requestCount: number }
> = {};

export const rateLimiter = (config: RateLimitConfig) => {
  return (request: NextRequest): boolean | NextResponse => {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const currentTime = Date.now();

    if (!rateLimiterStore[clientIP]) {
      rateLimiterStore[clientIP] = {
        lastRequestTimestamp: currentTime,
        requestCount: 1,
      };
    } else {
      const elapsedTime =
        currentTime - rateLimiterStore[clientIP].lastRequestTimestamp;

      if (elapsedTime < config.windowMs) {
        if (rateLimiterStore[clientIP].requestCount < config.max) {
          rateLimiterStore[clientIP].requestCount += 1;
        } else {
          return NextResponse.json({
            success: false,
            error: {
              code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
              message: 'Too many requests. Please try again later.',
            },
          });
        }
      } else {
        rateLimiterStore[clientIP] = {
          lastRequestTimestamp: currentTime,
          requestCount: 1,
        };
      }
    }

    return true;
  };
};
