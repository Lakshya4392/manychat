/**
 * Instagram Graph API Client
 * Uses Instagram Login + Instagram Graph API
 * 
 * Docs:
 *   - https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 *   - https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
 */

import { db } from "@/lib/db";

// Instagram Graph API base URL
const GRAPH_API_URL = "https://graph.instagram.com/v21.0";
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

export interface InstagramUser {
  id: string;
  username: string;
  name?: string;
  account_type?: string;
  media_count?: number;
  profile_picture_url?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramDM {
  id?: string;
  senderId: string;
  senderUsername: string;
  recipientId: string;
  message: string;
  timestamp: string;
  type: "DM" | "COMMENT" | "STORY_MENTION";
  mediaId?: string;
  commentId?: string;
}

class InstagramClient {
  /**
   * Refresh a long-lived Facebook/Page token
   * GET /oauth/access_token?grant_type=fb_exchange_token
   * 
   * Note: Page tokens obtained from long-lived user tokens are already long-lived
   * and don't expire. But user tokens need refreshing every 60 days.
   */
  async refreshToken(accessToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const url = new URL(`${GRAPH_API_URL}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", INSTAGRAM_CLIENT_ID!);
    url.searchParams.set("client_secret", INSTAGRAM_CLIENT_SECRET!);
    url.searchParams.set("fb_exchange_token", accessToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Send a direct message to a user via Instagram
   * POST /{ig-user-id}/messages
   * 
   * Requires: instagram_manage_messages, pages_messaging permissions
   * Token: Page access token (not user token)
   */
  async sendDM(recipientId: string, message: string, accessToken: string): Promise<{
    messageId: string;
  }> {
    const response = await fetch(`${GRAPH_API_URL}/me/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: {
          id: recipientId,
        },
        message: {
          text: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send DM: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { messageId: data.message_id || data.id };
  }

  /**
   * Get Instagram Business Account profile info
   * GET /{ig-user-id}?fields=id,username,name,profile_picture_url,media_count
   */
  async getUserProfile(accessToken: string, instagramId?: string): Promise<InstagramUser> {
    const id = instagramId || "me";
    const url = new URL(`${GRAPH_API_URL}/${id}`);
    url.searchParams.set("fields", "id,username,name,profile_picture_url,media_count");
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch user profile: ${error.error?.message || JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Get user media (posts)
   * GET /{ig-user-id}/media
   */
  async getUserMedia(
    userId: string,
    accessToken: string,
    limit = 10
  ): Promise<InstagramMedia[]> {
    const url = new URL(`${GRAPH_API_URL}/${userId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp");
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch user media");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get media comments
   * GET /{media-id}/comments
   */
  async getMediaComments(
    mediaId: string,
    accessToken: string
  ): Promise<{ id: string; username: string; text: string; timestamp: string }[]> {
    const url = new URL(`${GRAPH_API_URL}/${mediaId}/comments`);
    url.searchParams.set("fields", "id,username,text,timestamp");
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Reply to a comment
   * POST /{comment-id}/replies
   */
  async replyToComment(mediaId: string, commentId: string, message: string, accessToken: string): Promise<{
    commentId: string;
  }> {
    const url = new URL(`${GRAPH_API_URL}/${commentId}/replies`);
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to reply to comment");
    }

    const data = await response.json();
    return { commentId: data.id };
  }

   /**
    * Verify webhook subscription (GET request from Instagram/Facebook)
    */
   verifyWebhook(mode: string, token: string, _challenge: string): boolean {
     if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
       console.log("WEBHOOK_VERIFIED");
       return true;
     }
     return false;
   }

   /**
    * Parse incoming webhook payload
    * Identify the type of event and extract relevant data
    */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseWebhook(body: any): Array<{
      type: "DM" | "COMMENT" | "STORY_MENTION";
      senderId: string;
      senderUsername: string;
      recipientId: string;
      message: string;
      timestamp: string;
      mediaId?: string;
      commentId?: string;
    }> {
      const entries = body.entry || [];
      const events: Array<{
        type: "DM" | "COMMENT" | "STORY_MENTION";
        senderId: string;
        senderUsername: string;
        recipientId: string;
        message: string;
        timestamp: string;
        mediaId?: string;
        commentId?: string;
      }> = [];

      for (const entry of entries) {
        const { id: _entryId, time } = entry;

        // Handle messaging events (DMs) - check both 'messaging' and 'standby' arrays
        const messageEvents = [...(entry.messaging || []), ...(entry.standby || [])];
        
        for (const messaging of messageEvents) {
          if (messaging.message) {
            events.push({
              type: "DM",
              senderId: messaging.sender.id,
              senderUsername: messaging.sender.username || "unknown",
              recipientId: entry.id, // The business IG account ID (recipient)
              message: messaging.message.text || "",
              timestamp: time.toString(),
            });
          }
        }

        // Handle comment events (changes field)
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "comments" && change.value) {
              const v = change.value;
              events.push({
                type: "COMMENT",
                senderId: v.from?.id || "",
                senderUsername: v.from?.username || "unknown",
                recipientId: entry.id,
                message: v.text || "",
                timestamp: (v.created_time || time).toString(),
                mediaId: v.media?.id,
                commentId: v.id,
              });
            }

            if (change.field === "story_insights" || change.field === "mentions") {
              const v = change.value;
              events.push({
                type: "STORY_MENTION",
                senderId: v.from?.id || v.mentioned_user_id || "",
                senderUsername: v.from?.username || "unknown",
                recipientId: entry.id,
                message: v.text || "",
                timestamp: (v.timestamp || time).toString(),
              });
            }
          }
        }

        // Legacy: Handle direct comment/story arrays (kept for backwards compatibility)
        if (entry.comments) {
          for (const comment of entry.comments) {
            events.push({
              type: "COMMENT",
              senderId: comment.from.id,
              senderUsername: comment.from.username,
              recipientId: entry.id,
              message: comment.text,
              timestamp: comment.timestamp,
              mediaId: comment.media?.id,
              commentId: comment.id,
            });
          }
        }

        if (entry.story_mentions) {
          for (const mention of entry.story_mentions) {
            events.push({
              type: "STORY_MENTION",
              senderId: mention.from.id,
              senderUsername: mention.from.username,
              recipientId: entry.id,
              message: mention.text || "",
              timestamp: mention.timestamp,
            });
          }
        }
      }

      return events;
    }

  /**
   * Get Instagram access token for a user from database
   */
  async getUserToken(userId: string): Promise<string | null> {
    const integration = await db.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration) return null;

    // Check if token expired, refresh if needed
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      try {
        const refreshed = await this.refreshToken(integration.token);
        // Update token in DB
        await db.integrations.update({
          where: { id: integration.id },
          data: {
            token: refreshed.access_token,
            expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
          },
        });
        return refreshed.access_token;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
      }
    }

    return integration.token;
  }
}

export const instagram = new InstagramClient();
