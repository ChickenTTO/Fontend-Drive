import axiosClient from "./axiosClient";

export const freightTripApi = {
  createTrip: (data) => axiosClient.post("/trips", data),
  getAllTrips: (params) => axiosClient.get("/trips", { params }),
  getTripById: (id) => axiosClient.get(`/trips/${id}`),
  updateTripStatus: (id, status) => axiosClient.put(`/trips/${id}/status`, { status }),
};
