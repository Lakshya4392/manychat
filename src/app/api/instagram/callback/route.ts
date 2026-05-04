import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const redirectUri = `${origin}/api/instagram/callback`;

  if (error) {
    return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/integrations?error=missing_code`);
  }

  try {
    // 1. Verify State & User
    let clerkId: string;
    try {
      const stateJson = JSON.parse(Buffer.from(state || "", "base64").toString());
      clerkId = stateJson.clerkId;
    } catch {
      return NextResponse.redirect(`${origin}/integrations?error=invalid_state`);
    }

    const user = await currentUser();
    if (!user || user.id !== clerkId) {
      return NextResponse.redirect(`${origin}/integrations?error=unauthorized`);
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID!;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;

    // 2. Exchange code for access token
    console.log("[OAuth] Exchanging code for token...");
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[OAuth] Token Error:", tokenData.error);
      return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(tokenData.error.message || "token_failed")}`);
    }

    const accessToken = tokenData.access_token;
    console.log("[OAuth] Got user access token ✓");

    // 3. Find the Facebook Page linked to the Instagram Business Account and get its Page Token
    let instagramId: string | null = null;
    let pageAccessToken: string | null = null;

    try {
      console.log("[OAuth] Fetching connected pages and their tokens...");
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`
      );
      const pagesData = await pagesRes.json();
      
      if (pagesData.data) {
        for (const page of pagesData.data) {
          if (page.instagram_business_account?.id) {
            instagramId = page.instagram_business_account.id;
            pageAccessToken = page.access_token; // <--- THIS IS THE TOKEN WE NEED FOR MESSAGING
            console.log(`[OAuth] Found IG Account ${instagramId} linked to Page ${page.name}`);
            break;
          }
        }
      }
    } catch (e) {
      console.error("[OAuth] Failed to fetch pages/tokens:", e);
    }

    if (!instagramId) {
      try {
        console.log("[OAuth] Page search failed, trying direct lookup...");
        const meRes = await fetch(
          `https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=${accessToken}`
        );
        const meData = await meRes.json();
        if (meData.instagram_business_account?.id) {
          instagramId = meData.instagram_business_account.id;
          // Note: We still use the user accessToken here as a fallback, 
          // though some messaging features might need a page token.
          pageAccessToken = accessToken; 
          console.log(`[OAuth] Found IG Account via direct lookup: ${instagramId}`);
        }
      } catch (e) {
        console.error("[OAuth] Direct lookup failed:", e);
      }
    }

    if (!instagramId || !pageAccessToken) {
        console.error("[OAuth] No Instagram Business Account or Page Token found.");
        return NextResponse.redirect(`${origin}/integrations?error=no_instagram_business_account`);
    }

    // 4. Save the PAGE TOKEN to Database (Required for Messaging)
    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) throw new Error("User not found in DB");

    await db.integrations.upsert({
      where: { userId_name: { userId: dbUser.id, name: "INSTAGRAM" } },
      update: {
        token: pageAccessToken,
        instagramId: instagramId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: dbUser.id,
        name: "INSTAGRAM",
        token: pageAccessToken,
        instagramId: instagramId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[OAuth] Saved Page Token for Instagram ID: ${instagramId}`);
    revalidatePath("/integrations");

    return NextResponse.redirect(`${origin}/integrations?success=true`);
  } catch (err) {
    console.error("[OAuth] Fatal Error:", err);
    return NextResponse.redirect(`${origin}/integrations?error=internal_error`);
  }
}
