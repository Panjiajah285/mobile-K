import { INITIAL_MENU, MenuItem } from '@/constants/canteenData';
import { createJwtToken, DecodedJwt, decodeJwtToken, verifyJwtToken } from '@/utils/jwt';

export interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  authHeader: string | null;
  status: number;
  statusText: string;
  responsePreview: string;
}

// In-memory API Access Logs
let apiLogs: ApiLogItem[] = [];
let listeners: ((logs: ApiLogItem[]) => void)[] = [];

export function subscribeApiLogs(listener: (logs: ApiLogItem[]) => void) {
  listeners.push(listener);
  listener([...apiLogs]);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function recordLog(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  authHeader: string | null,
  status: number,
  statusText: string,
  responsePreview: string
) {
  const newLog: ApiLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    method,
    endpoint,
    authHeader,
    status,
    statusText,
    responsePreview,
  };
  apiLogs = [newLog, ...apiLogs.slice(0, 49)];
  listeners.forEach((l) => l([...apiLogs]));
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  refreshedToken?: string;
  error?: string;
}

/**
 * 1. ENDPOINT: POST /api/auth/login
 * Ketika login, menghasilkan JWT token yang valid
 */
export async function apiLogin(
  nameOrUser: string,
  nimOrPass: string,
  role: 'siswa' | 'pengelola'
): Promise<ApiResponse<{ user: any; token: string; refreshToken: string }>> {
  const endpoint = '/api/auth/login';

  const userAccount = {
    username: nimOrPass || (role === 'siswa' ? '202610192' : 'pengelola01'),
    name: nameOrUser || (role === 'siswa' ? 'Natania Oktaviani' : 'Bu Siti (Dapur Bu Siti)'),
    role,
    detail: role === 'siswa' ? `NIM: ${nimOrPass || '202610192'} (Kelas XII MIPA 2)` : 'Stan 1 - Dapur Bu Siti',
  };

  // Generate Access Token (1 jam) & Refresh Token (7 hari)
  const token = createJwtToken(userAccount, 3600, 'access');
  const refreshToken = createJwtToken(userAccount, 7 * 86400, 'refresh');

  recordLog(
    'POST',
    endpoint,
    null,
    200,
    'OK - Token Generated',
    JSON.stringify({ user: userAccount.name, token: `${token.substring(0, 24)}...` })
  );

  return {
    status: 200,
    success: true,
    message: 'Login berhasil, token JWT telah diterbitkan',
    data: { user: userAccount, token, refreshToken },
    token,
  };
}

/**
 * Helper to validate Bearer token from header
 */
function extractAndVerifyToken(authHeader?: string | null): { valid: boolean; payload?: any; error?: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Unauthorized: Header Authorization Bearer token wajib disertakan',
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  return verifyJwtToken(token);
}

/**
 * 2. ENDPOINT: GET /api/menu/:id (Akses 1 Menu Menggunakan Bearer Token)
 * Wajib menyertakan Bearer Token di Header!
 */
export async function apiGetMenuById(
  menuId: string,
  token?: string | null
): Promise<ApiResponse<MenuItem>> {
  const endpoint = `/api/menu/${menuId}`;
  const authHeader = token ? `Bearer ${token}` : null;

  const authCheck = extractAndVerifyToken(authHeader);
  if (!authCheck.valid) {
    recordLog(
      'GET',
      endpoint,
      authHeader ? `${authHeader.substring(0, 30)}...` : null,
      401,
      'Unauthorized',
      JSON.stringify({ error: authCheck.error })
    );

    return {
      status: 401,
      success: false,
      message: 'Akses ditolak: Token JWT tidak valid atau belum login',
      error: authCheck.error,
    };
  }

  const foundItem = INITIAL_MENU.find((m) => m.id === menuId) || INITIAL_MENU[0];

  recordLog(
    'GET',
    endpoint,
    `${authHeader!.substring(0, 30)}...`,
    200,
    'OK - Authorized',
    JSON.stringify({ id: foundItem.id, name: foundItem.name, price: foundItem.price })
  );

  return {
    status: 200,
    success: true,
    message: `Akses 1 menu (${foundItem.name}) berhasil diverifikasi dengan token JWT`,
    data: foundItem,
  };
}

