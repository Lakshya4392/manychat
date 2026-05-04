import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const configId = process.env.FB_LOGIN_CONFIG_ID;
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/instagram/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Instagram API credentials not configured" }, { status: 500 });
  }

  // Facebook Login for Business uses config_id instead of scope
  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");

  if (configId) {
    // Use config_id (required for Facebook Login for Business)
    authUrl.searchParams.set("config_id", configId);
  } else {
    // Minimal essential scopes for messaging
    const scopes = [
      "instagram_basic",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_read_engagement"
    ];
    authUrl.searchParams.set("scope", scopes.join(","));
  }

  const state = Buffer.from(JSON.stringify({ clerkId: user.id, timestamp: Date.now() })).toString("base64");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
