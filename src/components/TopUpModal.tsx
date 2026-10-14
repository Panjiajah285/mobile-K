import { useCanteen } from '@/context/CanteenContext';
import React, { useState } from 'react';
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

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [
  { amount: 10000, label: 'Rp 10.000' },
  { amount: 20000, label: 'Rp 20.000' },
  { amount: 50000, label: 'Rp 50.000', badge: 'Populer ⭐' },
  { amount: 100000, label: 'Rp 100.000' },
];

const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS Sekolah Digital', icon: '📱', desc: 'Bebas biaya admin, verifikasi instan' },
  { id: 'kasir', name: 'Tunai di Kasir Kantin / Koperasi', icon: '🏫', desc: 'Bayar tunai ke petugas' },
  { id: 'va', name: 'Virtual Account Bank Siswa', icon: '🏦', desc: 'BCA, Mandiri, BRI, BNI' },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({ visible, onClose }) => {
  const { balance, topUpBalance, user } = useCanteen();
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const finalAmount = customAmount ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0 : selectedAmount;

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (text: string) => {
    const numeric = text.replace(/\D/g, '');
    setCustomAmount(numeric);
    if (numeric) {
      setSelectedAmount(0);
    }
  };

  const handleConfirmTopUp = () => {
    if (finalAmount < 5000) {
      const msg = 'Minimal isi saldo adalah Rp 5.000';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Nominal Tidak Valid', msg);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const success = topUpBalance(
        finalAmount,
        PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name || 'QRIS Sekolah'
      );

      setIsProcessing(false);

      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1600);
      }
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>⚡ Top Up Saldo SmartPay</Text>
              <Text style={styles.headerSubtitle}>
                Kartu Digital {user?.name || 'Siswa'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={styles.successTitle}>Top Up Berhasil!</Text>
              <Text style={styles.successAmount}>+ Rp {finalAmount.toLocaleString('id-ID')}</Text>
              <Text style={styles.successSubtitle}>
                Saldo baru Anda sekarang Rp {(balance).toLocaleString('id-ID')}
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
              {/* Current Balance Banner */}
              <View style={styles.balanceCard}>
                <View>
                  <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
                  <Text style={styles.balanceValue}>Rp {balance.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.cardChip}>
                  <Text style={styles.cardChipText}>💳 NFC RFID</Text>
                </View>
              </View>

              {/* Preset Nominal Grid */}
              <Text style={styles.sectionHeading}>Pilih Nominal Top Up 💰</Text>
              <View style={styles.presetGrid}>
                {PRESET_AMOUNTS.map((item) => {
                  const isSelected = selectedAmount === item.amount && !customAmount;
                  return (
                    <TouchableOpacity
                      key={item.amount}
                      onPress={() => handleSelectPreset(item.amount)}
                      style={[styles.presetBtn, isSelected && styles.presetBtnActive]}>
                      {item.badge && (
                        <View style={styles.presetBadge}>
                          <Text style={styles.presetBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Text style={[styles.presetBtnText, isSelected && styles.presetBtnTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Nominal Input */}
              <View style={styles.customInputGroup}>
                <Text style={styles.inputPrefix}>Rp</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="Atau ketik nominal lainnya (contoh: 25000)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={handleCustomChange}
                />
              </View>

              {/* Payment Methods */}
              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Metode Pembayaran 🔒</Text>
              <View style={styles.methodsList}>
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id)}
                      style={[styles.methodCard, isSelected && styles.methodCardActive]}>
                      <Text style={styles.methodIcon}>{method.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.methodName, isSelected && styles.methodNameActive]}>
                          {method.name}
                        </Text>
                        <Text style={styles.methodDesc}>{method.desc}</Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* QRIS Simulated Preview Card */}
              {selectedMethod === 'qris' && (
                <View style={styles.qrisPreview}>
                  <View style={styles.qrisHeader}>
                    <Text style={styles.qrisTag}>QRIS Standar Nasional</Text>
                    <Text style={styles.qrisIssuer}>SmartCanteen Pay</Text>
                  </View>
                  <View style={styles.qrMockBox}>
                    <Text style={styles.qrMockSymbol}>⬛⬜⬛⬜⬛</Text>
                    <Text style={styles.qrMockSymbol}>⬜⬛⬜⬛⬜</Text>
                    <Text style={styles.qrMockSymbol}>⬛⬜⬛⬜⬛</Text>
                  </View>
                  <Text style={styles.qrisHint}>
                    Verifikasi instan via GoPay, OVO, Dana, ShopeePay, BCA Mobile & Livin
                  </Text>
                </View>
              )}

              {/* Summary */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nominal Isi Saldo</Text>
                  <Text style={styles.summaryVal}>Rp {finalAmount.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Biaya Layanan Siswa</Text>
                  <Text style={[styles.summaryVal, { color: '#059669' }]}>Gratis (Rp 0)</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 4 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#0f172a' }]}>Total Transfer</Text>
                  <Text style={[styles.summaryVal, { fontSize: 16, fontWeight: '800', color: '#059669' }]}>
                    Rp {finalAmount.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                disabled={isProcessing || finalAmount < 5000}
                onPress={handleConfirmTopUp}
                style={[
                  styles.confirmBtn,
                  (isProcessing || finalAmount < 5000) && styles.confirmBtnDisabled,
                ]}>
                <Text style={styles.confirmBtnText}>
                  {isProcessing ? 'Memproses Pengisian...' : `⚡ Bayar & Isi Rp ${finalAmount.toLocaleString('id-ID')}`}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 16 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  body: {
    flexGrow: 1,
  },
  balanceCard: {
    backgroundColor: '#047857',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cardChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  presetBtn: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
  },
  presetBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  presetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  presetBtnTextActive: {
    color: '#047857',
  },
  presetBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  presetBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  customInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  methodsList: {
    gap: 8,
    marginBottom: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  methodCardActive: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  methodIcon: {
    fontSize: 22,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  methodNameActive: {
    color: '#065f46',
  },
  methodDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#059669',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  qrisPreview: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  qrisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  qrisTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  qrisIssuer: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#047857',
  },
  qrMockBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  qrMockSymbol: {
    fontSize: 16,
    letterSpacing: 4,
  },
  qrisHint: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  confirmBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
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
  successContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  successIcon: {
    fontSize: 54,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#047857',
  },
  successAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
});
