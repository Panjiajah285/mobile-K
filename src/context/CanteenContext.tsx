import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_MENU, INITIAL_ORDERS, MenuItem, Order, OrderItem } from '@/constants/canteenData';

interface CartItem extends OrderItem {
  image?: any;
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'siswa' | 'pengelola';
  detail: string; // e.g. "NIM: 202610192" or "Stan 1 - Dapur Bu Siti"
}

interface CanteenContextType {
  user: UserAccount | null;
  role: 'siswa' | 'pengelola';
  setRole: (role: 'siswa' | 'pengelola') => void;
  balance: number;
  menu: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  login: (nameOrUser: string, nimOrPass: string, role: 'siswa' | 'pengelola') => boolean;
  logout: () => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string, pickupSlot: string, studentName?: string, studentClass?: string) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateStock: (menuId: string, delta: number) => void;
}

const STORAGE_KEYS = {
  USER: '@smartcanteen_user_v1',
  ORDERS: '@smartcanteen_orders_v1',
  MENU: '@smartcanteen_menu_v1',
  BALANCE: '@smartcanteen_balance_v1',
};

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>({
    username: '202610192',
    name: 'Natania Oktaviani',
    role: 'siswa',
    detail: 'NIM: 202610192',
  });
  const [role, setRole] = useState<'siswa' | 'pengelola'>('siswa');
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

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRole(parsedUser.role);
        }
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
        if (storedBalance) {
          setBalance(JSON.parse(storedBalance));
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

  const login = (nameInput: string, credentialInput: string, selectedRole: 'siswa' | 'pengelola'): boolean => {
    if (selectedRole === 'siswa') {
      const newUser: UserAccount = {
        username: credentialInput || '202610192',
        name: nameInput || 'Natania Oktaviani',
        role: 'siswa',
        detail: `NIM: ${credentialInput || '202610192'}`,
      };
      setUser(newUser);
      setRole('siswa');
      saveUser(newUser);
      return true;
    } else {
      const newUser: UserAccount = {
        username: nameInput || 'Bu Siti',
        name: nameInput || 'Bu Siti (Dapur Bu Siti)',
        role: 'pengelola',
        detail: 'Stan 1 - Dapur Bu Siti',
      };
      setUser(newUser);
      setRole('pengelola');
      saveUser(newUser);
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    saveUser(null);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, image: item.image }];
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

    setMenu((prev) =>
      prev.map((m) => {
        const cartItem = cart.find((c) => c.id === m.id);
        if (cartItem) {
          return { ...m, stock: Math.max(0, m.stock - cartItem.qty), soldCount: m.soldCount + cartItem.qty };
        }
        return m;
      })
    );

    clearCart();
    return newQueueNum;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    saveOrders(updated);
  };

  const updateStock = (menuId: string, delta: number) => {
    setMenu((prev) =>
      prev.map((m) => (m.id === menuId ? { ...m, stock: Math.max(0, m.stock + delta) } : m))
    );
  };

  return (
    <CanteenContext.Provider
      value={{
        user,
        role,
        setRole,
        balance,
        menu,
        cart,
        orders,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkout,
        updateOrderStatus,
        updateStock,
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
