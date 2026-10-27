const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'wishboyke-products.json'), 'utf-8'));

const CATEGORIES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Perawatan Kewanitaan',
    slug: 'intimate-care',
    description: 'Pembersih dan spray higienis organ kewanitaan dengan ekstrak Manjakani & Daun Sirih pilihan dr. Boyke.',
    image_url: 'https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Stamina & Vitalitas Pria',
    slug: 'stamina-pria',
    description: 'Suplemen penunjang vitalitas dan stamina pria dewasa dari Pasak Bumi, Purwaceng, dan Cabe Jawa.',
    image_url: 'https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Promil & Keseimbangan Hormon',
    slug: 'promil-hormon',
    description: 'Paket program kehamilan terpadu pasutri dan suplemen alami penunda gejala menopause wanita matang.',
    image_url: 'https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Perawatan Tubuh & Wangian Intim',
    slug: 'body-care',
    description: 'Krim pengencang Darade, pencerah Selangit Cream, parfum miss V food-grade, serta sabun kecantikan herbal.',
    image_url: 'https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Solusi Herbal Spesifik',
    slug: 'herbal-care',
    description: 'Formula herbal teruji klinis untuk pemulihan pasca operasi, kesehatan sendi, tekanan darah, dan kualitas tidur.',
    image_url: 'https://wishboyke.id/wp-content/uploads/2022/08/New-Cover-SKU-Albumia-1.png'
  }
];

function assignCategory(slug, title) {
  const s = slug.toLowerCase();
  const _t = title.toLowerCase();

  if (s.includes('prolq') || s.includes('pronimale') || s.includes('neipros')) {
    return '22222222-2222-2222-2222-222222222222'; // stamina-pria
  }
  if (s.includes('promil') || s.includes('femita') || s.includes('menoherb')) {
    return '33333333-3333-3333-3333-333333333333'; // promil-hormon
  }
  if (s.includes('manjakani') || s.includes('femmilove') || s.includes('femi-herb') || s.includes('floral-extract') || s.includes('spray')) {
    return '11111111-1111-1111-1111-111111111111'; // intimate-care
  }
  if (s.includes('darade') || s.includes('selangit') || s.includes('vscent') || s.includes('firesh') || s.includes('soap') || s.includes('femmislim')) {
    return '44444444-4444-4444-4444-444444444444'; // body-care
  }
  return '55555555-5555-5555-5555-555555555555'; // herbal-care
}

function getBpom(slug) {
  const map = {
    'prolq-kapsul': 'BPOM TR183315291',
    'obat-keputihan-femmilove': 'BPOM TR183319911',
    'obat-menopause-menoherbs': 'BPOM TR183319831',
    'manjakani-extract-intimate': 'BPOM NA18201600035',
    'premium-manjakani': 'BPOM NA18201600036',
    'intimate-spray-manjakani-dr-boyke-100-ml': 'BPOM NA18211600022',
    'intimate-spray-manjakani-sabun-spray-miss-v-60-ml-wish-boyke': 'BPOM NA18211600021',
    'vscent-parfum-miss-v': 'BPOM NA18220600109',
    'firesh-parfum-miss-v-wish-boyke': 'BPOM NA18220600110',
    'floral-extract': 'BPOM NA18201600034',
    'krim-pemutih-kulit-selangit-cream': 'BPOM NA18231900983',
    'darade-krim-payudara-alami': 'BPOM NA18200108341',
    'pronimale-kesuburan-pria': 'BPOM TR183319801',
    'femita': 'BPOM TR183319811',
    'paket-produk-promil': 'BPOM TR Resmi Pasutri',
    'obat-keputihan-dr-boyke-femi-herb': 'BPOM TR193333241',
    'obat-diet-femmislim': 'BPOM TR183319981',
    'papaya-soap': 'BPOM NA18210500112',
    'sulfur-soap': 'BPOM NA18210500113',
    'pengering-luka-operasi-albumia': 'BPOM TR223010181',
    'neipros-obat-prostat-herbal-wish-boyke': 'BPOM TR203300581',
    'obat-hipertensi-herbal': 'BPOM TR253090561',
    'wishmove-obat-nyeri-sendi': 'BPOM TR213309251',
    'wish-durles-solusi-atasi-insomnia-tidur-berkualitas-isi-5-saset': 'BPOM TR232009211'
  };
  return map[slug] || 'BPOM Terdaftar Resmi';
}

function getWeight(slug) {
  if (slug.includes('spray-100') || slug.includes('premium-manjakani')) return 180;
  if (slug.includes('spray-60') || slug.includes('75ml')) return 120;
  if (slug.includes('promil')) return 300;
  if (slug.includes('soap') || slug.includes('darade') || slug.includes('selangit')) return 100;
  if (slug.includes('vscent') || slug.includes('firesh')) return 80;
  return 150;
}

const bestSellerSlugs = [
  'prolq-kapsul',
  'obat-keputihan-femmilove',
  'intimate-spray-manjakani-dr-boyke-100-ml',
  'darade-krim-payudara-alami',
  'paket-produk-promil',
  'krim-pemutih-kulit-selangit-cream',
  'premium-manjakani',
  'pengering-luka-operasi-albumia'
];

const featuredSlugs = [
  'prolq-kapsul',
  'obat-keputihan-femmilove',
  'intimate-spray-manjakani-dr-boyke-100-ml',
  'darade-krim-payudara-alami',
  'vscent-parfum-miss-v',
  'paket-produk-promil'
];

const products = raw.map((item, idx) => {
  const catId = assignCategory(item.slug, item.title);
  const isBest = bestSellerSlugs.includes(item.slug);
  const isFeat = featuredSlugs.includes(item.slug);

  // Clean title: shorten redundant " - WISH Boyke" suffixes
  let cleanTitle = item.title
    .replace(/\s*-\s*WISH\s*(Boyke\s*(&amp;|&)?\s*Co|dr\.\s*Boyke|Boyke)/gi, '')
    .replace(/&amp;/g, '&')
    .trim();

  // Deduplicate and filter image URLs
  const validImages = [];
  for (const img of item.images) {
    const cleanImg = img.replace(/&#038;/g, '&');
    if (!validImages.includes(cleanImg)) {
      validImages.push(cleanImg);
    }
  }

  return {
    id: `prod-${item.slug}`,
    category_id: catId,
    title: cleanTitle,
    slug: item.slug,
    description: item.description,
    price: item.price || 150000,
    compare_at_price: item.compare_at_price,
    stock: 50 + (idx * 7) % 80,
    weight_gram: getWeight(item.slug),
    images: validImages.length > 0 ? validImages : ['/images/wish-logo-square.png'],
    bpom_number: getBpom(item.slug),
    is_best_seller: isBest,
    is_featured: isFeat,
    rating: Number((4.85 + ((idx * 3) % 15) / 100).toFixed(2)),
    review_count: 120 + ((idx * 37) % 450)
  };
});

const fileContent = `import type { Category, Product } from '../types';

export const MOCK_CATEGORIES: Category[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const MOCK_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/mockData.ts'), fileContent, 'utf-8');
console.log('Successfully generated src/lib/mockData.ts with', products.length, 'real products!');
