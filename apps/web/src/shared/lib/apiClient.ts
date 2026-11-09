import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/config/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const data = error.response?.data as any;
    const errorMessage = data?.message || 'An unexpected error occurred';

    // Do not intercept 401s for login, register, or refresh-token itself
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || 
                        originalRequest?.url?.includes('/auth/register') ||
                        originalRequest?.url?.includes('/auth/refresh-token');

    // Handle 401 Unauthorized (Silent Token Refresh)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('Refresh token expired. Please log in again.');
        if (typeof window !== "undefined") {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login'; 
        }
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);
