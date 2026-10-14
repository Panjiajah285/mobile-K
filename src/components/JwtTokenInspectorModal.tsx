import { useCanteen } from '@/context/CanteenContext';
import { apiGetMenuById, apiLogout, subscribeApiLogs, ApiLogItem } from '@/services/api';
import { decodeJwtToken, DecodedJwt } from '@/utils/jwt';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface JwtTokenInspectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const JwtTokenInspectorModal: React.FC<JwtTokenInspectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { token, refreshToken, user, logout } = useCanteen();
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeApiLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (token) {
      setDecoded(decodeJwtToken(token));
    } else {
      setDecoded(null);
    }
  }, [token]);

  const handleTestMenuEndpoint = async (withValidToken: boolean = true) => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const tokenToUse = withValidToken ? token : 'token_palsu_atau_kosong_123';
      const res = await apiGetMenuById('menu-1', tokenToUse);

      if (res.success && res.data) {
        setTestResult(
          `✅ [200 OK] Akses 1 Menu Berhasil!\nMenu: ${res.data.name} (Rp ${res.data.price.toLocaleString('id-ID')})\nHeader: Authorization: Bearer ${token?.substring(0, 24)}...`
        );
      } else {
        setTestResult(`❌ [${res.status} Unauthorized]\n${res.message}\nError: ${res.error}`);
      }
    } catch (e: any) {
      setTestResult(`❌ Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestLogoutAndRefresh = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await apiLogout(token);
      setTestResult(
        `🔄 [200 OK] Logout Berhasil!\nToken lama di-revoke.\nToken Baru Direfresh:\n${res.refreshedToken?.substring(0, 40)}...`
      );
      logout();
    } catch (e: any) {
      setTestResult(`❌ Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const tokenParts = token ? token.split('.') : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🔑 JWT Token & Endpoint Inspector</Text>
              <Text style={styles.subtitle}>Pemantau Otentikasi Token & Akses API Kantin</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status Token Aktif */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>1. Token JWT Saat Ini</Text>
                <View style={[styles.badge, token ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={[styles.badgeText, token ? styles.badgeTextActive : styles.badgeTextInactive]}>
                    {token ? '● ACTIVE TOKEN' : '○ NO TOKEN'}
                  </Text>
                </View>
              </View>

              {token ? (
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenText}>
                    <Text style={styles.tokenHeader}>{tokenParts[0] || ''}</Text>
                    <Text style={styles.tokenDot}>.</Text>
                    <Text style={styles.tokenPayload}>{tokenParts[1] || ''}</Text>
                    <Text style={styles.tokenDot}>.</Text>
                    <Text style={styles.tokenSignature}>{tokenParts[2] || ''}</Text>
                  </Text>
                  <View style={styles.tokenLegendRow}>
                    <Text style={[styles.legendItem, { color: '#ef4444' }]}>■ Header</Text>
                    <Text style={[styles.legendItem, { color: '#8b5cf6' }]}>■ Payload</Text>
                    <Text style={[styles.legendItem, { color: '#06b6d4' }]}>■ Signature</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Belum ada token. Silakan login untuk mendapatkan token JWT.</Text>
                </View>
              )}
            </View>

            {/* Decoded Payload */}
            {decoded && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Payload JWT Ter-Decode</Text>
                <View style={styles.decodedCard}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Subject (sub):</Text>
                    <Text style={styles.metaVal}>{decoded.payload.sub}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Nama (name):</Text>
                    <Text style={styles.metaVal}>{decoded.payload.name}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Role (role):</Text>
                    <Text style={[styles.metaVal, { color: '#059669', fontWeight: 'bold' }]}>
                      {decoded.payload.role.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Issued At (iat):</Text>
                    <Text style={styles.metaVal}>
                      {new Date(decoded.payload.iat * 1000).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Expired At (exp):</Text>
                    <Text style={styles.metaVal}>
                      {new Date(decoded.payload.exp * 1000).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Interactive Testing Buttons */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Uji Endpoint Wajib (Login, 1 Menu, Logout & Refresh)</Text>
              
              <View style={styles.testBtnGroup}>
                <TouchableOpacity
                  disabled={isTesting}
                  onPress={() => handleTestMenuEndpoint(true)}
                  style={[styles.testBtn, { backgroundColor: '#059669' }]}>
                  <Text style={styles.testBtnText}>
                    📡 Uji GET /api/menu/menu-1 (Dengan Bearer Token)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isTesting}
                  onPress={() => handleTestMenuEndpoint(false)}
                  style={[styles.testBtn, { backgroundColor: '#b91c1c' }]}>
                  <Text style={styles.testBtnText}>
                    ⛔ Uji GET /api/menu/menu-1 (Tanpa Token / Unauthorized 401)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isTesting}
                  onPress={handleTestLogoutAndRefresh}
                  style={[styles.testBtn, { backgroundColor: '#2563eb' }]}>
                  <Text style={styles.testBtnText}>
                    🔄 Uji POST /api/auth/logout (Revoke & Refresh Token)
                  </Text>
                </TouchableOpacity>
              </View>

              {testResult && (
                <View style={styles.testResultBox}>
                  <Text style={styles.testResultText}>{testResult}</Text>
                </View>
              )}
            </View>

            {/* Real-time API Logs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Log Akses Endpoint Real-Time ({logs.length})</Text>
              {logs.length === 0 ? (
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Belum ada riwayat pemanggilan API.</Text>
              ) : (
                <View style={styles.logsList}>
                  {logs.slice(0, 10).map((log) => (
                    <View key={log.id} style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={[
                              styles.logMethod,
                              log.method === 'POST' ? { backgroundColor: '#3b82f6' } : { backgroundColor: '#10b981' },
                            ]}>
                            {log.method}
                          </Text>
                          <Text style={styles.logEndpoint}>{log.endpoint}</Text>
                        </View>
                        <Text style={[styles.logStatus, log.status === 200 ? styles.logOk : styles.logErr]}>
                          {log.status} {log.statusText}
                        </Text>
                      </View>

                      {log.authHeader && (
                        <Text style={styles.logAuth} numberOfLines={1}>
                          Header: {log.authHeader}
                        </Text>
                      )}

                      <Text style={styles.logTime}>Waktu: {log.timestamp}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: 20,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  section: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: '#15803d',
  },
  badgeTextInactive: {
    color: '#b91c1c',
  },
  tokenBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },
  tokenText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  tokenHeader: {
    color: '#f87171',
    fontWeight: 'bold',
  },
  tokenDot: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  tokenPayload: {
    color: '#c084fc',
    fontWeight: 'bold',
  },
  tokenSignature: {
    color: '#22d3ee',
    fontWeight: 'bold',
  },
  tokenLegendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  legendItem: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  decodedCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  testBtnGroup: {
    gap: 8,
  },
  testBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  testResultBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  testResultText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0f172a',
    lineHeight: 16,
  },
  logsList: {
    gap: 6,
  },
  logCard: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMethod: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logEndpoint: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  logOk: {
    color: '#059669',
  },
  logErr: {
    color: '#dc2626',
  },
  logAuth: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
