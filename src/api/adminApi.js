import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/attendance/",
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Get Admin Dashboard Statistics
 */
export const getAdminDashboard = async () => {
  const response = await API.get("admin/dashboard/");
  return response.data;
};

/**
 * Get all attendance records with optional filters.
 *
 * Supported filters:
 * - date
 * - student
 * - subject
 * - staff
 * - status
 */
export const getAttendanceRecords = async (filters = {}) => {
  const response = await API.get("admin/attendance/", {
    params: filters,
  });

  return response.data;
};