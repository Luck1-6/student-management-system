// src/api/attendanceApi.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/attendance/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getStudents = () =>
  API.get("students/");

export const markAttendance = (data) =>
  API.post("mark/", data);

export const updateAttendance = (id, data) =>
  API.put(`update/${id}/`, data);

export default API;