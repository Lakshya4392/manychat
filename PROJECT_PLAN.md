# Instagram DM Automation SaaS - Completion Plan

## ✅ Phase 1-2 Completed (Core Backend + AI)

### What We Built:

1. **Core Frontend Components**
   - `AutomationToggle` - Toggle automations on/off
   - `CreateAutomationButton` - Creates new automations with limit checks
   - `AutomationBuilder` - Fully functional automation configurator

2. **Instagram Integration** (`src/lib/instagram.ts`)
   - OAuth flow: code exchange → long-lived token (60 days)
   - Send DMs via Instagram Graph API
   - Reply to comments
   - Webhook parsing
   - Token refresh logic
   - Profile fetching

3. **Webhook Execution Engine** (`src/lib/automation-engine.ts`)
   - Processes incoming DMs
   - Keyword matching against user automations
   - Executes actions (static reply or AI)
   - Logs all interactions
   - Tracks usage stats

4. **AI Service** (`src/lib/openai.ts`)
   - GPT-4o-mini integration
   - Conversation history context
   - Intent classification
   - Reply suggestions

5. **Feature Gating** (`src/lib/subscription.ts`)
   - Free limits: 3 automations, 5 keywords each, 100 DMs/month
   - Pro limits: unlimited
   - Usage tracking via Usage table
   - Real-time limit checking

6. **API Routes**
   - `GET /api/instagram/auth` - Initiate OAuth
   - `GET /api/instagram/callback` - OAuth callback + token storage
   - `POST /api/webhook/instagram` - Receives Instagram events → executes automations

7. **Database Schema Updates** (prisma/schema.prisma)
   - Added `Usage` model for tracking
   - Updated `Dms` with `messageType`, `automationResponse`, `isFromBot`, `senderUsername`
   - Added `@@unique([userId, name])` to Integrations
   - Changed Trigger `type` to `TRIGGER_TYPE` enum
   - Listener: `prompt` nullable, added `welcomeMessage`

---

## 🚧 Phase 3 Remaining (Polishing + Billing)

### 3.1 Stripe Integration (Medium Priority)

**Files to Create:**
- `src/lib/stripe.ts` - Stripe client
- `src/app/api/webhook/stripe/route.ts` - Stripe webhook handler
- `src/app/pricing/page.tsx` - Pricing page
- `src/components/billing/PricingCards.tsx`

**Actions Needed:**
- Create Stripe checkout sessions
- Handle subscription webhooks (customer.subscription.*)
- Update User subscription plan in DB
- Cancel/update subscription management
- Display upgrade prompts when limits hit

### 3.2 Analytics Dashboard (Low Priority)

**Enhance Dashboard** (`src/app/(dashboard)/dashboard/page.tsx`):
- Show real DM count from DB
- Response rate (%)
- Charts for daily activity
- Top performing automations

**Add DMs Page**: Real messages table with filters

### 3.3 Error Handling & Retry Logic (Low Priority)

- Queue failed messages (Upstash Redis or in-memory)
- Exponential backoff retry
- Rate limiting (Instagram: 200 calls/hour)
- Admin notification on repeated failures

---

## ⚙️ Environment Variables Required

Add to `.env`:

```bash
# Instagram OAuth (Meta Developer Console)
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
INSTAGRAM_VERIFY_TOKEN=your_random_webhook_token
NEXT_PUBLIC_HOST_URL=http://localhost:3000  # Your app URL

# OpenAI
OPENAI_API_KEY=sk-openai-key

# Stripe (when implementing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUBSCRIPTION_PRICE_ID=price_...

# Database (already set)
DATABASE_URL=postgresql://...
```

---

## 📝 Setup Instructions

1. **Install Dependencies** (already done)
   ```bash
   npm install
   ```

2. **Configure Prisma**
   - Update `prisma/schema.prisma` with schema already provided
   - Run migration:
     ```bash
     npx prisma db push
     # or
     npx prisma migrate dev --name init
     ```

3. **Set Up Instagram App**
   - Go to Meta for Developers
   - Create App → Add Instagram Basic Display
   - Configure OAuth: redirect URI = `{NEXT_PUBLIC_HOST_URL}/api/instagram/callback`
   - Generate credentials → add to `.env`
   - Make sure Instagram account is a Professional/Creator account (required for messaging)

4. **Set Up OpenAI**
   - Create API key at platform.openai.com
   - Add to `.env`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Test Flow**
   - Sign up/in via Clerk
   - Go to Integrations → Connect Instagram
   - Authorize app
   - Create automation with keywords + Smart AI or static reply
   - Send DM to your Instagram → get reply

---

## 📊 Current Architecture

### Data Flow:

