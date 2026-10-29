import React, { useState, useMemo } from 'react';
import {
  MapPin,
  X,
  ChevronRight,
  Search,
  Check,
  Building,
  Home,
  Briefcase,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { INDONESIA_REGIONS, findDestinationByDetails } from '../services/indonesiaLocations';
import type { RajaOngkirDestination } from '../types';
import { MapPinModal } from './MapPinModal';

export interface AddressFormData {
  recipientName: string;
  phone: string;
  addressLine: string;
  patokan: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  destination: RajaOngkirDestination;
  addressTag: 'Rumah' | 'Kantor' | 'Apartemen' | 'Kos';
  latitude?: number;
  longitude?: number;
  pinpointAddress?: string;
}

interface ShopeeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
}

type CascadeStep = 'province' | 'city' | 'district' | 'subdistrict';

export const ShopeeAddressModal: React.FC<ShopeeAddressModalProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
  initialData,
}) => {
  // Main form fields
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || 'Budi Santoso');
  const [phone, setPhone] = useState(initialData?.phone || '081234567890');
  const [addressLine, setAddressLine] = useState(
    initialData?.addressLine || 'Jl. Tebet Barat Raya No. 42, RT 05 / RW 03'
  );
  const [patokan, setPatokan] = useState(
    initialData?.patokan || 'Seberang Indomaret, pagar hitam, rumah cat hijau'
  );
  const [addressTag, setAddressTag] = useState<'Rumah' | 'Kantor' | 'Apartemen' | 'Kos'>(
    initialData?.addressTag || 'Rumah'
  );

  // Region cascade fields
  const [province, setProvince] = useState(initialData?.province || 'DKI Jakarta');
  const [city, setCity] = useState(initialData?.city || 'Kota Jakarta Selatan');
  const [district, setDistrict] = useState(initialData?.district || 'Tebet');
  const [subdistrict, setSubdistrict] = useState(initialData?.subdistrict || 'Tebet Barat');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '12810');

  // Map pin fields
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude || -6.2341);
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude || 106.8452);
  const [pinpointAddress, setPinpointAddress] = useState<string | undefined>(
    initialData?.pinpointAddress || 'Tebet, Kota Jakarta Selatan'
  );

  // Selector sub-modal / view states
  const [isCascadePickerOpen, setIsCascadePickerOpen] = useState(false);
  const [cascadeStep, setCascadeStep] = useState<CascadeStep>('province');
  const [cascadeSearch, setCascadeSearch] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Region cascade helper data
  const selectedProvinceData = useMemo(() => {
    return INDONESIA_REGIONS.find((p) => p.name.toLowerCase() === province.toLowerCase());
  }, [province]);

  const selectedCityData = useMemo(() => {
    if (!selectedProvinceData) return null;
    return selectedProvinceData.cities.find((c) => c.name.toLowerCase() === city.toLowerCase());
  }, [selectedProvinceData, city]);

  const selectedDistrictData = useMemo(() => {
    if (!selectedCityData) return null;
    return selectedCityData.districts.find((d) => d.name.toLowerCase() === district.toLowerCase());
  }, [selectedCityData, district]);

  // Filtered lists for cascade step
  const filteredProvinces = useMemo(() => {
    return INDONESIA_REGIONS.filter((p) =>
      p.name.toLowerCase().includes(cascadeSearch.toLowerCase())
    );
  }, [cascadeSearch]);

  const filteredCities = useMemo(() => {
    if (!selectedProvinceData) return [];
    return selectedProvinceData.cities.filter((c) =>
      c.name.toLowerCase().includes(cascadeSearch.toLowerCase())
    );
  }, [selectedProvinceData, cascadeSearch]);

  const filteredDistricts = useMemo(() => {
    if (!selectedCityData) return [];
    return selectedCityData.districts.filter((d) =>
      d.name.toLowerCase().includes(cascadeSearch.toLowerCase())
    );
  }, [selectedCityData, cascadeSearch]);

  const filteredSubdistricts = useMemo(() => {
    if (!selectedDistrictData) return [];
    return selectedDistrictData.subdistricts.filter(
      (s) =>
        s.name.toLowerCase().includes(cascadeSearch.toLowerCase()) ||
        s.zip_code.includes(cascadeSearch)
    );
  }, [selectedDistrictData, cascadeSearch]);

  // Handle region cascade selections
  const handleSelectProvince = (provName: string) => {
    setProvince(provName);
    setCascadeSearch('');
    setCascadeStep('city');
  };

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    setCascadeSearch('');
    setCascadeStep('district');
  };

  const handleSelectDistrict = (distName: string) => {
    setDistrict(distName);
    setCascadeSearch('');
    setCascadeStep('subdistrict');
  };

  const handleSelectSubdistrict = (sub: { name: string; zip_code: string; destinationId: number }) => {
    setSubdistrict(sub.name);
    setPostalCode(sub.zip_code);
    setIsCascadePickerOpen(false);
    setCascadeSearch('');
  };

  // Handle Map Pin confirm
  const handleConfirmMapPin = (loc: {
    latitude: number;
    longitude: number;
    addressLabel: string;
  }) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setPinpointAddress(loc.addressLabel);
  };

  // Save address submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setFormError('Nama lengkap penerima wajib diisi');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setFormError('Nomor telepon penerima tidak valid');
      return;
    }
    if (!addressLine.trim()) {
      setFormError('Detail jalan dan nomor rumah wajib diisi');
      return;
    }
    if (!province || !city || !district) {
      setFormError('Silakan pilih Provinsi, Kota, dan Kecamatan');
      return;
    }

    const destination = findDestinationByDetails(province, city, district, subdistrict);

    const payload: AddressFormData = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      patokan: patokan.trim(),
      province,
      city,
      district,
      subdistrict,
      postalCode,
      destination,
      addressTag,
      latitude,
      longitude,
      pinpointAddress,
    };

    onSaveAddress(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-[#EDE8E1] flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EAF6EF] text-[#009B4C] flex items-center justify-center">
                <MapPin className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#24211D]">
                  Alamat Pengiriman
                </h2>
                <p className="text-[11px] text-stone-500">
                  Format lengkap standar kurir & akurat dengan titik GPS
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 transition rounded-full hover:bg-stone-100"
              aria-label="Tutup form alamat"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Recipient & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#24211D] mb-1">
                  Nama Lengkap Penerima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-3 py-2 text-base sm:text-sm text-[#24211D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#009B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24211D] mb-1">
                  Nomor Telepon (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-3 py-2 text-base sm:text-sm text-[#24211D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#009B4C]"
                />
              </div>
            </div>

            {/* Shopee-Style Cascading Region Picker (Provinsi, Kota, Kecamatan, Kode Pos) */}
            <div>
              <label className="block text-xs font-semibold text-[#24211D] mb-1">
                Wilayah Pengiriman (Kecamatan s/d Provinsi) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCascadeStep('province');
                  setCascadeSearch('');
                  setIsCascadePickerOpen(true);
                }}
                className="w-full bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-stone-200 rounded-lg px-3.5 py-2.5 text-left flex items-center justify-between transition group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs sm:text-sm font-medium text-[#24211D] truncate">
                    {district ? `${subdistrict || district}, ${district}, ${city}` : 'Pilih Provinsi, Kota, Kecamatan'}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {province} • Kode Pos: {postalCode || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#009B4C] text-xs font-medium flex-shrink-0">
                  <span>Ubah</span>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#009B4C] transition" />
                </div>
              </button>
            </div>

            {/* Detail Jalan / Gedung */}
            <div>
              <label className="block text-xs font-semibold text-[#24211D] mb-1">
                Nama Jalan, Gedung, No. Rumah, RT/RW <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Jl. Tebet Barat Raya No. 42, RT 05 / RW 03"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-[#24211D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#009B4C] resize-none"
              />
            </div>

            {/* Explicit Landmark / Patokan Input (Shopee Standard Requirement) */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-semibold text-[#24211D]">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#009B4C]" />
                  <span>Patokan / Ciri Rumah (Landmark Kurir)</span>
                </span>
                <span className="text-[10px] font-normal text-stone-500">Sangat Disarankan</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Seberang Indomaret, rumah cat hijau, pagar hitam tinggi"
                value={patokan}
                onChange={(e) => setPatokan(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-base sm:text-sm text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#009B4C]"
              />
              <p className="text-[10px] text-stone-500">
                Membantu kurir JNE, POS, dan TIKI menemukan lokasi tanpa tersasar atau harus menelepon berulang kali.
              </p>
            </div>

            {/* Shopee Map Pinpoint Selector Bar */}
            <div className="bg-[#EAF6EF]/60 p-3.5 rounded-xl border border-[#CDE8D5] flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#009B4C] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#085C31]">
                    {latitude ? 'Titik Peta Terpasang' : 'Belum Ada Titik Pin Peta'}
                  </p>
                  <p className="text-[11px] text-[#0A6D3A] truncate">
                    {pinpointAddress || 'Tandai lokasi di peta untuk akurasi pengantaran kurir'}
                  </p>
                  {latitude && (
                    <p className="text-[9px] font-mono text-[#0A6D3A]/80">
                      GPS: {latitude.toFixed(4)}, {longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#DDF1E4] text-[#009B4C] border border-[#009B4C] text-xs font-medium transition flex-shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <span>{latitude ? 'Ubah di Peta' : 'Pilih dari Maps'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Address Type Tag (Rumah / Kantor / Apartemen / Kos) */}
            <div>
              <label className="block text-xs font-semibold text-[#24211D] mb-1.5">
                Label Alamat
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(['Rumah', 'Kantor', 'Apartemen', 'Kos'] as const).map((tag) => {
                  const isSelected = addressTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddressTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#009B4C] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-stone-700 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {tag === 'Rumah' && <Home className="w-3.5 h-3.5" />}
                      {tag === 'Kantor' && <Briefcase className="w-3.5 h-3.5" />}
                      {tag === 'Apartemen' && <Building className="w-3.5 h-3.5" />}
                      {tag === 'Kos' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#EDE8E1] flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#009B4C] hover:bg-[#00823F] text-white text-xs sm:text-sm font-medium shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2]" />
              <span>Gunakan Alamat Ini</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shopee Cascading Hierarchy Sheet (Provinsi -> Kota -> Kecamatan -> Kelurahan) */}
      {isCascadePickerOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-lg rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header with back navigation & steps */}
            <div className="px-4 py-3.5 border-b border-[#EDE8E1] flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                {cascadeStep !== 'province' && (
                  <button
                    onClick={() => {
                      if (cascadeStep === 'city') setCascadeStep('province');
                      else if (cascadeStep === 'district') setCascadeStep('city');
                      else if (cascadeStep === 'subdistrict') setCascadeStep('district');
                    }}
                    className="p-1 -ml-1 text-stone-600 hover:text-[#009B4C] transition rounded-full hover:bg-stone-100"
                    aria-label="Kembali ke langkah sebelumnya"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
                  </button>
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#24211D]">
                    {cascadeStep === 'province' && 'Pilih Provinsi'}
                    {cascadeStep === 'city' && `Pilih Kota / Kab. (${province})`}
                    {cascadeStep === 'district' && `Pilih Kecamatan (${city})`}
                    {cascadeStep === 'subdistrict' && `Pilih Kelurahan (${district})`}
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    Langkah: {cascadeStep === 'province' ? '1 dari 4' : cascadeStep === 'city' ? '2 dari 4' : cascadeStep === 'district' ? '3 dari 4' : '4 dari 4'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCascadePickerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 transition rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Stepper Breadcrumbs */}
            <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#EDE8E1] flex items-center gap-1.5 text-[11px] text-stone-600 overflow-x-auto flex-shrink-0">
              <button
                onClick={() => { setCascadeStep('province'); setCascadeSearch(''); }}
                className={`font-medium hover:text-[#009B4C] ${cascadeStep === 'province' ? 'text-[#009B4C] font-semibold underline' : ''}`}
              >
                {province || 'Provinsi'}
              </button>
              {(cascadeStep === 'city' || cascadeStep === 'district' || cascadeStep === 'subdistrict') && (
                <>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <button
                    onClick={() => { setCascadeStep('city'); setCascadeSearch(''); }}
                    className={`font-medium hover:text-[#009B4C] ${cascadeStep === 'city' ? 'text-[#009B4C] font-semibold underline' : ''}`}
                  >
                    {city || 'Kota/Kab'}
                  </button>
                </>
              )}
              {(cascadeStep === 'district' || cascadeStep === 'subdistrict') && (
                <>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <button
                    onClick={() => { setCascadeStep('district'); setCascadeSearch(''); }}
                    className={`font-medium hover:text-[#009B4C] ${cascadeStep === 'district' ? 'text-[#009B4C] font-semibold underline' : ''}`}
                  >
                    {district || 'Kecamatan'}
                  </button>
                </>
              )}
              {cascadeStep === 'subdistrict' && (
                <>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <span className="text-[#009B4C] font-semibold">Kelurahan</span>
                </>
              )}
            </div>

            {/* Search Input for the active level */}
            <div className="p-3 bg-white border-b border-[#EDE8E1] flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Cari nama ${cascadeStep}...`}
                  value={cascadeSearch}
                  onChange={(e) => setCascadeSearch(e.target.value)}
                  className="w-full bg-[#FAF8F5] text-base sm:text-sm text-[#24211D] pl-8 pr-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#009B4C]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* List options */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#EDE8E1]">
              {cascadeStep === 'province' && (
                filteredProvinces.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectProvince(p.name)}
                    className="w-full px-4 py-3 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs sm:text-sm text-[#24211D] transition"
                  >
                    <span className="font-medium">{p.name}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))
              )}

              {cascadeStep === 'city' && (
                filteredCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCity(c.name)}
                    className="w-full px-4 py-3 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs sm:text-sm text-[#24211D] transition"
                  >
                    <span className="font-medium">{c.name}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))
              )}

              {cascadeStep === 'district' && (
                filteredDistricts.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => handleSelectDistrict(d.name)}
                    className="w-full px-4 py-3 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs sm:text-sm text-[#24211D] transition"
                  >
                    <span className="font-medium">{d.name}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))
              )}

              {cascadeStep === 'subdistrict' && (
                filteredSubdistricts.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSubdistrict(s)}
                    className="w-full px-4 py-3 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs sm:text-sm text-[#24211D] transition"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">Kode Pos: {s.zip_code}</p>
                    </div>
                    <Check className="w-4 h-4 text-[#009B4C]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Pin Modal */}
      <MapPinModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirmLocation={handleConfirmMapPin}
        initialLat={latitude || -6.2341}
        initialLng={longitude || 106.8452}
        initialLabel={pinpointAddress || addressLine}
      />
    </>
  );
};
