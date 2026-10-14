import { INITIAL_MENU, INITIAL_ORDERS, MenuItem, Order, OrderItem } from '@/constants/canteenData';
import { apiGetMenuById, apiLogin, apiLogout, ApiResponse } from '@/services/api';
import { createJwtToken, verifyJwtToken } from '@/utils/jwt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem extends OrderItem {
  image?: any;
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'siswa' | 'pengelola' | 'guest';
  detail: string;
  nim?: string;
  phone?: string;
  email?: string;
  majorOrClass?: string;
  stanName?: string;
  operatingHours?: string;
  dietaryPreference?: string;
  allergies?: string;
  soundAlerts?: boolean;
}

interface CanteenContextType {
  user: UserAccount | null;
  role: 'siswa' | 'pengelola';
  token: string | null;
  refreshToken: string | null;
  setRole: (role: 'siswa' | 'pengelola') => void;
  balance: number;
  menu: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  login: (nameOrUser: string, nimOrPass: string, role: 'siswa' | 'pengelola') => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<UserAccount>) => Promise<boolean>;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  inspectMenuWithToken: (menuId?: string) => Promise<ApiResponse<MenuItem>>;
  topUpBalance: (amount: number, method: string) => boolean;
  addToCart: (item: MenuItem, note?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  updateCartItemNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string, pickupSlot: string, studentName?: string, studentClass?: string) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => boolean;
  updateStock: (menuId: string, delta: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'image'> & { image?: any }) => MenuItem;
  deleteMenuItem: (menuId: string) => void;
  toggleMenuAvailability: (menuId: string) => void;
}

const STORAGE_KEYS = {
  USER: '@smartcanteen_user_v2',
  ORDERS: '@smartcanteen_orders_v2',
  MENU: '@smartcanteen_menu_v2',
  BALANCE: '@smartcanteen_balance_v2',
  TOKEN: '@smartcanteen_jwt_token_v2',
  REFRESH_TOKEN: '@smartcanteen_refresh_token_v2',
};

