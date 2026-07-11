# Budget Tracker

Personal spending tracker web app. Tracks daily transactions, budgets by category, and shows monthly history.

Data is stored in **localStorage by default** — no account or internet connection needed. Optionally connects to Supabase for cloud sync and multi-user support.

---

## Running locally

**First time (after cloning):**

```bash
npm install
npm run dev
```

**Every time after that:**

```bash
npm run dev
```

Then open **http://localhost:5174** in your browser. Works immediately with local storage, no setup required.

---

## Enabling cloud sync (optional)

To sync data across devices or support multiple users, connect a Supabase project.

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database schema

In Supabase → **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.

### 3. Disable email confirmation (personal use)

In Supabase → **Authentication → Email**, turn off **"Enable email confirmations"** if this is just for you. Leave it on if others will sign up.

### 4. Add your credentials

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values from Supabase → **Project Settings → API**:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 5. Restart the dev server

```bash
npm run dev
```

You'll see a login page. Create an account and your data syncs to Supabase from that point on.

---

## Production build

```bash
npm run build
npm run preview
```

---

## Tech stack

- React + Vite
- Tailwind CSS
- Recharts (bar chart on Monthly History)
- date-fns
- Supabase (optional)
