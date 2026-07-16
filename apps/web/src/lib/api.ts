// src/lib/axios.ts
import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

import { type ApiError } from "@ecom/shared/src/type/api";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL
    // import.meta.env.MODE === "production"
    //   ? import.meta.env.VITE_API_URL // set this in production env
    //   : "http://localhost:3000", // my local express port
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
    const message =
  axios.isAxiosError(error) && error.response?.data
    ? (error.response.data as { error?: string }).error || "Something went wrong"
    : "Something went wrong";

    console.log("API Error: ", message);

    throw new Error(message);
  },
);

export default api;
