# Instagram DM Automation SaaS - Setup Guide

## ✅ Current Status

**Core Features Complete:**
- ✅ Automation builder (create, configure triggers/keywords, set actions)
- ✅ Instagram OAuth integration
- ✅ Webhook processing with keyword matching
- ✅ AI replies via OpenAI (GPT-4o-mini)
- ✅ Static message replies
- ✅ Feature gating (Free: 3 automations, 100 DMs/month)
- ✅ Usage tracking
- ✅ Real-time toggle

**Server Running** at http://localhost:3000

---

## 🔧 Required: Get Instagram API Credentials

Your app won't fully work until you configure Meta for Developers:

### Step 1: Create Facebook App
1. Go to https://developers.facebook.com/
2. Create a new app (choose "Business" or "Consumer" as needed)
3. Add **Instagram Basic Display** product
4. Add **Webhooks** product (for receiving DMs)

### Step 2: Configure OAuth
In your Facebook App settings:

**Instagram Basic Display:**
- Valid OAuth Redirect URIs: `http://localhost:3000/api/instagram/callback`
- Deauthorize Callback URL: `http://localhost:3000/api/instagram/callback`
- Data Deletion Request URL: `http://localhost:3000/api/instagram/callback`

**Webhooks:**
- Callback URL: `http://localhost:3000/api/webhook/instagram`
- Verify Token: Use the same as `INSTAGRAM_VERIFY_TOKEN` in your .env
- Subscribe to: `messages`, `messaging_postbacks`, `comments`, `story_mentions`

### Step 3: Get Credentials
From your Facebook App dashboard, copy:
- `INSTAGRAM_CLIENT_ID` → App ID
- `INSTAGRAM_CLIENT_SECRET` → App Secret

Add to `.env`:
```bash
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=abc123def456...
INSTAGRAM_VERIFY_TOKEN=your_random_string_here
```

### Step 4: Instagram Account Setup
⚠️ **Important:** The Instagram account you connect must be:
- **Professional** or **Creator** account (not Personal)
- Must be linked to a Facebook Page
- Must have "Allow messages from everyone" enabled in settings

---

## 📊 Database Tables

Your schema includes:

| Table | Purpose |
|-------|---------|
| `User` | Links Clerk user to app data |
| `Subscription` | Plan type (FREE/PRO) |
| `Integrations` | Instagram tokens, IDs |
| `Automation` | Individual automations |
| `Trigger` | Event types (MESSAGE, COMMENT, etc.) |
| `Keyword` | Words that trigger automations |
| `Listener` | Action config (type, prompt, reply) |
| `Dms` | Log of all messages |
| `Usage` | Monthly counters |

---

## 🎯 How to Test

1. **Start server:** `npm run dev`
2. **Sign up** at http://localhost:3000/sign-up
3. **Connect Instagram:**
   - Go to http://localhost:3000/integrations
   - Click "Connect Instagram"
   - Authorize via Meta
4. **Create Automation:**
   - Go to http://localhost:3000/automations
   - Click "+ Create Automation"
   - Add keywords like "hello", "buy", " interested"
   - Choose "Smart AI" or "Static Reply"
   - Set active toggle
5. **Send Test DM:**
   - From your personal Instagram, send DM to your business account
   - Message should contain one of your keywords
   - Bot should auto-reply
6. **Check logs:**
   - Go to http://localhost:3000/contacts
   - See conversation history

---

## 🔐 API Keys Checklist

**Required for core functionality:**
- ✅ `DATABASE_URL` — Already configured (Neon)
- ✅ `NEXT_PUBLIC_CLERK_*` — Already configured
- ⚠️ `INSTAGRAM_CLIENT_ID` — **MISSING**
- ⚠️ `INSTAGRAM_CLIENT_SECRET` — **MISSING**
- ⚠️ `INSTAGRAM_VERIFY_TOKEN` — **MISSING** (any random string)
- ⚠️ `OPENAI_API_KEY` — **MISSING** (get from platform.openai.com)

**For billing:**
- ⚠️ `STRIPE_SECRET_KEY` — Not needed until Stripe implemented
- ⚠️ `STRIPE_PUBLISHABLE_KEY` — Not needed yet
- ⚠️ `STRIPE_WEBHOOK_SECRET` — Not needed yet

---

## 📈 Project Structure Reference

```
src/
├── actions/          = Server Actions (mutations)
├── app/
│   ├── (dashboard)/ = Protected pages
│   ├── api/         = Route handlers (webhooks, OAuth)
│   └── layout.tsx   = Root layout
├── components/
│   ├── automations/ = Builder components
│   └── ui/          = shadcn components
└── lib/
    ├── instagram.ts     = Instagram API client
    ├── openai.ts        = AI service
    ├── automation-engine.ts  = Execution logic
    └── subscription.ts  = Feature gating
```

---

## 🐛 Troubleshooting

### Prisma Errors
If you see `PrismaClientInitializationError`:
```bash
npx prisma generate
# or if that fails:
rm -rf node_modules/.prisma
npm run dev
```

### Webhook Not Receiving DMs
1. Check Instagram Developer Console → Webhooks → subscription status
2. Verify URL is publicly accessible (use ngrok for local testing)
3. Check server logs for incoming requests

### OAuth Failures
1. Verify redirect URI matches exactly
2. Check Instagram app is in Live mode (not Development)
3. Ensure account is Professional/Creator

### AI Not Responding
1. Check `OPENAI_API_KEY` set correctly
2. Check quota on OpenAI dashboard
3. Check logs for rate limit errors

---

## 🚀 Deployment

When ready to deploy:

1. **Vercel/Netlify/Railway:**
   - Push to GitHub
   - Connect platform
   - Set all environment variables
   - Deploy

2. **Database:** Neon persists, no action needed

3. **Webhooks:** Update Instagram webhook URL to production URL

4. **Stripe:** Set up webhook endpoint to receive payments

---

## 📚 API Documentation

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/instagram/auth` | GET | Start OAuth flow |
| `/api/instagram/callback` | GET | OAuth callback |
| `/api/webhook/instagram` | POST | Receive Instagram events |

### Server Actions

All in `/actions/*.ts` and called directly from React components:

- `createAutomation()`
- `updateAutomation(id, data)`
- `addTrigger(automationId, types[])`
- `createKeyword(automationId, keyword)`
- `deleteKeyword(keywordId)`
- `updateListener(automationId, type, prompt, reply?)`

---

## 💰 Monetization

Current limits in `src/lib/subscription.ts`:

**Free Plan:**
- 3 automations
- 5 keywords per automation
- 100 DMs/month
- No Smart AI

**Pro Plan** (when Stripe added):
- Unlimited
- 10,000 DMs/month (can increase)
- Smart AI enabled
- Advanced analytics

---

## 🎯 Next Steps

1. **Get Instagram credentials** → Fill `.env`
2. **Test OAuth** → Click Connect in Integrations page
3. **Create test automation** → Add keyword "test"
4. **Send DM** → Verify reply
5. **Deploy** → When ready

---

**Questions?** Check the code comments or ask for specific features.
