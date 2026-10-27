// ==============================================================================
// WISH BOYKE - CORE TYPESCRIPT INTERFACES
// ==============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  category?: Category;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  weight_gram: number;
  images: string[];
  bpom_number: string;
  is_best_seller: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string;
  province?: string;
  district?: string; // Kecamatan
  subdistrict?: string; // Kelurahan / Desa
  urban_village?: string;
  patokan?: string; // Landmark / Ciri Bangunan / Patokan
  latitude?: number;
  longitude?: number;
  pinpoint_address?: string;
  destination_id?: number;
  notes?: string;
  label?: string; // 'Rumah' | 'Kantor' | 'Apartemen' | 'Kos'
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_code: string;
  user_id?: string | null;
  guest_info?: GuestInfo | null;
  total_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  voucher_code?: string;
  shipping_address: ShippingAddress;
  courier: string;
  tracking_number?: string | null;
  is_discreet_packaging: boolean;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  default_address?: ShippingAddress;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// RajaOngkir V2 (by Komerce) Interfaces
export interface RajaOngkirDestination {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict?: string;
  zip_code?: string;
}

export interface RajaOngkirCourierCostDetail {
  value: number;
  etd: string;
  note?: string;
}

export interface RajaOngkirCourierCostItem {
  service: string;
  description: string;
  cost: number | RajaOngkirCourierCostDetail[];
  etd?: string;
  note?: string;
}

export interface RajaOngkirCourierData {
  code: string; // 'jne' | 'pos' | 'tiki'
  name: string;
  costs: RajaOngkirCourierCostItem[];
}

export interface ShippingOption {
  courier_code: string;
  courier_name: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
  badge?: string;
}

export interface PromoCoupon {
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minSpend: number;
  description: string;
}

