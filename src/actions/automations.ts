"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkLimit } from "@/lib/subscription";

export const createAutomation = async () => {
  const { userId } = await auth();
  if (!userId) return { status: 401 };

  try {
    const userExist = await db.user.findUnique({
      where: { clerkId: userId },
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
  const { userId } = await auth();
  if (!userId) return { status: 401 };

  try {
    const userExist = await db.user.findUnique({
      where: { clerkId: userId },
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
  data: { name?: string; active?: boolean; isSemantic?: boolean }
) => {
  const { userId } = await auth();
  if (!userId) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
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

export const onUpdateAutomationPosts = async (
  automationId: string,
  posts: { postid: string; caption?: string; media: string; mediaType: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM" }[]
) => {
  const { userId } = await auth();
  if (!userId) return { status: 401 };

  try {
    // 1. Delete existing posts for this automation
    await db.post.deleteMany({
      where: { automationId },
    });

    // 2. Create new posts
    const created = await db.automation.update({
      where: { id: automationId },
      data: {
        posts: {
          create: posts.map((p) => ({
            postid: p.postid,
            caption: p.caption,
            media: p.media,
            mediaType: p.mediaType,
          })),
        },
      },
    });

    if (created) {
      revalidatePath(`/automations/${automationId}`);
      return { status: 200, message: "Posts linked successfully" };
    }
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};

export const getAutomationDetails = async (id: string) => {
  const { userId } = await auth();
  if (!userId) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
    });
    if (!dbUser) return { status: 404, message: "User not found" };

    const automation = await db.automation.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        keywords: true,
        trigger: true,
        listener: true,
        posts: true,
      },
    });

    if (automation) return { status: 200, data: automation };
    return { status: 404 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
