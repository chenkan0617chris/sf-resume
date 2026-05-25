// GET /api/usage — current user's daily quota status.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function quotaForTier(tier: string): number {
  const free = parseInt(process.env.FREE_DAILY_QUOTA || '5', 10);
  const pro = parseInt(process.env.PRO_DAILY_QUOTA || '100', 10);
  return tier === 'pro' ? pro : free;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const date = todayUtc();
  const usage = await prisma.usageDay.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  });
  const limit = quotaForTier(session.user.tier);
  const used = usage?.count ?? 0;
  return NextResponse.json({
    used,
    limit,
    remaining: Math.max(0, limit - used),
    tier: session.user.tier,
    date,
  });
}
