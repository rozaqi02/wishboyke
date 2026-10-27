import React, { useState, useEffect, useMemo, useId } from 'react';
import { useCart } from '../context/CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import {
  Lock,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Tag,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  QrCode,
  Building2,
  Package,
  Settings,
  X,
  ExternalLink,
  Clock,
  AlertCircle,
  Banknote,
  Compass
} from 'lucide-react';

import type { RajaOngkirDestination, ShippingOption, PromoCoupon, Order } from '../types';
import { ShopeeAddressModal } from '../components/ShopeeAddressModal';
import { MapPinModal } from '../components/MapPinModal';
import {
  DEFAULT_ORIGIN,
  calculateShippingRates,
  calculateBillableWeightKg,
  getRajaOngkirApiKey,
  setRajaOngkirApiKey,
  MOCK_DESTINATIONS
} from '../services/rajaongkir';

// Preset Marketplace Coupons
const AVAILABLE_VOUCHERS: PromoCoupon[] = [
  {
    code: 'BOYKEHEMAT',
    title: 'Diskon Belanja Rp20.000',
    discountType: 'fixed',
    discountValue: 20000,
    minSpend: 150000,
    description: 'Potongan Rp20.000 khusus produk herbal original dr. Boyke',
  },
  {
    code: 'ONGKIRGRATIS',
    title: 'Subsidi Ongkir Rp15.000',
    discountType: 'shipping',
    discountValue: 15000,
    minSpend: 100000,
    description: 'Potongan ongkos kirim ke seluruh Indonesia',
  },
  {
    code: 'SEHATPRIA',
    title: 'Diskon Spesial 10%',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 200000,
    description: 'Diskon 10% untuk pesanan minimal Rp200.000',
  },
];

