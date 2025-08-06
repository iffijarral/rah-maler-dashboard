import { NextResponse } from 'next/server';
import { fetchWorkerById } from '@/app/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('id');  

  if (!workerId) {
    return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
  }

  try {
    const worker = await fetchWorkerById(workerId);
    return NextResponse.json(worker);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}
