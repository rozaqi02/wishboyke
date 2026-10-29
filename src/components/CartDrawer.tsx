import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  // UMA Women Free Shipping Threshold (Rp200.000)
  const FREE_SHIPPING_THRESHOLD = 200000;
  const progressToFreeShipping = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  // Order notes state synced with localStorage
  const [showOrderNotes, setShowOrderNotes] = useState(false);
  const [orderNotes, setOrderNotes] = useState(() => {
    try {
      return localStorage.getItem('wishboyke_order_notes') || '';
    } catch {
      return '';
    }
  });

  const handleNotesChange = (val: string) => {
    setOrderNotes(val);
    try {
      localStorage.setItem('wishboyke_order_notes', val);
    } catch {
      // ignore
    }
  };

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

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Slide-over Drawer (UMA Women Clean Ivory Style) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          className={`w-full max-w-[calc(100vw-1rem)] sm:max-w-md bg-white shadow-drawer flex flex-col transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header: Cart (X items) */}
          <div className="px-5 py-4 border-b border-[#EDE8E1] flex items-center justify-between bg-white">
            <h2 className="text-base font-medium text-[#24211D] tracking-tight">
              Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h2>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#24211D] hover:opacity-60 transition rounded-full"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Free Shipping Goal Bar (UMA Style) */}
          <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EDE8E1]">
            <p className="text-xs text-[#24211D] mb-2 font-normal text-center sm:text-left">
              {remainingForFreeShipping > 0 ? (
                <>
                  Spend <span className="font-semibold">Rp {remainingForFreeShipping.toLocaleString('id-ID')}</span> more for <span className="font-semibold uppercase tracking-wider">FREE SHIPPING 📦</span>
                </>
              ) : (
                <span className="font-medium text-[#085C31]">
                  You are eligible for FREE SHIPPING 📦
                </span>
              )}
            </p>
            <div className="w-full bg-[#EDE8E1] rounded-full h-1 overflow-hidden">
              <div
                className="bg-[#24211D] h-1 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#EDE8E1]/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B655F]">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EDE8E1] flex items-center justify-center mb-3 text-[#24211D]">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-medium text-[#24211D] mb-1">Your cart is empty</h3>
                <p className="text-xs text-[#6B655F] max-w-xs mb-6">
                  Explore Dr. Boyke’s herbal intimate care & male vitality collection.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#24211D] hover:bg-black text-white text-xs font-medium rounded-full uppercase tracking-wider transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 first:pt-1 last:pb-2 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <img
                    src={product.images[0] || '/images/wish-logo-square.png'}
                    alt={product.title}
                    className="w-20 h-20 rounded-md object-contain p-1.5 bg-[#FAF8F5] border border-[#EDE8E1] flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-medium text-[#24211D] line-clamp-2 leading-snug">
                        {product.title}
                      </h4>
                      <span className="text-sm font-medium text-[#24211D] whitespace-nowrap">
                        Rp {(product.price * quantity).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B655F] mt-0.5">
                      {product.bpom_number ? `BPOM: ${product.bpom_number}` : 'Herbal Formula dr. Boyke'}
                    </p>

                    {/* Quantity Pill & Remove Link */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-[#EDE8E1] rounded-full bg-white px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-[#24211D] hover:opacity-60 transition"
                          aria-label="Kurang satu"
                        >
                          <Minus className="w-3 h-3 stroke-[1.5]" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium text-[#24211D]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-[#24211D] hover:opacity-60 transition"
                          aria-label="Tambah satu"
                        >
                          <Plus className="w-3 h-3 stroke-[1.5]" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="text-xs text-[#6B655F] hover:text-[#24211D] underline underline-offset-2 decoration-[#EDE8E1] transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-[#EDE8E1] p-5 bg-white space-y-4">
              {/* Expandable Order Notes */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOrderNotes(!showOrderNotes)}
                  className="text-xs font-medium text-[#24211D] hover:opacity-75 flex items-center gap-1 transition"
                >
                  <span>Add order notes</span>
                  <span>{showOrderNotes ? '−' : '+'}</span>
                </button>
                {showOrderNotes && (
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Special instructions for seller or courier..."
                      className="w-full text-base sm:text-xs p-2.5 rounded-lg border border-[#EDE8E1] bg-[#FAF8F5] text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition"
                    />
                  </div>
                )}
              </div>

              {/* Large Dark Pill Button: CHECKOUT • RP [TOTAL] IDR */}
              <div className="pb-safe">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 sm:py-4 bg-[#24211D] hover:bg-black active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full shadow-xs transition duration-200 text-center"
                >
                  CHECKOUT • RP {totalPrice.toLocaleString('id-ID')},00 IDR
                </button>
                <p className="text-[11px] text-[#6B655F] text-center mt-2 font-normal">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
