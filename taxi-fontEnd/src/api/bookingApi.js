import axiosClient from "./axiosClient";

const bookingApi = {
  // Get all bookings/trips
  getAll: () => axiosClient.get("/bookings"),
  
  // Get booking by ID
  getById: (id) => axiosClient.get(`/bookings/${id}`),
  
  // Create new booking/trip
  create: (data) => axiosClient.post("/bookings", data),
  
  // Update booking/trip
  update: (id, data) => axiosClient.put(`/bookings/${id}`, data),
  
  // Delete booking/trip
  delete: (id) => axiosClient.delete(`/bookings/${id}`),
  
  // Assign driver to booking
  assignDriver: (id, data) => axiosClient.put(`/bookings/${id}/assign`, data),
  
  // Alias for assignDriver (for compatibility)
  assign: (id, data) => axiosClient.put(`/bookings/${id}/assign`, data),
  
  // Update booking status
  updateStatus: (id, status) => axiosClient.put(`/bookings/${id}/status`, { status }),
  
  // Cancel booking
  cancel: (id) => axiosClient.put(`/bookings/${id}/cancel`),
  
  // Complete booking
  complete: (id) => axiosClient.put(`/bookings/${id}/complete`),
};

export default bookingApi;