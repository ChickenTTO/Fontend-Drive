import axiosClient from "./axiosClient";

export const handoverApi = {
  createHandover: (data) => axiosClient.post("/handovers", data),
  getHandoversByTrip: (tripId) => axiosClient.get(`/handovers/trip/${tripId}`),
};

export const expenseApi = {
  createExpense: (data) => axiosClient.post("/expenses", data),
  getAllExpenses: (params) => axiosClient.get("/expenses", { params }),
  approveExpense: (id, approvalNote) => axiosClient.put(`/expenses/${id}/approve`, { approvalNote }),
  rejectExpense: (id, rejectionReason) => axiosClient.put(`/expenses/${id}/reject`, { rejectionReason }),
};

export const futaReportApi = {
  getDashboardStats: () => axiosClient.get("/reports/dashboard"),
};
