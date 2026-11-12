import { NextResponse } from 'next/server';

/**
 * Health check endpoint for MANDATE platform.
 * Used by Postman tests, load balancers, and container orchestration.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'mandate-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
