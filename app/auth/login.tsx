import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth_context";
import {
  loginWithFacebook,
  loginWithGoogle,
} from "@/components/auth/third_party_instance";
import SignupModal, { LoginInput } from "./signup";
import { showToast } from "@/utils/toast";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { ThemeColors } from "@/theme/colors";
import { TextInput } from "react-native";

const sharedStyles = StyleSheet.create({
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    paddingHorizontal: 0,
  },
  inputRightIcon: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
  },
});

const SocialButton = memo(
  ({
    icon,
    label,
    onPress,
    colors,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    colors: any;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        sharedStyles.socialBtn,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={colors.outline} />
      <AppText
        style={[sharedStyles.socialBtnText, { color: colors.onSurface }]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  ),
);

const InputField = memo(
  ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    leftIcon,
    rightIcon,
    onRightPress,
    colors,
    autoCapitalize,
  }: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    leftIcon: string;
    rightIcon?: string;
    onRightPress?: () => void;
    colors: ThemeColors;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  }) => {
    const [focused, setFocused] = useState(false);

    return (
      <View
        style={[
          sharedStyles.inputWrapper,
          {
            backgroundColor: colors.surfaceHigh,
            borderColor: focused ? colors.accentPrimary : colors.border,
          },
        ]}
      >
        <Ionicons
          name={leftIcon as any}
          size={18}
          color={focused ? colors.accentPrimary : colors.outline}
          style={sharedStyles.inputIcon}
        />
        <TextInput
          autoCapitalize={autoCapitalize ?? "none"}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            sharedStyles.input,
            {
              color: colors.themeColorTextPure,
              backgroundColor: "transparent",
            },
          ]}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={sharedStyles.inputRightIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={rightIcon as any}
              size={18}
              color={colors.outline}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const createStyles = (Colors: any) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    card: {
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: Colors.border,
      elevation: 2,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    logoBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: Colors.accentPrimaryGlow,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      alignSelf: "center",
    },
    headerSection: {
      marginBottom: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
      textAlign: "center",
      marginBottom: 6,
      color: Colors.onSurface,
    },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      color: Colors.outline,
    },
    formSection: {
      gap: 14,
    },
    forgotRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 2,
    },
    forgotText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.accentPrimary,
    },
    primaryBtn: {
      height: 50,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 6,
      backgroundColor: Colors.accentPrimary,
    },
    primaryBtnDisabled: {
      backgroundColor: Colors.outline,
    },
    primaryBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border,
    },
    dividerText: {
      marginHorizontal: 14,
      fontSize: 13,
      fontWeight: "600",
      color: Colors.outline,
    },
    signupRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      gap: 4,
    },
    signupText: {
      fontSize: 14,
      color: Colors.outline,
    },
    signupLink: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors.accentPrimary,
    },
  });

