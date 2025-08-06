// /app/api/workers/logs/route.ts

import { fetchWorkerLogs } from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
    const { searchParams } = new URL(req.url);

    const workerId = searchParams.get('id');
    
    const monthStr = searchParams.get('month'); // e.g., "2024-06"

    if (!workerId) {
      return NextResponse.json({ error: 'Missing worker ID' }, { status: 400 });
    }

    const selectedMonth = monthStr ? new Date(`${monthStr}-01`) : null;

    const result = await fetchWorkerLogs(workerId, selectedMonth);
    if (!result) {
      return NextResponse.json({ error: 'No logs found for this worker' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Error] /api/workers/logs:', error);
    return NextResponse.json({ error: 'Failed to fetch worker logs' }, { status: 500 });
  }

}
