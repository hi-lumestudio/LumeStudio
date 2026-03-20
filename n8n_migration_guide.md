# Panduan Migrasi n8n — Lume Studio Database Baru

## Konteks Proyek

Lume Studio adalah dashboard manajemen untuk sistem CRM WhatsApp otomatis. Arsitektur:
- **WAHA** (WhatsApp HTTP API) → menghubungkan ke WA Business
- **n8n** → interceptor webhook, orchestrator workflow
- **ChatGPT 4o-Mini** → AI customer service otomatis
- **Supabase** → database PostgreSQL (semua data tersimpan di sini)
- **Next.js** (Lume Studio Dashboard) → frontend untuk pemilik bisnis melihat data

---

## ⚠️ PRINSIP UTAMA: TIDAK ADA HARDCODE

Semua nilai tenant-specific **HANYA didefinisikan 1x** di node pertama workflow (`Set Config`). Semua node setelahnya harus **referensikan variabel**, bukan hardcode.

Jika ada klien baru, yang perlu diubah **HANYA** node pertama ini saja (atau buat workflow baru yang meng-copy workflow ini lalu ganti config-nya).

---

## NODE [0]: Set Config (PALING PERTAMA — WAJIB ADA)

Node pertama di workflow. Tipe: **Set Node** (atau Code Node).

```javascript
// NODE PERTAMA — satu-satunya tempat yang boleh di-hardcode
return {
  // === TENANT CONFIG ===
  TENANT_ID: '1c1fe4ca-204f-4d9f-b643-504591adad07',  // UUID dari Supabase Auth
  
  // === WAHA CONFIG ===
  WAHA_SESSION: 'default',     // WAHA free tier = 'default'
  WAHA_BASE_URL: 'http://localhost:3000',  // URL WAHA instance
  
  // === AI CONFIG ===
  MAX_CONTEXT_MESSAGES: 10,    // jumlah pesan terakhir yang dikirim ke AI
};
```

### Tentang WAHA Session

| WAHA Tier | Session Name | Penjelasan |
|---|---|---|
| **Free (sekarang)** | `'default'` | Hanya bisa 1 session, namanya selalu `default` |
| **Berbayar (nanti)** | Bebas, e.g. `'thelittlebean'` | Bisa multi-session. Buat session baru per klien |

**Saat upgrade WAHA ke berbayar:**
1. Cukup ubah `WAHA_SESSION` di node [0] dari `'default'` ke nama session baru
2. Di WAHA dashboard, buat session baru dengan nama yang sama
3. Scan QR dari nomor WA klien
4. Semua node lainnya **tidak perlu diubah** karena sudah pakai variabel `{{ $json.WAHA_SESSION }}`

**Untuk multi-klien (nanti):**
- Buat 1 workflow per klien (copy-paste)
- Ubah hanya `TENANT_ID` dan `WAHA_SESSION` di node [0]
- Atau: buat 1 workflow dengan lookup otomatis berdasarkan nomor WA yang diterima di webhook

---

## Perubahan Database: LAMA → BARU

### Tabel yang DIHAPUS (jangan pakai lagi!)
| Tabel Lama | Pengganti |
|---|---|
| `chat_history` | `messages` |
| `crm` | `customers` |
| `tenant_config` | `tenants` |
| `business_data` | `tenants.knowledge_base` (kolom JSONB) |
| `debounce` | `customers.last_contact` |
| `orders` | `orders_v2` |
| `costs` | `costs_v2` |

### Tabel BARU (6 tabel total)

#### 1. `tenants`
```
id              UUID PRIMARY KEY  ← auth.uid() dari Supabase Auth
business_name   TEXT
plan            TEXT              ← 'starter' / 'pro' / 'enterprise' / 'trial'
ai_limit        INTEGER           ← batas respons AI per bulan
subscription_end DATE
status          TEXT              ← 'active' / 'suspended' / 'trial'
knowledge_base  JSONB             ← semua konteks bisnis AI dalam 1 JSON
created_at      TIMESTAMPTZ
```

#### 2. `customers`
```
id              UUID PRIMARY KEY (auto-generated)
tenant_id       UUID              ← FK ke tenants.id
phone           TEXT
name            TEXT (nullable)    ← nama pelanggan (diisi AI saat tahu)
status          TEXT              ← 'active' / 'inactive'
tags            JSONB             ← ["VIP", "Wholesale"]
first_contact   TIMESTAMPTZ
last_contact    TIMESTAMPTZ
last_preview    TEXT              ← preview pesan terakhir
message_count   INTEGER
UNIQUE(tenant_id, phone)
```

#### 3. `messages`
```
id              BIGINT (auto-increment)
customer_id     UUID              ← FK ke customers.id
tenant_id       UUID              ← denormalized untuk RLS
role            TEXT              ← 'user' / 'assistant'
content         TEXT
created_at      TIMESTAMPTZ
```

#### 4. `monthly_usage`
```
id              UUID PRIMARY KEY
tenant_id       UUID              ← FK ke tenants.id
month           DATE              ← hari pertama bulan, e.g. '2026-03-01'
ai_responses    INTEGER           ← counter AI bulan ini
total_messages  INTEGER
UNIQUE(tenant_id, month)
```