// ── Page component ─────────────────────────────────────────────────────────
const Page = () => {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const { t } = useTranslation();
  const loginDetails: any = t("login", { returnObjects: true });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordHide, setPasswordHide] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [steps, setSteps] = useState(0);
  const [path, setPath] = useState("signup");
  const [formData, setFormData] = useState<LoginInput>({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    userID: "",
    signUpTimer: "",
    phoneNumber: "",
    password: "",
    userAgreeTerms: { agree_terms: true, agree_privacy: true },
  });

  const { logIn } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Google Sign-In config ──
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "56931783205-14if86k43tt1pip0n5dj08tag8665vk8.apps.googleusercontent.com",
      offlineAccess: true,
      iosClientId:
        "56931783205-78eeaknokj0nah74h5d53eis9ebj77r6.apps.googleusercontent.com",
    });
  }, []);

  // ── Handlers ──
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const notificationToken =
        await SecureStore.getItemAsync("notificationToken");
      const response = await axiosInstanceRegular.post("/login", {
        email,
        userPassword: password,
        notificationToken,
      });
      if (response.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        showToast({
          title: "Login Success",
          description: response.data.message,
          alertType: "success",
        });
        logIn();
        switch (response.data.role) {
          case "admin":
            return router.replace("/(drawer)/(admin)");
          case "contractor":
            return router.replace("/(drawer)/(tab-contractor)");
          default:
            return router.replace("/(drawer)/(user)");
        }
      } else if (!response.data.userNotFound && !response.data.success) {
        showToast({
          title: "Login Failed",
          description: response.data.message,
          alertType: "error",
        });
      } else if (response.status === 404) {
        showToast({
          title: "Login Failed",
          description: "Check your internet connection",
          alertType: "error",
        });
      }
    } catch (err: any) {
      showToast({
        title: "Login Failed",
        description: "Please Try Again",
          alertType: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, logIn, router]);

  const handlePasswordToggle = useCallback(() => {
    setPasswordHide((prev) => !prev);
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();
      if (accessToken) {
        const responseGoogle = await loginWithGoogle(accessToken);
        const responseData = responseGoogle?.data;
        if (responseGoogle?.modalVisible && responseData?.data.signUpTimer) {
          setFormData({
            ...formData,
            userID: responseData.data.googleID,
            email: responseData.data.email || "",
            firstName: responseData.data.firstName || "",
            lastName: responseData.data.lastName || "",
            signUpTimer: responseData.data.signUpTimer || "",
          });
          setPath(responseGoogle.path || "");
          timeoutRef.current = setTimeout(() => setIsModalVisible(true), 500);
        } else if (
          responseGoogle?.success &&
          responseData?.message === "Successfully logged in with Google"
        ) {
          logIn();
          showToast({
            title: "Google Login",
            description: responseData.message,
          alertType: "success",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [formData, logIn]);

  const handleFacebookLogin = useCallback(async () => {
    try {
      console.log("handleFacebookLogin");
      const facebookResponse = await loginWithFacebook();
      const returnData = facebookResponse?.data;
      if (facebookResponse?.modalVisible) {
        setFormData({
          ...formData,
          userID: returnData.data.userID,
          email: returnData.data.email || "",
          firstName: returnData.data.firstName || "",
          lastName: returnData.data.lastName || "",
          signUpTimer: returnData.data.signUpTimer || "",
        });
        setPath(facebookResponse.path || "");
        timeoutRef.current = setTimeout(() => setIsModalVisible(true), 500);
      } else if (
        facebookResponse?.data.message ===
        "Successfully logged in with Facebook"
      ) {
        logIn();
        showToast({
          title: "Facebook Login",
          description: facebookResponse.data.message,
          alertType: "success",
        });
      }
    } catch (err: any) {
      console.log(err);
    }
  }, [formData, logIn]);

  const openSignup = useCallback(() => {
    setFormData({
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      userID: "",
      signUpTimer: "",
      phoneNumber: "",
      password: "",
      userAgreeTerms: { agree_terms: true, agree_privacy: true },
    });
    setPath("signup");
    setIsModalVisible(true);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <View style={[styles.flex, { backgroundColor: Colors.backgroundColor }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: Colors.surface, borderColor: Colors.border },
            ]}
          >
            {/* Logo */}
            <View
              style={[
                styles.logoBox,
                { backgroundColor: Colors.accentPrimaryGlow },
              ]}
            >
              <Ionicons
                name="football-outline"
                size={24}
                color={Colors.accentPrimary}
              />
            </View>

            {/* Header */}
            <View style={styles.headerSection}>
              <AppText style={styles.title}>Welcome back</AppText>
              <AppText style={styles.subtitle}>
                Sign in to your account to continue
              </AppText>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              <InputField
                placeholder={
                  loginDetails.loginWithEmailOrUsername || "Email or username"
                }
                value={email}
                onChangeText={setEmail}
                leftIcon="mail-outline"
                colors={Colors}
                autoCapitalize="none"
              />

              <InputField
                placeholder={loginDetails.password || "Password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={passwordHide}
                leftIcon="lock-closed-outline"
                rightIcon={passwordHide ? "eye-off-outline" : "eye-outline"}
                onRightPress={handlePasswordToggle}
                colors={Colors}
              />

              {/* Forgot password */}
              <View style={styles.forgotRow}>
                <TouchableOpacity
                  onPress={() => router.push("/auth/forgot-password")}
                  hitSlop={{ top: 8, bottom: 8 }}
                >
                  <AppText style={styles.forgotText}>Forgot password?</AppText>
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={loading}
                onPress={handleSubmit}
                style={[
                  styles.primaryBtn,
                  loading && styles.primaryBtnDisabled,
                ]}
              >
                <AppText style={styles.primaryBtnText}>
                  {loading ? "Signing in..." : loginDetails.login || "Login"}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>OR</AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <SocialButton
              icon="logo-google"
              label={loginDetails.continuewithgoogle || "Continue with Google"}
              onPress={handleGoogleLogin}
              colors={Colors}
            />
            <SocialButton
              icon="logo-facebook"
              label={
                loginDetails.continuewithfacebook || "Continue with Facebook"
              }
              onPress={handleFacebookLogin}
              colors={Colors}
            />

            {/* Sign-up */}
            <View style={styles.signupRow}>
              <AppText style={styles.signupText}>
                Don't have an account?
              </AppText>
              <TouchableOpacity onPress={openSignup}>
                <AppText style={styles.signupLink}>
                  {loginDetails.signUp || "Sign Up"}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {isModalVisible && (
          <SignupModal
            isModalVisible={isModalVisible}
            setModalVisible={setIsModalVisible}
            formData={formData}
            setFormData={setFormData}
            steps={steps}
            setSteps={setSteps}
            path={path}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Page;
