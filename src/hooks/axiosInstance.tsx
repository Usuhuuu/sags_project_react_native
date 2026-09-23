import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { showToast } from "@/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiUrl = process.env.EXPO_PUBLIC_BASE_URL;

// Create the main axios instance for normal requests

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 4000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-app-source": "MobileApp",
  },
});

export const axiosInstanceRegular = axios.create({
  baseURL: apiUrl,
  timeout: 4000,
  headers: {
    "Content-Type": "application/json",
    "x-app-source": "MobileApp",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("Tokens");

    const hallVersion = Number(
      (await AsyncStorage.getItem("hall_version")) ?? 0,
    );
    if (hallVersion) {
      config.headers["x-hall-version"] = hallVersion;
    }

    if (!token) {
      showToast({
        title: "Oops",
        description: "Please login in to process",
        alertType: "warn",
      });
      config.headers.Authorization = null;

      throw {
        message: "could't find Token",
        errors: ["Please login to process", "Token is required"],
      };
    }
    const { accessToken } = JSON.parse(token);
    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status == 401 &&
      error.response.data.success == false &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const token = await SecureStore.getItemAsync("Tokens");
      const notificationToken =
        await SecureStore.getItemAsync("notificationToken");
      if (token) {
        const { refreshToken } = JSON.parse(token);
        try {
          const newAccessToken = await axiosInstanceRegular.post(
            "/auth/refresh",
            { notificationToken },
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );
          switch (true) {
            case newAccessToken.status === 400 &&
              newAccessToken.data.loginAgain: {
              await SecureStore.deleteItemAsync("Tokens");
              break;
            }

            case newAccessToken.status === 400 &&
              !newAccessToken.data.loginAgain: {
              await SecureStore.deleteItemAsync("Tokens");
              break;
            }

            case newAccessToken.status === 200 && newAccessToken.data.success: {
              await SecureStore.setItemAsync(
                "Tokens",
                JSON.stringify({
                  accessToken: newAccessToken.data.newAccessToken,
                  refreshToken,
                }),
              );
              originalRequest.headers.Authorization = `Bearer ${newAccessToken.data.newAccessToken}`;
              return axiosInstance(originalRequest);
            }
            default:
              break;
          }
        } catch {
          console.log("refresh error");
        }
      }
    } else if (
      error.response &&
      error.response.status === 409 &&
      error.response?.data?.code === "OUTDATED_VERSION" &&
      !originalRequest._versionRetry
    ) {
      originalRequest._versionRetry = true;
      const hallResponse = await axiosInstanceRegular.get("/api/hall");
      console.log("HALL_LENGHT", hallResponse.data.hall.length);
      originalRequest.headers["x-hall-version"] = hallResponse.data.version;
      await AsyncStorage.setItem(
        "hall_version",
        String(hallResponse.data.version),
      );
      await AsyncStorage.setItem(
        "hall_infos",
        JSON.stringify(hallResponse.data.hall),
      );
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
