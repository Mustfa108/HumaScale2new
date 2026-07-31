import { adminApi } from './client';

export const adminApi_ = {
  dashboard: () => adminApi.get('/admin/dashboard').then((r) => r.data),
  users: (params = {}) =>
    adminApi.get('/admin/users', { params }).then((r) => r.data),
  assessments: (params = {}) =>
    adminApi.get('/admin/assessments', { params }).then((r) => r.data),
  assessment: (id) =>
    adminApi.get(`/admin/assessments/${id}`).then((r) => r.data),
  pillarAnalytics: () =>
    adminApi.get('/admin/analytics/pillars').then((r) => r.data),
};
