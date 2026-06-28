import * as Calendar from "expo-calendar";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getTrackingStatus } from "react-native-tracking-transparency";
import { Settings } from "react-native-fbsdk-next";
import * as Location from "expo-location";
import * as SecureStorage from "expo-secure-store";
import * as Notification from "expo-notifications";
import { axiosInstanceRegular } from "./axiosInstance";

export const calendarPermission = async () => {
  try {
    const permissionsString = await AsyncStorage.getItem("Permissions");
    const permissions = permissionsString ? JSON.parse(permissionsString) : {};
    const savedStatus = permissions.calendar;
    if (savedStatus && ["denied", "granted"].includes(savedStatus)) {
      return;
    } else {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted" || status === "denied") {
        const updatedPermissions = { ...permissions, calendar: status };
        await AsyncStorage.setItem(
          "Permissions",
          JSON.stringify(updatedPermissions),
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const reminderPermission = async () => {
  try {
    const permissionsString = await AsyncStorage.getItem("Permissions");
    const permissions = permissionsString ? JSON.parse(permissionsString) : {};
    const savedStatus = permissions.reminder;
    if (savedStatus && ["denied", "granted"].includes(savedStatus)) {
      return;
    } else {
      const { status } = await Calendar.requestRemindersPermissionsAsync();
      const updatedPermissions = { ...permissions, reminder: status };
      await AsyncStorage.setItem(
        "Permissions",
        JSON.stringify(updatedPermissions),
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const cameraPermission = async () => {
  try {
    const permissionsString = await AsyncStorage.getItem("Permissions");
    const permissions = permissionsString ? JSON.parse(permissionsString) : {};
    const savedStatus = permissions.camera;
    if (savedStatus && ["denied", "granted"].includes(savedStatus)) {
      return;
    } else {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted" || status === "denied") {
        const updatedPermissions = { ...permissions, camera: status };
        await AsyncStorage.setItem(
          "Permissions",
          JSON.stringify(updatedPermissions),
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
};
// used for facebook
export const trackingStatusPermission = async () => {
  if (Platform.OS === "ios") {
    const trackStatus = await getTrackingStatus();
    if (trackStatus === "authorized" || trackStatus === "unavailable") {
      await Settings.setAdvertiserTrackingEnabled(true);
    } else if (trackStatus === "denied") {
      await Settings.setAdvertiserTrackingEnabled(false);
    }
  } else {
    await Settings.setAdvertiserTrackingEnabled(true);
  }
};

export const requestLocationPermission = async () => {
  try {
    const rawAllPermission = await AsyncStorage.getItem("Permissions");
    const allPermission = rawAllPermission ? JSON.parse(rawAllPermission) : {};
    const hasLocationPermission = allPermission.location;
    if (
      hasLocationPermission &&
      ["granted", "denied"].includes(hasLocationPermission)
    ) {
      return;
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted" || status === "denied") {
        const updatedPermissions = {
          ...allPermission,
          location: status,
        };
        await AsyncStorage.setItem(
          "Permissions",
          JSON.stringify(updatedPermissions),
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const notificationPermission = async () => {
  try {
    let token: string | null =
      await SecureStorage.getItemAsync("notificationToken");
    if (token === null) {
      const { status } = await Notification.requestPermissionsAsync();
      if (status === "granted") {
        const pushToken = await Notification.getExpoPushTokenAsync();
        token = pushToken.data;

        await SecureStorage.setItemAsync("notificationToken", token);

        await axiosInstanceRegular.post("/token-update", {
          token,
        });
      } else {
        console.log("Notification permission not granted");
      }
    }
  } catch (err) {
    console.error("Notification permission error:", err);
  }
};
