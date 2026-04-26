"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const onBoardUser = async () => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const userExist = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        subscription: true,
      },
    });

    if (userExist) return { status: 200, data: userExist };

    const newUser = await db.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstname: user.firstName,
        lastname: user.lastName,
        subscription: {
          create: {},
        },
      },
      include: {
        subscription: true,
      },
    });

    return { status: 201, data: newUser };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { status: 500 };
  }
};
