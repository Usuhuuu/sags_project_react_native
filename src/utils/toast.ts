import { router } from "expo-router";
import Toast from "react-native-toast-message";

type ToastKind = "success" | "error" | "warn" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  alertType?: ToastKind;
  onPress?: () => void;
};

/** Centralized toast wrapper used by the app. */
export const showToast = ({
  title,
  description,
  alertType = "info",
  onPress,
}: ToastOptions) => {
  Toast.show({
    type: alertType === "warn" ? "warning" : alertType,
    text1: title,
    text2: description,
    onPress:
      title === "Please Login"
        ? () => router.replace("/(drawer)/(user)/(tab-user)/profile")
        : onPress,
  });
};
