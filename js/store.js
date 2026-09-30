// SmartCanteen - Central Reactive State Store

class CanteenStore {
  constructor() {
    this.listeners = {};
    this.loadState();
  }

  loadState() {
    try {
      const savedMenu = localStorage.getItem('smartcanteen_menu');
      this.menu = savedMenu ? JSON.parse(savedMenu) : [...INITIAL_MENU];

      const savedCart = localStorage.getItem('smartcanteen_cart');
      this.cart = savedCart ? JSON.parse(savedCart) : [];

      const savedOrders = localStorage.getItem('smartcanteen_orders');
      this.orders = savedOrders ? JSON.parse(savedOrders) : [...INITIAL_ORDERS];

      const savedFinances = localStorage.getItem('smartcanteen_finances');
      this.financialLogs = savedFinances ? JSON.parse(savedFinances) : [...INITIAL_FINANCIAL_LOGS];

      this.activeOrderId = localStorage.getItem('smartcanteen_active_order_id') || (this.orders[0] ? this.orders[0].id : null);
      this.currentRole = localStorage.getItem('smartcanteen_role') || 'siswa'; // 'siswa' or 'pengelola'
    } catch (e) {
      console.warn("Could not load from localStorage, fallback to default memory", e);
      this.menu = [...INITIAL_MENU];
      this.cart = [];
      this.orders = [...INITIAL_ORDERS];
      this.financialLogs = [...INITIAL_FINANCIAL_LOGS];
      this.activeOrderId = this.orders[0]?.id;
      this.currentRole = 'siswa';
    }
  }

  saveState() {
    try {
      localStorage.setItem('smartcanteen_menu', JSON.stringify(this.menu));
      localStorage.setItem('smartcanteen_cart', JSON.stringify(this.cart));
      localStorage.setItem('smartcanteen_orders', JSON.stringify(this.orders));
      localStorage.setItem('smartcanteen_finances', JSON.stringify(this.financialLogs));
      if (this.activeOrderId) {
        localStorage.setItem('smartcanteen_active_order_id', this.activeOrderId);
      }
      localStorage.setItem('smartcanteen_role', this.currentRole);
    } catch (e) {
      console.warn("Storage quota or access error", e);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    this.saveState();
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  setRole(role) {
    this.currentRole = role;
    this.emit('roleChanged', role);
  }

  // Stock & Inventory helpers
  getStockStatus(stock) {
    if (stock <= 0) {
      return { status: 'habis', label: 'Habis (Out of Stock)', class: 'badge-danger', icon: '✕' };
    } else if (stock <= 5) {
      return { status: 'menipis', label: `Hampir Habis (Sisa ${stock})`, class: 'badge-warning', icon: '⚠' };
    } else {
      return { status: 'tersedia', label: `Tersedia (Sisa ${stock})`, class: 'badge-success', icon: '✓' };
    }
  }

  // Cart operations
  addToCart(menuId, qty = 1, note = '') {
    const item = this.menu.find(m => m.id === menuId);
    if (!item) return { success: false, message: 'Menu tidak ditemukan' };
    if (item.stock <= 0) return { success: false, message: 'Maaf, menu ini sudah habis!' };

    const cartItem = this.cart.find(c => c.id === menuId);
    const currentQtyInCart = cartItem ? cartItem.qty : 0;

    if (currentQtyInCart + qty > item.stock) {
      return { 
        success: false, 
        message: `Stok tidak mencukupi! Hanya tersisa ${item.stock} porsi.` 
      };
    }

    if (cartItem) {
      cartItem.qty += qty;
      if (note) cartItem.note = note;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        stan: item.stan,
        qty: qty,
        note: note
      });
    }

    this.emit('cartUpdated', this.cart);
    return { success: true, message: `Berhasil menambahkan ${item.name} ke keranjang!` };
  }

  updateCartQty(menuId, delta) {
    const item = this.menu.find(m => m.id === menuId);
    const cartIndex = this.cart.findIndex(c => c.id === menuId);
    if (cartIndex === -1) return;

    const newQty = this.cart[cartIndex].qty + delta;
    if (newQty <= 0) {
      this.cart.splice(cartIndex, 1);
    } else {
      if (item && newQty > item.stock) {
        alert(`Maksimal pesanan sesuai sisa stok (${item.stock} porsi)`);
        return;
      }
      this.cart[cartIndex].qty = newQty;
    }
    this.emit('cartUpdated', this.cart);
  }

