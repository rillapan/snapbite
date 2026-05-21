# Alur Kerja SnapBite — Dokumentasi Lengkap

---

## Ringkasan Proyek

**SnapBite** adalah platform penemuan kuliner Indonesia berbasis AI. Pengguna cukup upload foto makanan, lalu sistem AI akan mengenali nama makanan, asal daerah, sejarah budaya, dan lokasi restoran terbaik untuk menikmatinya.

---

## Teknologi yang Digunakan

| Kategori | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 | Routing, SSR, SSG, API Routes |
| UI Library | React | 19.2.4 | Komponen antarmuka |
| Bahasa | TypeScript | 5 | Type safety di seluruh codebase |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| Animasi UI | Framer Motion | 12.x | CardStack 3D, transisi halus |
| Animasi 3D | Three.js | 0.184 | Efek partikel di scanner overlay |
| AI Vision | Google Gemini API | 0.24.x | Identifikasi makanan dari foto |
| Komponen | Radix UI + CVA | — | Button, Input, accessible primitives |
| Icons | Lucide React | 1.x | Ikon-ikon antarmuka |
| Font | Inter (Google Fonts) | — | Tipografi utama |

---

## Struktur Folder

```
SnapBite/
├── app/                          # Semua halaman & API (Next.js App Router)
│   ├── api/
│   │   └── scan/route.ts         # ← API endpoint utama (AI scan)
│   ├── layout.tsx                # Root layout: Navbar + Footer
│   ├── page.tsx                  # Halaman utama (/)
│   ├── scan/
│   │   └── page.tsx              # Halaman scan (/scan)
│   ├── tentang/
│   │   └── page.tsx              # Halaman tentang (/tentang)
│   ├── makanan/
│   │   └── [slug]/page.tsx       # Detail makanan (/makanan/rendang, dll.)
│   └── globals.css               # CSS global + custom animations
│
├── components/
│   ├── ui/
│   │   ├── navbar.tsx            # Navigasi sticky + mobile drawer
│   │   ├── hero-section-7.tsx    # Hero beranda dengan gambar mengambang
│   │   ├── card-stack.tsx        # Carousel 3D fan kuliner pilihan
│   │   ├── cards-1.tsx           # Kartu makanan untuk tampilan mobile
│   │   ├── scanner-card-stream.tsx  # Animasi scanner (Three.js + Canvas)
│   │   ├── modem-animated-footer.tsx # Footer gelap dengan efek gradien
│   │   ├── button.tsx            # Button dengan variant (Radix + CVA)
│   │   └── input.tsx             # Input component
│   ├── hooks/
│   │   └── use-image-upload.tsx  # Custom hook: upload & kamera
│   └── icons.tsx                 # SVG icon components
│
├── lib/
│   └── utils.ts                  # Utility: cn() classname merger
│
├── data/
│   └── foods.json                # Database makanan lokal (Rendang, Gudeg, Pempek)
│
├── public/
│   └── images/                   # Gambar hero & kuliner pilihan
│
├── .env.local                    # API Key Gemini
├── next.config.ts                # Konfigurasi Next.js
├── tailwind.config.ts            # Konfigurasi Tailwind
└── package.json                  # Dependensi & scripts
```

---

## Halaman & Rute

### `/` — Halaman Utama
**File:** `app/page.tsx`
**Tipe:** Server Component (SSR)

