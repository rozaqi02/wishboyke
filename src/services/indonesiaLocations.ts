import type { RajaOngkirDestination } from '../types';
import { MOCK_DESTINATIONS } from './rajaongkir';

export interface ProvinceData {
  name: string;
  cities: {
    name: string;
    districts: {
      name: string;
      subdistricts: {
        name: string;
        zip_code: string;
        destinationId: number;
      }[];
    }[];
  }[];
}

export const INDONESIA_REGIONS: ProvinceData[] = [
  {
    name: 'DKI Jakarta',
    cities: [
      {
        name: 'Kota Jakarta Selatan',
        districts: [
          {
            name: 'Tebet',
            subdistricts: [
              { name: 'Tebet Barat', zip_code: '12810', destinationId: 34320 },
              { name: 'Tebet Timur', zip_code: '12820', destinationId: 34320 },
              { name: 'Menteng Dalam', zip_code: '12870', destinationId: 34320 },
              { name: 'Kebon Baru', zip_code: '12830', destinationId: 34320 },
              { name: 'Bukit Duri', zip_code: '12840', destinationId: 34320 },
              { name: 'Manggarai', zip_code: '12850', destinationId: 34320 },
            ],
          },
          {
            name: 'Kebayoran Baru',
            subdistricts: [
              { name: 'Senayan', zip_code: '12180', destinationId: 34321 },
              { name: 'Melawai', zip_code: '12160', destinationId: 34321 },
              { name: 'Gandaria Utara', zip_code: '12140', destinationId: 34321 },
              { name: 'Kramat Pela', zip_code: '12130', destinationId: 34321 },
              { name: 'Gunung', zip_code: '12120', destinationId: 34321 },
            ],
          },
          {
            name: 'Cilandak',
            subdistricts: [
              { name: 'Cilandak Barat', zip_code: '12430', destinationId: 34321 },
              { name: 'Lebak Bulus', zip_code: '12440', destinationId: 34321 },
              { name: 'Pondok Labu', zip_code: '12450', destinationId: 34321 },
            ],
          },
          {
            name: 'Setiabudi',
            subdistricts: [
              { name: 'Karet Semanggi', zip_code: '12930', destinationId: 34320 },
              { name: 'Karet Kuningan', zip_code: '12940', destinationId: 34320 },
              { name: 'Kuningan Timur', zip_code: '12950', destinationId: 34320 },
            ],
          },
        ],
      },
      {
        name: 'Kota Jakarta Pusat',
        districts: [
          {
            name: 'Gambir',
            subdistricts: [
              { name: 'Gambir', zip_code: '10110', destinationId: 34322 },
              { name: 'Cideng', zip_code: '10150', destinationId: 34322 },
              { name: 'Petojo Selatan', zip_code: '10160', destinationId: 34322 },
            ],
          },
          {
            name: 'Menteng',
            subdistricts: [
              { name: 'Menteng', zip_code: '10310', destinationId: 34323 },
              { name: 'Pegangsaan', zip_code: '10320', destinationId: 34323 },
              { name: 'Cikini', zip_code: '10330', destinationId: 34323 },
              { name: 'Gondangdia', zip_code: '10350', destinationId: 34323 },
            ],
          },
          {
            name: 'Tanah Abang',
            subdistricts: [
              { name: 'Kebon Kacang', zip_code: '10240', destinationId: 34322 },
              { name: 'Kampung Bali', zip_code: '10250', destinationId: 34322 },
              { name: 'Bendungan Hilir', zip_code: '10210', destinationId: 34322 },
            ],
          },
        ],
      },
      {
        name: 'Kota Jakarta Barat',
        districts: [
          {
            name: 'Grogol Petamburan',
            subdistricts: [
              { name: 'Tanjung Duren Utara', zip_code: '11470', destinationId: 34325 },
              { name: 'Tanjung Duren Selatan', zip_code: '11470', destinationId: 34325 },
              { name: 'Tomang', zip_code: '11440', destinationId: 34325 },
            ],
          },
          {
            name: 'Kebon Jeruk',
            subdistricts: [
              { name: 'Kebon Jeruk', zip_code: '11530', destinationId: 34325 },
              { name: 'Kedoya Selatan', zip_code: '11520', destinationId: 34325 },
            ],
          },
        ],
      },
      {
        name: 'Kota Jakarta Utara',
        districts: [
          {
            name: 'Kelapa Gading',
            subdistricts: [
              { name: 'Kelapa Gading Barat', zip_code: '14240', destinationId: 34324 },
              { name: 'Kelapa Gading Timur', zip_code: '14240', destinationId: 34324 },
              { name: 'Pegangsaan Dua', zip_code: '14250', destinationId: 34324 },
            ],
          },
          {
            name: 'Penjaringan',
            subdistricts: [
              { name: 'Pluit', zip_code: '14450', destinationId: 34324 },
              { name: 'Pantai Indah Kapuk', zip_code: '14470', destinationId: 34324 },
            ],
          },
        ],
      },
      {
        name: 'Kota Jakarta Timur',
        districts: [
          {
            name: 'Jatinegara',
            subdistricts: [
              { name: 'Bidara Cina', zip_code: '13330', destinationId: 34320 },
              { name: 'Kampung Melayu', zip_code: '13320', destinationId: 34320 },
            ],
          },
          {
            name: 'Duren Sawit',
            subdistricts: [
              { name: 'Pondok Kelapa', zip_code: '13450', destinationId: 34320 },
              { name: 'Klender', zip_code: '13470', destinationId: 34320 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Jawa Barat',
    cities: [
      {
        name: 'Kota Bandung',
        districts: [
          {
            name: 'Coblong',
            subdistricts: [
              { name: 'Dago', zip_code: '40135', destinationId: 34401 },
              { name: 'Sekeloa', zip_code: '40134', destinationId: 34401 },
              { name: 'Lebakgede', zip_code: '40132', destinationId: 34401 },
            ],
          },
          {
            name: 'Sukajadi',
            subdistricts: [
              { name: 'Pasteur', zip_code: '40161', destinationId: 34401 },
              { name: 'Sukawarna', zip_code: '40164', destinationId: 34401 },
            ],
          },
          {
            name: 'Sumur Bandung',
            subdistricts: [
              { name: 'Braga', zip_code: '40111', destinationId: 34401 },
              { name: 'Merdeka', zip_code: '40113', destinationId: 34401 },
            ],
          },
        ],
      },
      {
        name: 'Kota Bogor',
        districts: [
          {
            name: 'Bogor Tengah',
            subdistricts: [
              { name: 'Babakan', zip_code: '16128', destinationId: 34402 },
              { name: 'Pabaton', zip_code: '16121', destinationId: 34402 },
            ],
          },
          {
            name: 'Bogor Timur',
            subdistricts: [
              { name: 'Baranangsiang', zip_code: '16143', destinationId: 34402 },
            ],
          },
        ],
      },
      {
        name: 'Kota Depok',
        districts: [
          {
            name: 'Pancoran Mas',
            subdistricts: [
              { name: 'Depok', zip_code: '16431', destinationId: 34403 },
              { name: 'Mampang', zip_code: '16433', destinationId: 34403 },
            ],
          },
          {
            name: 'Beji',
            subdistricts: [
              { name: 'Kukusan', zip_code: '16425', destinationId: 34403 },
              { name: 'Pondok Cina', zip_code: '16424', destinationId: 34403 },
            ],
          },
        ],
      },
      {
        name: 'Kota Bekasi',
        districts: [
          {
            name: 'Bekasi Selatan',
            subdistricts: [
              { name: 'Pekayon Jaya', zip_code: '17148', destinationId: 34404 },
              { name: 'Jakasetia', zip_code: '17147', destinationId: 34404 },
            ],
          },
          {
            name: 'Bekasi Barat',
            subdistricts: [
              { name: 'Bintara', zip_code: '17134', destinationId: 34404 },
              { name: 'Kranji', zip_code: '17135', destinationId: 34404 },
            ],
          },
        ],
      },
      {
        name: 'Kab. Bogor',
        districts: [
          {
            name: 'Cibinong',
            subdistricts: [
              { name: 'Cirimekar', zip_code: '16911', destinationId: 34402 },
              { name: 'Ciriung', zip_code: '16918', destinationId: 34402 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Banten',
    cities: [
      {
        name: 'Kota Tangerang Selatan',
        districts: [
          {
            name: 'Serpong',
            subdistricts: [
              { name: 'Bumi Serpong Damai (BSD)', zip_code: '15310', destinationId: 34405 },
              { name: 'Rawa Buntu', zip_code: '15318', destinationId: 34405 },
            ],
          },
          {
            name: 'Pondok Aren',
            subdistricts: [
              { name: 'Bintaro Jaya', zip_code: '15220', destinationId: 34405 },
              { name: 'Jurang Mangu', zip_code: '15222', destinationId: 34405 },
            ],
          },
        ],
      },
      {
        name: 'Kota Tangerang',
        districts: [
          {
            name: 'Cipondoh',
            subdistricts: [
              { name: 'Cipondoh Makmur', zip_code: '15148', destinationId: 34405 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Jawa Timur',
    cities: [
      {
        name: 'Kota Surabaya',
        districts: [
          {
            name: 'Gubeng',
            subdistricts: [
              { name: 'Airlangga', zip_code: '60286', destinationId: 34501 },
              { name: 'Gubeng', zip_code: '60281', destinationId: 34501 },
            ],
          },
          {
            name: 'Tegalsari',
            subdistricts: [
              { name: 'Keputran', zip_code: '60265', destinationId: 34501 },
              { name: 'Wonorejo', zip_code: '60263', destinationId: 34501 },
            ],
          },
          {
            name: 'Wonokromo',
            subdistricts: [
              { name: 'Darmo', zip_code: '60241', destinationId: 34501 },
              { name: 'Sawunggaling', zip_code: '60242', destinationId: 34501 },
            ],
          },
        ],
      },
      {
        name: 'Kota Malang',
        districts: [
          {
            name: 'Klojen',
            subdistricts: [
              { name: 'Oro-oro Dowo', zip_code: '65112', destinationId: 34502 },
              { name: 'Rampal Celaket', zip_code: '65111', destinationId: 34502 },
            ],
          },
          {
            name: 'Lowokwaru',
            subdistricts: [
              { name: 'Dinoyo', zip_code: '65144', destinationId: 34502 },
              { name: 'Jatimulyo', zip_code: '65141', destinationId: 34502 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Jawa Tengah',
    cities: [
      {
        name: 'Kota Semarang',
        districts: [
          {
            name: 'Semarang Tengah',
            subdistricts: [
              { name: 'Pandansari', zip_code: '50139', destinationId: 34601 },
              { name: 'Kembangsari', zip_code: '50133', destinationId: 34601 },
            ],
          },
          {
            name: 'Candisari',
            subdistricts: [
              { name: 'Candi', zip_code: '50257', destinationId: 34601 },
            ],
          },
        ],
      },
      {
        name: 'Kota Surakarta (Solo)',
        districts: [
          {
            name: 'Banjarsari',
            subdistricts: [
              { name: 'Manahan', zip_code: '57139', destinationId: 34602 },
              { name: 'Ketelan', zip_code: '57132', destinationId: 34602 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'DI Yogyakarta',
    cities: [
      {
        name: 'Kota Yogyakarta',
        districts: [
          {
            name: 'Gondomanan',
            subdistricts: [
              { name: 'Ngupasan (Malioboro)', zip_code: '55122', destinationId: 34701 },
              { name: 'Prawirodirjan', zip_code: '55121', destinationId: 34701 },
            ],
          },
          {
            name: 'Danurejan',
            subdistricts: [
              { name: 'Bausasran', zip_code: '55211', destinationId: 34701 },
            ],
          },
        ],
      },
      {
        name: 'Kab. Sleman',
        districts: [
          {
            name: 'Depok',
            subdistricts: [
              { name: 'Caturtunggal', zip_code: '55281', destinationId: 34702 },
              { name: 'Maguwoharjo', zip_code: '55282', destinationId: 34702 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Bali',
    cities: [
      {
        name: 'Kota Denpasar',
        districts: [
          {
            name: 'Denpasar Selatan',
            subdistricts: [
              { name: 'Sanur', zip_code: '80228', destinationId: 34801 },
              { name: 'Renon', zip_code: '80235', destinationId: 34801 },
              { name: 'Sesetan', zip_code: '80223', destinationId: 34801 },
            ],
          },
        ],
      },
      {
        name: 'Kab. Badung',
        districts: [
          {
            name: 'Kuta',
            subdistricts: [
              { name: 'Seminyak', zip_code: '80361', destinationId: 34802 },
              { name: 'Legian', zip_code: '80361', destinationId: 34802 },
              { name: 'Canggu', zip_code: '80351', destinationId: 34802 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Sumatera Utara',
    cities: [
      {
        name: 'Kota Medan',
        districts: [
          {
            name: 'Medan Baru',
            subdistricts: [
              { name: 'Petisah Hulu', zip_code: '20152', destinationId: 34901 },
              { name: 'Babura', zip_code: '20154', destinationId: 34901 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Sumatera Selatan',
    cities: [
      {
        name: 'Kota Palembang',
        districts: [
          {
            name: 'Ilir Barat I',
            subdistricts: [
              { name: 'Bukit Lama', zip_code: '30139', destinationId: 34902 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Sulawesi Selatan',
    cities: [
      {
        name: 'Kota Makassar',
        districts: [
          {
            name: 'Panakkukang',
            subdistricts: [
              { name: 'Masale', zip_code: '90231', destinationId: 34903 },
            ],
          },
        ],
      },
    ],
  },
];

export function findDestinationByDetails(
  province: string,
  city: string,
  district: string,
  subdistrict?: string
): RajaOngkirDestination {
  // First try to find exact match in MOCK_DESTINATIONS
  const match = MOCK_DESTINATIONS.find(
    (d) =>
      d.province.toLowerCase().includes(province.toLowerCase()) &&
      d.city.toLowerCase().includes(city.toLowerCase())
  );

  if (match) {
    return {
      ...match,
      province,
      city,
      district,
      subdistrict: subdistrict || match.subdistrict,
      label: `${subdistrict || district}, ${district}, ${city}, ${province}, ${match.zip_code || '12810'}`
    };
  }

  // Fallback destination generator
  const generatedId = 40000 + Math.abs((province + city + district).length * 137) % 5000;
  return {
    id: generatedId,
    label: `${subdistrict || district}, ${district}, ${city}, ${province}`,
    province,
    city,
    district,
    subdistrict,
    zip_code: '12810',
  };
}
