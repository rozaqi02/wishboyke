import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const location = useLocation();

  // Hide on /checkout where a prominent dedicated WhatsApp checkout button is already embedded
  if (location.pathname === '/checkout') {
    return null;
  }

  return (
    <a
      href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20konsultasi"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#25D366] hover:bg-[#20be5a] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] active:scale-95 transition-all duration-200 focus:outline-none group"
      aria-label="Konsultasi WhatsApp dr. Boyke"
      title="Chat WhatsApp"
    >
      <MessageCircle className="w-5 h-5 stroke-[2] flex-shrink-0 group-hover:scale-110 transition-transform" />
      <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
        Chat Kami
      </span>
    </a>
  );
};
