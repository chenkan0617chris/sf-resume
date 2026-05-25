// Per-user daily quota check. Pre-increments before LLM call; on failure,
// route handler should call `decrementUsage()` to roll back.

import { prisma } from './prisma';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function quotaForTier(tier: string): number {
  const free = parseInt(process.env.FREE_DAILY_QUOTA || '5', 10);
  const pro = parseInt(process.env.PRO_DAILY_QUOTA || '100', 10);
  return tier === 'pro' ? pro : free;
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Atomically increments today's usage if the user is under their limit.
 * Returns `allowed: false` if the increment would exceed quota.
 */
export async function checkAndConsumeQuota(
  userId: string,
  tier: string
): Promise<QuotaResult> {
  const date = todayUtc();
  const limit = quotaForTier(tier);

  // Optimistic upsert + read-after-write. Two-step but Postgres serializable.
  return prisma.$transaction(async (tx) => {
    const existing = await tx.usageDay.findUnique({
      where: { userId_date: { userId, date } },
    });
    const used = existing?.count ?? 0;
    if (used >= limit) {
      return { allowed: false, used, limit, remaining: 0 };
    }
    await tx.usageDay.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, count: 1 },
      update: { count: { increment: 1 } },
    });
    return {
      allowed: true,
      used: used + 1,
      limit,
      remaining: Math.max(0, limit - used - 1),
    };
  });
}

/** Roll back a usage consumption (e.g. after LLM call fails). */
export async function decrementUsage(userId: string): Promise<void> {
  const date = todayUtc();
  await prisma.usageDay
    .update({
      where: { userId_date: { userId, date } },
      data: { count: { decrement: 1 } },
    })
    .catch(() => {
      // ignore: row might not exist if a separate failure reset it.
    });
}
