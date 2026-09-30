// SmartCanteen - Main Application Controller
// Orchestrates routing, UI rendering, reactive events, audio synthesizer, and charts.

document.addEventListener('DOMContentLoaded', () => {
  const store = window.canteenStore;

  // =========================================================
  // 1. Audio Synthesizer (Web Audio API)
  // =========================================================
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {

    }
  }

  function playSound(type) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'cart') {
        // Cheerful ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'order') {
        // Triumphant chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'ready') {
        // High alert chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Audio playback not supported or blocked", e);
    }
  }

  // =========================================================
  // 2. Toast Notification Helper
  // =========================================================
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <div style="font-size: 0.88rem; font-weight: 500; color: #1e293b;">${message}</div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Format IDR Currency
  function formatIDR(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  }

  // =========================================================
  // 3. Routing & Role Management
  // =========================================================
  const views = {
    landing: document.getElementById('view-landing'),
    menu: document.getElementById('view-menu'),
    checkout: document.getElementById('view-checkout'),
    status: document.getElementById('view-status'),
    dashboard: document.getElementById('view-dashboard'),
    stock: document.getElementById('view-stock'),
    finance: document.getElementById('view-finance')
  };

  const navLinksContainer = document.getElementById('main-nav-links');
  const roleSiswaBtn = document.getElementById('role-siswa-btn');
  const roleAdminBtn = document.getElementById('role-admin-btn');
  const quickNavCtaBtn = document.getElementById('btn-quick-nav-cta');
  const btnOpenCart = document.getElementById('btn-open-cart');

  let currentView = 'landing';

  function renderNavLinks() {
    const role = store.currentRole;
    if (role === 'siswa') {
      navLinksContainer.innerHTML = `
        <li><a href="#landing" class="nav-link ${currentView === 'landing' ? 'active' : ''}" data-target="landing">Beranda</a></li>
        <li><a href="#menu" class="nav-link ${currentView === 'menu' ? 'active' : ''}" data-target="menu">Katalog Menu</a></li>
        <li><a href="#cara-kerja" class="nav-link" data-scroll="section-cara-kerja">Cara Kerja</a></li>
        <li><a href="#status" class="nav-link ${currentView === 'status' ? 'active' : ''}" data-target="status">Status Antrean</a></li>
      `;
      quickNavCtaBtn.textContent = 'Pesan Makanan 🍱';
      quickNavCtaBtn.style.display = 'inline-flex';
      btnOpenCart.style.display = 'flex';
    } else {
      navLinksContainer.innerHTML = `
        <li><a href="#landing" class="nav-link ${currentView === 'landing' ? 'active' : ''}" data-target="landing">Beranda</a></li>
        <li><a href="#dashboard" class="nav-link ${currentView === 'dashboard' ? 'active' : ''}" data-target="dashboard">Dashboard Kantin</a></li>
        <li><a href="#stock" class="nav-link ${currentView === 'stock' ? 'active' : ''}" data-target="stock">Manajemen Stok</a></li>
        <li><a href="#finance" class="nav-link ${currentView === 'finance' ? 'active' : ''}" data-target="finance">Laporan Keuangan</a></li>
      `;
      quickNavCtaBtn.textContent = 'Lihat Live Antrean 👨‍🍳';
      quickNavCtaBtn.style.display = 'inline-flex';
      btnOpenCart.style.display = 'none'; // Admin doesn't need student cart icon
    }
  }

  function navigateTo(viewName) {
    if (!views[viewName]) viewName = 'landing';
    currentView = viewName;

    // Toggle view visibility
    Object.keys(views).forEach(key => {
      if (key === viewName) {
        views[key].style.display = 'block';
      } else {
        views[key].style.display = 'none';
      }
    });

    renderNavLinks();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific hooks
    if (viewName === 'menu') {
      renderMenu();
    } else if (viewName === 'checkout') {
      renderCheckout();
    } else if (viewName === 'status') {
      renderStatusPage();
    } else if (viewName === 'dashboard') {
      renderDashboard();
    } else if (viewName === 'stock') {
      renderStockTable();
    } else if (viewName === 'finance') {
      renderFinancePage();
    }
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (views[hash]) {
      navigateTo(hash);
    } else if (hash === 'cara-kerja' || hash === 'section-cara-kerja') {
      navigateTo('landing');
      setTimeout(() => {
        const el = document.getElementById('section-cara-kerja');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });

  // Role button listeners
  roleSiswaBtn.addEventListener('click', () => {
    store.setRole('siswa');
    roleSiswaBtn.classList.add('active');
    roleAdminBtn.classList.remove('active');
    renderNavLinks();
    showToast('Beralih ke Mode Siswa (Pemesanan & Antrean)', 'info');
    if (currentView === 'dashboard' || currentView === 'stock' || currentView === 'finance') {
      navigateTo('menu');
    }
  });

  roleAdminBtn.addEventListener('click', () => {
    store.setRole('pengelola');
    roleAdminBtn.classList.add('active');
    roleSiswaBtn.classList.remove('active');
    renderNavLinks();
    showToast('Beralih ke Mode Pengelola Kantin (Dashboard, Stok, Keuangan)', 'info');
    navigateTo('dashboard');
  });

  // Sound toggle button
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  btnSoundToggle.addEventListener('click', () => {
    initAudio();
    isSoundEnabled = !isSoundEnabled;
    btnSoundToggle.innerHTML = isSoundEnabled ? `<span>🔔</span> Suara: ON` : `<span>🔕</span> Suara: OFF`;
    showToast(`Efek suara ${isSoundEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
  });

  // Reset Demo Data
  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('Kembalikan semua data stok, pesanan, dan transaksi ke kondisi awal?')) {
      store.resetDemoData();
      showToast('Data demo berhasil di-reset!', 'success');
      navigateTo(currentView);
    }
  });

  // Quick CTA in navbar
  quickNavCtaBtn.addEventListener('click', () => {
    if (store.currentRole === 'siswa') {
      navigateTo('menu');
    } else {
      navigateTo('dashboard');
    }
  });

  // Nav link delegation
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a[data-target]');
    if (targetLink) {
      e.preventDefault();
      const target = targetLink.getAttribute('data-target');
      navigateTo(target);
      return;
    }

    const scrollLink = e.target.closest('a[data-scroll]');
    if (scrollLink) {
      e.preventDefault();
      const scrollId = scrollLink.getAttribute('data-scroll');
      if (currentView !== 'landing') {
        navigateTo('landing');
        setTimeout(() => {
          document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Direct landing quick nav
    if (e.target.closest('.nav-to-menu')) {
      e.preventDefault();
      navigateTo('menu');
    } else if (e.target.closest('.nav-to-status')) {
      e.preventDefault();
      navigateTo('status');
    } else if (e.target.closest('.nav-to-dashboard')) {
      e.preventDefault();
      store.setRole('pengelola');
      roleAdminBtn.classList.add('active');
      roleSiswaBtn.classList.remove('active');
      navigateTo('dashboard');
    } else if (e.target.closest('.nav-to-stock')) {
      e.preventDefault();
      store.setRole('pengelola');
      roleAdminBtn.classList.add('active');
      roleSiswaBtn.classList.remove('active');
      navigateTo('stock');
    } else if (e.target.closest('.nav-to-finance')) {
      e.preventDefault();
      store.setRole('pengelola');
      roleAdminBtn.classList.add('active');
      roleSiswaBtn.classList.remove('active');
      navigateTo('finance');
    }
  });

  // Hero Section CTA Buttons
  document.getElementById('hero-btn-order')?.addEventListener('click', () => navigateTo('menu'));
  document.getElementById('hero-btn-menu')?.addEventListener('click', () => navigateTo('menu'));
  document.getElementById('btn-start-order-cta')?.addEventListener('click', () => navigateTo('menu'));

  // =========================================================
  // 4. Shopping Cart Drawer
  // =========================================================
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartDrawerSubtotal = document.getElementById('cart-drawer-subtotal');
  const navCartBadge = document.getElementById('nav-cart-badge');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const btnCheckoutFromDrawer = document.getElementById('btn-checkout-from-drawer');

  function openCartDrawer() {
    renderCartDrawer();
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
  }

  btnOpenCart.addEventListener('click', openCartDrawer);
  btnCloseCart.addEventListener('click', closeCartDrawer);
  cartBackdrop.addEventListener('click', closeCartDrawer);

  btnCheckoutFromDrawer.addEventListener('click', () => {
    closeCartDrawer();
    if (store.cart.length === 0) {
      showToast('Keranjang belanja masih kosong!', 'warning');
      return;
    }
    navigateTo('checkout');
  });

  function updateCartBadge() {
    const { count } = store.getCartTotal();
    navCartBadge.textContent = count;
    navCartBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  function renderCartDrawer() {
    updateCartBadge();
    const { subtotal } = store.getCartTotal();
    cartDrawerSubtotal.textContent = formatIDR(subtotal);

    if (store.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="icon">🛒</div>
          <h4 style="font-weight: 700; margin-bottom: 0.5rem; color: #1e293b;">Keranjang Kosong</h4>
          <p style="font-size: 0.85rem;">Yuk pilih makanan lezat untuk menemani waktu istirahatmu!</p>
          <button class="btn btn-primary btn-sm" id="btn-empty-cart-to-menu" style="margin-top: 1rem;">
            Pilih Menu
          </button>
        </div>
      `;
      document.getElementById('btn-empty-cart-to-menu')?.addEventListener('click', () => {
        closeCartDrawer();
        navigateTo('menu');
      });
      btnCheckoutFromDrawer.disabled = true;
      return;
    }

    btnCheckoutFromDrawer.disabled = false;
    cartItemsContainer.innerHTML = store.cart.map(item => `
      <div class="cart-item-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <div class="cart-item-price">${formatIDR(item.price)}</div>
          ${item.note ? `<div class="cart-item-note">Note: ${item.note}</div>` : ''}
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn btn-cart-dec" data-id="${item.id}">-</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn btn-cart-inc" data-id="${item.id}">+</button>
        </div>
      </div>
    `).join('');
  }

  // Cart quantity controls delegation
  cartItemsContainer.addEventListener('click', (e) => {
    const incBtn = e.target.closest('.btn-cart-inc');
    const decBtn = e.target.closest('.btn-cart-dec');
    if (incBtn) {
      const id = incBtn.getAttribute('data-id');
      store.updateCartQty(id, 1);
      playSound('cart');
    } else if (decBtn) {
      const id = decBtn.getAttribute('data-id');
      store.updateCartQty(id, -1);
    }
  });

  store.on('cartUpdated', () => {
    updateCartBadge();
    renderCartDrawer();
    if (currentView === 'checkout') renderCheckout();
  });

  // =========================================================
  // 5. HALAMAN MENU SISWA (Page 2)
  // =========================================================
  const foodCardGrid = document.getElementById('food-card-grid');
  const menuSearchInput = document.getElementById('menu-search-input');
  const menuSortSelect = document.getElementById('menu-sort-select');
  const menuEmptyState = document.getElementById('menu-empty-state');
  const categoryPillsContainer = document.getElementById('category-pills-container');

  let activeCategory = 'all';
  let searchQuery = '';
  let sortBy = 'popular';

  // Category pill click
  categoryPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-btn');
    if (!pill) return;
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    pill.classList.add('active');
    activeCategory = pill.getAttribute('data-category');
    renderMenu();
  });

  // Search input live filter
  menuSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderMenu();
  });

  // Sort dropdown
  menuSortSelect.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderMenu();
  });

  document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
    activeCategory = 'all';
    searchQuery = '';
    menuSearchInput.value = '';
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.pill-btn[data-category="all"]')?.classList.add('active');
    renderMenu();
  });

  function renderMenu() {
    let items = [...store.menu];

    // Filter by Category
    if (activeCategory !== 'all') {
      items = items.filter(it => it.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      items = items.filter(it =>
        it.name.toLowerCase().includes(searchQuery) ||
        it.description.toLowerCase().includes(searchQuery) ||
        it.stan.toLowerCase().includes(searchQuery)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      items.sort((a, b) => b.stock - a.stock);
    } else {
      // popular
      items.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    if (items.length === 0) {
      foodCardGrid.innerHTML = '';
      menuEmptyState.style.display = 'block';
      return;
    }

    menuEmptyState.style.display = 'none';
    foodCardGrid.innerHTML = items.map(item => {
      const stockInfo = store.getStockStatus(item.stock);
      const isOutOfStock = item.stock <= 0;

      return `
        <div class="food-card" data-id="${item.id}">
          <div class="food-img-wrap" data-action="view-detail" data-id="${item.id}" style="cursor: pointer;">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="food-badges-overlay">
              <span class="badge ${stockInfo.class}">
                ${stockInfo.label}
              </span>
              <span class="badge" style="background: rgba(15, 23, 42, 0.75); color: #ffffff; backdrop-filter: blur(4px);">
                ⭐ ${item.rating}
              </span>
            </div>
          </div>

          <div class="food-content">
            <div class="food-meta">
              <span class="food-stan">📍 ${item.stan}</span>
              <span class="food-prep">⏱️ ${item.prepTime}</span>
            </div>
            <h3 class="food-title" data-action="view-detail" data-id="${item.id}" style="cursor: pointer;">
              ${item.name}
            </h3>
            <p class="food-desc">${item.description}</p>

            <div class="food-footer">
              <div class="food-price">
                ${formatIDR(item.price)}
                <small>/ porsi</small>
              </div>

              <button 
                class="btn-add-cart btn-menu-order" 
                data-id="${item.id}"
                ${isOutOfStock ? 'disabled' : ''}
              >
                ${isOutOfStock ? 'Habis' : '+ Pesan'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Food Grid Clicks
  foodCardGrid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-menu-order');
    if (addBtn && !addBtn.disabled) {
      const id = addBtn.getAttribute('data-id');
      const res = store.addToCart(id, 1);
      if (res.success) {
        playSound('cart');
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
      return;
    }

    const detailTrigger = e.target.closest('[data-action="view-detail"]');
    if (detailTrigger) {
      const id = detailTrigger.getAttribute('data-id');
      openFoodDetailModal(id);
    }
  });

  // Food Detail Modal
  const detailModalBackdrop = document.getElementById('food-detail-modal-backdrop');
  const detailModalBody = document.getElementById('detail-modal-body');
  const detailModalFooter = document.getElementById('detail-modal-footer');
  const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');

  function openFoodDetailModal(menuId) {
    const item = store.menu.find(m => m.id === menuId);
    if (!item) return;

    const stockInfo = store.getStockStatus(item.stock);
    const isOutOfStock = item.stock <= 0;

    detailModalBody.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <span class="badge ${stockInfo.class}">${stockInfo.label}</span>
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary-dark);">📍 ${item.stan}</span>
      </div>
      <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">${item.name}</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
        ${item.description}
      </p>

      <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Estimasi Masak:</span>
          <strong>${item.prepTime}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Terjual Hari Ini:</span>
          <strong>${item.soldCount || 0} porsi</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
          <span style="color: var(--text-muted);">Nutrisi & Higienis:</span>
          <span style="color: var(--primary-dark); font-weight: 600;">Lolos Standar Kantin Sehat</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="detail-modal-note">Catatan Khusus untuk Dapur (Opsional)</label>
        <input type="text" id="detail-modal-note" class="form-input" placeholder="Contoh: Tanpa saus pedas, cabai dipisah...">
      </div>
    `;

    detailModalFooter.innerHTML = `
      <div style="font-size: 1.3rem; font-weight: 800; margin-right: auto;">
        ${formatIDR(item.price)}
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-close-detail-modal-action">Tutup</button>
      <button class="btn btn-primary btn-sm" id="btn-detail-add-cart" ${isOutOfStock ? 'disabled' : ''}>
        ${isOutOfStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}
      </button>
    `;

    detailModalBackdrop.classList.add('open');

    document.getElementById('btn-close-detail-modal-action')?.addEventListener('click', () => {
      detailModalBackdrop.classList.remove('open');
    });

    document.getElementById('btn-detail-add-cart')?.addEventListener('click', () => {
      const note = document.getElementById('detail-modal-note')?.value.trim() || '';
      const res = store.addToCart(item.id, 1, note);
      if (res.success) {
        playSound('cart');
        showToast(res.message, 'success');
        detailModalBackdrop.classList.remove('open');
      } else {
        showToast(res.message, 'warning');
      }
    });
  }

  btnCloseDetailModal.addEventListener('click', () => detailModalBackdrop.classList.remove('open'));
  detailModalBackdrop.addEventListener('click', (e) => {
    if (e.target === detailModalBackdrop) detailModalBackdrop.classList.remove('open');
  });

  store.on('menuUpdated', () => {
    renderMenu();
    if (currentView === 'stock') renderStockTable();
    if (currentView === 'dashboard') renderDashboard();
  });

  // =========================================================
  // 6. HALAMAN CHECKOUT (Page 3)
  // =========================================================
  const checkoutItemsList = document.getElementById('checkout-items-list');
  const checkoutSubtotalVal = document.getElementById('checkout-subtotal-val');
  const checkoutTotalVal = document.getElementById('checkout-total-val');
  const btnConfirmOrder = document.getElementById('btn-confirm-order');
  const btnBackToMenu = document.getElementById('btn-back-to-menu-from-checkout');

  btnBackToMenu.addEventListener('click', () => navigateTo('menu'));

  function renderCheckout() {
    const { subtotal } = store.getCartTotal();
    checkoutSubtotalVal.textContent = formatIDR(subtotal);
    checkoutTotalVal.textContent = formatIDR(subtotal);

    if (store.cart.length === 0) {
      checkoutItemsList.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <p>Keranjang pesanan masih kosong.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" onclick="location.hash='#menu'">
            Pilih Menu Sekarang
          </button>
        </div>
      `;
      btnConfirmOrder.disabled = true;
      return;
    }

    btnConfirmOrder.disabled = false;
    checkoutItemsList.innerHTML = store.cart.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border-light); font-size: 0.88rem;">
        <div>
          <strong style="color: var(--text-main);">${item.qty}x ${item.name}</strong>
          ${item.note ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Note: ${item.note}</div>` : ''}
        </div>
        <div style="font-weight: 700; color: var(--text-main);">
          ${formatIDR(item.price * item.qty)}
        </div>
      </div>
    `).join('');
  }

  // Handle Order Confirmation
  btnConfirmOrder.addEventListener('click', () => {
    const studentName = document.getElementById('input-student-name').value.trim();
    const studentClass = document.getElementById('input-student-class').value.trim();
    const orderNotes = document.getElementById('input-order-notes').value.trim();

    if (!studentName || !studentClass) {
      showToast('Mohon lengkapi Nama Siswa dan Kelas!', 'warning');
      return;
    }

    const pickupSlotEl = document.querySelector('input[name="pickup-slot"]:checked');
    const pickupSlot = pickupSlotEl ? pickupSlotEl.value : 'Istirahat 1 (09.45 - 10.15)';

    const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'SmartPay (Saldo Kartu)';

    // Confirm button loading state
    btnConfirmOrder.disabled = true;
    btnConfirmOrder.innerHTML = `<span>⏳</span> Memproses Pesanan & Mengurangi Stok...`;

    setTimeout(() => {
      const result = store.placeOrder({
        studentName,
        studentClass,
        pickupSlot,
        paymentMethod,
        orderNotes
      });

      btnConfirmOrder.disabled = false;
      btnConfirmOrder.innerHTML = `Konfirmasi & Pesan Sekarang 🚀`;

      if (result.success) {
        playSound('order');
        showToast(`Pesanan berhasil dibuat! Nomor Antrean: ${result.order.queueNumber}`, 'success');
        navigateTo('status');
      } else {
        showToast(result.message, 'danger');
      }
    }, 600);
  });

  // =========================================================
  // 7. HALAMAN STATUS PESANAN (Page 4)
  // =========================================================
  const ticketQueueNumber = document.getElementById('ticket-queue-number');
  const ticketStudentInfo = document.getElementById('ticket-student-info');
  const ticketStatusBadge = document.getElementById('ticket-status-badge');
  const ticketEstimatedTime = document.getElementById('ticket-estimated-time');
  const ticketPickupSlot = document.getElementById('ticket-pickup-slot');
  const ticketPaymentMethod = document.getElementById('ticket-payment-method');
  const ticketItemsSummary = document.getElementById('ticket-items-summary');
  const readyAlertBanner = document.getElementById('ready-notification-alert');
  const stepperBarFill = document.getElementById('stepper-bar-fill');
  const stepNodes = [
    document.getElementById('step-node-1'),
    document.getElementById('step-node-2'),
    document.getElementById('step-node-3'),
    document.getElementById('step-node-4')
  ];

  function renderStatusPage() {
    const order = store.getActiveOrder();
    if (!order) {
      ticketQueueNumber.textContent = '#A-000';
      ticketStudentInfo.textContent = 'Belum ada pesanan aktif';
      return;
    }

    ticketQueueNumber.textContent = `#${order.queueNumber}`;
    ticketStudentInfo.innerHTML = `Atas Nama: <strong>${order.studentName}</strong> (${order.studentClass})`;
    ticketPickupSlot.textContent = order.pickupSlot;
    ticketPaymentMethod.textContent = order.paymentMethod;
    ticketItemsSummary.textContent = order.items.map(it => `${it.qty}x ${it.name}`).join(', ');

    // Stepper logic
    // 1: Diterima ('menunggu')
    // 2: Sedang Disiapkan ('diproses')
    // 3: Siap Diambil ('siap')
    // 4: Selesai ('selesai')
    stepNodes.forEach(node => {
      node.classList.remove('active', 'done');
    });

    if (order.status === 'menunggu') {
      ticketStatusBadge.className = 'badge badge-info';
      ticketStatusBadge.textContent = 'Pesanan Diterima Dapur';
      ticketEstimatedTime.textContent = '~8 Menit Lagi';
      stepperBarFill.style.width = '0%';
      stepNodes[0].classList.add('active');
      readyAlertBanner.style.display = 'none';
    } else if (order.status === 'diproses') {
      ticketStatusBadge.className = 'badge badge-warning';
      ticketStatusBadge.textContent = 'Sedang Dimasak / Disiapkan';
      ticketEstimatedTime.textContent = '~4 Menit Lagi';
      stepperBarFill.style.width = '33%';
      stepNodes[0].classList.add('done');
      stepNodes[1].classList.add('active');
      readyAlertBanner.style.display = 'none';
    } else if (order.status === 'siap') {
      ticketStatusBadge.className = 'badge badge-success';
      ticketStatusBadge.textContent = 'Siap Diambil di Stan!';
      ticketEstimatedTime.textContent = 'SEKARANG (Sudah Matang)';
      stepperBarFill.style.width = '66%';
      stepNodes[0].classList.add('done');
      stepNodes[1].classList.add('done');
      stepNodes[2].classList.add('active');
      readyAlertBanner.style.display = 'flex';
    } else if (order.status === 'selesai') {
      ticketStatusBadge.className = 'badge badge-success';
      ticketStatusBadge.textContent = 'Pesanan Selesai';
      ticketEstimatedTime.textContent = 'Pesanan Sudah Diambil';
      stepperBarFill.style.width = '100%';
      stepNodes.forEach(n => n.classList.add('done'));
      stepNodes[3].classList.add('active');
      readyAlertBanner.style.display = 'none';
    }
  }

  // Simulator controls
  document.getElementById('sim-btn-terima')?.addEventListener('click', () => {
    const order = store.getActiveOrder();
    if (order) {
      store.updateOrderStatus(order.id, 'menunggu');
      renderStatusPage();
      showToast('Status disimulasikan: Pesanan Diterima Dapur', 'info');
    }
  });

  document.getElementById('sim-btn-masak')?.addEventListener('click', () => {
    const order = store.getActiveOrder();
    if (order) {
      store.updateOrderStatus(order.id, 'diproses');
      renderStatusPage();
      showToast('Status disimulasikan: Sedang Disiapkan / Dimasak', 'warning');
    }
  });

  document.getElementById('sim-btn-siap')?.addEventListener('click', () => {
    const order = store.getActiveOrder();
    if (order) {
      store.updateOrderStatus(order.id, 'siap');
      renderStatusPage();
      playSound('ready');
      showToast('🔔 Hore! Makanan siap diambil di konter stan!', 'success');
    }
  });

  document.getElementById('sim-btn-selesai')?.addEventListener('click', () => {
    const order = store.getActiveOrder();
    if (order) {
      store.updateOrderStatus(order.id, 'selesai');
      renderStatusPage();
      showToast('Status disimulasikan: Pesanan Selesai Diambil', 'success');
    }
  });

  document.getElementById('btn-print-ticket')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-order-again')?.addEventListener('click', () => {
    navigateTo('menu');
  });

  store.on('ordersUpdated', () => {
    if (currentView === 'status') renderStatusPage();
    if (currentView === 'dashboard') renderDashboard();
    if (currentView === 'finance') renderFinancePage();
  });

  store.on('orderStatusChanged', ({ order, newStatus }) => {
    if (newStatus === 'siap' && store.currentRole === 'siswa') {
      playSound('ready');
      showToast(`🔔 Pesanan #${order.queueNumber} sudah Siap Diambil di ${order.items[0]?.stan || 'Stan Kantin'}!`, 'success');
    }
  });

  // =========================================================
  // 8. DASHBOARD PENGELOLA KANTIN (Page 5)
  // =========================================================
  const metricTodaySales = document.getElementById('metric-today-sales');
  const metricPendingOrders = document.getElementById('metric-pending-orders');
  const metricCompletedOrders = document.getElementById('metric-completed-orders');
  const metricCriticalStock = document.getElementById('metric-critical-stock');
  const dashboardStockAlertsList = document.getElementById('dashboard-stock-alerts-list');
  const alertStockCountBadge = document.getElementById('alert-stock-count-badge');
  const adminOrdersTbody = document.getElementById('admin-orders-tbody');

  let adminOrderFilter = 'all';

  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminOrderFilter = btn.getAttribute('data-status');
      renderDashboard();
    });
  });

  document.getElementById('btn-quick-to-stock')?.addEventListener('click', () => navigateTo('stock'));
  document.getElementById('btn-quick-to-finance')?.addEventListener('click', () => navigateTo('finance'));

  function renderDashboard() {
    // 1. KPI Metrics
    const todaySummary = store.getFinancialSummary('today');
    metricTodaySales.textContent = formatIDR(todaySummary.todayRevenue);

    const pendingCount = store.orders.filter(o => o.status === 'menunggu' || o.status === 'diproses').length;
    metricPendingOrders.textContent = `${pendingCount} Pesanan`;

    const completedCount = store.orders.filter(o => o.status === 'selesai' || o.status === 'siap').length;
    metricCompletedOrders.textContent = `${completedCount} Pesanan`;

    const criticalItems = store.menu.filter(m => m.stock <= 5);
    metricCriticalStock.textContent = `${criticalItems.length} Menu`;
    alertStockCountBadge.textContent = `${criticalItems.length} Item`;

    // 2. Stock Alerts List
    if (criticalItems.length === 0) {
      dashboardStockAlertsList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--primary-dark); font-size: 0.88rem;">
          ✓ Semua stok dalam kondisi aman.
        </div>
      `;
    } else {
      dashboardStockAlertsList.innerHTML = criticalItems.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: var(--radius-md); border-left: 4px solid ${item.stock === 0 ? 'var(--danger)' : 'var(--accent)'};">
          <div>
            <strong style="font-size: 0.88rem; display: block;">${item.name}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Sisa stok: <strong>${item.stock}</strong> porsi</span>
          </div>
          <button class="btn btn-outline-primary btn-sm btn-quick-restock" data-id="${item.id}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
            +5 Stok
          </button>
        </div>
      `).join('');
    }

    // 3. Orders Board Table
    let filteredOrders = [...store.orders];
    if (adminOrderFilter === 'active') {
      filteredOrders = filteredOrders.filter(o => o.status === 'menunggu' || o.status === 'diproses' || o.status === 'siap');
    } else if (adminOrderFilter === 'selesai') {
      filteredOrders = filteredOrders.filter(o => o.status === 'selesai');
    }

    if (filteredOrders.length === 0) {
      adminOrdersTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            Tidak ada pesanan pada filter ini.
          </td>
        </tr>
      `;
    } else {
      adminOrdersTbody.innerHTML = filteredOrders.map(order => {
        let statusBadge = '';
        let actionBtn = '';

        if (order.status === 'menunggu') {
          statusBadge = `<span class="badge badge-info">⏳ Menunggu</span>`;
          actionBtn = `<button class="btn btn-primary btn-sm btn-advance-order" data-id="${order.id}" data-next="diproses">Mulai Masak 🍳</button>`;
        } else if (order.status === 'diproses') {
          statusBadge = `<span class="badge badge-warning">🔥 Dimasak</span>`;
          actionBtn = `<button class="btn btn-accent btn-sm btn-advance-order" data-id="${order.id}" data-next="siap">Siap Diambil 🔔</button>`;
        } else if (order.status === 'siap') {
          statusBadge = `<span class="badge badge-success">✓ Siap Ambil</span>`;
          actionBtn = `<button class="btn btn-secondary btn-sm btn-advance-order" data-id="${order.id}" data-next="selesai">Selesai ✅</button>`;
        } else {
          statusBadge = `<span class="badge badge-success">Selesai</span>`;
          actionBtn = `<span style="font-size: 0.78rem; color: var(--text-muted);">Sudah diambil</span>`;
        }

        const itemsText = order.items.map(i => `${i.qty}x ${i.name}`).join('<br>');

        return `
          <tr>
            <td class="queue-cell">#${order.queueNumber}</td>
            <td>
              <strong>${order.studentName}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${order.studentClass}</div>
            </td>
            <td style="font-size: 0.82rem;">${itemsText}</td>
            <td style="font-size: 0.82rem;">${order.pickupSlot.split(' ')[0]}</td>
            <td style="font-weight: 700;">${formatIDR(order.totalAmount)}</td>
            <td>${statusBadge}</td>
            <td class="order-action-btns">${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }

    // 4. Render Peak Hours Canvas Chart
    drawPeakHoursChart();
  }

  // Quick Restock in Dashboard Alert
  dashboardStockAlertsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-quick-restock');
    if (btn) {
      const id = btn.getAttribute('data-id');
      store.adjustStock(id, 5);
      showToast('Stok berhasil ditambah +5 porsi!', 'success');
    }
  });

  // Advance Order Status from Kitchen Table
  adminOrdersTbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-advance-order');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const nextStatus = btn.getAttribute('data-next');
      store.updateOrderStatus(id, nextStatus);
      showToast(`Status pesanan diperbarui menjadi "${nextStatus}"!`, 'success');
      renderDashboard();
    }
  });

  // Canvas Drawing: Peak Hours School Chart
  function drawPeakHoursChart() {
    const canvas = document.getElementById('sales-canvas-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // School hours data (08.00 - 13.00)
    const labels = ['08:00', '09:00', '09:45 (Ist. 1)', '11:00', '12:00 (Ist. 2)', '13:00'];
    const values = [12, 28, 98, 35, 115, 20]; // Porsi pesanan
    const maxVal = 130;

    const padding = { top: 25, bottom: 40, left: 45, right: 25 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.font = '11px Poppins, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const valLabel = Math.round(maxVal - (maxVal / 4) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(valLabel + ' porsi', padding.left - 8, y + 4);
    }

    // Gradient area under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    const stepX = chartW / (values.length - 1);
    const points = values.map((val, idx) => ({
      x: padding.left + stepX * idx,
      y: padding.top + chartH - (val / maxVal) * chartH
    }));

    // Draw smooth curve area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw points & labels
    ctx.textAlign = 'center';
    points.forEach((pt, i) => {
      // Circle point
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 2 || i === 4 ? '#f97316' : '#10b981';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Peak label highlight
      if (i === 2 || i === 4) {
        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 10px Poppins, sans-serif';
        ctx.fillText('Peak 🔥', pt.x, pt.y - 10);
      }

      // X Axis Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Poppins, sans-serif';
      ctx.fillText(labels[i], pt.x, height - padding.bottom + 18);
    });
  }

  // =========================================================
  // 9. HALAMAN MANAJEMEN STOK (Page 6)
  // =========================================================
  const stockTbody = document.getElementById('stock-tbody');
  const menuModalBackdrop = document.getElementById('menu-modal-backdrop');
  const menuModalTitle = document.getElementById('menu-modal-title');
  const menuForm = document.getElementById('menu-form');
  const menuFormId = document.getElementById('menu-form-id');
  const formMenuName = document.getElementById('form-menu-name');
  const formMenuCategory = document.getElementById('form-menu-category');
  const formMenuPrice = document.getElementById('form-menu-price');
  const formMenuStock = document.getElementById('form-menu-stock');
  const formMenuPreptime = document.getElementById('form-menu-preptime');
  const formMenuDesc = document.getElementById('form-menu-desc');
  const formMenuImage = document.getElementById('form-menu-image');
  const btnOpenAddMenuModal = document.getElementById('btn-open-add-menu-modal');
  const btnCloseMenuModal = document.getElementById('btn-close-menu-modal');
  const btnCancelMenuModal = document.getElementById('btn-cancel-menu-modal');

  function renderStockTable() {
    stockTbody.innerHTML = store.menu.map(item => {
      const stockStatus = store.getStockStatus(item.stock);
      const catLabels = {
        'makanan-berat': '🍛 Makanan Berat',
        'camilan': '🥟 Camilan',
        'minuman': '🥤 Minuman',
        'paket-hemat': '⭐ Paket Hemat',
        'sehat': '🥗 Menu Sehat'
      };

      return `
        <tr data-id="${item.id}">
          <td>
            <div class="stock-item-flex">
              <img src="${item.image}" alt="${item.name}" class="stock-item-thumb">
              <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${item.stan}</div>
              </div>
            </div>
          </td>
          <td>${catLabels[item.category] || item.category}</td>
          <td style="font-weight: 700;">${formatIDR(item.price)}</td>
          <td>
            <div class="stock-qty-editor">
              <input 
                type="number" 
                class="stock-input-field input-live-stock" 
                data-id="${item.id}" 
                value="${item.stock}" 
                min="0"
              >
              <span style="font-size: 0.8rem; color: var(--text-muted);">porsi</span>
            </div>
          </td>
          <td>
            <span class="badge ${stockStatus.class}">
              ${stockStatus.label}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary btn-sm btn-adjust-stock" data-id="${item.id}" data-delta="-1">-1</button>
              <button class="btn btn-secondary btn-sm btn-adjust-stock" data-id="${item.id}" data-delta="5">+5</button>
              <button class="btn btn-secondary btn-sm btn-adjust-stock" data-id="${item.id}" data-delta="15">+15</button>
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm btn-edit-menu" data-id="${item.id}" title="Edit Data Menu">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm btn-delete-menu" data-id="${item.id}" title="Hapus Menu" style="color: var(--danger);">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Stock table events (live input & quick +/-)
  stockTbody.addEventListener('change', (e) => {
    const input = e.target.closest('.input-live-stock');
    if (input) {
      const id = input.getAttribute('data-id');
      const val = parseInt(input.value, 10) || 0;
      store.updateStock(id, val);
      showToast('Stok menu berhasil diperbarui!', 'success');
      renderStockTable();
    }
  });

  stockTbody.addEventListener('click', (e) => {
    const adjustBtn = e.target.closest('.btn-adjust-stock');
    if (adjustBtn) {
      const id = adjustBtn.getAttribute('data-id');
      const delta = parseInt(adjustBtn.getAttribute('data-delta'), 10);
      store.adjustStock(id, delta);
      showToast(`Stok ${delta > 0 ? '+' + delta : delta} diperbarui!`, 'success');
      renderStockTable();
      return;
    }

    const editBtn = e.target.closest('.btn-edit-menu');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      openEditMenuModal(id);
      return;
    }

    const delBtn = e.target.closest('.btn-delete-menu');
    if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      const item = store.menu.find(m => m.id === id);
      if (confirm(`Yakin ingin menghapus menu "${item ? item.name : ''}" dari daftar kantin?`)) {
        store.deleteMenuItem(id);
        showToast('Menu berhasil dihapus.', 'info');
        renderStockTable();
      }
    }
  });

  // Modal Add / Edit Menu
  function openAddMenuModal() {
    menuModalTitle.textContent = 'Tambah Menu Makanan Baru ➕';
    menuFormId.value = '';
    formMenuName.value = '';
    formMenuCategory.value = 'makanan-berat';
    formMenuPrice.value = 15000;
    formMenuStock.value = 20;
    formMenuPreptime.value = '5-7 menit';
    formMenuDesc.value = '';
    menuModalBackdrop.classList.add('open');
  }

  function openEditMenuModal(id) {
    const item = store.menu.find(m => m.id === id);
    if (!item) return;
    menuModalTitle.textContent = 'Edit Data Menu ✏️';
    menuFormId.value = item.id;
    formMenuName.value = item.name;
    formMenuCategory.value = item.category;
    formMenuPrice.value = item.price;
    formMenuStock.value = item.stock;
    formMenuPreptime.value = item.prepTime;
    formMenuDesc.value = item.description;
    formMenuImage.value = item.image;
    menuModalBackdrop.classList.add('open');
  }

  function closeMenuModal() {
    menuModalBackdrop.classList.remove('open');
  }

  btnOpenAddMenuModal.addEventListener('click', openAddMenuModal);
  btnCloseMenuModal.addEventListener('click', closeMenuModal);
  btnCancelMenuModal.addEventListener('click', closeMenuModal);
  menuModalBackdrop.addEventListener('click', (e) => {
    if (e.target === menuModalBackdrop) closeMenuModal();
  });

  menuForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = menuFormId.value;
    const name = formMenuName.value.trim();
    const category = formMenuCategory.value;
    const price = parseInt(formMenuPrice.value, 10) || 10000;
    const stock = parseInt(formMenuStock.value, 10) || 0;
    const prepTime = formMenuPreptime.value.trim() || '5 menit';
    const description = formMenuDesc.value.trim() || 'Menu nikmat kantin sekolah.';
    const image = formMenuImage.value;

    if (!name) return;

    if (id) {
      // Edit
      store.editMenuItem(id, { name, category, price, stock, prepTime, description, image });
      showToast(`Menu "${name}" berhasil diperbarui!`, 'success');
    } else {
      // Add
      store.addMenuItem({ name, category, price, stock, prepTime, description, image });
      showToast(`Menu baru "${name}" berhasil ditambahkan!`, 'success');
    }

    closeMenuModal();
    renderStockTable();
  });

  // =========================================================
  // 10. HALAMAN LAPORAN KEUANGAN (Page 7)
  // =========================================================
  const financeTodayRev = document.getElementById('finance-today-rev');
  const financeWeeklyRev = document.getElementById('finance-weekly-rev');
  const financeMonthlyRev = document.getElementById('finance-monthly-rev');
  const financeTopSellersList = document.getElementById('finance-top-sellers-list');
  const financeTransactionsTbody = document.getElementById('finance-transactions-tbody');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnPrintFinance = document.getElementById('btn-print-finance');

  let activePeriod = 'today';

  document.querySelectorAll('.finance-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.finance-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePeriod = btn.getAttribute('data-period');
      renderFinancePage();
    });
  });

  function renderFinancePage() {
    const summary = store.getFinancialSummary(activePeriod);

    financeTodayRev.textContent = formatIDR(summary.todayRevenue);
    financeWeeklyRev.textContent = formatIDR(summary.weeklyRevenue);
    financeMonthlyRev.textContent = formatIDR(summary.monthlyRevenue);

    // Render Top Sellers
    const maxSales = summary.topSelling.length > 0 ? summary.topSelling[0].count : 1;
    financeTopSellersList.innerHTML = summary.topSelling.map((it, idx) => {
      const pct = Math.round((it.count / maxSales) * 100);
      return `
        <li class="seller-item">
          <div class="seller-info-row">
            <span>#${idx + 1} ${it.name}</span>
            <span style="color: var(--primary-dark);">${it.count} porsi (${formatIDR(it.revenue)})</span>
          </div>
          <div class="seller-progress-bg">
            <div class="seller-progress-bar" style="width: ${pct}%;"></div>
          </div>
        </li>
      `;
    }).join('');

    // Render Transactions Table
    financeTransactionsTbody.innerHTML = summary.filteredLogs.map(log => `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: #475569;">${log.id}</td>
        <td>${log.date} <span style="color: var(--text-muted); font-size: 0.8rem;">${log.time}</span></td>
        <td style="font-weight: 800; color: var(--primary-dark);">#${log.queue}</td>
        <td><strong>${log.student}</strong></td>
        <td style="font-weight: 700;">${formatIDR(log.amount)}</td>
        <td><span class="badge badge-info">${log.method}</span></td>
        <td><span class="badge badge-success">✓ ${log.status}</span></td>
      </tr>
    `).join('');

    // Draw Weekly Revenue Canvas
    drawRevenueChart();
  }

  function drawRevenueChart() {
    const canvas = document.getElementById('finance-revenue-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const revenues = [210000, 280000, 310000, 245000, 375000]; // Sample week
    const maxRev = 400000;

    const pad = { top: 25, bottom: 40, left: 65, right: 20 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    // Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.font = '10px Poppins, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      const val = Math.round(maxRev - (maxRev / 4) * i);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.fillText(formatIDR(val), pad.left - 8, y + 4);
    }

    // Bar chart
    const barWidth = 42;
    const gap = (chartW - (barWidth * days.length)) / (days.length + 1);

    days.forEach((day, i) => {
      const x = pad.left + gap + i * (barWidth + gap);
      const barH = (revenues[i] / maxRev) * chartH;
      const y = pad.top + chartH - barH;

      // Rounded Bar
      ctx.fillStyle = i === 4 ? '#10b981' : '#34d399';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [8, 8, 0, 0]);
      ctx.fill();

      // Top value
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatIDR(revenues[i]), x + barWidth / 2, y - 6);

      // Day label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Poppins, sans-serif';
      ctx.fillText(day, x + barWidth / 2, height - pad.bottom + 18);
    });
  }

  // Export CSV Action
  btnExportCsv.addEventListener('click', () => {
    const summary = store.getFinancialSummary(activePeriod);
    const headers = "ID Transaksi,Tanggal,Jam,Nomor Antrean,Nama Siswa,Nominal (Rp),Metode Bayar,Status\n";
    const rows = summary.filteredLogs.map(l =>
      `"${l.id}","${l.date}","${l.time}","${l.queue}","${l.student}",${l.amount},"${l.method}","${l.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_SmartCanteen_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File laporan CSV berhasil diunduh!', 'success');
  });

  btnPrintFinance.addEventListener('click', () => {
    window.print();
  });

  // =========================================================
  // 11. Initial Application Boot
  // =========================================================
  renderNavLinks();
  updateCartBadge();

  // Check URL hash for initial route
  const initialHash = window.location.hash.replace('#', '');
  if (views[initialHash]) {
    navigateTo(initialHash);
  } else {
    navigateTo('landing');
  }

  console.log("🥗 SmartCanteen Web App Initialized Successfully.");
});
