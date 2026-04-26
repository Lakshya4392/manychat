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

    // 1. Exchange code for token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(tokenData.error.message)}`);
    }

    const accessToken = tokenData.access_token;
    let instagramId = null;
    let instagramUsername = "Instagram User";

    // 2. TRY DETECTION - Method A: Direct lookup via /me
    const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=${accessToken}`);
    const meData = await meRes.json();
    
    if (meData.instagram_business_account) {
      instagramId = meData.instagram_business_account.id;
    }

    // 3. TRY DETECTION - Method B: Via Accounts/Pages (Standard way)
    if (!instagramId) {
      const accountsRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username,name}&access_token=${accessToken}`);
      const accountsData = await accountsRes.json();
      
      const pageWithIg = accountsData.data?.find((p: any) => p.instagram_business_account);
      if (pageWithIg) {
        instagramId = pageWithIg.instagram_business_account.id;
        instagramUsername = pageWithIg.instagram_business_account.username || instagramUsername;
      }
    }

    // 4. TRY DETECTION - Method C: Search specifically for Instagram accounts
    if (!instagramId) {
       // Last ditch effort: try to see if there are any IG IDs in the linked_instagram_accounts
       const igRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=linked_instagram_accounts&access_token=${accessToken}`);
       const igData = await igRes.json();
       instagramId = igData.linked_instagram_accounts?.data?.[0]?.id;
    }

    if (!instagramId) {
      console.error("[OAuth] Could not find any Instagram Business account. Data received:", JSON.stringify(meData));
      return NextResponse.redirect(`${origin}/integrations?error=no_instagram_account&description=Please%20ensure%20your%20Instagram%20is%20a%20Business%20account%20and%20linked%20to%20a%20Facebook%20Page.`);
    }

    // 5. Save/Update in DB
    const dbUser = await db.user.findUnique({ where: { clerkId: clerkId } });
    if (!dbUser) throw new Error("User not found");

    await db.integrations.upsert({
      where: { userId_name: { userId: dbUser.id, name: "INSTAGRAM" } },
      update: { token: accessToken, instagramId: instagramId, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      create: { userId: dbUser.id, name: "INSTAGRAM", token: accessToken, instagramId: instagramId, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }
    });

    revalidatePath("/integrations");
    return NextResponse.redirect(`${origin}/integrations?success=true`);

  } catch (err) {
    console.error("[OAuth Callback] Unexpected Error:", err);
    return NextResponse.redirect(`${origin}/integrations?error=internal_error`);
  }
}
