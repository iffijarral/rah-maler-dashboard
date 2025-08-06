import { NextResponse } from 'next/server';
import { fetchWorkDetailsByMonth } from '@/app/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');  
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const month = Number(searchParams.get('month'));
  console.log('Hello api', workerId, year, month);
  if (!workerId) {
    return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
  }

  try {
    const workDetails = await fetchWorkDetailsByMonth(workerId, year, month);
    if (!workDetails || workDetails.length === 0) {
      return NextResponse.json({ error: 'No work details found for this month' }, { status: 404 });
    }    
    return NextResponse.json(workDetails, { status: 200 });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}
