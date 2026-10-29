import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    category: false,
    concern: false,
    learn: false,
    more: false,
  });

  const toggleSection = (key: string) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Keep /checkout minimal and distraction-free
  if (location.pathname === '/checkout') {
    return null;
  }

  return (
    <footer className="bg-[#EEE5D3] text-[#1A1815] transition-colors pb-safe">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-16">
        {/* Main Directory: Mobile Accordion, Desktop 4 Columns (Exact UMA layout) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10 border-t border-[#DFD5C2] md:border-t-0">
          {/* 1. Shop by Category / Kategori Produk */}
          <div className="border-b border-[#DFD5C2] md:border-b-0 py-3.5 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between py-1 md:py-0 text-left font-normal text-sm md:text-base text-[#1A1815] md:pointer-events-none focus:outline-none"
            >
              <span className="font-normal">Kategori Produk</span>
              <span className="md:hidden text-[#1A1815] flex items-center">
                {openSection.category ? <Minus className="w-4 h-4 stroke-[1.5]" /> : <Plus className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>
            <ul className={`pt-3 md:pt-4 space-y-2.5 text-xs sm:text-sm text-stone-700 font-normal ${openSection.category ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/catalog?category=intimate-care" className="hover:text-black transition">
                  Perawatan Kewanitaan
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=stamina-pria" className="hover:text-black transition">
                  Stamina Pria (PROLQ)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=promil-hormon" className="hover:text-black transition">
                  Promil &amp; Hormon
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=body-care" className="hover:text-black transition">
                  Perawatan Tubuh &amp; Wangian
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=herbal-care" className="hover:text-black transition">
                  Solusi Herbal Spesifik
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-black transition font-medium">
                  Semua Produk
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Shop by Concern / Solusi Kebutuhan */}
          <div className="border-b border-[#DFD5C2] md:border-b-0 py-3.5 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection('concern')}
              className="w-full flex items-center justify-between py-1 md:py-0 text-left font-normal text-sm md:text-base text-[#1A1815] md:pointer-events-none focus:outline-none"
            >
              <span className="font-normal">Solusi Kebutuhan</span>
              <span className="md:hidden text-[#1A1815] flex items-center">
                {openSection.concern ? <Minus className="w-4 h-4 stroke-[1.5]" /> : <Plus className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>
            <ul className={`pt-3 md:pt-4 space-y-2.5 text-xs sm:text-sm text-stone-700 font-normal ${openSection.concern ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/catalog?category=intimate-care" className="hover:text-black transition">
                  Keputihan &amp; Bau Tak Sedap
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=stamina-pria" className="hover:text-black transition">
                  Vitalitas &amp; Pasak Bumi
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=promil-hormon" className="hover:text-black transition">
                  Program Hamil Alami
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=promil-hormon" className="hover:text-black transition">
                  Gejala Menopause
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=herbal-care" className="hover:text-black transition">
                  Pemulihan Pasca Operasi
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Learn / Edukasi & Layanan */}
          <div className="border-b border-[#DFD5C2] md:border-b-0 py-3.5 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection('learn')}
              className="w-full flex items-center justify-between py-1 md:py-0 text-left font-normal text-sm md:text-base text-[#1A1815] md:pointer-events-none focus:outline-none"
            >
              <span className="font-normal">Edukasi &amp; Layanan</span>
              <span className="md:hidden text-[#1A1815] flex items-center">
                {openSection.learn ? <Minus className="w-4 h-4 stroke-[1.5]" /> : <Plus className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>
            <ul className={`pt-3 md:pt-4 space-y-2.5 text-xs sm:text-sm text-stone-700 font-normal ${openSection.learn ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link to="/" className="hover:text-black transition">
                  Tentang dr. Boyke
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-black transition">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20konsultasi"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black transition"
                >
                  Konsultasi Privat WhatsApp
                </a>
              </li>
              <li>
                <span className="text-stone-600 cursor-default">
                  100% Kemasan Diskrit &amp; Polos
                </span>
              </li>
            </ul>
          </div>

          {/* 4. More / Bantuan */}
          <div className="border-b border-[#DFD5C2] md:border-b-0 py-3.5 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection('more')}
              className="w-full flex items-center justify-between py-1 md:py-0 text-left font-normal text-sm md:text-base text-[#1A1815] md:pointer-events-none focus:outline-none"
            >
              <span className="font-normal">Bantuan &amp; Kontak</span>
              <span className="md:hidden text-[#1A1815] flex items-center">
                {openSection.more ? <Minus className="w-4 h-4 stroke-[1.5]" /> : <Plus className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>
            <ul className={`pt-3 md:pt-4 space-y-2.5 text-xs sm:text-sm text-stone-700 font-normal ${openSection.more ? 'block' : 'hidden md:block'}`}>
              <li>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20tanya%20produk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black transition"
                >
                  Chat WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:cs@wishboyke.com" className="hover:text-black transition">
                  cs@wishboyke.com
                </a>
              </li>
              <li>
                <span className="text-stone-600 cursor-default">
                  Izin Edar BPOM &amp; Halal MUI
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons (Solid dark rounded square badges matching UMA Women reference) */}
        <div className="pt-8 sm:pt-12 pb-6 flex items-center gap-3.5 text-white">
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 bg-[#1A1815] hover:bg-black rounded-[6px] flex items-center justify-center text-[#EEE5D3] transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 bg-[#1A1815] hover:bg-black rounded-[6px] flex items-center justify-center text-[#EEE5D3] transition-colors"
            aria-label="TikTok"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.83 4.83 0 0 1-1-.43z" />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 bg-[#1A1815] hover:bg-black rounded-[6px] flex items-center justify-center text-[#EEE5D3] transition-colors"
            aria-label="YouTube"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        {/* Region / Language */}
        <div className="pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#1A1815] font-normal cursor-pointer hover:opacity-70 transition">
            <span>Indonesia</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
          </div>
        </div>

        {/* Copyright & Legal Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600 font-normal">
          <p>© {CURRENT_YEAR}, Wish Boyke &amp; Co.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-black cursor-pointer transition">
              Syarat &amp; Ketentuan
            </span>
            <span className="hover:text-black cursor-pointer transition">
              Kebijakan Privasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
