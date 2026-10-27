import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const fallbackImage = '/images/dr-boyke-wish.jpg';
  const displayImage = imageError || !product.images[0] ? fallbackImage : product.images[0];

  const isSoldOut = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col">
      {/* 1. Image Container (Exact UMA Women off-white canvas with clean floating cart button) */}
      <div className="relative w-full aspect-square bg-[#FCF9F1] overflow-hidden flex items-center justify-center p-3 sm:p-5">
        <Link
          to={`/product/${product.slug}`}
          className="w-full h-full flex items-center justify-center"
          aria-label={product.title}
        >
          <img
            src={displayImage}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Minimal Sold Out Badge (Matching UMA Women exact black rectangular badge) */}
        {isSoldOut && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-1 text-[9px] sm:text-[10px] uppercase font-medium tracking-widest bg-black text-white rounded-none">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Floating White Circular Cart Button (Exact UMA Women bottom-right placement) */}
        <button
          onClick={handleQuickAdd}
          disabled={isSoldOut}
          className={`absolute bottom-2.5 right-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all focus:outline-none ${
            isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label={`Tambah ${product.title} ke keranjang`}
          title={isSoldOut ? 'Stok habis' : 'Tambah ke keranjang'}
        >
          {added ? (
            <Check className="w-4 h-4 text-[#009B4C] stroke-[2.5]" />
          ) : (
            <ShoppingCart strokeWidth={1.5} className="w-4 h-4 text-[#1A1815]" />
          )}
        </button>
      </div>

      {/* 2. Product Meta (UMA Typography: Title — Price with inline dash, and tiny black star rating) */}
      <div className="mt-2.5 sm:mt-3 flex flex-col space-y-0.5">
        <Link to={`/product/${product.slug}`} className="block group/title">
          <div className="text-xs sm:text-[13px] font-normal text-[#1A1815] group-hover/title:text-[#009B4C] transition leading-snug">
            <span>{product.title}</span>
            <span className="mx-1.5 text-stone-400">—</span>
            <span className="whitespace-nowrap">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            {product.compare_at_price && (
              <span className="text-[11px] text-stone-400 line-through ml-1.5 whitespace-nowrap">
                Rp {product.compare_at_price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </Link>

        {/* Tiny solid black 5-star rating matching reference */}
        {((product.review_count ?? 0) > 0 || (product.rating ?? 0) > 0) && (
          <div className="flex items-center text-black text-[9px] sm:text-[10px] tracking-[0.18em] select-none pt-0.5">
            ★★★★★
          </div>
        )}
      </div>
    </div>
  );
};