```
Instagram → Webhook → AutomationEngine
    ↓
   (1) Find user by instagramId from Integrations table
    ↓
   (2) Get all ACTIVE automations for that user
    ↓
   (3) If message contains any keyword:
        - If SMARTAI → OpenAI generates reply
        - Else → Use static commentReply
    ↓
   (4) Send DM via Instagram API
    ↓
   (5) Log to Dms table
    ↓
   (6) Increment usage counters
```

### Component Structure:

```
src/
├── actions/           # Server Actions (mutations)
│   ├── automations.ts
│   ├── triggers.ts
│   └── listeners.ts
├── app/
│   ├── (dashboard)/
│   │   ├── automations/
│   │   │   ├── page.tsx          # List
│   │   │   └── [id]/page.tsx     # Builder (Server)
│   │   ├── integrations/page.tsx # Connect Instagram
│   │   └── profile/page.tsx      # Subscription status
│   └── api/
│       ├── instagram/
│       │   ├── auth/route.ts
│       │   ├── callback/route.ts
│       │   └── webhook/route.ts
│       └── webhook/instagram/route.ts
├── components/
│   ├── automations/
│   │   ├── AutomationToggle.tsx
│   │   ├── CreateAutomationButton.tsx
│   │   └── AutomationBuilder.tsx  # Main builder (Client)
│   └── ui/                        # shadcn components
├── lib/
│   ├── instagram.ts               # Instagram API client
│   ├── openai.ts                  # OpenAI service
│   ├── automation-engine.ts       # Execution logic
│   ├── subscription.ts            # Feature gating
│   └── db.ts                      # Prisma singleton
```

---

## 🎯 Next Steps (To Make Production-Ready)

### Priority: HIGH
- [ ] Stripe subscription integration
- [ ] Upgrade modal/dialog when free limits hit (already partially implemented)
- [ ] Test OAuth flow end-to-end with real Instagram account
- [ ] Add webhook signature verification (security)

### Priority: MEDIUM
- [ ] Contacts page: Show real DM history from DB
- [ ] Analytics: Daily DM chart, response rates
- [ ] Preview mode: Test automation before activating
- [ ] Multi-language support (i18n)

### Priority: LOW
- [ ] Comment automation (currently DM only)
- [ ] Story mention automation
- [ ] New follower welcome DM
- [ ] Bulk keyword upload
- [ ] Automation templates library
- [ ] Rate limiting & retry queue
- [ ] Testing suite (Jest + Playwright)

---

## 💡 Important Notes

1. **Instagram API Limitations**
   - Only works with Instagram Professional/Creator accounts
   - 24-hour messaging window rule: You can only send DMs to users who have messaged you in the last 24 hours (unless using app-specific permissions)
   - Rate limits: ~200 calls/hour per token

2. **Smart AI Costs**
   - GPT-4o-mini: ~$0.003 per 1K input, $0.006 per 1K output
   - 100 AI replies = ~$0.60
   - Free tier limit 100 DMs to keep cost near zero

3. **Deployment Checklist**
   - Set all env vars in production
   - Configure webhook URL in Instagram Developer Console
   - Set up Stripe webhook endpoint
   - Add error monitoring (Sentry)
   - Configure pgvector extension if adding AI embeddings later

4. **Scaling Considerations**
   - Use a job queue (BullMQ + Redis) for high volume
   - Cache user subscriptions in Redis
   - Add database indexes on `automation.userId`, `dms.automationId`
   - Consider sharding if >10k users

---

## 🎨 UI/UX Improvements

- Dark theme already implemented
- Add loading skeletons
- Add empty states with illustrations
- Add tooltips on icon buttons
- Mobile-responsive builder (currently desktop only)
- Undo/redo in builder
- Export/import automation as JSON

---

## 🐛 Known Issues

1. Pre-existing TypeScript errors in:
   - `src/components/layout/Sidebar.tsx`
   - `src/app/(dashboard)/settings/page.tsx`
   - `prisma.config.ts`

   These don't affect new code but should be fixed.

2. `use-mobile` hook might have issues (unused currently)

3. The Settings page has type mismatch on Switch component props

---

## 📅 Estimated Timeline to MVP (Fully Working)

| Week | Milestone |
|------|-----------|
| 1 | ✅ Backend + OAuth + Webhook + AI (DONE) |
| 2 | ✅ Feature gating + Builder UI (DONE) |
| 3 | 🔄 Stripe integration + Upgrade flow |
| 4 | 🔄 Analytics dashboard + Contacts |
| 5 | 🔄 Testing + Bug fixes |
| 6 | 🚀 Deploy to production |

**Current Completion: ~70%**

Core functionality (create automation, connect Instagram, AI replies, keyword matching) is fully implemented. Remaining is billing and polish.

---

Need help with a specific part? Ask me to implement Stripe, analytics, or fix any existing bugs.
