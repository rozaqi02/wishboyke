import type { Category, Product } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Perawatan Kewanitaan",
    "slug": "intimate-care",
    "description": "Pembersih dan spray higienis organ kewanitaan dengan ekstrak Manjakani & Daun Sirih pilihan dr. Boyke.",
    "image_url": "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png"
  },
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Stamina & Vitalitas Pria",
    "slug": "stamina-pria",
    "description": "Suplemen penunjang vitalitas dan stamina pria dewasa dari Pasak Bumi, Purwaceng, dan Cabe Jawa.",
    "image_url": "https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png"
  },
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "name": "Promil & Keseimbangan Hormon",
    "slug": "promil-hormon",
    "description": "Paket program kehamilan terpadu pasutri dan suplemen alami penunda gejala menopause wanita matang.",
    "image_url": "https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png"
  },
  {
    "id": "44444444-4444-4444-4444-444444444444",
    "name": "Perawatan Tubuh & Wangian Intim",
    "slug": "body-care",
    "description": "Krim pengencang Darade, pencerah Selangit Cream, parfum miss V food-grade, serta sabun kecantikan herbal.",
    "image_url": "https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png"
  },
  {
    "id": "55555555-5555-5555-5555-555555555555",
    "name": "Solusi Herbal Spesifik",
    "slug": "herbal-care",
    "description": "Formula herbal teruji klinis untuk pemulihan pasca operasi, kesehatan sendi, tekanan darah, dan kualitas tidur.",
    "image_url": "https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png"
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    "id": "prod-pengering-luka-operasi-albumia",
    "category_id": "55555555-5555-5555-5555-555555555555",
    "title": "Albumia - Pengering Luka Pasca Operasi",
    "slug": "pengering-luka-operasi-albumia",
    "description": "Khasiat Produk : WISH ALBUMIA IKAN GABUS PLUS. Terbuat dari bahan baku utama ialah ekstrak ikan gabus. Membantu memelihara kesehatan tubuh Anda by boyke dian nugraha. Albumia Ikan Gabus Plus (Albumin) memiliki komposisi ekstrak ikan gabus yang diteliti bahwa dalam setiap kandungan daging ikan gabus memiliki protein yang tinggi terutama albumin dan asam amino esensial, lemak khususnya asam lemak esensial, mineral khususnya zink/seng (Zn) dan beberapa vitamin yang sangat baik untuk kesehatan. Selain itu, secara klinis intervensi konsentrat protein ikan gabus dalam bentuk kapsul telah membantu mempercepat penyembuhan pasien pasca-operasi, luka bakar dan stroke pada pasien rawat inap di rumah sakit.",
    "price": 220000,
    "compare_at_price": 245000,
    "stock": 50,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR223010181",
    "is_best_seller": true,
    "is_featured": false,
    "rating": 4.85,
    "review_count": 120
  },
  {
    "id": "prod-neipros-obat-prostat-herbal-wish-boyke",
    "category_id": "22222222-2222-2222-2222-222222222222",
    "title": "NEIPROS - Obat Prostat Herbal",
    "slug": "neipros-obat-prostat-herbal-wish-boyke",
    "description": "Temukan solusi alami untuk kesehatan prostat Anda dengan obat prostat WISH Neipros. Dapatkan kenyamanan saluran kemih setiap hari!",
    "price": 255000,
    "compare_at_price": 285000,
    "stock": 57,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Herbal.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Herbal.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/05/Obat-Prostat-Wish-Boyke.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/05/Neipros-Obat-Prostat.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR203300581",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.88,
    "review_count": 157
  },
  {
    "id": "prod-obat-hipertensi-herbal",
    "category_id": "55555555-5555-5555-5555-555555555555",
    "title": "HITENO - Obat Hipertensi Herbal",
    "slug": "obat-hipertensi-herbal",
    "description": "WISH HITENO adalah suplemen herbal yang diformulasikan untuk membantu menjaga tekanan darah tetap stabil dan mendukung kesehatan jantung. Mengandung ekstrak tinggi Daun Seledri, Buah Mengkudu, dan Daun Salam yang bekerja sinergis membantu melancarkan aliran darah, menjaga elastisitas pembuluh darah, serta membantu menurunkan kadar kolesterol jahat. Kandungan herbal alami dalam WISH HITENO juga kaya antioksidan dan kalium yang membantu mengurangi peradangan pembuluh darah, menjaga fungsi ginjal, serta mendukung kesehatan sistem kardiovaskular secara menyeluruh. Cocok dikonsumsi sebagai pendamping gaya hidup sehat untuk membantu menjaga tekanan darah dan kesehatan jantung. Aturan Pakai: Dewasa 2 x 1–2 kapsul per hari setelah makan. Isi: 30 kapsul @500 mg BPOM: TR253090561 Kemasan tersegel + hologram resmi 👉 Membantu menjaga tekanan darah tetap normal secara alami. 👉 Membantu menjaga kesehatan jantung dan sirkulasi darah. 👉 Tersedia resmi di website WISH by Dr. Boyke.",
    "price": 230000,
    "compare_at_price": 250000,
    "stock": 64,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2026/06/obat-hipertensi-herbal-WISH-Hiteno.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/06/obat-hipertensi-herbal-WISH-Hiteno.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/06/Hiteno-Obat-Darah-Tinggi.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/06/Hiteno-by-dr.-Boyke.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR253090561",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.91,
    "review_count": 194
  },
  {
    "id": "prod-wishmove-obat-nyeri-sendi",
    "category_id": "55555555-5555-5555-5555-555555555555",
    "title": "WISHMOVE - Obat Nyeri Sendi",
    "slug": "wishmove-obat-nyeri-sendi",
    "description": "WISHMOVE adalah kapsul herbal premium dengan ekstrak tinggi Gamat Emas (Timun Laut) yang kaya akan kolagen, glukosamin, dan gamapeptide . Kandungan alaminya bekerja efektif meredakan nyeri sendi, mengatasi kaku, dan memperbaiki tulang rawan agar sendi kembali fleksibel dan bebas bergerak tanpa hambatan. Dengan formula yang fokus pada regenerasi sel dan pelumasan sendi , WISHMOVE menjadi solusi aman bagi penderita osteoarthritis maupun rematik untuk menjaga kepadatan tulang. Rasakan langkah yang lebih ringan, sendi lebih nyaman, dan mobilitas tanpa batas setiap hari bersama WISHMOVE .",
    "price": 235000,
    "compare_at_price": 255000,
    "stock": 71,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2026/04/Botol-WISHMOVE-obat-nyeri-sendi.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/04/Botol-WISHMOVE-obat-nyeri-sendi.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/04/produk-WISHMOVE-kapsul-herbal-sendi.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2026/04/Botol-WISHMOVE-kapsul-herbal-nyeri-sendi.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR213309251",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.94,
    "review_count": 231
  },
  {
    "id": "prod-darade-krim-payudara-alami",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "DARADE - Krim Payudara Alami",
    "slug": "darade-krim-payudara-alami",
    "description": "Krim payudara alami dengan ekstrak Pueraria Mirifica Radix asal Thailand . Kandungan phytoestrogen alaminya membantu mengencangkan, melembutkan, dan menjaga elastisitas kulit payudara agar tampak lebih kenyal dan berisi hanya dalam 7 hari pemakaian. Dengan tekstur ringan dan cepat meresap , WISH Darade Cream aman digunakan setiap hari tanpa efek hormonal. Rasakan kulit payudara yang lebih lembut, kencang, dan tampak muda alami bersama WISH Darade Cream .",
    "price": 275000,
    "compare_at_price": 300000,
    "stock": 78,
    "weight_gram": 100,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18200108341",
    "is_best_seller": true,
    "is_featured": true,
    "rating": 4.97,
    "review_count": 268
  },
  {
    "id": "prod-wish-durles-solusi-atasi-insomnia-tidur-berkualitas-isi-5-saset",
    "category_id": "55555555-5555-5555-5555-555555555555",
    "title": "DURLES - Solusi Atasi Insomnia Sulit Tidur – Isi 5 Saset",
    "slug": "wish-durles-solusi-atasi-insomnia-tidur-berkualitas-isi-5-saset",
    "description": "WISH Durles – Solusi Redakan Insomnia &amp; Tidur Berkualitas Tidur nyenyak kini lebih mudah dengan WISH Durles by dr. Boyke , minuman herbal serbuk alami untuk bantu atasi insomnia, stres, dan susah tidur . Dengan kandungan Valeriana officinalis , Ashwagandha , dan ekstrak pala , WISH Durles membantu menenangkan pikiran, merileksasikan tubuh, dan meningkatkan kualitas tidur tanpa efek kantuk di pagi hari. Aman dikonsumsi setiap malam, tanpa bahan kimia berbahaya , cocok untuk kamu yang sering merasa lelah, gelisah, atau sulit tidur akibat stres harian. Rasakan manfaat tidur lebih pules bersama WISH Durles — pilihan tepat untuk hidup lebih sehat, tenang, dan bugar setiap hari. #TidurPulesMinumDurles",
    "price": 145000,
    "compare_at_price": 200000,
    "stock": 85,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Durles-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR232009211",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.85,
    "review_count": 305
  },
  {
    "id": "prod-intimate-spray-manjakani-sabun-spray-miss-v-60-ml-wish-boyke",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Intimate Spray Manjakani - Sabun Spray Miss V 60 ml",
    "slug": "intimate-spray-manjakani-sabun-spray-miss-v-60-ml-wish-boyke",
    "description": "100% real produk spray kewanitaan pertama tanpa alkohol dan tanpa perlu dibilas by Boyke Dian Nugraha tidak ada yang lain. Wish Intimate spray majakani adalah SPRAY untuk kebersihan dan kesegaran daerah kewanitaan kamu. Mengandung ekstrak Manjakani dan ekstrak Piper Betle (Daun Sirih) dengan konsentrasi yang optimal.",
    "price": 53000,
    "compare_at_price": 65000,
    "stock": 92,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18211600021",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.88,
    "review_count": 342
  },
  {
    "id": "prod-vscent-parfum-miss-v",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "V SCENT - Intimate Secret",
    "slug": "vscent-parfum-miss-v",
    "description": "Merupakan parfum untuk daerah intim wanita, yang terbuat dari 100% extrak Tinggi tumbuhan, seperti Rosehip, lavender, Citrus, Manjakani, Jojoba Oil, Vit. E, Minyak Zaitun, dan banyak lagi yang lainnya. Produk ini diramu khusus untuk wanita yang ingin meningkatkan rasa percaya diri dan memberi kebahagiaan pada pasangan mereka. Tersedia dalam dua varian yang harus dimiliki keduanya karena keduanya memiliki aroma yang unik: V SCENT: Memberikan aroma yang segar, erotis, dan membangkitkan gairah. FIRESH: Menghadirkan aroma yang lembut, romantis, dan menenangkan. Dengan memiliki kedua varian ini, Anda akan siap untuk merasakan pengalaman yang berbeda-beda setiap saat.&#8221; Manfaat: Wangi dan Lebih Rileks Ketika Menghirupnya Menghilangkan Bau Tidak Sedap Inovasi Terbaru Untuk Keamanan dan Kenikmatan Oral (Food Grade) Menenangkan Saraf dan Pikiran Menghilangkan Stress &amp; Kecemasan Cara Penggunaan: Semprotkan produk pada area yang kamu inginkan atau area genital kamu, terutama setelah beraktivitas, menstruasi, setelah melahirkan, atau sebelum berhubungan suami istri, untuk meningkatkan rasa percaya diri kamu. Hindari penggunaan pada area yang sensitif seperti kulit yang terluka, bagian dalam hidung, dan area kulit sensitif lainnya",
    "price": 140000,
    "compare_at_price": 160000,
    "stock": 99,
    "weight_gram": 80,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-VScent-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18220600109",
    "is_best_seller": false,
    "is_featured": true,
    "rating": 4.91,
    "review_count": 379
  },
  {
    "id": "prod-firesh-parfum-miss-v-wish-boyke",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "FIRESH - Intimate Secret",
    "slug": "firesh-parfum-miss-v-wish-boyke",
    "description": "Merupakan parfum miss v di daerah intim wanita, yang terbuat dari 100% extrak Tinggi tumbuhan, seperti Rosehip, lavender, Citrus, Manjakani, Jojoba Oil, Vit. E, Minyak Zaitun, dan banyak lagi yang lainnya. Produk ini diramu khusus untuk wanita yang ingin meningkatkan rasa percaya diri dan memberi kebahagiaan pada pasangan mereka. Tersedia dalam dua varian yang harus dimiliki keduanya karena keduanya memiliki aroma yang unik: V SCENT: Memberikan aroma yang segar, erotis, dan membangkitkan gairah. FIRESH: Menghadirkan aroma yang lembut, romantis, dan menenangkan. Dengan memiliki kedua varian ini, Anda akan siap untuk merasakan pengalaman yang berbeda-beda setiap saat.&#8221;&lt;/span&gt; &lt;b&gt;Manfaat: Wangi dan Lebih Rileks Ketika Menghirupnya Menghilangkan Bau Tidak Sedap Inovasi Terbaru Untuk Keamanan dan Kenikmatan Oral (Food Grade) Menenangkan Saraf dan Pikiran Menghilangkan Stress &amp; Kecemasan Cara Penggunaan: Semprotkan produk pada area yang kamu inginkan atau area genital kamu, terutama setelah beraktivitas, menstruasi, setelah melahirkan, atau sebelum berhubungan suami istri, untuk meningkatkan rasa percaya diri kamu. Hindari penggunaan pada area yang sensitif seperti kulit yang terluka, bagian dalam hidung, dan area kulit sensitif lainnya",
    "price": 140000,
    "compare_at_price": 160000,
    "stock": 106,
    "weight_gram": 80,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2024/02/New-Cover-SKU-Firesh-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18220600110",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.94,
    "review_count": 416
  },
  {
    "id": "prod-floral-extract",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Floral Intimate Hygiene Extract 75 ml - Sabun Cair Miss V",
    "slug": "floral-extract",
    "description": "Floral Intimate Hygiene Extract: Wish Premium Manjakani Floral, kemasan dan formula terbaru untuk hasil optimal. Eksplorasi perubahan dalam formula baru dengan lebih banyak Ekstrak Manjakani, Daun Sirih, dan Daun Beringin. Keunggulan unik Wish Intimate Floral mencakup pembersihan lembut, aroma bunga segar, dan kenyamanan dengan keseimbangan pH. Dirancang oleh Boyke Dian Nugraha, ahli dalam kesehatan dan kecantikan wanita. Tingkatkan rutinitas perawatan intim Anda dengan ilmu pengetahuan canggih dan bahan alami. Cara Pakai: Tuang sedikit cairan ke telapak tangan, basuhkan ke bagian kewanitaan anda, diamkan beberapa detik kemudian bilas sampai bersih dan keringkan. Dipakai 2 x sehari atau sesering yang anda inginkan",
    "price": 45000,
    "compare_at_price": 50000,
    "stock": 113,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-1-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-1-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/09/New-Cover-SKU-Floral-Extract-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18201600034",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.97,
    "review_count": 453
  },
  {
    "id": "prod-krim-pemutih-kulit-selangit-cream",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "Selangit Cream - Krim Pemutih Kulit",
    "slug": "krim-pemutih-kulit-selangit-cream",
    "description": "Produk terbaru dari Wish Boyke Dian Nugraha, keajaiban dalam wadah krim: WISH LIGHTENING SELANGIT CREAM, solusi lengkap untuk menyingkirkan berbagai masalah kulit yang menggelap. Selangit Cream sebagai krim pemutih untuk kulit cantikmu. BELI 2 PCS SELANGIT CREAM DISKON 10RB / FREE ONGKIR CARA PEMAKAIAN WISH LIGHTENING SELANGIT CREAM by Boyke : Ratakan secara merata pada area kulit yang ingin lebih cerah, seperti selangkangan, lutut, siku, ketiak, tangan, kaki, dan seluruh tubuh. Gunakan dua kali sehari setelah mandi untuk hasil maksimal yang menakjubkan. Berat bersih 75 gram. WISH LIGHTENING SELANGIT CREAM by Boyke &#8211; BPOM NA. 18231900983",
    "price": 160000,
    "compare_at_price": 169000,
    "stock": 120,
    "weight_gram": 100,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/07/New-Cover-SKU-Selangit-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18231900983",
    "is_best_seller": true,
    "is_featured": false,
    "rating": 4.85,
    "review_count": 490
  },
  {
    "id": "prod-obat-diet-femmislim",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "Femmislim - Pelangsing Badan",
    "slug": "obat-diet-femmislim",
    "description": "WISH Femmislim by WISH Boyke Kapsul khusus untuk Perut Buncit dan berat badan berlebih &#8211; Kaplet Pelangsing Penurun Berat Badan Cara konsumsi bersama obat diet herbal wish Femmislim 2 x 1 pada saat 1 jam sebelum makan Femmislim adalah 100% pelangsing herbal alami dari kandungan bahan pilihan seperti: Garcinia Cambogia dan Green Tea. Tidak seperti Obat Pelangsing / Obat Diet lain, kelebihan Femmislim yaitu : &#8211; Dengan kombinasi yang pas, Femmislim dapat menurunkan berat badan 3 kg/bulan &#8211; Femmislim aman dan minim efek samping, pengawasan ketat POM &amp; Dokter Ahli &#8211; Membantu menurunkan berat badan tanpa rasa lapar dan tidak membuat jantung berdebar",
    "price": 275000,
    "compare_at_price": 280000,
    "stock": 127,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2023/03/New-Cover-SKU-Femislim-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183319981",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.88,
    "review_count": 527
  },
  {
    "id": "prod-obat-keputihan-dr-boyke-femi-herb",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "FemiHerbs - Obat Keputihan",
    "slug": "obat-keputihan-dr-boyke-femi-herb",
    "description": "FEMI HERBS Mengandung Quercus Infectoria Gallae yaitu tanaman tradisional yang diyakini memiliki banyak manfaat besar bagi kesehatan organ intim wanita seperti mengurangi lendir yang berlebihan pada daerah kewanitaan. Komposisi FEMIHERBS : &#8211; Quercus Infectoria Gallae 200 mg, &#8211; Arecae Catechu Semen 100 mg &#8211; Jatropae Curcas Foliu 100 mg &#8211; Guazumae ulmifoliae Folium 50 mg &#8211; Curcumae Xanthorrhizae Rhizoma 50 mg Dosis FEMIHERBS : Diminum 3 x sehari 2 kapsul, Sesudah makan.",
    "price": 355000,
    "compare_at_price": 385000,
    "stock": 54,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/11/New-Cover-SKU-New-Femiherbs-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR193333241",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.91,
    "review_count": 564
  },
  {
    "id": "prod-papaya-soap",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "Papaya Soap - Sabun Mandi Pepaya",
    "slug": "papaya-soap",
    "description": "Sabun pepaya by WISH Boyke &amp; Co. Mengandung Enzym papain membantu mengurangi dan menghaluskan bintik hitam atau bercak coklat akibat paparan sinar matahari. Cara Pakai: Basahi sabun dan gosokan busanya ke wajah, pijit secara lembut dan perlahan, diamkan beberapa detik agar aktif bekerja optimal. Bilas sampai bersih.",
    "price": 35000,
    "compare_at_price": 40000,
    "stock": 61,
    "weight_gram": 100,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Papaya-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18210500112",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.94,
    "review_count": 151
  },
  {
    "id": "prod-sulfur-soap",
    "category_id": "44444444-4444-4444-4444-444444444444",
    "title": "Sulfur Soap - Sabun Mandi Belerang",
    "slug": "sulfur-soap",
    "description": "Sulfur Transparent Soap mengandung biosulfur dan triclosan. Biosulfur dan triclosan sangat efektif untuk membantu merawat kulit yang berjerawat dan membantu mengeringkan jerawat dan membantu mencegah timbulnya jerawat. Biosulfur juga efektif untuk menghilangkan penyakit kulit seperti gatal-gatal, panu, kadas dan kurap. Wish Sulfur Transparent Soap sangat cocok untuk perawatan terhadap kulit yang berjerawat dan mencegah timbulnya bakteri penyebab jerawat gatal-gatal atau penyakit kulit lainnya.",
    "price": 35000,
    "compare_at_price": 40000,
    "stock": 68,
    "weight_gram": 100,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Sabun-Sulfur-2.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18210500113",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.97,
    "review_count": 188
  },
  {
    "id": "prod-intimate-spray-manjakani-dr-boyke-100-ml",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Intimate Spray Manjakani - Sabun Spray Miss V 100 ml",
    "slug": "intimate-spray-manjakani-dr-boyke-100-ml",
    "description": "100% real produk spray kewanitaan pertama tanpa alkohol dan tanpa perlu dibilas by Boyke Dian Nugraha tidak ada yang lain. Wish Intimate spray majakani adalah SPRAY untuk kebersihan dan kesegaran daerah kewanitaan kamu. Mengandung ekstrak Manjakani dan ekstrak Piper Betle (Daun Sirih) dengan konsentrasi yang optimal.",
    "price": 70000,
    "compare_at_price": 80000,
    "stock": 75,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-1-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-1-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Spray-100ml-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18211600022",
    "is_best_seller": true,
    "is_featured": true,
    "rating": 4.85,
    "review_count": 225
  },
  {
    "id": "prod-manjakani-extract-intimate",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Manjakani Extract Intimate - Sabun Cair Miss V 75 ml",
    "slug": "manjakani-extract-intimate",
    "description": "Majakani Extract Intimate Hygine adalah pembersih vagina yang amat lembut dan aman tanpa menyebabkan iritasi kulit.Mengandung ekstrak buah Majakani atau Oaks Galls yang kaya akan Tannin, Acidtanik, calcium, vitamin A, B dan E. Serta mengandung ekstrak Piper Betle yang kaya akan minyak Atsiri. Dengan pH seimbang dan formula yang pas, menghasilkan pembersih yang sangat memuaskan.",
    "price": 45000,
    "compare_at_price": 55000,
    "stock": 82,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-Extract-75ml-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-Extract-75ml-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-75ml-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-75ml-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18201600035",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.88,
    "review_count": 262
  },
  {
    "id": "prod-premium-manjakani",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Premium Manjakani - Sabun Cair Miss V 125ml",
    "slug": "premium-manjakani",
    "description": "PREMIUM MAJAKANI EXTRACT Feminine Hygiene adalah pembersih organ intim wanita kelas Premium yang sangat lembut. Mengandung Ekstrak tinggi Majakani yang kaya akan Tanin, Acid Tanik, Vitamin A, B dan E serta Ekstrak Piper Betle (Sirih) yang kaya minyak atsiri, sangat baik sebagai bahan antiseptik.",
    "price": 60000,
    "compare_at_price": 75000,
    "stock": 89,
    "weight_gram": 180,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-100ml-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Manjakani-100ml-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM NA18201600036",
    "is_best_seller": true,
    "is_featured": false,
    "rating": 4.91,
    "review_count": 299
  },
  {
    "id": "prod-pronimale-kesuburan-pria",
    "category_id": "22222222-2222-2222-2222-222222222222",
    "title": "Pronimale - Kesuburan & Kualitas Sperma Pria",
    "slug": "pronimale-kesuburan-pria",
    "description": "PRONIMALE &#8211; Untuk Gairah dan Kualitas Sperma Pria WISH Pronimale sedang ada PROMO harga perboxnya dari Rp 199.000 menjadi Rp 155.000 Membantu memelihara stamina untuk pria, meningkatkan gairah dan kualitas sperma (mani encer) Kami mohon maaf untuk pembelian satuan tidak dapat test pack dan booklet ekslusif Boyke Dian Nugraha.",
    "price": 210000,
    "compare_at_price": 230000,
    "stock": 96,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183319801",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.94,
    "review_count": 336
  },
  {
    "id": "prod-femita",
    "category_id": "33333333-3333-3333-3333-333333333333",
    "title": "Femita - Kesuburan Wanita",
    "slug": "femita",
    "description": "Selamat datang di website official shop resmi WISH Boyke &amp; Co. Produk ready stock 100% original WISH dr. Boyke. Terdaftar di BPOM dan LPPOM MUI. Langsung lakukan pemesanan dan pembayaran ya…",
    "price": 210000,
    "compare_at_price": 230000,
    "stock": 103,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183319811",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.97,
    "review_count": 373
  },
  {
    "id": "prod-paket-produk-promil",
    "category_id": "33333333-3333-3333-3333-333333333333",
    "title": "Paket Produk Kesuburan - Femita dan Pronimale",
    "slug": "paket-produk-promil",
    "description": "Harga Resmi Wish Promil Hanya 369rb/paket. Harga ini sudah pasti ya sahabat Wish. Kamu akan mendapatkan 2 box produk herbal yg dapat membantu kamu dalam mendapatkan keturunan.",
    "price": 410000,
    "compare_at_price": 420000,
    "stock": 110,
    "weight_gram": 300,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femita-3.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Pronimale-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR Resmi Pasutri",
    "is_best_seller": true,
    "is_featured": true,
    "rating": 4.85,
    "review_count": 410
  },
  {
    "id": "prod-obat-keputihan-femmilove",
    "category_id": "11111111-1111-1111-1111-111111111111",
    "title": "Femmilove - Obat Keputihan Kesat dan Rapat",
    "slug": "obat-keputihan-femmilove",
    "description": "Khasiat Femmilove : Membantu mengurangi lendir yang berlebihan pada daerah kewanitaan (keputihan normal dan abnormal), Menurangi bau tidak sedap saat keputihan, Mengencangkan dan merapatkan area kewanitaan, dan mengurangi nyeri saat haid. Dibuat secara higienis dari kompilasi 26 resep ramuan Madura. Femmilove mengandung ekstrak tanaman tradisional seperti Majakani, Kunyit, Pinang, Gambir , Sirih dan lain lain. Aturan Minum : 2&#215;1 kapsul per hari",
    "price": 305000,
    "compare_at_price": 325000,
    "stock": 117,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Femmilove-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183319911",
    "is_best_seller": true,
    "is_featured": true,
    "rating": 4.88,
    "review_count": 447
  },
  {
    "id": "prod-obat-menopause-menoherbs",
    "category_id": "33333333-3333-3333-3333-333333333333",
    "title": "Menoherb - Penunda Menopause",
    "slug": "obat-menopause-menoherbs",
    "description": "MENOHERB Membantu meringankan gejala henti haid pada lanjut usia. Komposisi : Pueraria Mirifica Herba&#8230;&#8230;..350mg Centella Asiatica Herba&#8230;&#8230;..50mg Aturan Pakai: 2&#215;1 kapsul/hari selama 15 hari dalam 1 bulan dimulai haid pertama.",
    "price": 355000,
    "compare_at_price": 365000,
    "stock": 124,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-1.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-1.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Menoherb-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183319831",
    "is_best_seller": false,
    "is_featured": false,
    "rating": 4.91,
    "review_count": 484
  },
  {
    "id": "prod-prolq-kapsul",
    "category_id": "22222222-2222-2222-2222-222222222222",
    "title": "PROLQ Kapsul by Boyke",
    "slug": "prolq-kapsul",
    "description": "PROLQ Kapsul – Suplemen Herbal Memelihara Stamina Pria PROLQ Kapsul dari WISH dr. Boyke diformulasikan khusus untuk memelihara stamina pria. Mengandung ekstrak Pasak Bumi, Purwaceng, Cabe Jawa , dan Jahe Merah. Semua bahan diekstrak dari tanaman pilihan dan diproses secara higienis. Selain itu, produk ini telah terdaftar di BPOM (TR183315291) dan aman untuk konsumsi jangka panjang. Dengan konsumsi rutin, PROLQ membantu menjaga vitalitas tanpa efek samping. Aturan Pakai: 2 x 1 kapsul/hari, diminum 1 jam setelah makan. Isi: 30 kapsul Kemasan tersegel + hologram resmi 👉 Pilih PROLQ untuk solusi alami, aman, dan terpercaya. 💡 Tersedia hanya di website resmi WISH Boyke.",
    "price": 235000,
    "compare_at_price": 265000,
    "stock": 51,
    "weight_gram": 150,
    "images": [
      "https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/01/New-Cover-SKU-PROLQ-Kapsul-2.png?fit=1080%2C1080&ssl=1",
      "https://i0.wp.com/wishboyke.id/wp-content/uploads/2022/01/New-Cover-SKU-PROLQ-Kapsul-3.png?fit=1080%2C1080&ssl=1"
    ],
    "bpom_number": "BPOM TR183315291",
    "is_best_seller": true,
    "is_featured": true,
    "rating": 4.94,
    "review_count": 521
  }
];
