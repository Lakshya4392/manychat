import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

/**
 * GET /api/instagram/callback
 * 
 * Handles OAuth callback from Instagram Login.
 * Flow:
 *   1. Exchange code for short-lived token (via api.instagram.com)
 *   2. Exchange for long-lived token (via graph.instagram.com)
 *   3. Get Instagram user profile
 *   4. Save token + Instagram ID to database
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const errorReason = searchParams.get("error_reason");

  console.log("[OAuth Callback] Received params:", { 
    hasCode: !!code, 
    hasState: !!state, 
    error, 
    errorDescription, 
    errorReason,
  });

  // Handle user denial or Instagram error
  if (error) {
    console.error("[OAuth Callback] Error:", { error, errorDescription, errorReason });
    const errorMsg = encodeURIComponent(`${error}: ${errorDescription || errorReason || 'Unknown error'}`);
    return NextResponse.redirect(`${HOST_URL}/integrations?error=${errorMsg}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${HOST_URL}/integrations?error=no_code&description=Authorization%20code%20not%20received`
    );
  }

  try {
    // ── Step 0: Verify CSRF state ──
    let clerkId: string;
    try {
      const stateJson = JSON.parse(Buffer.from(state || "", "base64").toString());
      clerkId = stateJson.clerkId;
      if (Date.now() - stateJson.timestamp > 10 * 60 * 1000) {
        throw new Error("State expired");
      }
    } catch {
      return NextResponse.redirect(`${HOST_URL}/integrations?error=invalid_state`);
    }

    const user = await currentUser();
    if (!user || user.id !== clerkId) {
      return NextResponse.redirect(`${HOST_URL}/integrations?error=unauthorized`);
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID!;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;
    const redirectUri = `${HOST_URL}/api/instagram/callback`;

    // ── Step 1: Exchange code for short-lived token ──
    // POST https://api.instagram.com/oauth/access_token
    console.log("[OAuth] Exchanging code for short-lived token...");
    
    // Facebook Login token exchange endpoint
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[OAuth] Token exchange failed:", tokenData.error);
      return NextResponse.redirect(
        `${HOST_URL}/integrations?error=${encodeURIComponent(tokenData.error.message || "Token exchange failed")}`
      );
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;
    console.log("[OAuth] Got short-lived token ✓, user_id:", userId);

    // ── Step 2: Exchange for long-lived token (60 days) ──
    // Facebook Login: use fb_exchange_token grant type
    console.log("[OAuth] Exchanging for long-lived token...");
    
    const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", clientId);
    longLivedUrl.searchParams.set("client_secret", clientSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    let accessToken = shortLivedToken;
    let expiresIn = 3600; // 1 hour default for short-lived

    if (longLivedData.access_token) {
      accessToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in || 5184000; // 60 days
      console.log("[OAuth] Got long-lived token ✓, expires in:", expiresIn, "seconds");
    } else {
      console.warn("[OAuth] Long-lived token exchange failed, using short-lived:", longLivedData);
    }

    // ── Step 3: Get Instagram profile ──
    console.log("[OAuth] Fetching Instagram profile...");
    const profileUrl = new URL(`https://graph.instagram.com/v21.0/me`);
    profileUrl.searchParams.set("fields", "user_id,username,name,profile_picture_url");
    profileUrl.searchParams.set("access_token", accessToken);

    const profileRes = await fetch(profileUrl.toString());
    const profileData = await profileRes.json();
    console.log("[OAuth] Profile:", profileData);

    const instagramId = profileData.user_id || userId || profileData.id;

    // ── Step 4: Save to database ──
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.redirect(`${HOST_URL}/integrations?error=user_not_found`);
    }

    const existing = await db.integrations.findFirst({
      where: {
        userId: dbUser.id,
        name: "INSTAGRAM",
      },
    });

    const integrationData = {
      token: accessToken,
      instagramId: instagramId?.toString() || null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };

    if (existing) {
      await db.integrations.update({
        where: { id: existing.id },
        data: integrationData,
      });
    } else {
      await db.integrations.create({
        data: {
          userId: dbUser.id,
          name: "INSTAGRAM",
          ...integrationData,
        },
      });
    }

    console.log("[OAuth] ✅ Instagram integration saved successfully!");
    return NextResponse.redirect(`${HOST_URL}/integrations?success=connected`);
  } catch (error) {
    console.error("[OAuth] Unhandled error:", error);
    const errorMsg = encodeURIComponent(
      error instanceof Error ? error.message : "Unknown error during connection"
    );
    return NextResponse.redirect(`${HOST_URL}/integrations?error=${errorMsg}`);
  }
}
