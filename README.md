# Wish Boyke - Official Health & Intimate Wellness E-Commerce

Website e-commerce modern berkinerja tinggi untuk brand **"Wish by Dr. Boyke Dian Nugraha"** (produk kesehatan reproduksi, stamina herbal pria, perawatan intim wanita, dan nutrisi keharmonisan pasutri).

Dibangun dengan arsitektur modern berstandar industri yang mengutamakan kecepatan akses, keamanan data medis, dan privasi pengiriman tingkat tinggi.

---

## 🚀 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Mobile-first, clean minimal, luxury medical-wellness palette)
- **Icons:** Lucide React
- **Routing:** React Router DOM (v7)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security / RLS, Auth, Storage)
- **State Management:** React Context (Persistent LocalStorage Cart & Slide-over Drawer)
- **Deployment:** Vercel

---

## 🎨 Desain & UI/UX Philosophy

Terinspirasi dari e-commerce modern terkemuka di sektor wellness & personal care (*favo.id*, *id.umawomen.com*, *laciasmara.com*, *sidomunculstore.com*):
1. **Dominan Visual Bersih & Elegan:** Latar belakang netral cerah (`#F8FAF9`) dipadukan warna utama **Deep Medical Emerald / Herbal Health** (`#0D5C46`) dan aksen emas kemewahan (`#C5933D`).
2. **Privasi 100% Terjaga:** Badge & jaminan kemasan diskrit (kardus cokelat polos tanpa nama produk di resi pengiriman) ditampilkan di seluruh alur belanja mulai dari banner atas, drawer keranjang, hingga formulir checkout.
3. **Kredibilitas Dokter & BPOM:** Setiap produk dilengkapi nomor izin edar resmi BPOM/Kemenkes yang jelas untuk membedakan produk original dari barang tiruan.
4. **Slide-over Cart Drawer:** Pengalaman belanja interaktif tanpa reload halaman dengan indikator progress gratis ongkir dinamis.

---

## 📁 Struktur Direktori Project

```text
wishboyke/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Sticky header, search bar instan, ribbon privasi, cart badge
│   │   ├── CartDrawer.tsx     # Slide-over drawer dari sisi kanan dengan kalkulasi otomatis
│   │   ├── ProductCard.tsx    # Card produk elegan, badge BPOM, diskon, rating, quick add
│   │   └── Footer.tsx         # 4 pilar kepercayaan, profil dr. Boyke, mitra kurir & bank
│   ├── context/
│   │   └── CartContext.tsx    # Global cart state (add, update, remove, persistensi localStorage)
│   ├── lib/
│   │   ├── supabaseClient.ts  # Inisialisasi Supabase client dengan fallback mode demo yang aman
│   │   └── mockData.ts        # Data katalog fallback produk resmi dr. Boyke
│   ├── pages/
│   │   ├── Home.tsx           # Beranda dinamis (Hero, Kategori, Produk Terlaris dari Supabase)
│   │   ├── Catalog.tsx        # Katalog produk dengan filter kategori, pencarian & sorting harga
│   │   ├── ProductDetail.tsx  # Halaman detail produk (Galeri foto, aturan pakai, beli instan)
│   │   ├── Checkout.tsx       # Alur checkout bersih, opsi paket diskrit, simpan ke Supabase
│   │   └── OrderTracking.tsx  # Halaman pelacakan status pesanan & resi ekspedisi
│   ├── types/
│   │   └── index.ts           # Definisi TypeScript Product, CartItem, Order, Category, Profile
│   ├── App.tsx                # Konfigurasi routing utama
│   ├── main.tsx               # Entry point aplikasi
│   └── index.css              # Directive Tailwind CSS
├── supabase/
│   └── schema.sql             # Skrip SQL lengkap: Tabel, Trigger Auth, Index, RLS, & Seed data
├── .env.example               # Template environment variables
├── tailwind.config.js
└── package.json
```

---

## 🗄️ Menjalankan Skema Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file [`supabase/schema.sql`](./supabase/schema.sql) pada project ini, lalu salin seluruh kodenya.
4. Tempel ke dalam SQL Editor Supabase dan klik **Run**.
5. Skrip tersebut secara otomatis akan:
   - Membuat ekstensi UUID
   - Membuat tabel `profiles`, `categories`, `products`, `orders`, dan `order_items`
   - Memasang trigger otomatis untuk sinkronisasi `auth.users` ke `profiles`
   - Mengaktifkan **Row Level Security (RLS)** dengan policy yang aman
   - Mengisi seed data produk unggulan asli dr. Boyke (*Wish Pro Man*, *Feminine Hygiene Sirih & Manjakani*, *Silky Smooth Lubricant*, dll.)

---

## ⚙️ Menjalankan di Lokal (Development)

1. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Isi nilai kredensial dari Supabase:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   *(Bila belum diisi, aplikasi otomatis berjalan dalam **Mode Demo Pratinjau** dengan data mock berkualitas tinggi tanpa error).*
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```

---

## 🌐 Panduan Setup Environment Variables di Vercel Dashboard

Untuk mendistribusikan website ke Vercel:

1. **Push ke GitHub / GitLab:**
   Pastikan kode project sudah di-commit dan di-push ke repositori Git Anda.
2. **Import Project ke Vercel:**
   - Buka [vercel.com](https://vercel.com) dan login.
   - Klik tombol **"Add New..."** -> **"Project"**.
   - Pilih repositori `wishboyke` dan klik **Import**.
3. **Konfigurasi Environment Variables:**
   - Pada halaman konfigurasi project sebelum deploy, buka accordion **"Environment Variables"**.
   - Tambahkan dua variabel berikut:
     - **Key:** `VITE_SUPABASE_URL`
       **Value:** Salin *Project URL* dari Supabase Dashboard (`Project Settings` -> `API`).
     - **Key:** `VITE_SUPABASE_ANON_KEY`
       **Value:** Salin *Project API Anon Key* dari Supabase Dashboard.
   - Pastikan checklist *Production*, *Preview*, dan *Development* aktif.
4. **Deploy:**
   - Klik **Deploy**. Vercel akan otomatis mendeteksi Vite, menjalankan build `tsc -b && vite build`, dan website Anda langsung live dalam beberapa detik dengan CDN global berkecepatan tinggi.
