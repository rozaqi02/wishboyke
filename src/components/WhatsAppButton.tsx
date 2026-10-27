import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/6281234567890?text=Halo%20Wish%20Boyke,%20saya%20ingin%20konsultasi"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.35)] hover:scale-105 active:scale-95 transition-transform focus:outline-none"
      aria-label="Konsultasi WhatsApp"
      title="Chat WhatsApp"
    >
      <MessageCircle className="w-6 h-6 stroke-[2]" />
    </a>
  );
};
