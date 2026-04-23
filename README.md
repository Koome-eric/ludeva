# Ludeva MMF Web Application

This is a Next.js project for the Ludeva Money Market Fund (MMF) web application, focused on providing accessible, secure, and professionally managed investments in Kenya.

## Getting Started

### 1. Environment Setup

Create a file named `.env.local` in the root of your project. This file is critical for storing all your secret keys and configuration.

```
# Clerk API Keys (from your Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Auth Redirects (Required)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/member/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/investment

# Database Connection (Prisma)
# Example for PostgreSQL. Replace with your actual connection string.
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Payment Gateways (Leave blank if not yet configured)
# DARAJA_CONSUMER_KEY=
# DARAJA_CONSUMER_SECRET=
# DARAJA_BUSINESS_SHORT_CODE=
# DARAJA_PASSKEY=
# DARAJA_CALLBACK_URL=
# DARAJA_ENVIRONMENT=sandbox
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

### 2. Create a Clerk JWT Template (CRITICAL)

The application's middleware requires user metadata (`onboardingCompleted` and `role`) to be present in the session token to correctly handle redirects. **The app will not work correctly without this step.**

- In your Clerk Dashboard, navigate to **JWT Templates** in the left sidebar.
- Click **New template** and select the **Blank** template.
- Name it `ludeva_claims`.
- Copy the following JSON into the template editor:
  ```json
  {
    "metadata": {{user.public_metadata}}
  }
  ```
- Save the template.

### 3. Database Setup (Prisma)

This project uses Prisma as its ORM.

- **Push the schema**: This command syncs your `schema.prisma` file with your database.
  ```bash
  npx prisma db push
  ```
- **Seed the database**: This command populates your database with initial data, including an admin user.
  ```bash
  npx prisma db seed
  ```

### 4. Run the Development Server

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Admin Access

To access the admin dashboard:
1.  After seeding the database, a user with the email `admin@ludeva.com` is created.
2.  Sign up in the application using this email address.
3.  The `onboardingCompleted` and `role: 'admin'` flags are set by the seed script, so you will be automatically redirected to `/admin/dashboard`.

4. Add Admin Sidebar Link
In your admin sidebar/nav, add a link to /admin/team-analytics labelled "Team Analytics".
5. How It Works
Admin uploads a file

Goes to /admin/team-analytics
Enters a label (e.g. "June 2025 Analytics")
Selects a .csv, .xlsx, or .xls file
Clicks Upload — the file is parsed server-side, headers and rows stored in MongoDB

Public Teams page

TeamAnalyticsSection is a server component — it queries the DB directly at request time
Always shows the most recent upload automatically
If no analytics have been uploaded yet, the section is silently hidden
When the admin uploads a new file, the next page load reflects it immediately

Updating analytics

Simply upload a new file — it becomes LIVE instantly
Old uploads are kept as history in the admin panel
Only the latest record is shown publicly
Admins can delete old records from the history list

6. File Format Tips for Admins
Your CSV or Excel file should have:

Row 1: Column headers (e.g. Tier, Members, Total Contributions, Status)
Rows 2+: Data rows

Example CSV:
Tier,Active Members,Total Contributions (KES),Avg Payout (KES),Cycle Status
Nyota,10,100000,10000,Active
Pepea,8,160000,20000,Active
Alpha,10,300000,30000,Payout Phase