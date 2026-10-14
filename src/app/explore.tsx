import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { MaxContentWidth } from '@/constants/theme';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>PUSAT BANTUAN & INFORMASI</Text>
            </View>
            <Text style={styles.title}>Panduan SmartCanteen ℹ️</Text>
            <Text style={styles.subtitle}>
              Informasi lengkap seputar pemesanan pre-order, pengambilan di stan, dan pengisian saldo kartu siswa.
            </Text>
          </View>

          {/* Quick Info Grid */}
          <View style={styles.quickGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoTitle}>Jam Istirahat</Text>
              <Text style={styles.infoDesc}>Istirahat 1: 09.45 - 10.15{'\n'}Istirahat 2: 12.00 - 12.30</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💳</Text>
              <Text style={styles.infoTitle}>SmartPay RFID</Text>
              <Text style={styles.infoDesc}>Kartu pintar siswa untuk transaksi cepat tanpa uang kembalian.</Text>
            </View>
          </View>

          {/* FAQ Sections */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pertanyaan yang Sering Diajukan (FAQ)</Text>
          </View>

          <View style={styles.faqWrapper}>
            <Collapsible title="Bagaimana cara memesan sebelum jam istirahat?">
              <ThemedView type="backgroundElement" style={styles.collapsibleBox}>
                <ThemedText type="small">
                  1. Masuk ke tab <ThemedText type="smallBold">🍱 Menu</ThemedText>.{'\n'}
                  2. Pilih makanan atau minuman favorit Anda.{'\n'}
                  3. Klik <ThemedText type="smallBold">+ Pesan</ThemedText> dan buka keranjang belanja.{'\n'}
                  4. Tambahkan catatan bila ada permintaan khusus (misal: "tidak pedas").{'\n'}
                  5. Pilih jam istirahat pengambilan dan konfirmasi pesanan.{'\n'}
                  6. Pantau status pembuatan di tab <ThemedText type="smallBold">📋 Status Antrean</ThemedText>.
                </ThemedText>
              </ThemedView>
            </Collapsible>

            <Collapsible title="Bagaimana cara mengisi saldo SmartPay?">
              <ThemedView type="backgroundElement" style={styles.collapsibleBox}>
                <ThemedText type="small">
                  Anda dapat mengisi saldo SmartPay melalui:{'\n'}
                  • <ThemedText type="smallBold">QRIS Sekolah Digital:</ThemedText> Buka aplikasi e-wallet / mobile banking lalu scan kode QR di modal "Isi Saldo". Saldo otomatis bertambah instan tanpa biaya admin.{'\n'}
                  • <ThemedText type="smallBold">Kasir Kantin & Koperasi:</ThemedText> Kunjungi kasir sekolah dan sebutkan NISN/NIM Anda untuk setor tunai.
                </ThemedText>
              </ThemedView>
            </Collapsible>

            <Collapsible title="Kapan makanan saya siap diambil?">
              <ThemedView type="backgroundElement" style={styles.collapsibleBox}>
                <ThemedText type="small">
                  Setelah dapur menyelesaikan pesanan, status pesanan di tab Antrean akan berubah menjadi{' '}
                  <ThemedText type="smallBold" style={{ color: '#059669' }}>
                    "🔔 SIAP DIAMBIL DI STAN"
                  </ThemedText>
                  . Tunjukkan Nomor Antrean (contoh: A-024) ke petugas stan untuk mengambil makanan Anda.
                </ThemedText>
              </ThemedView>
            </Collapsible>

            <Collapsible title="Apakah pesanan bisa dibatalkan?">
              <ThemedView type="backgroundElement" style={styles.collapsibleBox}>
                <ThemedText type="small">
                  Ya! Pesanan dapat dibatalkan selama statusnya masih{' '}
                  <ThemedText type="smallBold">"⏳ Menunggu"</ThemedText> (belum mulai dimasak oleh stan). 
                  Jika Anda menggunakan metode pembayaran SmartPay, saldo akan otomatis dikembalikan 100% ke akun Anda.
                </ThemedText>
              </ThemedView>
            </Collapsible>

            <Collapsible title="Bagaimana stan kantin menerima pesanan?">
              <ThemedView type="backgroundElement" style={styles.collapsibleBox}>
                <ThemedText type="small">
                  Pemilik stan masuk melalui login <ThemedText type="smallBold">👨‍🍳 Mode Pengelola</ThemedText>. Di dashboard stan, pesanan masuk secara real-time disertai rincian pesanan dan catatan siswa. Petugas dapat menekan "Mulai Masak" lalu "Panggil Siswa" ketika makanan siap.
                </ThemedText>
              </ThemedView>
            </Collapsible>
          </View>

          {/* Contact Box */}
          <View style={styles.contactCard}>
            <Text style={styles.contactIcon}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Pusat Pengaduan & Layanan Kantin</Text>
              <Text style={styles.contactDesc}>
                Ada kendala menu, saldo, atau higienitas makanan? Laporkan langsung ke Kantor Koperasi Sekolah atau Pengawas Kantin Sehat.
              </Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  badgeRow: {
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  faqWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  collapsibleBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: '#f8fafc',
  },
  contactCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    fontSize: 28,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065f46',
  },
  contactDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
});
