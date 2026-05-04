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
export const onGetUserInfo = async () => {
    const user = await currentUser();
    if (!user) return { status: 404 };
  
    try {
      const profile = await db.user.findUnique({
        where: { clerkId: user.id },
        include: {
          subscription: true,
          integrations: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
  
      if (profile) return { status: 200, data: profile };
      return { status: 404 };
    } catch (error) {
      console.error(error);
      return { status: 500 };
    }
  };

export const onUpdateBrandContext = async (context: string) => {
  const user = await currentUser();
  if (!user) return { status: 401 };

  try {
    const updated = await db.user.update({
      where: { clerkId: user.id },
      data: { brandContext: context },
    });

    if (updated) return { status: 200, message: "Brand Context updated" };
    return { status: 400 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
};
