import { JwtTokenInspectorModal } from '@/components/JwtTokenInspectorModal';
import { LoginModal } from '@/components/LoginModal';
import { MenuItemDetailModal } from '@/components/MenuItemDetailModal';
import { ThemeModal } from '@/components/ThemeModal';
import { TopUpModal } from '@/components/TopUpModal';
import { MenuItem } from '@/constants/canteenData';
import { useCanteen } from '@/context/CanteenContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: 'semua', label: 'Semua Menu', icon: '🍽️', color: '#6366f1', lightBg: '#eef2ff', borderColor: '#c7d2fe' },
  { id: 'makanan-berat', label: 'Makanan Berat', icon: '🍲', color: '#ea580c', lightBg: '#fff7ed', borderColor: '#fed7aa' },
  { id: 'camilan', label: 'Camilan & Snack', icon: '🥟', color: '#d97706', lightBg: '#fffbeb', borderColor: '#fde68a' },
  { id: 'minuman', label: 'Minuman Segar', icon: '🥤', color: '#0284c7', lightBg: '#f0f9ff', borderColor: '#bae6fd' },
  { id: 'paket-hemat', label: 'Paket Hemat Combo', icon: '⭐', color: '#8b5cf6', lightBg: '#faf5ff', borderColor: '#e9d5ff' },
  { id: 'sehat', label: 'Menu Sehat & Diet', icon: '🥗', color: '#10b981', lightBg: '#ecfdf5', borderColor: '#a7f3d0' },
];

const QUICK_FILTERS = [
  { id: 'all', label: '🌟 Semua' },
  { id: 'terlaris', label: '🔥 Paling Laris' },
  { id: 'rating', label: '⭐ Rating 4.8+' },
  { id: 'murah', label: '💸 Di Bawah 15rb' },
  { id: 'cepat', label: '⚡ Siap < 5 Mnt' },
];

const PROMO_BANNERS = [
  {
    id: 1,
    tag: '⚡ PROMO HARI INI',
    title: 'Diskon 20% Paket Hemat Combo!',
    desc: 'Nasi Ayam Geprek Sambal Bawang + Es Teh Manis Jumbo hanya Rp 18.000. Kuota terbatas!',
    code: 'SMARTHEMAT',
    bg: '#0f172a',
    accent: '#f59e0b',
  },
  {
    id: 2,
    tag: '🚀 BEBAS ANTRE',
    title: 'Pre-Order Pagi, Ambil Pas Istirahat!',
    desc: 'Pesan sekarang sebelum bel berbunyi. Makanan sudah siap hangat di stan pilihan Anda.',
    code: 'BEBASANTRE',
    bg: '#1e1b4b',
    accent: '#38bdf8',
  },
  {
    id: 3,
    tag: '💳 SMARTPAY CASHBACK',
    title: 'Ekstra Saldo 10% Pakai RFID',
    desc: 'Bayar otomatis tanpa uang kembalian dan nikmati poin reward setiap transaksi kantin!',
    code: 'PAY10',
    bg: '#14271c',
    accent: '#34d399',
  },
];

const NOTE_CHIPS = ['Pedas', 'Tidak Pedas', 'Kuah Dipisah', 'Sedikit Es', 'Bungkus'];

