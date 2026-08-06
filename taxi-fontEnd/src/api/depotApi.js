import axiosClient from "./axiosClient";

export const depotApi = {
  getAllDepots: () => axiosClient.get("/depots"),
  getDepotById: (id) => axiosClient.get(`/depots/${id}`),
  createDepot: (data) => axiosClient.post("/depots", data),
  updateDepot: (id, data) => axiosClient.put(`/depots/${id}`, data),
  deleteDepot: (id) => axiosClient.delete(`/depots/${id}`),
};
