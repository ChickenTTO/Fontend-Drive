import axiosClient from "./axiosClient";

const vehicleApi = {
  getAll: (params) => axiosClient.get("/vehicles", { params }),
  getById: (id) => axiosClient.get(`/vehicles/${id}`),
  create: (data) => axiosClient.post("/vehicles", data),
  update: (id, data) => axiosClient.put(`/vehicles/${id}`, data),
  delete: (id) => axiosClient.delete(`/vehicles/${id}`),
  addMaintenance: (id, data) => axiosClient.post(`/vehicles/${id}/maintenance`, data),
  getMaintenanceHistory: (id) => axiosClient.get(`/vehicles/${id}/maintenance`),
  getRevenue: (id) => axiosClient.get(`/vehicles/${id}/revenue`),
};

export default vehicleApi;