export default function HomeScreen() {
  const {
    user,
    role,
    token,
    inspectMenuWithToken,
    menu,
    cart,
    addToCart,
    updateCartQty,
    updateCartItemNote,
    checkout,
    balance,
    activeTheme,
  } = useCanteen();

  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<MenuItem | null>(null);

  const [promoIndex, setPromoIndex] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SmartPay (Saldo Kartu)');
  const [pickupSlot, setPickupSlot] = useState('Istirahat 1 (09.45 - 10.15)');
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi ☀️';
    if (hour >= 11 && hour < 15) return 'Selamat Siang 🍛';
    if (hour >= 15 && hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'semua' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stan.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesQuick = true;
    if (activeQuickFilter === 'terlaris') {
      matchesQuick = item.soldCount >= 50 || item.tags.includes('Terlaris') || item.tags.includes('Top Choice');
    } else if (activeQuickFilter === 'rating') {
      matchesQuick = item.rating >= 4.8;
    } else if (activeQuickFilter === 'murah') {
      matchesQuick = item.price <= 15000;
    } else if (activeQuickFilter === 'cepat') {
      matchesQuick = item.prepTime.includes('2') || item.prepTime.includes('3') || item.prepTime.includes('5');
    }

    return matchesCategory && matchesSearch && matchesQuick;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const rawCartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const cartTotalPrice = Math.max(0, rawCartTotalPrice - discountAmount);
  const isBalanceInsufficient = paymentMethod.includes('SmartPay') && balance < cartTotalPrice;

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SMARTHEMAT') {
      setAppliedVoucher({ code: 'SMARTHEMAT', discount: 3000 });
      const msg = 'Voucher SMARTHEMAT berhasil digunakan! Potongan diskon Rp 3.000.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Voucher Berhasil 🎉', msg);
    } else if (code === 'PAY10') {
      const discount = Math.round(rawCartTotalPrice * 0.1);
      setAppliedVoucher({ code: 'PAY10', discount });
      const msg = `Voucher PAY10 berhasil digunakan! Cashback diskon 10% (Rp ${discount.toLocaleString('id-ID')}).`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Voucher Berhasil 🎉', msg);
    } else {
      const msg = 'Kode voucher tidak valid atau sudah kadaluarsa. Coba gunakan SMARTHEMAT.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Voucher Tidak Valid', msg);
    }
  };

  const handleSimulateCardTap = () => {
    const msg = `📡 Kartu RFID SmartPay (${user?.name || 'Siswa'}) terdeteksi di scanner kasir!\nSinyal: Kuat (NFC Aktif)\nSaldo Terdaftar: Rp ${balance.toLocaleString('id-ID')}`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('NFC SmartPay Terbaca ⚡', msg);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (isBalanceInsufficient) {
      const msg = 'Saldo SmartPay Anda tidak mencukupi untuk pesanan ini. Silakan isi saldo terlebih dahulu.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Saldo Tidak Cukup', msg);
      return;
    }

    const queueNum = checkout(paymentMethod, pickupSlot, user?.name, user?.detail, discountAmount);
    setIsCartVisible(false);
    setAppliedVoucher(null);
    setVoucherCode('');

    const successMsg = `Pesanan Berhasil Disimpan!\nNomor Antrean Anda: ${queueNum}.\nSilakan pantau perkembangan pesanan Anda di tab Status Antrean.`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Pesanan Diterima 🎉', successMsg);
  };

  const handleInspectMenu = async (item: typeof menu[0]) => {
    const res = await inspectMenuWithToken(item.id);
    const alertMsg = res.success
      ? `✅ [200 OK] Akses Endpoint Menu Berhasil Terverifikasi!\n\n• Endpoint: GET /api/menu/${item.id}\n• Authorization: Bearer ${token?.substring(0, 24)}...\n• Menu: ${res.data?.name}\n• Harga: Rp ${res.data?.price.toLocaleString('id-ID')}`
      : `❌ [${res.status} Unauthorized]\n\n${res.message}`;

    if (Platform.OS === 'web') alert(alertMsg);
    else Alert.alert('Verifikasi JWT Endpoint Menu', alertMsg);
  };

  const getRibbonForCategory = (cat: string, stock: number) => {
    if (stock === 0) return { label: '❌ HABIS', bg: '#ef4444' };
    if (stock <= 5) return { label: '⚡ SISA ' + stock, bg: '#f59e0b' };
    switch (cat) {
      case 'paket-hemat':
        return { label: '⭐ COMBO HEMAT', bg: '#8b5cf6' };
      case 'makanan-berat':
        return { label: '🔥 BEST SELLER', bg: activeTheme.primary };
      case 'minuman':
        return { label: '❄️ DINGIN SEGAR', bg: '#0284c7' };
      case 'sehat':
        return { label: '🥗 SEHAT & FIT', bg: '#10b981' };
      case 'camilan':
        return { label: '🥟 KRISPI GURIH', bg: '#d97706' };
      default:
        return { label: '✨ PILIHAN SISWA', bg: '#6366f1' };
    }
  };

  const currentPromo = PROMO_BANNERS[promoIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Header Row with Time Greeting & Profile Navigation */}
        <View style={styles.topHeader}>
          <View style={styles.greetingGroup}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{user ? user.name : 'Siswa Tamu'} 👋</Text>
            <View style={styles.roleTag}>
              <View style={[styles.roleDot, { backgroundColor: activeTheme.primary }]} />
              <Text style={styles.roleTagText}>
                {user ? (user.role === 'siswa' ? 'Siswa Terverifikasi • XII MIPA 2' : 'Pengelola Stan Kantin') : 'Tamu'}
              </Text>
            </View>
          </View>

          <View style={styles.topHeaderActions}>
            <TouchableOpacity
              onPress={() => setIsThemeModalOpen(true)}
              style={[styles.themeSwitcherBtn, { borderColor: activeTheme.primary, backgroundColor: activeTheme.primarySoft }]}>
              <Text style={[styles.themeSwitcherText, { color: activeTheme.primaryDark }]}>
                {activeTheme.icon} {activeTheme.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/pengaturan' as any)}
              style={styles.profileAvatarBox}>
              <Text style={styles.profileAvatarIcon}>{user?.avatar || (user?.role === 'pengelola' ? '👨‍🍳' : '🎓')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Virtual RFID SmartPay Card */}
        {role === 'siswa' && (
          <View style={[styles.virtualCard, { borderColor: activeTheme.primary }]}>
            {/* Holographic Chip & Brand */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardChipBadge}>
                <Text style={styles.cardChipIcon}>💳</Text>
                <Text style={styles.cardChipText}>SmartPay RFID</Text>
                <Text style={styles.nfcIcon}>📡</Text>
              </View>

              <TouchableOpacity onPress={() => setIsJwtModalOpen(true)} style={styles.jwtMiniBadge}>
                <Text style={styles.jwtMiniDot}>●</Text>
                <Text style={styles.jwtMiniText}>JWT Sesi Aktif</Text>
              </TouchableOpacity>
            </View>

            {/* Balance & Visibility Toggle */}
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>SALDO KARTU SISWA</Text>
                <Text style={styles.balanceValue}>
                  {isBalanceHidden ? 'Rp ••••••••' : `Rp ${balance.toLocaleString('id-ID')}`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                style={styles.eyeBtn}>
                <Text style={styles.eyeBtnText}>{isBalanceHidden ? '👁️ Tampilkan' : '🙈 Sembunyikan'}</Text>
              </TouchableOpacity>
            </View>

            {/* Card Holder & Quick Actions */}
            <View style={styles.cardFooterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHolderLabel}>PEMEGANG KARTU</Text>
                <Text style={styles.cardHolderName} numberOfLines={1}>
                  {user ? user.name : 'Natania Oktaviani'} • {user?.nim || '202610192'}
                </Text>
              </View>

              <View style={styles.cardActionGroup}>
                <TouchableOpacity
                  onPress={handleSimulateCardTap}
                  style={styles.tapNfcBtn}>
                  <Text style={styles.tapNfcBtnText}>⚡ Tap</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsTopUpModalOpen(true)}
                  style={[styles.topUpBtn, { backgroundColor: activeTheme.primary }]}>
                  <Text style={styles.topUpBtnText}>+ Isi Saldo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Dynamic Daily Promo Carousel */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (currentPromo.code === 'SMARTHEMAT') {
              setVoucherCode('SMARTHEMAT');
              setIsCartVisible(true);
            } else {
              setPromoIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
            }
          }}
          style={[styles.promoBannerCard, { backgroundColor: currentPromo.bg }]}>
          <View style={styles.promoContent}>
            <View style={styles.promoTagRow}>
              <View style={[styles.promoTagPill, { backgroundColor: currentPromo.accent }]}>
                <Text style={styles.promoTagText}>{currentPromo.tag}</Text>
              </View>
              <Text style={styles.promoTapHint}>Ketuk untuk geser promo ➔</Text>
            </View>

            <Text style={styles.promoTitle}>{currentPromo.title}</Text>
            <Text style={styles.promoDesc}>{currentPromo.desc}</Text>

            <View style={styles.promoDotsRow}>
              {PROMO_BANNERS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.promoDot,
                    idx === promoIndex && [styles.promoDotActive, { backgroundColor: currentPromo.accent }],
                  ]}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari ayam geprek, es teh, bakso, stan kantin..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <Text style={{ color: '#64748b', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filter Chips */}
        <View style={styles.quickFiltersRow}>
          {QUICK_FILTERS.map((qf) => {
            const isQfActive = activeQuickFilter === qf.id;
            return (
              <TouchableOpacity
                key={qf.id}
                onPress={() => setActiveQuickFilter(qf.id)}
                style={[
                  styles.quickFilterChip,
                  isQfActive && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                ]}>
                <Text
                  style={[
                    styles.quickFilterChipText,
                    isQfActive && { color: '#ffffff' },
                  ]}>
                  {qf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vibrant Category Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  {
                    borderColor: isActive ? activeTheme.primary : cat.borderColor,
                    backgroundColor: isActive ? activeTheme.primary : cat.lightBg,
                  },
                ]}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    { color: isActive ? '#ffffff' : cat.color },
                    isActive && styles.categoryTextActive,
                  ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Pilihan Menu Kantin 🍱</Text>
            <Text style={styles.sectionSubtitle}>
              Menampilkan {filteredMenu.length} makanan & minuman siap saji
            </Text>
          </View>
        </View>

        {/* Menu Items Grid */}
        <View style={styles.menuGrid}>
          {filteredMenu.map((item) => {
            const ribbon = getRibbonForCategory(item.category, item.stock);
            const inCart = cart.find((c) => c.id === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => setDetailModalItem(item)}
                style={styles.card}>
                <View style={styles.cardImageContainer}>
                  <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  {/* Top Floating Promo Ribbon */}
                  <View style={[styles.ribbonBadge, { backgroundColor: ribbon.bg }]}>
                    <Text style={styles.ribbonBadgeText}>{ribbon.label}</Text>
                  </View>

                  {/* Rating Badge */}
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
                  </View>

                  {/* Stock Indicator */}
                  <View
                    style={[
                      styles.stockBadge,
                      item.stock === 0
                        ? styles.stockBadgeOut
                        : item.stock <= 5
                        ? styles.stockBadgeLow
                        : styles.stockBadgeOk,
                    ]}>
                    <Text style={styles.stockBadgeText}>
                      {item.stock === 0 ? 'Habis' : `Sisa ${item.stock}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.stanRow}>
                    <Text style={[styles.cardStan, { color: activeTheme.primaryDark }]}>
                      🏪 {item.stan}
                    </Text>
                    <View style={styles.prepTimeBadge}>
                      <Text style={styles.prepTimeText}>⏱️ {item.prepTime}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {item.tags.map((tag, tIdx) => (
                        <View key={tIdx} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardPriceLabel}>Harga Porsi</Text>
                      <Text style={[styles.cardPrice, { color: activeTheme.primary }]}>
                        Rp {item.price.toLocaleString('id-ID')}
                      </Text>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleInspectMenu(item)}
                        style={styles.testApiBtn}>
                        <Text style={styles.testApiBtnText}>🔑 JWT</Text>
                      </TouchableOpacity>

                      {inCart ? (
                        <View style={[styles.stepperInCard, { borderColor: activeTheme.primary }]}>
                          <TouchableOpacity
                            onPress={() => updateCartQty(item.id, inCart.qty - 1)}
                            style={styles.stepperBtn}>
                            <Text style={[styles.stepperBtnText, { color: activeTheme.primary }]}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepperQtyText}>{inCart.qty}</Text>
                          <TouchableOpacity
                            onPress={() => updateCartQty(item.id, inCart.qty + 1)}
                            style={styles.stepperBtn}>
                            <Text style={[styles.stepperBtnText, { color: activeTheme.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          disabled={item.stock === 0}
                          onPress={() => addToCart(item)}
                          style={[
                            styles.addBtn,
                            { backgroundColor: activeTheme.primary },
                            item.stock === 0 && styles.addBtnDisabled,
                          ]}>
                          <Text style={styles.addBtnText}>
                            {item.stock === 0 ? 'Habis' : '+ Pesan'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartTotalCount > 0 && (
        <View style={[styles.floatingCartBar, { backgroundColor: '#0f172a' }]}>
          <View>
            <Text style={styles.cartBarCount}>🛒 {cartTotalCount} Item di Keranjang</Text>
            <Text style={styles.cartBarPrice}>
              Total: Rp {cartTotalPrice.toLocaleString('id-ID')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCartVisible(true)}
            style={[styles.checkoutBarBtn, { backgroundColor: activeTheme.primary }]}>
            <Text style={styles.checkoutBarBtnText}>Lihat & Checkout ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Keranjang & Checkout */}
      <Modal visible={isCartVisible} animationType="slide" transparent onRequestClose={() => setIsCartVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Keranjang Pesanan 🛒</Text>
                <Text style={styles.modalSubtitle}>{cartTotalCount} item siap di-checkout</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCartVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {cart.map((cartItem) => (
                <View key={cartItem.id} style={styles.cartCard}>
                  <View style={styles.cartRowTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemTitle}>{cartItem.name}</Text>
                      <Text style={[styles.cartItemPrice, { color: activeTheme.primary }]}>
                        Rp {cartItem.price.toLocaleString('id-ID')} / porsi
                      </Text>
                    </View>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        onPress={() => updateCartQty(cartItem.id, cartItem.qty - 1)}
                        style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{cartItem.qty}</Text>
                      <TouchableOpacity
                        onPress={() => updateCartQty(cartItem.id, cartItem.qty + 1)}
                        style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemSubtotalRow}>
                    <Text style={styles.itemSubtotalLabel}>Subtotal</Text>
                    <Text style={styles.itemSubtotalVal}>
                      Rp {(cartItem.price * cartItem.qty).toLocaleString('id-ID')}
                    </Text>
                  </View>

                  {/* Notes / Special Instructions per Item */}
                  <View style={styles.notesSection}>
                    <View style={styles.notesHeaderRow}>
                      <Text style={styles.notesLabel}>📝 Catatan Khusus untuk Dapur:</Text>
                      {editingNoteItemId !== cartItem.id && (
                        <TouchableOpacity onPress={() => setEditingNoteItemId(cartItem.id)}>
                          <Text style={[styles.editNoteBtnText, { color: activeTheme.primary }]}>
                            {cartItem.note ? 'Ubah Catatan' : '+ Tambah Catatan'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {editingNoteItemId === cartItem.id ? (
                      <View style={styles.noteInputBox}>
                        <TextInput
                          style={styles.noteInput}
                          placeholder="Contoh: jangan pedas, kuah dipisah, es sedikit..."
                          placeholderTextColor="#94a3b8"
                          value={cartItem.note || ''}
                          onChangeText={(txt) => updateCartItemNote(cartItem.id, txt)}
                        />
                        <View style={styles.quickChipsRow}>
                          {NOTE_CHIPS.map((chip) => (
                            <TouchableOpacity
                              key={chip}
                              onPress={() => {
                                const current = cartItem.note ? `${cartItem.note}, ${chip}` : chip;
                                updateCartItemNote(cartItem.id, current);
                              }}
                              style={styles.chipBtn}>
                              <Text style={styles.chipText}>+{chip}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity
                          onPress={() => setEditingNoteItemId(null)}
                          style={[styles.saveNoteBtn, { backgroundColor: activeTheme.primary }]}>
                          <Text style={styles.saveNoteBtnText}>✓ Simpan Catatan</Text>
                        </TouchableOpacity>
                      </View>
                    ) : cartItem.note ? (
                      <Text style={styles.noteSavedText}>&quot;{cartItem.note}&quot;</Text>
                    ) : (
                      <Text style={styles.noNotePlaceholder}>Tidak ada permintaan khusus</Text>
                    )}
                  </View>
                </View>
              ))}

              <View style={styles.divider} />

              {/* Voucher Code Box */}
              <View style={styles.voucherBox}>
                <Text style={styles.formLabel}>Kode Voucher Promo 🎟️</Text>
                <View style={styles.voucherInputRow}>
                  <TextInput
                    style={styles.voucherInput}
                    placeholder="Masukkan kode promo (misal: SMARTHEMAT)"
                    placeholderTextColor="#94a3b8"
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    onPress={handleApplyVoucher}
                    style={[styles.voucherApplyBtn, { backgroundColor: activeTheme.primary }]}>
                    <Text style={styles.voucherApplyBtnText}>Gunakan</Text>
                  </TouchableOpacity>
                </View>

                {appliedVoucher && (
                  <View style={styles.appliedVoucherBadge}>
                    <Text style={styles.appliedVoucherText}>
                      ✓ Voucher {appliedVoucher.code} Aktif (-Rp {appliedVoucher.discount.toLocaleString('id-ID')})
                    </Text>
                    <TouchableOpacity onPress={() => setAppliedVoucher(null)}>
                      <Text style={styles.removeVoucherText}>✕ Hapus</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.formLabel}>Pilih Jam Pengambilan di Stan ⏱️</Text>
              {[
                'Istirahat 1 (09.45 - 10.15)',
                'Istirahat 2 (12.00 - 12.30)',
                'Jam Pulang Sekolah (15.00 - 15.30)',
              ].map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setPickupSlot(slot)}
                  style={[
                    styles.optionPill,
                    pickupSlot === slot && {
                      backgroundColor: activeTheme.primarySoft,
                      borderColor: activeTheme.primary,
                    },
                  ]}>
                  <Text style={pickupSlot === slot ? [styles.optionTextActive, { color: activeTheme.primaryDark }] : styles.optionText}>
                    {pickupSlot === slot ? '🔘 ' : '⚪ '} {slot}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.formLabel, { marginTop: 14 }]}>Metode Pembayaran 💳</Text>
              {[
                { name: 'SmartPay (Saldo Kartu)', desc: `Saldo Anda: Rp ${balance.toLocaleString('id-ID')}` },
                { name: 'QRIS Sekolah Digital', desc: 'Scan QRIS saat ambil di stan' },
                { name: 'Tunai di Kasir Kantin', desc: 'Bayar uang pas saat mengambil' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.name}
                  onPress={() => setPaymentMethod(m.name)}
                  style={[
                    styles.optionPill,
                    paymentMethod === m.name && {
                      backgroundColor: activeTheme.primarySoft,
                      borderColor: activeTheme.primary,
                    },
                  ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={paymentMethod === m.name ? [styles.optionTextActive, { color: activeTheme.primaryDark }] : styles.optionText}>
                      {paymentMethod === m.name ? '🔘 ' : '⚪ '} {m.name}
                    </Text>
                    <Text style={styles.optionSubtext}>{m.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {isBalanceInsufficient && (
                <View style={styles.insufficientBox}>
                  <Text style={styles.insufficientTitle}>⚠️ Saldo SmartPay Tidak Mencukupi</Text>
                  <Text style={styles.insufficientDesc}>
                    Saldo Anda: Rp {balance.toLocaleString('id-ID')}, sedangkan total pesanan Rp{' '}
                    {cartTotalPrice.toLocaleString('id-ID')}.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsTopUpModalOpen(true)}
                    style={styles.insufficientTopUpBtn}>
                    <Text style={styles.insufficientTopUpBtnText}>⚡ Isi Saldo Sekarang</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Order Summary Breakdown */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal Pesanan</Text>
                  <Text style={styles.summaryValue}>Rp {rawCartTotalPrice.toLocaleString('id-ID')}</Text>
                </View>
                {appliedVoucher && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: '#059669', fontWeight: 'bold' }]}>Diskon Voucher Promo</Text>
                    <Text style={[styles.summaryValue, { color: '#059669' }]}>- Rp {discountAmount.toLocaleString('id-ID')}</Text>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Biaya Layanan Antrean</Text>
                  <Text style={[styles.summaryValue, { color: '#059669' }]}>Gratis (Rp 0)</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#0f172a' }]}>
                    Total Pembayaran
                  </Text>
                  <Text style={[styles.summaryValue, { color: activeTheme.primary, fontSize: 18, fontWeight: '900' }]}>
                    Rp {cartTotalPrice.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                disabled={isBalanceInsufficient}
                onPress={handleCheckout}
                style={[
                  styles.confirmBtn,
                  { backgroundColor: activeTheme.primary },
                  isBalanceInsufficient && styles.confirmBtnDisabled,
                ]}>
                <Text style={styles.confirmBtnText}>
                  {isBalanceInsufficient ? 'Saldo Tidak Cukup' : 'Konfirmasi & Pesan Sekarang 🔥'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Item Quick View Modal */}
      <MenuItemDetailModal
        item={detailModalItem}
        visible={!!detailModalItem}
        onClose={() => setDetailModalItem(null)}
      />

      {/* Theme Picker Modal */}
      <ThemeModal
        visible={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Top Up Modal */}
      <TopUpModal
        visible={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />

      {/* JWT Token Inspector Modal */}
      <JwtTokenInspectorModal
        visible={isJwtModalOpen}
        onClose={() => setIsJwtModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  scrollContent: {
    padding: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingGroup: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  topHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeSwitcherBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeSwitcherText: {
    fontSize: 11,
    fontWeight: '800',
  },
  profileAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatarIcon: {
    fontSize: 22,
  },
  virtualCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardChipIcon: {
    fontSize: 16,
  },
  cardChipText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nfcIcon: {
    fontSize: 14,
  },
  jwtMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  jwtMiniDot: {
    color: '#34d399',
    fontSize: 8,
  },
  jwtMiniText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  eyeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  eyeBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHolderLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
  },
  cardHolderName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 1,
  },
  cardActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  tapNfcBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  tapNfcBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  topUpBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  topUpBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  promoBannerCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  promoContent: {
    gap: 6,
  },
  promoTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promoTagText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoTapHint: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  promoDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  promoDotsRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  promoDotActive: {
    width: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  searchClearBtn: {
    padding: 4,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickFilterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  quickFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  menuGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ribbonBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  ribbonBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockBadgeOk: { backgroundColor: 'rgba(5, 150, 105, 0.92)' },
  stockBadgeLow: { backgroundColor: 'rgba(217, 119, 6, 0.92)' },
  stockBadgeOut: { backgroundColor: 'rgba(220, 38, 38, 0.92)' },
  stockBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: { color: '#facc15', fontSize: 11, fontWeight: '900' },
  cardContent: {
    padding: 16,
    gap: 6,
  },
  stanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStan: {
    fontSize: 12,
    fontWeight: '800',
  },
  prepTimeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  prepTimeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tagChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cardPriceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '900',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testApiBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
  },
  testApiBtnText: {
    color: '#334155',
    fontWeight: '800',
    fontSize: 11,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  stepperInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
  stepperQtyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBarCount: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  cartBarPrice: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  checkoutBarBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutBarBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalBody: {
    marginVertical: 12,
  },
  cartCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cartRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 2,
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 4,
  },
  itemSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  itemSubtotalLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  itemSubtotalVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  notesSection: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  editNoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteInputBox: {
    marginTop: 8,
    gap: 6,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0f172a',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
  },
  saveNoteBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveNoteBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  noteSavedText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#0f172a',
    marginTop: 4,
  },
  noNotePlaceholder: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  voucherBox: {
    marginBottom: 14,
  },
  voucherInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  voucherInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  voucherApplyBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  voucherApplyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  appliedVoucherBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  appliedVoucherText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '800',
  },
  removeVoucherText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  optionPill: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  optionText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionSubtext: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginLeft: 22,
  },
  insufficientBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    gap: 6,
  },
  insufficientTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b91c1c',
  },
  insufficientDesc: {
    fontSize: 12,
    color: '#7f1d1d',
  },
  insufficientTopUpBtn: {
    backgroundColor: '#dc2626',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  insufficientTopUpBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  modalFooter: {
    paddingTop: 10,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
