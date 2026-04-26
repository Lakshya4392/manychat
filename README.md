# 🚀 Slide — Instagram DM Automation & AI Assistant

Slide is a premium, powerful Instagram automation platform designed for creators, brands, and businesses. Built with Next.js 15, it enables users to automate their Instagram workflows through keyword-triggered responses, Smart AI assistants, and real-time engagement tools.

![Slide Dashboard Preview](https://github.com/Lakshya4392/manychat/raw/master/public/dashboard-preview.png)

## ✨ Key Features

- **🛡️ Secure OAuth Integration**: Seamless connection via Facebook Login for Business with high-level encryption for access tokens.
- **⚡ Visual Automation Builder**: Create complex "When → If → Then" workflows with an intuitive, numbered UI.
- **🤖 Smart AI Responses**: Powered by OpenAI's GPT-4o-mini, providing contextual and personalized replies to fans and customers.
- **💬 Multi-Channel Triggers**: Trigger automations based on DMs, Post Comments, Story Mentions, and New Followers.
- **🏷️ Keyword Matching**: Fine-grained control over which messages trigger which automations.
- **📊 Performance Analytics**: Track total responses, active automations, and engagement stats through a premium dashboard.
- **🧪 Test Simulator**: Built-in environment to test your automation logic without needing real Instagram accounts.
- **🚀 Vercel Ready**: Optimized for edge deployment with Prisma acceleration.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI**: [OpenAI GPT-4o-mini](https://openai.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- A Meta Developer Account
- A Neon (PostgreSQL) database instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Lakshya4392/manychat.git

# Navigate to project directory
cd manychat

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="your_postgresql_url"
DIRECT_URL="your_direct_url"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_key"
CLERK_SECRET_KEY="your_secret"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Instagram API
INSTAGRAM_CLIENT_ID="your_facebook_app_id"
INSTAGRAM_CLIENT_SECRET="your_facebook_app_secret"
INSTAGRAM_VERIFY_TOKEN="your_custom_token"

# OpenAI
OPENAI_API_KEY="your_openai_key"

# App URL
NEXT_PUBLIC_HOST_URL="http://localhost:3000"
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```bash
├── src/
│   ├── actions/        # Server Actions (Auth, Automations, Triggers)
│   ├── app/           # Next.js App Router (Pages & API)
│   ├── components/    # UI Components & Feature-specific components
│   ├── hooks/         # Custom React Hooks
│   ├── lib/           # Utility functions & Service clients (Prisma, OpenAI, etc.)
│   └── types/         # TypeScript definitions
├── prisma/            # Database schema & migrations
└── public/            # Static assets
```

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/Lakshya4392/manychat/raw/master/public/automations-list.png" width="45%" alt="Automations List" />
  <img src="https://github.com/Lakshya4392/manychat/raw/master/public/builder.png" width="45%" alt="Visual Builder" />
</div>

## 🛡️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Built with ❤️ by [Lakshay Dhiman](https://github.com/Lakshya4392)
