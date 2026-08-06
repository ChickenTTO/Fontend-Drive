import axiosClient from "./axiosClient";

export const freightTripApi = {
  createTrip: (data) => axiosClient.post("/trips", data),
  getAllTrips: (params) => axiosClient.get("/trips", { params }),
  getTripById: (id) => axiosClient.get(`/trips/${id}`),
  updateTrip: (id, data) => axiosClient.put(`/trips/${id}`, data),
  updateTripStatus: (id, status) => axiosClient.put(`/trips/${id}/status`, { status }),
  cancelTrip: (id) => axiosClient.put(`/trips/${id}/cancel`),
  dispatchTrip: (id, data) => axiosClient.put(`/trips/${id}/dispatch`, data),
  recommendVehicles: (params) => axiosClient.get("/trips/recommend-vehicles", { params }),
};
