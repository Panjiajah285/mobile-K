import { JwtTokenInspectorModal } from '@/components/JwtTokenInspectorModal';
import { LoginModal } from '@/components/LoginModal';
import { TopUpModal } from '@/components/TopUpModal';
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
  { id: 'semua', label: 'Semua Menu', icon: '🍽️', color: '#4f46e5', lightBg: '#eef2ff', borderColor: '#c7d2fe' },
  { id: 'makanan-berat', label: 'Makanan Berat', icon: '🍲', color: '#ea580c', lightBg: '#fff7ed', borderColor: '#fed7aa' },
  { id: 'camilan', label: 'Camilan & Snack', icon: '🥟', color: '#d97706', lightBg: '#fffbeb', borderColor: '#fde68a' },
  { id: 'minuman', label: 'Minuman Segar', icon: '🥤', color: '#0284c7', lightBg: '#f0f9ff', borderColor: '#bae6fd' },
  { id: 'paket-hemat', label: 'Paket Hemat Combo', icon: '⭐', color: '#7c3aed', lightBg: '#faf5ff', borderColor: '#e9d5ff' },
  { id: 'sehat', label: 'Menu Sehat & Diet', icon: '🥗', color: '#059669', lightBg: '#ecfdf5', borderColor: '#a7f3d0' },
];

const QUICK_FILTERS = [
  { id: 'all', label: '🌟 Semua' },
  { id: 'terlaris', label: '🔥 Paling Laris' },
  { id: 'rating', label: '⭐ Rating 4.8+' },
  { id: 'murah', label: '💸 Di Bawah 15rb' },
];

const NOTE_CHIPS = ['Pedas', 'Tidak Pedas', 'Kuah Dipisah', 'Sedikit Es', 'Bungkus'];

