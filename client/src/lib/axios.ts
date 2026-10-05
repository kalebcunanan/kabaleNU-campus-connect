import axios, { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
}

// Single shared instance so every request sends the httpOnly JWT cookie.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Extracts the server's { message } so forms can show it through setError.
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response) return error.response.data?.message ?? 'Request failed';
    return 'Unable to reach the server';
  }
  return 'Something went wrong';
};

export default api;
