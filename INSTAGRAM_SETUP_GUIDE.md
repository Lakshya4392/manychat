# 🚀 INSTAGRAM OAUTH FIX GUIDE

## Error: "Invalid platform app" or "Invalid OAuth redirect URI"

This error is **NOT a code bug**. It means your Meta (Facebook) Developer app is not configured correctly.

---

## ✅ Step-by-Step Setup (Follow Exactly)

### 1. Create Meta Developer App

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. **Choose type**: `Business` or `Consumer` (Both work)
4. Fill in:
   - App name: `My Instagram Bot` (or any name)
   - Contact email: your email
5. Click "Create App"

### 2. Add Required Products

In your app dashboard, click **"Add Product"** on the left sidebar:

Add these TWO products:

1. **Instagram Basic Display** → "Set Up"
2. **Webhooks** → "Set Up"

⚠️ DO NOT skip this step. "Basic Display" is required for OAuth.

### 3. Configure Instagram Basic Display

Click on **Instagram Basic Display** in the left sidebar:

#### **Basic Display → Settings**

- **Valid OAuth Redirect URIs**: 
  ```
  http://localhost:3000/api/instagram/callback
  ```
  (Add exactly this - no trailing slash)

- **Deauthorize Callback URL**:
  ```
  http://localhost:3000/api/instagram/callback
  ```

- **Data Deletion Request URL**:
  ```
  http://localhost:3000/api/instagram/callback
  ```

- **Data Use Checkup**: Complete if prompted

#### **Basic Display → Roles**

- Add your Instagram account as a **Test User** (if app in Development mode)
- OR switch app to **Live** (recommended - see step 4)

### 4. 🔥 CRITICAL: Switch App to LIVE MODE

This is the #1 cause of "Invalid platform app" error.

In your Meta App Dashboard:

1. Go to **App Review** → **Permissions and Features**
2. Find **"Make your app public?"** toggle
3. **Turn ON "Live"** (it says "Yes" when live)

OR:

In **App Dashboard** top-right, if you see a **"Development"** badge, click it → **"Go Live"**.

⚠️ If app is in Development mode:
- Only test users can connect
- Your personal Instagram may not be a test user
- You'll get "Invalid platform app" error

### 5. Get Your Credentials

In Meta Developer Console:

1. **Settings** → **Basic**
2. Copy:
   - **App ID** → `INSTAGRAM_CLIENT_ID` in `.env`
   - **App Secret** → `INSTAGRAM_CLIENT_SECRET` in `.env`
3. Click "Show" to reveal secret, then copy

### 6. Configure Webhooks (Optional for DM receiving)

If you want DMs to be received automatically:

1. In your app, click **Webhooks** → **"Add Subscription"**
2. Product: **Instagram**
3. Callback URL: `http://localhost:3000/api/webhook/instagram`
4. Verify Token: `skull_webhook_token_2024` (or whatever you set in `.env`)
5. Subscription Fields: Select `messages`, `messaging_postbacks`, `comments`, `story_mentions`
6. Click "Verify and Save"

⚠️ Webhooks only work if app is in **Live mode** or you're using a test user.

---

## 📋 .env File Should Look Like This

```bash
# DATABASE_URL - already set ✓
# CLERK keys - already set ✓

# Instagram
INSTAGRAM_CLIENT_ID=1457892355822350  # Your actual App ID from Meta
INSTAGRAM_CLIENT_SECRET=ece35129f6efca2c20e6b6b3102627ab  # Your actual App Secret
INSTAGRAM_VERIFY_TOKEN=skull_webhook_token_2024  # Any random string
NEXT_PUBLIC_HOST_URL=http://localhost:3000

# Optional
OPENAI_API_KEY=sk-your-openai-key  # For Smart AI
```

---

## 🧪 Testing the OAuth Flow

### Before testing Instagram connection:

1. **Restart dev server** after any `.env` changes:
   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Clear browser cookies** for localhost (Instagram auth uses cookies)

3. **Open console** (F12) → Network tab to see OAuth requests

### Test Connection:

1. Go to http://localhost:3000/integrations
2. Click "Connect Instagram"
3. Should redirect to `instagram.com` login
4. Login with your **Professional/Creator** Instagram account
5. Authorize the app
6. Should redirect back to `/integrations?success=connected`

---

## 🐛 Troubleshooting

### Error: "Invalid platform app"
**Fix:**
- App is in Development mode → Switch to Live
- OR add your Instagram as Test User in Meta → Instagram Basic Display → Roles

### Error: "Invalid OAuth redirect URI"
**Fix:**
- URI in Meta must EXACTLY match: `http://localhost:3000/api/instagram/callback`
- No trailing slash
- Must be `http` for localhost (not `https`)

### Error: "App not setup" or "This app is still in development mode"
**Fix:**
- App not set to Live → Go to App Review → toggle "Make public?" to YES
- OR add your Instagram as test user

### Error: "Instagram account must be a business account"
**Fix:**
- Your Instagram must be Professional or Creator
- Go to Instagram app → Settings → Account → Switch to Professional Account

### OAuth succeeds but integration shows "expired"
**Fix:**
- Token exchange might be failing - check server logs
- Verify `INSTAGRAM_CLIENT_SECRET` is correct

---

## 🔍 Debug Tools

I've added a debug page at: **http://localhost:3000/debug**

This page shows:
- All environment variables (SET/MISSING)
- Your DB user ID and plan
- Instagram integration status (token, expiry, Instagram ID)
- **Exact OAuth redirect URI** to copy into Meta

Visit `/debug` to verify everything is configured correctly.

---

## 📱 Instagram Account Setup (Required)

Your Instagram account MUST meet these requirements:

1. **Professional or Creator account** (not Personal)
   - Instagram app → Profile → Menu → Settings → Account → Switch to Professional

2. **Linked to a Facebook Page**
   - Instagram → Settings → Account → Linked Accounts → Facebook → Link

3. **Allow messages from everyone**
   - Instagram → Settings → Messages → Allow message requests from: Everyone

---

## 🚀 Quick Checklist

- [ ] Meta app created (Business or Consumer type)
- [ ] Instagram Basic Display product added
- [ ] Webhooks product added (optional but recommended)
- [ ] App switched to **Live** mode (NOT Development)
- [ ] Redirect URI added EXACTLY: `http://localhost:3000/api/instagram/callback`
- [ ] `INSTAGRAM_CLIENT_ID` copied to `.env`
- [ ] `INSTAGRAM_CLIENT_SECRET` copied to `.env`
- [ ] Dev server restarted after `.env` changes
- [ ] Instagram account is Professional/Creator
- [ ] Instagram linked to Facebook Page
- [ ] Using correct Instagram account (not personal)

---

## 📞 Still Stuck?

1. Open browser console (F12) → Network tab
2. Click "Connect Instagram"
3. Look at the OAuth request URL - is it correct?
4. Look at Instagram's error response - what does it say?

Common Meta errors:
- `Error validating verification code`: Client secret wrong
- `Invalid redirect_uri`: URI mismatch
- `App not setup`: App still in Development mode

---

**Once OAuth works, you can:**
1. Create automation in `/automations`
2. Set keywords + message
3. Send test DM to your IG
4. Webhook should trigger auto-reply
