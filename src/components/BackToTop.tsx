import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 360) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (location.pathname === '/checkout') {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas halaman"
      title="Kembali ke atas"
      className={`fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-30 p-2.5 rounded-full bg-[#24211D] hover:bg-[#009B4C] active:scale-95 text-white shadow-md transition-all duration-300 flex items-center justify-center focus:outline-none ${
        isVisible
          ? 'opacity-80 hover:opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 stroke-[1.5]" />
    </button>
  );
};
