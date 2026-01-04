import axiosClient from "./axiosClient";

const driverApi = {
  // Get all drivers
  getAll: () => axiosClient.get("/drivers"),
  
  // Get driver by ID
  getById: (id) => axiosClient.get(`/drivers/${id}`),
  
  // Create new driver
  create: (data) => axiosClient.post("/drivers", data),
  
  // Update driver
  update: (id, data) => axiosClient.put(`/drivers/${id}`, data),
  
  // Delete driver
  delete: (id) => axiosClient.delete(`/drivers/${id}`),
  
  // Get driver statistics
  getStats: (id) => axiosClient.get(`/drivers/${id}/stats`),
  
  // Assign vehicle to driver
  assignVehicle: (id, vehicleId) => axiosClient.put(`/drivers/${id}/assign-vehicle`, { vehicleId }),
};

export default driverApi;