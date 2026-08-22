import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/regulator/",
  withCredentials: true, // crucial for cookies
});

let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refreshing if the request is checking auth status or trying to refresh already
    const skipRefreshUrls = ["auth/me/", "token/refresh/"];
    const shouldSkipRefresh = skipRefreshUrls.some((url) => 
      originalRequest.url?.includes(url)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await axiosInstance.post("token/refresh/"); // no payload; token is in cookie
          isRefreshing = false;

          // Retry original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          // Optionally handle forced logout here if refresh token is completely dead
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;