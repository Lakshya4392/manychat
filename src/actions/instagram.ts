"use server";

import { currentUser } from "@clerk/nextjs/server";
import { instagram } from "@/lib/instagram";
import { db } from "@/lib/db";

export const onGetInstagramMedia = async () => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        integrations: {
          where: { name: "INSTAGRAM" }
        }
      }
    });

    if (!dbUser || dbUser.integrations.length === 0) {
      return { status: 404, message: "Instagram not connected" };
    }

    const token = await instagram.getUserToken(dbUser.id);
    if (!token) return { status: 404, message: "Token not found" };

    const media = await instagram.getUserMedia("me", token, 20);
    return { status: 200, data: media };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
