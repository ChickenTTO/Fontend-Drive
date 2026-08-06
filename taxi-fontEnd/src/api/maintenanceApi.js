import axiosClient from "./axiosClient";

const maintenanceApi = {
  getAll: (params) => axiosClient.get("/maintenance", { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  create: (data) => axiosClient.post("/maintenance", data),
  update: (id, data) => axiosClient.put(`/maintenance/${id}`, data),
  delete: (id) => axiosClient.delete(`/maintenance/${id}`),
};

export { maintenanceApi };
export default maintenanceApi;