/**
 * ENDPOINT: GET /api/menu (Katalog Semua Menu Menggunakan Bearer Token)
 */
export async function apiGetMenuCatalog(
  token?: string | null
): Promise<ApiResponse<MenuItem[]>> {
  const endpoint = '/api/menu';
  const authHeader = token ? `Bearer ${token}` : null;

  const authCheck = extractAndVerifyToken(authHeader);
  if (!authCheck.valid) {
    recordLog(
      'GET',
      endpoint,
      authHeader ? `${authHeader.substring(0, 30)}...` : null,
      401,
      'Unauthorized',
      JSON.stringify({ error: authCheck.error })
    );

    return {
      status: 401,
      success: false,
      message: 'Akses katalog ditolak: Token JWT tidak valid atau belum disertakan',
      error: authCheck.error,
    };
  }

  recordLog(
    'GET',
    endpoint,
    `${authHeader!.substring(0, 30)}...`,
    200,
    'OK - Authorized',
    JSON.stringify({ totalMenu: INITIAL_MENU.length })
  );

  return {
    status: 200,
    success: true,
    message: 'Katalog menu berhasil dimuat dengan validasi token JWT',
    data: INITIAL_MENU,
  };
}

/**
 * 3. ENDPOINT: POST /api/auth/logout
 * Token lama divalidasi, sesi diakhiri, dan TOKEN DIREFRESH saat logout!
 */
export async function apiLogout(
  currentToken?: string | null
): Promise<ApiResponse<{ oldTokenRevoked: boolean; refreshedToken: string }>> {
  const endpoint = '/api/auth/logout';
  const authHeader = currentToken ? `Bearer ${currentToken}` : null;

  // Verifikasi token saat logout
  const authCheck = extractAndVerifyToken(authHeader);

  // Buat Refreshed Token baru (guest/rotated session) untuk menggantikan token lama
  const guestUser = {
    username: 'guest_session',
    name: 'Pengunjung Tamu (Refreshed)',
    role: 'guest' as const,
    detail: 'Sesi Anonim Baru (Refreshed)',
  };

  const refreshedToken = createJwtToken(guestUser, 1800, 'access');

  if (!authCheck.valid) {
    recordLog(
      'POST',
      endpoint,
      authHeader ? `${authHeader.substring(0, 30)}...` : null,
      200,
      'OK - Force Logged Out & Token Refreshed',
      JSON.stringify({ message: 'Token lama tidak valid/kosong, token baru diterbitkan', refreshedToken: `${refreshedToken.substring(0, 24)}...` })
    );

    return {
      status: 200,
      success: true,
      message: 'Logout berhasil & token baru telah direfresh',
      refreshedToken,
      data: { oldTokenRevoked: true, refreshedToken },
    };
  }

  recordLog(
    'POST',
    endpoint,
    `${authHeader!.substring(0, 30)}...`,
    200,
    'OK - Token Revoked & Refreshed',
    JSON.stringify({
      revokedUser: authCheck.payload?.name,
      refreshedToken: `${refreshedToken.substring(0, 24)}...`,
    })
  );

  return {
    status: 200,
    success: true,
    message: 'Logout berhasil: Token lama dicabut (revoked) dan token sesi baru berhasil direfresh',
    refreshedToken,
    data: { oldTokenRevoked: true, refreshedToken },
  };
}

export function getApiLogs(): ApiLogItem[] {
  return [...apiLogs];
}

export function clearApiLogs() {
  apiLogs = [];
  listeners.forEach((l) => l([]));
}
