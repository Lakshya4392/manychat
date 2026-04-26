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
    console.log("[OAuth] Got access token ✓");

    // 3. Try MULTIPLE methods to find Instagram Business Account ID
    let instagramId: string | null = null;

    // Method A: Direct /me lookup
    try {
      console.log("[OAuth] Method A: Trying /me with instagram_business_account...");
      const meRes = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=${accessToken}`
      );
      const meData = await meRes.json();
      console.log("[OAuth] Method A response:", JSON.stringify(meData));
      if (meData.instagram_business_account?.id) {
        instagramId = meData.instagram_business_account.id;
        console.log("[OAuth] Method A found ID:", instagramId);
      }
    } catch (e) {
      console.log("[OAuth] Method A failed:", e);
    }

    // Method B: Via /me/accounts (Pages) 
    if (!instagramId) {
      try {
        console.log("[OAuth] Method B: Trying /me/accounts...");
        const pagesRes = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${accessToken}`
        );
        const pagesData = await pagesRes.json();
        console.log("[OAuth] Method B response:", JSON.stringify(pagesData));
        
        if (pagesData.data) {
          for (const page of pagesData.data) {
            if (page.instagram_business_account?.id) {
              instagramId = page.instagram_business_account.id;
              console.log("[OAuth] Method B found ID:", instagramId);
              break;
            }
          }
        }
      } catch (e) {
        console.log("[OAuth] Method B failed:", e);
      }
    }

    // Method C: Try the debug_token endpoint to get user_id
    if (!instagramId) {
      try {
        console.log("[OAuth] Method C: Trying debug_token...");
        const debugRes = await fetch(
          `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${clientId}|${clientSecret}`
        );
        const debugData = await debugRes.json();
        console.log("[OAuth] Method C response:", JSON.stringify(debugData));
        
        // The granular_scopes might contain the Instagram account ID
        if (debugData.data?.granular_scopes) {
          for (const scope of debugData.data.granular_scopes) {
            if (scope.scope === "instagram_manage_comments" && scope.target_ids?.length > 0) {
              // These target_ids are the Page IDs, we can use them to find IG account
              for (const pageId of scope.target_ids) {
                const pageIgRes = await fetch(
                  `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account{id,username}&access_token=${accessToken}`
                );
                const pageIgData = await pageIgRes.json();
                console.log("[OAuth] Method C page lookup:", JSON.stringify(pageIgData));
                if (pageIgData.instagram_business_account?.id) {
                  instagramId = pageIgData.instagram_business_account.id;
                  console.log("[OAuth] Method C found ID:", instagramId);
                  break;
                }
              }
              if (instagramId) break;
            }
          }
        }
      } catch (e) {
        console.log("[OAuth] Method C failed:", e);
      }
    }

    // 4. Save to Database
    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) throw new Error("User not found in DB");

    await db.integrations.upsert({
      where: { userId_name: { userId: dbUser.id, name: "INSTAGRAM" } },
      update: {
        token: accessToken,
        instagramId: instagramId || "",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: dbUser.id,
        name: "INSTAGRAM",
        token: accessToken,
        instagramId: instagramId || "",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[OAuth] Saved! Instagram ID: ${instagramId || "NOT_FOUND"}`);
    revalidatePath("/integrations");

    if (instagramId) {
      return NextResponse.redirect(`${origin}/integrations?success=true`);
    } else {
      return NextResponse.redirect(`${origin}/integrations?success=true&warning=instagram_id_not_found`);
    }
  } catch (err) {
    console.error("[OAuth] Fatal Error:", err);
    return NextResponse.redirect(`${origin}/integrations?error=internal_error`);
  }
}
