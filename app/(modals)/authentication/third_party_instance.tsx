import { Alert, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  LoginManager,
  Settings,
  AuthenticationToken,
  AccessToken,
} from "react-native-fbsdk-next";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import * as Sentry from "@sentry/react-native";
import {
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getTrackingStatus } from "react-native-tracking-transparency";

export const loginWithFacebook = async () => {
  try {
    Settings.initializeSDK();
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

    LoginManager.logOut();
    const result = await LoginManager.logInWithPermissions(
      ["public_profile", "email"],
      "limited"
    );
    console.log(result);

    if (result.isCancelled) {
      Alert.alert("Login cancelled");
      return { modalVisible: false, data: null };
    }
    const data = await (Platform.OS === "ios"
      ? AuthenticationToken.getAuthenticationTokenIOS().then(
          (data) => data?.authenticationToken
        )
      : AccessToken.getCurrentAccessToken().then((data) => data?.accessToken));

    if (data) {
      const response = await axiosInstanceRegular.post("/api/facebook", {
        fbData: {
          accessToken: data,
        },
      });
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
          })
        );

        return {
          modalVisible: false,
          data: { message: response.data.message },
        };
      }
    }
  } catch (error: any) {
    console.log("Facebook Login Error:", error);
    console.log("Facebook Login Error:", error.message);

    if (error.code) {
      switch (error.code) {
        case 1:
          Alert.alert("Network error");
          break;
        case 190:
          Alert.alert("Invalid Access Token");
          break;
        case 10:
          Alert.alert("App not set up correctly");
          break;
        case 429:
          Alert.alert("Too Many Requests");
          break;
        default:
          Sentry.captureException(error);
          Alert.alert("Unknown Error", "Something went wrong.");
      }
    } else {
      Alert.alert("Login failed", "Please try again later.");
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
        })
      );
      return {
        modalVisible: false,
        success: true,
        data: { message: responseData.message },
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
          Alert.alert("progressing");
        case statusCodes.SIGN_IN_CANCELLED:
          Alert.alert("User canceled process");
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert("service not available");
      }
    } else {
      Sentry.captureException("Server Has Problem Try Again Later ");
    }
  }
};

export const loginWithApple = () => {};