#### 5. `orders_v2`
```
id              UUID PRIMARY KEY
tenant_id       UUID
customer_phone  TEXT
order_summary   TEXT
revenue         NUMERIC
status          TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### 6. `costs_v2`
```
id              UUID PRIMARY KEY
tenant_id       UUID
amount          NUMERIC
category        TEXT
description     TEXT
date            DATE
created_at      TIMESTAMPTZ
```

---

## Perubahan `tenant_id`

| Sebelum | Sesudah |
|---|---|
| TEXT (e.g. `'thelittlebean'`) | UUID dari Supabase Auth (e.g. `'1c1fe4ca-204f-4d9f-b643-504591adad07'`) |

**Semua node referensikan:** `{{ $('Set Config').item.json.TENANT_ID }}`

---

## Alur n8n yang Harus Diubah

### ALUR UTAMA: Pesan Masuk dari WhatsApp

```
[0] Set Config (TENANT_ID, WAHA_SESSION, dll)
    ↓
WAHA Webhook (pesan masuk)
    ↓
[1] UPSERT ke `customers`
    ↓
[2] INSERT ke `messages` (role: 'user')
    ↓
[3] UPSERT `monthly_usage` (total_messages + 1)
    ↓
[4] CEK KUOTA dari `monthly_usage` + `tenants`
    ↓
[5] IF kuota habis → kirim pesan standar via WAHA, STOP
    ↓
[6] AMBIL KONTEKS dari `tenants.knowledge_base`
    ↓
[7] AMBIL 10 PESAN TERAKHIR dari `messages`
    ↓
[8] KIRIM KE ChatGPT (knowledge + 10 pesan terakhir)
    ↓
[9] INSERT BALASAN AI ke `messages` (role: 'assistant')
    ↓
[10] UPSERT `monthly_usage` (ai_responses + 1)
    ↓
[11] UPDATE `customers` (last_contact, last_preview)
    ↓
[12] KIRIM BALASAN via WAHA (pakai WAHA_SESSION dari config)
    ↓
[13] (OPSIONAL) UPDATE `customers.name` jika AI mendeteksi nama
```

---

### Detail Setiap Node

> Di semua node di bawah ini, setiap kali kamu melihat `{{ CONFIG.TENANT_ID }}`, itu berarti referensikan node [0]: `{{ $('Set Config').item.json.TENANT_ID }}`. Jangan pernah menulis UUID langsung!

#### [1] UPSERT `customers`
**Tabel lama:** `crm`
**Tabel baru:** `customers`

```
Operasi: UPSERT (INSERT ... ON CONFLICT UPDATE)
Tabel: customers
Data:
  tenant_id: {{ CONFIG.TENANT_ID }}
  phone: {{ $json.body.from }}
  status: 'active'
  last_contact: NOW()
  last_preview: {{ $json.body.text }}
Conflict: (tenant_id, phone)
On Conflict Update: last_contact, last_preview, message_count = message_count + 1
```

Jika customer baru, otomatis `first_contact = NOW()` dan `message_count = 1`.

#### [2] INSERT `messages` (pesan user)
**Tabel lama:** `chat_history`
**Tabel baru:** `messages`

```
Operasi: INSERT
Tabel: messages
Data:
  customer_id: {{ customer.id }}       ← UUID dari hasil UPSERT [1]
  tenant_id: {{ CONFIG.TENANT_ID }}
  role: 'user'
  content: {{ $json.body.text }}
  created_at: NOW()
```

#### [3] UPSERT `monthly_usage` (total pesan)
**Tabel lama:** tidak ada (baru!)
**Tabel baru:** `monthly_usage`

```
Operasi: UPSERT
Tabel: monthly_usage
Data:
  tenant_id: {{ CONFIG.TENANT_ID }}
  month: date_trunc('month', NOW())::date
  total_messages: 1
Conflict: (tenant_id, month)
On Conflict Update: total_messages = total_messages + 1
```

#### [4] CEK KUOTA AI
**Tabel lama:** COUNT(*) dari `chat_history` (LAMBAT!)
**Tabel baru:** 2 SELECT sederhana

```
Query 1 - Ambil limit:
  SELECT ai_limit FROM tenants WHERE id = {{ CONFIG.TENANT_ID }}

Query 2 - Ambil pemakaian bulan ini:
  SELECT ai_responses FROM monthly_usage 
  WHERE tenant_id = {{ CONFIG.TENANT_ID }} 
  AND month = date_trunc('month', NOW())::date
```

#### [5] IF Node
```
Kondisi: usage.ai_responses < tenants.ai_limit
  TRUE  → lanjut ke ChatGPT
  FALSE → kirim pesan standar via WAHA, STOP
