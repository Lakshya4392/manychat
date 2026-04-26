"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkLimit } from "@/lib/subscription";

export const createAutomation = async () => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const userExist = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userExist) return { status: 404, message: "User not found" };

    // Check limit for free users
    const limitCheck = await checkLimit(userExist.id, "create_automation");
    if (!limitCheck.allowed) {
      return {
        status: 403,
        message: limitCheck.reason || "Automation limit reached",
        data: { limitReached: true, ...limitCheck },
      };
    }

    // Create automation + default listener
    const automation = await db.automation.create({
      data: {
        userId: userExist.id,
        listener: {
          create: {
            listener: "MESSAGE",
            prompt: "",
            commentReply: "",
          },
        },
      },
      include: {
        listener: true,
      },
    });

    // Update usage counter
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    await db.usage.upsert({
      where: { userId_month: { userId: userExist.id, month: currentMonth } },
      update: { automations: { increment: 1 } },
      create: {
        userId: userExist.id,
        month: currentMonth,
        dmSent: 0,
        aiTokensUsed: 0,
        automations: 1,
      },
    });

    revalidatePath("/automations");
    return { status: 201, data: automation, message: "Automation created" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal server error" };
  }
};

export const getAutomations = async () => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const userExist = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        automations: {
          include: {
            keywords: true,
            listener: true,
            trigger: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (userExist && userExist.automations) {
      return { status: 200, data: userExist.automations };
    }
    return { status: 404, data: [] };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};

export const updateAutomation = async (
  id: string,
  data: { name?: string; active?: boolean }
) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) return { status: 404, message: "User not found" };

    const existing = await db.automation.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!existing) return { status: 404, message: "Automation not found" };

    const updated = await db.automation.update({
      where: { id },
      data,
    });

    if (updated) {
      revalidatePath("/automations");
      revalidatePath(`/automations/${id}`);
      return { status: 200, message: "Automation updated", data: updated };
    }
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};

export const getAutomationDetails = async (id: string) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) return { status: 404, message: "User not found" };

    const automation = await db.automation.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        keywords: true,
        trigger: true,
        listener: true,
      },
    });

    if (automation) return { status: 200, data: automation };
    return { status: 404 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
