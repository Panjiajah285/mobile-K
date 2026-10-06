import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useCanteen } from '@/context/CanteenContext';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const { login } = useCanteen();
  const [selectedRole, setSelectedRole] = useState<'siswa' | 'pengelola'>('siswa');
  
  // Form State for Siswa (Nama & NIM)
  const [namaSiswa, setNamaSiswa] = useState('');
  const [nimSiswa, setNimSiswa] = useState('');

  // Form State for Pengelola (Nama & Password)
  const [namaPengelola, setNamaPengelola] = useState('');
  const [passwordPengelola, setPasswordPengelola] = useState('');

  const handleLogin = (demoRole?: 'siswa' | 'pengelola') => {
    const roleToUse = demoRole || selectedRole;

    if (roleToUse === 'siswa') {
      const finalNama = namaSiswa.trim() || 'Natania Oktaviani';
      const finalNim = nimSiswa.trim() || '202610192';
      login(finalNama, finalNim, 'siswa');
    } else {
      const finalNama = namaPengelola.trim() || 'Bu Siti (Dapur Bu Siti)';
      const finalPass = passwordPengelola || '123456';
      login(finalNama, finalPass, 'pengelola');
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚡ Login SmartCanteen</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Role Switcher Tabs */}
          <View style={styles.roleTabContainer}>
            <TouchableOpacity
              onPress={() => setSelectedRole('siswa')}
              style={[styles.roleTab, selectedRole === 'siswa' && styles.roleTabActive]}>
              <Text style={[styles.roleTabText, selectedRole === 'siswa' && styles.roleTabTextActive]}>
                🎓 Login Siswa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRole('pengelola')}
              style={[styles.roleTab, selectedRole === 'pengelola' && styles.roleTabActive]}>
              <Text style={[styles.roleTabText, selectedRole === 'pengelola' && styles.roleTabTextActive]}>
                👨‍🍳 Login Pengelola
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORM LOGIN SISWA (NAMA & NIM) */}
          {selectedRole === 'siswa' ? (
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nama Lengkap Siswa 🎓</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Natania Oktaviani"
                  value={namaSiswa}
                  onChangeText={setNamaSiswa}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>NIM / NISN Siswa 🆔</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 202610192"
                  keyboardType="numeric"
                  value={nimSiswa}
                  onChangeText={setNimSiswa}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          ) : (
            /* FORM LOGIN PENGELOLA KANTIN (NAMA & PASSWORD) */
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nama Pengelola / Nama Stan Kantin 👨‍🍳</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Bu Siti (Stan 1)"
                  value={namaPengelola}
                  onChangeText={setNamaPengelola}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password Pengelola 🔑</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password..."
                  secureTextEntry
                  value={passwordPengelola}
                  onChangeText={setPasswordPengelola}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={() => handleLogin()} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>
              Masuk Sebagai {selectedRole === 'siswa' ? 'Siswa' : 'Pengelola'} ➔
            </Text>
          </TouchableOpacity>

          {/* Demo Instant Login Section */}
          <View style={styles.dividerBox}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU LOG MASUK INSTAN DEMO</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              onPress={() => handleLogin('siswa')}
              style={[styles.demoBtn, { backgroundColor: '#ecfdf5', borderColor: '#10b981' }]}>
              <Text style={[styles.demoBtnText, { color: '#047857' }]}>
                🎓 Demo Siswa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleLogin('pengelola')}
              style={[styles.demoBtn, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}>
              <Text style={[styles.demoBtnText, { color: '#1d4ed8' }]}>
                👨‍🍳 Demo Pengelola
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#0f172a',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