```

Pesan standar: "Mohon maaf, asisten AI kami sedang tidak tersedia. Pesan Anda akan dibalas oleh admin."

#### [6] AMBIL KONTEKS BISNIS
**Tabel lama:** `SELECT * FROM business_data WHERE tenant_id = X` (banyak baris)
**Tabel baru:** `SELECT knowledge_base FROM tenants WHERE id = X` (1 baris, 1 kolom JSONB!)

```
Operasi: SELECT
Tabel: tenants
Kolom: knowledge_base
Filter: id = {{ CONFIG.TENANT_ID }}
```

Hasilnya adalah 1 objek JSON → kirim langsung ke system prompt ChatGPT.

#### [7] AMBIL PESAN TERAKHIR
**Tabel lama:** `SELECT * FROM chat_history WHERE customer_phone = X` (semua pesan)
**Tabel baru:** `SELECT FROM messages WHERE customer_id = X LIMIT N`

```
Operasi: SELECT
Tabel: messages
Kolom: role, content
Filter: customer_id = {{ customer.id }}
Order: created_at DESC
Limit: {{ CONFIG.MAX_CONTEXT_MESSAGES }}
```

Balik urutannya (ASC) sebelum kirim ke ChatGPT.

#### [8] KIRIM KE ChatGPT
Format input berubah:
- System prompt: JSON dari `tenants.knowledge_base`
- Messages: array dari `messages` (maks 10)

#### [9] INSERT BALASAN AI ke `messages`
```
Operasi: INSERT
Tabel: messages
Data:
  customer_id: {{ customer.id }}
  tenant_id: {{ CONFIG.TENANT_ID }}
  role: 'assistant'
  content: {{ chatGptResponse }}
  created_at: NOW()
```

#### [10] UPSERT `monthly_usage` (counter AI)
```
Operasi: UPSERT
Tabel: monthly_usage
Data:
  tenant_id: {{ CONFIG.TENANT_ID }}
  month: date_trunc('month', NOW())::date
  ai_responses: 1
Conflict: (tenant_id, month)
On Conflict Update: ai_responses = ai_responses + 1
```

#### [11] UPDATE `customers`
```
Operasi: UPDATE
Tabel: customers
Filter: id = {{ customer.id }}
Data:
  last_contact: NOW()
  last_preview: {{ chatGptResponse }}
```

#### [12] KIRIM VIA WAHA
```
HTTP Request:
  URL: {{ CONFIG.WAHA_BASE_URL }}/api/sendText
  Body:
    session: {{ CONFIG.WAHA_SESSION }}     ← dari config, BUKAN hardcode!
    chatId: {{ $json.body.from }}@c.us
    text: {{ chatGptResponse }}
```

#### [13] (OPSIONAL) UPDATE Nama Pelanggan
Jika AI mendeteksi nama (e.g. pelanggan bilang "nama saya Budi"):

```
Operasi: UPDATE
Tabel: customers
Filter: id = {{ customer.id }}
Data:
  name: {{ detectedName }}
```

Untuk fitur ini, ubah ChatGPT response format ke JSON:
```
System prompt tambahan:
"Selalu balas dalam format JSON: { "reply": "teks balasanmu", "customer_name": "nama jika diketahui atau null" }"
```

n8n lalu parse JSON → kirim `reply` via WAHA, dan jika `customer_name` tidak null → UPDATE `customers.name`.

---

### ALUR ORDER: Saat AI Membuat Pesanan
```
Tabel lama: orders
Tabel baru: orders_v2
Data:
  tenant_id: {{ CONFIG.TENANT_ID }}
  customer_phone: {{ $json.body.from }}
  order_summary: {{ orderSummary }}
  revenue: {{ orderAmount }}
  status: 'waiting payment'
  created_at: NOW()
```

---

## Debounce

**Tabel lama:** `debounce` (tabel khusus)
**Tabel baru:** Gunakan `customers.last_contact`

Di n8n, setelah menerima webhook dari WAHA:
1. SELECT `last_contact` FROM `customers` WHERE `tenant_id` = {{ CONFIG.TENANT_ID }} AND `phone` = X
2. Jika `NOW() - last_contact < 3 detik` → skip (debounce)
3. Jika sudah lewat → proses seperti biasa

---

## Scaling ke Multi-Klien (Masa Depan)

Saat Lume Studio punya >1 klien:

**Opsi A — 1 Workflow per Klien (Simpel)**
- Copy workflow → ubah node [0] (TENANT_ID + WAHA_SESSION) → selesai
- Cocok untuk 1-10 klien

**Opsi B — 1 Workflow, Auto-Lookup (Canggih)**
- Node [0] diganti: lookup `TENANT_ID` dari tabel `tenants` berdasarkan nomor WA yang diterima
- Perlu tabel tambahan: `waha_sessions` (session → tenant_id mapping)
- Cocok untuk 10+ klien

---

## Tabel Lama yang Bisa Dihapus (Setelah Migrasi n8n Selesai)

```sql
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS crm;
DROP TABLE IF EXISTS tenant_config;
DROP TABLE IF EXISTS business_data;
DROP TABLE IF EXISTS debounce;
-- orders dan costs JANGAN dihapus sampai yakin orders_v2 / costs_v2 berjalan baik
```
