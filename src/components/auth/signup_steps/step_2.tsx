import React, { useState, useCallback, memo, useEffect } from "react";
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme_context";
import { LoginInput } from "@/app/auth/signup";
import AppText from "@/components/ui/app_text";
import { KeyboardAwareScroll } from "@/components/ui/keyboard_aware_scroll";
import { axiosInstance, axiosInstanceRegular } from "@/hooks/axiosInstance";

interface PhoneVerifySession {
  sessionId: string;
  code?: string;
  smsUri: string;
  displayInstruction: string;
  expiresAt: string;
  success: boolean;
}

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
    editable = true,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    colors: any;
    icon: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    editable?: boolean;
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View
        style={[
          sharedInputStyles.inputWrapper,
          {
            backgroundColor: colors.surfaceHigh,
            borderColor: focused ? colors.accentPrimary : colors.border,
            opacity: editable ? 1 : 0.5,
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
          editable={editable}
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
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    rowFlex: {
      flex: 1,
    },
    actionBtn: {
      height: 52,
      paddingHorizontal: 16,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      borderWidth: 1,
    },
    actionBtnDisabled: {
      opacity: 0.5,
    },
    errorText: {
      fontSize: 13,
      color: Colors.errorColor,
      lineHeight: 18,
      paddingLeft: 2,
    },
    successText: {
      fontSize: 13,
      color: Colors.successColor,
      lineHeight: 18,
      paddingLeft: 2,
    },
    continueBtnDisabled: {
      opacity: 0.4,
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

  const [verifySession, setVerifySession] = useState<PhoneVerifySession | null>(
    null,
  );
  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = formData.phoneNumber?.trim() ?? "";
  const phoneValid = phone.length >= 8;
  const canSend = phoneValid && !verifySession && !verified && !sending;

  const handleSendOtp = useCallback(async () => {
    if (!canSend) return;
    setError(null);
    setExpired(false);
    setSending(true);
    try {
      const res = await axiosInstanceRegular.post<PhoneVerifySession>(
        "/auth/mobile",
        {
          number: phone,
        },
      );
      if (res.status === 200 && res.data.success) {
        setVerifySession(res.data);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to start verification");
      setVerifySession(null);
    } finally {
      setSending(false);
    }
  }, [canSend, phone]);

  const handleOpenSms = useCallback(() => {
    if (!verifySession?.smsUri) return;
    Linking.openURL(verifySession.smsUri).catch(() => {
      setError("Couldn't open SMS — send the code to 144773 manually.");
    });
  }, [verifySession]);

  const handleRetry = useCallback(() => {
    setVerifySession(null);
    setExpired(false);
    setVerified(false);
    setError(null);
  }, []);

  // Poll the backend every 3s while a session is active; stop on
  // VERIFIED/EXPIRED. Cleaned up on unmount / when the session is cleared.
  useEffect(() => {
    if (!verifySession || verified) return;
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;
      try {
        const res = await axiosInstance.get<{
          status: string;
          verified: boolean;
          expiresAt: string;
        }>(`/mobile/verify/${verifySession.sessionId}/${verifySession.code}`);
        if (cancelled) return;
        if (res.data?.verified || res.data?.status === "VERIFIED") {
          setVerified(true);
        } else if (
          res.data?.status === "EXPIRED" ||
          res.data?.status === "INVALID" ||
          Date.parse(res.data?.expiresAt ?? "") <= Date.now()
        ) {
          setExpired(true);
        }
      } catch {
        // transient failure — keep polling
      }
    };

    check();
    const interval = setInterval(check, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [verifySession, verified]);

  const handleCheckStatus = useCallback(async () => {
    if (!verifySession || verified || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await axiosInstanceRegular.get<{
        status: string;
        verified: boolean;
        expiresAt: string;
      }>(
        `/mobile/verify/${decodeURI(verifySession.sessionId)}/${verifySession.code}`,
      );
      if (res.data?.verified || res.data?.status === "VERIFIED") {
        setVerified(true);
      } else if (res.data?.status === "EXPIRED") {
        setExpired(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to check status");
    } finally {
      setChecking(false);
    }
  }, [verifySession, verified, checking]);

  const handlePhoneChange = useCallback(
    (text: string) => {
      setFormData((prev) => ({ ...prev, phoneNumber: text }));
      setVerifySession(null);
      setVerified(false);
      setExpired(false);
      setError(null);
    },
    [setFormData],
  );

  const handleContinue = useCallback(() => {
    if (!verified) return;
    setSteps?.((prev) => prev + 1);
  }, [verified, setSteps]);

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: Colors.backgroundColor }]}
    >
      <KeyboardAwareScroll contentContainerStyle={styles.scrollContent}>
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

          {!verified ? (
            <>
              <View style={styles.row}>
                <View style={styles.rowFlex}>
                  <InputField
                    label="Phone number"
                    value={formData.phoneNumber ?? ""}
                    onChangeText={handlePhoneChange}
                    colors={Colors}
                    icon="phone-outline"
                    keyboardType="phone-pad"
                    editable={!verifySession}
                  />
                </View>
                {!verifySession && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSendOtp}
                    disabled={!canSend}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: Colors.surfaceHigh,
                        borderColor: Colors.border,
                      },
                      !canSend && styles.actionBtnDisabled,
                    ]}
                  >
                    {sending ? (
                      <ActivityIndicator color={Colors.accentPrimary} />
                    ) : (
                      <AppText
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: Colors.onSurface,
                        }}
                      >
                        Verify
                      </AppText>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {verifySession && !expired && (
                <>
                  <AppText style={styles.hintText}>
                    {verifySession.displayInstruction}
                  </AppText>
                  {verifySession.code ? (
                    <AppText style={styles.hintText}>
                      Code: {verifySession.code} — send it to 144773
                    </AppText>
                  ) : null}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenSms}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: Colors.accentPrimary,
                        borderColor: "transparent",
                      },
                    ]}
                  >
                    <AppText
                      style={{
                        color: "#FFFFFF",
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      Send SMS
                    </AppText>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  <View style={styles.row}>
                    <AppText style={styles.hintText}>
                      Waiting for confirmation…
                    </AppText>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleCheckStatus}
                      disabled={checking}
                    >
                      {checking ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.accentPrimary}
                        />
                      ) : (
                        <AppText
                          style={[
                            styles.hintText,
                            { color: Colors.accentPrimary },
                          ]}
                        >
                          Check status
                        </AppText>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {expired && (
                <>
                  <AppText style={styles.errorText}>
                    The verification code has expired. Start over.
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleRetry}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: Colors.surfaceHigh,
                        borderColor: Colors.border,
                      },
                    ]}
                  >
                    <AppText
                      style={{
                        color: Colors.onSurface,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Start over
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <AppText style={styles.successText}>Phone number verified</AppText>
          )}

          {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
        </View>
      </KeyboardAwareScroll>
      {/* ── Bottom button ── */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={!verified}
          style={[
            styles.continueBtn,
            { backgroundColor: Colors.accentPrimary },
            !verified && styles.continueBtnDisabled,
          ]}
        >
          <AppText style={styles.continueBtnText}>Continue</AppText>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupStepTwo;
