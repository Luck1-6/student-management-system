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

/**
 * Update attendance record
 */
export const updateAttendance = async (id, data) => {
  const response = await API.patch(
    `admin/attendance/${id}/`,
    data
  );

  return response.data;
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (id) => {
  const response = await API.delete(
    `admin/attendance/${id}/delete/`
  );

  return response.data;
};

export const getSubjects = async () => {
  const response = await API.get("subjects/");
  return response.data;
};

/**
 * Get Attendance Analytics
 */
export const getAttendanceAnalytics = async () => {
  const response = await API.get("admin/analytics/");
  return response.data;
};

export const getStudentAttendanceReport = async (studentId) => {
  const response = await API.get(
    `admin/student-report/${studentId}/`
  );

  return response.data;
};

/**
 * Get Staff Performance Report
 */
export const getStaffPerformance = async () => {
  const response = await API.get("admin/staff-performance/");
  return response.data;
};

export const getLowAttendanceStudents = async (threshold = 75) => {
  const response = await API.get(
    `admin/low-attendance/?threshold=${threshold}`
  );

  return response.data;
};