"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { TRIGGER_TYPE } from "@prisma/client";
import { getUserLimits } from "@/lib/subscription";

/**
 * Helper: Verify automation belongs to user
 */
async function verifyAutomationOwnership(automationId: string, clerkId: string): Promise<boolean> {
  const dbUser = await db.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) return false;

  const automation = await db.automation.findFirst({
    where: { id: automationId, userId: dbUser.id },
  });
  return !!automation;
}

export const createKeyword = async (automationId: string, keyword: string) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) return { status: 404, message: "User not found" };

    const owns = await verifyAutomationOwnership(automationId, user.id);
    if (!owns) return { status: 403, message: "Not authorized" };

    // Check keyword limit
    const currentCount = await db.keyword.count({
      where: { automationId },
    });
    const limits = await getUserLimits(dbUser.id);
    if (currentCount >= limits.maxKeywordsPerAutomation) {
      return {
        status: 403,
        message: `Maximum ${limits.maxKeywordsPerAutomation} keywords allowed`,
      };
    }

    const created = await db.keyword.create({
      data: {
        automationId,
        word: keyword,
      },
    });

    if (created) {
      revalidatePath(`/automations/${automationId}`);
      return { status: 201, data: created, message: "Keyword added" };
    }
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};

export const deleteKeyword = async (id: string) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const keyword = await db.keyword.findUnique({ where: { id } });
    if (!keyword) return { status: 404 };
    if (!keyword.automationId) return { status: 400, message: "Invalid keyword" };

    const owns = await verifyAutomationOwnership(keyword.automationId, user.id);
    if (!owns) return { status: 403, message: "Not authorized" };

    await db.keyword.delete({
      where: { id },
    });

    revalidatePath(`/automations/${keyword.automationId}`);
    return { status: 200, message: "Keyword deleted" };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};

export const addTrigger = async (automationId: string, types: string[]) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const owns = await verifyAutomationOwnership(automationId, user.id);
    if (!owns) return { status: 403, message: "Not authorized" };

    // Delete existing triggers first
    await db.trigger.deleteMany({
      where: { automationId },
    });

    const created = await db.trigger.createMany({
      data: types.map((type) => ({
        automationId,
        type: type as TRIGGER_TYPE,
      })),
    });

    if (created) {
      revalidatePath(`/automations/${automationId}`);
      return { status: 201, message: "Trigger updated" };
    }
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
