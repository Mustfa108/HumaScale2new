import axios from 'axios';

/**
 * Resolve the API base URL.
 *
 * - In dev, leave VITE_API_BASE_URL empty to use the Vite proxy (same-origin /api).
 * - In production, set VITE_API_BASE_URL to the full public Laravel API URL
 *   (including the /api prefix), e.g. https://api.humascale.com/api
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '/api';

const TOKEN_KEYS = {
  user: 'humascale_user_token',
  admin: 'humascale_admin_token',
};

const USER_KEYS = {
  user: 'humascale_user',
  admin: 'humascale_admin',
};

/**
 * Build the axios instance.
 * - `actor` is the storage namespace ('user' or 'admin'). It tells the
 *   interceptor which token + cached user to read/write.
 */
export function createApiClient(actor = 'user') {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 30000,
  });

  // Attach auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEYS[actor]);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Centralized error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Network error
      if (!error.response) {
        return Promise.reject({
          message:
            'تعذّر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
          isNetworkError: true,
        });
      }

      const { status, data } = error.response;

      // 401: token expired or invalid → force logout for protected actors
      if (status === 401 && (actor === 'user' || actor === 'admin')) {
        const path = window.location.pathname;
        const isOnAuthPage =
          path.startsWith('/login') ||
          path.startsWith('/register') ||
          path.startsWith('/forgot-password') ||
          path.startsWith('/reset-password') ||
          path.startsWith('/admin/login');
        if (!isOnAuthPage) {
          localStorage.removeItem(TOKEN_KEYS[actor]);
          localStorage.removeItem(USER_KEYS[actor]);
          // Soft redirect; the AuthContext will pick up the change on next render
          if (actor === 'admin') {
            window.location.replace('/admin/login');
          } else {
            window.location.replace('/login');
          }
        }
      }

      // Normalize Laravel validation errors and ApiResponse errors
      const message =
        data?.message ||
        (status === 422 && data?.errors
          ? Object.values(data.errors).flat()[0]
          : null) ||
        'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

      return Promise.reject({
        status,
        message,
        errors: data?.errors || null,
        raw: error,
      });
    },
  );

  return client;
}

export const userApi = createApiClient('user');
export const adminApi = createApiClient('admin');

export const tokenKeys = TOKEN_KEYS;
export const userKeys = USER_KEYS;
