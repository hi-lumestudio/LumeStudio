# Lume Studio — Complete Technical Documentation

> **Last Updated:** 20 March 2026
> **Author:** Harvey (Solo Founder)
> **Status:** Production — Multi-Tenant v4

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Supabase Database Schema](#3-supabase-database-schema)
4. [Supabase RPC Functions](#4-supabase-rpc-functions)
5. [n8n Workflow — Complete Flow](#5-n8n-workflow--complete-flow)
6. [n8n Node Reference](#6-n8n-node-reference)
7. [AI Prompt System](#7-ai-prompt-system)
8. [Next.js Dashboard](#8-nextjs-dashboard)
9. [WAHA (WhatsApp HTTP API)](#9-waha-whatsapp-http-api)
10. [Multi-Tenancy System](#10-multi-tenancy-system)
11. [Onboarding New Client](#11-onboarding-new-client)
12. [Pricing & Plans](#12-pricing--plans)
13. [Environment Variables & Credentials](#13-environment-variables--credentials)
14. [Known Issues & Fixes](#14-known-issues--fixes)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. System Architecture

```
Customer (WhatsApp)
       │
       ▼
   WAHA Server (wa.lumestudio.my.id)
       │ webhook POST
       ▼
   n8n Workflow (n8n.lumestudio.my.id)
       │
       ├── Lookup Tenant (by WAHA session → tenants table)
       ├── Extract Message Data
       ├── Upsert Customer (Supabase REST)
       ├── Save Incoming Message (Supabase)
       ├── Debounce (8s text / 3s image)
       ├── Check AI Enabled (per customer toggle)
       ├── Monthly Usage Tracking (RPC functions)
       ├── Quota Check (ai_responses < ai_limit)
       ├── Load Business Context (tenants.knowledge_base)
       ├── Load Chat History (last 10 messages)
       ├── Call OpenRouter AI (GPT-4o-mini)
       ├── Extract AI Reply + Revenue + Customer Name
       ├── Send Reply via WAHA
       ├── Save Messages to Supabase
       ├── CRM Update (customers table)
       └── Order Management (orders_v2 table)
       │
       ▼
   Supabase (PostgreSQL)
       │
       ▼
   Next.js Dashboard (lumestudio.my.id)
       │ Supabase Auth + RLS
       ▼
   Business Owner sees their data
```

**Key Principle:** 1 workflow serves ALL clients. Tenant routing is done by WAHA session name → `tenants.waha_session` lookup.

---

## 2. Tech Stack

| Component | Technology | Location |
|---|---|---|
| WhatsApp API | WAHA (self-hosted, Docker) | DigitalOcean VPS |
| Workflow Engine | n8n (self-hosted, Docker) | DigitalOcean VPS |
| AI Model (text) | GPT-4o-mini via OpenRouter | API |
| AI Model (vision) | GPT-4o-mini via OpenRouter | API |
| Database | Supabase (PostgreSQL) | Cloud |
| Dashboard | Next.js 14 (App Router) | Vercel |
| CSS | Tailwind CSS + shadcn/ui | - |
| Auth | Supabase Auth | Cloud |

**VPS Details:**
- Provider: DigitalOcean Singapore
- Spec: $12/mo, 2GB RAM, 1 CPU
- IP: 206.189.83.104
- OS: Ubuntu 24.04
- Domain: lumestudio.my.id
- Subdomains: n8n.lumestudio.my.id, wa.lumestudio.my.id

---

## 3. Supabase Database Schema

### 3.1 `tenants` — Client businesses

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | = Supabase Auth user UUID |
| `business_name` | TEXT | Client business name |
| `plan` | TEXT | 'starter' / 'pro' |
| `ai_limit` | INTEGER | Max AI responses per month (7500 starter, 20000 pro) |
| `status` | TEXT | 'active' / 'suspended' / 'trial' |
| `knowledge_base` | JSONB | Business context for AI (editable by client in dashboard) |
| `ai_prompt` | TEXT | System prompt for AI (HIDDEN from client) |
| `openrouter_api_key` | TEXT | OpenRouter API key (HIDDEN from client) |
| `waha_session` | TEXT | WAHA session name for routing |
| `owner_phone` | TEXT | Owner's WA number without @c.us |
| `show_watermark` | BOOLEAN | Show "Powered by lumestudio.my.id" (default true) |
| `subscription_end` | DATE | When subscription expires |
| `created_at` | TIMESTAMPTZ | Auto-generated |

### 3.2 `customers` — End customers of each client

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `tenant_id` | UUID FK→tenants | Which business this customer belongs to |
| `phone` | TEXT | WhatsApp phone (e.g. 6285126943725@c.us) |
| `name` | TEXT nullable | Customer name (detected by AI) |
| `status` | TEXT | 'active' / 'inactive' |
| `ai_enabled` | BOOLEAN | Toggle AI on/off per customer (default true) |
| `tags` | JSONB | Customer tags ["VIP", "Wholesale"] |
| `first_contact` | TIMESTAMPTZ | First message timestamp |
| `last_contact` | TIMESTAMPTZ | Last message timestamp (used for debounce) |
| `last_preview` | TEXT | Preview of last message |
| `message_count` | INTEGER | Total messages from this customer |
| **UNIQUE** | | `(tenant_id, phone)` |

### 3.3 `messages` — Full chat history

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT PK | Auto-increment |
| `customer_id` | UUID FK→customers | Which customer |
| `tenant_id` | UUID | Denormalized for RLS |
| `role` | TEXT | 'user' or 'assistant' |
| `content` | TEXT | Message text |
| `created_at` | TIMESTAMPTZ | Auto-generated (UTC) |

### 3.4 `orders_v2` — Orders

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `tenant_id` | UUID FK→tenants | Which business |
| `customer_phone` | TEXT | Customer phone |
| `order_summary` | TEXT | Order details text |
| `revenue` | NUMERIC | Product price (without shipping) |
| `status` | TEXT | 'waiting_payment' / 'confirmed' / 'shipped' |
| `created_at` | TIMESTAMPTZ | Auto-generated |
| `updated_at` | TIMESTAMPTZ | Auto-generated |

### 3.5 `monthly_usage` — AI quota tracking per month

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `tenant_id` | UUID FK→tenants | Which business |
| `month` | DATE | First day of month (e.g. '2026-03-01') |
| `total_messages` | INTEGER | Total messages received this month |
| `ai_responses` | INTEGER | Total AI responses this month |
| **UNIQUE** | | `(tenant_id, month)` |

### 3.6 `costs_v2` — Business expenses

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `tenant_id` | UUID FK→tenants | Which business |
| `amount` | NUMERIC | Cost amount |
| `category` | TEXT | Expense category |
| `description` | TEXT | Description |
| `date` | DATE | Expense date |
| `created_at` | TIMESTAMPTZ | Auto-generated |

---

## 4. Supabase RPC Functions

Two PostgreSQL functions handle atomic increment of monthly usage counters:

```sql
-- Increment total_messages
CREATE OR REPLACE FUNCTION increment_monthly_messages(p_tenant_id UUID, p_month DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO monthly_usage (tenant_id, month, total_messages, ai_responses)
  VALUES (p_tenant_id, p_month, 1, 0)
  ON CONFLICT (tenant_id, month)
  DO UPDATE SET total_messages = monthly_usage.total_messages + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment ai_responses
CREATE OR REPLACE FUNCTION increment_monthly_ai(p_tenant_id UUID, p_month DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO monthly_usage (tenant_id, month, total_messages, ai_responses)
  VALUES (p_tenant_id, p_month, 0, 1)
  ON CONFLICT (tenant_id, month)
  DO UPDATE SET ai_responses = monthly_usage.ai_responses + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Called via Supabase REST: `POST /rest/v1/rpc/increment_monthly_messages`

---

## 5. n8n Workflow — Complete Flow

### 5.1 Text Message Path

```
WAHA Webhook
  → Respond to WAHA (immediate 200 OK)
  → Filter Valid Messages (fromMe=false, has body, event=message)
  → Lookup Tenant (query tenants by waha_session)
  → Extract Message Data (set all variables)
  → Image or Text? [TEXT path]
  → Upsert Customer (HTTP upsert to customers table)
  → Save User Message (save incoming message to messages table)
  → Wait 8s (debounce)
  → Read Debounce (read customers.last_contact)
  → If Check Timestamp (is this the latest message?)
    → [YES] Check if AI Enabled
      → [YES] Upsert Monthly Messages (RPC increment)
        → Wait 2s
        → Load Chat History (last messages from messages table)
        → Limit Chat History (last 10, sorted)
        → Load Business Data (tenants.knowledge_base)
        → Load Tenant Config (tenants.ai_prompt, api_key)
        → Load Order Data (latest order for context)
        → Latest Order Only (sort by created_at)
        → Read Monthly Usage (current month counters)
        → If Quota OK (ai_responses < ai_limit)
          → [YES] Merge All Data (combine all context)
            → Call OpenRouter AI (GPT-4o-mini)
            → Extract AI Reply
            → Send Reply to Customer (via WAHA)
            → Save Assistant Reply (to messages table)
            → Check CRM Record → CRM Exists?
              → [YES] Update CRM Record
              → [NO] Create CRM Record
            → If (contains "Fix Order kak")
              → [YES] Extract Revenue → Save Waiting Payment → Notify Owner
            → Upsert Monthly AI (RPC increment ai_responses)
            → Extract Customer Name → If Has Name → Update Customer Name
          → [NO] Quota Exceeded Reply ("admin akan balas")
      → [NO] (skip — owner replies manually)
    → [NO] (skip — debounce, newer message exists)
```

### 5.2 Image Message Path

```
Image or Text? [IMAGE path]
  → Upsert Customer Image (HTTP upsert)
  → Save User Message1 (save to messages)
  → Wait 3s Image (debounce)
  → Read Debounce Image (customers.last_contact)
  → If Check Timestamp Image
    → [YES] Get many rows (check orders_v2 for waiting_payment)
      → If1 (has waiting_payment order?)
        → [YES — has pending order] Load Config Image
          → Download Image (from WAHA)
          → Convert Image to Base64
          → Open Router Vision (GPT-4o-mini vision, detail: low)
          → If Transfer Proof?
            → [YES] Update Order Status (waiting_payment → confirmed, by order id)
              → Sudah Transfer (reply to customer)
              → Save Image User Msg (save to messages)
              → Save Image Bot Reply (save to messages)
              → Notify Owner Transfer (notify owner)
              → Update CRM Image
            → [NO] Blm transfer (reply "akan dicek admin")
              → Save Img User NoTransfer
              → Save Img Bot NoTransfer
              → Update CRM Image
        → [NO — no pending order] Send a text message ("foto sudah kami terima")
          → Save User Message1
          → Save AI Message
```

---

## 6. n8n Node Reference

### Key Dynamic Nodes

| Node | Type | Function |
|---|---|---|
| **Lookup Tenant** | Supabase GET | Query `tenants` WHERE `waha_session` = session from webhook |
| **Extract Message Data** | Set | Sets all variables: tenantId, customerPhone, wahaSession, ownerPhone, businessName, showWatermark, timestamp |
| **Upsert Customer** | HTTP Request | POST to Supabase REST with `on_conflict=tenant_id,phone` + `return=representation` |
| **Check if AI Enabled** | If | Checks `customers.ai_enabled` from Read Debounce output |
| **Upsert Monthly Messages** | HTTP Request | POST to RPC `increment_monthly_messages` |
| **Upsert Monthly AI** | HTTP Request | POST to RPC `increment_monthly_ai` |
| **If Quota OK** | If | `ai_responses < ai_limit` |
| **Extract Customer Name** | Code | 4-method name detection (tag, Fix Order, kak, form) |
| **Update Customer Name** | Supabase Update | Updates `customers.name` if detected |
| **Update Order Status** | Supabase Update | Filter by order `id` (not customer_phone) |

### Nodes That Must NOT Be Changed

| Node | Reason |
|---|---|
| WAHA Webhook | Webhook path is registered in WAHA |
| Filter Valid Messages | Core message filtering logic |
| Vision flow (Download → Base64 → Vision) | Image processing pipeline |
| Debounce timing (8s text, 3s image) | Prevents duplicate AI responses |
| All WAHA send nodes | Core WhatsApp sending |

---

## 7. AI Prompt System

### 7.1 Required Tags (Workflow Will Break Without These)

| Tag | Example | Function | Read By |
|---|---|---|---|
| `<BR>` | `Halo kak!<BR>Apa kabar?` | Line break in regular messages | Send Reply to Customer |
| `\|` (pipe) | `Fix Order kak~\|PAYMENT\|...` | Line break in Fix Order messages | Send Reply to Customer |
| `Fix Order kak` | `Fix Order kak~ ✨\|...` | Triggers order creation | If (Fix Order check) |
| `REVENUE:number` | `REVENUE:200000` | Saves revenue to orders_v2 | Extract Revenue |
| `CUSTOMER_NAME:name` | `CUSTOMER_NAME:Guildy` | Updates customer name | Extract Customer Name |

### 7.2 Forbidden Tags

| Tag | Reason |
|---|---|
| `PESANAN_TERKONFIRMASI` | Removed from system. Order confirmation only via photo transfer proof. |
| `[]` brackets | AI must fill in actual values, not placeholders |

### 7.3 Prompt Structure (Universal Template)

Every client prompt must follow this structure:

```
INSTRUKSI UTAMA: Bahasa Indonesia only.

Kamu adalah admin WhatsApp untuk [NAMA_BISNIS].
Gaya bicara: [STYLE]

=== FORMAT PESAN ===
Wajib pakai <BR> untuk line break.

=== ALUR PERCAKAPAN ===
STEP 1 — Sapaan + info produk
STEP 2 — Form order
STEP 3 — Fix Order (with REVENUE tag)
STEP 4 — Customer bilang sudah transfer → minta kirim foto bukti
STEP 5 — Tidak ada bukti → admin akan bantu

=== ATURAN NAMA CUSTOMER ===
CUSTOMER_NAME:nama di akhir pesan jika tahu nama.

=== PERTANYAAN UMUM ===
[Client-specific FAQ]

=== LARANGAN ===
- Jangan jawab di luar topik bisnis
- Jangan kasih rekening sebelum form lengkap
- Jangan tulis REVENUE kalau bukan Fix Order
- Jangan pakai []
- Jangan lupa | untuk line break di Fix Order
```

### 7.4 Data Storage

| Field | Location | Editable By |
|---|---|---|
| `ai_prompt` | `tenants.ai_prompt` | Lume Studio admin only (HIDDEN from client) |
| `knowledge_base` | `tenants.knowledge_base` | Client via dashboard |
| `openrouter_api_key` | `tenants.openrouter_api_key` | Lume Studio admin only (HIDDEN from client) |

---

## 8. Next.js Dashboard

### 8.1 Project Structure

```
lume-studio-dashboard/
├── .env.local                          ← Supabase URL + keys
├── middleware.ts                       ← Auth check, redirect to /login
├── next.config.js
├── package.json                        ← Next.js 14, Supabase SSR, shadcn, recharts
├── tailwind.config.ts
├── app/
│   ├── globals.css
│   ├── layout.tsx                      ← Inter font, Sonner Toaster
│   ├── page.tsx                        ← Landing page (Indonesian)
│   ├── login/page.tsx                  ← Email/password login
│   └── dashboard/
│       ├── layout.tsx                  ← Server auth check, Sidebar
│       ├── page.tsx                    ← Overview: stats, revenue chart, AI usage
│       ├── conversations/page.tsx      ← Chat history UI (split pane)
│       ├── crm/page.tsx               ← Customer table + AI toggle
│       ├── orders/page.tsx            ← Orders + status management
│       ├── costs/page.tsx             ← Expense tracking CRUD
│       ├── business-data/page.tsx     ← Edit knowledge_base JSONB
│       └── settings/page.tsx          ← Account, password, watermark toggle
├── components/
│   ├── ui/                            ← shadcn components (button, card, input, etc.)
│   └── dashboard/
│       └── sidebar.tsx                ← Navigation + logout
└── lib/
    ├── utils.ts                       ← cn() helper
    └── supabase/
        ├── client.ts                  ← Browser client
        └── server.ts                  ← Server client with cookies
```

### 8.2 Auth Flow

1. User visits `/dashboard/*` → middleware checks Supabase auth
2. No session → redirect to `/login`
3. Login with email/password → Supabase Auth
4. User metadata contains `tenant_id` → all queries filter by this
5. RLS policies ensure users only see their own data

### 8.3 Dashboard Pages

| Page | Table(s) | Key Features |
|---|---|---|
| Overview | orders_v2, costs_v2, monthly_usage, customers | Stats cards, revenue chart, AI usage meter |
| Conversations | customers, messages | Split pane: customer list + chat bubbles |
| CRM | customers | Search, status filter, AI toggle, CSV export |
| Orders | orders_v2 | Status filter, batch status update |
| Costs | costs_v2 | CRUD expense tracking, monthly filter |
| Business Data | tenants.knowledge_base | Edit AI business context (JSONB) |
| Settings | tenants | Account info, change password, watermark toggle |

### 8.4 Table Name Migration (Old → New)

If dashboard code still uses old table names, update:

| Old Table | New Table | Column Changes |
|---|---|---|
| `crm` | `customers` | `customer_phone`→`phone`, `total_messages`→`message_count`, `last_message`→`last_preview` |
| `chat_history` | `messages` | `customer_phone`→`customer_id`, `message`→`content`, `timestamp`→`created_at` |
| `orders` | `orders_v2` | `order_time`→`created_at` |
| `costs` | `costs_v2` | Same structure |
| `business_data` | `tenants.knowledge_base` | Multiple rows → 1 JSONB column |
| `tenant_config` | `tenants` | Merged into tenants table |

### 8.5 Timestamps

- All timestamps stored in **UTC** in database
- Convert to **WIB (UTC+7)** when displaying in dashboard
- Use: `new Date(utcTimestamp).toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'})`

---

## 9. WAHA (WhatsApp HTTP API)

### 9.1 Configuration

| Setting | Value |
|---|---|
| Base URL | http://waha:3000 (internal Docker) |
| External URL | https://wa.lumestudio.my.id |
| API Key | lumestudio123 |
| Engine | NOWEB |
| Current Tier | Free (1 session: 'default') |

### 9.2 Webhook Payload

WAHA sends POST to n8n webhook with:

```json
{
  "body": {
    "event": "message",
    "session": "default",
    "payload": {
      "from": "6285126943725@c.us",
      "fromMe": false,
      "body": "halo",
      "hasMedia": false,
      "media": { "url": "..." },
      "quotedMsg": { "body": "..." }
    }
  }
}
```

### 9.3 Session Names

| WAHA Tier | Session | Multi-Client |
|---|---|---|
| Free (current) | `default` only | 1 client only |
| Paid (future) | Any name per client | Unlimited |

When upgrading to paid WAHA:
1. Create new session per client
2. Set `tenants.waha_session` to match session name
3. Scan QR from client's WA Business number
4. Workflow auto-routes via Lookup Tenant node

---

## 10. Multi-Tenancy System

### 10.1 How It Works

```
Message arrives → WAHA session name → Lookup Tenant → tenant UUID
                                                      ↓
                                              All downstream nodes
                                              use this tenant UUID
```

- `tenants.id` = Supabase Auth user UUID
- `tenants.waha_session` = WAHA session name (for routing)
- All data tables have `tenant_id` column for isolation
- RLS policies use `auth.uid()` = `tenant_id` for dashboard access
- n8n uses Service Role key (bypasses RLS)

### 10.2 What's Dynamic (No Hardcode)

| Data | Source |
|---|---|
| Tenant UUID | `Lookup Tenant` → `tenants.id` |
| WAHA Session | `Lookup Tenant` → `tenants.waha_session` |
| Owner Phone | `Lookup Tenant` → `tenants.owner_phone` |
| Business Name | `Lookup Tenant` → `tenants.business_name` |
| AI Prompt | `Load Tenant Config` → `tenants.ai_prompt` |
| API Key | `Load Tenant Config` → `tenants.openrouter_api_key` |
| Business Context | `Load Business Data` → `tenants.knowledge_base` |
| AI Limit | `Load Business Data` → `tenants.ai_limit` |
| Watermark | `Lookup Tenant` → `tenants.show_watermark` |

---

## 11. Onboarding New Client

### Step-by-Step Checklist

1. **☐ Create Supabase Auth user**
   - Supabase Dashboard → Authentication → Users → Add User
   - Note the auto-generated UUID

2. **☐ Prepare knowledge_base JSON**
   - Gather all business info: products, prices, hours, payment methods, etc.
   - Format as JSON object

3. **☐ Write ai_prompt**
   - Use universal template (Section 7.3)
   - Customize: business name, products, form fields, FAQ
   - MUST include all 5 required tags

4. **☐ Get/create OpenRouter API key**
   - https://openrouter.ai/keys

5. **☐ INSERT into tenants table**
   ```sql
   INSERT INTO tenants (
     id, business_name, plan, ai_limit, status,
     knowledge_base, ai_prompt, openrouter_api_key,
     waha_session, owner_phone, show_watermark
   ) VALUES (
     'UUID_FROM_AUTH',
     'Business Name',
     'starter',
     7500,
     'active',
     '{"key":"value"}',
     'prompt text...',
     'sk-or-v1-xxx',
     'session_name',
     '628xxxxxxxxxx',
     true
   );
   ```

6. **☐ Create WAHA session** (if paid tier)
   - Or use 'default' for free tier

7. **☐ Scan QR** from client's WA Business number

8. **☐ Test** — send WA message, check n8n execution log

9. **☐ Test full order flow** — message → form → fix order → photo transfer

10. **☐ Send dashboard credentials** to client

---

## 12. Pricing & Plans

| Feature | Starter (Rp 500K/bln) | Pro (Rp 1M/bln) |
|---|---|---|
| AI Responses/month | 7,500 | 20,000 |
| Watermark | Always shown | Can be turned off |
| Dashboard | ✓ | ✓ |
| CRM + Orders | ✓ | ✓ |
| AI Toggle per Customer | ✓ | ✓ |
| Business Data Editor | ✓ | ✓ |
| Expense Tracking | ✓ | ✓ |

**Cost per AI response (GPT-4o-mini):** ~Rp 0.5-2 per response
**Margin:** 95%+

---

## 13. Environment Variables & Credentials

### Supabase

| Key | Value |
|---|---|
| Project URL | https://hxpvwfxmxoxsdmmggsmx.supabase.co |
| Anon Key | sb_publishable_4_zu-QlZlmSpl6JrSwaDYg_SlxNa1RA |
| Service Role Key | (stored in n8n credentials) |
| n8n Credential ID | Eq4fmI7C8A8ujVhT |

### WAHA

| Key | Value |
|---|---|
| Internal URL | http://waha:3000 |
| External URL | https://wa.lumestudio.my.id |
| API Key | lumestudio123 |
| n8n Credential ID | 4vZXgOSPnhUFRmpI |

### n8n

| Key | Value |
|---|---|
| URL | https://n8n.lumestudio.my.id |
| Webhook Path | 1164b716-7ad3-4041-939d-d256e8965422 |

### Dashboard (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://hxpvwfxmxoxsdmmggsmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4_zu-QlZlmSpl6JrSwaDYg_SlxNa1RA
SUPABASE_SERVICE_ROLE_KEY=(stored separately)
```

---

## 14. Known Issues & Fixes

### 14.1 Upsert Customer JSON Error
**Problem:** Customer message with special characters (newlines, quotes) breaks JSON body.
**Fix:** Use `JSON.stringify()` in the HTTP Request body.

### 14.2 OpenRouter API Key Invalid Character
**Problem:** `\r\n` at end of API key causes "Invalid character in header" error.
**Fix:** Add `.trim()` to API key expression in Merge All Data node.

### 14.3 n8n Code Node — fetch/http not defined
**Problem:** n8n 2.12.3 task runner doesn't support `fetch` or `$http`.
**Fix:** Use HTTP Request nodes or Supabase RPC functions instead of Code nodes for API calls.

### 14.4 Debounce Loses Messages
**Problem:** Multiple messages sent quickly — only last one gets processed by AI.
**Fix:** Move Save User Message to BEFORE debounce wait (after Upsert Customer). All messages are saved, but only the latest triggers AI.

### 14.5 Update Order Status Updates Multiple Rows
**Problem:** Filtering by customer_phone + status matches all waiting_payment orders.
**Fix:** Filter by order `id` from Get many rows output: `$('Get many rows').first().json.id`

### 14.6 Get Many Rows Returns Wrong Customer's Order
**Problem:** Must Match set to "Any Filter" — matches on tenant_id alone.
**Fix:** Change Must Match to **"All Filters"**.

### 14.7 AI Doesn't Output CUSTOMER_NAME Tag
**Problem:** AI inconsistently outputs the name tag.
**Fix:** 4-method fallback in Extract Customer Name code node (tag → Fix Order → kak → form parse).

### 14.8 Vision API High Token Usage
**Problem:** ~50K tokens per image with GPT-4o-mini vision.
**Fix:** Add `"detail": "low"` to image_url in Open Router Vision node. Reduces to ~2-5K tokens.

---

## 15. Future Roadmap

### Near Term
- [ ] Switch AI model to Gemini 2.0 Flash (cost optimization)
- [ ] Monthly payment reminder automation
- [ ] Google Drive photo storage per customer
- [ ] Image forwarding to owner
- [ ] Self-serve dashboard: clients connect WA via QR code
- [ ] Stock management feature

### Mid Term
- [ ] Upgrade WAHA to paid tier (multi-session)
- [ ] Role-based access control (Admin vs Staff)
- [ ] Real-time chat sync (Omnichannel inbox)
- [ ] Automated receipts/emails on status change
- [ ] Customer segmentation/tagging

### Long Term
- [ ] Cold outreach system for Western market
- [ ] Landing page as foot-in-the-door product
- [ ] Full self-serve SaaS (no manual onboarding)

---

## Quick Reference Card

### Onboarding SQL Template

```sql
INSERT INTO tenants (id, business_name, plan, ai_limit, status,
  knowledge_base, ai_prompt, openrouter_api_key,
  waha_session, owner_phone, show_watermark)
VALUES ('UUID', 'Name', 'starter', 7500, 'active',
  '{}', 'prompt', 'sk-or-v1-xxx', 'session', '628xxx', true);
```

### Toggle AI for Customer

```sql
UPDATE customers SET ai_enabled = false
WHERE phone = 'xxx@c.us' AND tenant_id = 'UUID';
```

### Check Monthly Usage

```sql
SELECT * FROM monthly_usage
WHERE tenant_id = 'UUID' AND month = date_trunc('month', NOW())::date;
```

### Clean Test Data

```sql
DELETE FROM messages;
DELETE FROM orders_v2;
DELETE FROM monthly_usage;
DELETE FROM customers;
-- DO NOT delete tenants
```
