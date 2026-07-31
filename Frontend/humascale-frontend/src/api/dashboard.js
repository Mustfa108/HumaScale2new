import { userApi } from './client';

export const dashboardApi = {
  get: () => userApi.get('/dashboard').then((r) => r.data),
};
