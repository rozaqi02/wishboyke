import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Product, Category } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { SlidersHorizontal, X, Check } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filters & sorting
  const selectedCategorySlug = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setLoading(false);
        return;
      }

      try {
        const { data: prodData } = await supabase.from('products').select('*');
        const { data: catData } = await supabase.from('categories').select('*');

        setProducts((prodData && prodData.length > 0 ? prodData : MOCK_PRODUCTS) as Product[]);
        setCategories((catData && catData.length > 0 ? catData : MOCK_CATEGORIES) as Category[]);
      } catch {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter products based on category slug and search query
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query
    if (searchQuery) {
      const matchTitle = prod.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Category Filter
    if (selectedCategorySlug !== 'all') {
      const targetCategory = categories.find((c) => c.slug === selectedCategorySlug);
      if (targetCategory && prod.category_id !== targetCategory.id) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0);
  });

  const handleCategoryChange = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    setSearchParams(nextParams);
    setShowFilterDrawer(false);
  };

  const selectedCategoryName = categories.find((c) => c.slug === selectedCategorySlug)?.name;

  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
        {/* 1. Page Title (Exact UMA Women centered "Shop All" title with zero description fluff) */}
        <div className="pt-2 sm:pt-4 pb-2 sm:pb-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#1A1815] tracking-tight">
            {searchQuery ? `Hasil: "${searchQuery}"` : 'Shop All'}
          </h1>
        </div>

        {/* 2. Top Filter Trigger Bar (Discreet right-aligned sliders icon without line clutter matching UMA Women) */}
        <div className="flex items-center justify-between pb-2 sm:pb-3">
          <div className="text-xs sm:text-sm text-stone-500 font-normal">
            {selectedCategorySlug !== 'all' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5EFE6] rounded-full text-xs text-[#1A1815]">
                <span>{selectedCategoryName}</span>
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:text-black transition"
                  aria-label="Hapus filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="p-1.5 text-[#1A1815] hover:opacity-70 transition flex items-center gap-1.5 focus:outline-none"
              aria-label="Filter dan urutkan produk"
            >
              <SlidersHorizontal strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. Product Grid (2 columns on mobile, 4 on desktop, clean spacing) */}
        <div className="pt-6 sm:pt-8">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-4">
              <p className="text-base font-normal text-stone-800">
                Tidak ada produk yang cocok dengan pencarian.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="inline-block px-6 py-2.5 bg-[#1A1815] text-white text-xs font-medium tracking-wider uppercase rounded-full hover:bg-[#009B4C] transition"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-6 sm:gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {sortedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Minimalist Slide-out Filter & Sort Drawer */}
      <div
        className={`fixed inset-0 z-[9999] transition-all duration-300 ${
          showFilterDrawer ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'
        }`}
        aria-hidden={!showFilterDrawer}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
            showFilterDrawer ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setShowFilterDrawer(false)}
        />

        {/* Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-[85vw] max-w-[360px] bg-white shadow-2xl z-[10000] flex flex-col transform transition-transform duration-300 ease-out ${
            showFilterDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#F0ECE6] flex items-center justify-between">
            <h3 className="text-base font-medium text-[#1A1815] tracking-wide">
              Filter &amp; Urutan
            </h3>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="p-1.5 text-stone-500 hover:text-black transition"
              aria-label="Tutup filter"
            >
              <X strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Sort Options */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block mb-3">
                Urutkan Berdasarkan
              </span>
              <div className="space-y-1.5">
                {[
                  { key: 'featured', label: 'Rekomendasi Utama' },
                  { key: 'price-asc', label: 'Harga: Terendah ke Tertinggi' },
                  { key: 'price-desc', label: 'Harga: Tertinggi ke Terendah' },
                  { key: 'rating', label: 'Ulasan & Rating Tertinggi' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSortBy(item.key as any)}
                    className={`w-full py-2.5 px-3 rounded-md text-left text-xs sm:text-sm flex items-center justify-between transition ${
                      sortBy === item.key
                        ? 'bg-[#F9F6F0] text-[#1A1815] font-medium'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.key && <Check className="w-4 h-4 text-[#009B4C]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block mb-3">
                Kategori Produk
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full py-2.5 px-3 rounded-md text-left text-xs sm:text-sm flex items-center justify-between transition ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#F9F6F0] text-[#1A1815] font-medium'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>Semua Produk</span>
                  {selectedCategorySlug === 'all' && <Check className="w-4 h-4 text-[#009B4C]" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full py-2.5 px-3 rounded-md text-left text-xs sm:text-sm flex items-center justify-between transition ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-[#F9F6F0] text-[#1A1815] font-medium'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategorySlug === cat.slug && <Check className="w-4 h-4 text-[#009B4C]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-5 sm:p-6 border-t border-[#F0ECE6]">
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="w-full py-3 bg-[#1A1815] hover:bg-[#009B4C] text-white text-xs sm:text-sm font-medium uppercase tracking-wider rounded-full transition"
            >
              Terapkan Filter ({sortedProducts.length} Produk)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
