import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Exact SVG icons matching https://id.umawomen.com (viewBox 0 0 192 192, strokeWidth 12)
const HamburgerIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="presentation"
    className={className}
    viewBox="0 0 192 192"
  >
    <path
      d="M30 96h132M30 48h132M30 144h132"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-[26px] h-[26px]' }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="presentation"
    className={className}
    viewBox="0 0 192 192"
  >
    <path
      d="M87 150c34.794 0 63-28.206 63-63s-28.206-63-63-63-63 28.206-63 63 28.206 63 63 63ZM131.55 131.55 168 168"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const ShoppingCartIcon: React.FC<{ className?: string; hasItems?: boolean }> = ({
  className = 'w-[26px] h-[26px]',
  hasItems = false,
}) => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="presentation"
    className={className}
    viewBox="0 0 192 192"
  >
    <path
      d="M60 171a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9ZM138 171a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9Z"
      fill="currentColor"
    />
    <path
      d="M31.725 54h134.55l-19.8 69.3a11.926 11.926 0 0 1-11.55 8.7h-71.85a11.925 11.925 0 0 1-11.55-8.7l-27.15-94.95A6 6 0 0 0 18.6 24H6"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {hasItems && <circle cx="96" cy="93" r="15" fill="currentColor" />}
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-[26px] h-[26px]' }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="presentation"
    className={className}
    viewBox="0 0 192 192"
  >
    <path
      d="M150 42 42 150M150 150 42 42"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/boost';

  // Track scroll position for transparent -> solid #FFFDF7 fixed header transition
  useEffect(() => {
    const handleScroll = () => {
      // Transition as soon as announcement bar scrolls (approx 32px)
      setIsScrolled(window.scrollY > 30);
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

  // Handle escape key to close drawer or search
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

  // Close menus on route change
  const isFirstRender = useRef(true);
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

  // Dedicated Shopify-style checkout header is rendered inside Checkout.tsx
  if (location.pathname === '/checkout') {
    return null;
  }

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
      {/* 1. TOP ANNOUNCEMENT BAR (Exact UMA Women: 32px height, #C0DCE8 soft sky blue, #382E2C text, centered) */}
      <div className="bg-[#C0DCE8] text-[#382E2C] text-[13px] sm:text-[14.4px] leading-5 h-[32px] min-h-[32px] px-3 text-center font-afacad font-normal tracking-normal relative z-20 flex items-center justify-center">
        <p className="max-w-full text-center">
          Use code UMAWHELLO for Rp10K off your first purchase.
        </p>
      </div>

      {/* 2. MAIN NAVBAR HEADER (Exact UMA Women: 60px height, #382E2C icons, centered logo, solid #FFFDF7 on scroll) */}
      <header
        className={`w-full z-30 transition-colors duration-200 ${
          isScrolled
            ? 'fixed top-0 left-0 right-0 bg-[#FFFDF7] text-[#382E2C] shadow-none'
            : isHome
            ? 'relative bg-transparent text-[#382E2C]'
            : 'relative bg-[#FFFDF7] text-[#382E2C] shadow-none'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-5 md:px-[60px]">
          <div className="flex items-center justify-between h-[60px] relative">
            {/* Left: UMA-exact Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-11 h-11 -ml-2 text-[#382E2C] hover:opacity-75 transition-opacity flex items-center justify-center focus:outline-none"
              aria-label="Open navigation menu"
            >
              <HamburgerIcon className="w-7 h-7" />
            </button>

            {/* Center: Centered Logo (height 28px matching UMA proportions) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
              <Link to="/" className="inline-flex items-center group py-1" aria-label="Wish by dr. Boyke Official Store">
                <img
                  src="/images/wish-logo.png"
                  alt="Wish by dr. Boyke"
                  className="h-7 max-h-[28px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Right: Search & Cart Action Icons (Header search icon remains SearchIcon) */}
            <div className="flex items-center gap-1 -mr-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-11 h-11 text-[#382E2C] hover:opacity-75 transition-opacity flex items-center justify-center focus:outline-none"
                aria-label="Open search bar"
              >
                <SearchIcon className="w-[26px] h-[26px]" />
              </button>

              <button
                onClick={openCart}
                className="w-11 h-11 text-[#382E2C] hover:opacity-75 transition-opacity flex items-center justify-center relative focus:outline-none"
                aria-label={`Open cart, ${totalItems} items`}
              >
                <ShoppingCartIcon className="w-[26px] h-[26px]" hasItems={totalItems > 0} />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#382E2C] text-[#FFFDF7] text-[10px] font-medium flex items-center justify-center leading-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* UMA-Style Search Popdown (Centered card with editorial typography & categories) */}
        {searchOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/35 z-40 transition-opacity"
              onClick={() => setSearchOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 z-50 bg-[#FFFDF7] shadow-xl border-t border-[#EDE8E1] px-5 py-6 sm:px-8 sm:py-7">
              <div className="max-w-[620px] mx-auto">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 pb-2.5 border-b border-[#D3D3D3]">
                  <SearchIcon className="w-[22px] h-[22px] text-[#382E2C] flex-shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search for products on our site"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-[18px] sm:text-[19px] text-[#382E2C] placeholder-[#382E2C]/40 focus:outline-none font-afacad font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-[#382E2C] hover:opacity-70 transition-opacity"
                    aria-label="Close search"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </form>

                <div className="pt-4">
                  <p className="text-[12px] sm:text-[13px] font-bold tracking-[0.08em] text-[#382E2C] uppercase pb-2 border-b border-[#D3D3D3]/60 mb-3 font-afacad">
                    Browse Categories
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                    {navCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        to={cat.path}
                        onClick={() => setSearchOpen(false)}
                        className="text-[16px] sm:text-[18px] font-normal font-afacad text-[#382E2C] hover:underline underline-offset-4 transition-all"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Spacer placeholder to prevent content jump when header becomes fixed on non-home pages */}
      {isScrolled && !isHome && <div className="h-[60px] w-full" aria-hidden="true" />}

      {/* 3. UMA-STYLE NAVIGATION DRAWER (Slide-out menu, #FFFDF7 background, w-full on mobile, 400px on desktop) */}
      <div
        className={`fixed inset-0 z-[9999] transition-all duration-300 ${
          menuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Slide-out Panel (w-full on mobile, 400px on desktop matching UMA Women exactly) */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`fixed inset-y-0 left-0 w-full sm:w-[400px] sm:max-w-[400px] bg-[#FFFDF7] shadow-2xl z-[10000] flex flex-col transform transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header of Drawer: Logo + Close Button */}
          <div className="flex items-center justify-between h-[60px] px-5 md:px-6 flex-shrink-0">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center group py-1"
              aria-label="Wish by dr. Boyke Official Store"
            >
              <img
                src="/images/wish-logo.png"
                alt="Wish by dr. Boyke"
                className="h-7 max-h-[28px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(false)}
              className="w-11 h-11 -mr-2 text-[#382E2C] hover:opacity-75 transition-opacity flex items-center justify-center focus:outline-none"
              aria-label="Close navigation menu"
            >
              <CloseIcon className="w-[26px] h-[26px]" />
            </button>
          </div>

          {/* Large Editorial Menu Items */}
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 flex flex-col justify-between">
            <nav className="flex flex-col space-y-1">
              {navCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  to={cat.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-[28px] leading-[40px] font-medium font-afacad tracking-tight py-2.5 text-[#382E2C] hover:opacity-70 transition-opacity block"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Secondary Links Stacked at Bottom */}
            <div className="mt-8 pt-5 pb-6 flex flex-col space-y-1.5 border-t border-[#EDE8E1]">
              <Link
                to="/tracking"
                onClick={() => setMenuOpen(false)}
                className="text-[16px] leading-[22px] font-medium font-afacad text-[#382E2C] hover:opacity-70 transition-opacity py-1.5 block"
              >
                Lacak Pesanan
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20konsultasi%20produk%20herbal%20dr.%20Boyke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] leading-[22px] font-medium font-afacad text-[#382E2C] hover:opacity-70 transition-opacity py-1.5 block"
              >
                Konsultasi WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="text-left text-[16px] leading-[22px] font-medium font-afacad text-[#382E2C] hover:opacity-70 transition-opacity py-1.5 block"
              >
                Cari Produk
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
