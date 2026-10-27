const fs = require('fs');
const path = require('path');

const _mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
const schemaPath = path.join(__dirname, '../supabase/schema.sql');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'wishboyke-products.json'), 'utf-8'));
const schema = fs.readFileSync(schemaPath, 'utf-8');

const baseSchema = schema.split('-- ==============================================================================\n-- 9. SEED DATA')[0];

const catSql = `-- ==============================================================================
-- 9. SEED DATA (KATEGORI & PRODUK RESMI WISH BOYKE & CO)
-- ==============================================================================

INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Perawatan Kewanitaan', 'intimate-care', 'Pembersih dan spray higienis organ kewanitaan dengan ekstrak Manjakani & Daun Sirih pilihan dr. Boyke.', 'https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png'),
('22222222-2222-2222-2222-222222222222', 'Stamina & Vitalitas Pria', 'stamina-pria', 'Suplemen penunjang vitalitas dan stamina pria dewasa dari Pasak Bumi, Purwaceng, dan Cabe Jawa.', 'https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png'),
('33333333-3333-3333-3333-333333333333', 'Promil & Keseimbangan Hormon', 'promil-hormon', 'Paket program kehamilan terpadu pasutri dan suplemen alami penunda gejala menopause wanita matang.', 'https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png'),
('44444444-4444-4444-4444-444444444444', 'Perawatan Tubuh & Wangian Intim', 'body-care', 'Krim pengencang Darade, pencerah Selangit Cream, parfum miss V food-grade, serta sabun kecantikan herbal.', 'https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png'),
('55555555-5555-5555-5555-555555555555', 'Solusi Herbal Spesifik', 'herbal-care', 'Formula herbal teruji klinis untuk pemulihan pasca operasi, kesehatan sendi, tekanan darah, dan kualitas tidur.', 'https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png');
`;

function getCatId(slug) {
  const s = slug.toLowerCase();
  if (s.includes('prolq') || s.includes('pronimale') || s.includes('neipros')) return '22222222-2222-2222-2222-222222222222';
  if (s.includes('promil') || s.includes('femita') || s.includes('menoherb')) return '33333333-3333-3333-3333-333333333333';
  if (s.includes('manjakani') || s.includes('femmilove') || s.includes('femi-herb') || s.includes('floral-extract') || s.includes('spray')) return '11111111-1111-1111-1111-111111111111';
  if (s.includes('darade') || s.includes('selangit') || s.includes('vscent') || s.includes('firesh') || s.includes('soap') || s.includes('femmislim')) return '44444444-4444-4444-4444-444444444444';
  return '55555555-5555-5555-5555-555555555555';
}

function escapeSql(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

const prodValues = products.map((p, _idx) => {
  const catId = getCatId(p.slug);
  const cleanTitle = p.title.replace(/\s*-\s*WISH\s*(Boyke\s*(&amp;|&)?\s*Co|dr\.\s*Boyke|Boyke)/gi, '').trim();
  const desc = p.description || cleanTitle;
  const price = p.price || 150000;
  const compPrice = p.compare_at_price ? p.compare_at_price : 'NULL';
  const imgArray = `ARRAY[${p.images.slice(0, 3).map(img => escapeSql(img.replace(/&#038;/g, '&'))).join(', ')}]`;
  const isBest = ['prolq-kapsul', 'obat-keputihan-femmilove', 'intimate-spray-manjakani-dr-boyke-100-ml', 'darade-krim-payudara-alami'].includes(p.slug) ? 'TRUE' : 'FALSE';
  const isFeat = ['prolq-kapsul', 'obat-keputihan-femmilove', 'darade-krim-payudara-alami'].includes(p.slug) ? 'TRUE' : 'FALSE';

  return `(
    uuid_generate_v4(),
    '${catId}',
    ${escapeSql(cleanTitle)},
    ${escapeSql(p.slug)},
    ${escapeSql(desc)},
    ${price},
    ${compPrice},
    50,
    150,
    ${imgArray},
    'BPOM Terdaftar Resmi',
    ${isBest},
    ${isFeat},
    4.9,
    180
)`;
});

const finalSql = baseSchema + catSql + '\nINSERT INTO public.products (\n    id, category_id, title, slug, description, price, compare_at_price, stock, weight_gram, images, bpom_number, is_best_seller, is_featured, rating, review_count\n) VALUES\n' + prodValues.join(',\n') + ';\n';

fs.writeFileSync(schemaPath, finalSql, 'utf-8');
console.log('Successfully updated supabase/schema.sql with 24 real products!');
