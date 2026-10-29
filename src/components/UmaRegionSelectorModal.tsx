import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Check, MapPin } from 'lucide-react';
import { INDONESIA_REGIONS, findDestinationByDetails } from '../services/indonesiaLocations';
import { MOCK_DESTINATIONS } from '../services/rajaongkir';
import type { RajaOngkirDestination } from '../types';

export interface SelectedRegionData {
  province: string;
  city: string;
  district: string;
  subdistrict?: string;
  postalCode: string;
  destination: RajaOngkirDestination;
}

interface UmaRegionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion: (data: SelectedRegionData) => void;
  currentDestination?: RajaOngkirDestination;
}

const POPULAR_HUBS: { label: string; city: string; province: string; district: string; zip: string; id: number }[] = [
  { label: 'Jakarta Selatan (Tebet)', city: 'Kota Jakarta Selatan', province: 'DKI Jakarta', district: 'Tebet', zip: '12810', id: 34320 },
  { label: 'Jakarta Pusat (Gambir)', city: 'Kota Jakarta Pusat', province: 'DKI Jakarta', district: 'Gambir', zip: '10110', id: 34322 },
  { label: 'Bandung (Dago / Coblong)', city: 'Kota Bandung', province: 'Jawa Barat', district: 'Coblong', zip: '40132', id: 34501 },
  { label: 'Surabaya (Tegalsari)', city: 'Kota Surabaya', province: 'Jawa Timur', district: 'Tegalsari', zip: '60262', id: 34701 },
  { label: 'Medan (Medan Baru)', city: 'Kota Medan', province: 'Sumatera Utara', district: 'Medan Baru', zip: '20153', id: 34901 },
  { label: 'Tangerang Selatan (BSD / Serpong)', city: 'Kota Tangerang Selatan', province: 'Banten', district: 'Serpong', zip: '15310', id: 34404 },
  { label: 'Semarang (Semarang Barat)', city: 'Kota Semarang', province: 'Jawa Tengah', district: 'Semarang Barat', zip: '50148', id: 34601 },
  { label: 'Yogyakarta (Gondomanan)', city: 'Kota Yogyakarta', province: 'DI Yogyakarta', district: 'Gondomanan', zip: '55122', id: 34604 },
  { label: 'Denpasar (Denpasar Selatan)', city: 'Kota Denpasar', province: 'Bali', district: 'Denpasar Selatan', zip: '80227', id: 34801 },
  { label: 'Makassar (Ujung Pandang)', city: 'Kota Makassar', province: 'Sulawesi Selatan', district: 'Ujung Pandang', zip: '90111', id: 35001 },
];

