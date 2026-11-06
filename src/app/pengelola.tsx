import { LiveCameraModal } from '@/components/LiveCameraModal';
import { LoginModal } from '@/components/LoginModal';
import { useCanteen } from '@/context/CanteenContext';
import * as ImagePicker from 'expo-image-picker';
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
    updateMenuItem,
    deleteMenuItem,
    activeTheme,
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
  const [newMenuPhoto, setNewMenuPhoto] = useState<any>(null);

  // Edit Menu Form State (Update Menu dengan Fitur Kamera)
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<any>(null);
  const [editMenuName, setEditMenuName] = useState('');
  const [editMenuCategory, setEditMenuCategory] = useState('makanan-berat');
  const [editMenuPrice, setEditMenuPrice] = useState('');
  const [editMenuStock, setEditMenuStock] = useState('20');
  const [editMenuPrepTime, setEditMenuPrepTime] = useState('5-7 menit');
  const [editMenuDesc, setEditMenuDesc] = useState('');
  const [editMenuPhoto, setEditMenuPhoto] = useState<any>(null);

  // Live Camera Viewfinder State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [liveCameraTarget, setLiveCameraTarget] = useState<'add' | 'edit'>('edit');

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

  // Handler: Buka Kamera Ponsel / Sistem
  const handleLaunchSystemCamera = async (target: 'add' | 'edit') => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert(
            'Izin Kamera Diperlukan 📷',
            'SmartCanteen memerlukan izin kamera untuk memotret menu makanan / minuman stan Anda.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uriSource = asset.base64
          ? { uri: `data:image/jpeg;base64,${asset.base64}` }
          : { uri: asset.uri };

        if (target === 'edit') {
          setEditMenuPhoto(uriSource);
        } else {
          setNewMenuPhoto(uriSource);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      const msg = 'Tidak dapat membuka kamera. Pastikan izin kamera aktif pada browser/perangkat Anda.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Kamera Tidak Dapat Dibuka', msg);
    }
  };

  // Handler: Pilih dari Galeri Foto
  const handlePickFromGallery = async (target: 'add' | 'edit') => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert(
            'Izin Galeri Diperlukan 🖼️',
            'SmartCanteen memerlukan izin untuk mengakses galeri foto Anda.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uriSource = asset.base64
          ? { uri: `data:image/jpeg;base64,${asset.base64}` }
          : { uri: asset.uri };

        if (target === 'edit') {
          setEditMenuPhoto(uriSource);
        } else {
          setNewMenuPhoto(uriSource);
        }
      }
    } catch (err) {
      console.error('Gallery error:', err);
      const msg = 'Tidak dapat membuka galeri foto.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Galeri Gagal Dibuka', msg);
    }
  };

  // Handler: Buka Kamera Langsung (Viewfinder)
  const handleOpenLiveCamera = (target: 'add' | 'edit') => {
    setLiveCameraTarget(target);
    if (Platform.OS === 'web') {
      setIsLiveCameraOpen(true);
    } else {
      handleLaunchSystemCamera(target);
    }
  };

  // Buka Modal Edit Menu
  const openEditMenuModal = (item: (typeof menu)[0]) => {
    setEditingItemId(item.id);
    setEditMenuName(item.name);
    setEditMenuCategory(item.category);
    setEditMenuPrice(String(item.price));
    setEditMenuStock(String(item.stock));
    setEditMenuPrepTime(item.prepTime || '5-7 menit');
    setEditMenuDesc(item.description || '');
    setEditMenuPhoto(item.image);
    setOriginalImage(item.image);
    setIsEditMenuModalOpen(true);
  };

  // Simpan Perubahan Menu
  const handleSaveEditMenu = () => {
    if (!editingItemId) return;
    if (!editMenuName.trim() || !editMenuPrice.trim()) {
      const msg = 'Harap isi nama menu dan harga!';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Form Belum Lengkap', msg);
      return;
    }

    const priceNum = parseInt(editMenuPrice.replace(/\D/g, ''), 10) || 0;
    const stockNum = parseInt(editMenuStock.replace(/\D/g, ''), 10) || 0;

    updateMenuItem(editingItemId, {
      name: editMenuName.trim(),
      category: editMenuCategory,
      price: priceNum,
      stock: stockNum,
      prepTime: editMenuPrepTime.trim() || '5 menit',
      description: editMenuDesc.trim(),
      image: editMenuPhoto,
    });

    setIsEditMenuModalOpen(false);
    const successMsg = `Menu "${editMenuName}" berhasil diperbarui dengan foto kamera terbaru! 🎉`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Menu Diperbarui 🎉', successMsg);
  };

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
      image: newMenuPhoto || undefined,
    });

    // Reset Form
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuStock('20');
    setNewMenuDesc('');
    setNewMenuPhoto(null);
    setIsAddMenuModalOpen(false);

    const successMsg = `Menu "${newMenuName}" berhasil ditambahkan ke katalog!`;
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert('Menu Ditambahkan 🎉', successMsg);
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
            style={[styles.loginPengelolaBtn, { backgroundColor: activeTheme.primary }]}>
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
            <Text style={styles.title}>Kitchen Display System (KDS) 👨‍🍳</Text>
            <Text style={[styles.subtitle, { color: activeTheme.primaryDark }]}>
              {user.name} • {user.detail}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.switchAccountBtn}>
            <Text style={styles.switchAccountBtnText}>🔄 Ganti</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Overview Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }]}>
            <Text style={styles.metricLabel}>Total Omset Hari Ini</Text>
            <Text style={[styles.metricValue, { color: activeTheme.primaryDark }]}>
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
          <View style={[styles.orderCountBadge, { backgroundColor: activeTheme.primarySoft }]}>
            <Text style={[styles.orderCountText, { color: activeTheme.primaryDark }]}>
              {filteredOrders.length} Pesanan
            </Text>
          </View>
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
                  style={[
                    styles.filterChip,
                    isActive && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                  ]}>
                  <Text style={[styles.filterChipText, isActive && { color: '#ffffff', fontWeight: '800' }]}>
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
            <Text style={styles.emptyTitle}>Tidak Ada Pesanan di Kategori Ini</Text>
            <Text style={styles.emptyText}>Semua pesanan dalam status ini telah diproses atau diserahkan.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.queueTag, { color: activeTheme.primary }]}>{order.queueNumber}</Text>
                    <Text style={styles.studentName}>{order.studentName}</Text>
                  </View>
                  <Text style={styles.orderMeta}>
                    {order.studentClass} • ⏱️ {order.pickupSlot}
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
                        <Text style={styles.itemNoteText}>⚠️ Catatan: &quot;{item.note}&quot;</Text>
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
            style={[styles.addMenuTriggerBtn, { backgroundColor: activeTheme.primary }]}>
            <Text style={styles.addMenuTriggerBtnText}>+ Tambah Menu Baru</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stockList}>
          {menu.map((item) => {
            const isOutOfStock = item.stock === 0;
            const itemImageSrc = typeof item.image === 'string' ? { uri: item.image } : item.image;
            return (
              <View key={item.id} style={styles.stockCard}>
                {/* Thumbnail Menu dengan Badge Akses Kamera */}
                <TouchableOpacity
                  onPress={() => openEditMenuModal(item)}
                  style={styles.stockItemThumbWrapper}
                  activeOpacity={0.8}
                  accessibilityLabel="Klik untuk ubah foto atau detail menu">
                  <Image source={itemImageSrc} style={styles.stockItemThumb} resizeMode="cover" />
                  <View style={styles.thumbCameraIconBadge}>
                    <Text style={{ fontSize: 9 }}>📸</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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

                {/* Stock Controls & Tombol Edit/Kamera */}
                <View style={styles.stockControls}>
                  <View style={styles.quickActionBtnRow}>
                    <TouchableOpacity
                      onPress={() => openEditMenuModal(item)}
                      style={[styles.editMenuPillBtn, { borderColor: activeTheme.primary }]}>
                      <Text style={[styles.editMenuPillBtnText, { color: activeTheme.primaryDark }]}>
                        ✏️ Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        openEditMenuModal(item);
                        setTimeout(() => handleOpenLiveCamera('edit'), 250);
                      }}
                      style={styles.cameraMenuPillBtn}
                      accessibilityLabel="Update foto menu dengan kamera">
                      <Text style={styles.cameraMenuPillBtnText}>📸</Text>
                    </TouchableOpacity>
                  </View>

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

                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id, item.name)}
                      style={styles.deleteMenuBtn}>
                      <Text style={styles.deleteMenuBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
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
              {/* Foto Menu via Kamera */}
              <View style={styles.photoSectionCard}>
                <Text style={styles.photoSectionTitle}>Foto Menu Makanan / Minuman (Opsional) 📷</Text>

                <View style={styles.photoPreviewWrapper}>
                  {newMenuPhoto ? (
                    <Image
                      source={typeof newMenuPhoto === 'string' ? { uri: newMenuPhoto } : newMenuPhoto}
                      style={styles.photoPreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.photoEmptyPlaceholder}>
                      <Text style={{ fontSize: 32 }}>📸</Text>
                      <Text style={styles.photoEmptyText}>Ambil foto menu menggunakan kamera</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cameraButtonsGrid}>
                  <TouchableOpacity
                    onPress={() => handleLaunchSystemCamera('add')}
                    style={[styles.cameraActionBtn, { backgroundColor: activeTheme.primary }]}>
                    <Text style={styles.cameraActionBtnText}>📸 Buka Kamera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenLiveCamera('add')}
                    style={[styles.cameraActionBtn, { backgroundColor: '#0284c7' }]}>
                    <Text style={styles.cameraActionBtnText}>🎥 Viewfinder</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePickFromGallery('add')}
                    style={[styles.cameraActionBtn, { backgroundColor: '#475569' }]}>
                    <Text style={styles.cameraActionBtnText}>🖼️ Galeri</Text>
                  </TouchableOpacity>
                </View>

                {newMenuPhoto && (
                  <TouchableOpacity
                    onPress={() => setNewMenuPhoto(null)}
                    style={styles.resetPhotoBtn}>
                    <Text style={styles.resetPhotoBtnText}>✕ Hapus Foto Terpilih</Text>
                  </TouchableOpacity>
                )}
              </View>

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
                        newMenuCategory === cat.id && [styles.catOptionActive, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }],
                      ]}>
                      <Text
                        style={[
                          styles.catOptionText,
                          newMenuCategory === cat.id && { color: activeTheme.primaryDark, fontWeight: '800' },
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

              <TouchableOpacity
                onPress={handleCreateMenu}
                style={[styles.saveMenuBtn, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.saveMenuBtnText}>✓ Simpan & Terbitkan Menu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Edit / Update Menu dengan Kamera */}
      <Modal
        visible={isEditMenuModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditMenuModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Menu & Foto Kamera 📸</Text>
                <Text style={styles.modalSubtitle}>Perbarui data menu atau ambil foto baru dengan kamera</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditMenuModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {/* Camera Photo Section */}
              <View style={styles.photoSectionCard}>
                <Text style={styles.photoSectionTitle}>Foto Menu Makanan / Minuman 📷</Text>

                <View style={styles.photoPreviewWrapper}>
                  {editMenuPhoto ? (
                    <Image
                      source={typeof editMenuPhoto === 'string' ? { uri: editMenuPhoto } : editMenuPhoto}
                      style={styles.photoPreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.photoEmptyPlaceholder}>
                      <Text style={{ fontSize: 32 }}>🍽️</Text>
                      <Text style={styles.photoEmptyText}>Belum ada foto menu</Text>
                    </View>
                  )}

                  <View style={styles.photoBadgeRow}>
                    <View
                      style={[
                        styles.photoActivePill,
                        editMenuPhoto !== originalImage && { backgroundColor: '#10b981' },
                      ]}>
                      <Text style={styles.photoActivePillText}>
                        {editMenuPhoto !== originalImage ? '✨ Foto Baru Kamera' : 'Foto Menu Saat Ini'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Tombol Kamera & Galeri */}
                <View style={styles.cameraButtonsGrid}>
                  <TouchableOpacity
                    onPress={() => handleLaunchSystemCamera('edit')}
                    style={[styles.cameraActionBtn, { backgroundColor: activeTheme.primary }]}>
                    <Text style={styles.cameraActionBtnText}>📸 Buka Kamera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenLiveCamera('edit')}
                    style={[styles.cameraActionBtn, { backgroundColor: '#0284c7' }]}>
                    <Text style={styles.cameraActionBtnText}>🎥 Viewfinder</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePickFromGallery('edit')}
                    style={[styles.cameraActionBtn, { backgroundColor: '#475569' }]}>
                    <Text style={styles.cameraActionBtnText}>🖼️ Galeri</Text>
                  </TouchableOpacity>
                </View>

                {originalImage && editMenuPhoto !== originalImage && (
                  <TouchableOpacity
                    onPress={() => setEditMenuPhoto(originalImage)}
                    style={styles.resetPhotoBtn}>
                    <Text style={styles.resetPhotoBtnText}>🔄 Kembalikan Foto Awal</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Form Input fields */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Makanan / Minuman *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editMenuName}
                  onChangeText={setEditMenuName}
                  placeholder="Contoh: Ayam Geprek Sambal Bawang"
                  placeholderTextColor="#94a3b8"
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
                      onPress={() => setEditMenuCategory(cat.id)}
                      style={[
                        styles.catOption,
                        editMenuCategory === cat.id && [styles.catOptionActive, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }],
                      ]}>
                      <Text
                        style={[
                          styles.catOptionText,
                          editMenuCategory === cat.id && { color: activeTheme.primaryDark, fontWeight: '800' },
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
                    value={editMenuPrice}
                    onChangeText={setEditMenuPrice}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Stok Siap Saji *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="20"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={editMenuStock}
                    onChangeText={setEditMenuStock}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estimasi Waktu Penyajian</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Contoh: 5-7 menit"
                  placeholderTextColor="#94a3b8"
                  value={editMenuPrepTime}
                  onChangeText={setEditMenuPrepTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Deskripsi Singkat</Text>
                <TextInput
                  style={[styles.formInput, { height: 70 }]}
                  placeholder="Keterangan lauk, tingkat kepedasan, atau bahan..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={editMenuDesc}
                  onChangeText={setEditMenuDesc}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveEditMenu}
                style={[styles.saveMenuBtn, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.saveMenuBtnText}>✓ Simpan Perubahan Menu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        visible={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={(imgSource) => {
          if (liveCameraTarget === 'edit') {
            setEditMenuPhoto(imgSource);
          } else {
            setNewMenuPhoto(imgSource);
          }
        }}
        title={liveCameraTarget === 'edit' ? 'Potret Menu dengan Kamera 📸' : 'Foto Menu Baru 🍱'}
      />

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
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  orderCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterScroll: {
    marginHorizontal: -4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  queueTag: {
    fontSize: 20,
    fontWeight: '900',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  paymentMeta: {
    fontSize: 11,
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
    fontWeight: '800',
  },
  itemsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
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
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  itemNoteText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  completedBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedBadgeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  addMenuTriggerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addMenuTriggerBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  stockList: {
    gap: 10,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  stockItemThumbWrapper: {
    position: 'relative',
  },
  stockItemThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  thumbCameraIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0f172a',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
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
    color: '#dc2626',
    fontSize: 9,
    fontWeight: '900',
  },
  stockItemStan: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  stockItemPrice: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  stockItemCount: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  stockControls: {
    alignItems: 'flex-end',
    gap: 6,
  },
  quickActionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editMenuPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1.2,
    backgroundColor: '#ffffff',
  },
  editMenuPillBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cameraMenuPillBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#0284c7',
  },
  cameraMenuPillBtnText: {
    fontSize: 10,
    color: '#ffffff',
  },
  quickToggleBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    width: 28,
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBtnText: {
    fontSize: 11,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '85%',
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
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  photoSectionCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  photoSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  photoPreviewWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoEmptyPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoEmptyText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  photoBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  photoActivePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoActivePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  cameraButtonsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  cameraActionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  resetPhotoBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  resetPhotoBtnText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 12,
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catOption: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  catOptionActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  catOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  catOptionTextActive: {
    color: '#047857',
  },
  saveMenuBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveMenuBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  restrictedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  restrictedIcon: {
    fontSize: 48,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  restrictedSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19,
  },
  loginPengelolaBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  loginPengelolaBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
