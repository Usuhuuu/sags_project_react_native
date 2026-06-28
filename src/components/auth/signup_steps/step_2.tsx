import React, { useState, useCallback, memo } from "react";
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
import { useTheme } from "@/context/theme_context";
import { LoginInput } from "@/app/auth/signup";
import AppText from "@/components/ui/app_text";

// ── Props ──────────────────────────────────────────────────────────────────
interface SignupStepTwoProps {
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  formData: Pick<LoginInput, "email" | "phoneNumber">;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
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

// ── Memoized input field ───────────────────────────────────────────────────
const InputField = memo(
  ({
    label,
    value,
    onChangeText,
    colors,
    icon,
    keyboardType,
    autoCapitalize,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    colors: any;
    icon: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
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
        <Ionicons
          name={icon as any}
          size={18}
          color={focused ? colors.accentPrimary : colors.outline}
          style={sharedInputStyles.inputIcon}
        />
        <RNTextInput
          autoCapitalize={autoCapitalize ?? "none"}
          placeholder={label}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            sharedInputStyles.input,
            { color: colors.themeColorTextPure },
          ]}
        />
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
    hintText: {
      fontSize: 13,
      color: Colors.outline,
      lineHeight: 18,
      marginTop: 4,
      paddingLeft: 2,
    },
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
const SignupStepTwo = ({
  setSteps,
  formData,
  setFormData,
}: SignupStepTwoProps) => {
  const { colors: Colors } = useTheme();
  const styles = createStyles(Colors);

  const handleContinue = useCallback(() => {
    setSteps?.((prev) => prev + 1);
  }, [setSteps]);

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
            <AppText style={styles.title}>Contact details</AppText>
            <AppText style={styles.subtitle}>How can people reach you?</AppText>
          </View>

          {/* ── Form ── */}
          <View style={styles.formSection}>
            <InputField
              label="Email"
              value={formData.email ?? ""}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              colors={Colors}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Phone number"
              value={formData.phoneNumber ?? ""}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phoneNumber: text }))
              }
              colors={Colors}
              icon="phone-outline"
              keyboardType="phone-pad"
            />
            <AppText style={styles.hintText}>
              We'll only use this for booking confirmations
            </AppText>
          </View>
        </ScrollView>

        {/* ── Bottom button ── */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            style={[
              styles.continueBtn,
              { backgroundColor: Colors.accentPrimary },
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

export default SignupStepTwo;
