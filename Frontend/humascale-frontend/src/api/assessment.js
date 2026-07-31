import { userApi } from './client';

export const assessmentApi = {
  getQuestions: () => userApi.get('/assessment/questions').then((r) => r.data),
  start: () => userApi.post('/assessment/start').then((r) => r.data),
  submit: (id, payload) =>
    userApi.post(`/assessment/${id}/submit`, payload).then((r) => r.data),
  results: (id) => userApi.get(`/assessment/${id}/results`).then((r) => r.data),
  history: (params = {}) =>
    userApi.get('/assessment/history', { params }).then((r) => r.data),
};
