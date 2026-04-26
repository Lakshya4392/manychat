"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Verify automation ownership
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

export const updateListener = async (
  automationId: string,
  listener: "SMARTAI" | "MESSAGE",
  prompt: string,
  reply?: string
) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    // Verify ownership
    const owns = await verifyAutomationOwnership(automationId, user.id);
    if (!owns) return { status: 403, message: "Not authorized" };

    const upserted = await db.listener.upsert({
      where: { automationId },
      update: {
        listener,
        prompt,
        commentReply: reply,
      },
      create: {
        automationId,
        listener,
        prompt,
        commentReply: reply,
      },
    });

    if (upserted) {
      revalidatePath(`/automations/${automationId}`);
      return { status: 200, message: "Listener updated" };
    }
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
