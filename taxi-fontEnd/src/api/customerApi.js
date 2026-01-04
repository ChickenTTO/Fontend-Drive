import axiosClient from "./axiosClient";

const customerApi = {
  getAll: () => axiosClient.get("/customers"),
  getById: (id) => axiosClient.get(`/customers/${id}`),
  create: (data) => axiosClient.post("/customers", data),
  update: (id, data) => axiosClient.put(`/customers/${id}`, data),
  delete: (id) => axiosClient.delete(`/customers/${id}`),
};

export default customerApi;
