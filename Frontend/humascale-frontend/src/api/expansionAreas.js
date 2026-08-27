import { userApi } from './client';

export const expansionAreasApi = {
  list: () => userApi.get('/expansion-areas').then((r) => r.data),
  create: (payload) => userApi.post('/expansion-areas', payload).then((r) => r.data),
  update: (id, payload) => userApi.patch(`/expansion-areas/${id}`, payload).then((r) => r.data),
  remove: (id) => userApi.delete(`/expansion-areas/${id}`).then((r) => r.data),
};
