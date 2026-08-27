import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { showToast } from "@/utils/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/ui/app_text";
import { useTheme } from "@/context/theme_context";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { AxiosError } from "axios";

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundColor },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    backButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: colors.surfaceHigh,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 32,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      padding: 28,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    iconBox: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 20,
      borderRadius: 16,
      backgroundColor: colors.accentPrimaryGlow,
    },
    title: {
      marginBottom: 8,
      color: colors.onSurface,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: 28,
      color: colors.outline,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },
    label: {
      marginBottom: 8,
      color: colors.onSurface,
      fontSize: 14,
      fontWeight: "600",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      height: 52,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderRadius: 14,
      backgroundColor: colors.surfaceHigh,
      borderColor: colors.border,
    },
    inputRowFocused: { borderColor: colors.accentPrimary },
    input: {
      flex: 1,
      height: "100%",
      marginLeft: 10,
      color: colors.themeColorTextPure,
      fontSize: 15,
    },
    button: {
      height: 52,
      marginTop: 22,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: colors.accentPrimary,
    },
    buttonDisabled: { backgroundColor: colors.outline },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    buttonLoading: { flexDirection: "row", alignItems: "center", gap: 10 },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      gap: 4,
    },
    loginText: { color: colors.outline, fontSize: 14 },
    loginLink: { color: colors.accentPrimary, fontSize: 14, fontWeight: "700" },
  });

const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleForgotPassword() {
    try {
      const normalizedEmail = email.trim();

      if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        showToast({
          alertType: "warn",
          title: "Oops!",
          description: "Please enter a valid email address.",
        });
        return;
      }

      setIsSubmitting(true);
      const response = await axiosInstanceRegular.post("/forget", {
        email: normalizedEmail,
      });
      if (response.status === 200 && response.data.success) {
        showToast({
          alertType: "success",
          title: "Success!",
          description: "Please check your email for a reset link.",
        });
        console.log(response.data);
      }
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError) {
        showToast({
          alertType: "warn",
          title: "Oops!",
          description: "Something went wrong. Please try again later.",
        });
        return;
      }
      showToast({
          alertType: "warn",
        title: "Oops!",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityLabel="Go back to login"
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons
                name="key-outline"
                size={26}
                color={colors.accentPrimary}
              />
            </View>
            <AppText style={styles.title}>Forgot password?</AppText>
            <AppText style={styles.subtitle}>
              Enter your email address and we’ll send you instructions to reset
              your password.
            </AppText>

            <AppText style={styles.label}>Email address</AppText>
            <View
              style={[styles.inputRow, isFocused && styles.inputRowFocused]}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color={isFocused ? colors.accentPrimary : colors.outline}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.outline}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!email.trim() || isSubmitting}
              onPress={handleForgotPassword}
              style={[
                styles.button,
                (!email.trim() || isSubmitting) && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                  <AppText style={styles.buttonText}>Sending request...</AppText>
                </View>
              ) : (
                <AppText style={styles.buttonText}>Continue</AppText>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <AppText style={styles.loginText}>
                Remember your password?
              </AppText>
              <TouchableOpacity onPress={() => router.back()}>
                <AppText style={styles.loginLink}>Log in</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
