import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface MapPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (location: {
    latitude: number;
    longitude: number;
    addressLabel: string;
    city?: string;
    province?: string;
    district?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialLabel?: string;
}

export const MapPinModal: React.FC<MapPinModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat = -6.2341, // Default Jakarta Selatan / Tebet
  initialLng = 106.8452,
  initialLabel = 'Jl. Tebet Barat Raya, Tebet, Jakarta Selatan'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [addressTitle, setAddressTitle] = useState(initialLabel);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Reverse Geocoding with debounce/caching using Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeoError(null);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          // Take first 3-4 parts for clean readable title
          const shortTitle = parts.slice(0, 4).join(',').trim();
          setAddressTitle(shortTitle);
        }
      }
    } catch {
      // Graceful fallback to coordinate string if offline or rate-limited
      setAddressTitle(`Titik Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize and destroy Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Prevent double initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Listen to map pan/zoom events to update pinpoint center
      map.on('moveend', () => {
        const center = map.getCenter();
        const lat = Number(center.lat.toFixed(6));
        const lng = Number(center.lng.toFixed(6));
        setCurrentCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
    } else {
      // Invalidate size in case modal opened from hidden
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng]);

  // Search location by text
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsGeocoding(true);
    setGeoError(null);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
          setAddressTitle(result.display_name.split(',').slice(0, 4).join(','));
        } else {
          setGeoError('Lokasi tidak ditemukan. Coba gunakan nama jalan atau area yang lebih umum.');
        }
      }
    } catch {
      setGeoError('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Use current GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setIsLocatingUser(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
        }
      },
      () => {
        setIsLocatingUser(false);
        setGeoError('Akses lokasi ditolak atau tidak tersedia. Aktifkan GPS pada peramban Anda.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onConfirmLocation({
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      addressLabel: addressTitle,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Modal Top Header (Shopee Style) */}
        <div className="px-4 py-3.5 border-b border-[#EDE8E1] flex items-center justify-between bg-white z-20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAF6EF] text-[#009B4C] flex items-center justify-center">
              <MapPin className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#24211D]">
                Pilih Titik Lokasi Pengiriman
              </h2>
              <p className="text-[11px] text-stone-500">
                Geser peta agar pin merah tepat di lokasi tujuan kurir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition rounded-full hover:bg-stone-100"
            aria-label="Tutup peta"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Floating Search Bar on Top of Map */}
        <div className="absolute top-16 left-4 right-4 sm:left-6 sm:right-6 z-20">
          <form onSubmit={handleSearchLocation} className="relative shadow-md rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Cari jalan, gedung, atau area sekitar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-md text-xs sm:text-sm text-[#24211D] placeholder-stone-400 pl-9 pr-20 py-2.5 sm:py-3 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#009B4C]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 sm:top-3.5 stroke-[1.5]" />
            <button
              type="submit"
              disabled={isGeocoding}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#009B4C] hover:bg-[#00823F] text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
            >
              {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
            </button>
          </form>
          {geoError && (
            <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Interactive Map Area with Fixed Center Pin (Shopee / Grab UX) */}
        <div className="relative flex-1 w-full min-h-[300px] sm:min-h-[420px] bg-stone-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Center Pin Overlay (Fixed dead center while map moves underneath) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none flex flex-col items-center">
            {/* Shopee-style Tooltip bubble above pin */}
            <div className="bg-[#24211D] text-white text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-md shadow-md whitespace-nowrap mb-1 flex items-center gap-1 animate-bounce">
              <span>Lokasi Tujuan Kurir</span>
            </div>
            {/* Custom SVG Pin Marker */}
            <div className="relative">
              <div className="w-9 h-9 text-[#EA384D] drop-shadow-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-[#EA384D]">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div className="w-2.5 h-1 bg-black/40 rounded-full mx-auto blur-[1px] -mt-0.5" />
            </div>
          </div>

          {/* Floating 'GPS Current Location' Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocatingUser}
            className="absolute bottom-4 left-4 z-20 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 text-xs font-medium text-[#24211D] hover:text-[#009B4C] hover:bg-white flex items-center gap-2 transition"
            title="Arahkan peta ke posisi GPS saya saat ini"
          >
            {isLocatingUser ? (
              <Loader2 className="w-4 h-4 text-[#009B4C] animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 text-[#009B4C]" />
            )}
            <span>Lokasi Saya</span>
          </button>
        </div>

        {/* Modal Bottom Confirmation Sheet */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#EDE8E1] z-20 flex-shrink-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EAF6EF] text-[#009B4C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-[#24211D] leading-tight line-clamp-2">
                {isGeocoding ? 'Memperbarui alamat titik...' : addressTitle}
              </p>
              <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                Koordinat: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#009B4C] hover:bg-[#00823F] text-white text-xs sm:text-sm font-medium shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2]" />
              <span>Gunakan Titik Lokasi Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
