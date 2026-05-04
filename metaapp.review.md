# Meta Instagram API Testing & Go-Live Guide

## Why is Development Mode so strict?
Meta restricts Instagram Graph API usage when an app is in **Development Mode**. To protect user privacy, Meta physically blocks all Instagram messaging webhooks unless the sender of the direct message is a recognized Meta Developer/Tester. 

**This means:** Random Instagram accounts cannot trigger your bot while in Development mode. 

## How to Test DMs in Development Mode
Since the sender and receiver cannot be the exact same Instagram account, and the sender must be verified by Meta, use one of these two methods:

### Method 1: The "Friend" Method (Easiest)
1. In the Meta Developer Dashboard, go to **App Roles** -> **Testers**.
2. Click **Add People**.
3. Search for a friend's **Facebook Account name** and add them.
4. Your friend must log into `developers.facebook.com` and **Accept the Invite** via the top-right notification bell.
5. Your friend can now DM your business account (`risec.ore`) from their Instagram, and the webhook will fire perfectly.

### Method 2: The "Dummy App Account" Method
If you don't have anyone to help test:
1. Create a brand new **Dummy Facebook Account**.
2. Open the Instagram App on your phone (logged into the test account you want to send DMs from, e.g., `lkbassnation`).
3. Go to Instagram Settings -> **Accounts Center**.
4. Click **Add Accounts** and link the new Dummy Facebook account you just created.
5. Go back to your Meta Developer Dashboard (`developers.facebook.com`).
6. In **App Roles** -> **Testers**, add the Dummy Facebook Account.
7. Log into `developers.facebook.com` using the Dummy Facebook Account and **Accept the Invite**.
8. You can now use `lkbassnation` to send test DMs.

## How to Go Live (Production)
You **cannot** just turn the app "Live". You must pass Meta's **App Review** first.

1. **Test Thoroughly:** You must get your system working flawlessly using one of the testing methods above.
2. **Screen Recording:** Record a video of the end-to-end flow:
   - A user connecting their Instagram via your SaaS (OAuth Auth Flow).
   - Your Tester account sending a DM to the business account.
   - Your SaaS automatically replying.
3. **Submit App Review:** Go to Meta Dashboard -> **App Review** -> **Requests**. Request approval for permissions like `instagram_manage_messages` and `pages_manage_metadata` and attach your video as proof.
4. **Wait:** Approval typically takes 2-5 days.
5. **Switch to Live:** Once approved, toggle your app from Development to Live. 

*Once Live, any Instagram user can DM your connected businesses, and no "Tester" accounts will be required.*
