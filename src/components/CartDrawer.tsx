import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingCart, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 150000;
  const progressToFreeShipping = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent background scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop with smooth fade */}
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-neutral-surface">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Keranjang Belanja
                {totalItems > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">
                    {totalItems} item
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Discreet Privacy Notice */}
          <div className="bg-emerald-50/80 border-b border-emerald-100/80 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <Lock className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
            <span>Kemasan diskrit: kardus polos tanpa label nama produk.</span>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-white">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
              {remainingForFreeShipping > 0 ? (
                <span>
                  Tambah <strong className="text-brand-700">Rp{remainingForFreeShipping.toLocaleString('id-ID')}</strong> untuk <strong>Bebas Ongkir</strong>
                </span>
              ) : (
                <span className="text-brand-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Anda berhak mendapatkan Bebas Ongkir
                </span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Keranjang masih kosong</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-5 leading-relaxed">
                  Pilih produk kesehatan reproduksi dan stamina herbal formula resmi dr. Boyke.
                </p>
                <button
                  onClick={closeCart}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition"
                >
                  <img
                    src={product.images[0] || '/images/wish-logo-square.png'}
                    alt={product.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-contain p-1 bg-white border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {product.title}
                        </h4>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition"
                          title="Hapus produk"
                          aria-label="Hapus produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {product.bpom_number}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-xs sm:text-sm font-bold text-brand-700">
                        Rp{(product.price * quantity).toLocaleString('id-ID')}
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 rounded-l transition"
                          aria-label="Kurang satu"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 hover:bg-gray-200 text-gray-600 rounded-r transition"
                          aria-label="Tambah satu"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-5 bg-neutral-surface space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total Produk</span>
                  <span className="font-semibold text-gray-900">Rp{totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Pengiriman</span>
                  <span className="text-brand-700 font-medium">
                    {totalPrice >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : 'Dihitung saat checkout'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                  <span>Subtotal</span>
                  <span className="text-brand-700 text-base">Rp{totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#009B4C] hover:bg-[#00823F] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition duration-200"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaksi Resmi & Bergaransi BPOM</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
