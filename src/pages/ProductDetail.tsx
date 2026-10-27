import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Product } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData';
import { useCart } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import { ProductCard } from '../components/ProductCard';
import {
  ShieldCheck,
  Lock,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  // Clean UMA Women collapsible accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    deskripsi: true,
    khasiat: false,
    aturan: false,
    legalitas: false,
  });

  // UMA Women FAQ collapsible accordion states
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      window.scrollTo(0, 0);

      if (!isSupabaseConfigured) {
        const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
        setProduct(found || null);
        if (found?.images?.length) setSelectedImage(found.images[0]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug);
          setProduct(fallback || null);
          if (fallback?.images?.length) setSelectedImage(fallback.images[0]);
        } else {
          setProduct(data as Product);
          if (data.images?.length) setSelectedImage(data.images[0]);
        }
      } catch {
        const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug);
        setProduct(fallback || null);
        if (fallback?.images?.length) setSelectedImage(fallback.images[0]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-normal text-[#24211D]">Produk Tidak Ditemukan</h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Produk yang Anda cari tidak tersedia atau tautan telah kedaluwarsa.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#24211D] hover:bg-[#009B4C] text-white text-xs font-semibold tracking-wider uppercase rounded-full transition duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const category = MOCK_CATEGORIES.find((c) => c.id === product.category_id);
  const categoryName = category?.name || 'Herbal Kesehatan';
  const categorySlug = category?.slug || 'all';

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isSoldOut = product.stock <= 0;

  // Curated Indonesian Subtitle/Tagline based on product title or category (Clean & concise)
  const getProductTagline = () => {
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes('manjakani') || titleLower.includes('femmilove') || titleLower.includes('spray')) {
      return 'Perawatan kebersihan & pH alami area kewanitaan.';
    }
    if (titleLower.includes('prolq') || titleLower.includes('pronimale') || titleLower.includes('stamina')) {
      return 'Formula herbal vitalitas & stamina pria dewasa.';
    }
    if (titleLower.includes('promil') || titleLower.includes('menoherb')) {
      return 'Dukungan herbal alami program kehamilan & hormon.';
    }
    if (titleLower.includes('albumia') || titleLower.includes('luka')) {
      return 'Konsentrat ekstrak albumin ikan gabus untuk pemulihan.';
    }
    if (titleLower.includes('darade') || titleLower.includes('selangit') || titleLower.includes('scent')) {
      return 'Perawatan kelembutan & kesegaran alami tubuh.';
    }
    return 'Formula herbal resmi dr. Boyke berizin BPOM RI.';
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addItem(product, quantity);
    navigate('/checkout');
  };

  // Related products from same category or top best sellers
  const relatedProducts = MOCK_PRODUCTS
    .filter((p) => p.slug !== slug && (p.category_id === product.category_id || p.is_best_seller))
    .slice(0, 4);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 space-y-10 sm:space-y-16">
        {/* Minimalist Scandinavian Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
          <Link to="/" className="hover:text-[#009B4C] transition">Beranda</Link>
          <ChevronRight className="w-3 h-3 text-stone-400 stroke-[1.5]" />
          <Link to={`/catalog?category=${categorySlug}`} className="hover:text-[#009B4C] transition">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 stroke-[1.5]" />
          <span className="text-[#24211D] font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Canvas (2-Column Scandinavian Grid mirroring UMA Women) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT COLUMN: Clean Image Gallery Canvas */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image (Clean off-white canvas) */}
            <div className="relative aspect-square sm:aspect-[4/5] bg-[#FCF9F1] overflow-hidden flex items-center justify-center p-6 sm:p-10 group">
              <img
                src={selectedImage || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Minimal Sold Out Badge */}
              {isSoldOut && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 text-[10px] uppercase font-medium tracking-widest bg-black text-white rounded-none">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails Row (if multiple images exist) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-none sm:rounded-xs border transition-all duration-200 flex-shrink-0 flex items-center justify-center p-1.5 ${
                      (selectedImage || product.images[0]) === img
                        ? 'border-[#24211D] ring-1 ring-[#24211D]'
                        : 'border-[#EDE8E1] opacity-70 hover:opacity-100 hover:border-stone-400'
                    }`}
                    aria-label={`Lihat gambar produk ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Official Discreet Packaging Callout */}
            <div className="p-3 bg-[#FAF7F2] border border-[#EDE8E1] flex items-center gap-2.5 text-xs text-stone-700">
              <Lock className="w-4 h-4 text-[#009B4C] flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[#24211D]">Kemasan 100% Diskrit &amp; Polos</span>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="text-stone-500">Privasi terjaga, kardus polos tanpa label sensitif.</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Information, Stepper, Sleek CTA, Trust Badges, Accordions */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              {/* Doctor Formulation Tag */}
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#009B4C] block mb-1.5">
                FORMULA RESMI DR. BOYKE DIAN NUGRAHA
              </span>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#24211D] tracking-tight leading-tight mb-2">
                {product.title}
              </h1>

              {/* Descriptive Subtitle */}
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed mb-3">
                {getProductTagline()}
              </p>

              {/* Rating & Stock Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-stone-500 pb-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 font-semibold text-[#24211D]">{product.rating || 5.0}</span>
                </div>
                <span>•</span>
                <span>{product.review_count} Ulasan</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#009B4C] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009B4C]"></span>
                  Stok Tersedia ({product.stock} sediaan)
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 my-4 py-2 border-y border-[#EDE8E1]">
                <span className="text-2xl sm:text-3xl font-semibold text-[#24211D]">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                {product.compare_at_price && (
                  <>
                    <span className="text-sm sm:text-base text-stone-400 line-through">
                      Rp {product.compare_at_price.toLocaleString('id-ID')}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-rose-600 text-white rounded-none">
                      Hemat {discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Sleek Pill Add to Cart CTA (Matching UMA Women layout) */}
            <div className="space-y-3">
              <span className="block text-xs uppercase tracking-wider font-semibold text-[#24211D]">
                Jumlah:
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Minimalist Quantity Stepper */}
                <div className="flex items-center justify-between border border-[#EDE8E1] bg-white rounded-full px-4 py-3 sm:w-36 flex-shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isSoldOut}
                    className="text-stone-500 hover:text-[#009B4C] transition p-1 disabled:opacity-30"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-semibold text-sm text-[#24211D]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isSoldOut}
                    className="text-stone-500 hover:text-[#009B4C] transition p-1 disabled:opacity-30"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Full-width Sleek "TAMBAH KE KERANJANG" Pill CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`flex-1 py-3.5 px-8 rounded-full font-medium text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs ${
                    isSoldOut
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : addedNotice
                      ? 'bg-[#009B4C] text-white'
                      : 'bg-[#24211D] hover:bg-[#009B4C] text-white'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>BERHASIL DITAMBAHKAN</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isSoldOut ? 'STOK HABIS' : 'TAMBAH KE KERANJANG'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Direct Checkout CTA */}
              {!isSoldOut && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-8 bg-[#009B4C] hover:bg-[#00823F] text-white font-medium text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>BELI SEKARANG (CHECKOUT LANGSUNG)</span>
                </button>
              )}

              {/* WhatsApp Doctor Advice Consultation */}
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Wish Boyke, saya ingin konsultasi mengenai produk ${product.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 text-center text-xs font-medium text-[#085C31] hover:text-[#009B4C] bg-[#EAF6EF] hover:bg-[#DEF0E5] border border-[#CDE8D5] rounded-full transition flex items-center justify-center gap-2 mt-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#009B4C]" />
                <span>Konsultasi Privat via WhatsApp</span>
              </a>
            </div>

            {/* Official Trust Badges Grid (100% Herbal Alami, BPOM & Halal MUI, Privasi Terjamin) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-4 border-y border-[#EDE8E1] text-center">
              <div className="flex flex-col items-center justify-center p-2 text-stone-700">
                <Sparkles className="w-5 h-5 text-[#009B4C] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-semibold text-[#24211D]">100% Herbal Alami</span>
                <span className="text-[10px] text-stone-500 mt-0.5 hidden sm:block">Bebas bahan kimia berbahaya</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-stone-700 border-x border-[#EDE8E1]">
                <ShieldCheck className="w-5 h-5 text-[#009B4C] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-semibold text-[#24211D]">BPOM &amp; Halal MUI</span>
                <span className="text-[10px] text-stone-500 mt-0.5 hidden sm:block">Izin edar resmi terdaftar</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-stone-700">
                <Lock className="w-5 h-5 text-[#009B4C] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-semibold text-[#24211D]">Privasi Terjamin</span>
                <span className="text-[10px] text-stone-500 mt-0.5 hidden sm:block">Paket tertutup rapat &amp; polos</span>
              </div>
            </div>

            {/* Clean Accordion Sections (Deskripsi, Khasiat & Formula Herbal, Cara Pemakaian, Legalitas & Izin BPOM) */}
            <div className="divide-y divide-[#EDE8E1] border-b border-[#EDE8E1]">
              {/* Accordion 1: Deskripsi */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('deskripsi')}
                  className="w-full py-4 flex items-center justify-between text-left font-medium text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
                >
                  <span className="tracking-wide">Deskripsi</span>
                  <span className="text-lg leading-none font-light text-stone-500">
                    {openSections.deskripsi ? '−' : '+'}
                  </span>
                </button>
                {openSections.deskripsi && (
                  <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-2">
                    <p>{product.description}</p>
                    <p className="text-stone-500 text-[11px]">
                      Diformulasikan secara khusus oleh dr. Boyke Dian Nugraha untuk memberikan perlindungan dan manfaat kesehatan nyata tanpa menimbulkan ketergantungan.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Khasiat & Formula Herbal */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('khasiat')}
                  className="w-full py-4 flex items-center justify-between text-left font-medium text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
                >
                  <span className="tracking-wide">Khasiat &amp; Formula Herbal</span>
                  <span className="text-lg leading-none font-light text-stone-500">
                    {openSections.khasiat ? '−' : '+'}
                  </span>
                </button>
                {openSections.khasiat && (
                  <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-2.5">
                    <p className="font-semibold text-[#24211D]">Keunggulan Bahan Baku Alami Pilihan:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
                      <li>Menggunakan ekstrak herbal murni dengan bioavailabilitas tinggi untuk penyerapan optimal.</li>
                      <li>Diperkaya senyawa aktif alami (tannin, flavonoid, albumin, atau saponin) sesuai spesifikasi produk.</li>
                      <li>Bebas alkohol, bebas paraben, dan tidak mengandung zat kimia sintetik berbahaya.</li>
                      <li>Teruji klinis aman digunakan secara rutin sesuai anjuran medis.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 3: Cara Pemakaian */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('aturan')}
                  className="w-full py-4 flex items-center justify-between text-left font-medium text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
                >
                  <span className="tracking-wide">Cara Pemakaian</span>
                  <span className="text-lg leading-none font-light text-stone-500">
                    {openSections.aturan ? '−' : '+'}
                  </span>
                </button>
                {openSections.aturan && (
                  <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-2.5">
                    <p className="font-semibold text-[#24211D]">Petunjuk Penggunaan &amp; Dosis:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
                      <li>Gunakan sesuai dosis atau tata cara yang tertera pada etiket kemasan.</li>
                      <li>Untuk sediaan konsumsi (kapsul/cair): Dianjurkan diminum teratur sesudah makan dengan air putih hangat.</li>
                      <li>Untuk sediaan luar (krim/spray/pembersih): Aplikasikan secara merata pada area tubuh yang dituju dalam keadaan bersih dan kering.</li>
                      <li>Simpan pada wadah tertutup rapat di tempat kering dan sejuk di bawah suhu 30°C serta terhindar dari sinar matahari langsung.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 4: Legalitas & Izin BPOM */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('legalitas')}
                  className="w-full py-4 flex items-center justify-between text-left font-medium text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
                >
                  <span className="tracking-wide">Legalitas &amp; Izin BPOM</span>
                  <span className="text-lg leading-none font-light text-stone-500">
                    {openSections.legalitas ? '−' : '+'}
                  </span>
                </button>
                {openSections.legalitas && (
                  <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-2">
                    <div className="bg-[#FAF7F2] p-3 rounded-none sm:rounded-xs border border-[#EDE8E1] space-y-1 text-xs">
                      <p>
                        <strong className="text-[#24211D]">Nomor Registrasi BPOM RI:</strong>{' '}
                        <span className="font-mono text-[#085C31] font-semibold">{product.bpom_number}</span>
                      </p>
                      <p>
                        <strong className="text-[#24211D]">Sertifikasi Halal:</strong> Terdaftar resmi Halal MUI Indonesia
                      </p>
                      <p>
                        <strong className="text-[#24211D]">Standar Fasilitas Produksi:</strong> Bersertifikat CPOTB (Cara Pembuatan Obat Tradisional yang Baik) dan cGMP
                      </p>
                      <p>
                        <strong className="text-[#24211D]">Garansi Keaslian:</strong> 100% Produk Asli Formula dr. Boyke Dian Nugraha
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* SECTION: Frequently Asked Questions (Matching UMA Women section_accordions_DBpLx4) */}
        <section className="pt-8 sm:pt-12 pb-6 border-t border-[#EDE8E1]">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#009B4C] block mb-1.5">
              INFORMASI PENGGUNAAN
            </span>
            <h2 className="text-xl sm:text-2xl font-normal text-[#24211D]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-[#EDE8E1] border-y border-[#EDE8E1]">
            {/* FAQ 1 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFaq(0)}
                className="w-full py-4 sm:py-5 flex items-center justify-between text-left font-medium text-xs sm:text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
              >
                <span className="pr-4">1) Apa keunggulan formula dr. Boyke dibandingkan produk lainnya?</span>
                <span className="text-lg leading-none font-light text-stone-500 flex-shrink-0">
                  {openFaq[0] ? '−' : '+'}
                </span>
              </button>
              {openFaq[0] && (
                <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-1.5">
                  <p>
                    Produk Wish diformulasikan langsung oleh dr. Boyke Dian Nugraha, SpOG, MARS dengan memadukan kearifan herbal tradisional Indonesia dan standar medis farmakologi modern. Seluruh bahan aktif herbal terstandar kualitas tinggi tanpa zat kimia keras atau pewangi buatan yang dapat memicu iritasi.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFaq(1)}
                className="w-full py-4 sm:py-5 flex items-center justify-between text-left font-medium text-xs sm:text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
              >
                <span className="pr-4">2) Apakah produk Wish aman untuk penggunaan rutin sehari-hari?</span>
                <span className="text-lg leading-none font-light text-stone-500 flex-shrink-0">
                  {openFaq[1] ? '−' : '+'}
                </span>
              </button>
              {openFaq[1] && (
                <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-1.5">
                  <p>
                    Ya! Seluruh produk Wish telah memiliki nomor izin edar resmi dari BPOM RI dan sertifikasi Halal MUI. Formulasinya memiliki pH yang disesuaikan secara fisiologis sehingga aman digunakan secara berkelanjutan tanpa menimbulkan efek ketergantungan.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFaq(2)}
                className="w-full py-4 sm:py-5 flex items-center justify-between text-left font-medium text-xs sm:text-sm text-[#24211D] hover:text-[#009B4C] transition focus:outline-none"
              >
                <span className="pr-4">3) Bagaimana jaminan privasi dan kerahasiaan paket pengiriman saya?</span>
                <span className="text-lg leading-none font-light text-stone-500 flex-shrink-0">
                  {openFaq[2] ? '−' : '+'}
                </span>
              </button>
              {openFaq[2] && (
                <div className="pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal animate-fadeIn space-y-1.5">
                  <p>
                    Kerahasiaan Anda adalah prioritas kami. Semua pesanan dikirim dalam kemasan kardus tertutup rapat dan polos tanpa label nama produk sensitif baik pada fisik paket maupun resi ekspedisi (keterangan hanya tertulis "Herbal Kesehatan").
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: Related Products Grid in UMA Women Style */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 sm:pt-16 border-t border-[#EDE8E1]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#009B4C] block mb-1">
                  REKOMENDASI TERKAIT
                </span>
                <h2 className="text-xl sm:text-2xl font-normal text-[#24211D]">
                  Produk Lainnya dari dr. Boyke
                </h2>
              </div>
              <Link
                to="/catalog"
                className="text-xs uppercase tracking-wider font-semibold border-b border-[#24211D] pb-0.5 hover:text-[#009B4C] hover:border-[#009B4C] transition"
              >
                Lihat Semua Produk
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
