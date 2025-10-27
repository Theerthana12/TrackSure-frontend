import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ point directly to backend
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("tracksure_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const fetchAlerts = () => API.get("/alerts");
