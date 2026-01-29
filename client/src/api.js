import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://civic-pulse-server:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

//this line add for a commit to github test 
