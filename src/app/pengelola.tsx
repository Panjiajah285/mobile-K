import { LoginModal } from '@/components/LoginModal';
import { useCanteen } from '@/context/CanteenContext';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PengelolaScreen() {
  const { user, role, orders, menu, updateOrderStatus, updateStock } = useCanteen();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isPengelola = user && user.role === 'pengelola';

  const totalOmset = orders
    .filter((o) => o.status === 'selesai' || o.status === 'siap' || o.status === 'diproses')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan');

  if (!isPengelola) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedBox}>
          <Text style={styles.restrictedIcon}>🔒</Text>
          <Text style={styles.restrictedTitle}>Akses Khusus Pengelola Kantin</Text>
          <Text style={styles.restrictedSubtitle}>
            Anda saat ini terhubung sebagai {user ? user.name : 'Tamu'} ({role.toUpperCase()}).
            Silakan login sebagai Pengelola Kantin untuk mengelola pesanan & stok.
          </Text>

          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.loginPengelolaBtn}>
            <Text style={styles.loginPengelolaBtnText}>👨‍🍳 Login Sebagai Pengelola Kantin</Text>
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
            <Text style={styles.title}>Dashboard Pengelola Kantin 👨‍🍳</Text>
            <Text style={styles.subtitle}>Selamat datang, {user.name} ({user.detail})</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsLoginModalOpen(true)}
            style={styles.switchAccountBtn}>
            <Text style={styles.switchAccountBtnText}>🔄 Ganti Login</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <Text style={styles.metricLabel}>Total Omset Hari Ini</Text>
            <Text style={[styles.metricValue, { color: '#047857' }]}>
              Rp {totalOmset.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <Text style={styles.metricLabel}>Pesanan Aktif</Text>
            <Text style={[styles.metricValue, { color: '#1d4ed8' }]}>
              {activeOrders.length} Pesanan
            </Text>
          </View>
        </View>

        {/* Orders Section */}
        <Text style={styles.sectionTitle}>Pesanan Masuk Real-Time 📥</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada pesanan masuk saat ini.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.studentName}>
                    {order.queueNumber} - {order.studentName} ({order.studentClass})
                  </Text>
                  <Text style={styles.orderMeta}>
                    {order.pickupSlot} • {order.paymentMethod}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {order.items.map((item, i) => (
                  <Text key={i} style={styles.itemText}>
                    • {item.name} x{item.qty} {item.note ? `(Catatan: ${item.note})` : ''}
                  </Text>
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
                    <Text style={styles.actionBtnText}>✅ Tandai Siap Diambil</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'siap' && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, 'selesai')}
                    style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.actionBtnText}>✔️ Diserahkan ke Siswa (Selesai)</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'selesai' && (
                  <Text style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>
                    Pesanan telah diselesaikan.
                  </Text>
                )}
              </View>
            </View>
          ))
        )}

        {/* Stock Management Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Manajemen Stok Menu Kantin 📦</Text>

        <View style={styles.stockList}>
          {menu.map((item) => (
            <View key={item.id} style={styles.stockCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockItemTitle}>{item.name}</Text>
                <Text style={styles.stockItemStan}>{item.stan}</Text>
                <Text style={styles.stockItemCount}>
                  Stok Saat Ini: <Text style={{ fontWeight: 'bold' }}>{item.stock}</Text> / Initial: {item.initialStock}
                </Text>
              </View>

              <View style={styles.stockControls}>
                <TouchableOpacity
                  onPress={() => updateStock(item.id, -1)}
                  style={styles.stockBtn}>
                  <Text style={styles.stockBtnText}>-</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateStock(item.id, 5)}
                  style={[styles.stockBtn, { backgroundColor: '#10b981' }]}>
                  <Text style={[styles.stockBtnText, { color: '#ffffff' }]}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#059669',
    marginTop: 2,
    fontWeight: '600',
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
    fontWeight: 'bold',
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
    fontWeight: '800',
    color: '#0f172a',
  },
  restrictedSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginPengelolaBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  loginPengelolaBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#475569',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  orderMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  itemsList: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stockList: {
    gap: 10,
  },
  stockCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  stockItemStan: {
    fontSize: 12,
    color: '#10b981',
  },
  stockItemCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  stockControls: {
    flexDirection: 'row',
    gap: 8,
  },
  stockBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});
