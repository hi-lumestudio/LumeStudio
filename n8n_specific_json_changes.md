# Panduan Migrasi n8n Spesifik — (File Lume Studio v11)

Berdasarkan pengecekan file JSON n8n terbaru yang kamu berikan (`The Little Bean — WA Chatbot (OpenRouter + Supabase ) (11).json`), ini adalah **daftar spesifik** node yang harus diubah oleh Claude Code.

## 1. Tambahkan Node `Set Config` (PALING AWAL DARI SEGALANYA)
Buat satu node **Set** persis di sebelah/sebelum node "WAHA Webhook" (meskipun tidak disambung tidak apa-apa jika pakai expression global, tapi lebih baik WAHA tersambung ke ini dulu baru pecah ke "Respond" dan "Filter"). Lebih amannya, jangan sambungkan, cukup jadikan floating node yang dieksekusi pertama, atau gunakan Set node yang sudah ada yaitu `"Extract Message Data"` untuk memuat konfigurasi ini.

Di node **"Extract Message Data"**, **UBAH NILAI BERIKUT:**
* `tenantId`: Ubah dari `"thelittlebean"` menjadi `="1c1fe4ca-204f-4d9f-b643-504591adad07"` (UUID kamu)
* `wahaSession`: Tetap `"default"` (sudah benar, tidak di-hardcode di bawahnya)

---

## 2. Tabel `crm` → `customers`
Ada 4 node yang berinteraksi dengan CRM. Ubah dari `crm` menjadi `customers`, dan pastikan kolom-kolomnya sesuai schema baru:

* **[Read] "Check CRM Record"**:
  * `tableId`: Ubah `crm` → `customers`
  * `keyName: "customer_phone"` → `keyName: "phone"`

* **[Insert] "Create CRM Record"**:
  * `tableId`: Ubah `crm` → `customers`
  * Ubah nama field: `customer_phone` → `phone`
  * Ubah nama field: `total_messages` → hapus (di schema baru ada `message_count` tapi saat insert auto 0, atau isi `message_count: 1`)
  * Ubah nama field: `last_message` → `last_preview`

* **[Update] "Update CRM Record" (Jalur Chat AI)**:
  * `tableId`: Ubah `crm` → `customers`
  * Di `filters`: `customer_phone` → `phone`
  * Di `fieldsUi`: `last_message` → `last_preview`
  * Di `fieldsUi`: `total_messages` → `message_count` (isi value sesuaikan)

* **[Update] "Update CRM Image" (Jalur Kirim Gambar)**:
  * `tableId`: Ubah `crm` → `customers`
  * Di `filters`: `customer_phone` → `phone`
  * Di `fieldsUi`: `last_message` → `last_preview`

---

## 3. Tabel `chat_history` → `messages`
Ada 6 node yang berinteraksi dengan chat history. Ubah jadi tabel `messages`. Kolom `customer_phone` **DIHAPUS** diganti `customer_id` (UUID dari tabel customers).

* **[Read] "Load Chat History"**:
  * `tableId`: Ubah `chat_history` → `messages`
  * **Kritikal**: Karena query pakai nomor telepon, ubah node ini untuk lookup berdasarkan UUID (`customer_id`). Ini berarti query CRM ("Check CRM Record") harus dipindah ke atas agar ID customer-nya dapat, lalu node ini pakai ID tersebut. Atau query Supabase ini ubah jadi relasional (agak sulit di n8n node). Tergampang: **Ubah parameter "Check CRM Record" pindah ke atas sesudah "Extract Message Data", lalu semua Supabase messages referensi `customer_id` berdasar hasil CRM record tersebut.**

* **[Insert] "Save User Message", "Save Assistant Reply", "Save Image User Msg", "Save Image Bot Reply", "Save Img User NoTransfer", "Save Img Bot NoTransfer"**:
  * `tableId`: Ubah `chat_history` → `messages`
  * Hapus field: `customer_phone`
  * Hapus field: `timestamp` (sudah pakai default `created_at` di Supabase)
  * Tambahkan field: `customer_id` (diisi UUID customer)
  * Ubah field: `message` → `content`

