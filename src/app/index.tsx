import { LoginModal } from '@/components/LoginModal';
import { useCanteen } from '@/context/CanteenContext';
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
  { id: 'semua', label: 'Semua Menu', icon: '🍽️' },
  { id: 'makanan-berat', label: 'Makanan Berat', icon: '🍲' },
  { id: 'camilan', label: 'Camilan & Snack', icon: '🥟' },
  { id: 'minuman', label: 'Minuman Segar', icon: '🥤' },
  { id: 'paket-hemat', label: 'Paket Hemat', icon: '⭐' },
  { id: 'sehat', label: 'Menu Sehat', icon: '🥗' },
];

export default function HomeScreen() {
  const { user, role, menu, cart, addToCart, updateCartQty, checkout, balance } = useCanteen();
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SmartPay (Saldo Kartu)');
  const [pickupSlot, setPickupSlot] = useState('Istirahat 1 (09.45 - 10.15)');

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod.includes('SmartPay') && balance < cartTotalPrice) {
      const msg = 'Saldo SmartPay Anda tidak mencukupi untuk pesanan ini.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Saldo Tidak Cukup', msg);
      return;
    }

    const queueNum = checkout(paymentMethod, pickupSlot);
    setIsCartVisible(false);

    const successMsg = `Pesanan Berhasil! Nomor Antrean Anda: ${queueNum}.\nCek status di halaman Status Antrean.`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Pesanan Diterima 🎉', successMsg);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* User Account Bar */}
        <View style={styles.accountBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.accountName}>
              {user ? `${user.role === 'siswa' ? '🎓' : '👨‍🍳'} ${user.name}` : '👤 Mode Tamu'}
            </Text>
            <Text style={styles.accountDetail}>
              {user ? user.detail : 'Silakan login untuk memesan'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.loginTriggerBtn}>
            <Text style={styles.loginTriggerBtnText}>
              {user ? '🔄 Ganti Login' : '🔐 Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banner Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroBadge}>⚡ PRE-ORDER KANTIN SEKOLAH</Text>
            <Text style={styles.heroTitle}>Pesan Makanan Tanpa Antre di Kantin!</Text>
            <Text style={styles.heroSubtitle}>
              Pesan sebelum jam istirahat tiba, ambil pesanan langsung di stan tanpa perlu mengantre lama.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari ayam geprek, es teh, siomay..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#64748b', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Horizontal Scroll */}
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
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Katalog Makanan & Minuman 🍱</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredMenu.length} menu tersedia
          </Text>
        </View>

        {/* Menu Items Cards */}
        <View style={styles.menuGrid}>
          {filteredMenu.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

              {/* Badges */}
              <View style={styles.cardHeaderBadges}>
                <View
                  style={[
                    styles.stockBadge,
                    item.stock === 0 ? styles.stockBadgeOut : item.stock <= 5 ? styles.stockBadgeLow : styles.stockBadgeOk,
                  ]}>
                  <Text style={styles.stockBadgeText}>
                    {item.stock === 0 ? 'Habis' : `Sisa ${item.stock}`}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardStan}>{item.stan}</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardPriceLabel}>Harga</Text>
                    <Text style={styles.cardPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                  </View>

                  <TouchableOpacity
                    disabled={item.stock === 0}
                    onPress={() => addToCart(item)}
                    style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}>
                    <Text style={styles.addBtnText}>
                      {item.stock === 0 ? 'Habis' : '+ Tambah'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Footer */}
      {cartTotalCount > 0 && (
        <View style={styles.floatingCartBar}>
          <View>
            <Text style={styles.cartBarCount}>{cartTotalCount} Makanan/Minuman</Text>
            <Text style={styles.cartBarPrice}>Rp {cartTotalPrice.toLocaleString('id-ID')}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsCartVisible(true)} style={styles.checkoutBarBtn}>
            <Text style={styles.checkoutBarBtnText}>Lihat Keranjang 🛒</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Keranjang & Checkout */}
      <Modal visible={isCartVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Keranjang Pesanan 🛒</Text>
              <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {cart.map((cartItem) => (
                <View key={cartItem.id} style={styles.cartRow}>
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
              ))}

              <View style={styles.divider} />

              <Text style={styles.formLabel}>Pilih Jam Pengambilan ⏱️</Text>
              <TouchableOpacity
                onPress={() =>
                  setPickupSlot('Istirahat 1 (09.45 - 10.15)')
                }
                style={[
                  styles.optionPill,
                  pickupSlot.includes('Istirahat 1') && styles.optionPillActive,
                ]}>
                <Text style={pickupSlot.includes('Istirahat 1') ? styles.optionTextActive : styles.optionText}>
                  Istirahat 1 (09.45 - 10.15)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setPickupSlot('Istirahat 2 (12.00 - 12.30)')
                }
                style={[
                  styles.optionPill,
                  pickupSlot.includes('Istirahat 2') && styles.optionPillActive,
                ]}>
                <Text style={pickupSlot.includes('Istirahat 2') ? styles.optionTextActive : styles.optionText}>
                  Istirahat 2 (12.00 - 12.30)
                </Text>
              </TouchableOpacity>

              <Text style={[styles.formLabel, { marginTop: 16 }]}>Metode Pembayaran 💳</Text>
              {['SmartPay (Saldo Kartu)', 'QRIS Sekolah', 'Tunai di Kasir'].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[styles.optionPill, paymentMethod === method && styles.optionPillActive]}>
                  <Text style={paymentMethod === method ? styles.optionTextActive : styles.optionText}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Pembayaran:</Text>
                  <Text style={styles.summaryValue}>Rp {cartTotalPrice.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Saldo SmartPay Anda:</Text>
                  <Text style={styles.summaryValue}>Rp {balance.toLocaleString('id-ID')}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={handleCheckout} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Konfirmasi & Pesan Sekarang 🔥</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
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
  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accountName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  accountDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  loginTriggerBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginTriggerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroBanner: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroTextContainer: {
    gap: 6,
  },
  heroBadge: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#ecfdf5',
    fontSize: 13,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
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
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  menuGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardHeaderBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeOk: { backgroundColor: 'rgba(16, 185, 129, 0.9)' },
  stockBadgeLow: { backgroundColor: 'rgba(245, 158, 11, 0.9)' },
  stockBadgeOut: { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
  stockBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  ratingBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { color: '#facc15', fontSize: 11, fontWeight: 'bold' },
  cardContent: {
    padding: 16,
    gap: 4,
  },
  cardStan: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cardPriceLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cartBarCount: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cartBarPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutBarBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutBarBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalBody: {
    marginVertical: 12,
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#059669',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 6,
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
    fontWeight: 'bold',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  optionPill: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 8,
  },
  optionPillActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  optionText: {
    color: '#475569',
    fontSize: 13,
  },
  optionTextActive: {
    color: '#047857',
    fontSize: 13,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalFooter: {
    paddingTop: 12,
  },
  confirmBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