export const UmaRegionSelectorModal: React.FC<UmaRegionSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectRegion,
  currentDestination,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  // Browse hierarchy state
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Flattened searchable list of all subdistricts/cities across INDONESIA_REGIONS & MOCK_DESTINATIONS
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: SelectedRegionData[] = [];

    // Search in MOCK_DESTINATIONS first
    MOCK_DESTINATIONS.forEach((d) => {
      if (
        d.city.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.province.toLowerCase().includes(q) ||
        (d.subdistrict && d.subdistrict.toLowerCase().includes(q)) ||
        (d.zip_code && d.zip_code.includes(q))
      ) {
        matches.push({
          province: d.province,
          city: d.city,
          district: d.district,
          subdistrict: d.subdistrict,
          postalCode: d.zip_code || '',
          destination: d,
        });
      }
    });

    // Also search in INDONESIA_REGIONS
    for (const prov of INDONESIA_REGIONS) {
      for (const city of prov.cities) {
        for (const dist of city.districts) {
          for (const sub of dist.subdistricts) {
            if (
              sub.name.toLowerCase().includes(q) ||
              dist.name.toLowerCase().includes(q) ||
              city.name.toLowerCase().includes(q) ||
              prov.name.toLowerCase().includes(q) ||
              sub.zip_code.includes(q)
            ) {
              const destObj: RajaOngkirDestination = {
                id: sub.destinationId,
                label: `${dist.name}, ${city.name}, ${prov.name}, ${sub.zip_code}`,
                province: prov.name,
                city: city.name,
                district: dist.name,
                subdistrict: sub.name,
                zip_code: sub.zip_code,
              };

              // Avoid duplicate destination ids
              if (!matches.some((m) => m.destination.id === sub.destinationId && m.district === dist.name)) {
                matches.push({
                  province: prov.name,
                  city: city.name,
                  district: dist.name,
                  subdistrict: sub.name,
                  postalCode: sub.zip_code,
                  destination: destObj,
                });
              }
            }
            if (matches.length >= 30) break;
          }
          if (matches.length >= 30) break;
        }
        if (matches.length >= 30) break;
      }
      if (matches.length >= 30) break;
    }

    return matches;
  }, [searchQuery]);

  // Browse mode helpers
  const currentProvinceData = useMemo(() => {
    if (!selectedProvince) return null;
    return INDONESIA_REGIONS.find((p) => p.name === selectedProvince);
  }, [selectedProvince]);

  const currentCityData = useMemo(() => {
    if (!currentProvinceData || !selectedCity) return null;
    return currentProvinceData.cities.find((c) => c.name === selectedCity);
  }, [currentProvinceData, selectedCity]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn font-sans"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#EDE8E1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EDE8E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#009B4C]" />
            <h3 className="text-sm sm:text-base font-semibold text-[#24211D]">
              Pilih Kota & Wilayah Pengiriman
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B655F] hover:text-[#24211D] p-1.5 rounded-full hover:bg-[#FAF8F5] transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#EDE8E1] bg-[#FAF8F5] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center transition ${
              activeTab === 'search'
                ? 'bg-white text-[#24211D] font-semibold border-b-2 border-[#24211D]'
                : 'text-[#6B655F] hover:text-[#24211D]'
            }`}
          >
            Pencarian Cepat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 text-center transition ${
              activeTab === 'browse'
                ? 'bg-white text-[#24211D] font-semibold border-b-2 border-[#24211D]'
                : 'text-[#6B655F] hover:text-[#24211D]'
            }`}
          >
            Pilih per Provinsi
          </button>
        </div>

        {/* Search tab content */}
        {activeTab === 'search' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-[#EDE8E1] bg-white">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama kota, kecamatan, atau provinsi..."
                  className="w-full text-base sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE8E1] bg-[#FAF8F5] text-[#24211D] focus:outline-none focus:ring-1 focus:ring-[#24211D] focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-[#A29C95] absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[#A29C95] hover:text-[#24211D]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {searchQuery ? (
                <div>
                  <p className="text-[11px] text-[#6B655F] mb-2 font-medium">
                    Hasil Pencarian ({searchResults.length}):
                  </p>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-[#6B655F] text-xs">
                      Tidak ditemukan wilayah untuk "{searchQuery}". Coba gunakan tab "Pilih per Provinsi".
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EDE8E1] border border-[#EDE8E1] rounded-xl overflow-hidden bg-white">
                      {searchResults.map((res, idx) => {
                        const isCurrent = currentDestination?.id === res.destination.id;
                        return (
                          <button
                            key={`${res.destination.id}_${idx}`}
                            type="button"
                            onClick={() => {
                              onSelectRegion(res);
                              onClose();
                            }}
                            className="w-full text-left p-3.5 hover:bg-[#FAF8F5] flex items-center justify-between text-xs transition"
                          >
                            <div>
                              <p className="font-semibold text-[#24211D]">
                                {res.district}, {res.city}
                              </p>
                              <p className="text-[11px] text-[#6B655F]">
                                {res.province} • Kode Pos: {res.postalCode}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-[#009B4C] flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-[11px] text-[#6B655F] mb-2.5 font-medium uppercase tracking-wider">
                    Kota & Hub Populer Indonesia
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {POPULAR_HUBS.map((hub) => {
                      const isCurrent = currentDestination?.id === hub.id;
                      return (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => {
                            const dest: RajaOngkirDestination = {
                              id: hub.id,
                              label: `${hub.district}, ${hub.city}, ${hub.province}, ${hub.zip}`,
                              province: hub.province,
                              city: hub.city,
                              district: hub.district,
                              zip_code: hub.zip,
                            };
                            onSelectRegion({
                              province: hub.province,
                              city: hub.city,
                              district: hub.district,
                              postalCode: hub.zip,
                              destination: dest,
                            });
                            onClose();
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                            isCurrent
                              ? 'border-[#24211D] bg-[#FAF8F5] text-[#24211D]'
                              : 'border-[#EDE8E1] hover:bg-[#FAF8F5] text-[#24211D]'
                          }`}
                        >
                          <div>
                            <span className="font-medium block">{hub.label}</span>
                            <span className="text-[10px] text-[#6B655F]">{hub.province}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[#009B4C]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse per Province tab */}
        {activeTab === 'browse' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Step Breadcrumbs */}
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#EDE8E1] text-[11px] flex items-center gap-1.5 text-[#6B655F] overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedProvince('');
                  setSelectedCity('');
                }}
                className={`hover:text-[#24211D] transition ${!selectedProvince ? 'font-semibold text-[#24211D] underline' : ''}`}
              >
                Provinsi
              </button>
              {selectedProvince && (
                <>
                  <ChevronRight className="w-3 h-3 text-[#EDE8E1]" />
                  <button
                    type="button"
                    onClick={() => setSelectedCity('')}
                    className={`hover:text-[#24211D] transition ${selectedProvince && !selectedCity ? 'font-semibold text-[#24211D] underline' : ''}`}
                  >
                    {selectedProvince}
                  </button>
                </>
              )}
              {selectedCity && (
                <>
                  <ChevronRight className="w-3 h-3 text-[#EDE8E1]" />
                  <span className="font-semibold text-[#24211D]">{selectedCity}</span>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#EDE8E1]">
              {/* Level 1: Select Province */}
              {!selectedProvince && (
                <div>
                  {INDONESIA_REGIONS.map((prov) => (
                    <button
                      key={prov.name}
                      type="button"
                      onClick={() => setSelectedProvince(prov.name)}
                      className="w-full px-5 py-3.5 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs text-[#24211D] transition"
                    >
                      <span className="font-medium">{prov.name}</span>
                      <ChevronRight className="w-4 h-4 text-[#A29C95]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Level 2: Select City */}
              {selectedProvince && !selectedCity && currentProvinceData && (
                <div>
                  {currentProvinceData.cities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => setSelectedCity(city.name)}
                      className="w-full px-5 py-3.5 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs text-[#24211D] transition"
                    >
                      <span className="font-medium">{city.name}</span>
                      <ChevronRight className="w-4 h-4 text-[#A29C95]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Level 3: Select District */}
              {selectedProvince && selectedCity && currentCityData && (
                <div>
                  {currentCityData.districts.map((dist) => {
                    const firstSub = dist.subdistricts[0];
                    const dest = findDestinationByDetails(selectedProvince, selectedCity, dist.name, firstSub?.name);

                    return (
                      <button
                        key={dist.name}
                        type="button"
                        onClick={() => {
                          onSelectRegion({
                            province: selectedProvince,
                            city: selectedCity,
                            district: dist.name,
                            subdistrict: firstSub?.name,
                            postalCode: firstSub?.zip_code || dest.zip_code || '',
                            destination: dest,
                          });
                          onClose();
                        }}
                        className="w-full px-5 py-3.5 text-left hover:bg-[#FAF8F5] flex items-center justify-between text-xs text-[#24211D] transition"
                      >
                        <div>
                          <p className="font-medium text-[#24211D]">{dist.name}</p>
                          <p className="text-[11px] text-[#6B655F]">
                            {selectedCity}, {selectedProvince} • {firstSub?.zip_code || dest.zip_code}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-[#009B4C]" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EDE8E1] flex items-center justify-between text-xs text-[#6B655F]">
          <span>Tarif J&T Express dihitung real-time per wilayah.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-[#EDE8E1] bg-white text-[#24211D] font-medium hover:bg-[#FAF8F5] transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
