import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Notifier, NotifierComponents } from "react-native-notifier";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiUrl = process.env.EXPO_PUBLIC_BASE_URL ?? "http://localhost:3000"; //"https://8f9e-118-176-174-110.ngrok-free.app";

const tokenWithRetry = async (
  maxRetry: number = 3,
  maxInterval: number = 300,
) => {
  let token = null;
  let retry = 0;
  token = await SecureStore.getItemAsync("Tokens");
  while (!token && retry <= maxRetry) {
    token = await SecureStore.getItemAsync("Tokens");
    if (!token) {
      retry++;
      await new Promise((resolve) => setTimeout(resolve, maxInterval));
    }
  }
  if (!token) {
    Notifier.showNotification({
      title: "Oops",
      description: "Please login in to process",
      Component: NotifierComponents.Alert,
      componentProps: { alertType: "warn" },
    });
    throw new Error("could't find Token");
  }
  return token;
};
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
    const token = await tokenWithRetry();

    const hallVersion = (await AsyncStorage.getItem("hall_version")) ?? "0";
    if (hallVersion) {
      config.headers["x-hall-version"] = hallVersion;
    }

    if (!token) {
      Notifier.showNotification({
        title: "Oops",
        description: "Please login in to process",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "warn" },
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
        } catch (refreshError) {
          console.log("Try again later sda");
        }
      }
    }
    if (
      error.response &&
      error.response.status === 409 &&
      error.response?.data?.code === "OUTDATED_VERSION" &&
      !originalRequest._versionRetry
    ) {
      originalRequest._versionRetry = true;
      const hallResponse = await axiosInstanceRegular.get("/api/halls");
      console.log(hallResponse.data.length);
      originalRequest.headers["x-hall-version"] = hallResponse.data.version;
      await AsyncStorage.setItem(
        "hall_version",
        String(hallResponse.data.version),
      );
      await AsyncStorage.setItem("hall_infos", hallResponse.data.hallData);
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
