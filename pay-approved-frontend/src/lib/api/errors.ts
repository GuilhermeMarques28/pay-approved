import { AxiosError } from 'axios';

export interface IApiError {
  url: string | undefined;
  method: string | undefined;
  headers: Record<string, unknown>;
  data: any;
  response: any;
  status: number | null;
  message: string;
}

export const handleAxiosError = (err: AxiosError): IApiError => {
  const error: IApiError = {
    data: err.config?.data,
    headers: (err.config?.headers ?? {}) as Record<string, unknown>,
    message: err.message,
    method: err.config?.method,
    response: null,
    status: null,
    url: err.config?.url,
  };
  if (err.response) {
    error.response = err.response.data;
    error.status = err.response.status;
  }
  return error;
};