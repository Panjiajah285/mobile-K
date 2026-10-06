import { useCanteen } from '@/context/CanteenContext';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AntreanScreen() {
  const { orders } = useCanteen();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'siap':
        return { bg: '#dcfce7', text: '#156280ff', label: '✅ Siap Diambil di Stan' };
      case 'diproses':
        return { bg: '#fef3c7', text: '#b45309', label: '🍳 Sedang Dimasak / Diproses' };
      case 'menunggu':
        return { bg: '#e0f2fe', text: '#0369a1', label: '⏳ Menunggu Antrean' };
      case 'selesai':
        return { bg: '#f1f5f9', text: '#64748b', label: '✔️ Selesai (Sudah Diambil)' };
      default:
        return { bg: '#fee2e2', text: '#b91c1c', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Status Antrean Kantin 📋</Text>
          <Text style={styles.subtitle}>
            Pantau status pemesanan dan nomor antrean secara real-time
          </Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Belum Ada Pesanan Active</Text>
            <Text style={styles.emptyText}>
              Pesan makanan di menu Katalog Pre-Order untuk mendapatkan nomor antrean.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusStyle(order.status);
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.queueLabel}>Nomor Antrean</Text>
                    <Text style={styles.queueNumber}>{order.queueNumber}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.text }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.studentInfo}>
                  👤 {order.studentName} ({order.studentClass})
                </Text>
                <Text style={styles.metaText}>⏱️ Slot: {order.pickupSlot}</Text>
                <Text style={styles.metaText}>💳 Pembayaran: {order.paymentMethod}</Text>

                <View style={styles.itemsBox}>
                  <Text style={styles.itemsTitle}>Rincian Pesanan:</Text>
                  {order.items.map((item, idx) => (
                    <Text key={idx} style={styles.itemRow}>
                      • {item.name} x{item.qty} (Rp {(item.price * item.qty).toLocaleString('id-ID')})
                    </Text>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Total Pembayaran:</Text>
                  <Text style={styles.totalValue}>Rp {order.totalAmount.toLocaleString('id-ID')}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
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
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  queueNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  studentInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  itemsBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    gap: 4,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 2,
  },
  itemRow: {
    fontSize: 13,
    color: '#334155',
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
    fontSize: 13,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
});
