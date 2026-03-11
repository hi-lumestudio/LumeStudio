# Lume Studio Dashboard — Project Status

## DONE (All files created & npm installed)

### Config / Root
- [x] `package.json` — Next.js 14, TypeScript, Tailwind, Supabase SSR, shadcn deps, sonner
- [x] `tsconfig.json` — strict mode, path alias `@/*`
- [x] `next.config.js`
- [x] `tailwind.config.ts` — content paths configured
- [x] `postcss.config.js`
- [x] `.env.local` — Supabase URL + anon key set
- [x] `middleware.ts` — protects `/dashboard/*`, redirects unauthenticated to `/login`
- [x] `npm install` — all dependencies installed in `node_modules/`

### Lib
- [x] `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- [x] `lib/supabase/client.ts` — browser client (`createBrowserClient`)
- [x] `lib/supabase/server.ts` — server client with cookie handling

### UI Components (`components/ui/`)
- [x] `button.tsx` — variants: default (green), destructive, outline, ghost, link
- [x] `card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent
- [x] `input.tsx` — styled text input
- [x] `badge.tsx` — variants: success, warning, info, destructive, outline
- [x] `table.tsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- [x] `select.tsx` — Radix UI select with full styling
- [x] `avatar.tsx` — Radix UI avatar with fallback

### Dashboard Components (`components/dashboard/`)
- [x] `sidebar.tsx` — desktop fixed sidebar + mobile drawer, active nav highlight,
        logout button (calls supabase.auth.signOut), tenant name + email display

### App Pages
- [x] `app/globals.css` — Tailwind directives
- [x] `app/layout.tsx` — Inter font, Sonner `<Toaster>`
- [x] `app/page.tsx` — Landing page (hero, features, pricing, CTA, footer)
- [x] `app/login/page.tsx` — Email/password login, Supabase auth, redirect to /dashboard
- [x] `app/dashboard/layout.tsx` — Server component: auth check, passes user to Sidebar
- [x] `app/dashboard/page.tsx` — Overview: 4 stat cards, recent orders, recent conversations
- [x] `app/dashboard/conversations/page.tsx` — Customer list + chat bubble UI, split pane
- [x] `app/dashboard/crm/page.tsx` — CRM table, phone search, status filter
- [x] `app/dashboard/orders/page.tsx` — Orders table, status filter, inline status update
- [x] `app/dashboard/business-data/page.tsx` — AI Knowledge Base, inline edit + add + delete
- [x] `app/dashboard/settings/page.tsx` — Account info display, change password

---

## NEXT STEPS (to run locally)

### Step 1 — Verify Supabase anon key
The provided anon key `sb_publishable_4_zu-QlZlmSpl6JrSwaDYg_SlxNa1RA` is non-standard format
(normally starts with `eyJ...`). If login fails:
- Log in to https://supabase.com → Project Settings → API
- Copy the real `anon public` key (starts with `eyJ`)
- Update `.env.local`: `NEXT_PUBLIC_SUPABASE_ANON_KEY=<real-key>`

### Step 2 — Create the first user in Supabase
Since registration is disabled, create the admin user manually:
- Supabase Dashboard → Authentication → Users → "Invite user" or "Add user"
- Email: your email, Password: your password
- After creating, go to the user → Edit → User Metadata and add:
  ```json
  {
    "tenant_id": "default",
    "tenant_name": "The Little Bean"
  }
  ```

### Step 3 — Run the dev server
```bash
cd "C:\Users\Guildy Harvey\lume-studio-dashboard"
npm run dev
```
Open http://localhost:3000

### Step 4 — Test the app flow
1. Visit http://localhost:3000 → Landing page
2. Click "Login to Dashboard" → /login
3. Sign in with the user you created in Step 2
4. Should redirect to /dashboard (Overview)
5. Test each sidebar page

### Step 5 — (Optional) Row-Level Security on Supabase
Make sure your Supabase tables have RLS policies that allow authenticated users to
read/write rows where `tenant_id = 'default'` (or match their metadata).
- Supabase Dashboard → Table Editor → each table → RLS → Add policy
- Or run SQL to add policies (see Supabase docs)

### Step 6 — (Optional) Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add the env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## File Tree
```
lume-studio-dashboard/
├── .env.local
├── middleware.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                        ← Landing page
│   ├── login/
│   │   └── page.tsx                    ← Login form
│   └── dashboard/
│       ├── layout.tsx                  ← Auth check + sidebar
│       ├── page.tsx                    ← Overview stats
│       ├── conversations/page.tsx      ← Chat history UI
│       ├── crm/page.tsx                ← CRM table
│       ├── orders/page.tsx             ← Orders + status update
│       ├── business-data/page.tsx      ← AI knowledge base editor
│       └── settings/page.tsx           ← Account + password
├── components/
│   ├── ui/
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   └── dashboard/
│       └── sidebar.tsx
└── lib/
    ├── utils.ts
    └── supabase/
        ├── client.ts
        └── server.ts
```
