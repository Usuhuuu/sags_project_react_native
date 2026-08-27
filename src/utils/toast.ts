import Toast from "react-native-toast-message";

type ToastKind = "success" | "error" | "warn" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  alertType?: ToastKind;
};

/** Centralized toast wrapper used by the app. */
export const showToast = ({
  title,
  description,
  alertType = "info",
}: ToastOptions) => {
  Toast.show({
  type: alertType === "warn" ? "warning" : alertType,
    text1: title,
    text2: description,
  });
};
