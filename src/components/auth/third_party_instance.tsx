import { Alert, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  LoginManager,
  Settings,
  AuthenticationToken,
  AccessToken,
} from "react-native-fbsdk-next";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import * as Sentry from "@sentry/react-native";
import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { trackingStatusPermission } from "@/hooks/permissions";
import { Notifier, NotifierComponents } from "react-native-notifier";

export const loginWithFacebook = async () => {
  try {
    Settings.initializeSDK();
    trackingStatusPermission();

    LoginManager.logOut();
    const result = await LoginManager.logInWithPermissions(
      ["public_profile", "email"],
      "limited",
    );
    console.log(result);

    if (result.isCancelled) {
      Notifier.showNotification({
        title: "Login Cancelled",
        description: "Try again later",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "warn" },
      });
      return { modalVisible: false, data: null };
    }
    const data = await (Platform.OS === "ios"
      ? AuthenticationToken.getAuthenticationTokenIOS().then(
          (data) => data?.authenticationToken,
        )
      : AccessToken.getCurrentAccessToken().then((data) => data?.accessToken));

    if (data) {
      const response = await axiosInstanceRegular.post(
        "/api/facebook",
        {
          fbData: {
            accessToken: data,
          },
        },
        {
          timeout: 5000,
        },
      );
      if (response.status === 201 && response.data.success) {
        return {
          modalVisible: true,
          path: "facebook",
          data: response.data,
        };
      } else if (response.status === 200 && response.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );

        return {
          modalVisible: false,
          data: { message: response.data.message, success: true },
        };
      }
    }
  } catch (error: any) {
    console.log("Facebook Login Error:", error);
    console.log("Facebook Login Error:", error.message);

    if (error.code) {
      switch (error.code) {
        case 1:
          Notifier.showNotification({
            title: "Facebook Login Failed",
            description: "Network Error",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
          break;
        case 190:
          Notifier.showNotification({
            title: "Facebook Login Failed",
            description: "Invalid Token",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
          break;
        case 10:
          Notifier.showNotification({
            title: "Facebook Login Failed",
            description: "App not set up correctly",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
          break;
        case 429:
          Notifier.showNotification({
            title: "Facebook Login Failed",
            description: "Too Many Requests",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
          break;
        default:
          Sentry.captureException(error);
          Notifier.showNotification({
            title: "Facebook Login Failed",
            description: "Something went wrong. Try again later.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
      }
    } else {
      Notifier.showNotification({
        title: "Login failed",
        description: "Please try again later",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
      Sentry.captureException(error);
    }

    return { modalVisible: false, data: null };
  }
};

export const loginWithGoogle = async (googleAccessToken: string) => {
  try {
    const response = await axiosInstanceRegular.post("/api/google", {
      accessToken: googleAccessToken,
    });
    const responseData = response.data;

    if (
      response.status === 200 &&
      responseData.success &&
      responseData.accessToken &&
      responseData.refreshToken
    ) {
      await SecureStore.setItemAsync(
        "Tokens",
        JSON.stringify({
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
        }),
      );
      return {
        modalVisible: false,
        success: true,
        data: { message: responseData.message, success: true },
      };
    } else if (
      response.status === 201 &&
      responseData.success &&
      responseData.data.signUpTimer
    ) {
      return {
        modalVisible: true,
        path: "google",
        data: responseData,
      };
    }
  } catch (err: any) {
    console.log("Google Login Error:", err);
    if (isErrorWithCode(err)) {
      switch (err.code) {
        case statusCodes.IN_PROGRESS:
          Notifier.showNotification({
            title: "Login progressing",
            description: "Please Wait a few minut",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
        case statusCodes.SIGN_IN_CANCELLED:
          Notifier.showNotification({
            title: "Login Cancelled",
            description: "Try again later",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Notifier.showNotification({
            title: "Login Failed",
            description: "Serves has problem, try again later",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
      }
    } else {
      Sentry.captureException("Server Has Problem Try Again Later ");
    }
  }
};

export const loginWithApple = () => {};