---

## 4. Tabel `debounce` → DIHAPUS
Tabel `debounce` API call via REST dihapus. Semua sistem debounce "Wait" lalu "Read Debounce" masih bisa jalan **asal diarahkan ke tabel `customers`** lalu cek `last_contact`.

* **"Write Debounce" & "Write Debounce Image"**:
  * Node ini pakai Supabase REST API `v1/debounce`. Hapus node ini sepenuhnya.
  * Node "Update CRM" sudah otomatis berlaku sebagai write debounce karena dia meng-update `last_contact`.

* **"Read Debounce" & "Read Debounce Image"**:
  * `tableId`: Ubah `debounce` → `customers`
  * Kolom filter: `customer_phone` → `phone`
  * Kode if checking (`Wait 8s` / `Wait 3s` dll) ubah var `last_message_time` ke `last_contact`. Cek di "If Check Timestamp" dan "If Check Timestamp Image".

---

## 5. Tabel `business_data` → `tenants` (JSONB)
* **[Read] "Load Business Data"**:
  * `tableId`: Ubah `business_data` → `tenants`
  * Output lama (banyak baris): `[{ key: 'Jam', value: 'Buka' }]`
  * Output baru (1 baris): `[{ knowledge_base: { Jam: 'Buka' } }]`

* **"Aggregate Business Data"**:
  * Node ini hapus saja, karena hasil dari Supabase `tenants` sudah langsung jadi 1 JSON utuh (`knowledge_base`) yang siap dilempar ke "Merge All Data".

* **"Merge All Data"**:
  * Ubah mapping `businessContext`: Dari `$('Aggregate Business Data')...` menjadi langsung tembak ke property JSON di dalam hasil query "Load Business Data".

* **"Load Tenant Config" & "Load Config Image"**:
  * `tableId`: Ubah `tenant_config` → `tenants` (semua AI Limit/OpenRouter key sekarang bisa ditaruh di tabel tenants atau environment variables n8n untuk key API).
  * Daripada taruh `openrouter_api_key` di DB (TIDAK AMAN), sebaiknya jadikan Environment Variable di n8n atau di "Extract Message Data". Di config JSON tidak terlihat ini diamankan. Lume Studio baru sudah menghapus `tenant_config`. Pindahkan `openrouter_api_key` ke Set Node awal.

---

## 6. Tabel `orders` → `orders_v2`
* **"Load Order Data"**:
  * `tableId`: Ubah `orders` → `orders_v2`
  * `customer_phone`: (sudah sesuai)

* **"Latest Order Only"**:
  * Ganti sort property dari `order_time` menjadi `created_at`

* **"Get Many Rows" (Check Waiting Payment for image upload)**:
  * `tableId`: Ubah `orders` → `orders_v2`

* **"Save Waiting Payment"**:
  * `tableId`: Ubah `orders` → `orders_v2`
  * Hapus field: `order_time` (sudah pakai `created_at`)

* **"Update Order Status" & "Update Order Confirmed"**:
  * `tableId`: Ubah `orders` → `orders_v2`

---

## 7. Kuota Pemakaian & Limit AI (Bulan Ini)
Di Workflow versi 11 ini, **BELUM ADA TERCANTUM** checking `ai_limit` atau `monthly_usage`.
* **Tugas Tambahan untuk Claude Code**: Sisipkan 1 node Supabase `monthly_usage` (UPSERT) sebelum mengirim pesan ke OpenRouter, dan tambah 1 node `If` untuk mengecek apakah `monthly_usage < ai_limit`. Jika melebihi, tidak dikirim ke OpenRouter. (Seperti panduan migrasi besar sebelumnya).
