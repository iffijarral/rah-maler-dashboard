// /app/api/workEntries/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');
  const projectId = searchParams.get('projectId');
  const month = searchParams.get('month'); // format: yyyy-MM

  if (!workerId || !projectId || !month) {
    return NextResponse.json([], { status: 400 });
  }

  const entries = await prisma.workEntry.findMany({
    where: {
      workerId,
      projectId,
      date: {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-31`), // handles most months
      },
    },
  });

  return NextResponse.json(entries);
}
