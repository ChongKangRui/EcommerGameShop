// src/lib/axios.ts
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

import { flashMessage_Failed } from "./flash";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL // set this in production env
      : "http://localhost:3000", // my local express port,
  validateStatus: (status) => status >= 200 && status < 400,
});

// this include the jwt token everytime it sent a request to the endpoint
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 429) {
      const msg = "Too many requests, please slow down.";
      flashMessage_Failed(msg);
      throw new Error(msg);
    }

    const message =
      axios.isAxiosError(error) && error.response?.data
        ? (error.response.data as { error?: string }).error ||
          "Something went wrong"
        : "Something went wrong";

    console.log("API Error: ", message);
    throw new Error(message);
  },
);

export default api;
