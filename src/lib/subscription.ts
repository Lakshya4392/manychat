/**
 * Subscription & Feature Gating
 * Enforces limits based on user plan (FREE vs PRO)
 */

import { db } from "@/lib/db";
import { SUBSCRIPTION_PLAN } from "@prisma/client";

export const FREE_LIMITS = {
  maxAutomations: 3,
  maxKeywordsPerAutomation: 5,
  maxMonthlyDMs: 100,
  smartAIEnabled: false,
  analyticsEnabled: false,
  maxTriggers: 2,
};

export const PRO_LIMITS = {
  maxAutomations: Infinity,
  maxKeywordsPerAutomation: 50,
  maxMonthlyDMs: 10000,
  smartAIEnabled: true,
  analyticsEnabled: true,
  maxTriggers: 10,
};

export type PlanLimits = typeof FREE_LIMITS;

/**
 * Get user's current limits based on subscription
 */
export async function getUserLimits(userId: string): Promise<PlanLimits> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const plan = user?.subscription?.plan || "FREE";
  return plan === "PRO" ? PRO_LIMITS : FREE_LIMITS;
}

/**
 * Check if user has reached a limit
 */
export async function checkLimit(
  userId: string,
  action: "create_automation" | "add_keyword" | "send_dm"
): Promise<{ allowed: boolean; limit: number; current: number; reason?: string }> {
  const limits = await getUserLimits(userId);
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const usage = await db.usage.findUnique({
    where: {
      userId_month: { userId, month: currentMonth },
    },
  });

  switch (action) {
    case "create_automation": {
      const count = await db.automation.count({
        where: { userId },
      });
      const allowed = count < limits.maxAutomations;
      return {
        allowed,
        limit: limits.maxAutomations,
        current: count,
        reason: !allowed ? `Maximum ${limits.maxAutomations} automations allowed on Free plan` : undefined,
      };
    }

    case "add_keyword": {
      // Will need automationId to check specific automation's keyword count
      return { allowed: true, limit: 0, current: 0 };
    }

    case "send_dm": {
      const dmCount = usage?.dmSent || 0;
      const allowed = dmCount < limits.maxMonthlyDMs;
      return {
        allowed,
        limit: limits.maxMonthlyDMs,
        current: dmCount,
        reason: !allowed ? `Monthly DM limit of ${limits.maxMonthlyDMs} reached` : undefined,
      };
    }

    default:
      return { allowed: true, limit: 0, current: 0 };
  }
}

/**
 * Check if user can use Smart AI feature
 */
export async function canUseSmartAI(userId: string): Promise<boolean> {
  const limits = await getUserLimits(userId);
  return limits.smartAIEnabled;
}

/**
 * Get subscription status for UI
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  plan: "FREE" | "PRO";
  isPro: boolean;
  automationsCount: number;
  dmUsage: number;
  dmLimit: number;
}> {
  const [user, usage] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    }),
    getCurrentUsage(userId),
  ]);

  const plan = user?.subscription?.plan || "FREE";
  const limits = await getUserLimits(userId);

  return {
    plan,
    isPro: plan === "PRO",
    automationsCount: await db.automation.count({ where: { userId } }),
    dmUsage: usage.dmSent,
    dmLimit: limits.maxMonthlyDMs,
  };
}

/**
 * Get current month usage
 */
export async function getCurrentUsage(
  userId: string
): Promise<{ dmSent: number; aiTokensUsed: number }> {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const usage = await db.usage.findUnique({
    where: { userId_month: { userId, month: currentMonth } },
  });

  return {
    dmSent: usage?.dmSent || 0,
    aiTokensUsed: usage?.aiTokensUsed || 0,
  };
}