  removeFromCart(menuId) {
    this.cart = this.cart.filter(c => c.id !== menuId);
    this.emit('cartUpdated', this.cart);
  }

  clearCart() {
    this.cart = [];
    this.emit('cartUpdated', this.cart);
  }

  getCartTotal() {
    const subtotal = this.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const count = this.cart.reduce((acc, item) => acc + item.qty, 0);
    return { subtotal, count };
  }

  // Order operations
  placeOrder({ studentName, studentClass, pickupSlot, paymentMethod, orderNotes = '' }) {
    if (this.cart.length === 0) {
      return { success: false, message: 'Keranjang belanja kosong!' };
    }

    // Verify stock availability
    for (const c of this.cart) {
      const menuItem = this.menu.find(m => m.id === c.id);
      if (!menuItem || menuItem.stock < c.qty) {
        return { 
          success: false, 
          message: `Stok "${c.name}" tidak mencukupi atau telah berubah. Silakan periksa kembali keranjang Anda.` 
        };
      }
    }

    // Deduct stock
    for (const c of this.cart) {
      const menuItem = this.menu.find(m => m.id === c.id);
      if (menuItem) {
        menuItem.stock -= c.qty;
        menuItem.soldCount = (menuItem.soldCount || 0) + c.qty;
      }
    }

    // Generate Queue Number (e.g. A-026)
    const nextQueueNum = this.orders.length + 21;
    const queueNumber = `A-${String(nextQueueNum).padStart(3, '0')}`;
    const orderId = `ORD-2026-${String(this.orders.length + 1).padStart(3, '0')}`;
    const now = new Date();

    const { subtotal } = this.getCartTotal();

    const newOrder = {
      id: orderId,
      queueNumber: queueNumber,
      studentName: studentName || 'Siswa SmartCanteen',
      studentClass: studentClass || 'XI MIPA 1',
      items: JSON.parse(JSON.stringify(this.cart)),
      totalAmount: subtotal,
      status: 'menunggu', // 'menunggu' -> 'diproses' -> 'siap' -> 'selesai'
      paymentMethod: paymentMethod || 'QRIS Sekolah',
      pickupSlot: pickupSlot || 'Istirahat 1 (09.45 - 10.15)',
      createdAt: now.toISOString(),
      orderNotes: orderNotes,
      estimatedMinutes: Math.min(12, Math.max(4, this.cart.length * 3))
    };

    // Add to orders
    this.orders.unshift(newOrder);
    this.activeOrderId = newOrder.id;

    // Record in financial logs
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    this.financialLogs.unshift({
      id: `TRX-${Date.now().toString().slice(-4)}`,
      date: dateStr,
      time: timeStr,
      queue: queueNumber,
      student: newOrder.studentName,
      amount: subtotal,
      method: paymentMethod.split(' ')[0],
      status: "Berhasil"
    });

    // Clear cart
    this.cart = [];

    this.emit('menuUpdated', this.menu);
    this.emit('cartUpdated', this.cart);
    this.emit('ordersUpdated', this.orders);
    this.emit('orderPlaced', newOrder);

    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    const oldStatus = order.status;
    order.status = newStatus;

    if (newStatus === 'siap') {
      order.estimatedMinutes = 0;
    } else if (newStatus === 'diproses') {
      order.estimatedMinutes = 3;
    } else if (newStatus === 'selesai') {
      order.estimatedMinutes = 0;
    }

    this.emit('ordersUpdated', this.orders);
    this.emit('orderStatusChanged', { order, oldStatus, newStatus });
    return true;
  }

  getActiveOrder() {
    if (!this.activeOrderId) return this.orders[0] || null;
    return this.orders.find(o => o.id === this.activeOrderId) || this.orders[0] || null;
  }

  setActiveOrder(orderId) {
    this.activeOrderId = orderId;
    this.emit('activeOrderChanged', this.getActiveOrder());
  }

