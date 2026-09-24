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
import { axiosInstanceRegular } from "@/hooks/axiosInstance";

interface PhoneVerifySession {
  sessionId: string;
  code?: string;
  smsUri: string;
  displayInstruction: string;
  expiresAt: string;
  success: boolean;
}

// Hard floor between two send attempts (seconds).
const RESEND_COOLDOWN_SECONDS = 10;

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
      marginBottom: 32,
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
      gap: 18,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.onSurfaceVariant,
      marginBottom: 8,
      marginLeft: 2,
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
    outlineBtn: {
      backgroundColor: Colors.surfaceHigh,
      borderColor: Colors.border,
    },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.borderSubtle,
      padding: 20,
      gap: 14,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: Colors.onSurface,
    },
    cardBody: {
      fontSize: 13,
      color: Colors.onSurfaceVariant,
      lineHeight: 20,
    },
    codeChip: {
      alignSelf: "center",
      alignItems: "center",
      backgroundColor: Colors.accentPrimaryGlow,
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    codeNumber: {
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: 8,
      color: Colors.accentPrimary,
    },
    codeHint: {
      fontSize: 12,
      color: Colors.outline,
      marginTop: 4,
    },
    primaryBtn: {
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    statusHint: {
      fontSize: 13,
      color: Colors.outline,
    },
    statusLink: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.accentPrimary,
    },
    resend: {
      alignSelf: "center",
      paddingVertical: 6,
    },
    resendText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.accentPrimary,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: Colors.errorGlow,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: Colors.errorColor,
      lineHeight: 18,
    },
    successBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: Colors.successGlow,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    successText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      color: Colors.successColor,
      lineHeight: 18,
    },
    footerHint: {
      fontSize: 12.5,
      color: Colors.outline,
      textAlign: "center",
      lineHeight: 18,
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
  // Seconds remaining before another send is allowed (10s resend lock).
  const [cooldown, setCooldown] = useState(0);

  const phone = formData.phoneNumber?.trim() ?? "";
  const phoneValid = phone.length >= 8;
  const canSend = phoneValid && !verified && !sending && cooldown === 0;

  // Tick the resend countdown down to 0.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = useCallback(async () => {
    if (!canSend) return;
    setError(null);
    setExpired(false);
    setSending(true);
    try {
      // A live session means this is a resend of the same attempt.
      const resend = Boolean(verifySession);
      const res = await axiosInstanceRegular.post<PhoneVerifySession>(
        "/auth/mobile",
        {
          number: phone,
          resend,
        },
      );
      if (res.status === 200 && res.data.success) {
        setVerifySession(res.data);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to start verification");
      setVerifySession(null);
    } finally {
      setSending(false);
    }
  }, [canSend, phone, verifySession]);

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
        const res = await axiosInstanceRegular.get<{
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
    const interval = setInterval(check, 5000);
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
          <View>
            <AppText style={styles.fieldLabel}>Email</AppText>
            <InputField
              label="you@example.com"
              value={formData.email ?? ""}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              colors={Colors}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <AppText style={styles.fieldLabel}>Phone number</AppText>

            {!verified ? (
              <>
                <View style={styles.row}>
                  <View style={styles.rowFlex}>
                    <InputField
                      label="9988 0000"
                      value={formData.phoneNumber ?? ""}
                      onChangeText={handlePhoneChange}
                      colors={Colors}
                      icon="call-outline"
                      keyboardType="phone-pad"
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
                          backgroundColor: Colors.accentPrimary,
                          borderColor: "transparent",
                        },
                        !canSend && styles.actionBtnDisabled,
                      ]}
                    >
                      {sending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : cooldown > 0 ? (
                        <AppText
                          style={{
                            color: "#FFFFFF",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          {cooldown}s
                        </AppText>
                      ) : (
                        <AppText
                          style={{
                            color: "#FFFFFF",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          Verify
                        </AppText>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {!verifySession && cooldown > 0 && (
                  <AppText style={styles.footerHint}>
                    Send another request in {cooldown}s
                  </AppText>
                )}
              </>
            ) : (
              <View style={styles.successBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.successColor}
                />
                <AppText style={styles.successText}>
                  Phone number verified
                </AppText>
              </View>
            )}
          </View>

          {!verified && verifySession && !expired && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.accentPrimary}
                />
                <AppText style={styles.cardTitle}>Confirm your phone</AppText>
                <ActivityIndicator size="small" color={Colors.accentPrimary} />
              </View>

              <AppText style={styles.cardBody}>
                {verifySession.displayInstruction}
              </AppText>

              {verifySession.code && !verifySession.displayInstruction && (
                <View style={styles.codeChip}>
                  <AppText style={styles.codeNumber}>
                    {verifySession.code}
                  </AppText>
                  <AppText style={styles.codeHint}>send this to 144773</AppText>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenSms}
                style={[
                  styles.primaryBtn,
                  { backgroundColor: Colors.accentPrimary },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <AppText
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Send SMS
                </AppText>
              </TouchableOpacity>

              <View style={styles.statusRow}>
                <AppText style={styles.statusHint}>
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
                    <AppText style={styles.statusLink}>Check status</AppText>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSendOtp}
                disabled={!canSend}
                style={styles.resend}
              >
                {cooldown > 0 ? (
                  <AppText
                    style={[styles.resendText, { color: Colors.outline }]}
                  >
                    Resend code in {cooldown}s
                  </AppText>
                ) : sending ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.accentPrimary}
                  />
                ) : (
                  <AppText style={styles.resendText}>Resend code</AppText>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!verified && expired && (
            <>
              <View style={styles.errorBox}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.errorColor}
                />
                <AppText style={styles.errorText}>
                  The verification code has expired. Start over.
                </AppText>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRetry}
                style={[styles.actionBtn, styles.outlineBtn]}
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

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={Colors.errorColor}
              />
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          ) : null}

          <AppText style={styles.footerHint}>
            We'll only use your number for booking confirmations.
          </AppText>
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
