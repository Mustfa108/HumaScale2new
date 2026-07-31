import { userApi, adminApi } from './client';

/* ============================================================
   Public / User Auth endpoints
   ============================================================ */
export const authApi = {
  register: (payload) => userApi.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => userApi.post('/auth/login', payload).then((r) => r.data),
  logout: () => userApi.post('/auth/logout').then((r) => r.data),
  me: () => userApi.get('/auth/me').then((r) => r.data),
  changePassword: (payload) =>
    userApi.post('/auth/change-password', payload).then((r) => r.data),
  forgotPassword: (payload) =>
    userApi.post('/auth/forgot-password', payload).then((r) => r.data),
  resetPassword: (payload) =>
    userApi.post('/auth/reset-password', payload).then((r) => r.data),
  resendVerification: () =>
    userApi.post('/auth/email/resend').then((r) => r.data),
  verifyEmail: (id, hash) =>
    userApi.get(`/auth/verify-email/${id}/${hash}`).then((r) => r.data),
};

/* ============================================================
   Admin Auth endpoints
   ============================================================ */
export const adminAuthApi = {
  login: (payload) => adminApi.post('/admin/login', payload).then((r) => r.data),
  logout: () => adminApi.post('/admin/logout').then((r) => r.data),
  me: () => adminApi.get('/admin/me').then((r) => r.data),
};
