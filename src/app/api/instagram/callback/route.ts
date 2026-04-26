import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const redirectUri = `${origin}/api/instagram/callback`;

  if (error) {
    return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(error)}`);
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

    // 2. Step 1: Exchange code for Short-lived Access Token
    console.log("[OAuth] Exchanging code for short-lived token...");
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[OAuth] Token Exchange Error:", tokenData.error);
      return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(tokenData.error.message)}`);
    }

    const shortLivedToken = tokenData.access_token;

    // 3. Step 2: Exchange for Long-lived Access Token (60 days)
    console.log("[OAuth] Exchanging for long-lived token...");
    const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", clientId);
    longLivedUrl.searchParams.set("client_secret", clientSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const llTokenRes = await fetch(longLivedUrl.toString());
    const llTokenData = await llTokenRes.json();
    const finalAccessToken = llTokenData.access_token || shortLivedToken;

    // 4. Step 3: Identify Instagram Business Account
    let instagramId = null;
    
    // Method A: Try direct business asset lookup
    const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=${finalAccessToken}`);
    const meData = await meRes.json();
    
    if (meData.instagram_business_account) {
      instagramId = meData.instagram_business_account.id;
    }

    // Method B: Try via Pages lookup (most reliable if pages_show_list is granted)
    if (!instagramId) {
      const accountsRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username}&access_token=${finalAccessToken}`);
      const accountsData = await accountsRes.json();
      const pageWithIg = accountsData.data?.find((p: any) => p.instagram_business_account);
      if (pageWithIg) {
        instagramId = pageWithIg.instagram_business_account.id;
      }
    }

    // 5. Finalize Database Update
    const dbUser = await db.user.findUnique({ where: { clerkId: clerkId } });
    if (!dbUser) throw new Error("User not found in DB");

    // We save whatever ID we found, or even empty if we just want to save the token for now
    await db.integrations.upsert({
      where: { userId_name: { userId: dbUser.id, name: "INSTAGRAM" } },
      update: { 
        token: finalAccessToken, 
        instagramId: instagramId || "", 
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
      },
      create: { 
        userId: dbUser.id, 
        name: "INSTAGRAM", 
        token: finalAccessToken, 
        instagramId: instagramId || "", 
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
      }
    });

    console.log("[OAuth] Success! Integration updated.");
    revalidatePath("/integrations");
    
    if (!instagramId) {
       return NextResponse.redirect(`${origin}/integrations?success=true&error=no_instagram_id_found`);
    }

    return NextResponse.redirect(`${origin}/integrations?success=true`);

  } catch (err) {
    console.error("[OAuth Callback] Fatal Error:", err);
    return NextResponse.redirect(`${origin}/integrations?error=internal_server_error`);
  }
}
