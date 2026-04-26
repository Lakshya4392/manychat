import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/instagram/auth
 * 
 * Initiates Instagram OAuth via Facebook Login for Business.
 * 
 * The app has "Facebook Login for Business" product configured, so
 * we use the Facebook OAuth endpoint with Instagram Business scopes.
 * 
 * Scopes come from: Use Cases → Instagram API → Customize → Permissions:
 *   - instagram_business_basic
 *   - instagram_business_manage_messages
 *   - instagram_manage_comments
 */
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_HOST_URL}/api/instagram/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Instagram API credentials not configured" }, 
      { status: 500 }
    );
  }

  // Facebook Login for Business OAuth endpoint
  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");

  // Start with only valid scopes, add more via Permissions and Features later
  authUrl.searchParams.set(
    "scope",
    "instagram_manage_comments"
  );

  // State for CSRF protection
  const state = Buffer.from(JSON.stringify({
    clerkId: user.id,
    timestamp: Date.now()
  })).toString("base64");
  authUrl.searchParams.set("state", state);

  console.log("[Instagram OAuth] Client ID:", clientId);
  console.log("[Instagram OAuth] Redirect URI:", redirectUri);
  console.log("[Instagram OAuth] Full Auth URL:", authUrl.toString());

  return NextResponse.redirect(authUrl.toString());
}
