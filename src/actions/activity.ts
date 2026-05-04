"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Get all bot interaction logs for the current user
 */
export async function getActivityLogs() {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      automations: {
        select: {
          id: true,
          name: true,
          dms: {
            orderBy: { createdAt: "desc" },
            take: 50,
          }
        }
      }
    }
  });

  if (!dbUser) return null;

  // Flatten the logs from all automations
  const allLogs = dbUser.automations.flatMap(auto => 
    auto.dms.map(dm => ({
        ...dm,
        automationName: auto.name
    }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return allLogs;
}
