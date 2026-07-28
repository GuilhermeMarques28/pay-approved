import axios, { AxiosError, AxiosResponse } from 'axios';
import { serverConfig } from '@/config/server';

const axiosInstance = axios.create({
  baseURL: serverConfig.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

axiosInstance.interceptors.request.use((request) => request);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    return Promise.reject(err);
  }
);

export const setAuthorizationHeader = (token: string) => {
  axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
};

export const getInstance = () => axiosInstance;

export const getCleanInstance = (url: string) =>
  axios.create({
    baseURL: url,
    timeout: 120000,
  });
