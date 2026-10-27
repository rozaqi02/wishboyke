import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Track scroll position for transparent -> blurred white header transition on homepage
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open to prevent background text bleed & scrolling
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change (including query param transitions)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  const navCategories = [
    {
      name: 'Perawatan Kewanitaan',
      path: '/catalog?category=intimate-care',
    },
    {
      name: 'Stamina & Vitalitas Pria',
      path: '/catalog?category=stamina-pria',
    },
    {
      name: 'Promil & Hormon',
      path: '/catalog?category=promil-hormon',
    },
    {
      name: 'Perawatan Tubuh & Wangian',
      path: '/catalog?category=body-care',
    },
    {
      name: 'Solusi Herbal Spesifik',
      path: '/catalog?category=herbal-care',
    },
    {
      name: 'Semua Produk',
      path: '/catalog',
    },
  ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (Clean single sentence on soft muted blue background matching UMA Women) */}
      <div className="bg-[#C0DCE8] text-[#1A1815] text-xs py-2 px-4 text-center font-normal tracking-wide relative z-30">
        <p className="truncate max-w-full">
          Gunakan kode WISH10K untuk diskon Rp10.000 pada pesanan pertamamu
        </p>
      </div>

      {/* 2. MAIN NAVBAR (Fixed 60px height, 44x44 icon buttons matching exact UMA Women proportions) */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isHome && !isScrolled
            ? 'bg-transparent border-b border-transparent'
            : 'bg-white/95 backdrop-blur-md border-b border-[#EDE8E1] shadow-xs'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-[60px] sm:h-[64px] relative">
            {/* Left: Clean Prominent Hamburger Menu Button (44x44 touch target, w-6 h-6, strokeWidth 1.5) */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-11 h-11 -ml-2 text-[#24211D] hover:text-[#009B4C] transition-colors flex items-center justify-center focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              <Menu strokeWidth={1.5} className="w-6 h-6" />
            </button>

            {/* Center: Official Wish Logo (Centered, 28px height matching UMA 80x28 logo proportion in 60px header) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
              <Link to="/" className="inline-flex items-center group py-1" aria-label="Wish by dr. Boyke Official Store">
                <img
                  src="/images/wish-logo.png"
                  alt="Wish by dr. Boyke"
                  className="h-7 sm:h-8 max-h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Right: Search & Cart Action Icons (44x44 touch target, w-6 h-6 ShoppingCart, strokeWidth 1.5) */}
            <div className="flex items-center gap-0.5 sm:gap-1 -mr-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-11 h-11 text-[#24211D] hover:text-[#009B4C] transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Cari produk"
              >
                <Search strokeWidth={1.5} className="w-6 h-6" />
              </button>

              <button
                onClick={openCart}
                className="w-11 h-11 text-[#24211D] hover:text-[#009B4C] transition-colors flex items-center justify-center relative focus:outline-none"
                aria-label={`Keranjang belanja, ${totalItems} item`}
              >
                <ShoppingCart strokeWidth={1.5} className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-2 right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#009B4C] text-white text-[10px] font-semibold flex items-center justify-center leading-none shadow-xs">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Slide-down Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#EDE8E1] bg-[#FAF8F5] px-4 py-3 sm:px-6 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-3">
              <Search strokeWidth={1.5} className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Cari PROLQ, Femmilove, Manjakani, Darade, Albumia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#24211D] placeholder-stone-400 focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 transition"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* 3. ROBUST MOBILE NAVIGATION DRAWER (UMA-style Typography & Minimalist Aesthetics) */}
      <div
        className={`fixed inset-0 z-[9999] transition-all duration-300 ${
          menuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Darkened Backdrop Overlay with Smooth Fade */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Clean Slide-out Panel with Independent Translate Animation */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi utama"
          className={`fixed inset-y-0 left-0 w-[85vw] max-w-[340px] sm:max-w-[360px] bg-white shadow-2xl z-[10000] flex flex-col transform transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="min-h-full flex flex-col justify-between px-6 sm:px-8 py-6 sm:py-8">
              {/* Minimalist Top Header */}
              <div className="flex items-center justify-between pb-8 sm:pb-10 flex-shrink-0">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center group"
                  aria-label="Wish by dr. Boyke Official Store"
                >
                  <img
                    src="/images/wish-logo.png"
                    alt="Wish by dr. Boyke"
                    className="h-8 sm:h-9 w-auto max-h-9 object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </Link>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 -mr-2 text-[#24211D] hover:text-[#009B4C] transition-colors focus:outline-none"
                  aria-label="Tutup menu navigasi"
                >
                  <X strokeWidth={1.5} className="w-6 h-6" />
                </button>
              </div>

              {/* Typography-First Category Menu */}
              <nav className="flex flex-col space-y-1 sm:space-y-1.5">
                {navCategories.map((cat, idx) => {
                  const isActive =
                    cat.path === '/catalog'
                      ? location.pathname === '/catalog' && !location.search
                      : location.pathname + location.search === cat.path;

                  return (
                    <Link
                      key={idx}
                      to={cat.path}
                      onClick={() => setMenuOpen(false)}
                      className={`text-[21px] sm:text-2xl font-medium tracking-tight py-2 sm:py-2.5 transition-colors block leading-tight ${
                        isActive
                          ? 'text-[#009B4C]'
                          : 'text-[#24211D] hover:text-[#009B4C]'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Secondary Links (Small, muted text stacked at the bottom left) */}
              <div className="mt-auto pt-10 pb-4 sm:pb-6 flex flex-col space-y-3 sm:space-y-3.5">
                <Link
                  to="/tracking"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs sm:text-[13px] text-stone-600 hover:text-[#009B4C] transition-colors font-normal w-fit"
                >
                  Lacak Pesanan
                </Link>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20konsultasi%20produk%20herbal%20dr.%20Boyke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-[13px] text-stone-600 hover:text-[#009B4C] transition-colors font-normal w-fit"
                >
                  Konsultasi WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="text-left text-xs sm:text-[13px] text-stone-600 hover:text-[#009B4C] transition-colors font-normal w-fit"
                >
                  Cari Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
