import axiosClient from "./axiosClient";

export const depotApi = {
  getAllDepots: () => axiosClient.get("/depots"),
  getDepotById: (id) => axiosClient.get(`/depots/${id}`),
};