const DEFAULT_USER: UserAccount = {
  username: '202610192',
  name: 'Natania Oktaviani',
  role: 'siswa',
  detail: 'NIM: 202610192 (Kelas XII MIPA 2)',
  nim: '202610192',
  phone: '0812-9876-5432',
  email: 'natania.oktaviani@sekolah.sch.id',
  majorOrClass: 'Kelas XII MIPA 2',
  dietaryPreference: 'Pedas Sedang 🌶️',
  allergies: 'Tidak Ada Alergi',
  soundAlerts: true,
};

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(DEFAULT_USER);
  const [role, setRole] = useState<'siswa' | 'pengelola'>('siswa');
  const [token, setToken] = useState<string | null>(() => createJwtToken(DEFAULT_USER, 3600, 'access'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => createJwtToken(DEFAULT_USER, 7 * 86400, 'refresh'));
  const [balance, setBalance] = useState<number>(50000);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Load saved state from AsyncStorage on initial launch
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedOrders = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
        const storedBalance = await AsyncStorage.getItem(STORAGE_KEYS.BALANCE);
        const storedMenu = await AsyncStorage.getItem(STORAGE_KEYS.MENU);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (storedUser) {
          const parsedUser: UserAccount = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser.role === 'siswa' || parsedUser.role === 'pengelola') {
            setRole(parsedUser.role);
          }

          if (storedToken) {
            setToken(storedToken);
          } else {
            const newToken = createJwtToken(parsedUser, 3600, 'access');
            setToken(newToken);
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
          }
        }
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
        if (storedBalance) {
          setBalance(JSON.parse(storedBalance));
        }
        if (storedMenu) {
          const parsedMenu: MenuItem[] = JSON.parse(storedMenu);
          const mappedMenu = parsedMenu.map((m) => {
            const original = INITIAL_MENU.find((init) => init.id === m.id);
            return {
              ...m,
              image: m.image || (original ? original.image : require('@/assets/images/ayam-geprek.jpg')),
            };
          });
          setMenu(mappedMenu);
        }
      } catch (err) {
        console.log('Error loading data from AsyncStorage:', err);
      }
    };
    loadStoredData();
  }, []);

  // Save helpers
  const saveUser = async (newUser: UserAccount | null) => {
    try {
      if (newUser) await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      else await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.log('Error saving user:', e);
    }
  };

  const saveTokens = async (newToken: string | null, newRefreshToken: string | null) => {
    try {
      if (newToken) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      else await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);

      if (newRefreshToken) await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      else await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (e) {
      console.log('Error saving tokens:', e);
    }
  };

  const saveOrders = async (newOrders: Order[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    } catch (e) {
      console.log('Error saving orders:', e);
    }
  };

  const saveBalance = async (newBal: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(newBal));
    } catch (e) {
      console.log('Error saving balance:', e);
    }
  };

  const saveMenu = async (newMenu: MenuItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(newMenu));
    } catch (e) {
      console.log('Error saving menu:', e);
    }
  };

  /**
   * 1. LOGIN DENGAN PENERBITAN JWT TOKEN (POST /api/auth/login)
   */
  const login = async (nameInput: string, credentialInput: string, selectedRole: 'siswa' | 'pengelola'): Promise<boolean> => {
    const res = await apiLogin(nameInput, credentialInput, selectedRole);

    if (res.success && res.data) {
      const { user: loggedInUser, token: newAccessToken, refreshToken: newRefToken } = res.data;
      
      const fullUser: UserAccount = {
        ...loggedInUser,
        nim: selectedRole === 'siswa' ? (credentialInput || '202610192') : undefined,
        phone: '0812-9876-5432',
        email: selectedRole === 'siswa' ? `${(nameInput || 'natania').toLowerCase().replace(/\s+/g, '.')}@sekolah.sch.id` : 'kantin.pusat@sekolah.sch.id',
        majorOrClass: selectedRole === 'siswa' ? 'Kelas XII MIPA 2' : undefined,
        stanName: selectedRole === 'pengelola' ? (nameInput || 'Stan 1 - Dapur Bu Siti') : undefined,
        operatingHours: selectedRole === 'pengelola' ? '07.30 - 15.30 WIB' : undefined,
        dietaryPreference: 'Pedas Sedang 🌶️',
        allergies: 'Tidak Ada Alergi',
        soundAlerts: true,
      };

      setUser(fullUser);
      setRole(selectedRole);
      setToken(newAccessToken);
      setRefreshToken(newRefToken);

      await saveUser(fullUser);
      await saveTokens(newAccessToken, newRefToken);
      return true;
    }
    return false;
  };

  /**
   * 3. LOGOUT DENGAN REFRESH TOKEN (POST /api/auth/logout)
   */
  const logout = async () => {
    const res = await apiLogout(token);

    const nextRefreshedToken = res.refreshedToken || createJwtToken(
      { username: 'guest', name: 'Tamu (Refreshed)', role: 'guest', detail: 'Sesi Refreshed' },
      1800,
      'access'
    );

    setUser(null);
    setToken(nextRefreshedToken);
    setRefreshToken(null);

    await saveUser(null);
    await saveTokens(nextRefreshedToken, null);
  };

  /**
   * UPDATE PROFILE PENGGUNA (MAHASISWA / PENGELOLA)
   */
  const updateProfile = async (updatedData: Partial<UserAccount>): Promise<boolean> => {
    if (!user) return false;

    const updatedRole = updatedData.role || user.role;
    let newDetail = user.detail;

    if (updatedRole === 'siswa') {
      const nimText = updatedData.nim || user.nim || user.username;
      const classText = updatedData.majorOrClass || user.majorOrClass || 'Siswa';
      newDetail = `NIM: ${nimText} (${classText})`;
    } else {
      const stanText = updatedData.stanName || user.stanName || user.name;
      newDetail = stanText;
    }

    const updatedUser: UserAccount = {
      ...user,
      ...updatedData,
      detail: newDetail,
    };

    setUser(updatedUser);
    await saveUser(updatedUser);

    // Regenerate and update JWT token to keep decoded claims matching
    const newToken = createJwtToken(updatedUser, 3600, 'access');
    setToken(newToken);
    await saveTokens(newToken, refreshToken);

    return true;
  };

  /**
   * UPDATE KATA SANDI
   */
  const updatePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, message: 'Kata sandi baru minimal harus 6 karakter!' };
    }

    try {
      await AsyncStorage.setItem(`@smartcanteen_pass_${user?.username || 'user'}`, newPass);
      return { success: true, message: 'Kata sandi Anda berhasil diperbarui dengan aman!' };
    } catch (e: any) {
      return { success: false, message: 'Gagal menyimpan kata sandi baru: ' + e.message };
    }
  };

  /**
   * 2. AKSES 1 MENU MENGGUNAKAN BEARER TOKEN (GET /api/menu/:id)
   */
  const inspectMenuWithToken = async (menuId: string = 'menu-1'): Promise<ApiResponse<MenuItem>> => {
    return await apiGetMenuById(menuId, token);
  };

  const topUpBalance = (amount: number, method: string): boolean => {
    if (amount <= 0) return false;
    const nextBal = balance + amount;
    setBalance(nextBal);
    saveBalance(nextBal);
    return true;
  };

  const addToCart = (item: MenuItem, note?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1, note: note || i.note } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          note: note || '',
          image: item.image,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, qty } : i)));
  };

  const updateCartItemNote = (itemId: string, note: string) => {
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, note } : i)));
  };

  const clearCart = () => setCart([]);

  const checkout = (
    paymentMethod: string,
    pickupSlot: string,
    studentName = user?.name || 'Natania Oktaviani',
    studentClass = user?.detail || 'NIM: 202610192'
  ): string => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newQueueNum = `A-0${orders.length + 26}`;
    const newOrderId = `ORD-2026-0${orders.length + 6}`;

    const newOrder: Order = {
      id: newOrderId,
      queueNumber: newQueueNum,
      studentName,
      studentClass,
      items: cart.map(({ image, ...rest }) => rest),
      totalAmount,
      status: 'menunggu',
      paymentMethod,
      pickupSlot,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedMinutes: 8,
    };

    let nextBalance = balance;
    if (paymentMethod.includes('SmartPay')) {
      nextBalance = Math.max(0, balance - totalAmount);
      setBalance(nextBalance);
      saveBalance(nextBalance);
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    const updatedMenu = menu.map((m) => {
      const cartItem = cart.find((c) => c.id === m.id);
      if (cartItem) {
        return {
          ...m,
          stock: Math.max(0, m.stock - cartItem.qty),
          soldCount: m.soldCount + cartItem.qty,
        };
      }
      return m;
    });

    setMenu(updatedMenu);
    saveMenu(updatedMenu);

    clearCart();
    return newQueueNum;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    saveOrders(updated);
  };

  const cancelOrder = (orderId: string): boolean => {
    const orderToCancel = orders.find((o) => o.id === orderId);
    if (!orderToCancel || orderToCancel.status !== 'menunggu') {
      return false;
    }

    // Refund SmartPay if applicable
    if (orderToCancel.paymentMethod.includes('SmartPay')) {
      const refunded = balance + orderToCancel.totalAmount;
      setBalance(refunded);
      saveBalance(refunded);
    }

    // Restore stock
    const updatedMenu = menu.map((m) => {
      const orderedItem = orderToCancel.items.find((item) => item.id === m.id);
      if (orderedItem) {
        return {
          ...m,
          stock: m.stock + orderedItem.qty,
          soldCount: Math.max(0, m.soldCount - orderedItem.qty),
        };
      }
      return m;
    });
    setMenu(updatedMenu);
    saveMenu(updatedMenu);

    // Update order status to dibatalkan
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'dibatalkan' as const } : o
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    return true;
  };

  const updateStock = (menuId: string, delta: number) => {
    const updated = menu.map((m) =>
      m.id === menuId ? { ...m, stock: Math.max(0, m.stock + delta) } : m
    );
    setMenu(updated);
    saveMenu(updated);
  };

  const toggleMenuAvailability = (menuId: string) => {
    const updated = menu.map((m) => {
      if (m.id === menuId) {
        const isCurrentlyAvailable = m.stock > 0;
        return {
          ...m,
          stock: isCurrentlyAvailable ? 0 : m.initialStock || 20,
        };
      }
      return m;
    });
    setMenu(updated);
    saveMenu(updated);
  };

  const addMenuItem = (itemData: Omit<MenuItem, 'id' | 'image'> & { image?: any }): MenuItem => {
    const newId = `menu-${Date.now()}`;
    const newItem: MenuItem = {
      ...itemData,
      id: newId,
      image: itemData.image || require('@/assets/images/ayam-geprek.jpg'),
      rating: 5.0,
      soldCount: 0,
      tags: itemData.tags && itemData.tags.length > 0 ? itemData.tags : ['Baru', 'Rekomendasi'],
    };
    const updatedMenu = [newItem, ...menu];
    setMenu(updatedMenu);
    saveMenu(updatedMenu);
    return newItem;
  };

  const deleteMenuItem = (menuId: string) => {
    const updatedMenu = menu.filter((m) => m.id !== menuId);
    setMenu(updatedMenu);
    saveMenu(updatedMenu);
  };

  return (
    <CanteenContext.Provider
      value={{
        user,
        role,
        token,
        refreshToken,
        setRole,
        balance,
        menu,
        cart,
        orders,
        login,
        logout,
        updateProfile,
        updatePassword,
        inspectMenuWithToken,
        topUpBalance,
        addToCart,
        removeFromCart,
        updateCartQty,
        updateCartItemNote,
        clearCart,
        checkout,
        updateOrderStatus,
        cancelOrder,
        updateStock,
        addMenuItem,
        deleteMenuItem,
        toggleMenuAvailability,
      }}>
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) throw new Error('useCanteen must be used within CanteenProvider');
  return context;
};
