-- ==============================================================================
-- WISH BOYKE - SUPABASE DATABASE INITIAL SCHEMA & SEED DATA
-- Focus: Reproductive Health, Intimate Care, and Pasutri Wellness
-- Author: Senior Full-Stack & Supabase Architect
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES (for clean setup/reset)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- 3. TABLE: PROFILES (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    default_address JSONB DEFAULT '{}'::jsonb,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger to auto-create profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. TABLE: CATEGORIES
-- ==============================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 5. TABLE: PRODUCTS
-- ==============================================================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12, 2) CHECK (compare_at_price >= price),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    weight_gram INTEGER DEFAULT 250 CHECK (weight_gram > 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    bpom_number TEXT NOT NULL,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_best_seller ON public.products(is_best_seller);
CREATE INDEX idx_products_price ON public.products(price);

-- ==============================================================================
-- 6. TABLE: ORDERS
-- ==============================================================================
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guest checkouts
    guest_info JSONB DEFAULT NULL, -- Format: {"name": "", "email": "", "phone": ""}
    total_amount NUMERIC(12, 2) NOT NULL,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    shipping_address JSONB NOT NULL, -- {"recipient": "", "phone": "", "address": "", "city": "", "postal_code": ""}
    courier TEXT NOT NULL,
    tracking_number TEXT,
    is_discreet_packaging BOOLEAN DEFAULT TRUE, -- Signature privacy guarantee
    status order_status DEFAULT 'pending' NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_code ON public.orders(order_code);
CREATE INDEX idx_orders_status ON public.orders(status);

-- ==============================================================================
-- 7. TABLE: ORDER_ITEMS
-- ==============================================================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are readable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- CATEGORIES POLICIES (Public read, admin write)
CREATE POLICY "Categories are readable by everyone" 
    ON public.categories FOR SELECT 
    USING (true);

CREATE POLICY "Admins can insert/update/delete categories" 
    ON public.categories FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
    );

-- PRODUCTS POLICIES (Public read, admin write)
CREATE POLICY "Products are readable by everyone" 
    ON public.products FOR SELECT 
    USING (true);

CREATE POLICY "Admins can insert/update/delete products" 
    ON public.products FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
    );

-- ORDERS POLICIES
CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR (user_id IS NULL) -- Guests query by specific token/code via backend
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Anyone (including guest) can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- ORDER_ITEMS POLICIES
CREATE POLICY "Order items viewable by order owner or admin" 
    ON public.order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Anyone can insert order items on checkout" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

-- ==============================================================================
-- 9. SEED DATA (KATEGORI & PRODUK RESMI WISH BOYKE & CO)
-- ==============================================================================

INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Perawatan Kewanitaan', 'intimate-care', 'Pembersih dan spray higienis organ kewanitaan dengan ekstrak Manjakani & Daun Sirih pilihan dr. Boyke.', 'https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png'),
('22222222-2222-2222-2222-222222222222', 'Stamina & Vitalitas Pria', 'stamina-pria', 'Suplemen penunjang vitalitas dan stamina pria dewasa dari Pasak Bumi, Purwaceng, dan Cabe Jawa.', 'https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png'),
('33333333-3333-3333-3333-333333333333', 'Promil & Keseimbangan Hormon', 'promil-hormon', 'Paket program kehamilan terpadu pasutri dan suplemen alami penunda gejala menopause wanita matang.', 'https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png'),
('44444444-4444-4444-4444-444444444444', 'Perawatan Tubuh & Wangian Intim', 'body-care', 'Krim pengencang Darade, pencerah Selangit Cream, parfum miss V food-grade, serta sabun kecantikan herbal.', 'https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png'),
('55555555-5555-5555-5555-555555555555', 'Solusi Herbal Spesifik', 'herbal-care', 'Formula herbal teruji klinis untuk pemulihan pasca operasi, kesehatan sendi, tekanan darah, dan kualitas tidur.', 'https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png');

