import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCanteen } from '@/context/CanteenContext';
import { JwtTokenInspectorModal } from './JwtTokenInspectorModal';
import { LoginModal } from './LoginModal';
import { TopUpModal } from './TopUpModal';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>🍱 Menu</TabButton>
          </TabTrigger>
          <TabTrigger name="antrean" href={"/antrean" as any} asChild>
            <TabButton>📋 Status Antrean</TabButton>
          </TabTrigger>
          <TabTrigger name="pengelola" href={"/pengelola" as any} asChild>
            <TabButton>👨‍🍳 Pengelola Kantin</TabButton>
          </TabTrigger>
          <TabTrigger name="pengaturan" href={"/pengaturan" as any} asChild>
            <TabButton>⚙️ Profil & Setelan</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href={"/explore" as any} asChild>
            <TabButton>ℹ️ Panduan</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { user, role, balance, token } = useCanteen();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);

  return (
    <>
      <View {...props} style={styles.tabListContainer}>
        <ThemedView type="backgroundElement" style={styles.innerContainer}>
          <ThemedView style={styles.brandGroup}>
            <ThemedText type="subtitle" style={styles.brandText}>
              ⚡ SmartCanteen
            </ThemedText>
            {role === 'siswa' && (
              <Pressable
                onPress={() => setIsTopUpModalOpen(true)}
                style={styles.balanceBadge}>
                <ThemedText style={styles.balanceText}>
                  💳 Saldo: Rp {balance.toLocaleString('id-ID')} <ThemedText style={styles.topUpHint}>+ Isi</ThemedText>
                </ThemedText>
              </Pressable>
            )}
            <Pressable
              onPress={() => setIsJwtModalOpen(true)}
              style={styles.jwtBadge}>
              <ThemedText style={styles.jwtBadgeText}>
                🔑 JWT {token ? '● Aktif' : '○ Kosong'}
              </ThemedText>
            </Pressable>
          </ThemedView>

          {props.children}

          {user ? (
            <View style={styles.userBadgeGroup}>
              <View style={styles.userInfoPill}>
                <ThemedText style={styles.userNameText}>
                  {user.role === 'siswa' ? '🎓' : '👨‍🍳'} {user.name}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setIsLoginModalOpen(true)}
                style={styles.switchRoleBtn}>
                <ThemedText style={styles.switchRoleBtnText}>Ganti Login 🔄</ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsLoginModalOpen(true)}
              style={styles.loginBtn}>
              <ThemedText style={styles.loginBtnText}>🔐 Login / Masuk</ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </View>

      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <TopUpModal
        visible={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />

      <JwtTokenInspectorModal
        visible={isJwtModalOpen}
        onClose={() => setIsJwtModalOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: 'auto',
    backgroundColor: 'transparent',
  },
  brandText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '800',
  },
  balanceBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  balanceText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  topUpHint: {
    color: '#065f46',
    fontWeight: '900',
    backgroundColor: '#a7f3d0',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  jwtBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  jwtBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  userBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: Spacing.two,
  },
  userInfoPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userNameText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchRoleBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  switchRoleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginLeft: Spacing.two,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
