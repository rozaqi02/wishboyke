import React, { useState, useEffect, useMemo, useId } from 'react';
import { useCart } from '../context/CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Check,
  Copy,
  ExternalLink,
  Lock,
  Settings,
  X,
  CreditCard,
  ArrowLeft,
  QrCode,
  Building2,
  Banknote,
  Truck,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

import type { RajaOngkirDestination, ShippingOption, PromoCoupon, Order } from '../types';
import { UmaRegionSelectorModal, type SelectedRegionData } from '../components/UmaRegionSelectorModal';
import {
  calculateShippingRates,
  calculateBillableWeightKg,
  getRajaOngkirApiKey,
  setRajaOngkirApiKey,
  MOCK_DESTINATIONS,
  DEFAULT_ORIGIN
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
    description: 'Potongan ongkos kirim J&T Express ke seluruh Indonesia',
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
  const apiModalHeadingId = useId();

  // Read saved address from localStorage
  const savedAddress = useMemo(() => {
    try {
      const raw = localStorage.getItem('wishboyke_shipping_address');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Customer Contact & Shipping Address Form
  const [emailOrPhone, setEmailOrPhone] = useState(
    savedAddress?.email || savedAddress?.phone || 'budi.santoso@example.com'
  );
  const [firstName, setFirstName] = useState(() => {
    if (savedAddress?.recipientName) {
      const parts = savedAddress.recipientName.split(' ');
      return parts[0] || 'Budi';
    }
    return 'Budi';
  });
  const [lastName, setLastName] = useState(() => {
    if (savedAddress?.recipientName) {
      const parts = savedAddress.recipientName.split(' ');
      return parts.slice(1).join(' ') || 'Santoso';
    }
    return 'Santoso';
  });
  const [phone, setPhone] = useState(savedAddress?.phone || '081234567890');
  const [addressLine, setAddressLine] = useState(
    savedAddress?.addressLine || 'Jl. Tebet Barat Raya No. 42, RT 05 / RW 03'
  );
  const [apartment, setApartment] = useState(savedAddress?.apartment || '');
  const [selectedDestination, setSelectedDestination] = useState<RajaOngkirDestination>(
    savedAddress?.destination || MOCK_DESTINATIONS[0]
  );
  const [postalCode, setPostalCode] = useState(
    selectedDestination?.zip_code || '12810'
  );
  const [saveInfo, setSaveInfo] = useState(true);

  // Address Selector Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Exclusively J&T Express Shipping State
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedCourierOption, setSelectedCourierOption] = useState<ShippingOption | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Payment Method State
  // Categories: 'qris' | 'va' | 'transfer' | 'cod'
  const [paymentCategory, setPaymentCategory] = useState<'qris' | 'va' | 'transfer' | 'cod'>('qris');
  const [selectedVaBank, setSelectedVaBank] = useState('BCA Virtual Account');

  const selectedPaymentMethod = useMemo(() => {
    if (paymentCategory === 'va') return selectedVaBank;
    if (paymentCategory === 'transfer') return 'Transfer Bank Manual';
    if (paymentCategory === 'cod') return 'COD (Bayar di Tempat)';
    return 'QRIS Instant';
  }, [paymentCategory, selectedVaBank]);

  // Billing address state (Shopify style)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Voucher state
  const [inputPromoCode, setInputPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<PromoCoupon | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Order submission & Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Mobile Order Summary Drawer
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // J&T Express API Modal
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

  // Load Real-Time J&T Express Shipping Rates whenever Destination or Weight changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchJntRates() {
      if (!selectedDestination) return;
      setIsLoadingShipping(true);
      try {
        const rates = await calculateShippingRates(selectedDestination, totalWeightGram);
        if (!isCancelled) {
          // Strictly J&T Express options only
          const jntRates = rates.filter((r) => r.courier_code === 'jnt');
          setShippingOptions(jntRates);
          if (jntRates.length > 0) {
            setSelectedCourierOption((current) => {
              if (!current) return jntRates[0];
              const match = jntRates.find((r) => r.service === current.service);
              return match || jntRates[0];
            });
          } else {
            setSelectedCourierOption(null);
          }
        }
      } catch (err) {
        console.error('Failed to calculate J&T Express shipping rates:', err);
      } finally {
        if (!isCancelled) setIsLoadingShipping(false);
      }
    }

    fetchJntRates();

    return () => {
      isCancelled = true;
    };
  }, [selectedDestination, totalWeightGram]);

  // Shipping Cost & Discount Calculations
  const rawShippingCost = selectedCourierOption ? selectedCourierOption.cost : 0;

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

  const grandTotal = Math.max(0, totalPrice + rawShippingCost - discountAmount);

  // Apply Voucher Handler
  const handleApplyVoucher = () => {
    const code = inputPromoCode.trim().toUpperCase();
    setVoucherError(null);
    setVoucherSuccess(null);

    if (!code) {
      setVoucherError('Silakan masukkan kode voucher.');
      return;
    }

    const found = AVAILABLE_VOUCHERS.find((v) => v.code === code);
    if (!found) {
      setVoucherError(`Kode "${code}" tidak valid.`);
      return;
    }

    if (totalPrice < found.minSpend) {
      setVoucherError(
        `Voucher ${found.code} membutuhkan minimum belanja Rp${found.minSpend.toLocaleString('id-ID')}.`
      );
      return;
    }

    setAppliedVoucher(found);
    setVoucherSuccess(`Voucher ${found.code} berhasil digunakan!`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setInputPromoCode('');
    setVoucherSuccess(null);
    setVoucherError(null);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Save J&T Express API Key
  const handleSaveApiKey = () => {
    setRajaOngkirApiKey(customApiKey);
    setApiSaveStatus('API Key berhasil disimpan! Menghitung ulang tarif J&T Express real-time...');
    setTimeout(() => {
      setApiSaveStatus(null);
      setIsApiModalOpen(false);
      calculateShippingRates(selectedDestination, totalWeightGram).then((rates) => {
        const jntRates = rates.filter((r) => r.courier_code === 'jnt');
        setShippingOptions(jntRates);
        if (jntRates.length > 0) setSelectedCourierOption(jntRates[0]);
      });
    }, 900);
  };

  // Handle Region Selection (Minimalist UMA Women Style)
  const handleRegionSelected = (data: SelectedRegionData) => {
    setSelectedDestination(data.destination);
    setPostalCode(data.postalCode || data.destination.zip_code || '');
    setIsAddressModalOpen(false);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !phone.trim() || !addressLine.trim()) {
      alert('Mohon lengkapi nama penerima, nomor telepon, dan alamat pengiriman.');
      return;
    }

    if (!selectedCourierOption) {
      alert('Silakan pilih opsi layanan pengiriman J&T Express.');
      return;
    }

    setIsSubmitting(true);
    const orderCode = `WBK-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `JT${Date.now().toString().slice(-9)}ID`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      order_code: orderCode,
      total_amount: grandTotal,
      shipping_cost: rawShippingCost,
      discount_amount: discountAmount,
      voucher_code: appliedVoucher?.code,
      shipping_address: {
        recipient_name: fullName,
        phone,
        address_line: addressLine,
        city: selectedDestination.city,
        postal_code: postalCode || selectedDestination.zip_code || '',
        province: selectedDestination.province,
        district: selectedDestination.district,
        destination_id: selectedDestination.id,
      },
      courier: `J&T Express - ${selectedCourierOption.service} (${selectedCourierOption.description})`,
      tracking_number: trackingNumber,
      is_discreet_packaging: true,
      status: 'pending',
      payment_method: selectedPaymentMethod,
      payment_status: paymentCategory === 'cod' ? 'unpaid' : 'pending',
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
    if (saveInfo) {
      try {
        localStorage.setItem(
          'wishboyke_shipping_address',
          JSON.stringify({
            recipientName: fullName,
            phone,
            email: emailOrPhone,
            addressLine,
            apartment,
            destination: selectedDestination,
            postalCode,
          })
        );
      } catch {
        // ignore
      }
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .insert({
            order_code: orderCode,
            guest_info: {
              name: fullName,
              email: emailOrPhone.includes('@') ? emailOrPhone : `${phone}@guest.wishboyke.com`,
              phone,
            },
            total_amount: grandTotal,
            shipping_cost: rawShippingCost,
            shipping_address: {
              recipient: fullName,
              phone,
              address: addressLine,
              city: selectedDestination.city,
              province: selectedDestination.province,
              district: selectedDestination.district,
              postal_code: postalCode,
            },
            courier: `J&T Express (${selectedCourierOption.service})`,
            tracking_number: trackingNumber,
            is_discreet_packaging: true,
            payment_method: selectedPaymentMethod,
            status: 'pending',
          })
          .select('id')
          .single();

        if (orderData) {
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
        console.error('Supabase save error:', err);
      }
    }

    // Save locally
    try {
      const existingRaw = localStorage.getItem('wishboyke_orders');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('wishboyke_orders', JSON.stringify([newOrder, ...existing]));
    } catch {
      // ignore
    }

    // Rich pre-filled WhatsApp order text
    const itemLines = items
      .map(
        (i) =>
          `• ${i.product.title} (${i.quantity}x) = Rp${(i.product.price * i.quantity).toLocaleString('id-ID')}`
      )
      .join('\n');

    const waOrderMessage = encodeURIComponent(
      `Halo CS Wish Boyke Official,\n\nSaya ingin memesan produk Wish dr. Boyke:\n` +
        `📦 *KODE PESANAN:* ${orderCode}\n\n` +
        `👤 *DATA PENERIMA:*\n` +
        `• Nama: ${fullName}\n` +
        `• No. HP: ${phone}\n` +
        `• Alamat: ${addressLine}, ${selectedDestination.district}, ${selectedDestination.city}, ${selectedDestination.province} (${postalCode})\n\n` +
        `🚚 *PENGIRIMAN:*\n` +
        `• J&T Express ${selectedCourierOption.service} (Rp${rawShippingCost.toLocaleString('id-ID')})\n\n` +
        `🛍️ *DAFTAR PRODUK:*\n` +
        `${itemLines}\n\n` +
        `💰 *TOTAL TAGIHAN:* Rp${grandTotal.toLocaleString('id-ID')}\n` +
        `💳 *METODE BAYAR:* ${selectedPaymentMethod} (Sedang Dipersiapkan)\n\n` +
        `*Catatan:* Rekening pembayaran online sedang dalam tahap konfigurasi akhir merchant. Mohon panduan nomor rekening resmi untuk menyelesaikan transaksi. Terima kasih!`
    );

    const waUrl = `https://wa.me/6281234567890?text=${waOrderMessage}`;

    // Direct 1-click WhatsApp order handoff:
    // Execute window.open synchronously within the user gesture tick so iOS Safari does not block it as an unauthorized popup
    try {
      window.open(waUrl, '_blank');
    } catch {
      // If WebKit restricts the popup, the user can still tap the prominent WhatsApp button on the confirmation screen
    }

    setIsSubmitting(false);
    setOrderSuccess(newOrder);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==============================================================================
  // 1. ORDER CONFIRMATION / SUCCESS VIEW (UMA Women Minimalist Style)
  // Clear notice that online payment is in preparation, with direct WhatsApp button
  // ==============================================================================
  if (orderSuccess) {
    const waSuccessItems = orderSuccess.items
      ? orderSuccess.items
          .map(
            (i) =>
              `• ${i.product_title} (${i.quantity}x) = Rp${(i.price * i.quantity).toLocaleString('id-ID')}`
          )
          .join('\n')
      : '';

    const waSuccessText = encodeURIComponent(
      `Halo CS Wish Boyke Official,\n\nSaya ingin konfirmasi pesanan:\n` +
        `📦 *KODE PESANAN:* ${orderSuccess.order_code}\n\n` +
        `👤 *PENERIMA:* ${orderSuccess.shipping_address.recipient_name} (${orderSuccess.shipping_address.phone})\n` +
        `📍 *ALAMAT:* ${orderSuccess.shipping_address.address_line}, ${orderSuccess.shipping_address.city} (${orderSuccess.shipping_address.postal_code})\n` +
        `🚚 *KURIR:* ${orderSuccess.courier}\n\n` +
        (waSuccessItems ? `🛍️ *DAFTAR PRODUK:*\n${waSuccessItems}\n\n` : '') +
        `💰 *TOTAL TAGIHAN:* Rp${orderSuccess.total_amount.toLocaleString('id-ID')}\n` +
        `💳 *METODE BAYAR:* ${orderSuccess.payment_method} (Sedang Dipersiapkan)\n\n` +
        `*Catatan:* Rekening pembayaran gateway sedang dikonfigurasi. Mohon informasi nomor rekening resmi merchant untuk menyelesaikan pesanan saya. Terima kasih!`
    );

    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans py-12 px-4 sm:px-6 pb-safe">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#EDE8E1] p-6 sm:p-10 shadow-xs space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block">
              <img
                src="/images/wish-logo.png"
                alt="Wish by dr. Boyke"
                className="h-8 w-auto mx-auto object-contain"
              />
            </Link>

            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EDE8E1] text-[#085C31] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>

            <span className="inline-block text-[11px] font-semibold tracking-wider text-[#085C31] uppercase bg-[#EAF6EF] px-3 py-1 rounded-full">
              Pesanan Dikonfirmasi
            </span>

            <h1 className="text-xl sm:text-2xl font-medium text-[#24211D] tracking-tight">
              Terima Kasih atas Pesanan Anda
            </h1>

            <p className="text-xs text-[#6B655F] max-w-sm mx-auto leading-relaxed">
              Pesanan Anda segera disiapkan di Gudang Wish Boyke dan dikirimkan via J&T Express dengan privasi kemasan terjamin.
            </p>
          </div>

          {/* Order Code Box */}
          <div className="bg-[#FAF8F5] border border-[#EDE8E1] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#6B655F] block font-normal">Nomor Kode Pesanan</span>
              <span className="text-base font-bold text-[#24211D] tracking-wider">
                {orderSuccess.order_code}
              </span>
            </div>
            <button
              onClick={() => handleCopy(orderSuccess.order_code, 'code')}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#EDE8E1] hover:bg-[#FAF8F5] text-[#24211D] rounded-full transition flex items-center gap-1.5"
            >
              {copiedText === 'code' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6B655F]" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Payment Guidance Card (Merchant Online Payment In Preparation Notice) */}
          <div className="border border-[#EDE8E1] rounded-xl p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#EDE8E1]">
              <span className="font-medium text-[#24211D] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#6B655F]" />
                <span>Metode: {orderSuccess.payment_method}</span>
              </span>
              <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Sedang Dipersiapkan
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Pembayaran Online Sedang Dipersiapkan</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Nomor rekening pembayaran gateway saat ini sedang dalam tahap konfigurasi akhir oleh pemilik toko. Untuk menyelesaikan pembayaran, silakan hubungi <strong>Customer Service</strong> resmi kami via WhatsApp dengan mengklik tombol di bawah.
              </p>
            </div>

            <div className="flex justify-between items-center text-xs pt-3 border-t border-[#EDE8E1]">
              <span className="text-[#6B655F]">Total Pembayaran:</span>
              <span className="font-bold text-base text-[#24211D]">
                Rp{orderSuccess.total_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Shipping & Recipient Details */}
          <div className="border border-[#EDE8E1] rounded-xl p-4 space-y-2.5 text-xs text-[#6B655F]">
            <div className="flex justify-between items-center text-[#24211D] font-medium border-b border-[#EDE8E1] pb-2">
              <span>Pengiriman J&T Express</span>
              <span>{orderSuccess.courier}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="block text-[11px] text-[#6B655F]">Penerima:</span>
                <span className="font-medium text-[#24211D]">{orderSuccess.shipping_address.recipient_name}</span> ({orderSuccess.shipping_address.phone})
              </div>
              <div>
                <span className="block text-[11px] text-[#6B655F]">Alamat Tujuan:</span>
                <span className="text-[#24211D]">{orderSuccess.shipping_address.address_line}, {orderSuccess.shipping_address.city}</span>
              </div>
              {orderSuccess.tracking_number && (
                <div className="sm:col-span-2">
                  <span className="block text-[11px] text-[#6B655F]">No. Resi J&T Express (Tracking):</span>
                  <span className="font-bold text-[#24211D]">{orderSuccess.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/6281234567890?text=${waSuccessText}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-[#009B4C] hover:bg-[#00823F] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-full uppercase tracking-wider transition text-center flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4 stroke-[2]" />
              <span>Konfirmasi via WhatsApp Customer Service</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex gap-3">
              <Link
                to={`/tracking?code=${orderSuccess.order_code}`}
                className="flex-1 py-3 text-center border border-[#EDE8E1] hover:bg-[#FAF8F5] text-[#24211D] text-xs font-medium rounded-full transition"
              >
                Lacak Pesanan J&T
              </Link>
              <Link
                to="/"
                className="flex-1 py-3 text-center border border-[#EDE8E1] hover:bg-[#FAF8F5] text-[#24211D] text-xs font-medium rounded-full transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // 2. EMPTY CART VIEW
  // ==============================================================================
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#EDE8E1] p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EDE8E1] text-[#24211D] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-medium text-[#24211D]">Keranjang Belanja Kosong</h2>
          <p className="text-xs text-[#6B655F] leading-relaxed">
            Silakan pilih produk Wish by dr. Boyke terlebih dahulu sebelum melanjutkan ke checkout.
          </p>
          <Link
            to="/catalog"
            className="inline-block px-6 py-3 bg-[#24211D] hover:bg-black text-white text-xs font-medium rounded-full uppercase tracking-wider transition shadow-xs"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // 3. MAIN CHECKOUT: UMA WOMEN (SHOPIFY-STYLE TWO-COLUMN MINIMALIST SPLIT)
  // Left: Contact, Shipping (J&T Express), Payment (Empty numbers), Billing
  // Right: Products summary, discount code, clean totals on subtle ivory (#FAF8F5)
  // ==============================================================================
  return (
    <div className="min-h-screen bg-white font-sans text-[#24211D]">
      {/* Mobile Top Order Summary Accordion (Shopify Standard) */}
      <div className="lg:hidden bg-[#FAF8F5] border-b border-[#EDE8E1] px-4 py-3.5 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="flex items-center gap-2 text-xs font-medium text-[#24211D]"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            <span>{isMobileSummaryOpen ? 'Sembunyikan ringkasan pesanan' : 'Tampilkan ringkasan pesanan'}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#6B655F] transition-transform duration-200 ${
                isMobileSummaryOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-[#24211D]">
            Rp{grandTotal.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Collapsible Mobile Products List */}
        {isMobileSummaryOpen && (
          <div className="pt-4 mt-3 border-t border-[#EDE8E1] space-y-4">
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-white border border-[#EDE8E1] p-1 flex-shrink-0">
                      <img
                        src={product.images[0] || '/images/wish-logo-square.png'}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#6B655F] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                        {quantity}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#24211D] line-clamp-1">{product.title}</p>
                      <p className="text-[11px] text-[#6B655F]">{product.bpom_number}</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#24211D]">
                    Rp{(product.price * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Breakdown */}
            <div className="pt-3 border-t border-[#EDE8E1] space-y-2 text-xs text-[#6B655F]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#24211D] font-medium">Rp{totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengiriman (J&T Express)</span>
                <span className="text-[#24211D] font-medium">
                  {isLoadingShipping ? 'Menghitung...' : `Rp${rawShippingCost.toLocaleString('id-ID')}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#085C31]">
                  <span>Diskon Voucher</span>
                  <span>-Rp{discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: Customer Form (Shopify / UMA Women Clean Style) */}
        {/* ==================================================================== */}
        <div className="w-full lg:w-[58%] xl:w-[56%] px-4 sm:px-8 lg:pl-12 lg:pr-14 xl:pl-20 xl:pr-16 py-8 sm:py-12">
          {/* Brand Header */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-block">
                <img
                  src="/images/wish-logo.png"
                  alt="Wish by dr. Boyke"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <Link
                to="/catalog"
                className="text-xs text-[#6B655F] hover:text-[#24211D] transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Keranjang</span>
              </Link>
            </div>

            {/* Breadcrumb Steps (UMA Women / Shopify Minimalist Standard) */}
            <div className="flex items-center gap-2 text-xs text-[#6B655F]">
              <Link to="/catalog" className="hover:text-[#24211D] transition">
                Keranjang
              </Link>
              <ChevronRight className="w-3 h-3 text-[#EDE8E1]" />
              <span className="text-[#24211D] font-medium">Informasi</span>
              <ChevronRight className="w-3 h-3 text-[#EDE8E1]" />
              <span className="text-[#24211D] font-medium">Pengiriman</span>
              <ChevronRight className="w-3 h-3 text-[#EDE8E1]" />
              <span className="text-[#A29C95]">Pembayaran</span>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* 1. KONTAK */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-[#24211D]">Kontak</h2>
                <span className="text-xs text-[#6B655F]">Sudah punya akun? Masuk</span>
              </div>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email atau nomor telepon ponsel"
                className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
              />
              <label className="flex items-center gap-2 text-xs text-[#6B655F] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                />
                <span>Kirimkan saya pembaruan eksklusif dan konfirmasi pesanan</span>
              </label>
            </div>

            {/* 2. PENGANTARAN (ALAMAT PENGIRIMAN) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-[#24211D]">Pengantaran</h2>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs text-[#085C31] hover:underline font-medium"
                >
                  Pilih Kota & Wilayah
                </button>
              </div>

              {/* Country */}
              <div>
                <label className="block text-[11px] text-[#6B655F] mb-1">Negara / Wilayah</label>
                <div className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-[#FAF8F5] text-[#24211D] font-medium">
                  Indonesia
                </div>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nama depan"
                  className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
                />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nama belakang"
                  className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
                />
              </div>

              {/* Street Address */}
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Alamat lengkap (nama jalan, nomor rumah, RT/RW)"
                className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
              />

              {/* Apartment / Patokan */}
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apartemen, suite, lantai, atau patokan rumah (opsional)"
                className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
              />

              {/* City, Province, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setIsAddressModalOpen(true)}
                  className="cursor-pointer text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] flex items-center justify-between"
                  title="Klik untuk memilih kota / kecamatan"
                >
                  <span className="truncate">{selectedDestination.city}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B655F] flex-shrink-0" />
                </div>
                <div
                  onClick={() => setIsAddressModalOpen(true)}
                  className="cursor-pointer text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] flex items-center justify-between"
                  title="Klik untuk memilih provinsi"
                >
                  <span className="truncate">{selectedDestination.province}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B655F] flex-shrink-0" />
                </div>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Kode pos"
                  className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
                />
              </div>

              {/* Phone */}
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nomor telepon (untuk kurir ekspedisi J&T)"
                className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:text-[#A29C95]"
              />

              {/* Save Information Checkbox */}
              <label className="flex items-center gap-2 text-xs text-[#6B655F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="rounded border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                />
                <span>Simpan informasi ini untuk checkout lebih cepat lain kali</span>
              </label>

              {/* Discreet Packaging Assurance */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE8E1] flex items-center gap-2 text-xs text-[#24211D]">
                <Lock className="w-4 h-4 text-[#085C31] flex-shrink-0" />
                <span>Privasi 100% Terjamin: Kardus cokelat polos rapat tanpa label nama produk luar.</span>
              </div>
            </div>

            {/* 3. METODE PENGIRIMAN (KHUSUS J&T EXPRESS REAL-TIME) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-[#24211D]">Metode pengiriman</h2>
                  <p className="text-xs text-[#6B655F] mt-0.5">
                    Khusus ekspedisi J&T Express • Pelacakan real-time
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingShipping && (
                    <span className="text-xs text-[#085C31] font-medium animate-pulse">
                      Menghitung tarif...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsApiModalOpen(true)}
                    className="text-[11px] text-[#6B655F] hover:text-[#24211D] flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#EDE8E1] bg-white hover:bg-[#FAF8F5] transition"
                    title="Konfigurasi API J&T Express"
                  >
                    <Settings className="w-3 h-3 text-[#009B4C]" />
                    <span>API J&T</span>
                  </button>
                </div>
              </div>

              {/* J&T Express Service Radio Box (Shopify Style) */}
              <div className="border border-[#EDE8E1] rounded-xl bg-white overflow-hidden divide-y divide-[#EDE8E1]">
                {shippingOptions.length === 0 ? (
                  <div className="p-4 text-xs text-[#6B655F] text-center">
                    {isLoadingShipping ? 'Menghubungi API J&T Express...' : 'Pilih alamat pengiriman untuk melihat opsi tarif J&T Express.'}
                  </div>
                ) : (
                  shippingOptions.map((opt) => {
                    const isSelected = selectedCourierOption?.service === opt.service;
                    return (
                      <label
                        key={opt.service}
                        className={`p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition ${
                          isSelected ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="jnt_shipping_service"
                            checked={isSelected}
                            onChange={() => setSelectedCourierOption(opt)}
                            className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#24211D]">
                                J&T Express {opt.service}
                              </span>
                              {opt.badge && (
                                <span className="text-[10px] font-medium bg-[#EAF6EF] text-[#085C31] px-2 py-0.5 rounded-full">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B655F] mt-0.5">
                              {opt.description} • Estimasi {opt.etd}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-medium text-[#24211D]">
                          Rp{opt.cost.toLocaleString('id-ID')}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* 4. PEMBAYARAN (ONLINE GATEWAY SEMENTARA DINONAKTIFKAN / SEDANG DIPERSIAPKAN) */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-medium text-[#24211D]">Pembayaran</h2>
                <p className="text-xs text-[#6B655F] mt-0.5">
                  Semua transaksi dienkripsi dan aman.
                </p>
              </div>

              {/* Notice: Online Payment In Preparation */}
              <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Pembayaran Online Sedang Dipersiapkan</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sistem pembayaran otomatis (gateway / rekening bank online) saat ini sedang dalam tahap konfigurasi akhir oleh merchant. Untuk kemudahan pengujian dan pemesanan produk, Anda dapat menyelesaikan pesanan langsung via <strong>WhatsApp Customer Service</strong> dengan 1-klik di bawah.
                </p>
              </div>

              {/* Shopify Accordion Payment List */}
              <div className="border border-[#EDE8E1] rounded-xl bg-white overflow-hidden divide-y divide-[#EDE8E1]">
                {/* 4.1 QRIS Instant */}
                <div>
                  <label
                    onClick={() => setPaymentCategory('qris')}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      paymentCategory === 'qris' ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_accordion"
                        checked={paymentCategory === 'qris'}
                        onChange={() => setPaymentCategory('qris')}
                        className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#24211D]">
                            QRIS Instant (GoPay, OVO, ShopeePay, BCA, Livin)
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                            Sedang Disiapkan
                          </span>
                        </div>
                        <span className="text-xs text-[#6B655F]">
                          Barcode QRIS otomatis (akan dikirimkan oleh CS via WhatsApp)
                        </span>
                      </div>
                    </div>
                    <QrCode className="w-5 h-5 text-[#6B655F] flex-shrink-0" />
                  </label>

                  {paymentCategory === 'qris' && (
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EDE8E1] text-xs text-[#6B655F] space-y-2">
                      <p>
                        Gateway QRIS otomatis sedang dalam tahap persiapan akhir. Customer service kami akan mengirimkan barcode QRIS resmi langsung melalui WhatsApp untuk Anda scan.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4.2 Virtual Account */}
                <div>
                  <label
                    onClick={() => setPaymentCategory('va')}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      paymentCategory === 'va' ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_accordion"
                        checked={paymentCategory === 'va'}
                        onChange={() => setPaymentCategory('va')}
                        className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#24211D]">
                            Virtual Account Bank
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                            Sedang Disiapkan
                          </span>
                        </div>
                        <span className="text-xs text-[#6B655F]">
                          BCA, Mandiri, BRI, BNI
                        </span>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-[#6B655F] flex-shrink-0" />
                  </label>

                  {paymentCategory === 'va' && (
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EDE8E1] space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {['BCA Virtual Account', 'Mandiri Virtual Account', 'BRI Virtual Account', 'BNI Virtual Account'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedVaBank(bank)}
                            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                              selectedVaBank === bank
                                ? 'border-[#24211D] bg-white text-[#24211D]'
                                : 'border-[#EDE8E1] bg-white/60 text-[#6B655F] hover:bg-white'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-[#EDE8E1] text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[#6B655F]">Nomor Virtual Account:</span>
                          <span className="font-medium text-[#24211D]">—</span>
                        </div>
                        <p className="text-[11px] text-[#A29C95] leading-relaxed">
                          Nomor VA bank resmi akan diberikan oleh admin CS setelah pesanan dikonfirmasi via WhatsApp.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4.3 Transfer Bank Manual */}
                <div>
                  <label
                    onClick={() => setPaymentCategory('transfer')}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      paymentCategory === 'transfer' ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_accordion"
                        checked={paymentCategory === 'transfer'}
                        onChange={() => setPaymentCategory('transfer')}
                        className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#24211D]">
                            Transfer Bank Manual
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                            Sedang Disiapkan
                          </span>
                        </div>
                        <span className="text-xs text-[#6B655F]">
                          Verifikasi oleh staf customer service
                        </span>
                      </div>
                    </div>
                    <Building2 className="w-5 h-5 text-[#6B655F] flex-shrink-0" />
                  </label>

                  {paymentCategory === 'transfer' && (
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EDE8E1] space-y-2 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-[#EDE8E1] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[#6B655F]">Nomor Rekening:</span>
                          <span className="font-medium text-[#24211D]">—</span>
                        </div>
                        <p className="text-[11px] text-[#A29C95] leading-relaxed">
                          Nomor rekening resmi PT Wish Herbal Sehat akan diinformasikan oleh customer service via WhatsApp.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4.4 COD (Bayar di Tempat) */}
                <div>
                  <label
                    onClick={() => setPaymentCategory('cod')}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      paymentCategory === 'cod' ? 'bg-[#FAF8F5]' : 'hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_accordion"
                        checked={paymentCategory === 'cod'}
                        onChange={() => setPaymentCategory('cod')}
                        className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#24211D]">
                            Bayar di Tempat (COD J&T Express)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                            Tersedia via J&T
                          </span>
                        </div>
                        <span className="text-xs text-[#6B655F]">
                          Bayar tunai langsung saat kurir J&T tiba
                        </span>
                      </div>
                    </div>
                    <Banknote className="w-5 h-5 text-[#6B655F] flex-shrink-0" />
                  </label>

                  {paymentCategory === 'cod' && (
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#EDE8E1] text-xs text-[#6B655F] space-y-1">
                      <p>
                        Pembayaran diserahkan langsung ke kurir J&T Express saat paket tiba di alamat Anda. Konfirmasi kesiapan pengiriman akan dilakukan via WhatsApp oleh admin CS.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. ALAMAT PENAGIHAN (BILLING ADDRESS - SHOPIFY STYLE) */}
            <div className="space-y-3">
              <h2 className="text-base font-medium text-[#24211D]">Alamat penagihan</h2>
              <div className="border border-[#EDE8E1] rounded-xl bg-white overflow-hidden divide-y divide-[#EDE8E1]">
                <label className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FAF8F5]/50 transition">
                  <input
                    type="radio"
                    name="billing_address_choice"
                    checked={billingSameAsShipping}
                    onChange={() => setBillingSameAsShipping(true)}
                    className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                  />
                  <span className="text-sm font-medium text-[#24211D]">
                    Sama dengan alamat pengiriman
                  </span>
                </label>
                <label className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FAF8F5]/50 transition">
                  <input
                    type="radio"
                    name="billing_address_choice"
                    checked={!billingSameAsShipping}
                    onChange={() => setBillingSameAsShipping(false)}
                    className="h-4 w-4 border-[#EDE8E1] text-[#24211D] focus:ring-[#24211D]"
                  />
                  <span className="text-sm font-medium text-[#24211D]">
                    Gunakan alamat penagihan yang berbeda
                  </span>
                </label>
              </div>
            </div>

            {/* SUBMISSION: DIRECT 1-CLICK WHATSAPP FALLBACK */}
            <div className="pt-4 space-y-3">
              {/* Payment Gateway Disabled Notice */}
              <div className="p-3 bg-stone-100/90 border border-stone-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-stone-600 text-center">
                <Lock className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                <span>Gateway pembayaran online dinonaktifkan sementara (rekening belum disetting)</span>
              </div>

              {/* Primary 1-Click WhatsApp Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedCourierOption}
                className="w-full py-4 bg-[#009B4C] hover:bg-[#00823F] active:scale-[0.99] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-full tracking-wider uppercase transition duration-200 shadow-md text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Pesan via WhatsApp Customer Service'}</span>
              </button>

              <p className="text-[11px] text-[#6B655F] text-center">
                Semua hak dilindungi undang-undang • Jaminan BPOM &amp; privasi resmi Wish Boyke
              </p>
            </div>
          </form>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: Order Summary (Shopify / UMA Subtle Beige #FAF8F5) */}
        {/* ==================================================================== */}
        <div className="w-full lg:w-[42%] xl:w-[44%] bg-[#FAF8F5] border-t lg:border-t-0 lg:border-l border-[#EDE8E1] px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="lg:sticky lg:top-8 space-y-6 max-w-lg">
            {/* Products Row with Quantity Badges */}
            <div className="space-y-4 divide-y divide-[#EDE8E1]/60">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail with UMA/Shopify quantity badge */}
                    <div className="relative w-16 h-16 rounded-xl bg-white border border-[#EDE8E1] p-1.5 flex-shrink-0">
                      <img
                        src={product.images[0] || '/images/wish-logo-square.png'}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute -top-2 -right-2 bg-[#6B655F] text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center shadow-2xs">
                        {quantity}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-[#24211D] line-clamp-1 leading-snug">
                        {product.title}
                      </h4>
                      <p className="text-xs text-[#6B655F] mt-0.5">
                        {product.bpom_number ? `BPOM: ${product.bpom_number}` : 'Herbal dr. Boyke'}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-[#24211D] whitespace-nowrap">
                    Rp{(product.price * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code Input Row */}
            <div className="pt-4 border-t border-[#EDE8E1] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPromoCode}
                  onChange={(e) => setInputPromoCode(e.target.value)}
                  placeholder="Kode diskon"
                  className="flex-1 text-base sm:text-xs px-3.5 py-2.5 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:border-[#24211D] transition placeholder:normal-case placeholder:tracking-normal placeholder:text-[#A29C95]"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-5 py-2.5 bg-[#EDE8E1] hover:bg-[#E2DBD0] text-[#24211D] text-xs font-semibold rounded-lg transition"
                >
                  Pakai
                </button>
              </div>

              {voucherError && (
                <p className="text-xs text-red-600 font-medium">{voucherError}</p>
              )}
              {voucherSuccess && (
                <p className="text-xs text-[#085C31] font-medium">{voucherSuccess}</p>
              )}
              {appliedVoucher && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF6EF] border border-[#CDE8D5] text-xs text-[#085C31]">
                  <span>{appliedVoucher.code}</span>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="hover:text-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Price Totals Breakdown */}
            <div className="pt-4 border-t border-[#EDE8E1] space-y-2.5 text-xs text-[#6B655F]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#24211D] font-medium">Rp{totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Pengiriman</span>
                  <span className="text-[10px] bg-[#EDE8E1] text-[#24211D] px-1.5 py-0.5 rounded font-medium">
                    J&T Express ({billableWeightKg} kg)
                  </span>
                </div>
                <span className="text-[#24211D] font-medium">
                  {isLoadingShipping ? (
                    'Menghitung...'
                  ) : (
                    `Rp${rawShippingCost.toLocaleString('id-ID')}`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#085C31] font-medium">
                  <span>Diskon Voucher</span>
                  <span>-Rp{discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {/* Total Row */}
              <div className="pt-4 border-t border-[#EDE8E1] flex justify-between items-baseline">
                <div>
                  <span className="text-base font-semibold text-[#24211D] block">Total</span>
                  <span className="text-[11px] text-[#A29C95]">Termasuk PPN</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#6B655F] mr-1.5">IDR</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#24211D] tracking-tight">
                    Rp{grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Fast shipping guarantee */}
            <div className="p-3.5 bg-white rounded-xl border border-[#EDE8E1] flex items-center gap-2.5 text-xs text-[#24211D]">
              <Truck className="w-4 h-4 text-[#009B4C] flex-shrink-0" />
              <span>
                Paket Anda dikirim langsung dari Gudang Pusat Wish Boyke Tebet, Jakarta Selatan.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UMA WOMEN MINIMALIST REGION SELECTOR MODAL */}
      {isAddressModalOpen && (
        <UmaRegionSelectorModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSelectRegion={handleRegionSelected}
          currentDestination={selectedDestination}
        />
      )}

      {/* J&T EXPRESS API CONFIGURATION MODAL */}
      {isApiModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          role="dialog"
          aria-modal="true"
          aria-labelledby={apiModalHeadingId}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#EDE8E1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE8E1]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#009B4C]" />
                <h3 id={apiModalHeadingId} className="text-sm font-semibold text-[#24211D]">
                  API J&T Express Real-Time
                </h3>
              </div>
              <button
                onClick={() => setIsApiModalOpen(false)}
                className="text-[#6B655F] hover:text-[#24211D] p-1 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B655F] leading-relaxed">
              Integrasi pengiriman telah dikonfigurasi <strong>khusus J&T Express</strong> (layanan EZ, Super, dan ECO). Data ongkos kirim dihitung real-time berdasarkan berat paket dan zona destinasi.
            </p>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE8E1] text-xs space-y-1.5">
              <span className="font-medium text-[#24211D] block">Spesifikasi API J&T:</span>
              <p className="text-[11px] text-[#6B655F]">• <strong>Komerce / RajaOngkir J&T:</strong> <code>https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost</code> (courier: <code>jnt</code>)</p>
              <p className="text-[11px] text-[#6B655F]">• <strong>J&T Express VIP API:</strong> <code>vip.jtexpress.co.id</code> / <code>open.jtjms-id.com</code></p>
              <p className="text-[11px] text-[#6B655F]">• <strong>Layanan Resmi:</strong> J&T EZ (Reguler), J&T Super (Besok Tiba), J&T ECO (Hemat)</p>
              <p className="text-[11px] text-[#6B655F]">• <strong>Gudang Asal:</strong> Tebet, Jakarta Selatan (ID: {DEFAULT_ORIGIN.id})</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#24211D] mb-1">
                Kunci API Komerce / J&T Express:
              </label>
              <input
                type="text"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Masukkan API key Komerce / RajaOngkir J&T"
                className="w-full text-base sm:text-xs p-2.5 rounded-lg border border-[#EDE8E1] bg-white text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D]"
              />
            </div>

            {apiSaveStatus && (
              <p className="text-xs text-[#085C31] font-medium">{apiSaveStatus}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsApiModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-medium rounded-full border border-[#EDE8E1] text-[#6B655F] hover:bg-[#FAF8F5] transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 text-xs font-semibold rounded-full bg-[#24211D] hover:bg-black text-white transition"
              >
                Simpan & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
