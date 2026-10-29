import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Order } from '../types';
import { AlertCircle, Lock, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [orderCode, setOrderCode] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = async (targetCode: string) => {
    if (!targetCode.trim()) return;

    setLoading(true);
    setSearched(true);

    const cleanCode = targetCode.trim().toUpperCase();

    // Check localStorage saved orders first for fast client-side recall
    try {
      const storedOrdersRaw = localStorage.getItem('wishboyke_orders');
      if (storedOrdersRaw) {
        const storedOrders: Order[] = JSON.parse(storedOrdersRaw);
        const match = storedOrders.find((o) => o.order_code.toUpperCase() === cleanCode);
        if (match) {
          setOrder(match);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('order_code', cleanCode)
          .single();

        if (!error && data) {
          setOrder(data as Order);
        } else {
          setOrder(null);
        }
      } catch {
        setOrder(null);
      }
    } else {
      // Demo simulated order
      if (cleanCode.startsWith('WBK')) {
        setOrder({
          id: 'mock-order-id',
          order_code: cleanCode,
          total_amount: 215000,
          shipping_cost: 10000,
          shipping_address: {
            recipient_name: 'Pelanggan Wish Boyke',
            phone: '0812xxxxxx',
            address_line: 'Kawasan Diskrit',
            city: 'Jakarta Selatan',
            postal_code: '12810',
          },
          courier: 'J&T Express - EZ (Layanan Reguler)',
          tracking_number: 'JT' + cleanCode.replace(/\D/g, '') + 'ID',
          is_discreet_packaging: true,
          status: 'shipped',
          payment_method: 'BCA Virtual Account',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
        });
      } else {
        setOrder(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (initialCode) {
      const timer = setTimeout(() => {
        performSearch(initialCode);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialCode]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderCode);
  };


  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8 pb-safe">
      <div className="text-center space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Lacak Status Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Masukkan kode pesanan Anda (contoh: <code>WBK-123456</code>) untuk melihat posisi pengiriman.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          placeholder="Kode Pesanan WBK-XXXXXX"
          className="flex-1 text-base sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1.5 focus:ring-brand-600 outline-none uppercase font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Mencari...' : 'Lacak'}</span>
        </button>
      </form>

      {/* Result Display */}
      {searched && (
        <div className="bg-white rounded-xl p-5 sm:p-7 border border-gray-100 shadow-card">
          {order ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div>
                  <span className="text-xs text-gray-400">Kode Pesanan</span>
                  <div className="text-base sm:text-lg font-bold text-gray-900 font-mono">{order.order_code}</div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      pending: { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-800' },
                      paid: { label: 'Pesanan Diproses', color: 'bg-blue-100 text-blue-800' },
                      shipped: { label: 'Dalam Pengiriman', color: 'bg-[#EAF6EF] text-[#085C31] border border-[#CDE8D5]' },
                      delivered: { label: 'Pesanan Diterima', color: 'bg-green-100 text-green-800' },
                      cancelled: { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-800' },
                    };
                    const s = statusMap[(order.status || '').toLowerCase()] || {
                      label: order.status,
                      color: 'bg-gray-100 text-gray-800',
                    };
                    return (
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${s.color}`}>
                        Status: {s.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block mb-0.5">Ekspedisi:</span>
                  <strong className="text-gray-900">{order.courier}</strong>
                  {order.tracking_number && (
                    <div className="mt-1">
                      No. Resi: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono font-bold">{order.tracking_number}</code>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Pengemasan Privasi:</span>
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-brand-700" />
                    <span>Kemasan Diskrit (Kardus Polos Terjamin)</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Tujuan Pengiriman:</span>
                  <div className="text-gray-800 font-medium leading-relaxed">
                    {(order.shipping_address as any)?.recipient_name || (order.shipping_address as any)?.recipient} ({(order.shipping_address as any)?.phone})
                    <div className="text-gray-500">
                      {(order.shipping_address as any)?.address_line || (order.shipping_address as any)?.address}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {(order.shipping_address as any)?.district ? `Kec. ${(order.shipping_address as any).district}, ` : ''}
                      {(order.shipping_address as any)?.city}
                      {(order.shipping_address as any)?.province ? `, ${(order.shipping_address as any).province}` : ''}
                      {` ${(order.shipping_address as any)?.postal_code || ''}`}
                    </div>
                    {(order.shipping_address as any)?.patokan && (
                      <div className="text-[11px] text-amber-700 italic mt-0.5">
                        Patokan: {(order.shipping_address as any).patokan}
                      </div>
                    )}
                    {(order.shipping_address as any)?.pinpoint_address && (
                      <div className="text-[10px] text-[#009B4C] mt-0.5">
                        Titik Peta: {(order.shipping_address as any).pinpoint_address}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Metode & Total Tagihan:</span>
                  <strong className="text-gray-900 block">{order.payment_method}</strong>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-brand-700 font-bold text-sm">
                      Rp{order.total_amount?.toLocaleString('id-ID')}
                    </span>
                    {order.shipping_cost > 0 && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        (Termasuk Ongkir Rp{order.shipping_cost.toLocaleString('id-ID')})
                      </span>
                    )}
                  </div>
                  {order.discount_amount && order.discount_amount > 0 && (
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      Hemat Rp{order.discount_amount.toLocaleString('id-ID')} {order.voucher_code ? `(${order.voucher_code})` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Items if available */}
              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Daftar Produk:</span>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                        <span className="font-medium text-gray-900">{item.product_title} × {item.quantity}</span>
                        <span className="font-semibold text-gray-900">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-gray-800">Pesanan tidak ditemukan.</p>
              <p className="text-[11px] text-gray-400">Pastikan kode yang dimasukkan sudah benar atau hubungi CS kami.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
