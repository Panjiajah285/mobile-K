import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME_PRESETS } from '@/constants/theme';
import { useCanteen } from '@/context/CanteenContext';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { themePreset, setThemePreset, activeTheme } = useCanteen();

  const presetsList = Object.values(THEME_PRESETS);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>🎨 Pilih Tema Warna Aplikasi</Text>
              <Text style={styles.headerSubtitle}>
                Ubah suasana visual SmartCanteen agar lebih segar & tidak bosan
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.presetGrid}>
            {presetsList.map((preset) => {
              const isSelected = themePreset === preset.id;

              return (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => {
                    setThemePreset(preset.id);
                  }}
                  style={[
                    styles.presetCard,
                    isSelected && {
                      borderColor: preset.primary,
                      backgroundColor: preset.primarySoft,
                    },
                  ]}>
                  {/* Color Swatch Circles */}
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatchCircle, { backgroundColor: preset.primary }]} />
                    <View style={[styles.swatchCircle, { backgroundColor: preset.accent }]} />
                    <Text style={styles.presetIcon}>{preset.icon}</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.presetName,
                          isSelected && { color: preset.primaryDark, fontWeight: '900' },
                        ]}>
                        {preset.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.activePill, { backgroundColor: preset.primary }]}>
                          <Text style={styles.activePillText}>✓ Aktif</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.presetTagline}>{preset.tagline}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.applyBtn, { backgroundColor: activeTheme.primary }]}>
            <Text style={styles.applyBtnText}>Terapkan & Lanjutkan ✨</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    maxWidth: 320,
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
    fontSize: 14,
    color: '#64748b',
    fontWeight: 'bold',
  },
  presetGrid: {
    gap: 10,
    marginBottom: 18,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -6,
  },
  swatchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  presetIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  presetTagline: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  applyBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
