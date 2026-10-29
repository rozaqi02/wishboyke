import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Product, Category } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('intimate-care');

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setLoading(false);
        return;
      }

      try {
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('is_best_seller', { ascending: false });

        if (prodError || !prodData || prodData.length === 0) {
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(prodData as Product[]);
        }

        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*');

        if (catError || !catData || catData.length === 0) {
          setCategories(MOCK_CATEGORIES);
        } else {
          setCategories(catData as Category[]);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter products for Shop All section
  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'intimate-care') {
      return p.category_id === '11111111-1111-1111-1111-111111111111';
    }
    if (activeFilter === 'stamina-pria') {
      return p.category_id === '22222222-2222-2222-2222-222222222222';
    }
    if (activeFilter === 'promil-hormon') {
      return p.category_id === '33333333-3333-3333-3333-333333333333';
    }
    if (activeFilter === 'body-care') {
      return p.category_id === '44444444-4444-4444-4444-444444444444';
    }
    if (activeFilter === 'herbal-care') {
      return p.category_id === '55555555-5555-5555-5555-555555555555';
    }
    return true;
  });

  const displayProducts = activeFilter === 'all' ? filteredProducts.slice(0, 8) : filteredProducts.slice(0, 4);

  // 4 Curated Category Highlights (clean, title-only like UMA)
  const categoriesHighlights = [
    {
      title: 'Perawatan Kewanitaan',
      href: '/catalog?category=intimate-care',
      image: 'https://wishboyke.id/wp-content/uploads/2022/06/New-Cover-SKU-Premium-Manjakani-125ml-1.png',
    },
    {
      title: 'Stamina & Vitalitas Pria',
      href: '/catalog?category=stamina-pria',
      image: 'https://wishboyke.id/wp-content/uploads/2022/01/PROLQ-Kapsul-SKU-wishboyke.id_.png',
    },
    {
      title: 'Promil & Hormon',
      href: '/catalog?category=promil-hormon',
      image: 'https://wishboyke.id/wp-content/uploads/2022/06/paket-promil-obat-promil.png',
    },
    {
      title: 'Perawatan Tubuh',
      href: '/catalog?category=body-care',
      image: 'https://wishboyke.id/wp-content/uploads/2025/10/New-Cover-SKU-Darade-1.png',
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION (Minimalist, clean, lifestyle banner with bottom-left editorial overlay) */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] h-[80svh] sm:h-[84vh] max-h-[820px] 2xl:max-h-[880px] -mt-[60px] flex items-end justify-start overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <picture className="w-full h-full block">
            <source
              media="(max-width: 767px), (orientation: portrait) and (max-width: 1024px)"
              srcSet="/images/dr-boyke-herbal-hero-mobile.jpg"
            />
            <img
              src="/images/dr-boyke-herbal-hero.jpg"
              alt="Wish Boyke &amp; Co. - Suplemen Herbal Terbaik Untuk Wanita"
              className="w-full h-full object-cover object-top md:object-[95%_center] lg:object-[82%_center] xl:object-[60%_center] 2xl:object-[45%_center]"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Subtle gradient overlay ensuring high editorial text contrast at the bottom-left */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent md:bg-gradient-to-r md:from-[#D8998F]/30 md:via-[#D8998F]/10 md:to-transparent pointer-events-none" />
        </div>

        {/* Text overlay strictly positioned in the bottom-left corner */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 pt-24">
          <div className="max-w-2xl lg:max-w-3xl space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-medium text-stone-700 block">
              FORMULA RESMI DR. BOYKE
            </span>

            <h1 className="text-[19px] sm:text-2xl md:text-3xl lg:text-[34px] xl:text-[38px] font-normal text-[#1A1815] tracking-tight leading-none whitespace-nowrap">
              Suplemen Herbal Terbaik Untuk Wanita
            </h1>
            
            <p className="text-[11px] sm:text-xs md:text-sm text-stone-700 font-normal leading-normal whitespace-nowrap">
              Formula klinis teruji dr. Boyke Dian Nugraha • 100% herbal berkhasiat terdaftar BPOM &amp; Halal.
            </p>

            {/* Clean underlined uppercase CTA with subtle hover transition matching UMA */}
            <div className="pt-2 sm:pt-3 flex items-center gap-6">
              <Link
                to="/catalog"
                className="inline-block text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#1A1815] border-b-2 border-[#1A1815] pb-1 hover:text-[#009B4C] hover:border-[#009B4C] transition-colors duration-200"
              >
                BELANJA SEMUA PRODUK
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 1: CATEGORY TILES (Clean, minimal, no text walls) */}
      <section className="py-14 sm:py-20 border-b border-[#F0ECE6]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-normal text-[#1A1815]">
              Kategori Pilihan
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {categoriesHighlights.map((cat) => (
              <Link
                key={cat.title}
                to={cat.href}
                className="group flex flex-col"
              >
                <div className="relative aspect-square bg-[#FCF9F1] overflow-hidden p-4 sm:p-6 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
                <div className="pt-3 text-center">
                  <h3 className="text-xs sm:text-sm font-medium text-[#1A1815] group-hover:text-[#009B4C] transition">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: EDITORIAL SPOTLIGHT (Streamlined & Minimal) */}
      <section className="py-16 sm:py-24 border-b border-[#F0ECE6]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="aspect-square bg-[#FCF9F1] overflow-hidden p-6 sm:p-10 flex items-center justify-center group">
              <img
                src="https://wishboyke.id/wp-content/uploads/2025/07/New-Cover-SKU-Spray-60ml-1.png"
                alt="Wish Intimate Spray"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-stone-500 block">
                SOROTAN PRODUK
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1A1815] leading-tight">
                Intimate Spray Manjakani
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
                Formula higienis tanpa bilas dari ekstrak Manjakani dan Daun Sirih pilihan untuk menjaga kesegaran dan kenyamanan alami sepanjang hari.
              </p>
              <div className="pt-2">
                <Link
                  to="/product/intimate-spray-manjakani-sabun-spray-miss-v-60-ml-wish-boyke"
                  className="inline-block px-7 py-3.5 bg-[#1A1815] hover:bg-[#009B4C] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-full transition duration-200"
                >
                  Belanja Sekarang — Rp53.000
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3: SHOP ALL GRID */}
      <section className="py-16 sm:py-24 border-b border-[#F0ECE6]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between pb-6 border-b border-[#F0ECE6]">
            <h2 className="text-2xl sm:text-3xl font-normal text-[#1A1815]">
              Shop All
            </h2>
            <Link
              to="/catalog"
              className="text-xs uppercase tracking-wider font-medium text-[#1A1815] hover:text-[#009B4C] transition"
            >
              Lihat Semua
            </Link>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="flex items-center gap-6 py-4 overflow-x-auto no-scrollbar text-xs sm:text-sm">
            {[
              { id: 'intimate-care', label: 'Perawatan Kewanitaan' },
              { id: 'stamina-pria', label: 'Stamina Pria' },
              { id: 'promil-hormon', label: 'Promil & Hormon' },
              { id: 'body-care', label: 'Perawatan Tubuh' },
              { id: 'all', label: 'Semua Produk' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap transition pb-1 ${
                  activeFilter === tab.id
                    ? 'border-b-2 border-black text-black font-medium'
                    : 'text-stone-400 hover:text-black font-normal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="pt-6">
            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-8 sm:gap-x-6 sm:gap-y-12">
                {displayProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SECTION 4 (Before Footer): Minimalist 3-Pillar Value Proposition (Clean, simple, no text walls) */}
      <section className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-[#F0ECE6]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1815] shadow-xs mb-1">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#1A1815]">100% Herbal Alami</h3>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1815] shadow-xs mb-1">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#1A1815]">Resmi BPOM &amp; Halal MUI</h3>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1815] shadow-xs mb-1">
                <Lock className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#1A1815]">Kemasan 100% Diskrit</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
