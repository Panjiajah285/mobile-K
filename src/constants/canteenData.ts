export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  initialStock: number;
  prepTime: string;
  rating: number;
  soldCount: number;
  description: string;
  image: any;
  stan: string;
  tags: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

export interface Order {
  id: string;
  queueNumber: string;
  studentName: string;
  studentClass: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'menunggu' | 'diproses' | 'siap' | 'selesai' | 'dibatalkan';
  paymentMethod: string;
  pickupSlot: string;
  createdAt: string;
  estimatedMinutes: number;
}

export const INITIAL_MENU: MenuItem[] = [
  {
    id: "menu-1",
    name: "Ayam Geprek Sambal Bawang",
    category: "makanan-berat",
    price: 16000,
    stock: 18,
    initialStock: 35,
    prepTime: "6-8 menit",
    rating: 4.9,
    soldCount: 84,
    description: "Ayam krispi renyah digeprek dengan sambal bawang pedas gurih, disajikan dengan nasi hangat dan lalapan mentimun segar.",
    image: require('@/assets/images/ayam-geprek.jpg'),
    stan: "Stan 1 - Dapur Bu Siti",
    tags: ["Pedas", "Terlaris", "Favorit Siswa"]
  },
  {
    id: "menu-2",
    name: "Mie Ayam Bakso Istimewa",
    category: "makanan-berat",
    price: 15000,
    stock: 12,
    initialStock: 25,
    prepTime: "5-7 menit",
    rating: 4.8,
    soldCount: 62,
    description: "Mie kenyal dengan potongan ayam semur manis gurih, 2 butir bakso sapi empuk, sawi hijau segar, dan keripik pangsit renyah.",
    image: require('@/assets/images/mie-bakso.jpg'),
    stan: "Stan 2 - Mie & Bakso Mas Min",
    tags: ["Kuah Hangat", "Best Seller"]
  },
  {
    id: "menu-3",
    name: "Siomay Bandung Komplit",
    category: "camilan",
    price: 12000,
    stock: 4,
    initialStock: 20,
    prepTime: "3-5 menit",
    rating: 4.7,
    soldCount: 45,
    description: "Siomay ikan tenggiri asli, tahu kukus, telur rebus, dan kentang dengan siraman bumbu kacang gurih manis.",
    image: require('@/assets/images/siomay.jpg'),
    stan: "Stan 3 - Jajanan Kang Asep",
    tags: ["Camilan", "Hampir Habis"]
  },
  {
    id: "menu-4",
    name: "Es Teh Manis Jumbo",
    category: "minuman",
    price: 4000,
    stock: 45,
    initialStock: 60,
    prepTime: "2-3 menit",
    rating: 4.9,
    soldCount: 128,
    description: "Teh melati racikan segar disajikan dingin dengan es batu kristal higienis dan manis pas.",
    image: require('@/assets/images/es-teh.jpg'),
    stan: "Stan 4 - Minuman Segar",
    tags: ["Segar", "Terlaris"]
  },
  {
    id: "menu-8",
    name: "Paket Hemat: Ayam Geprek + Es Teh",
    category: "paket-hemat",
    price: 18000,
    stock: 14,
    initialStock: 30,
    prepTime: "6-8 menit",
    rating: 5.0,
    soldCount: 95,
    description: "Paket combo hemat siswa: 1 porsi Nasi Ayam Geprek Sambal Bawang + 1 gelas Es Teh Manis Jumbo. Hemat Rp 2.000!",
    image: require('@/assets/images/ayam-geprek.jpg'),
    stan: "Stan 1 - Dapur Bu Siti",
    tags: ["Paling Hemat", "Top Choice"]
  },
  {
    id: "menu-9",
    name: "Salad Buah Segar Yoghurt",
    category: "sehat",
    price: 13000,
    stock: 6,
    initialStock: 12,
    prepTime: "3 menit",
    rating: 4.8,
    soldCount: 22,
    description: "Potongan buah segar disiram saus creamy yoghurt dan taburan keju parut melimpah.",
    image: require('@/assets/images/es-teh.jpg'),
    stan: "Stan 5 - Sehat & Bugar",
    tags: ["Sehat", "Rendah Gula"]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2026-003",
    queueNumber: "A-023",
    studentName: "Siti Nurhaliza",
    studentClass: "XII MIPA 3",
    items: [
      { id: "menu-3", name: "Siomay Bandung Komplit", price: 12000, qty: 1, note: "Bumbu kacang banyakin" },
      { id: "menu-4", name: "Es Teh Manis Jumbo", price: 4000, qty: 1 }
    ],
    totalAmount: 16000,
    status: "siap",
    paymentMethod: "SmartPay (Saldo Kartu)",
    pickupSlot: "Istirahat 2 (12.00 - 12.30)",
    createdAt: "11:42",
    estimatedMinutes: 0
  },
  {
    id: "ORD-2026-004",
    queueNumber: "A-024",
    studentName: "Ahmad Fauzi",
    studentClass: "XI Bahasa",
    items: [
      { id: "menu-8", name: "Paket Hemat: Ayam Geprek + Es Teh", price: 18000, qty: 1, note: "Pedas sedang" }
    ],
    totalAmount: 18000,
    status: "diproses",
    paymentMethod: "Tunai di Kasir",
    pickupSlot: "Istirahat 2 (12.00 - 12.30)",
    createdAt: "11:50",
    estimatedMinutes: 5
  },
  {
    id: "ORD-2026-005",
    queueNumber: "A-025",
    studentName: "Dewi Safitri",
    studentClass: "X MIPA 4",
    items: [
      { id: "menu-2", name: "Mie Ayam Bakso Istimewa", price: 15000, qty: 1, note: "Kuah dipisah" }
    ],
    totalAmount: 15000,
    status: "menunggu",
    paymentMethod: "QRIS Sekolah",
    pickupSlot: "Istirahat 2 (12.00 - 12.30)",
    createdAt: "11:55",
    estimatedMinutes: 9
  }
];