export default function HomeScreen() {
  const {
    user,
    role,
    token,
    logout,
    inspectMenuWithToken,
    menu,
    cart,
    addToCart,
    updateCartQty,
    updateCartItemNote,
    checkout,
    balance,
  } = useCanteen();

  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SmartPay (Saldo Kartu)');
  const [pickupSlot, setPickupSlot] = useState('Istirahat 1 (09.45 - 10.15)');
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);

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
    }

    return matchesCategory && matchesSearch && matchesQuick;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isBalanceInsufficient = paymentMethod.includes('SmartPay') && balance < cartTotalPrice;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (isBalanceInsufficient) {
      const msg = 'Saldo SmartPay Anda tidak mencukupi untuk pesanan ini. Silakan isi saldo terlebih dahulu.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Saldo Tidak Cukup', msg);
      return;
    }

    const queueNum = checkout(paymentMethod, pickupSlot);
    setIsCartVisible(false);

    const successMsg = `Pesanan Berhasil Disimpan!\nNomor Antrean Anda: ${queueNum}.\nSilakan pantau perkembangan pesanan Anda di tab Status Antrean.`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Pesanan Diterima 🎉', successMsg);
  };

  const handleLogoutWithTokenRefresh = async () => {
    await logout();
    const msg = 'Logout Berhasil!\nToken JWT lama telah dicabut (revoked) dan token sesi baru telah direfresh.';
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Logout & Token Refreshed 🔄', msg);
  };

  const handleInspectMenu = async (item: typeof menu[0]) => {
    const res = await inspectMenuWithToken(item.id);
    const alertMsg = res.success
      ? `✅ [200 OK] Akses Endpoint 1 Menu Berhasil Terverifikasi!\n\n• Endpoint: GET /api/menu/${item.id}\n• Header: Authorization: Bearer ${token?.substring(0, 24)}...\n• Menu: ${res.data?.name}\n• Harga: Rp ${res.data?.price.toLocaleString('id-ID')}`
      : `❌ [${res.status} Unauthorized]\n\n${res.message}`;

    if (Platform.OS === 'web') alert(alertMsg);
    else Alert.alert('Verifikasi JWT Endpoint Menu', alertMsg);
  };

  const getRibbonForCategory = (cat: string, stock: number) => {
    if (stock === 0) return { label: '❌ HABIS', bg: '#ef4444' };
    if (stock <= 5) return { label: '⚡ HAMPIR HABIS', bg: '#f59e0b' };
    switch (cat) {
      case 'paket-hemat':
        return { label: '⭐ COMBO HEMAT', bg: '#7c3aed' };
      case 'makanan-berat':
        return { label: '🔥 BEST SELLER', bg: '#ea580c' };
      case 'minuman':
        return { label: '❄️ DINGIN SEGAR', bg: '#0284c7' };
      case 'sehat':
        return { label: '🥗 SEHAT & FIT', bg: '#059669' };
      case 'camilan':
        return { label: '🥟 KRISPI GURIH', bg: '#d97706' };
      default:
        return { label: '✨ PILIHAN SISWA', bg: '#4f46e5' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top User & Wallet Dashboard Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountTopRow}>
            <TouchableOpacity
              onPress={() => router.push('/pengaturan' as any)}
              style={styles.avatarTouchRow}>
              <View style={styles.userAvatarBox}>
                <Text style={styles.userAvatarIcon}>
                  {user ? (user.role === 'siswa' ? '🎓' : '👨‍🍳') : '👤'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.accountName}>
                  {user ? user.name : 'Pengunjung Tamu'}
                </Text>
                <Text style={styles.accountDetail}>
                  {user ? user.detail : 'Login untuk memesan & simpan riwayat'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.accountActionsCol}>
              <TouchableOpacity
                onPress={() => router.push('/pengaturan' as any)}
                style={styles.profileSettingBtn}>
                <Text style={styles.profileSettingBtnText}>⚙️ Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLoginModalOpen(true)}
                style={styles.loginTriggerBtn}>
                <Text style={styles.loginTriggerBtnText}>
                  {user ? '🔄 Ganti' : '🔐 Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* JWT Token Live Indicator Strip */}
          <View style={styles.jwtBar}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.jwtStatusDot}>●</Text>
                <Text style={styles.jwtLabel}>JWT Bearer Token Otentikasi</Text>
              </View>
              <Text style={styles.jwtValue} numberOfLines={1}>
                {token ? token : 'Belum ada token (Silakan login)'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsJwtModalOpen(true)} style={styles.jwtInspectBtn}>
              <Text style={styles.jwtInspectBtnText}>Inspeksi 🔑</Text>
            </TouchableOpacity>
          </View>

          {/* E-Wallet Strip for Students */}
          {role === 'siswa' && (
            <View style={styles.walletStrip}>
              <View>
                <Text style={styles.walletTitle}>💳 Saldo SmartPay Siswa</Text>
                <Text style={styles.walletAmount}>Rp {balance.toLocaleString('id-ID')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTopUpModalOpen(true)}
                style={styles.topUpButton}>
                <Text style={styles.topUpButtonText}>⚡ Isi Saldo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hero Announcement Banner with Warm Colorful Food Theme */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadgePill}>
                <Text style={styles.heroBadge}>⚡ PRE-ORDER KANTIN SEKOLAH</Text>
              </View>
              <View style={styles.heroLivePill}>
                <Text style={styles.heroLiveBadge}>● LIVE BUKA</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Pesan Makanan Lezat, Nikmati Istirahat Tanpa Antre! 🍱
            </Text>

            <Text style={styles.heroSubtitle}>
              Pilih menu dari stan Bu Siti, Mas Min, hingga Kang Asep. Makanan dimasak segar dan siap diambil tepat waktu.
            </Text>

            {/* Micro Highlights */}
            <View style={styles.heroPerksRow}>
              <View style={styles.heroPerkPill}>
                <Text style={styles.heroPerkText}>⏱️ Hemat 20 Menit</Text>
              </View>
              <View style={styles.heroPerkPill}>
                <Text style={styles.heroPerkText}>💳 Bayar Praktis SmartPay</Text>
              </View>
              <View style={styles.heroPerkPill}>
                <Text style={styles.heroPerkText}>🔥 Bebas Antre</Text>
              </View>
            </View>
          </View>
        </View>

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

        {/* Quick Filter Chips (Paling Laris, Rating 4.8+, Murah) */}
        <View style={styles.quickFiltersRow}>
          {QUICK_FILTERS.map((qf) => {
            const isQfActive = activeQuickFilter === qf.id;
            return (
              <TouchableOpacity
                key={qf.id}
                onPress={() => setActiveQuickFilter(qf.id)}
                style={[styles.quickFilterChip, isQfActive && styles.quickFilterChipActive]}>
                <Text style={[styles.quickFilterChipText, isQfActive && styles.quickFilterChipTextActive]}>
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
                  { borderColor: cat.borderColor, backgroundColor: isActive ? cat.color : cat.lightBg },
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
            <Text style={styles.sectionTitle}>Pilihan Menu Kantin Hari Ini 🍱</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredMenu.length} makanan & minuman segar siap disajikan untuk Anda
            </Text>
          </View>
        </View>

        {/* Menu Items Cards with Appetizing Visual Accents */}
        <View style={styles.menuGrid}>
          {filteredMenu.map((item) => {
            const ribbon = getRibbonForCategory(item.category, item.stock);
            const inCart = cart.find((c) => c.id === item.id);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardImageContainer}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

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
                    <Text style={styles.cardStan}>🏪 {item.stan}</Text>
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
                      <Text style={styles.cardPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleInspectMenu(item)}
                        style={styles.testApiBtn}>
                        <Text style={styles.testApiBtnText}>🔑 Tes Token</Text>
                      </TouchableOpacity>

                      {inCart ? (
                        <View style={styles.stepperInCard}>
                          <TouchableOpacity
                            onPress={() => updateCartQty(item.id, inCart.qty - 1)}
                            style={styles.stepperBtn}>
                            <Text style={styles.stepperBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepperQtyText}>{inCart.qty}</Text>
                          <TouchableOpacity
                            onPress={() => updateCartQty(item.id, inCart.qty + 1)}
                            style={styles.stepperBtn}>
                            <Text style={styles.stepperBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          disabled={item.stock === 0}
                          onPress={() => addToCart(item)}
                          style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}>
                          <Text style={styles.addBtnText}>
                            {item.stock === 0 ? 'Habis' : '+ Pesan'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartTotalCount > 0 && (
        <View style={styles.floatingCartBar}>
          <View>
            <Text style={styles.cartBarCount}>🛒 {cartTotalCount} Makanan/Minuman di Keranjang</Text>
            <Text style={styles.cartBarPrice}>Total: Rp {cartTotalPrice.toLocaleString('id-ID')}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsCartVisible(true)} style={styles.checkoutBarBtn}>
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
                      <Text style={styles.cartItemPrice}>
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
                          <Text style={styles.editNoteBtnText}>
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
                          style={styles.saveNoteBtn}>
                          <Text style={styles.saveNoteBtnText}>✓ Simpan Catatan</Text>
                        </TouchableOpacity>
                      </View>
                    ) : cartItem.note ? (
                      <Text style={styles.noteSavedText}>"{cartItem.note}"</Text>
                    ) : (
                      <Text style={styles.noNotePlaceholder}>Tidak ada permintaan khusus</Text>
                    )}
                  </View>
                </View>
              ))}

              <View style={styles.divider} />

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
                    pickupSlot === slot && styles.optionPillActive,
                  ]}>
                  <Text style={pickupSlot === slot ? styles.optionTextActive : styles.optionText}>
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
                  style={[styles.optionPill, paymentMethod === m.name && styles.optionPillActive]}>
                  <View style={{ flex: 1 }}>
                    <Text style={paymentMethod === m.name ? styles.optionTextActive : styles.optionText}>
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

              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal Pesanan</Text>
                  <Text style={styles.summaryValue}>Rp {cartTotalPrice.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Biaya Layanan Antrean</Text>
                  <Text style={[styles.summaryValue, { color: '#059669' }]}>Gratis (Rp 0)</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#0f172a' }]}>
                    Total Pembayaran
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#059669', fontSize: 18, fontWeight: '900' }]}>
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
                style={[styles.confirmBtn, isBalanceInsufficient && styles.confirmBtnDisabled]}>
                <Text style={styles.confirmBtnText}>
                  {isBalanceInsufficient ? 'Saldo Tidak Cukup' : 'Konfirmasi & Pesan Sekarang 🔥'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  accountTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarTouchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10b981',
  },
  userAvatarIcon: {
    fontSize: 22,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  accountDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  accountActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileSettingBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  profileSettingBtnText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  loginTriggerBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginTriggerBtnText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  jwtBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  jwtStatusDot: {
    color: '#10b981',
    fontSize: 10,
  },
  jwtLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jwtValue: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  jwtInspectBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jwtInspectBtnText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '800',
  },
  walletStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  walletTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065f46',
    marginTop: 2,
  },
  topUpButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  topUpButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroBanner: {
    backgroundColor: '#047857',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTextContainer: {
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadge: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroLivePill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroLiveBadge: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  heroSubtitle: {
    color: '#ecfdf5',
    fontSize: 12,
    lineHeight: 17,
  },
  heroPerksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  heroPerkPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroPerkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 14,
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
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFilterChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  quickFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quickFilterChipTextActive: {
    color: '#ffffff',
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
    borderRadius: 20,
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
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
    color: '#059669',
    fontWeight: '800',
  },
  prepTimeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prepTimeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
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
    color: '#047857',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testApiBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
  },
  testApiBtnText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 11,
  },
  addBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
  },
  stepperQtyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065f46',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#0f172a',
    borderRadius: 18,
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
    backgroundColor: '#10b981',
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
    color: '#059669',
    fontWeight: '600',
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
    color: '#059669',
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
    backgroundColor: '#059669',
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
  optionPillActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  optionText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#047857',
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
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#059669',
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
