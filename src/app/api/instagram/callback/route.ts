import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * GET /api/instagram/callback
 * 
 * Handles OAuth callback from Facebook Login for Business.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Keep redirect URI identical to the one used in /api/instagram/auth
  const redirectUri = `${origin}/api/instagram/callback`;

  if (error) {
    console.error("[OAuth Callback] Error from Instagram:", error);
    return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/integrations?error=missing_code`);
  }

  try {
    // ── Pre-Step: Verify State ──
    let clerkId: string;
    try {
      const stateJson = JSON.parse(Buffer.from(state || "", "base64").toString());
      clerkId = stateJson.clerkId;
      // Allow 15 minutes for oauth flow
      if (Date.now() - stateJson.timestamp > 15 * 60 * 1000) {
        throw new Error("State expired");
      }
    } catch {
      return NextResponse.redirect(`${origin}/integrations?error=invalid_state`);
    }

    const user = await currentUser();
    if (!user || user.id !== clerkId) {
      return NextResponse.redirect(`${origin}/integrations?error=unauthorized`);
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID!;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;

    // ── Step 1: Exchange code for short-lived token ──
    console.log("[OAuth] Exchanging code for token, using redirect_uri:", redirectUri);
    
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri); // MUST MATCH AUTH CALL
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[OAuth] Token exchange failed:", tokenData.error);
      return NextResponse.redirect(
        `${origin}/integrations?error=${encodeURIComponent(tokenData.error.message || "Token exchange failed")}`
      );
    }

    const accessToken = tokenData.access_token;
    console.log("[OAuth] Got access token ✓");

    // ── Step 2: Get Instagram User ID from the token ──
    // For Facebook Login for Business, we need to find the connected Instagram ID
    const meUrl = new URL("https://graph.facebook.com/v21.0/me");
    meUrl.searchParams.set("fields", "id,name,accounts{instagram_business_account{id,name,username}}");
    meUrl.searchParams.set("access_token", accessToken);

    const meRes = await fetch(meUrl.toString());
    const meData = await meRes.json();

    if (meData.error) {
      console.error("[OAuth] Failed to get user info:", meData.error);
      return NextResponse.redirect(`${origin}/integrations?error=user_info_failed`);
    }

    const igAccount = meData.accounts?.data?.[0]?.instagram_business_account;
    if (!igAccount) {
      console.error("[OAuth] No Instagram Business Account found linked to this Facebook Page");
      return NextResponse.redirect(`${origin}/integrations?error=no_instagram_account`);
    }

    const instagramId = igAccount.id;
    const instagramUsername = igAccount.username;

    // ── Step 3: Save to Database ──
    // Find our internal user
    const dbUser = await db.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!dbUser) throw new Error("User not found in database");

    // Upsert integration
    await db.integrations.upsert({
      where: {
        userId_name: {
          userId: dbUser.id,
          name: "INSTAGRAM"
        }
      },
      update: {
        token: accessToken,
        instagramId: instagramId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days approx
      },
      create: {
        userId: dbUser.id,
        name: "INSTAGRAM",
        token: accessToken,
        instagramId: instagramId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`[OAuth] Successfully connected Instagram: @${instagramUsername}`);
    
    revalidatePath("/integrations");
    return NextResponse.redirect(`${origin}/integrations?success=true`);

  } catch (err) {
    console.error("[OAuth Callback] Unexpected Error:", err);
    return NextResponse.redirect(`${origin}/integrations?error=internal_error`);
  }
}
