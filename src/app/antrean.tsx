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
  { key: 'menunggu', label: 'Menunggu', icon: '⏳', desc: 'Pesanan masuk ke dapur stan' },
  { key: 'diproses', label: 'Dimasak', icon: '🍳', desc: 'Koki sedang memasak hidangan' },
  { key: 'siap', label: 'Siap Ambil', icon: '🔔', desc: 'Silakan ambil di stan kantin' },
  { key: 'selesai', label: 'Selesai', icon: '✔️', desc: 'Sudah diambil oleh siswa' },
];

export default function AntreanScreen() {
  const { orders, cancelOrder, user, activeTheme } = useCanteen();
  const [activeTab, setActiveTab] = useState<'saya' | 'semua' | 'riwayat'>('saya');
  const [searchQuery, setSearchQuery] = useState('');
  const [chimeNotice, setChimeNotice] = useState<string | null>(null);

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
        const msg = `Pesanan ${queueNum} berhasil dibatalkan. Jika menggunakan SmartPay, saldo telah dikembalikan ke kartu Anda.`;
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

  const handlePlayChime = (queueNum: string) => {
    const notice = `🔔 [TING TUNG!] Panggilan untuk Nomor Antrean ${queueNum}! Pesanan sudah siap diambil hangat di stan kantin.`;
    setChimeNotice(notice);
    setTimeout(() => setChimeNotice(null), 4000);
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
          <Text style={styles.title}>Pelacak Antrean Digital 📋</Text>
          <Text style={styles.subtitle}>
            Pantau status live masak, jam pengambilan, dan tiket digital pengambilan makanan.
          </Text>
        </View>

        {/* Chime Announcement Toast */}
        {chimeNotice && (
          <View style={[styles.chimeBanner, { backgroundColor: activeTheme.primary }]}>
            <Text style={styles.chimeIcon}>🔔</Text>
            <Text style={styles.chimeText}>{chimeNotice}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('saya')}
            style={[
              styles.tabBtn,
              activeTab === 'saya' && styles.tabBtnActive,
            ]}>
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'saya' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }],
              ]}>
              🔥 Pesanan Saya ({myOrders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('semua')}
            style={[
              styles.tabBtn,
              activeTab === 'semua' && styles.tabBtnActive,
            ]}>
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'semua' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }],
              ]}>
              📋 Semua Antrean ({orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('riwayat')}
            style={[
              styles.tabBtn,
              activeTab === 'riwayat' && styles.tabBtnActive,
            ]}>
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'riwayat' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }],
              ]}>
              📜 Riwayat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nomor antrean (A-024) atau nama makanan..."
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
                ? 'Belum Ada Pesanan Berjalan'
                : activeTab === 'semua'
                ? 'Semua Antrean Selesai'
                : 'Belum Ada Riwayat Pesanan'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'saya'
                ? 'Pesan makanan lezat dari tab Menu untuk mendapatkan nomor antrean digital!'
                : 'Kantin saat ini sedang santai atau pesanan sebelumnya sudah diserahkan.'}
            </Text>
          </View>
        ) : (
          currentList.map((order) => {
            const badge = getStatusBadge(order.status);
            const currentStepIdx = getStepIndex(order.status);
            const isReady = order.status === 'siap';
            const canCancel = order.status === 'menunggu';

            return (
              <View
                key={order.id}
                style={[
                  styles.ticketCard,
                  isReady && { borderColor: '#86efac', shadowColor: '#10b981' },
                ]}>

                {/* Ready Callout Alert Banner */}
                {isReady && (
                  <View style={styles.readyBanner}>
                    <Text style={styles.readyBannerIcon}>🎉</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readyBannerTitle}>PESANAN SUDAH SIAP DIAMBIL!</Text>
                      <Text style={styles.readyBannerDesc}>
                        Silakan menuju stan dan tunjukkan tiket digital ini ke petugas kasir.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handlePlayChime(order.queueNumber)}
                      style={styles.chimeBtn}>
                      <Text style={styles.chimeBtnText}>🔔 Bel</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Ticket Top: Queue Number & Live Badge */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.queueLabel}>TIKET ANTREAN DIGITAL</Text>
                    <View style={styles.queueNumberRow}>
                      <Text style={[styles.queueNumber, { color: activeTheme.primary }]}>
                        {order.queueNumber}
                      </Text>
                      {isReady && (
                        <View style={styles.livePulsePill}>
                          <Text style={styles.livePulseText}>● SIAP AMBIL</Text>
                        </View>
                      )}
                    </View>
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

                {/* Visual Step Tracker */}
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
                                  isCompleted && [styles.stepLineActive, { backgroundColor: activeTheme.primary }],
                                ]}
                              />
                            )}
                            <View
                              style={[
                                styles.stepCircle,
                                isCompleted && [styles.stepCircleCompleted, { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary }],
                                isCurrent && [styles.stepCircleCurrent, { borderColor: activeTheme.primary }],
                              ]}>
                              <Text style={styles.stepIcon}>{step.icon}</Text>
                            </View>
                            {idx < STEPS.length - 1 && (
                              <View
                                style={[
                                  styles.stepLine,
                                  currentStepIdx > idx && [styles.stepLineActive, { backgroundColor: activeTheme.primary }],
                                ]}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepLabel,
                              isCurrent && [styles.stepLabelCurrent, { color: activeTheme.primaryDark }],
                              isCompleted && styles.stepLabelCompleted,
                            ]}>
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Perforated Ticket Dashed Divider */}
                <View style={styles.ticketPerforatedRow}>
                  <View style={styles.notchLeft} />
                  <View style={styles.dashedLine} />
                  <View style={styles.notchRight} />
                </View>

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
                    <Text style={[styles.metaVal, { color: activeTheme.primaryDark, fontWeight: '800' }]}>
                      ⏱️ {order.pickupSlot}
                    </Text>
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

                {/* Barcode Simulation Strip */}
                <View style={styles.barcodeStrip}>
                  <Text style={styles.barcodeText}>||| | |||| || ||| |||| | ||| |||| |</Text>
                  <Text style={styles.barcodeSub}>VALIDASI AMBIL: {order.id} • SCAN STAN</Text>
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
                            ↳ Catatan: &quot;{item.note}&quot;
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.itemTextPrice, { color: activeTheme.primary }]}>
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Footer Total & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Pembayaran</Text>
                    <Text style={[styles.totalValue, { color: activeTheme.primary }]}>
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </Text>
                  </View>

                  <View style={styles.footerActionGroup}>
                    {canCancel && (
                      <TouchableOpacity
                        onPress={() => handleCancel(order.id, order.queueNumber)}
                        style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>✕ Batalkan</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handlePlayChime(order.queueNumber)}
                      style={[styles.testSoundBtn, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }]}>
                      <Text style={[styles.testSoundBtnText, { color: activeTheme.primaryDark }]}>
                        🔔 Panggil
                      </Text>
                    </TouchableOpacity>
                  </View>
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
    lineHeight: 18,
  },
  chimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  chimeIcon: {
    fontSize: 20,
  },
  chimeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
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
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginTop: 20,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  readyBannerIcon: {
    fontSize: 22,
  },
  readyBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#15803d',
  },
  readyBannerDesc: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
  },
  chimeBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chimeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  queueLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  queueNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  queueNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  livePulsePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  livePulseText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
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
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: '#059669',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stepCircleCurrent: {
    borderWidth: 2.5,
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
  stepLabelCurrent: {
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#1e293b',
    fontWeight: '700',
  },
  ticketPerforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -16,
  },
  notchLeft: {
    width: 12,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: '#e2e8f0',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  notchRight: {
    width: 12,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: '#e2e8f0',
  },
  metaGrid: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '700',
  },
  barcodeStrip: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 2,
  },
  barcodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  barcodeSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTextName: {
    fontSize: 12,
    color: '#1e293b',
  },
  itemNoteText: {
    fontSize: 11,
    color: '#b45309',
    fontStyle: 'italic',
    marginTop: 1,
  },
  itemTextPrice: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
  },
  footerActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cancelBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
  testSoundBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  testSoundBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
