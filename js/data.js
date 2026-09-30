// SmartCanteen - Initial Data Store
const INITIAL_MENU = [
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
    image: "assets/images/ayam-geprek.jpg",
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
    image: "assets/images/mie-bakso.jpg",
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
    description: "Siomay ikan tenggiri asli, tahu kukus, telur rebus, dan kentang dengan siraman bumbu kacang gurih manis dan perasan jeruk limau.",
    image: "assets/images/siomay.jpg",
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
    description: "Teh melati racikan segar disajikan dingin dengan es batu kristal higienis dan manis pas untuk pelepas dahaga saat istirahat.",
    image: "assets/images/es-teh.jpg",
    stan: "Stan 4 - Minuman Segar",
    tags: ["Segar", "Terlaris"]
  },
  {
    id: "menu-5",
    name: "Nasi Goreng Spesial Telur",
    category: "makanan-berat",
    price: 14000,
    stock: 8,
    initialStock: 20,
    prepTime: "7-10 menit",
    rating: 4.8,
    soldCount: 39,
    description: "Nasi goreng bumbu rempah khas kantin dengan suwiran ayam, telur ceplok mata sapi, kerupuk udang, dan acar timun.",
    image: "assets/images/ayam-geprek.jpg",
    stan: "Stan 1 - Dapur Bu Siti",
    tags: ["Kenyang", "Porsi Pas"]
  },
  {
    id: "menu-6",
    name: "Tahu Bakso Goreng Krispi (Isi 3)",
    category: "camilan",
    price: 8000,
    stock: 2,
    initialStock: 15,
    prepTime: "4-6 menit",
    rating: 4.6,
    soldCount: 31,
    description: "Tahu pong pilihan diisi adonan bakso sapi gurih, digoreng garing renyah keemasan, disajikan dengan cabai rawit hijau.",
    image: "assets/images/siomay.jpg",
    stan: "Stan 3 - Jajanan Kang Asep",
    tags: ["Camilan", "Hampir Habis"]
  },
  {
    id: "menu-7",
    name: "Jus Alpukat Kocok Susu",
    category: "minuman",
    price: 10000,
    stock: 0,
    initialStock: 15,
    prepTime: "3-4 menit",
    rating: 4.9,
    soldCount: 27,
    description: "Alpukat mentega matang dikocok kental dengan susu kental manis cokelat premium dan es serut dingin.",
    image: "assets/images/es-teh.jpg",
    stan: "Stan 4 - Minuman Segar",
    tags: ["Nutrisi", "Sold Out"]
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
    image: "assets/images/ayam-geprek.jpg",
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
    description: "Potongan buah apel fuji, melon, semangka, anggur dan nata de coco disiram saus creamy yoghurt manis dan taburan keju parut melimpah.",
    image: "assets/images/es-teh.jpg",
    stan: "Stan 5 - Sehat & Bugar",
    tags: ["Sehat", "Rendah Gula"]
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-2026-001",
    queueNumber: "A-021",
    studentName: "Natania Oktaviani",
    studentClass: "XI MIPA 1",
    items: [
      { id: "menu-1", name: "Ayam Geprek Sambal Bawang", price: 16000, qty: 1, note: "Sambal dipisah ya bu" },
      { id: "menu-4", name: "Es Teh Manis Jumbo", price: 4000, qty: 1, note: "Es sedang" }
    ],
    totalAmount: 20000,
    status: "selesai", // 'menunggu', 'diproses', 'siap', 'selesai', 'dibatalkan'
    paymentMethod: "SmartPay (Saldo Kartu)",
    pickupSlot: "Istirahat 1 (09.45 - 10.15)",
    createdAt: "2026-09-23T09:35:10",
    estimatedMinutes: 0
  },
  {
    id: "ORD-2026-002",
    queueNumber: "A-022",
    studentName: "Rizky Pratama",
    studentClass: "X IPS 2",
    items: [
      { id: "menu-2", name: "Mie Ayam Bakso Istimewa", price: 15000, qty: 2, note: "Satu tanpa sawi" }
    ],
    totalAmount: 30000,
    status: "selesai",
    paymentMethod: "QRIS Sekolah",
    pickupSlot: "Istirahat 1 (09.45 - 10.15)",
    createdAt: "2026-09-23T09:40:22",
    estimatedMinutes: 0
  },
  {
    id: "ORD-2026-003",
    queueNumber: "A-023",
    studentName: "Siti Nurhaliza",
    studentClass: "XII MIPA 3",
    items: [
      { id: "menu-3", name: "Siomay Bandung Komplit", price: 12000, qty: 1, note: "Bumbu kacang banyakin" },
      { id: "menu-4", name: "Es Teh Manis Jumbo", price: 4000, qty: 1, note: "" }
    ],
    totalAmount: 16000,
    status: "siap",
    paymentMethod: "SmartPay (Saldo Kartu)",
    pickupSlot: "Istirahat 2 (12.00 - 12.30)",
    createdAt: "2026-09-23T11:42:15",
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
    createdAt: "2026-09-23T11:50:08",
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
    createdAt: "2026-09-23T11:55:40",
    estimatedMinutes: 9
  }
];

const INITIAL_FINANCIAL_LOGS = [
  { id: "TRX-101", date: "2026-09-23", time: "09:35", queue: "A-021", student: "Natania Oktaviani", amount: 20000, method: "SmartPay", status: "Berhasil" },
  { id: "TRX-102", date: "2026-09-23", time: "09:40", queue: "A-022", student: "Rizky Pratama", amount: 30000, method: "QRIS", status: "Berhasil" },
  { id: "TRX-103", date: "2026-09-23", time: "11:42", queue: "A-023", student: "Siti Nurhaliza", amount: 16000, method: "SmartPay", status: "Berhasil" },
  { id: "TRX-104", date: "2026-09-23", time: "11:50", queue: "A-024", student: "Ahmad Fauzi", amount: 18000, method: "Tunai", status: "Berhasil" },
  { id: "TRX-105", date: "2026-09-23", time: "11:55", queue: "A-025", student: "Dewi Safitri", amount: 15000, method: "QRIS", status: "Berhasil" },
  { id: "TRX-098", date: "2026-09-22", time: "12:15", queue: "A-019", student: "Bima Arya", amount: 32000, method: "SmartPay", status: "Berhasil" },
  { id: "TRX-099", date: "2026-09-22", time: "12:20", queue: "A-020", student: "Clara Sinta", amount: 24000, method: "QRIS", status: "Berhasil" },
  { id: "TRX-095", date: "2026-09-21", time: "10:00", queue: "A-015", student: "Doni Kusuma", amount: 45000, method: "SmartPay", status: "Berhasil" },
  { id: "TRX-096", date: "2026-09-21", time: "10:10", queue: "A-016", student: "Eka Putri", amount: 18000, method: "Tunai", status: "Berhasil" }
];
