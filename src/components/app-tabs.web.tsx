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
import { LoginModal } from './LoginModal';
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
  const { user, role, logout, balance } = useCanteen();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <View {...props} style={styles.tabListContainer}>
        <ThemedView type="backgroundElement" style={styles.innerContainer}>
          <ThemedView style={styles.brandGroup}>
            <ThemedText type="subtitle" style={styles.brandText}>
              ⚡ SmartCanteen
            </ThemedText>
            {role === 'siswa' && (
              <View style={styles.balanceBadge}>
                <ThemedText style={styles.balanceText}>
                  💳 Saldo: Rp {balance.toLocaleString('id-ID')}
                </ThemedText>
              </View>
            )}
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
  },
  balanceBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#10b981',
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
