import { JwtTokenInspectorModal } from '@/components/JwtTokenInspectorModal';
import { LoginModal } from '@/components/LoginModal';
import { THEME_PRESETS } from '@/constants/theme';
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

const AVATAR_OPTIONS = [
  { id: '🎓', label: 'Siswa Pintar' },
  { id: '🧑‍💻', label: 'Tech Cerdas' },
  { id: '🌸', label: 'Ceria Aktif' },
  { id: '⚡', label: 'Bintang Prestasi' },
  { id: '🦁', label: 'Juara Kampus' },
  { id: '👨‍🍳', label: 'Koki Handal' },
];

export default function PengaturanScreen() {
  const { user, token, updateProfile, updatePassword, logout, activeTheme, themePreset, setThemePreset } = useCanteen();

  const [activeTab, setActiveTab] = useState<'profil' | 'tema' | 'sandi' | 'preferensi'>('profil');
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form State Siswa / Mahasiswa
  const [namaSiswa, setNamaSiswa] = useState('');
  const [nimSiswa, setNimSiswa] = useState('');
  const [kelasJurusan, setKelasJurusan] = useState('');
  const [phoneSiswa, setPhoneSiswa] = useState('');
  const [emailSiswa, setEmailSiswa] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');

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
      // Reinitialize editable form fields when the logged-in profile changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedAvatar(user.avatar || (user.role === 'siswa' ? '🎓' : '👨‍🍳'));
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

  const handleSelectAvatar = async (avatarChar: string) => {
    setSelectedAvatar(avatarChar);
    await updateProfile({ avatar: avatarChar });
    showToast(`✓ Avatar profil diubah menjadi ${avatarChar}`);
  };

  const handleSaveProfile = async () => {
    if (user?.role === 'siswa') {
      if (!namaSiswa.trim() || !nimSiswa.trim()) {
        const err = 'Nama lengkap dan NIM siswa tidak boleh kosong!';
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
        avatar: selectedAvatar,
        dietaryPreference: dietaryPref,
        allergies: allergiesText,
        soundAlerts,
      });

      if (ok) {
        showToast('✓ Profil mahasiswa & preferensi berhasil diperbarui!');
        const msg = 'Profil mahasiswa & payload JWT token berhasil diperbarui!';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Profil Tersimpan 🎉', msg);
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
        avatar: selectedAvatar,
      });

      if (ok) {
        showToast('✓ Profil stan kantin berhasil diperbarui!');
        const msg = 'Profil stan kantin & token JWT berhasil diperbarui!';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Profil Tersimpan 🎉', msg);
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

  const themeList = Object.values(THEME_PRESETS);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarBig, { borderColor: activeTheme.primary, backgroundColor: activeTheme.primarySoft }]}>
              <Text style={styles.avatarIcon}>{selectedAvatar}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.profileName}>{user ? user.name : 'Pengunjung Tamu'}</Text>
              </View>
              <Text style={styles.profileDetail}>{user ? user.detail : 'Silakan masuk ke akun Anda'}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { backgroundColor: activeTheme.primarySoft }]}>
                  <Text style={[styles.roleBadgeText, { color: activeTheme.primaryDark }]}>
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
            <Text style={[styles.tabBtnText, activeTab === 'profil' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }]]}>
              👤 Profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('tema')}
            style={[styles.tabBtn, activeTab === 'tema' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'tema' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }]]}>
              🎨 Tema Warna
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('sandi')}
            style={[styles.tabBtn, activeTab === 'sandi' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'sandi' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }]]}>
              🔐 Sandi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('preferensi')}
            style={[styles.tabBtn, activeTab === 'preferensi' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'preferensi' && [styles.tabBtnTextActive, { color: activeTheme.primaryDark }]]}>
              ⚙️ Preferensi
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: FORM UBAH PROFIL */}
        {activeTab === 'profil' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {user?.role === 'siswa' ? '📝 Data Pribadi Siswa / Mahasiswa' : '👨‍🍳 Data Stan Kantin'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Data ini tersimpan aman di aplikasi dan disinkronkan ke dalam klaim JWT Token.
              </Text>
            </View>

            {/* Avatar Selector Row */}
            <View style={styles.avatarSection}>
              <Text style={styles.formLabel}>Pilih Avatar Karakter:</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((av) => (
                  <TouchableOpacity
                    key={av.id}
                    onPress={() => handleSelectAvatar(av.id)}
                    style={[
                      styles.avatarChip,
                      selectedAvatar === av.id && [styles.avatarChipActive, { borderColor: activeTheme.primary, backgroundColor: activeTheme.primarySoft }],
                    ]}>
                    <Text style={styles.avatarChipIcon}>{av.id}</Text>
                    <Text style={styles.avatarChipLabel}>{av.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {user?.role === 'siswa' ? (
              <View style={styles.formWrapper}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Lengkap Siswa *</Text>
                  <TextInput
                    style={styles.input}
                    value={namaSiswa}
                    onChangeText={setNamaSiswa}
                    placeholder="Masukkan nama lengkap..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nomor Induk Mahasiswa (NIM / NISN) *</Text>
                  <TextInput
                    style={styles.input}
                    value={nimSiswa}
                    onChangeText={setNimSiswa}
                    placeholder="Contoh: 202610192"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Kelas / Program Studi</Text>
                  <TextInput
                    style={styles.input}
                    value={kelasJurusan}
                    onChangeText={setKelasJurusan}
                    placeholder="Contoh: Kelas XII MIPA 2 / Teknik Informatika"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nomor WhatsApp / HP</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneSiswa}
                    onChangeText={setPhoneSiswa}
                    placeholder="0812-xxxx-xxxx"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email Sekolah</Text>
                  <TextInput
                    style={styles.input}
                    value={emailSiswa}
                    onChangeText={setEmailSiswa}
                    placeholder="nama@sekolah.sch.id"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.submitBtn, { backgroundColor: activeTheme.primary }]}>
                  <Text style={styles.submitBtnText}>✓ Simpan Perubahan Profil</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formWrapper}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Pemilik / Chef Stan *</Text>
                  <TextInput
                    style={styles.input}
                    value={namaPengelola}
                    onChangeText={setNamaPengelola}
                    placeholder="Nama pemilik stan..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Stan Kantin *</Text>
                  <TextInput
                    style={styles.input}
                    value={stanName}
                    onChangeText={setStanName}
                    placeholder="Contoh: Stan 1 - Dapur Bu Siti"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Jam Operasional Stan</Text>
                  <TextInput
                    style={styles.input}
                    value={operatingHours}
                    onChangeText={setOperatingHours}
                    placeholder="07.30 - 15.30 WIB"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nomor Telepon Stan</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneStan}
                    onChangeText={setPhoneStan}
                    placeholder="0813-xxxx-xxxx"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.submitBtn, { backgroundColor: activeTheme.primary }]}>
                  <Text style={styles.submitBtnText}>✓ Simpan Data Stan Kantin</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: TEMA WARNA DINAMIS */}
        {activeTab === 'tema' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>🎨 Personalisasi Tema Warna</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih palet warna yang paling cocok dengan mood Anda agar melihat aplikasi tidak membosankan!
              </Text>
            </View>

            <View style={styles.themeGrid}>
              {themeList.map((preset) => {
                const isSelected = themePreset === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => {
                      setThemePreset(preset.id);
                      showToast(`✓ Tema warna beralih ke ${preset.name}!`);
                    }}
                    style={[
                      styles.themeCardItem,
                      isSelected && {
                        borderColor: preset.primary,
                        backgroundColor: preset.primarySoft,
                      },
                    ]}>
                    <View style={styles.themeCardSwatches}>
                      <View style={[styles.swatchBall, { backgroundColor: preset.primary }]} />
                      <View style={[styles.swatchBall, { backgroundColor: preset.accent }]} />
                      <Text style={styles.themeIcon}>{preset.icon}</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.themeTitleRow}>
                        <Text style={[styles.themeTitle, isSelected && { color: preset.primaryDark, fontWeight: '900' }]}>
                          {preset.name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.activeThemeBadge, { backgroundColor: preset.primary }]}>
                            <Text style={styles.activeThemeBadgeText}>Aktif</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.themeTagline}>{preset.tagline}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: GANTI KATA SANDI */}
        {activeTab === 'sandi' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>🔒 Keamanan Akun & Kata Sandi</Text>
              <Text style={styles.sectionSubtitle}>Perbarui kata sandi akun kantin Anda secara berkala</Text>
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

              <TouchableOpacity
                onPress={handleSavePassword}
                style={[styles.submitBtn, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.submitBtnText}>🔐 Perbarui Kata Sandi Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: PREFERENSI MAKANAN & NOTIFIKASI */}
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
                      style={[
                        styles.tasteChip,
                        dietaryPref === pref && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                      ]}>
                      <Text
                        style={[
                          styles.tasteChipText,
                          dietaryPref === pref && { color: '#ffffff', fontWeight: '800' },
                        ]}>
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
                  trackColor={{ false: '#cbd5e1', true: activeTheme.primary }}
                  thumbColor="#ffffff"
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                style={[styles.submitBtn, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.submitBtnText}>✓ Simpan Preferensi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Keamanan & JWT Token Information Box */}
        <View style={styles.securityBox}>
          <View style={styles.securityHeader}>
            <Text style={styles.securityTitle}>🛡️ Sistem Keamanan & Token JWT</Text>
            <TouchableOpacity onPress={() => setIsJwtModalOpen(true)} style={[styles.inspectMiniBtn, { backgroundColor: activeTheme.primarySoft }]}>
              <Text style={[styles.inspectMiniBtnText, { color: activeTheme.primaryDark }]}>Inspeksi Token ➔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.securityDesc}>
            Aplikasi dilindungi dengan protokol otentikasi token JWT standar RFC 7519. Token aktif secara otomatis disisipkan ke header Bearer setiap mengakses API menu, login, dan pembaruan profil.
          </Text>

          <View style={styles.tokenDisplayCard}>
            <Text style={styles.tokenDisplayLabel}>Token JWT Bearer Aktif:</Text>
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
    borderRadius: 22,
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
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  jwtStatusChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  jwtStatusChipText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '700',
  },
  profileTopActions: {
    flexDirection: 'row',
    gap: 8,
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
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
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
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 12,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  feedbackError: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  feedbackBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    fontWeight: '900',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  sectionTitleRow: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 17,
  },
  avatarSection: {
    gap: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  avatarChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarChipIcon: {
    fontSize: 18,
  },
  avatarChipLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  submitBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  themeGrid: {
    gap: 10,
  },
  themeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  themeCardSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -6,
  },
  swatchBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  themeIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  themeTagline: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  activeThemeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeThemeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  tasteOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tasteChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tasteChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 4,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  switchDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  securityBox: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  inspectMiniBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inspectMiniBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  securityDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  tokenDisplayCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  tokenDisplayLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
  tokenDisplayText: {
    fontSize: 10,
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
