import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/themeContext";
import { LoginInput } from "@/app/(modals)/authentication/signup_modal";
import AppText from "@/constants/appTextDefault";

// ── Props ──────────────────────────────────────────────────────────────────
interface SignupStepThreeProps {
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  formData: Pick<LoginInput, "password" | "userAgreeTerms">;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
  onSubmit?: () => Promise<void>;
}

// ── Password strength helper ───────────────────────────────────────────────
function getStrength(password: string): {
  bars: number;
  label: string;
  color: string;
} {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score =
    [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length +
    (len >= 8 ? 1 : 0) +
    (len >= 12 ? 1 : 0);

  if (score < 2) return { bars: 1, label: "Weak", color: "#EF4444" };
  if (score < 4) return { bars: 2, label: "Fair", color: "#F59E0B" };
  if (score < 5) return { bars: 3, label: "Good", color: "#22C55E" };
  return { bars: 4, label: "Strong", color: "#22C55E" };
}

// ── Shared static input styles ────────────────────────────────────────────
const sharedInputStyles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
});

// ── Memoized password input ────────────────────────────────────────────────
const PasswordField = memo(
  ({
    label,
    value,
    onChangeText,
    colors,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    colors: any;
  }) => {
    const [focused, setFocused] = useState(false);
    const [secure, setSecure] = useState(true);

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
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={focused ? colors.accentPrimary : colors.outline}
          style={sharedInputStyles.inputIcon}
        />
        <RNTextInput
          placeholder={label}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            sharedInputStyles.input,
            { color: colors.themeColorTextPure },
          ]}
        />
        <TouchableOpacity
          onPress={() => setSecure((s) => !s)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={secure ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={colors.outline}
          />
        </TouchableOpacity>
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
    formSection: {
      gap: 14,
    },

    // ── Strength meter ──
    strengthRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    strengthBars: {
      flexDirection: "row",
      gap: 4,
      width: 100,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 11,
      fontWeight: "600",
    },

    // ── Match row ──
    matchRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    matchText: {
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },

    // ── Terms checkbox ──
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginTop: 8,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 1,
    },
    checkboxInner: {
      width: 12,
      height: 12,
      borderRadius: 3,
    },
    termsText: {
      fontSize: 13,
      lineHeight: 20,
      flex: 1,
    },
    termsLink: {
      fontWeight: "700",
      textDecorationLine: "underline",
    },

    // ── Bottom button ──
    bottomSection: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    createBtn: {
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
    createBtnText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

// ── Component ──────────────────────────────────────────────────────────────
const SignupStepThree = ({
  setSteps,
  formData,
  setFormData,
  onSubmit,
}: SignupStepThreeProps) => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const password = formData.password ?? "";
  const [confirmPassword, setConfirmPassword] = useState("");
  const strength = useMemo(() => getStrength(password), [password]);
  const agreed = formData.userAgreeTerms?.agree_terms ?? false;

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    password.length > 0 && passwordsMatch && agreed && strength.bars >= 2;

  const toggleTerms = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      userAgreeTerms: {
        agree_terms: !prev.userAgreeTerms?.agree_terms,
        agree_privacy: !prev.userAgreeTerms?.agree_privacy,
      },
    }));
  }, [setFormData]);

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
            <AppText style={styles.title}>Account Security</AppText>
            <AppText style={styles.subtitle}>
              Create a password to secure your account
            </AppText>
          </View>

          {/* ── Form ── */}
          <View style={styles.formSection}>
            <PasswordField
              label="Create password"
              value={password}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
              colors={Colors}
            />

            {/* Strength meter */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            bar <= strength.bars
                              ? strength.color
                              : Colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <AppText
                  style={[styles.strengthLabel, { color: strength.color }]}
                >
                  {strength.label}
                </AppText>
              </View>
            )}

            {/* Confirm password */}
            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              colors={Colors}
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchRow}>
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                  size={14}
                  color={passwordsMatch ? "#22C55E" : "#EF4444"}
                />
                <AppText
                  style={[
                    styles.matchText,
                    {
                      color: passwordsMatch ? "#22C55E" : "#EF4444",
                    },
                  ]}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </AppText>
              </View>
            )}

            {/* Terms checkbox */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.termsRow}
              onPress={toggleTerms}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: agreed ? Colors.accentPrimary : Colors.border,
                    backgroundColor: agreed
                      ? Colors.accentPrimary
                      : "transparent",
                  },
                ]}
              >
                {agreed && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <AppText style={[styles.termsText, { color: Colors.outline }]}>
                I agree to the{" "}
                <AppText
                  style={[styles.termsLink, { color: Colors.accentPrimary }]}
                >
                  Community Rules
                </AppText>{" "}
                &{" "}
                <AppText
                  style={[styles.termsLink, { color: Colors.accentPrimary }]}
                >
                  Terms of Service
                </AppText>
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Create account button ── */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSubmit}
            style={[
              styles.createBtn,
              {
                backgroundColor: canSubmit
                  ? Colors.accentPrimary
                  : Colors.outline,
              },
            ]}
          >
            <AppText style={styles.createBtnText}>Create account</AppText>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupStepThree;
