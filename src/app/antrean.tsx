import { useCanteen } from '@/context/CanteenContext';
import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
  { key: 'menunggu', label: 'Menunggu', icon: '⏳' },
  { key: 'diproses', label: 'Dimasak', icon: '🍳' },
  { key: 'siap', label: 'Siap Diambil', icon: '🔔' },
  { key: 'selesai', label: 'Selesai', icon: '✔️' },
];

export default function AntreanScreen() {
  const { orders, cancelOrder, user } = useCanteen();
  const [activeTab, setActiveTab] = useState<'saya' | 'semua' | 'riwayat'>('saya');
  const [searchQuery, setSearchQuery] = useState('');

  const myOrders = orders.filter(
    (o) =>
      (!user || o.studentName.toLowerCase().includes(user.name.toLowerCase()) || o.studentClass.includes(user.username))
  );

  const getFilteredOrders = () => {
    let list = orders;
    if (activeTab === 'saya') {
      list = myOrders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan');
    } else if (activeTab === 'semua') {
      list = orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan');
    } else {
      list = orders.filter((o) => o.status === 'selesai' || o.status === 'dibatalkan');
    }

    if (searchQuery.trim()) {
      list = list.filter(
        (o) =>
          o.queueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return list;
  };

  const currentList = getFilteredOrders();

  const handleCancel = (orderId: string, queueNum: string) => {
    const confirmAction = () => {
      const ok = cancelOrder(orderId);
      if (ok) {
        const msg = `Pesanan ${queueNum} berhasil dibatalkan. Jika menggunakan SmartPay, saldo telah dikembalikan ke akun Anda.`;
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Pesanan Dibatalkan', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`Yakin ingin membatalkan pesanan nomor ${queueNum}?`)) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Batalkan Pesanan',
        `Apakah Anda yakin ingin membatalkan pesanan nomor ${queueNum}?`,
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Batalkan', style: 'destructive', onPress: confirmAction },
        ]
      );
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 0;
      case 'diproses':
        return 1;
      case 'siap':
        return 2;
      case 'selesai':
        return 3;
      default:
        return -1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'siap':
        return { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: '🔔 SIAP DIAMBIL DI STAN' };
      case 'diproses':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: '🍳 SEDANG DIMASAK' };
      case 'menunggu':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: '⏳ DALAM ANTREAN' };
      case 'selesai':
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: '✔️ SUDAH DIAMBIL' };
      case 'dibatalkan':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: '❌ DIBATALKAN' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pelacak Antrean Kantin 📋</Text>
          <Text style={styles.subtitle}>
            Pantau proses pembuatan makanan & notifikasi pengambilan real-time
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('saya')}
            style={[styles.tabBtn, activeTab === 'saya' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'saya' && styles.tabBtnTextActive]}>
              🔥 Pesanan Saya ({myOrders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('semua')}
            style={[styles.tabBtn, activeTab === 'semua' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'semua' && styles.tabBtnTextActive]}>
              📋 Semua Antrean ({orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('riwayat')}
            style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'riwayat' && styles.tabBtnTextActive]}>
              📜 Riwayat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nomor antrean (A-024) atau nama siswa..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#64748b', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Cards List */}
        {currentList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'saya'
                ? 'Belum Ada Pesanan Aktif Anda'
                : activeTab === 'semua'
                ? 'Tidak Ada Antrean Berjalan'
                : 'Belum Ada Riwayat Selesai'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'saya'
                ? 'Pesan makanan dari tab Menu untuk mendapatkan nomor antrean digital.'
                : 'Semua pesanan saat ini sudah selesai disajikan.'}
            </Text>
          </View>
        ) : (
          currentList.map((order) => {
            const badge = getStatusBadge(order.status);
            const currentStepIdx = getStepIndex(order.status);
            const isReady = order.status === 'siap';
            const canCancel = order.status === 'menunggu';

            return (
              <View key={order.id} style={[styles.orderCard, isReady && styles.orderCardReady]}>

                {/* Ready Callout Alert Banner */}
                {isReady && (
                  <View style={styles.readyBanner}>
                    <Text style={styles.readyBannerIcon}>🎉</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readyBannerTitle}>PESANAN SUDAH SIAP!</Text>
                      <Text style={styles.readyBannerDesc}>
                        Silakan ambil pesanan Anda sekarang di stan kantin dengan menyebutkan nomor antrean ini.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Card Top Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.queueLabel}>NOMOR ANTREAN</Text>
                    <Text style={styles.queueNumber}>{order.queueNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Visual Step Tracker (Only for non-canceled orders) */}
                {order.status !== 'dibatalkan' && (
                  <View style={styles.stepTracker}>
                    {STEPS.map((step, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;
                      return (
                        <View key={step.key} style={styles.stepItem}>
                          <View style={styles.stepIndicatorRow}>
                            {idx > 0 && (
                              <View
                                style={[
                                  styles.stepLine,
                                  isCompleted && styles.stepLineActive,
                                ]}
                              />
                            )}
                            <View
                              style={[
                                styles.stepCircle,
                                isCompleted && styles.stepCircleCompleted,
                                isCurrent && styles.stepCircleCurrent,
                              ]}>
                              <Text style={styles.stepIcon}>{step.icon}</Text>
                            </View>
                            {idx < STEPS.length - 1 && (
                              <View
                                style={[
                                  styles.stepLine,
                                  currentStepIdx > idx && styles.stepLineActive,
                                ]}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepLabel,
                              isCurrent && styles.stepLabelCurrent,
                              isCompleted && styles.stepLabelCompleted,
                            ]}>
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.divider} />

                {/* Student & Slot Details */}
                <View style={styles.metaGrid}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Pemesan:</Text>
                    <Text style={styles.metaVal}>
                      👤 {order.studentName} ({order.studentClass})
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Jam Ambil:</Text>
                    <Text style={styles.metaVal}>⏱️ {order.pickupSlot}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Pembayaran:</Text>
                    <Text style={styles.metaVal}>💳 {order.paymentMethod}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Waktu Pesan:</Text>
                    <Text style={styles.metaVal}>🕒 {order.createdAt}</Text>
                  </View>
                </View>

                {/* Item List */}
                <View style={styles.itemsBox}>
                  <Text style={styles.itemsTitle}>Rincian Makanan & Minuman:</Text>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTextName}>
                          • {item.name} <Text style={{ fontWeight: 'bold' }}>x{item.qty}</Text>
                        </Text>
                        {item.note ? (
                          <Text style={styles.itemNoteText}>
                            ↳ Catatan: "{item.note}"
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.itemTextPrice}>
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Footer Total & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Pembayaran</Text>
                    <Text style={styles.totalValue}>
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </Text>
                  </View>

                  {canCancel && (
                    <TouchableOpacity
                      onPress={() => handleCancel(order.id, order.queueNumber)}
                      style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>✕ Batalkan Pesanan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
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
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 36,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  orderCardReady: {
    borderColor: '#10b981',
    borderWidth: 2,
    backgroundColor: '#fafdfb',
  },
  readyBanner: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readyBannerIcon: {
    fontSize: 24,
  },
  readyBannerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  readyBannerDesc: {
    color: '#ecfdf5',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  queueNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#047857',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
  },
  stepLineActive: {
    backgroundColor: '#10b981',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  stepCircleCompleted: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  stepCircleCurrent: {
    backgroundColor: '#10b981',
    borderColor: '#047857',
    transform: [{ scale: 1.1 }],
  },
  stepIcon: {
    fontSize: 13,
  },
  stepLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#059669',
  },
  stepLabelCurrent: {
    color: '#047857',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  metaGrid: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
    width: 90,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  itemsBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTextName: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  itemNoteText: {
    fontSize: 11,
    color: '#059669',
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: 8,
  },
  itemTextPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#047857',
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  cancelBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
});
