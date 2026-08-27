import { userApi } from './client';

export const preferencesApi = {
  get: () => userApi.get('/profile/preferences').then((r) => r.data),
  update: (payload) => userApi.patch('/profile/preferences', payload).then((r) => r.data),
};
