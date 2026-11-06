import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCanteen } from '@/context/CanteenContext';
import { JwtTokenInspectorModal } from './JwtTokenInspectorModal';
import { LoginModal } from './LoginModal';
import { ThemeModal } from './ThemeModal';
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
  const { ref: _ref, ...pressableProps } = props;

  return (
    <Pressable {...pressableProps} style={({ pressed }) => pressed && styles.pressed}>
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
  const { user, role, balance, token, activeTheme } = useCanteen();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  return (
    <>
      <View {...props} style={styles.tabListContainer}>
        <ThemedView type="backgroundElement" style={styles.innerContainer}>
          <ThemedView style={styles.brandGroup}>
            <ThemedText type="subtitle" style={[styles.brandText, { color: activeTheme.primary }]}>
              ⚡ SmartCanteen
            </ThemedText>

            <Pressable
              onPress={() => setIsThemeModalOpen(true)}
              style={[styles.themePillWeb, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }]}>
              <ThemedText style={[styles.themePillWebText, { color: activeTheme.primaryDark }]}>
                {activeTheme.icon} {activeTheme.name}
              </ThemedText>
            </Pressable>

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
                  {user.avatar || (user.role === 'siswa' ? '🎓' : '👨‍🍳')} {user.name}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setIsLoginModalOpen(true)}
                style={[styles.switchRoleBtn, { backgroundColor: activeTheme.primary }]}>
                <ThemedText style={styles.switchRoleBtnText}>Ganti Login 🔄</ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsLoginModalOpen(true)}
              style={[styles.loginBtn, { backgroundColor: activeTheme.primary }]}>
              <ThemedText style={styles.loginBtnText}>🔐 Login / Masuk</ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </View>

      <ThemeModal
        visible={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

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
  themePillWeb: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themePillWebText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
