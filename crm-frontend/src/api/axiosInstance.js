import axios from "axios";

const API = axios.create({
  // Direct Live Render URL
  baseURL: "https://crm-backend-api-f15i.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