  // Stock Management
  updateStock(menuId, newStock) {
    const item = this.menu.find(m => m.id === menuId);
    if (!item) return false;
    item.stock = Math.max(0, parseInt(newStock, 10) || 0);
    this.emit('menuUpdated', this.menu);
    return true;
  }

  adjustStock(menuId, delta) {
    const item = this.menu.find(m => m.id === menuId);
    if (!item) return false;
    item.stock = Math.max(0, item.stock + delta);
    this.emit('menuUpdated', this.menu);
    return true;
  }

  addMenuItem(newItem) {
    const id = `menu-${Date.now()}`;
    const item = {
      id,
      name: newItem.name || 'Menu Baru',
      category: newItem.category || 'makanan-berat',
      price: parseInt(newItem.price, 10) || 10000,
      stock: parseInt(newItem.stock, 10) || 10,
      initialStock: parseInt(newItem.stock, 10) || 10,
      prepTime: newItem.prepTime || '5-7 menit',
      rating: 4.8,
      soldCount: 0,
      description: newItem.description || 'Menu lezat kantin sekolah.',
      image: newItem.image || 'assets/images/ayam-geprek.jpg',
      stan: newItem.stan || 'Stan 1 - Dapur Bu Siti',
      tags: newItem.tags || ['Baru']
    };
    this.menu.push(item);
    this.emit('menuUpdated', this.menu);
    return item;
  }

  editMenuItem(menuId, updatedData) {
    const index = this.menu.findIndex(m => m.id === menuId);
    if (index === -1) return false;
    this.menu[index] = {
      ...this.menu[index],
      ...updatedData,
      price: parseInt(updatedData.price, 10) || this.menu[index].price,
      stock: parseInt(updatedData.stock, 10) ?? this.menu[index].stock
    };
    this.emit('menuUpdated', this.menu);
    return true;
  }

  deleteMenuItem(menuId) {
    this.menu = this.menu.filter(m => m.id !== menuId);
    this.emit('menuUpdated', this.menu);
    return true;
  }

  // Financial reporting metrics
  getFinancialSummary(filterRange = 'today') {
    const todayStr = "2026-09-23"; // synced with system demo date
    let filteredLogs = [...this.financialLogs];

    if (filterRange === 'today') {
      filteredLogs = this.financialLogs.filter(l => l.date === todayStr);
    } else if (filterRange === 'week') {
      filteredLogs = this.financialLogs; // 7 hari terakhir
    }

    const totalRevenue = filteredLogs.reduce((acc, log) => acc + log.amount, 0);
    const totalTransactions = filteredLogs.length;
    const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    // Top selling items
    const itemSoldMap = {};
    this.orders.forEach(o => {
      o.items.forEach(it => {
        if (!itemSoldMap[it.name]) {
          itemSoldMap[it.name] = { name: it.name, count: 0, revenue: 0, price: it.price };
        }
        itemSoldMap[it.name].count += it.qty;
        itemSoldMap[it.name].revenue += it.qty * it.price;
      });
    });

    const topSelling = Object.values(itemSoldMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      filteredLogs,
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      topSelling,
      todayRevenue: this.financialLogs.filter(l => l.date === todayStr).reduce((acc, l) => acc + l.amount, 0),
      weeklyRevenue: this.financialLogs.reduce((acc, l) => acc + l.amount, 0),
      monthlyRevenue: this.financialLogs.reduce((acc, l) => acc + l.amount, 0) + 1450000 // demo projection
    };
  }

  resetDemoData() {
    localStorage.removeItem('smartcanteen_menu');
    localStorage.removeItem('smartcanteen_cart');
    localStorage.removeItem('smartcanteen_orders');
    localStorage.removeItem('smartcanteen_finances');
    localStorage.removeItem('smartcanteen_active_order_id');
    this.loadState();
    this.emit('menuUpdated', this.menu);
    this.emit('cartUpdated', this.cart);
    this.emit('ordersUpdated', this.orders);
    this.emit('roleChanged', this.currentRole);
    return true;
  }
}

// Global Singleton Instance
window.canteenStore = new CanteenStore();
