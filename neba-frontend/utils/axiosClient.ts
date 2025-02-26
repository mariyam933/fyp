import axios from 'axios';

// Set base API URLs for production and development
const apiUrlProd = process.env.NEXT_PUBLIC_API_URL_PROD;
const apiUrlDev = process.env.NEXT_PUBLIC_API_URL_DEV;

// Create an Axios instance
export const axiosClient = axios.create({
  baseURL: apiUrlProd || apiUrlDev,
  withCredentials: true,
});

// Add an interceptor to include the Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("survey_auth");
    const token = authData ? JSON.parse(authData).token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
