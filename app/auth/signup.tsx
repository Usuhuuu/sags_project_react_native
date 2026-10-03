import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/auth_context";
import { SafeAreaView } from "react-native-safe-area-context";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import * as SecureStore from "expo-secure-store";
import { showToast } from "@/utils/toast";
import { useTheme } from "@/context/theme_context";
import { useRouter } from "expo-router";
import AppText from "@/components/ui/app_text";
import SignupOne from "@/components/auth/signup_steps/step_1";
import SignupStepTwo from "@/components/auth/signup_steps/step_2";
import SignupStepThree from "@/components/auth/signup_steps/step_3";
import { emptySignupData, useSignupStore } from "@/context/store/signup_store";

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

const STEP_LABELS = ["PROFILE SETUP", "INTERESTS", "FINAL"];

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (Colors: any) =>
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
const SignupModal = () => {
  const { colors: Colors } = useTheme();
  const { signupData, setSignupData } = useSignupStore();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const [notificationToken, setNotificationToken] = useState("");
  const [steps, setSteps] = useState(0);

  const { logIn } = useAuth();
  const router = useRouter();
  // ── Fetch notification token ──
  useEffect(() => {
    let mounted = true;
    const getToken = async () => {
      const token = await SecureStore.getItemAsync("notificationToken");
      if (mounted) setNotificationToken(token || "");
    };
    getToken();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Submit handler ──
  const handleSubmit = useCallback(async () => {
    try {
      const payload =
        signupData.path === "signup"
          ? {
              unique_user_ID: signupData.userName,
              email: signupData.email,
              phoneNumber: signupData.phoneNumber,
              password: signupData.password,
              firstName: signupData.firstName,
              lastName: signupData.lastName,
              userNotificationToken: notificationToken,
              userAgreeTerms: signupData.userAgreeTerms,
            }
          : {
              fbData: {
                userName: signupData.userName,
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                password: signupData.password,
                signUpTimer: signupData.signUpTimer,
                userNotificationToken: notificationToken,
              },
            };

      const response = await axiosInstanceRegular.post(
        `/api/${signupData.path}`,
        payload,
        signupData.path !== "signup" ? { timeout: 5000 } : undefined,
      );

      if (response?.status === 200 && response?.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        showToast({
          title: "Success",
          description: "Account Created Successfully",
          alertType: "success",
        });
        logIn();
        switch (response.data.role) {
          case "admin":
            router.replace("/(drawer)/(user)/(tab-user)");
            break;
          case "contractor":
            router.replace("/(drawer)/(contractor)/(tab-contractor)/overview");
            break;
          default:
            router.replace("/(drawer)/(user)/(tab-user)");
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? "This email or username already exists"
          : "Something went wrong. Please try again.");
      showToast({
        title: "Signup failed",
        description: message,
        alertType: "error",
      });
    }
  }, [notificationToken, logIn, router, signupData]);

  const closeModal = useCallback(() => {
    setSignupData(emptySignupData);
    router.back();
  }, [router, setSignupData]);

  const goBack = useCallback(() => {
    setSteps((prev) => prev - 1);
  }, [setSteps]);

  return (
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
            signupData={signupData}
            setSignupData={setSignupData}
          />
        )}
        {steps === 1 && (
          <SignupStepTwo
            setSteps={setSteps}
            steps={steps}
            signupData={signupData}
            setSignupData={setSignupData}
          />
        )}
        {steps === 2 && (
          <SignupStepThree
            steps={steps}
            signupData={signupData}
            setSignupData={setSignupData}
            onSubmit={handleSubmit}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SignupModal;
