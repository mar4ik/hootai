This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requirements

- Node.js version 18.18.0 or higher (Next.js 15+ requirement)
- Supabase account for authentication and database

## Getting Started

1. Create a `.env.local` file in the root directory with the following variables:

```bash
# OpenAI API Key - required for AI analysis
AZURE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration - required for authentication
NEXT_PUBLIC_SUPABASE_URL=https://eaennrqqtlmanbivdhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=https://vercel.com/mariam-morozovas-projects/hootai/settings/environments/production
```

2. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Set up the Supabase database:

First, create a Supabase project at [supabase.com](https://supabase.com) if you haven't already.

Then, you can set up the required database tables using one of these methods:

**Option A: Using the setup script (Recommended)**

Make the setup script executable and run it:

```bash
chmod +x scripts/setup-db.js
node scripts/setup-db.js
```

Follow the prompts to enter your Supabase URL and service role key.

**Option B: Manual setup**

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/lib/database-schema.sql`
4. Run the SQL in the Supabase SQL Editor

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- Upload CSV and PDF files for UX analysis
- Analyze website URLs
- Get AI-powered UX insights
- Authentication with Supabase
- User profiles with customizable display name and bio

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.