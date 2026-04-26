import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/instagram/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Instagram API credentials not configured" }, { status: 500 });
  }

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  
  // Matching exact scopes listed in Meta Dashboard Box 1
  authUrl.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_manage_comments,instagram_business_manage_messages"
  );

  const state = Buffer.from(JSON.stringify({ clerkId: user.id, timestamp: Date.now() })).toString("base64");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
