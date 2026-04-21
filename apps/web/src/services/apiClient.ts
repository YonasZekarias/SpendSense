import axios, { type AxiosInstance } from "axios";

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

const API_BASE_URL = RAW_API_BASE_URL.replace("://localhost", "://127.0.0.1");

export function createApiClient(getAccessToken?: () => string | null): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken?.();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

