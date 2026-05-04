import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Please provide a token like: /api/inject-token?token=YOUR_TOKEN" });
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to the website first!" });
    }

    const dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found in DB" });
    }

    // Update or Create the Integration with the Master Token
    await db.integrations.upsert({
      where: { userId_name: { userId: dbUser.id, name: "INSTAGRAM" } },
      update: {
        token: token,
        instagramId: "PENDING_SETUP",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: dbUser.id,
        name: "INSTAGRAM",
        token: token,
        instagramId: "PENDING_SETUP",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "🔥 Master Token Injected Successfully! Your bot is ready.",
      nextSteps: "Please send a DM to your bot now. The Auto-Healing system will detect your Instagram ID automatically."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
