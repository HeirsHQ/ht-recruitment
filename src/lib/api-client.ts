import axios, { AxiosInstance, AxiosError } from "axios";
import { toast } from "sonner";

export function createApiClient(accessToken: string): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://self.3.255.113.184.nip.io/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Encrypted": "true",
    },
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        toast.error("Unauthorized access. Please log in again.");
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