INSERT INTO public.products (
    id, category_id, title, slug, description, price, compare_at_price, stock, weight_gram, images, bpom_number, is_best_seller, is_featured, rating, review_count
) VALUES
(
    uuid_generate_v4(),
    '55555555-5555-5555-5555-555555555555',
    'Albumia - Pengering Luka Pasca Operasi',
    'pengering-luka-operasi-albumia',
    'Khasiat Produk : WISH ALBUMIA IKAN GABUS PLUS. Terbuat dari bahan baku utama ialah ekstrak ikan gabus. Membantu memelihara kesehatan tubuh Anda by boyke dian nugraha. Albumia Ikan Gabus Plus (Albumin) memiliki komposisi ekstrak ikan gabus yang diteliti bahwa dalam setiap kandungan daging ikan gabus memiliki protein yang tinggi terutama albumin dan asam amino esensial, lemak khususnya asam lemak esensial, mineral khususnya zink/seng (Zn) dan beberapa vitamin yang sangat baik untuk kesehatan. Selain itu, secara klinis intervensi konsentrat protein ikan gabus dalam bentuk kapsul telah membantu mempercepat penyembuhan pasien pasca-operasi, luka bakar dan stroke pada pasien rawat inap di rumah sakit.',
    220000,
    245000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '22222222-2222-2222-2222-222222222222',
    'NEIPROS - Obat Prostat Herbal',
    'neipros-obat-prostat-herbal-wish-boyke',
    'Temukan solusi alami untuk kesehatan prostat Anda dengan obat prostat WISH Neipros. Dapatkan kenyamanan saluran kemih setiap hari!',
    255000,
    285000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Herbal.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Herbal.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Wish-Boyke.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '55555555-5555-5555-5555-555555555555',
    'HITENO - Obat Hipertensi Herbal',
    'obat-hipertensi-herbal',
    'WISH HITENO adalah suplemen herbal yang diformulasikan untuk membantu menjaga tekanan darah tetap stabil dan mendukung kesehatan jantung. Mengandung ekstrak tinggi Daun Seledri, Buah Mengkudu, dan Daun Salam yang bekerja sinergis membantu melancarkan aliran darah, menjaga elastisitas pembuluh darah, serta membantu menurunkan kadar kolesterol jahat. Kandungan herbal alami dalam WISH HITENO juga kaya antioksidan dan kalium yang membantu mengurangi peradangan pembuluh darah, menjaga fungsi ginjal, serta mendukung kesehatan sistem kardiovaskular secara menyeluruh. Cocok dikonsumsi sebagai pendamping gaya hidup sehat untuk membantu menjaga tekanan darah dan kesehatan jantung. Aturan Pakai: Dewasa 2 x 1–2 kapsul per hari setelah makan. Isi: 30 kapsul @500 mg BPOM: TR253090561 Kemasan tersegel + hologram resmi 👉 Membantu menjaga tekanan darah tetap normal secara alami. 👉 Membantu menjaga kesehatan jantung dan sirkulasi darah. 👉 Tersedia resmi di website WISH by Dr. Boyke.',
    230000,
    250000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2026/06/obat-hipertensi-herbal-WISH-Hiteno.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/06/obat-hipertensi-herbal-WISH-Hiteno.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/06/Hiteno-Obat-Darah-Tinggi.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '55555555-5555-5555-5555-555555555555',
    'WISHMOVE - Obat Nyeri Sendi',
    'wishmove-obat-nyeri-sendi',
    'WISHMOVE adalah kapsul herbal premium dengan ekstrak tinggi Gamat Emas (Timun Laut) yang kaya akan kolagen, glukosamin, dan gamapeptide . Kandungan alaminya bekerja efektif meredakan nyeri sendi, mengatasi kaku, dan memperbaiki tulang rawan agar sendi kembali fleksibel dan bebas bergerak tanpa hambatan. Dengan formula yang fokus pada regenerasi sel dan pelumasan sendi , WISHMOVE menjadi solusi aman bagi penderita osteoarthritis maupun rematik untuk menjaga kepadatan tulang. Rasakan langkah yang lebih ringan, sendi lebih nyaman, dan mobilitas tanpa batas setiap hari bersama WISHMOVE .',
    235000,
    255000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2026/04/Botol-WISHMOVE-obat-nyeri-sendi.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/04/Botol-WISHMOVE-obat-nyeri-sendi.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/04/produk-WISHMOVE-kapsul-herbal-sendi.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'DARADE - Krim Payudara Alami',
    'darade-krim-payudara-alami',
    'Krim payudara alami dengan ekstrak Pueraria Mirifica Radix asal Thailand . Kandungan phytoestrogen alaminya membantu mengencangkan, melembutkan, dan menjaga elastisitas kulit payudara agar tampak lebih kenyal dan berisi hanya dalam 7 hari pemakaian. Dengan tekstur ringan dan cepat meresap , WISH Darade Cream aman digunakan setiap hari tanpa efek hormonal. Rasakan kulit payudara yang lebih lembut, kencang, dan tampak muda alami bersama WISH Darade Cream .',
    275000,
    300000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    TRUE,
    TRUE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '55555555-5555-5555-5555-555555555555',
    'DURLES - Solusi Atasi Insomnia Sulit Tidur – Isi 5 Saset',
    'wish-durles-solusi-atasi-insomnia-tidur-berkualitas-isi-5-saset',
    'WISH Durles – Solusi Redakan Insomnia &amp; Tidur Berkualitas Tidur nyenyak kini lebih mudah dengan WISH Durles by dr. Boyke , minuman herbal serbuk alami untuk bantu atasi insomnia, stres, dan susah tidur . Dengan kandungan Valeriana officinalis , Ashwagandha , dan ekstrak pala , WISH Durles membantu menenangkan pikiran, merileksasikan tubuh, dan meningkatkan kualitas tidur tanpa efek kantuk di pagi hari. Aman dikonsumsi setiap malam, tanpa bahan kimia berbahaya , cocok untuk kamu yang sering merasa lelah, gelisah, atau sulit tidur akibat stres harian. Rasakan manfaat tidur lebih pules bersama WISH Durles — pilihan tepat untuk hidup lebih sehat, tenang, dan bugar setiap hari. #TidurPulesMinumDurles',
    145000,
    200000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Intimate Spray Manjakani - Sabun Spray Miss V 60 ml',
    'intimate-spray-manjakani-sabun-spray-miss-v-60-ml-wish-boyke',
    '100% real produk spray kewanitaan pertama tanpa alkohol dan tanpa perlu dibilas by Boyke Dian Nugraha tidak ada yang lain. Wish Intimate spray majakani adalah SPRAY untuk kebersihan dan kesegaran daerah kewanitaan kamu. Mengandung ekstrak Manjakani dan ekstrak Piper Betle (Daun Sirih) dengan konsentrasi yang optimal.',
    53000,
    65000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'V SCENT - Intimate Secret',
    'vscent-parfum-miss-v',
    'Merupakan parfum untuk daerah intim wanita, yang terbuat dari 100% extrak Tinggi tumbuhan, seperti Rosehip, lavender, Citrus, Manjakani, Jojoba Oil, Vit. E, Minyak Zaitun, dan banyak lagi yang lainnya. Produk ini diramu khusus untuk wanita yang ingin meningkatkan rasa percaya diri dan memberi kebahagiaan pada pasangan mereka. Tersedia dalam dua varian yang harus dimiliki keduanya karena keduanya memiliki aroma yang unik: V SCENT: Memberikan aroma yang segar, erotis, dan membangkitkan gairah. FIRESH: Menghadirkan aroma yang lembut, romantis, dan menenangkan. Dengan memiliki kedua varian ini, Anda akan siap untuk merasakan pengalaman yang berbeda-beda setiap saat.&#8221; Manfaat: Wangi dan Lebih Rileks Ketika Menghirupnya Menghilangkan Bau Tidak Sedap Inovasi Terbaru Untuk Keamanan dan Kenikmatan Oral (Food Grade) Menenangkan Saraf dan Pikiran Menghilangkan Stress &amp; Kecemasan Cara Penggunaan: Semprotkan produk pada area yang kamu inginkan atau area genital kamu, terutama setelah beraktivitas, menstruasi, setelah melahirkan, atau sebelum berhubungan suami istri, untuk meningkatkan rasa percaya diri kamu. Hindari penggunaan pada area yang sensitif seperti kulit yang terluka, bagian dalam hidung, dan area kulit sensitif lainnya',
    140000,
    160000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'FIRESH - Intimate Secret',
    'firesh-parfum-miss-v-wish-boyke',
    'Merupakan parfum miss v di daerah intim wanita, yang terbuat dari 100% extrak Tinggi tumbuhan, seperti Rosehip, lavender, Citrus, Manjakani, Jojoba Oil, Vit. E, Minyak Zaitun, dan banyak lagi yang lainnya. Produk ini diramu khusus untuk wanita yang ingin meningkatkan rasa percaya diri dan memberi kebahagiaan pada pasangan mereka. Tersedia dalam dua varian yang harus dimiliki keduanya karena keduanya memiliki aroma yang unik: V SCENT: Memberikan aroma yang segar, erotis, dan membangkitkan gairah. FIRESH: Menghadirkan aroma yang lembut, romantis, dan menenangkan. Dengan memiliki kedua varian ini, Anda akan siap untuk merasakan pengalaman yang berbeda-beda setiap saat.&#8221;&lt;/span&gt; &lt;b&gt;Manfaat: Wangi dan Lebih Rileks Ketika Menghirupnya Menghilangkan Bau Tidak Sedap Inovasi Terbaru Untuk Keamanan dan Kenikmatan Oral (Food Grade) Menenangkan Saraf dan Pikiran Menghilangkan Stress &amp; Kecemasan Cara Penggunaan: Semprotkan produk pada area yang kamu inginkan atau area genital kamu, terutama setelah beraktivitas, menstruasi, setelah melahirkan, atau sebelum berhubungan suami istri, untuk meningkatkan rasa percaya diri kamu. Hindari penggunaan pada area yang sensitif seperti kulit yang terluka, bagian dalam hidung, dan area kulit sensitif lainnya',
    140000,
    160000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Floral Intimate Hygiene Extract 75 ml - Sabun Cair Miss V',
    'floral-extract',
    'Floral Intimate Hygiene Extract: Wish Premium Manjakani Floral, kemasan dan formula terbaru untuk hasil optimal. Eksplorasi perubahan dalam formula baru dengan lebih banyak Ekstrak Manjakani, Daun Sirih, dan Daun Beringin. Keunggulan unik Wish Intimate Floral mencakup pembersihan lembut, aroma bunga segar, dan kenyamanan dengan keseimbangan pH. Dirancang oleh Boyke Dian Nugraha, ahli dalam kesehatan dan kecantikan wanita. Tingkatkan rutinitas perawatan intim Anda dengan ilmu pengetahuan canggih dan bahan alami. Cara Pakai: Tuang sedikit cairan ke telapak tangan, basuhkan ke bagian kewanitaan anda, diamkan beberapa detik kemudian bilas sampai bersih dan keringkan. Dipakai 2 x sehari atau sesering yang anda inginkan',
    45000,
    50000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-1-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-1-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'Selangit Cream - Krim Pemutih Kulit',
    'krim-pemutih-kulit-selangit-cream',
    'Produk terbaru dari Wish Boyke Dian Nugraha, keajaiban dalam wadah krim: WISH LIGHTENING SELANGIT CREAM, solusi lengkap untuk menyingkirkan berbagai masalah kulit yang menggelap. Selangit Cream sebagai krim pemutih untuk kulit cantikmu. BELI 2 PCS SELANGIT CREAM DISKON 10RB / FREE ONGKIR CARA PEMAKAIAN WISH LIGHTENING SELANGIT CREAM by Boyke : Ratakan secara merata pada area kulit yang ingin lebih cerah, seperti selangkangan, lutut, siku, ketiak, tangan, kaki, dan seluruh tubuh. Gunakan dua kali sehari setelah mandi untuk hasil maksimal yang menakjubkan. Berat bersih 75 gram. WISH LIGHTENING SELANGIT CREAM by Boyke &#8211; BPOM NA. 18231900983',
    160000,
    169000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'Femmislim - Pelangsing Badan',
    'obat-diet-femmislim',
    'WISH Femmislim by WISH Boyke Kapsul khusus untuk Perut Buncit dan berat badan berlebih &#8211; Kaplet Pelangsing Penurun Berat Badan Cara konsumsi bersama obat diet herbal wish Femmislim 2 x 1 pada saat 1 jam sebelum makan Femmislim adalah 100% pelangsing herbal alami dari kandungan bahan pilihan seperti: Garcinia Cambogia dan Green Tea. Tidak seperti Obat Pelangsing / Obat Diet lain, kelebihan Femmislim yaitu : &#8211; Dengan kombinasi yang pas, Femmislim dapat menurunkan berat badan 3 kg/bulan &#8211; Femmislim aman dan minim efek samping, pengawasan ketat POM &amp; Dokter Ahli &#8211; Membantu menurunkan berat badan tanpa rasa lapar dan tidak membuat jantung berdebar',
    275000,
    280000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'FemiHerbs - Obat Keputihan',
    'obat-keputihan-dr-boyke-femi-herb',
    'FEMI HERBS Mengandung Quercus Infectoria Gallae yaitu tanaman tradisional yang diyakini memiliki banyak manfaat besar bagi kesehatan organ intim wanita seperti mengurangi lendir yang berlebihan pada daerah kewanitaan. Komposisi FEMIHERBS : &#8211; Quercus Infectoria Gallae 200 mg, &#8211; Arecae Catechu Semen 100 mg &#8211; Jatropae Curcas Foliu 100 mg &#8211; Guazumae ulmifoliae Folium 50 mg &#8211; Curcumae Xanthorrhizae Rhizoma 50 mg Dosis FEMIHERBS : Diminum 3 x sehari 2 kapsul, Sesudah makan.',
    355000,
    385000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'Papaya Soap - Sabun Mandi Pepaya',
    'papaya-soap',
    'Sabun pepaya by WISH Boyke &amp; Co. Mengandung Enzym papain membantu mengurangi dan menghaluskan bintik hitam atau bercak coklat akibat paparan sinar matahari. Cara Pakai: Basahi sabun dan gosokan busanya ke wajah, pijit secara lembut dan perlahan, diamkan beberapa detik agar aktif bekerja optimal. Bilas sampai bersih.',
    35000,
    40000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '44444444-4444-4444-4444-444444444444',
    'Sulfur Soap - Sabun Mandi Belerang',
    'sulfur-soap',
    'Sulfur Transparent Soap mengandung biosulfur dan triclosan. Biosulfur dan triclosan sangat efektif untuk membantu merawat kulit yang berjerawat dan membantu mengeringkan jerawat dan membantu mencegah timbulnya jerawat. Biosulfur juga efektif untuk menghilangkan penyakit kulit seperti gatal-gatal, panu, kadas dan kurap. Wish Sulfur Transparent Soap sangat cocok untuk perawatan terhadap kulit yang berjerawat dan mencegah timbulnya bakteri penyebab jerawat gatal-gatal atau penyakit kulit lainnya.',
    35000,
    40000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Intimate Spray Manjakani - Sabun Spray Miss V 100 ml',
    'intimate-spray-manjakani-dr-boyke-100-ml',
    '100% real produk spray kewanitaan pertama tanpa alkohol dan tanpa perlu dibilas by Boyke Dian Nugraha tidak ada yang lain. Wish Intimate spray majakani adalah SPRAY untuk kebersihan dan kesegaran daerah kewanitaan kamu. Mengandung ekstrak Manjakani dan ekstrak Piper Betle (Daun Sirih) dengan konsentrasi yang optimal.',
    70000,
    80000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-1-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-1-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    TRUE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Manjakani Extract Intimate - Sabun Cair Miss V 75 ml',
    'manjakani-extract-intimate',
    'Majakani Extract Intimate Hygine adalah pembersih vagina yang amat lembut dan aman tanpa menyebabkan iritasi kulit.Mengandung ekstrak buah Majakani atau Oaks Galls yang kaya akan Tannin, Acidtanik, calcium, vitamin A, B dan E. Serta mengandung ekstrak Piper Betle yang kaya akan minyak Atsiri. Dengan pH seimbang dan formula yang pas, menghasilkan pembersih yang sangat memuaskan.',
    45000,
    55000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-Extract-75ml-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-Extract-75ml-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-75ml-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Premium Manjakani - Sabun Cair Miss V 125ml',
    'premium-manjakani',
    'PREMIUM MAJAKANI EXTRACT Feminine Hygiene adalah pembersih organ intim wanita kelas Premium yang sangat lembut. Mengandung Ekstrak tinggi Majakani yang kaya akan Tanin, Acid Tanik, Vitamin A, B dan E serta Ekstrak Piper Betle (Sirih) yang kaya minyak atsiri, sangat baik sebagai bahan antiseptik.',
    60000,
    75000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-100ml-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '22222222-2222-2222-2222-222222222222',
    'Pronimale - Kesuburan &amp; Kualitas Sperma Pria',
    'pronimale-kesuburan-pria',
    'PRONIMALE &#8211; Untuk Gairah dan Kualitas Sperma Pria WISH Pronimale sedang ada PROMO harga perboxnya dari Rp 199.000 menjadi Rp 155.000 Membantu memelihara stamina untuk pria, meningkatkan gairah dan kualitas sperma (mani encer) Kami mohon maaf untuk pembelian satuan tidak dapat test pack dan booklet ekslusif Boyke Dian Nugraha.',
    210000,
    230000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '33333333-3333-3333-3333-333333333333',
    'Femita - Kesuburan Wanita',
    'femita',
    'Selamat datang di website official shop resmi WISH Boyke &amp; Co. Produk ready stock 100% original WISH dr. Boyke. Terdaftar di BPOM dan LPPOM MUI. Langsung lakukan pemesanan dan pembayaran ya…',
    210000,
    230000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '33333333-3333-3333-3333-333333333333',
    'Paket Produk Kesuburan - Femita dan Pronimale',
    'paket-produk-promil',
    'Harga Resmi Wish Promil Hanya 369rb/paket. Harga ini sudah pasti ya sahabat Wish. Kamu akan mendapatkan 2 box produk herbal yg dapat membantu kamu dalam mendapatkan keturunan.',
    410000,
    420000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '11111111-1111-1111-1111-111111111111',
    'Femmilove - Obat Keputihan Kesat dan Rapat',
    'obat-keputihan-femmilove',
    'Khasiat Femmilove : Membantu mengurangi lendir yang berlebihan pada daerah kewanitaan (keputihan normal dan abnormal), Menurangi bau tidak sedap saat keputihan, Mengencangkan dan merapatkan area kewanitaan, dan mengurangi nyeri saat haid. Dibuat secara higienis dari kompilasi 26 resep ramuan Madura. Femmilove mengandung ekstrak tanaman tradisional seperti Majakani, Kunyit, Pinang, Gambir , Sirih dan lain lain. Aturan Minum : 2&#215;1 kapsul per hari',
    305000,
    325000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    TRUE,
    TRUE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '33333333-3333-3333-3333-333333333333',
    'Menoherb - Penunda Menopause',
    'obat-menopause-menoherbs',
    'MENOHERB Membantu meringankan gejala henti haid pada lanjut usia. Komposisi : Pueraria Mirifica Herba&#8230;&#8230;..350mg Centella Asiatica Herba&#8230;&#8230;..50mg Aturan Pakai: 2&#215;1 kapsul/hari selama 15 hari dalam 1 bulan dimulai haid pertama.',
    355000,
    365000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-1.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-1.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    FALSE,
    FALSE,
    4.9,
    180
),
(
    uuid_generate_v4(),
    '22222222-2222-2222-2222-222222222222',
    'PROLQ Kapsul by Boyke',
    'prolq-kapsul',
    'PROLQ Kapsul – Suplemen Herbal Memelihara Stamina Pria PROLQ Kapsul dari WISH dr. Boyke diformulasikan khusus untuk memelihara stamina pria. Mengandung ekstrak Pasak Bumi, Purwaceng, Cabe Jawa , dan Jahe Merah. Semua bahan diekstrak dari tanaman pilihan dan diproses secara higienis. Selain itu, produk ini telah terdaftar di BPOM (TR183315291) dan aman untuk konsumsi jangka panjang. Dengan konsumsi rutin, PROLQ membantu menjaga vitalitas tanpa efek samping. Aturan Pakai: 2 x 1 kapsul/hari, diminum 1 jam setelah makan. Isi: 30 kapsul Kemasan tersegel + hologram resmi 👉 Pilih PROLQ untuk solusi alami, aman, dan terpercaya. 💡 Tersedia hanya di website resmi WISH Boyke.',
    235000,
    265000,
    50,
    150,
    ARRAY['https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png?fit=1080%2C1080&ssl=1', 'https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/01/New-Cover-SKU-PROLQ-Kapsul-2.png?fit=1080%2C1080&ssl=1'],
    'BPOM Terdaftar Resmi',
    TRUE,
    TRUE,
    4.9,
    180
);