Terdiri dari empat bagian berurutan:
1. **Hero Section** — Judul besar, deskripsi, tombol CTA, dan gambar makanan mengambang (Bakso, Sate, Gudeg, Pempek) dengan animasi float CSS.
2. **Cara Kerja** — Tiga langkah bergrid (Upload → Analisis AI → Temukan Kisah), masing-masing dengan nomor besar dekoratif dan icon.
3. **Kuliner Pilihan** — Di desktop: `CardStack` 3D fan carousel 5 makanan dengan autoplay. Di mobile: grid 2 kolom menggunakan `FoodCard`.
4. **CTA Section** — Background oranye (#FF4D00), ajakan scan dengan tombol "Mulai Scan".

---

### `/scan` — Halaman Scan
**File:** `app/scan/page.tsx`
**Tipe:** Client Component (`"use client"`)

Ini adalah halaman inti aplikasi. Alurnya:

```
[Area Upload / Kamera]
       ↓
[Preview Foto]
       ↓
[Tombol "Scan Sekarang"]
       ↓
[Animasi Scanner Overlay]
       ↓
[Tampil Hasil / Error / Tidak Ditemukan]
```

Penjelasan tiap state:
- **`idle` (belum ada foto):** Tampil area drag-and-drop + tombol "Ambil Foto dengan Kamera"
- **`idle` (sudah ada foto):** Tampil preview + tombol Scan, Ganti, Hapus
- **`scanning`:** Layar penuh hitam dengan animasi `ScannerCardStream` + pesan giliran
- **`done`:** Kartu hasil dengan nama, daerah, deskripsi, sejarah (jika AI), peta embed
- **`notFound`:** Pesan makanan tidak teridentifikasi
- **`error`:** Pesan error + info troubleshooting

---

### `/makanan/[slug]` — Detail Makanan
**File:** `app/makanan/[slug]/page.tsx`
**Tipe:** SSG (Static Site Generation)

Halaman ini di-pre-render saat build dari data `foods.json` menggunakan `generateStaticParams()`. Artinya halaman `/makanan/rendang`, `/makanan/gudeg`, `/makanan/pempek` sudah siap sebagai file HTML statis — tidak ada request server saat dibuka.

Konten:
- Gambar hero makanan (full-width)
- Nama, asal daerah, tagline
- Deskripsi singkat + sejarah lengkap (kolom kiri)
- Google Maps embed lokasi daerah asal (kolom kanan)
- Tombol: "Scan Makanan Lain" + "Kembali ke Beranda"

---

### `/tentang` — Tentang SnapBite
**File:** `app/tentang/page.tsx`
**Tipe:** Server Component (SSR)

Halaman informasi statis tentang SnapBite: misi, fitur-fitur (grid 6 item), teknologi yang digunakan.

---

## API Route — Otak Sistem AI

### `POST /api/scan`
**File:** `app/api/scan/route.ts`

Ini adalah endpoint paling kritis. Menerima gambar base64, mengembalikan data makanan.

### Request
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### Response (4 kemungkinan)
```json
// Ditemukan di database lokal
{ "status": "found", "source": "database", "food": { ...data lengkap... } }

// Dikenali AI tapi tidak ada di database
{ "status": "found", "source": "ai", "food": { ...data dari Gemini... } }

// Tidak dikenal / bukan makanan Indonesia
{ "status": "notFound", "suggestedName": "tidak dikenal" }

// Terjadi error (misal: quota habis)
{ "status": "error", "message": "..." }
```

---

### Alur 3 Fase di Dalam API

```
┌─────────────────────────────────────────────────────────────┐
│                     POST /api/scan                          │
│                                                             │
│  Input: imageBase64 (JPEG, max 512px, base64)               │
│                                                             │
│  FASE 1: IDENTIFIKASI                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Kirim gambar ke Gemini Vision                       │   │
│  │  Prompt: "Apa nama makanan ini? Jawab 1-3 kata"      │   │
│  │  → dapat: "rendang" / "soto ayam" / "tidak dikenal"  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  FASE 2A: CEK DATABASE LOKAL (foods.json)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Fuzzy match: slug → nama → substring                │   │
│  │  Jika cocok → return { source: "database" }          │   │
│  └──────────────────────────────────────────────────────┘   │
│                  ↓ (jika tidak cocok)                       │
│  FASE 2B: GENERATE INFO DENGAN GEMINI AI                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prompt: "Buat JSON: nama, daerah, tagline,          │   │
│  │           deskripsi_singkat, sejarah (3 paragraf)"   │   │
│  │  + buat Google Maps embed URL untuk daerahnya        │   │
│  │  → return { source: "ai" }                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  FALLBACK: Jika semua fase gagal → demo data acak           │
└─────────────────────────────────────────────────────────────┘
```

### Model Fallback Chain
Sistem mencoba model Gemini secara berurutan jika gagal:
1. `gemini-2.0-flash` (utama, tercepat)
2. `gemini-2.5-flash` (fallback 1)
3. `gemini-1.5-pro-latest` (fallback 2)

Tiap model dicoba **3 kali** dengan jeda **2 detik** sebelum menyerah.

### Penanganan Error Khusus
- **Error 429 (rate-limit per menit):** Pesan: "Batas per-menit tercapai, tunggu sebentar"
- **Quota harian habis:** Pesan: "Quota API habis, coba besok"
- **Makanan tidak dikenal:** Response `notFound` dengan nama yang disarankan AI

---

## Alur Lengkap dari Klik "Scan" ke Hasil

```
Pengguna upload / kamera foto
         ↓
Client: resizeToBase64()
  - Resize gambar ke max 512×512 px
  - Konversi ke JPEG base64 (quality 0.85)
         ↓
Client: fetch("POST /api/scan", { imageBase64 })
         ↓
Tampil: ScannerCardStream overlay (animasi fullscreen)
  - Foto pengguna + 4 gambar latar bergerak
  - Pesan berganti: "Menganalisis warna..." → "Mengenali pola..."
         ↓
Server: Fase 1 — Identifikasi via Gemini Vision
         ↓
Server: Fase 2A — Cek foods.json (database lokal)
         ↓                         ↓
    [COCOK]                  [TIDAK COCOK]
       ↓                           ↓
  source: "database"         Fase 2B: Generate via AI
       ↓                           ↓
       ↓                    source: "ai"
       ↓                           ↓
       └──────────┬────────────────┘
                  ↓
       Client terima response
                  ↓
       ┌─────────────────────────┐
       │  status: "found"        │ → Tampil kartu hasil
       │  status: "notFound"     │ → Tampil pesan tidak ditemukan
       │  status: "error"        │ → Tampil pesan error
       └─────────────────────────┘
```

---

## Alur Kamera Langsung

```
Klik "Ambil Foto dengan Kamera"
         ↓
CameraOverlay muncul (fullscreen, z-60)
  - getUserMedia({ facingMode: "environment" })  ← kamera belakang (mobile)
  - Video live ditampilkan di viewfinder
  - Frame panduan oranye di tengah layar
         ↓
Pengguna klik tombol shutter (lingkaran putih)
         ↓
canvas.drawImage(video) → canvas.toBlob() → new File()
         ↓
setFromFile(file) → previewUrl di-set, capturedFileRef di-set
         ↓
CameraOverlay ditutup, stream MediaStream di-stop
         ↓
Halaman scan menampilkan preview foto
         ↓
Pengguna klik "Scan Sekarang"
  → handleScan() baca capturedFileRef.current (bukan fileInput)
  → Alur normal berlanjut ke API
```

---

## Database Makanan Lokal

**File:** `data/foods.json`

Saat ini berisi **3 makanan**: Rendang, Gudeg, Pempek.

Struktur tiap entri:
```json
{
  "slug": "rendang",
  "nama": "Rendang",
  "daerah": "Sumatera Barat",
  "tagline": "Masakan berempah dari tanah Minang",
  "deskripsi_singkat": "Daging sapi dimasak lama dengan santan...",
  "sejarah": "Paragraf 1...\n\nParagraf 2...\n\nParagraf 3...",
  "gambar": "https://upload.wikimedia.org/...",
  "maps_embed_url": "https://maps.google.com/maps?q=Padang..."
}
```

**Fuzzy matching** saat scan — dicek berurutan:
1. Slug exact match (`"rendang"` == `"rendang"`)
2. Nama exact match (case-insensitive)
3. Nama AI ada di dalam nama DB (`"sapi rendang"` contains `"rendang"`)
4. Nama DB ada di dalam nama AI (`"rendang"` in `"daging rendang padang"`)

Jika tidak ada yang cocok → lanjut ke AI generation.

---

## Komponen Utama & Cara Kerjanya

### `CardStack` — Kuliner Pilihan (Desktop)
- Render 5 kartu dalam formasi kipas 3D menggunakan Framer Motion
- `ResizeObserver` mengatur ukuran kartu otomatis sesuai lebar kontainer
- Autoplay setiap 2.5 detik, pause saat hover
- Drag horizontal untuk swipe manual
- Keyboard navigation (← →)
- Hanya tampil di desktop (`hidden md:block`)

### `ScannerCardStream` — Animasi Scan
- Render di `<canvas>` menggunakan `requestAnimationFrame`
- Three.js untuk partikel bergerak (dots dengan gravitasi)
- Kartu-kartu makanan bergulir horizontal seperti film strip
- Efek "scramble" ASCII pada scan line
- Sinar scanner (gradient merah) bergerak kiri ke kanan
- Muncul fullscreen saat status = `"scanning"`

### `FloatingFoodHero` — Hero Beranda
- Gambar makanan (Bakso, Sate, Gudeg, Pempek) di 4 sudut secara absolut
- Animasi `float` CSS: naik-turun dengan delay berbeda tiap gambar
- Lingkaran SVG besar di belakang sebagai dekorasi
- Responsive: ukuran gambar pakai class `w-16 sm:w-28 md:w-52` dll.

### `Navbar`
- `position: sticky, top: 0, z-50`
- Desktop: logo + 3 link + tombol CTA
- Mobile: logo + tombol "Scan →" mini + hamburger
- Drawer: slide dari kanan, backdrop blur
- `usePathname()` menutup drawer otomatis saat navigasi

### `useImageUpload` — Hook Upload & Kamera
Custom hook yang mengelola state gambar untuk dua sumber:

| Sumber | Mekanisme | State yang diisi |
|---|---|---|
| File input (`<input type="file">`) | `handleFileChange()` | `fileInputRef.current.files[0]` |
| Kamera (`getUserMedia`) | `setFromFile(file)` | `capturedFileRef.current` |

`handleScan()` membaca: `capturedFileRef.current ?? fileInputRef.current?.files?.[0]`

---

## Variabel Lingkungan

| Variabel | Lokasi | Fungsi |
|---|---|---|
| `GEMINI_API_KEY` | `.env.local` | Kunci autentikasi Google Gemini API |

**Mode Demo:** Jika `GEMINI_API_KEY` tidak di-set atau bernilai `"your_key_here"`, API langsung return makanan acak dari `foods.json` tanpa memanggil Gemini — berguna untuk development tanpa kuota.

---

## Sistem Styling

**Tailwind CSS v4** dengan variabel CSS kustom di `globals.css`:

```css
--color-brand:  #FF4D00   /* Oranye utama — tombol, aksen */
--color-ink:    #0D0D0D   /* Teks hitam — judul, konten */
--color-mid:    #888888   /* Abu-abu — teks sekunder */
--color-canvas: #F2F2F2   /* Latar terang — section background */
--color-rule:   #E5E5E5   /* Garis/border halus */
```

**Animasi CSS kustom:**
- `@keyframes float` — gambar naik-turun (6 detik, ease-in-out)
- `@keyframes glitch` — kedip opacity
- `@keyframes scanPulse` — kilatan scanner (1.5 detik)

**Strategi Responsif:**
- Mobile-first: class dasar untuk mobile, `md:` untuk tablet/desktop
- `clamp()` untuk font size yang fluid tanpa breakpoint
- `md:hidden` / `hidden md:block` untuk komponen berbeda per breakpoint

---

## Alur Navigasi Pengguna

```
Beranda (/)
   │
   ├─ Klik "Mulai Scan" / "Scan Sekarang"
   │         ↓
   │    /scan
   │         │
   │    Upload foto atau ambil dengan kamera
   │         │
   │    Scan → Hasil ditemukan
   │         │
   │    ┌────┴──────────────────────────────┐
   │    │ source: "database"                │
   │    │   → Tombol "Lihat Detail Lengkap" │
   │    │         ↓                         │
   │    │   /makanan/[slug]                 │
   │    └───────────────────────────────────┘
   │
   │    ┌───────────────────────────────────┐
   │    │ source: "ai"                      │
   │    │   → Link Google Search            │
   │    └───────────────────────────────────┘
   │
   ├─ Klik "Tentang" → /tentang
   │
   └─ Footer links → kembali ke mana saja
```

---

## Proses Build & Deploy

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Build produksi:
                 #   → SSG: /makanan/[slug] di-pre-render dari foods.json
                 #   → API routes dikompilasi sebagai serverless functions
                 #   → Semua asset dioptimasi
npm start        # Jalankan hasil build
npm run lint     # Cek kode dengan ESLint
```

**Konfigurasi Next.js (`next.config.ts`):**
- Mengizinkan optimasi gambar dari `upload.wikimedia.org` dan `images.unsplash.com`
- Semua konfigurasi lain menggunakan default Next.js App Router

---

## Ringkasan Arsitektur Keseluruhan

```
Browser
   │
   ├── Static Assets (gambar, font)
   │         └── /public/images/
   │
   ├── Client Components (React, "use client")
   │         ├── /scan (state machine: idle/scanning/done/error/notFound)
   │         ├── Navbar (drawer state, pathname detection)
   │         ├── CardStack (carousel, autoplay, drag)
   │         └── CameraOverlay (MediaStream API)
   │
   ├── Server Components (Next.js, default)
   │         ├── / (Homepage — SSR)
   │         ├── /tentang (SSR)
   │         └── /makanan/[slug] (SSG — pre-rendered dari foods.json)
   │
   └── API Route (Node.js serverless)
             └── POST /api/scan
                       ├── Google Gemini Vision API (identifikasi + generate)
                       └── data/foods.json (database lokal, fuzzy match)
```

**Keputusan desain utama:**
- **Database lokal dulu, AI sebagai fallback** — lebih cepat dan hemat kuota API
- **Client resize gambar sebelum kirim** — mengurangi bandwidth dan mempercepat panggilan API
- **Demo mode tanpa API key** — development bisa jalan tanpa perlu kuota Gemini
- **Graceful degradation** — tiap error punya pesan yang spesifik dan actionable
- **Static generation** — halaman detail makanan tidak butuh server saat diakses pengguna
- **Mobile-first responsive** — layout dan komponen berbeda per breakpoint secara eksplisit
