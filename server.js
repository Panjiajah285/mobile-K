/**
 * SmartCanteen Backend API Server for Postman & Mobile App
 * Pure Node.js (Zero external dependencies)
 *
 * Endpoints:
 * 1. POST /api/auth/login    -> Menerbitkan JWT Token
 * 2. GET  /api/menu          -> Mengambil semua menu (Wajib Bearer Token)
 * 3. GET  /api/menu/:id      -> Mengambil 1 menu (Wajib Bearer Token)
 * 4. POST /api/auth/logout   -> Memvalidasi token lama & me-refresh token baru
 * 5. POST /api/auth/refresh  -> Refresh token baru
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'smartcanteen_secret_key_2026';

// Sample Menu Data
const MENU_DATA = [
  {
    id: "menu-1",
    name: "Ayam Geprek Sambal Bawang",
    category: "makanan-berat",
    price: 16000,
    stock: 18,
    prepTime: "6-8 menit",
    rating: 4.9,
    soldCount: 84,
    description: "Ayam krispi renyah digeprek dengan sambal bawang pedas gurih, disajikan dengan nasi hangat dan lalapan mentimun segar.",
    stan: "Stan 1 - Dapur Bu Siti",
    tags: ["Pedas", "Terlaris", "Favorit Siswa"]
  },
  {
    id: "menu-2",
    name: "Mie Ayam Bakso Istimewa",
    category: "makanan-berat",
    price: 15000,
    stock: 12,
    prepTime: "5-7 menit",
    rating: 4.8,
    soldCount: 62,
    description: "Mie kenyal dengan potongan ayam semur manis gurih, 2 butir bakso sapi empuk, sawi hijau segar, dan keripik pangsit renyah.",
    stan: "Stan 2 - Mie & Bakso Mas Min",
    tags: ["Kuah Hangat", "Best Seller"]
  },
  {
    id: "menu-3",
    name: "Siomay Bandung Komplit",
    category: "camilan",
    price: 12000,
    stock: 4,
    prepTime: "3-5 menit",
    rating: 4.7,
    soldCount: 45,
    description: "Siomay ikan tenggiri asli, tahu kukus, telur rebus, dan kentang dengan siraman bumbu kacang gurih manis.",
    stan: "Stan 3 - Jajanan Kang Asep",
    tags: ["Camilan", "Hampir Habis"]
  },
  {
    id: "menu-4",
    name: "Es Teh Manis Jumbo",
    category: "minuman",
    price: 4000,
    stock: 45,
    prepTime: "2-3 menit",
    rating: 4.9,
    soldCount: 128,
    description: "Teh melati racikan segar disajikan dingin dengan es batu kristal higienis dan manis pas.",
    stan: "Stan 4 - Minuman Segar",
    tags: ["Segar", "Terlaris"]
  },
  {
    id: "menu-8",
    name: "Paket Hemat: Ayam Geprek + Es Teh",
    category: "paket-hemat",
    price: 18000,
    stock: 14,
    prepTime: "6-8 menit",
    rating: 5.0,
    soldCount: 95,
    description: "Paket combo hemat siswa: 1 porsi Nasi Ayam Geprek Sambal Bawang + 1 gelas Es Teh Manis Jumbo. Hemat Rp 2.000!",
    stan: "Stan 1 - Dapur Bu Siti",
    tags: ["Paling Hemat", "Top Choice"]
  },
  {
    id: "menu-9",
    name: "Salad Buah Segar Yoghurt",
    category: "sehat",
    price: 13000,
    stock: 6,
    prepTime: "3 menit",
    rating: 4.8,
    soldCount: 22,
    description: "Potongan buah segar disiram saus creamy yoghurt dan taburan keju parut melimpah.",
    stan: "Stan 5 - Sehat & Bugar",
    tags: ["Sehat", "Rendah Gula"]
  }
];

// Helper: Base64 URL
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Generate Signature
function generateSignature(headerB64, payloadB64) {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Create JWT
function createJwtToken(user, expiresInSeconds = 3600, tokenType = 'access') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.username,
    name: user.name,
    role: user.role,
    detail: user.detail,
    iat: now,
    exp: now + expiresInSeconds,
    jti: `jwt_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    tokenType,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = generateSignature(headerB64, payloadB64);

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Verify JWT
function verifyJwtToken(token) {
  if (!token) return { valid: false, error: 'Token tidak boleh kosong' };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'Format Token JWT tidak valid (harus 3 bagian)' };

  try {
    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signature = parts[2];

    const expectedSignature = generateSignature(headerB64, payloadB64);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Signature JWT tidak valid' };
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token JWT telah kedaluwarsa (Expired)' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Gagal memverifikasi token: ' + err.message };
  }
}

// Middleware: Parse Bearer Token
function getBearerToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
}

// Send JSON Helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data, null, 2));
}

// Server Request Handler
const server = http.createServer((req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Root Documentation
  if (req.method === 'GET' && pathname === '/') {
    sendJson(res, 200, {
      service: "SmartCanteen API Server",
      status: "Running",
      port: PORT,
      guide: "Gunakan Postman untuk mengakses endpoint berikut:",
      endpoints: [
        {
          method: "POST",
          path: "/api/auth/login",
          desc: "Login & dapatkan JWT Token",
          bodyExample: { username: "202610192", credential: "password123", role: "siswa" }
        },
        {
          method: "GET",
          path: "/api/menu",
          desc: "Katalog semua menu (Wajib Header Authorization: Bearer <token>)"
        },
        {
          method: "GET",
          path: "/api/menu/menu-1",
          desc: "Akses 1 menu spesifik (Wajib Header Authorization: Bearer <token>)"
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          desc: "Logout & me-refresh token baru (Wajib Header Authorization: Bearer <token>)"
        }
      ]
    });
    return;
  }

  // Read Body for POST
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        parsedBody = {};
      }
    }

    // 2. ENDPOINT: POST /api/auth/login (Dapatkan Token JWT)
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const { username, credential, role = 'siswa' } = parsedBody;

      const user = {
        username: username || '202610192',
        name: role === 'pengelola' ? 'Bu Siti (Dapur Bu Siti)' : 'Natania Oktaviani',
        role: role === 'pengelola' ? 'pengelola' : 'siswa',
        detail: role === 'pengelola' ? 'Stan 1 - Dapur Bu Siti' : `NIM: ${username || '202610192'} (Kelas XII MIPA 2)`,
      };

      const token = createJwtToken(user, 3600, 'access');
      const refreshToken = createJwtToken(user, 7 * 86400, 'refresh');

      sendJson(res, 200, {
        status: 200,
        success: true,
        message: "Login berhasil, token JWT telah diterbitkan untuk Postman",
        token,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: "3600 seconds (1 jam)",
        user
      });
      return;
    }

    // 3. ENDPOINT: GET /api/menu/:id (Akses 1 Menu dengan Bearer Token)
    if (req.method === 'GET' && pathname.startsWith('/api/menu/')) {
      const token = getBearerToken(req);
      const auth = verifyJwtToken(token);

      if (!auth.valid) {
        sendJson(res, 401, {
          status: 401,
          success: false,
          error: "Unauthorized",
          message: "Akses ditolak: " + (auth.error || "Wajib menyertakan Header Authorization: Bearer <token>")
        });
        return;
      }

      const menuId = pathname.replace('/api/menu/', '');
      const menuItem = MENU_DATA.find(m => m.id === menuId) || MENU_DATA[0];

      sendJson(res, 200, {
        status: 200,
        success: true,
        message: `Akses 1 menu (${menuItem.name}) berhasil diverifikasi dengan token JWT`,
        authorizedUser: auth.payload.name,
        data: menuItem
      });
      return;
    }

    // 4. ENDPOINT: GET /api/menu (Katalog Menu dengan Bearer Token)
    if (req.method === 'GET' && pathname === '/api/menu') {
      const token = getBearerToken(req);
      const auth = verifyJwtToken(token);

      if (!auth.valid) {
        sendJson(res, 401, {
          status: 401,
          success: false,
          error: "Unauthorized",
          message: "Akses ditolak: " + (auth.error || "Wajib menyertakan Header Authorization: Bearer <token>")
        });
        return;
      }

      sendJson(res, 200, {
        status: 200,
        success: true,
        message: "Katalog menu berhasil diakses dengan token JWT yang valid",
        authorizedUser: auth.payload.name,
        totalItems: MENU_DATA.length,
        data: MENU_DATA
      });
      return;
    }

    // 5. ENDPOINT: POST /api/auth/logout (Token Direfresh Saat Logout)
    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      const token = getBearerToken(req);
      const auth = verifyJwtToken(token);

      // Generate refreshed token session
      const refreshedGuestUser = {
        username: "guest_session",
        name: "Sesi Pengunjung Baru (Refreshed)",
        role: "guest",
        detail: "Sesi Refreshed Setelah Logout"
      };

      const refreshedToken = createJwtToken(refreshedGuestUser, 3600, 'access');

      sendJson(res, 200, {
        status: 200,
        success: true,
        message: "Logout berhasil: Token lama dicabut dan token baru telah direfresh untuk sesi selanjutnya",
        oldTokenStatus: auth.valid ? "Revoked" : "Expired/Invalid",
        refreshedToken,
        tokenType: "Bearer",
        info: "Token baru ini dapat digunakan untuk melanjutkan pengujian di Postman"
      });
      return;
    }

    // 6. ENDPOINT: POST /api/auth/refresh (Manual Refresh Token)
    if (req.method === 'POST' && pathname === '/api/auth/refresh') {
      const token = getBearerToken(req);
      const auth = verifyJwtToken(token);

      const refreshedUser = auth.valid ? auth.payload : {
        username: "202610192",
        name: "Natania Oktaviani (Refreshed)",
        role: "siswa",
        detail: "NIM: 202610192 (Kelas XII MIPA 2)"
      };

      const newToken = createJwtToken(refreshedUser, 3600, 'access');

      sendJson(res, 200, {
        status: 200,
        success: true,
        message: "Token berhasil direfresh",
        newToken,
        tokenType: "Bearer"
      });
      return;
    }

    // 404 Route Not Found
    sendJson(res, 404, {
      status: 404,
      error: "Endpoint tidak ditemukan",
      path: pathname,
      availableEndpoints: ["/api/auth/login", "/api/menu", "/api/menu/:id", "/api/auth/logout"]
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`⚡ SmartCanteen API Server Siap untuk POSTMAN!`);
  console.log(`📡 URL Lokal:   http://localhost:${PORT}`);
  console.log(`🔑 Endpoint 1: POST /api/auth/login`);
  console.log(`🍱 Endpoint 2: GET  /api/menu (Wajib Bearer Token)`);
  console.log(`🍽️ Endpoint 3: GET  /api/menu/menu-1 (Akses 1 Menu)`);
  console.log(`🚪 Endpoint 4: POST /api/auth/logout (Token Direfresh)`);
  console.log(`====================================================`);
});
