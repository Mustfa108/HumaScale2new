import { userApi } from './client';

export const notificationApi = {
  list: (params = {}) => userApi.get('/notifications', { params }).then((r) => r.data),
  markRead: (id) =>
    userApi.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    userApi.post('/notifications/read-all').then((r) => r.data),
};
