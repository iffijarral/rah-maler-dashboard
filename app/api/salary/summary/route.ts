// /app/api/salary/year-summary/route.ts

import { NextResponse } from 'next/server';
import { getSalarySummaryByYear } from '@/app/lib/data';
 
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');
  const year = Number(searchParams.get('year'));

  if (!workerId || !year) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const summaries = await getSalarySummaryByYear(workerId, year);    
    return NextResponse.json(summaries);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
