import { LoginModal } from '@/components/LoginModal';
import { MenuItem } from '@/constants/canteenData';
import { useCanteen } from '@/context/CanteenContext';
import { useState } from 'react';
import {
  Alert,
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

const STATUS_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: '⏳ Menunggu' },
  { key: 'diproses', label: '🍳 Dimasak' },
  { key: 'siap', label: '🔔 Siap Diambil' },
  { key: 'selesai', label: '✔️ Selesai' },
];

export default function PengelolaScreen() {
  const {
    user,
    role,
    orders,
    menu,
    updateOrderStatus,
    updateStock,
    toggleMenuAvailability,
    addMenuItem,
    deleteMenuItem,
  } = useCanteen();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('semua');
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);

  // Add Menu Form State
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('makanan-berat');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuStock, setNewMenuStock] = useState('20');
  const [newMenuPrepTime, setNewMenuPrepTime] = useState('5-7 menit');
  const [newMenuDesc, setNewMenuDesc] = useState('');

  const isPengelola = user && user.role === 'pengelola';

  const totalOmset = orders
    .filter((o) => o.status === 'selesai' || o.status === 'siap' || o.status === 'diproses')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = orders.filter((o) => o.status === 'menunggu' || o.status === 'diproses').length;
  const readyOrdersCount = orders.filter((o) => o.status === 'siap').length;

  const filteredOrders = orders.filter((order) => {
    if (selectedStatusFilter === 'semua') return true;
    return order.status === selectedStatusFilter;
  });

  const handleCreateMenu = () => {
    if (!newMenuName.trim() || !newMenuPrice.trim()) {
      const msg = 'Harap isi nama menu dan harga!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Form Belum Lengkap', msg);
      return;
    }

    const priceNum = parseInt(newMenuPrice.replace(/\D/g, ''), 10) || 0;
    const stockNum = parseInt(newMenuStock.replace(/\D/g, ''), 10) || 20;

    addMenuItem({
      name: newMenuName.trim(),
      category: newMenuCategory,
      price: priceNum,
      stock: stockNum,
      initialStock: stockNum,
      prepTime: newMenuPrepTime.trim() || '5 menit',
      rating: 5.0,
      soldCount: 0,
      description: newMenuDesc.trim() || 'Menu makanan/minuman lezat siap saji.',
      stan: user?.detail || 'Stan 1 - Dapur Bu Siti',
      tags: ['Baru', 'Pilihan Stan'],
    });

    // Reset Form
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuStock('20');
    setNewMenuDesc('');
    setIsAddMenuModalOpen(false);

    const successMsg = `Menu "${newMenuName}" berhasil ditambahkan ke katalog!`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Menu Ditambahkan', successMsg);
  };

  const handleDeleteItem = (id: string, name: string) => {
    const confirmDelete = () => {
      deleteMenuItem(id);
    };

    if (Platform.OS === 'web') {
      if (confirm(`Yakin ingin menghapus menu "${name}"?`)) confirmDelete();
    } else {
      Alert.alert('Hapus Menu', `Yakin ingin menghapus "${name}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  if (!isPengelola) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedBox}>
          <Text style={styles.restrictedIcon}>🔒</Text>
          <Text style={styles.restrictedTitle}>Akses Khusus Pengelola Kantin</Text>
          <Text style={styles.restrictedSubtitle}>
            Anda saat ini terhubung sebagai {user ? user.name : 'Tamu'} ({role.toUpperCase()}).
            Halaman ini digunakan oleh pemilik stan untuk menerima pesanan, memperbarui proses masak, dan mengatur stok.
          </Text>

          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.loginPengelolaBtn}>
            <Text style={styles.loginPengelolaBtnText}>👨‍🍳 Masuk Sebagai Pengelola Kantin</Text>
          </TouchableOpacity>
        </View>

        <LoginModal
          visible={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Dashboard */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Dashboard Dapur & Stan 👨‍🍳</Text>
            <Text style={styles.subtitle}>{user.name} • {user.detail}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.switchAccountBtn}>
            <Text style={styles.switchAccountBtnText}>🔄 Ganti</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Overview Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <Text style={styles.metricLabel}>Total Omset</Text>
            <Text style={[styles.metricValue, { color: '#047857' }]}>
              Rp {totalOmset.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <Text style={styles.metricLabel}>Antrean Masak</Text>
            <Text style={[styles.metricValue, { color: '#1d4ed8' }]}>
              {activeOrdersCount} Pesanan
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
            <Text style={styles.metricLabel}>Siap Diambil</Text>
            <Text style={[styles.metricValue, { color: '#b45309' }]}>
              {readyOrdersCount} Pesanan
            </Text>
          </View>
        </View>

        {/* Orders Header & Tab Filters */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pesanan Masuk Real-Time 📥</Text>
          <Text style={styles.orderCountBadge}>{filteredOrders.length} Pesanan</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            {STATUS_FILTERS.map((f) => {
              const isActive = selectedStatusFilter === f.key;
              const count =
                f.key === 'semua'
                  ? orders.length
                  : orders.filter((o) => o.status === f.key).length;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setSelectedStatusFilter(f.key)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Order Cards List */}
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>☕</Text>
            <Text style={styles.emptyTitle}>Tidak Ada Pesanan di Tab Ini</Text>
            <Text style={styles.emptyText}>Semua pesanan dalam status ini telah diproses.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.queueTag}>{order.queueNumber}</Text>
                    <Text style={styles.studentName}>{order.studentName}</Text>
                  </View>
                  <Text style={styles.orderMeta}>
                    {order.studentClass} • {order.pickupSlot}
                  </Text>
                  <Text style={styles.paymentMeta}>
                    💳 {order.paymentMethod} • Rp {order.totalAmount.toLocaleString('id-ID')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    order.status === 'siap'
                      ? { backgroundColor: '#dcfce7' }
                      : order.status === 'diproses'
                      ? { backgroundColor: '#fef3c7' }
                      : order.status === 'selesai'
                      ? { backgroundColor: '#f1f5f9' }
                      : { backgroundColor: '#e0f2fe' },
                  ]}>
                  <Text
                    style={[
                      styles.statusBadgeText,
                      order.status === 'siap'
                        ? { color: '#15803d' }
                        : order.status === 'diproses'
                        ? { color: '#b45309' }
                        : order.status === 'selesai'
                        ? { color: '#64748b' }
                        : { color: '#0369a1' },
                    ]}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Items List with Notes */}
              <View style={styles.itemsList}>
                {order.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemText}>
                      • <Text style={{ fontWeight: 'bold' }}>{item.name}</Text> x{item.qty}
                    </Text>
                    {item.note ? (
                      <View style={styles.itemNoteBadge}>
                        <Text style={styles.itemNoteText}>⚠️ Catatan: "{item.note}"</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>

              {/* Status Action Buttons */}
              <View style={styles.actionRow}>
                {order.status === 'menunggu' && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, 'diproses')}
                    style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.actionBtnText}>🍳 Mulai Masak / Proses</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'diproses' && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, 'siap')}
                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.actionBtnText}>🔔 Panggil Siswa (Siap Diambil)</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'siap' && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, 'selesai')}
                    style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}>
                    <Text style={styles.actionBtnText}>✔️ Diserahkan ke Siswa (Selesai)</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'selesai' && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Pesanan Selesai Diambil</Text>
                  </View>
                )}

                {order.status === 'dibatalkan' && (
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>
                    Pesanan telah dibatalkan
                  </Text>
                )}
              </View>
            </View>
          ))
        )}

        {/* Stock & Menu Management Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Katalog & Manajemen Stok Menu 📦</Text>
          <TouchableOpacity
            onPress={() => setIsAddMenuModalOpen(true)}
            style={styles.addMenuTriggerBtn}>
            <Text style={styles.addMenuTriggerBtnText}>+ Tambah Menu Baru</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stockList}>
          {menu.map((item) => {
            const isOutOfStock = item.stock === 0;
            return (
              <View key={item.id} style={styles.stockCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.stockItemTitle}>{item.name}</Text>
                    {isOutOfStock && (
                      <View style={styles.outOfStockPill}>
                        <Text style={styles.outOfStockPillText}>HABIS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stockItemStan}>{item.stan}</Text>
                  <Text style={styles.stockItemPrice}>
                    Rp {item.price.toLocaleString('id-ID')} • Terjual: {item.soldCount} porsi
                  </Text>
                  <Text style={styles.stockItemCount}>
                    Stok Tersisa:{' '}
                    <Text style={{ fontWeight: 'bold', color: isOutOfStock ? '#dc2626' : '#047857' }}>
                      {item.stock} porsi
                    </Text>
                  </Text>
                </View>

                {/* Stock Controls */}
                <View style={styles.stockControls}>
                  <TouchableOpacity
                    onPress={() => toggleMenuAvailability(item.id)}
                    style={[styles.quickToggleBtn, isOutOfStock && styles.quickToggleBtnRestock]}>
                    <Text style={styles.quickToggleBtnText}>
                      {isOutOfStock ? 'Buka Stok' : 'Tutup Stok'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      onPress={() => updateStock(item.id, -1)}
                      style={styles.stockBtn}>
                      <Text style={styles.stockBtnText}>-1</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateStock(item.id, 5)}
                      style={[styles.stockBtn, { backgroundColor: '#10b981' }]}>
                      <Text style={[styles.stockBtnText, { color: '#ffffff' }]}>+5</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.id, item.name)}
                    style={styles.deleteMenuBtn}>
                    <Text style={styles.deleteMenuBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal Tambah Menu Baru */}
      <Modal
        visible={isAddMenuModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddMenuModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>+ Tambah Menu Baru 🍱</Text>
              <TouchableOpacity onPress={() => setIsAddMenuModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginVertical: 12 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Makanan / Minuman *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Contoh: Nasi Goreng Spesial Telur"
                  placeholderTextColor="#94a3b8"
                  value={newMenuName}
                  onChangeText={setNewMenuName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategori *</Text>
                <View style={styles.categorySelectRow}>
                  {[
                    { id: 'makanan-berat', label: '🍲 Makanan' },
                    { id: 'camilan', label: '🥟 Camilan' },
                    { id: 'minuman', label: '🥤 Minuman' },
                    { id: 'paket-hemat', label: '⭐ Paket' },
                    { id: 'sehat', label: '🥗 Sehat' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setNewMenuCategory(cat.id)}
                      style={[
                        styles.catOption,
                        newMenuCategory === cat.id && styles.catOptionActive,
                      ]}>
                      <Text
                        style={[
                          styles.catOptionText,
                          newMenuCategory === cat.id && styles.catOptionTextActive,
                        ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Harga Jual (Rp) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="15000"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={newMenuPrice}
                    onChangeText={setNewMenuPrice}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Stok Siap Saji *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="20"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={newMenuStock}
                    onChangeText={setNewMenuStock}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estimasi Waktu Penyajian</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Contoh: 5-7 menit"
                  placeholderTextColor="#94a3b8"
                  value={newMenuPrepTime}
                  onChangeText={setNewMenuPrepTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Deskripsi Singkat</Text>
                <TextInput
                  style={[styles.formInput, { height: 70 }]}
                  placeholder="Keterangan lauk, tingkat kepedasan, atau bahan..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={newMenuDesc}
                  onChangeText={setNewMenuDesc}
                />
              </View>

              <TouchableOpacity onPress={handleCreateMenu} style={styles.saveMenuBtn}>
                <Text style={styles.saveMenuBtnText}>✓ Simpan & Terbitkan Menu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Login Modal */}
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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
    fontWeight: '700',
  },
  switchAccountBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchAccountBtnText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '800',
  },
  restrictedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  restrictedIcon: {
    fontSize: 54,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  restrictedSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginPengelolaBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  loginPengelolaBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  orderCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filterScroll: {
    marginVertical: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  queueTag: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    backgroundColor: '#047857',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  paymentMeta: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  itemsList: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  itemRow: {
    gap: 2,
  },
  itemText: {
    fontSize: 13,
    color: '#1e293b',
  },
  itemNoteBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  itemNoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  completedBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  addMenuTriggerBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addMenuTriggerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stockList: {
    gap: 10,
  },
  stockCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stockItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  outOfStockPill: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outOfStockPillText: {
    color: '#b91c1c',
    fontSize: 9,
    fontWeight: '800',
  },
  stockItemStan: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  stockItemPrice: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  stockItemCount: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  stockControls: {
    alignItems: 'flex-end',
    gap: 6,
  },
  quickToggleBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickToggleBtnRestock: {
    backgroundColor: '#dcfce7',
  },
  quickToggleBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stockBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  deleteMenuBtn: {
    padding: 4,
  },
  deleteMenuBtnText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catOption: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catOptionActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catOptionText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  catOptionTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  saveMenuBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveMenuBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
