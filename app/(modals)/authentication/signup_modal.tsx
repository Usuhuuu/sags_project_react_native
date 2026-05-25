import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, View, Dimensions, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../../src/context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import * as SecureStore from "expo-secure-store";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/src/context/themeContext";
import { useRouter } from "expo-router";
import AppText from "@/constants/appTextDefault";
import SignupOne from "@/src/utils/auth/signup_steps/step_one";
import SignupStepTwo from "@/src/utils/auth/signup_steps/step_two";
import SignupStepThree from "@/src/utils/auth/signup_steps/step_three";

export type LoginInput = {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  userID: string;
  signUpTimer?: string;
  phoneNumber: string;
  password: string;
  userAgreeTerms: {
    agree_terms: boolean;
    agree_privacy: boolean;
  };
};

interface SignUpModal {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  formData: LoginInput;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  path: string;
}

const STEP_LABELS = ["PROFILE SETUP", "INTERESTS", "FINAL"];

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (Colors: any, width: number) =>
  ({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    safeArea: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    // ── Top bar ──
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.surfaceHigh,
    },
    stepLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors.onSurface,
    },
    spacerBox: {
      width: 36,
      height: 36,
    },

    // ── Progress bar ──
    progressSection: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 8,
    },
    progressRow: {
      flexDirection: "row",
      gap: 6,
    },
    progressSegment: (isActive: boolean) => ({
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isActive ? Colors.accentPrimary : Colors.border,
    }),
    stepCountText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors.outline,
      textAlign: "right",
    },

    // ── Content ──
    content: {
      flex: 1,
    },
  }) as const;

// ── Component ──────────────────────────────────────────────────────────────
const SignupModal = ({
  isModalVisible,
  setModalVisible,
  formData,
  setFormData,
  steps,
  setSteps,
  path,
}: SignUpModal) => {
  const { colors: Colors } = useTheme();
  const { width } = Dimensions.get("screen");
  const styles = useMemo(() => createStyles(Colors, width), [Colors, width]);

  const [notificationToken, setNotificationToken] = useState("");
  const { logIn } = useAuth();
  const router = useRouter();

  // ── Fetch notification token ──
  useEffect(() => {
    const getToken = async () => {
      const token = await SecureStore.getItemAsync("notificationToken");
      setNotificationToken(token || "");
    };
    getToken();
  }, []);

  // ── Submit handler ──
  const handleSubmit = useCallback(async () => {
    try {
      const payload =
        path === "signup"
          ? {
              unique_user_ID: formData.userName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              userNotificationToken: notificationToken,
              userAgreeTerms: formData.userAgreeTerms,
            }
          : {
              fbData: {
                userName: formData.userName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                signUpTimer: formData.signUpTimer,
                userNotificationToken: notificationToken,
              },
            };

      const response = await axiosInstanceRegular.post(
        `/api/${path}`,
        payload,
        path !== "signup" ? { timeout: 5000 } : undefined,
      );

      if (response?.status === 200 && response?.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        setModalVisible(false);
        Notifier.showNotification({
          title: "Success",
          description: "Account Created Successfully",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
        logIn();
        switch (response.data.role) {
          case "admin":
            router.replace("/(drawer)/(admin)");
            break;
          case "contractor":
            router.replace("/(drawer)/(contractor)/(tabs-contractor)/overview");
            break;
          default:
            router.replace("/(drawer)/(user)");
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? "This email or username already exists"
          : "Something went wrong. Please try again.");
      Notifier.showNotification({
        title: "Signup failed",
        description: message,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    }
  }, [path, formData, notificationToken, logIn, setModalVisible, router]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const goBack = useCallback(() => {
    setSteps((prev) => prev - 1);
  }, [setSteps]);

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          {steps > 0 ? (
            <TouchableOpacity
              onPress={goBack}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="arrow-left" size={18} color={Colors.onSurface} />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacerBox} />
          )}
          <AppText style={styles.stepLabel}>{STEP_LABELS[steps]}</AppText>
          <TouchableOpacity
            onPress={closeModal}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* ── Progress bar ── */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            {Array.from({ length: 3 }, (_, i) => (
              <View key={i} style={styles.progressSegment(i === steps)} />
            ))}
          </View>
          <AppText style={styles.stepCountText}>STEP {steps + 1} of 3</AppText>
        </View>

        {/* ── Step content ── */}
        <View style={styles.content}>
          {steps === 0 && (
            <SignupOne
              setSteps={setSteps}
              steps={steps}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {steps === 1 && (
            <SignupStepTwo
              setSteps={setSteps}
              steps={steps}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {steps === 2 && (
            <SignupStepThree
              steps={steps}
              setSteps={setSteps}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SignupModal;
