import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database';

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();

    const allHealthy = Object.values(dbHealth).every(healthy => healthy);

    const response = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: dbHealth,
    };

    return NextResponse.json(response, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Health check failed',
      },
      { status: 500 }
    );
  }
}