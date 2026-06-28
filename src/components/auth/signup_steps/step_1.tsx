import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme_context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { LoginInput } from "@/app/auth/signup";
import AppText from "@/components/ui/app_text";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";

// ── Props ──────────────────────────────────────────────────────────────────
interface SignupOneProps {
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  formData: Pick<LoginInput, "userName" | "firstName" | "lastName">;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
}

// ── Shared static input styles ────────────────────────────────────────────
const sharedInputStyles = StyleSheet.create({
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
});

// ── Memoized input field ───────────────────────────────────────────────────
const InputField = memo(
  ({
    label,
    value,
    onChangeText,
    colors,
    autoCapitalize,
    rightIcon,
    rightIconColor,
    onRightPress,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    colors: any;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    rightIcon?: string;
    rightIconColor?: string;
    onRightPress?: () => void;
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View
        style={[
          sharedInputStyles.inputWrapper,
          {
            backgroundColor: colors.surfaceHigh,
            borderColor: focused ? colors.accentPrimary : colors.border,
          },
        ]}
      >
        <RNTextInput
          autoCapitalize={autoCapitalize ?? "none"}
          placeholder={label}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            sharedInputStyles.input,
            { color: colors.themeColorTextPure },
          ]}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            disabled={!onRightPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={rightIconColor ?? colors.outline}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (Colors: any) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },

    // ── Header ──
    headerSection: {
      marginBottom: 36,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: Colors.onSurface,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: Colors.outline,
      lineHeight: 21,
    },

    // ── Avatar ──
    avatarSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    avatarOuter: {
      position: "relative",
    },
    avatarCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: Colors.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.surfaceHigh,
      borderStyle: "dashed",
    },
    avatarAddBtn: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: Colors.accentPrimary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },

    // ── Form ──
    formSection: {
      gap: 14,
    },
    usernameStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      paddingLeft: 2,
    },
    usernameStatusText: {
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
    },
    retryBtn: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 8,
    },
    retryText: {
      fontSize: 12,
      fontWeight: "700",
    },

    // ── Bottom button ──
    bottomSection: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    continueBtn: {
      height: 54,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      elevation: 1,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    continueBtnText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

// ── Component ──────────────────────────────────────────────────────────────
const SignupOne = ({
  setSteps,
  steps,
  formData,
  setFormData,
}: SignupOneProps) => {
  const { colors: Colors } = useTheme();
  const styles = createStyles(Colors);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Check username availability ──
  const checkUsername = useCallback(async (name: string) => {
    setUsernameStatus("checking");
    try {
      const res = await axiosInstanceRegular.get(
        `/checkunique?unique_user_ID=${encodeURIComponent(name)}`,
      );
      if (res.data?.user_id_available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch {
      setUsernameStatus("error");
    }
  }, []);

  // ── Debounced username check ──
  useEffect(() => {
    const name = formData.userName?.trim();
    if (!name || name.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      checkUsername(name);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.userName, checkUsername]);

  const handleContinue = useCallback(() => {
    const username = formData.userName?.trim();
    if (!username) {
      Notifier.showNotification({
        title: "Username required",
        description: "Please enter a username to continue",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
      return;
    }
    if (username.length < 3) {
      Notifier.showNotification({
        title: "Username too short",
        description: "Username must be at least 3 characters",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
      return;
    }
    if (usernameStatus !== "available") {
      if (usernameStatus === "checking") {
        Notifier.showNotification({
          title: "Still checking",
          description: "Please wait while we verify your username",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else if (usernameStatus === "taken") {
        Notifier.showNotification({
          title: "Username taken",
          description: "Please choose a different username",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else if (usernameStatus === "error") {
        Notifier.showNotification({
          title: "Verification failed",
          description: "Could not verify username. Try again later.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else {
        Notifier.showNotification({
          title: "Username not verified",
          description: "Enter a username and wait for verification",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
      return;
    }
    setSteps?.((prev) => prev + 1);
  }, [formData.userName, usernameStatus, setSteps]);

  const canContinue = usernameStatus === "available";

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: Colors.backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.headerSection}>
            <AppText style={styles.title}>Create your profile</AppText>
            <AppText style={styles.subtitle}>Tell people who you are</AppText>
          </View>

          {/* ── Avatar ── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarCircle}>
                <Entypo name="camera" size={36} color={Colors.outline} />
              </View>
              <TouchableOpacity activeOpacity={0.7} style={styles.avatarAddBtn}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Form ── */}
          <View style={styles.formSection}>
            <InputField
              label="First Name"
              value={formData.firstName ?? ""}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, firstName: text }))
              }
              colors={Colors}
              autoCapitalize="words"
            />
            <InputField
              label="Last Name"
              value={formData.lastName ?? ""}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, lastName: text }))
              }
              colors={Colors}
              autoCapitalize="words"
            />
            <View style={{ position: "relative" }}>
              <InputField
                label="Username"
                value={formData.userName ?? ""}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, userName: text }))
                }
                colors={Colors}
              />
              {/* Status row */}
              {usernameStatus !== "idle" && (
                <View style={styles.usernameStatusRow}>
                  {usernameStatus === "checking" ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.accentPrimary}
                      style={{ marginRight: 6 }}
                    />
                  ) : usernameStatus === "available" ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#22C55E"
                      style={{ marginRight: 6 }}
                    />
                  ) : usernameStatus === "taken" ? (
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color="#EF4444"
                      style={{ marginRight: 6 }}
                    />
                  ) : null}
                  <AppText
                    style={[
                      styles.usernameStatusText,
                      {
                        color:
                          usernameStatus === "available"
                            ? "#22C55E"
                            : usernameStatus === "taken"
                              ? "#EF4444"
                              : Colors.outline,
                      },
                    ]}
                  >
                    {usernameStatus === "checking"
                      ? "Checking availability..."
                      : usernameStatus === "available"
                        ? "Username is available"
                        : usernameStatus === "taken"
                          ? "Username is already taken"
                          : "Could not verify username"}
                  </AppText>
                  {usernameStatus === "error" && (
                    <TouchableOpacity
                      style={[
                        styles.retryBtn,
                        { backgroundColor: Colors.borderSubtle },
                      ]}
                      onPress={() => {
                        const name = formData.userName?.trim();
                        if (name && name.length >= 3) checkUsername(name);
                      }}
                    >
                      <AppText
                        style={[
                          styles.retryText,
                          { color: Colors.accentPrimary },
                        ]}
                      >
                        Retry
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom button ── */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            style={[
              styles.continueBtn,
              {
                backgroundColor: canContinue
                  ? Colors.accentPrimary
                  : Colors.outline,
              },
            ]}
          >
            <AppText style={styles.continueBtnText}>Continue</AppText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupOne;