export const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();

  // Unique ID for API modal
  const apiModalHeadingId = useId();

  // Read saved address from localStorage if available
  const savedAddress = useMemo(() => {
    try {
      const raw = localStorage.getItem('wishboyke_shipping_address');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // 1. Shipping Destination & Address State
  const [selectedDestination, setSelectedDestination] = useState<RajaOngkirDestination>(
    savedAddress?.destination || MOCK_DESTINATIONS[0]
  );
  const [recipientName, setRecipientName] = useState(savedAddress?.recipientName || 'Budi Santoso');
  const [phone, setPhone] = useState(savedAddress?.phone || '081234567890');
  const [email] = useState(savedAddress?.email || 'budi.santoso@example.com');
  const [addressLine, setAddressLine] = useState(
    savedAddress?.addressLine || 'Jl. Tebet Barat Raya No. 42, RT 05 / RW 03'
  );
  const [addressTag, setAddressTag] = useState<'Rumah' | 'Kantor' | 'Apartemen' | 'Kos'>(
    savedAddress?.addressTag || 'Rumah'
  );
  const [patokan, setPatokan] = useState(
    savedAddress?.patokan || 'Seberang Indomaret, pagar hitam, rumah cat hijau'
  );
  const [latitude, setLatitude] = useState<number | undefined>(
    savedAddress?.latitude || -6.2341
  );
  const [longitude, setLongitude] = useState<number | undefined>(
    savedAddress?.longitude || 106.8452
  );
  const [pinpointAddress, setPinpointAddress] = useState<string | undefined>(
    savedAddress?.pinpointAddress || 'Tebet, Kota Jakarta Selatan'
  );
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [courierNotes, setCourierNotes] = useState(
    savedAddress?.courierNotes || 'Pagar hitam. Jika tidak ada orang di rumah, titip pos sekuriti.'
  );
  const [isDropship, setIsDropship] = useState(false);
  const [dropshipSender, setDropshipSender] = useState('');
  const [dropshipPhone, setDropshipPhone] = useState('');
  const [isDiscreet, setIsDiscreet] = useState(true);

  // Address Selector Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 2. Shipping Calculation & Couriers State
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedCourierOption, setSelectedCourierOption] = useState<ShippingOption | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isInsuranceActive, setIsInsuranceActive] = useState(true);
  const insuranceCost = isInsuranceActive ? 1500 : 0;

  // 3. Voucher & Promo State
  const [inputPromoCode, setInputPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<PromoCoupon | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // 4. Payment Method State
  const [paymentCategory, setPaymentCategory] = useState<'va' | 'qris' | 'cod' | 'transfer'>('va');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('BCA Virtual Account');

  // 5. Order Processing & Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // 6. Mobile Breakdown Drawer Toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // 7. RajaOngkir V2 Inspector Modal State
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(getRajaOngkirApiKey());
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

  // Calculate Package Weight
  const totalWeightGram = useMemo(() => {
    return items.reduce((sum, item) => {
      const weight = item.product.weight_gram || 200;
      return sum + weight * item.quantity;
    }, 0);
  }, [items]);

  const billableWeightKg = useMemo(() => {
    return calculateBillableWeightKg(totalWeightGram);
  }, [totalWeightGram]);

  // Load Shipping Rates whenever Destination or Weight changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchRates() {
      if (!selectedDestination) return;
      setIsLoadingShipping(true);
      try {
        const rates = await calculateShippingRates(selectedDestination, totalWeightGram);
        if (!isCancelled) {
          setShippingOptions(rates);
          if (rates.length > 0) {
            setSelectedCourierOption((current) => {
              if (!current) return rates[0];
              const matching = rates.find(
                (r) => r.courier_code === current.courier_code && r.service === current.service
              );
              return matching || rates[0];
            });
          } else {
            setSelectedCourierOption(null);
          }
        }

      } catch (err) {
        console.error('Failed to calculate shipping rates:', err);
      } finally {
        if (!isCancelled) setIsLoadingShipping(false);
      }
    }

    fetchRates();

    return () => {
      isCancelled = true;
    };
  }, [selectedDestination, totalWeightGram]);

  // Calculate Shipping Cost and Free Shipping Rules
  const rawShippingCost = selectedCourierOption ? selectedCourierOption.cost : 0;

  // Calculate Discounts
  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (totalPrice < appliedVoucher.minSpend) return 0;

    if (appliedVoucher.discountType === 'fixed') {
      return Math.min(totalPrice, appliedVoucher.discountValue);
    }
    if (appliedVoucher.discountType === 'percentage') {
      return Math.round((totalPrice * appliedVoucher.discountValue) / 100);
    }
    if (appliedVoucher.discountType === 'shipping') {
      return Math.min(rawShippingCost, appliedVoucher.discountValue);
    }
    return 0;
  }, [appliedVoucher, totalPrice, rawShippingCost]);

  // Handle Voucher Apply
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || inputPromoCode).trim().toUpperCase();
    setVoucherError(null);
    setVoucherSuccess(null);

    if (!code) {
      setVoucherError('Silakan ketik kode voucher.');
      return;
    }

    const found = AVAILABLE_VOUCHERS.find((v) => v.code === code);
    if (!found) {
      setVoucherError(`Kode "${code}" tidak valid atau telah kedaluwarsa.`);
      return;
    }

    if (totalPrice < found.minSpend) {
      setVoucherError(
        `Voucher ${found.code} memerlukan minimal belanja Rp${found.minSpend.toLocaleString('id-ID')}.`
      );
      return;
    }

    setAppliedVoucher(found);
    setVoucherSuccess(`Voucher ${found.code} berhasil digunakan!`);
    setInputPromoCode(code);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setInputPromoCode('');
    setVoucherSuccess(null);
    setVoucherError(null);
  };

  // Grand Total Calculation
  const grandTotal = Math.max(0, totalPrice + rawShippingCost + insuranceCost - discountAmount);

  // Debounced Destination Search
  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Handle Order Submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim() || !phone.trim() || !addressLine.trim()) {
      alert('Mohon lengkapi nama penerima, nomor telepon, dan alamat jalan.');
      return;
    }

    if (!selectedCourierOption) {
      alert('Silakan pilih salah satu layanan pengiriman.');
      return;
    }

    setIsSubmitting(true);
    const orderCode = `WBK-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `${selectedCourierOption.courier_code.toUpperCase()}${Date.now().toString().slice(-8)}ID`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_code: orderCode,
      total_amount: grandTotal,
      shipping_cost: rawShippingCost,
      discount_amount: discountAmount,
      voucher_code: appliedVoucher?.code,
      shipping_address: {
        recipient_name: recipientName,
        phone,
        address_line: addressLine,
        city: selectedDestination.city,
        postal_code: selectedDestination.zip_code || selectedDestination.label.slice(-5),
        province: selectedDestination.province,
        district: selectedDestination.district,
        subdistrict: selectedDestination.subdistrict,
        urban_village: selectedDestination.subdistrict,
        patokan: patokan,
        latitude: latitude,
        longitude: longitude,
        pinpoint_address: pinpointAddress,
        destination_id: selectedDestination.id,
        label: addressTag,
        notes: courierNotes,
      },
      courier: `${selectedCourierOption.courier_name} - ${selectedCourierOption.service} (${selectedCourierOption.description})`,
      tracking_number: trackingNumber,
      is_discreet_packaging: isDiscreet,
      status: 'pending',
      payment_method: selectedPaymentMethod,
      payment_status: selectedPaymentMethod.includes('COD') ? 'unpaid' : 'pending',
      notes: courierNotes,
      created_at: new Date().toISOString(),
      items: items.map((i) => ({
        id: `item_${i.product.id}_${Date.now()}`,
        order_id: orderCode,
        product_id: i.product.id,
        product_title: i.product.title,
        quantity: i.quantity,
        price: i.product.price,
        subtotal: i.product.price * i.quantity,
        product: i.product,
      })),
    };

    // Save shipping address for future visits
    try {
      localStorage.setItem('wishboyke_shipping_address', JSON.stringify({
        recipientName,
        phone,
        email,
        addressLine,
        addressTag,
        courierNotes,
        destination: selectedDestination
      }));
    } catch {
      // ignore
    }

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_code: orderCode,
            guest_info: {
              name: recipientName,
              email: email || `${phone}@guest.wishboyke.com`,
              phone,
            },
            total_amount: grandTotal,
            shipping_cost: rawShippingCost,
            shipping_address: {
              recipient: recipientName,
              phone,
              address: addressLine,
              city: selectedDestination.city,
              province: selectedDestination.province,
              district: selectedDestination.district,
              postal_code: selectedDestination.zip_code || '',
              patokan: patokan,
              latitude: latitude,
              longitude: longitude,
              pinpoint_address: pinpointAddress,
              destination_id: selectedDestination.id,
            },
            courier: `${selectedCourierOption.courier_name} (${selectedCourierOption.service})`,
            tracking_number: trackingNumber,
            is_discreet_packaging: isDiscreet,
            payment_method: selectedPaymentMethod,
            status: 'pending',
            notes: courierNotes,
          })
          .select('id')
          .single();

        if (orderError) {
          console.error('Supabase order creation error:', orderError);
        } else if (orderData) {
          const orderItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.product.id,
            product_title: item.product.title,
            quantity: item.quantity,
            price: item.product.price,
          }));
          await supabase.from('order_items').insert(orderItems);
        }
      } catch (err) {
        console.error('Supabase query exception:', err);
      }
    }

    // 2. Save locally to localStorage orders for instant retrieval in OrderTracking
    try {
      const existingOrdersRaw = localStorage.getItem('wishboyke_orders');
      const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      localStorage.setItem('wishboyke_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch {
      // ignore
    }

    // Finish checkout process
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(newOrder);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  };

  // Save Custom RajaOngkir Key
  const handleSaveApiKey = () => {
    setRajaOngkirApiKey(customApiKey);
    setApiSaveStatus('API Key berhasil disimpan! Menghitung ulang tarif...');
    setTimeout(() => {
      setApiSaveStatus(null);
      setIsApiModalOpen(false);
      // Trigger refresh
      calculateShippingRates(selectedDestination, totalWeightGram).then((rates) => {
        setShippingOptions(rates);
        if (rates.length > 0) setSelectedCourierOption(rates[0]);
      });
    }, 1000);
  };

  // IF CART IS EMPTY AND NO SUCCESS
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-xl border border-gray-100 shadow-card text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Keranjang Belanja Kosong</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Silakan pilih produk Wish Boyke terlebih dahulu sebelum melanjutkan ke proses checkout.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          Lihat Katalog Produk
        </Link>
      </div>
    );
  }

  // ==============================================================================
  // SUCCESS STATE SCREEN (Indonesian Marketplace Standard)
  // ==============================================================================
  if (orderSuccess) {
    const codeDigits = orderSuccess.order_code.replace(/\D/g, '').padEnd(8, '9');
    const vaNumber = `8801${codeDigits}`;

    const waText = encodeURIComponent(
      `Halo CS Wish Boyke Official,\n\nSaya ingin konfirmasi pesanan dengan rincian berikut:\n` +
        `• Kode Pesanan: ${orderSuccess.order_code}\n` +
        `• Penerima: ${orderSuccess.shipping_address.recipient_name}\n` +
        `• Total Tagihan: Rp${orderSuccess.total_amount.toLocaleString('id-ID')}\n` +
        `• Kurir: ${orderSuccess.courier}\n` +
        `• Metode Bayar: ${orderSuccess.payment_method}\n` +
        `• Privasi Paket: ${orderSuccess.is_discreet_packaging ? 'Diskrit Terjamin 100%' : 'Standar'}\n\n` +
        `Mohon dibantu proses pengirimannya ya. Terima kasih!`
    );

    return (
      <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4 space-y-5">
        <div className="bg-white rounded-xl p-5 sm:p-8 border border-gray-100 shadow-card space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <img
              src="/images/wish-logo.png"
              alt="Wish by dr. Boyke"
              className="h-7 w-auto mx-auto object-contain mb-2"
            />
            <div className="w-14 h-14 rounded-full bg-[#EAF6EF] text-[#009B4C] flex items-center justify-center mx-auto mb-2 border border-[#CDE8D5]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[#085C31] uppercase bg-[#EAF6EF] px-3 py-0.5 rounded-full border border-[#CDE8D5]">
              Pesanan Berhasil Dibuat
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Terima Kasih atas Pesanan Anda
            </h1>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Pesanan Anda segera disiapkan di Gudang Pusat Wish Boyke Jakarta Selatan dengan kemasan privasi terjamin.
            </p>
          </div>

          {/* Order Code Box */}
          <div className="bg-neutral-surface border border-neutral-border rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-gray-400 block font-medium">Nomor Kode Pesanan</span>
              <span className="text-base sm:text-lg font-mono font-bold text-brand-800 tracking-wider">
                {orderSuccess.order_code}
              </span>
            </div>
            <button
              onClick={() => handleCopy(orderSuccess.order_code, 'code')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition shadow-xs"
            >
              {copiedText === 'code' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Payment Guidance Card */}
          <div className="p-4 sm:p-5 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>Instruksi Pembayaran: {orderSuccess.payment_method}</span>
              </span>
              <span className="text-[11px] bg-amber-200/60 px-2 py-0.5 rounded-md text-amber-900 font-mono">
                {orderSuccess.payment_method.includes('COD') ? 'Bayar Saat Terima' : 'Batas 24 Jam'}
              </span>
            </div>

            {orderSuccess.payment_method.includes('Virtual Account') ? (
              <div className="bg-white p-3.5 rounded-lg border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[11px] text-gray-400 block">Nomor Virtual Account</span>
                  <span className="text-base font-mono font-bold text-gray-900 tracking-wider">
                    {vaNumber}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(vaNumber, 'va')}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
                >
                  {copiedText === 'va' ? 'Tersalin' : 'Salin Nomor VA'}
                </button>
              </div>
            ) : orderSuccess.payment_method.includes('QRIS') ? (
              <div className="bg-white p-4 rounded-lg border border-amber-100 text-center space-y-2">
                <div className="w-32 h-32 mx-auto bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center p-2">
                  <QrCode className="w-20 h-20 text-gray-800" />
                  <span className="text-[10px] font-mono text-gray-500 mt-1">Scan via E-Wallet</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  QRIS aktif otomatis. Silakan scan melalui aplikasi e-wallet atau mobile banking Anda.
                </p>
              </div>
            ) : orderSuccess.payment_method.includes('Transfer') ? (
              <div className="bg-white p-3.5 rounded-lg border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[11px] text-gray-400 block">Nomor Rekening BCA Resmi</span>
                  <span className="text-base font-mono font-bold text-gray-900 tracking-wider">
                    800-192-8888
                  </span>
                  <span className="text-[11px] text-gray-500 block">a.n. PT Wish Herbal Sehat</span>
                </div>
                <button
                  onClick={() => handleCopy('8001928888', 'rek')}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
                >
                  {copiedText === 'rek' ? 'Tersalin' : 'Salin No. Rekening'}
                </button>
              </div>
            ) : (
              <div className="bg-white p-3.5 rounded-lg border border-amber-100 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-brand-700" />
                  <span>Pembayaran Tunai (COD) Saat Paket Diterima</span>
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Harap siapkan uang tunai pas sebesar <strong>Rp{orderSuccess.total_amount.toLocaleString('id-ID')}</strong> saat kurir menyerahkan paket ke alamat Anda. Tidak perlu transfer terlebih dahulu.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200/60 text-amber-900">
              <span>Total Tagihan:</span>
              <span className="font-bold text-base text-brand-800">
                Rp{orderSuccess.total_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Discreet Packaging Guarantee Alert */}
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-700" />
              <span>Privasi Pengiriman 100% Terjaga</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Paket Anda dikirim menggunakan kardus polos cokelat rapat tanpa gambar atau logo luar. Pada resi ekspedisi tertulis keterangan netral: <strong>"Herbal Kesehatan"</strong>.
            </p>
          </div>

          {/* Order Details Breakdown */}
          <div className="border border-gray-100 rounded-lg p-4 space-y-3 text-xs">
            <div className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex justify-between">
              <span>Rincian Pengiriman</span>
              <span className="text-brand-700 font-semibold">{orderSuccess.courier}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
              <div>
                <span className="text-gray-400 block text-[11px]">Penerima:</span>
                <span className="font-semibold text-gray-900">{orderSuccess.shipping_address.recipient_name}</span> ({orderSuccess.shipping_address.phone})
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Tujuan:</span>
                <span className="text-gray-900">
                  {orderSuccess.shipping_address.address_line}, {orderSuccess.shipping_address.city}
                </span>
              </div>
              {orderSuccess.tracking_number && (
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block text-[11px]">No. Resi Sementara (Tracking):</span>
                  <span className="font-mono font-bold text-gray-800">{orderSuccess.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <a
              href={`https://wa.me/6281234567890?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-sm transition text-center flex items-center justify-center gap-2"
            >
              <span>Konfirmasi via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              to={`/tracking?code=${orderSuccess.order_code}`}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-sm transition text-center"
            >
              Lacak Pesanan
            </Link>

            <Link
              to="/"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // MAIN CHECKOUT FORM (Tokopedia/Shopee Indonesian Marketplace Standard)
  // ==============================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-36 lg:pb-12">
      {/* Breadcrumb Steps Header */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali Belanja</span>
        </Link>

        {/* Steps */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Keranjang
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-brand-700 font-bold px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200">
            Pengiriman & Pembayaran
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-400">Selesai</span>
        </div>

        {/* RajaOngkir V2 Status Pill */}
        <button
          type="button"
          onClick={() => setIsApiModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
          title="Konfigurasi RajaOngkir V2 Komerce"
        >
          <Settings className="w-3 h-3 text-brand-600" />
          <span className="hidden md:inline">Integrasi:</span> RajaOngkir V2
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ==================================================================== */}
          {/* LEFT COLUMN: Shipping, Products, Couriers, Payment (8 Cols) */}
          {/* ==================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. DISCREET PACKAGING GUARANTEE BANNER */}
            <div className="bg-gradient-to-r from-emerald-50 to-brand-50/50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDiscreet}
                  onChange={(e) => setIsDiscreet(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-600" />
                      Garansi Privasi Pengiriman (Discreet Packaging)
                    </h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {isDiscreet ? 'Diskrit Aktif 100%' : 'Kemasan Standar'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">
                    Paket dibungkus kardus cokelat polos rapat tanpa gambar atau logo luar. Resi kurir hanya mencantumkan keterangan netral: <strong>"Herbal Kesehatan"</strong>.
                  </p>
                </div>
              </label>
            </div>


            {/* 2. DELIVERY ADDRESS CARD (Shopee Marketplace Standard) */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
              {/* Shopee-style top colored strip */}
              <div className="h-1 bg-gradient-to-r from-[#009B4C] via-[#00B050] to-[#00823F]" />

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EAF6EF] text-[#009B4C] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#24211D]">
                        Alamat Pengiriman
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Standar Shopee: Hierarki wilayah, titik GPS, dan label patokan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#009B4C] hover:text-[#00823F] bg-[#EAF6EF] hover:bg-[#DDF1E4] px-3 py-1.5 rounded-lg transition"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Peta GPS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-semibold text-white bg-[#009B4C] hover:bg-[#00823F] px-3.5 py-1.5 rounded-lg transition shadow-2xs"
                    >
                      Ubah Alamat
                    </button>
                  </div>
                </div>

                {/* Selected Address Display Card */}
                <div className="bg-[#FAF8F5] border border-[#EDE8E1] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#24211D] text-sm">{recipientName}</span>
                    <span className="text-xs text-stone-500">({phone})</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF6EF] text-[#085C31] border border-[#CDE8D5]">
                      {addressTag}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      Alamat Utama
                    </span>
                  </div>

                  {/* Main address line */}
                  <p className="text-xs sm:text-[13px] text-stone-800 font-medium leading-relaxed">
                    {addressLine}
                  </p>

                  {/* Regional hierarchy */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 flex-wrap">
                    <span className="font-semibold text-stone-900">
                      Kec. {selectedDestination.district}
                    </span>
                    <span>•</span>
                    <span>{selectedDestination.city}</span>
                    <span>•</span>
                    <span>{selectedDestination.province}</span>
                    <span className="font-mono text-stone-500">
                      [{selectedDestination.zip_code || 'Kode Pos'}]
                    </span>
                  </div>

                  {/* Explicit Landmark / Patokan Row */}
                  <div className="pt-2 border-t border-stone-200/80 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold flex-shrink-0 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-amber-700" />
                      <span>Patokan:</span>
                    </span>
                    <p className="text-xs text-stone-700 font-medium italic">
                      {patokan || 'Belum diisi (opsional, disarankan agar kurir cepat sampai)'}
                    </p>
                  </div>

                  {/* Pinpoint GPS coordinate badge */}
                  <div className="pt-1 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#085C31]">
                      <MapPin className="w-3.5 h-3.5 text-[#009B4C] flex-shrink-0" />
                      <span className="font-medium">
                        Titik Peta: {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Belum diatur'}
                      </span>
                      {pinpointAddress && (
                        <span className="text-stone-500 truncate max-w-[200px] sm:max-w-xs">
                          ({pinpointAddress})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="text-[11px] font-semibold text-[#009B4C] hover:underline"
                    >
                      {latitude ? 'Sesuaikan Titik Peta' : 'Tandai di Peta'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-200/80">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Catatan Tambahan untuk Kurir (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Titip pos sekuriti / pagar hitam jika penerima tidak di tempat"
                      value={courierNotes}
                      onChange={(e) => setCourierNotes(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#009B4C]"
                    />
                  </div>
                </div>

                {/* Mobile direct map button */}
                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="w-full py-2 px-3 rounded-lg bg-[#EAF6EF] text-[#009B4C] border border-[#CDE8D5] text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Pilih / Sesuaikan Titik Lokasi di Peta</span>
                  </button>
                </div>
              </div>

              {/* Dropship Checkbox Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDropship}
                    onChange={(e) => setIsDropship(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium">Kirim Sebagai Dropshipper</span>
                </label>

                {isDropship && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nama Pengirim / Toko Anda
                      </label>
                      <input
                        type="text"
                        value={dropshipSender}
                        onChange={(e) => setDropshipSender(e.target.value)}
                        placeholder="Contoh: Toko Herbal Berkah"
                        className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nomor HP Pengirim
                      </label>
                      <input
                        type="tel"
                        value={dropshipPhone}
                        onChange={(e) => setDropshipPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. ORDERED PRODUCTS REVIEW (Marketplace Grouping) */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-700 flex items-center justify-center font-bold text-xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
                      Wish Boyke Official Store
                      <span className="w-3.5 h-3.5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Dikirim dari {DEFAULT_ORIGIN.city} (Gudang Utama)
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-gray-500">
                  {items.length} Macam Produk
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80'}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono">
                          {product.bpom_number}
                        </span>
                        <span>•</span>
                        <span>{product.weight_gram || 200} gr / pcs</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-xs text-gray-500">
                          {quantity} × Rp{product.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          Rp{(product.price * quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight Indicator Banner */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">Total Berat Paket:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-900">
                    {totalWeightGram} gram
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    (Dihitung {billableWeightKg} kg tarif kurir)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Standar Kardus Polos & Bubble Wrap Rapat
                </span>
              </div>
            </div>

            {/* 4. RAJAONGKIR V2 (BY KOMERCE) STARTER COURIER SELECTOR */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      Opsi Pengiriman (RajaOngkir V2 Starter)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Tarif resmi dari Gudang Wish Boyke ke {selectedDestination.city}
                    </p>
                  </div>
                </div>

                {isLoadingShipping && (
                  <span className="text-[11px] text-brand-600 font-semibold animate-pulse">
                    Menghitung ongkir...
                  </span>
                )}
              </div>

              {/* Loading Skeleton */}
              {isLoadingShipping ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 bg-gray-100 rounded-lg animate-pulse border border-gray-200"
                    />
                  ))}
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-lg">
                  Tidak ada kurir yang tersedia untuk destinasi ini. Silakan ubah alamat pengiriman.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shippingOptions.map((option) => {
                    const isSelected =
                      selectedCourierOption?.courier_code === option.courier_code &&
                      selectedCourierOption?.service === option.service;

                    return (
                      <label
                        key={`${option.courier_code}-${option.service}`}
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/20 shadow-xs ring-1 ring-brand-500'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shipping_service"
                            checked={isSelected}
                            onChange={() => setSelectedCourierOption(option)}
                            className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  option.courier_code === 'jne'
                                    ? 'bg-blue-100 text-blue-800'
                                    : option.courier_code === 'pos'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {option.courier_name}
                              </span>
                              <span className="text-xs font-bold text-gray-900">
                                {option.service}
                              </span>
                              {option.badge && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">{option.description}</p>
                            <p className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>Estimasi tiba: {option.etd}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900 block">
                            Rp{option.cost.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Shipping Protection / Insurance Toggle */}
              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-start justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition border border-gray-200">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isInsuranceActive}
                      onChange={(e) => setIsInsuranceActive(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Proteksi Pengiriman Herbal (+Rp1.500)</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Jaminan penggantian 100% jika botol pecah, bocor, atau hilang saat ekspedisi.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700">Rp1.500</span>
                </label>
              </div>
            </div>

            {/* 5. VOUCHER & PROMO DISKON (Marketplace Staple) */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-card space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Voucher & Promo Belanja
                  </h3>
                  <p className="text-[11px] text-gray-500">Gunakan kode promo untuk potongan ekstra</p>
                </div>
              </div>

              {/* Promo input field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPromoCode}
                  onChange={(e) => setInputPromoCode(e.target.value)}
                  placeholder="Ketik kode promo (contoh: BOYKEHEMAT)"
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1.5 focus:ring-brand-600 outline-none uppercase font-mono"
                />
                {appliedVoucher ? (
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition"
                  >
                    Hapus
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Terapkan
                  </button>
                )}
              </div>

              {/* Voucher status alert */}
              {voucherSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{voucherSuccess}</span>
                </div>
              )}
              {voucherError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{voucherError}</span>
                </div>
              )}

              {/* Quick voucher pill suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-gray-500 block">
                  Voucher Tersedia untuk Anda:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AVAILABLE_VOUCHERS.map((v) => {
                    const isCurrent = appliedVoucher?.code === v.code;
                    return (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => handleApplyVoucher(v.code)}
                        className={`text-left p-2.5 rounded-lg border transition ${
                          isCurrent
                            ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-xs text-brand-800">
                            {v.code}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                          {v.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 6. PAYMENT METHOD SELECTION (Marketplace Gateway Standard) */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-card space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Metode Pembayaran
                  </h3>
                  <p className="text-[11px] text-gray-500">Pilih channel pembayaran resmi dan terverifikasi</p>
                </div>
              </div>

              {/* Category tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('va');
                    setSelectedPaymentMethod('BCA Virtual Account');
                  }}
                  className={`py-2 px-2 text-center rounded-lg transition ${
                    paymentCategory === 'va'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Virtual Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('qris');
                    setSelectedPaymentMethod('QRIS Instant (GoPay/OVO/ShopeePay)');
                  }}
                  className={`py-2 px-2 text-center rounded-lg transition ${
                    paymentCategory === 'qris'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  QRIS Instant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('cod');
                    setSelectedPaymentMethod('COD (Bayar di Tempat)');
                  }}
                  className={`py-2 px-2 text-center rounded-lg transition ${
                    paymentCategory === 'cod'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Bayar di Tempat (COD)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory('transfer');
                    setSelectedPaymentMethod('Transfer Bank Manual');
                  }}
                  className={`py-2 px-2 text-center rounded-lg transition ${
                    paymentCategory === 'transfer'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Transfer Bank
                </button>
              </div>

              {/* Category Options */}
              {paymentCategory === 'va' && (
                <div className="space-y-2 pt-1">
                  {[
                    { name: 'BCA Virtual Account', code: 'bca', desc: 'Verifikasi Otomatis 24 Jam' },
                    { name: 'Mandiri Virtual Account', code: 'mandiri', desc: 'Verifikasi Otomatis' },
                    { name: 'BRI Virtual Account (BRIVA)', code: 'bri', desc: 'Verifikasi Otomatis' },
                    { name: 'BNI Virtual Account', code: 'bni', desc: 'Verifikasi Otomatis' },
                    { name: 'BSI (Bank Syariah Indonesia)', code: 'bsi', desc: 'Pembayaran Syariah' },
                  ].map((va) => (
                    <label
                      key={va.name}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                        selectedPaymentMethod === va.name
                          ? 'border-brand-600 bg-brand-50/20 ring-1 ring-brand-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={selectedPaymentMethod === va.name}
                          onChange={() => setSelectedPaymentMethod(va.name)}
                          className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-gray-900 block">{va.name}</span>
                          <span className="text-[11px] text-gray-500">{va.desc}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Bebas Biaya
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {paymentCategory === 'qris' && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-brand-700" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        QRIS (Quick Response Code Indonesian Standard)
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Mendukung GoPay, OVO, ShopeePay, DANA, LinkAja, BCA Mobile, Livin Mandiri, dan m-Banking lainnya.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-white p-2.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Kode QR akan langsung muncul di layar setelah konfirmasi pesanan.</span>
                  </div>
                </div>
              )}

              {paymentCategory === 'cod' && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-brand-700" />
                    <span>COD (Bayar Tunai ke Kurir Saat Paket Sampai)</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Pastikan nomor WhatsApp Anda aktif untuk verifikasi pesanan sebelum barang dikirimkan oleh gudang. Pembayaran diserahkan langsung ke kurir (JNE / POS) saat paket tiba.
                  </p>
                </div>
              )}

              {paymentCategory === 'transfer' && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <span>Rekening Resmi Wish Boyke Official Store</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    BCA Rekening: <strong className="font-mono text-gray-900">800-192-8888</strong> a.n. PT Wish Herbal Sehat.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* RIGHT COLUMN: Desktop Order Summary (4-5 Cols Sticky) */}
          {/* ==================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-card space-y-5 lg:sticky lg:top-24">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex justify-between items-center">
                <span>Ringkasan Belanja</span>
                <span className="text-xs text-gray-500 font-normal">
                  {items.reduce((s, i) => s + i.quantity, 0)} Produk
                </span>
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-gray-900">
                    Rp{totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Ongkos Kirim</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-mono">
                      {selectedCourierOption?.courier_code?.toUpperCase() || 'RO'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {isLoadingShipping ? (
                      <span className="text-gray-400">Menghitung...</span>
                    ) : (
                      `Rp${rawShippingCost.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>

                {isInsuranceActive && (
                  <div className="flex justify-between">
                    <span>Proteksi Kerusakan Herbal</span>
                    <span className="font-semibold text-gray-900">Rp1.500</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Voucher ({appliedVoucher?.code})</span>
                    <span>-Rp{discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Biaya Layanan</span>
                  <span className="text-emerald-700 font-semibold">Gratis (Rp0)</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm sm:text-base font-black text-gray-900">
                  <span>Total Tagihan</span>
                  <span className="text-brand-800 text-lg">
                    Rp{grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Discreet Note */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>
                  Paket dikirim tertutup tanpa nama produk demi kerahasiaan & kenyamanan pelanggan.
                </span>
              </div>

              {/* Submit CTA Desktop */}
              <button
                type="submit"
                disabled={isSubmitting || isLoadingShipping}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Sekarang</span>
                    <span>•</span>
                    <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
                  </>
                )}
              </button>

              {/* Security Seals */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-400 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Produk Original Formula dr. Boyke</span>
                </div>
                <p className="text-[10px]">
                  Izin Edar Resmi BPOM RI • Pengiriman Resmi Gudang Jakarta Selatan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MOBILE STICKY BOTTOM ACTION BAR (Marketplace standard) */}
        {/* ==================================================================== */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 z-40 shadow-xl safe-area-bottom">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen(true)}
              className="text-left py-1"
            >
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <span>Total Tagihan</span>
                <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded font-semibold">
                  Rincian
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
              </div>
              <div className="text-base font-black text-brand-800">
                Rp{grandTotal.toLocaleString('id-ID')}
              </div>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingShipping}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-lg font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Bayar Sekarang'
              )}
            </button>
          </div>
        </div>

        {/* Mobile Breakdown Drawer (Full Marketplace Bottom Sheet) */}
        {isMobileSummaryOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setIsMobileSummaryOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4 animate-slideUp">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto -mt-1 mb-1" />
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">Rincian Pembayaran Belanja</h4>
                <button
                  type="button"
                  onClick={() => setIsMobileSummaryOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total Harga ({items.reduce((s, i) => s + i.quantity, 0)} Produk)</span>
                  <span className="font-semibold text-gray-900">
                    Rp{totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span>Ongkos Kirim</span>
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                      {selectedCourierOption?.courier_code?.toUpperCase() || 'RO'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    Rp{rawShippingCost.toLocaleString('id-ID')}
                  </span>
                </div>

                {isInsuranceActive && (
                  <div className="flex justify-between">
                    <span>Proteksi Kerusakan Herbal</span>
                    <span className="font-semibold text-gray-900">Rp1.500</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Voucher ({appliedVoucher?.code})</span>
                    <span>-Rp{discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Biaya Layanan Aplikasi</span>
                  <span className="text-emerald-700 font-semibold">Gratis (Rp0)</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-black text-gray-900">
                  <span>Total Tagihan</span>
                  <span className="text-brand-800 text-lg">
                    Rp{grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Kembali ke Checkout
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ==================================================================== */}
      {/* SHOPEE-STYLE HIERARCHICAL ADDRESS & LANDMARK SELECTOR MODAL */}
      {/* ==================================================================== */}
      <ShopeeAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={{
          recipientName,
          phone,
          addressLine,
          patokan,
          province: selectedDestination.province,
          city: selectedDestination.city,
          district: selectedDestination.district,
          subdistrict: selectedDestination.subdistrict || '',
          postalCode: selectedDestination.zip_code || '',
          destination: selectedDestination,
          addressTag,
          latitude,
          longitude,
          pinpointAddress,
        }}
        onSaveAddress={(saved) => {
          setRecipientName(saved.recipientName);
          setPhone(saved.phone);
          setAddressLine(saved.addressLine);
          setPatokan(saved.patokan);
          setAddressTag(saved.addressTag);
          setSelectedDestination(saved.destination);
          setLatitude(saved.latitude);
          setLongitude(saved.longitude);
          setPinpointAddress(saved.pinpointAddress);

          try {
            localStorage.setItem(
              'wishboyke_shipping_address',
              JSON.stringify({
                recipientName: saved.recipientName,
                phone: saved.phone,
                email,
                addressLine: saved.addressLine,
                patokan: saved.patokan,
                addressTag: saved.addressTag,
                courierNotes,
                destination: saved.destination,
                latitude: saved.latitude,
                longitude: saved.longitude,
                pinpointAddress: saved.pinpointAddress,
              })
            );
          } catch {
            // ignore
          }
        }}
      />

      {/* ==================================================================== */}
      {/* INTERACTIVE LEAFLET OPENSTREETMAP PINPOINT MODAL */}
      {/* ==================================================================== */}
      <MapPinModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={latitude || -6.2341}
        initialLng={longitude || 106.8452}
        initialLabel={pinpointAddress || addressLine}
        onConfirmLocation={(loc) => {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
          setPinpointAddress(loc.addressLabel);
          try {
            const current = localStorage.getItem('wishboyke_shipping_address');
            if (current) {
              const parsed = JSON.parse(current);
              parsed.latitude = loc.latitude;
              parsed.longitude = loc.longitude;
              parsed.pinpointAddress = loc.addressLabel;
              localStorage.setItem('wishboyke_shipping_address', JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }
        }}
      />

      {/* ==================================================================== */}
      {/* RAJAONGKIR V2 (BY KOMERCE) SETTINGS & INSPECTOR MODAL */}
      {/* ==================================================================== */}
      {isApiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={apiModalHeadingId}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-600" />
                <h3 id={apiModalHeadingId} className="text-base font-bold text-gray-900">
                  Status RajaOngkir V2 (by Komerce)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsApiModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-neutral-surface border border-neutral-border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Paket Lisensi:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    Starter (Gratis)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Asal Gudang (Origin):</span>
                  <span className="font-semibold text-gray-800">{DEFAULT_ORIGIN.city} (ID: {DEFAULT_ORIGIN.id})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Ekspedisi Starter:</span>
                  <span className="font-semibold text-gray-800">JNE, POS Indonesia, TIKI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Endpoint API:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 text-[10px]">
                    rajaongkir.komerce.id/api
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  API Key Komerce / RajaOngkir Anda:
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Masukkan API Key RajaOngkir V2 Anda..."
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-gray-200 focus:ring-1.5 focus:ring-brand-600 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Bisa diisi di file <code>.env</code> (variabel <code>VITE_RAJAONGKIR_API_KEY</code>) atau disimpan sementara di browser ini. Jika kosong, sistem otomatis menggunakan kalkulator zona logistik akurat untuk simulasi instan.
                </p>
              </div>

              {apiSaveStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                  {apiSaveStatus}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <a
                href="https://rajaongkir.komerce.id"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-brand-700 hover:underline flex items-center gap-1"
              >
                <span>Dashboard Komerce</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg transition"
              >
                Simpan & Tes Koneksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
