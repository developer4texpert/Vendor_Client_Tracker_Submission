import axios from "axios";

const coreApi = axios.create({
  baseURL: "http://127.0.0.1:8000/",  // for client/ and vendor/
});

// 🔎 Log every request with the full URL & method
coreApi.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
  console.log("🌐 API Request:", (config.method || "GET").toUpperCase(), fullUrl);
  return config;
});

export default coreApi;
