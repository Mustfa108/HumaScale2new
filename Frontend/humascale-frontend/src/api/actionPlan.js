import { userApi } from './client';

export const actionPlanApi = {
  updateStatus: (id, status) =>
    userApi.patch(`/action-plan/items/${id}`, { status }).then((r) => r.data),
};
