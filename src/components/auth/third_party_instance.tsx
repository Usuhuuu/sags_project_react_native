import { Alert, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  LoginManager,
  Settings,
  AuthenticationToken,
  AccessToken,
} from "react-native-fbsdk-next";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { trackingStatusPermission } from "@/hooks/permissions";
import { showToast } from "@/utils/toast";

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
      showToast({
        title: "Login Cancelled",
        description: "Try again later",
          alertType: "warn",
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
          showToast({
            title: "Facebook Login Failed",
            description: "Network Error",
          alertType: "error",
          });
          break;
        case 190:
          showToast({
            title: "Facebook Login Failed",
            description: "Invalid Token",
          alertType: "error",
          });
          break;
        case 10:
          showToast({
            title: "Facebook Login Failed",
            description: "App not set up correctly",
          alertType: "error",
          });
          break;
        case 429:
          showToast({
            title: "Facebook Login Failed",
            description: "Too Many Requests",
          alertType: "error",
          });
          break;
        default:
          showToast({
            title: "Facebook Login Failed",
            description: "Something went wrong. Try again later.",
          alertType: "error",
          });
      }
    } else {
      showToast({
        title: "Login failed",
        description: "Please try again later",
          alertType: "error",
      });
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
          showToast({
            title: "Login progressing",
            description: "Please Wait a few minut",
          alertType: "warn",
          });
        case statusCodes.SIGN_IN_CANCELLED:
          showToast({
            title: "Login Cancelled",
            description: "Try again later",
          alertType: "warn",
          });
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          showToast({
            title: "Login Failed",
            description: "Serves has problem, try again later",
          alertType: "error",
          });
      }
    }
  }
};

export const loginWithApple = () => {};
