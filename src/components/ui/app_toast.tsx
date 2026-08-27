import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type {
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { useTheme } from "@/context/theme_context";

type ToastVariant = "success" | "error" | "warning" | "info";

const icons: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  warning: "warning",
  info: "information-circle",
};

const AppToast = ({ text1, text2, type }: ToastConfigParams<unknown>) => {
  const { theme } = useTheme();
  const variant =
    (type as ToastVariant) in icons ? (type as ToastVariant) : "info";
  const accent = {
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  }[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
          borderLeftColor: accent,
        },
      ]}
    >
      <Ionicons name={icons[variant]} size={25} color={accent} />
      <View style={styles.copy}>
        {!!text1 && (
          <Text
            style={[
              styles.title,
              { color: theme === "dark" ? "#F9FAFB" : "#111827" },
            ]}
          >
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text
            style={[
              styles.message,
              { color: theme === "dark" ? "#D1D5DB" : "#4B5563" },
            ]}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => <AppToast {...props} />,
  error: (props) => <AppToast {...props} />,
  warning: (props) => <AppToast {...props} />,
  info: (props) => <AppToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    width: "92%",
    minHeight: 64,
    borderRadius: 14,
    borderLeftWidth: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "700" },
  message: { fontSize: 13, lineHeight: 18 },
});
