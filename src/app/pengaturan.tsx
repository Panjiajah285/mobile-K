import { JwtTokenInspectorModal } from '@/components/JwtTokenInspectorModal';
import { LoginModal } from '@/components/LoginModal';
import { useCanteen } from '@/context/CanteenContext';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PengaturanScreen() {
  const { user, role, token, updateProfile, updatePassword, logout } = useCanteen();

  const [activeTab, setActiveTab] = useState<'profil' | 'sandi' | 'preferensi'>('profil');
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form State Siswa / Mahasiswa
  const [namaSiswa, setNamaSiswa] = useState('');
  const [nimSiswa, setNimSiswa] = useState('');
  const [kelasJurusan, setKelasJurusan] = useState('');
  const [phoneSiswa, setPhoneSiswa] = useState('');
  const [emailSiswa, setEmailSiswa] = useState('');

  // Form State Pengelola
  const [namaPengelola, setNamaPengelola] = useState('');
  const [stanName, setStanName] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [phoneStan, setPhoneStan] = useState('');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences State
  const [dietaryPref, setDietaryPref] = useState('Pedas Sedang 🌶️');
  const [allergiesText, setAllergiesText] = useState('Tidak Ada Alergi');
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Success Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'siswa') {
        setNamaSiswa(user.name || '');
        setNimSiswa(user.nim || user.username || '');
        setKelasJurusan(user.majorOrClass || 'Kelas XII MIPA 2');
        setPhoneSiswa(user.phone || '0812-9876-5432');
        setEmailSiswa(user.email || 'natania.oktaviani@sekolah.sch.id');
        setDietaryPref(user.dietaryPreference || 'Pedas Sedang 🌶️');
        setAllergiesText(user.allergies || 'Tidak Ada Alergi');
        setSoundAlerts(user.soundAlerts !== false);
      } else {
        setNamaPengelola(user.name || '');
        setStanName(user.stanName || user.detail || 'Stan 1 - Dapur Bu Siti');
        setOperatingHours(user.operatingHours || '07.30 - 15.30 WIB');
        setPhoneStan(user.phone || '0813-8888-9999');
      }
    }
  }, [user]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (user?.role === 'siswa') {
      if (!namaSiswa.trim() || !nimSiswa.trim()) {
        const err = 'Nama lengkap dan NIM mahasiswa tidak boleh kosong!';
        if (Platform.OS === 'web') alert(err);
        else Alert.alert('Validasi Gagal', err);
        return;
      }

      const ok = await updateProfile({
        name: namaSiswa.trim(),
        nim: nimSiswa.trim(),
        username: nimSiswa.trim(),
        majorOrClass: kelasJurusan.trim(),
        phone: phoneSiswa.trim(),
        email: emailSiswa.trim(),
        dietaryPreference: dietaryPref,
        allergies: allergiesText,
        soundAlerts,
      });

      if (ok) {
        showToast('✓ Profil mahasiswa berhasil diperbarui!');
        const msg = 'Profil mahasiswa & payload JWT token berhasil diperbarui!';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Profil Tersimpan', msg);
      }
    } else {
      if (!namaPengelola.trim() || !stanName.trim()) {
        const err = 'Nama pengelola dan nama stan tidak boleh kosong!';
        if (Platform.OS === 'web') alert(err);
        else Alert.alert('Validasi Gagal', err);
        return;
      }

      const ok = await updateProfile({
        name: namaPengelola.trim(),
        stanName: stanName.trim(),
        operatingHours: operatingHours.trim(),
        phone: phoneStan.trim(),
      });

      if (ok) {
        showToast('✓ Profil pengelola kantin berhasil diperbarui!');
        const msg = 'Profil stan kantin & token JWT berhasil diperbarui!';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Profil Tersimpan', msg);
      }
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      const err = 'Kata sandi baru minimal harus 6 karakter!';
      if (Platform.OS === 'web') alert(err);
      else Alert.alert('Kata Sandi Lemah', err);
      return;
    }

    if (newPassword !== confirmPassword) {
      const err = 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru!';
      if (Platform.OS === 'web') alert(err);
      else Alert.alert('Kata Sandi Tidak Cocok', err);
      return;
    }

    const res = await updatePassword(oldPassword, newPassword);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('✓ ' + res.message);
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Berhasil 🔒', res.message);
    } else {
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Gagal', res.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    const msg = 'Anda berhasil logout. Token JWT lama telah dicabut dan token sesi baru telah direfresh.';
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Logout & Refresh Token 🔄', msg);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarIcon}>
                {user ? (user.role === 'siswa' ? '🎓' : '👨‍🍳') : '👤'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.profileName}>{user ? user.name : 'Pengunjung Tamu'}</Text>
              </View>
              <Text style={styles.profileDetail}>{user ? user.detail : 'Silakan masuk ke akun Anda'}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {user ? (user.role === 'siswa' ? '🎓 MAHASISWA / SISWA' : '👨‍🍳 PENGELOLA KANTIN') : 'TAMU'}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setIsJwtModalOpen(true)} style={styles.jwtStatusChip}>
                  <Text style={styles.jwtStatusChipText}>🔑 JWT ● Aktif</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Action Switch Account */}
          <View style={styles.profileTopActions}>
            <TouchableOpacity onPress={() => setIsLoginModalOpen(true)} style={styles.switchLoginBtn}>
              <Text style={styles.switchLoginBtnText}>🔄 Ganti Akun / Role</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout & Refresh 🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <View
            style={[
              styles.feedbackBanner,
              feedbackMsg.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
            ]}>
            <Text style={styles.feedbackBannerText}>{feedbackMsg.text}</Text>
          </View>
        )}

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('profil')}
            style={[styles.tabBtn, activeTab === 'profil' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'profil' && styles.tabBtnTextActive]}>
              👤 Profil Saya
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('sandi')}
            style={[styles.tabBtn, activeTab === 'sandi' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'sandi' && styles.tabBtnTextActive]}>
              🔐 Kata Sandi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('preferensi')}
            style={[styles.tabBtn, activeTab === 'preferensi' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'preferensi' && styles.tabBtnTextActive]}>
              ⚙️ Preferensi
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: FORM UBAH PROFIL */}
        {activeTab === 'profil' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {user?.role === 'siswa' ? '✏️ Ubah Profil Mahasiswa / Siswa' : '✏️ Ubah Profil Stan & Pengelola'}
              </Text>
              <Text style={styles.sectionSubtitle}>Data ini otomatis sinkron dengan pesanan dan token JWT Anda</Text>
            </View>

            {user?.role === 'siswa' ? (
              /* FORM MAHASISWA */
              <View style={styles.formWrapper}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Lengkap Mahasiswa *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Natania Oktaviani"
                    placeholderTextColor="#94a3b8"
                    value={namaSiswa}
                    onChangeText={setNamaSiswa}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>NIM / NISN Mahasiswa *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 202610192"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={nimSiswa}
                    onChangeText={setNimSiswa}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Kelas / Program Studi Jurusan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Kelas XII MIPA 2 / S1 Informatika"
                    placeholderTextColor="#94a3b8"
                    value={kelasJurusan}
                    onChangeText={setKelasJurusan}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nomor WhatsApp / HP (Notifikasi Pesanan)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0812-9876-5432"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phoneSiswa}
                    onChangeText={setPhoneSiswa}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Alamat Email Kampus / Sekolah</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="nama.nim@sekolah.sch.id"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    value={emailSiswa}
                    onChangeText={setEmailSiswa}
                  />
                </View>
              </View>
            ) : (
              /* FORM PENGELOLA KANTIN */
              <View style={styles.formWrapper}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Pengelola / Penanggung Jawab Stan *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Bu Siti Rohmah"
                    placeholderTextColor="#94a3b8"
                    value={namaPengelola}
                    onChangeText={setNamaPengelola}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Stan / Usaha Kantin *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Stan 1 - Dapur Bu Siti"
                    placeholderTextColor="#94a3b8"
                    value={stanName}
                    onChangeText={setStanName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Jam Operasional Stan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 07.30 - 15.30 WIB"
                    placeholderTextColor="#94a3b8"
                    value={operatingHours}
                    onChangeText={setOperatingHours}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nomor WhatsApp Layanan Stan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0813-8888-9999"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phoneStan}
                    onChangeText={setPhoneStan}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity onPress={handleSaveProfile} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>✓ Simpan Perubahan Profil</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: FORM UBAH KATA SANDI */}
        {activeTab === 'sandi' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>🔒 Ubah Kata Sandi Akun</Text>
              <Text style={styles.sectionSubtitle}>Gunakan kata sandi yang kuat untuk melindungi akun dan saldo SmartPay Anda</Text>
            </View>

            <View style={styles.formWrapper}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kata Sandi Saat Ini</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kata sandi lama Anda..."
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kata Sandi Baru (Min. 6 Karakter) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ketik kata sandi baru..."
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Konfirmasi Kata Sandi Baru *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi kata sandi baru..."
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <View style={styles.passwordTipBox}>
                <Text style={styles.passwordTipTitle}>💡 Tips Keamanan Kata Sandi:</Text>
                <Text style={styles.passwordTipItem}>• Kombinasikan huruf besar, angka, dan simbol.</Text>
                <Text style={styles.passwordTipItem}>• Jangan berikan kata sandi atau kode QRIS kepada siapapun.</Text>
              </View>

              <TouchableOpacity onPress={handleSavePassword} style={[styles.submitBtn, { backgroundColor: '#2563eb' }]}>
                <Text style={styles.submitBtnText}>🔐 Perbarui Kata Sandi Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: PREFERENSI & NOTIFIKASI */}
        {activeTab === 'preferensi' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>⚙️ Preferensi Makanan & Notifikasi</Text>
              <Text style={styles.sectionSubtitle}>Kustomisasi pengalaman kantin Anda sesuai selera dan kebutuhan</Text>
            </View>

            <View style={styles.formWrapper}>
              {/* Preferensi Rasa */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Preferensi Tingkat Rasa Utama</Text>
                <View style={styles.tasteOptionsGrid}>
                  {['Pedas Sedang 🌶️', 'Super Pedas 🔥', 'Tidak Pedas 🍲', 'Manis Gurih 🍯', 'Rendah Kalori 🥗'].map((pref) => (
                    <TouchableOpacity
                      key={pref}
                      onPress={() => setDietaryPref(pref)}
                      style={[styles.tasteChip, dietaryPref === pref && styles.tasteChipActive]}>
                      <Text style={[styles.tasteChipText, dietaryPref === pref && styles.tasteChipTextActive]}>
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Alergi & Pantangan */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Catatan Alergi / Pantangan Makanan</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Alergi seafood, tidak makan kacang, vegetarian..."
                  placeholderTextColor="#94a3b8"
                  value={allergiesText}
                  onChangeText={setAllergiesText}
                />
              </View>

              {/* Toggle Suara */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchTitle}>🔔 Bunyi Notifikasi Suara</Text>
                  <Text style={styles.switchDesc}>Bunyikan nada dering ketika pesanan Anda selesai dimasak di stan.</Text>
                </View>
                <Switch
                  value={soundAlerts}
                  onValueChange={setSoundAlerts}
                  trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                  thumbColor="#ffffff"
                />
              </View>

              <TouchableOpacity onPress={handleSaveProfile} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>✓ Simpan Preferensi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Keamanan & JWT Token Information Box */}
        <View style={styles.securityBox}>
          <View style={styles.securityHeader}>
            <Text style={styles.securityTitle}>🛡️ Sistem Keamanan & Token JWT</Text>
            <TouchableOpacity onPress={() => setIsJwtModalOpen(true)} style={styles.inspectMiniBtn}>
              <Text style={styles.inspectMiniBtnText}>Buka Inspector ➔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.securityDesc}>
            Aplikasi dilindungi dengan protokol otentikasi token JWT standar RFC 7519. Token aktif secara otomatis disisipkan ke header Bearer setiap mengakses API menu, login, dan pembaruan profil.
          </Text>

          <View style={styles.tokenDisplayCard}>
            <Text style={styles.tokenDisplayLabel}>Token JWT Aktif:</Text>
            <Text style={styles.tokenDisplayText} numberOfLines={2}>
              {token || 'Tidak ada token aktif'}
            </Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Login Modal */}
      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* JWT Token Inspector */}
      <JwtTokenInspectorModal
        visible={isJwtModalOpen}
        onClose={() => setIsJwtModalOpen(false)}
      />
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
    gap: 14,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  avatarIcon: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  profileDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  jwtStatusChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jwtStatusChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
  },
  profileTopActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  switchLoginBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLoginBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  feedbackError: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  feedbackBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#047857',
    fontWeight: '900',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  sectionTitleRow: {
    gap: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  formWrapper: {
    gap: 12,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  tasteOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tasteChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tasteChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  tasteChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tasteChipTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  switchDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  passwordTipBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 4,
  },
  passwordTipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  passwordTipItem: {
    fontSize: 11,
    color: '#1e40af',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  securityBox: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  inspectMiniBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inspectMiniBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  securityDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  tokenDisplayCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tokenDisplayLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  tokenDisplayText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#38bdf8',
    marginTop: 2,
  },
});
