import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Sentry from "@sentry/react-native";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/authContext";
import { loginWithFacebook, loginWithGoogle } from "./third_party_instance";
import SignupModal from "./signup_modal";
import { TextInput } from "react-native-paper";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "../context/themeContext";
import AppText from "@/constants/appTextDefault";

type LoginInput = {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  userID: string;
  signUpTimer?: string;
};
const Page = () => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: "center", // Center content
      alignItems: "center",
      padding: 20,
    },
    container: {
      flex: 1,
      width: "100%",
      maxWidth: 400,
      padding: 20,
      borderRadius: 10,
      backgroundColor: Colors.white,
      shadowOpacity: 0.8,
      shadowRadius: 5,
      justifyContent: "center",
    },
    inputContainer: {
      gap: 10,
    },
    input: {
      height: 50,
      paddingHorizontal: 15,
      backgroundColor: "#fff",
      fontSize: 16,
    },
    eyeIcon: {
      position: "absolute",
      right: 15,
      top: 15,
    },
    verificationContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    verifyButton: {
      marginLeft: 10,
      backgroundColor: Colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    verifyButtonText: {
      color: "#fff",
      fontSize: 16,
    },
    button: {
      backgroundColor: Colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    loginBtn: {
      marginTop: 15,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18, // Increased font size for readability
    },
    separatorView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 25,
    },
    separatorLine: {
      flex: 1,
      borderBottomColor: "#ddd",
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    separatorText: {
      marginHorizontal: 12,
      color: "#666",
      fontSize: 14, // Slightly smaller text for separation
    },
    socialButtons: {
      marginTop: 25,
    },
    btnOutline: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ccc",
      height: 50,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 15,
      marginBottom: 12,
      elevation: 2, // Button elevation
    },
    btnOutlineText: {
      color: "#333",
      fontSize: 16,
    },
    btnIcon: {
      marginRight: 15,
    },
    imageIcon: {
      width: 28,
      height: 28,
      marginRight: 15,
    },
  });

  const { t } = useTranslation();
  const loginDetails: any = t("login", { returnObjects: true });

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordHide, setPasswordHide] = useState<boolean>(true);
  const [isItApple, setIsITApple] = useState<boolean>(false);
  const [path, setPath] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(0);
  const [formData, setFormData] = useState<LoginInput>({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    userID: "",
    signUpTimer: "",
  });

  const { logIn } = useAuth();
  useEffect(() => {
    if (Platform.OS == "ios") {
      setIsITApple(true);
    }
  }, [Platform.OS]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const notificationToken = await SecureStore.getItemAsync(
        "notificationToken"
      );
      const response = await axiosInstanceRegular.post("/login", {
        email,
        userPassword: password,
        notificationToken,
      });
      if (response.data.success) {
        try {
          await SecureStore.setItemAsync(
            "Tokens",
            JSON.stringify({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            })
          );
          Notifier.showNotification({
            title: "Login " + response.data.success ? "Success" : "Failed",
            description: response.data.message,
            Component: NotifierComponents.Alert,
            componentProps: {
              alertType: response.data.success ? "success" : "error",
            },
          });
          logIn();
        } catch (err) {
          Sentry.captureException(err);
        }
        router.replace("..");
      } else if (!response.data.userNotFound && !response.data.success) {
        console.log(response.data.success);
        Notifier.showNotification({
          title: `Login ${response.data.success ? "Success" : "Failed"} `,
          description: response.data.message,
          Component: NotifierComponents.Alert,
          componentProps: {
            alertType: response.data.success ? "success" : "error",
          },
        });
      } else if (response.status == 404) {
        Notifier.showNotification({
          title: `Login ${response.data.success ? "Success" : "Failed"} `,
          description: "Check your internet connection",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err: any) {
      Notifier.showNotification({
        title: "Login Failed",
        description: "Please Try Again",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setPasswordHide(!passwordHide);
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "56931783205-14if86k43tt1pip0n5dj08tag8665vk8.apps.googleusercontent.com",
      offlineAccess: true,
      iosClientId:
        "56931783205-78eeaknokj0nah74h5d53eis9ebj77r6.apps.googleusercontent.com",
    });
  }, []);

  const handleFacebookLogin = async () => {
    try {
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
        setTimeout(() => {
          setIsModalVisible(true);
        }, 500);
      } else if (
        facebookResponse?.data.message ===
        "Successfully logged in with Facebook"
      ) {
        logIn();
        Notifier.showNotification({
          title: "Facebook Login",
          description: facebookResponse?.data.message,
          Component: NotifierComponents.Alert,
          componentProps: {
            alertType: facebookResponse.data.success ? "success" : "error",
          },
        });
      }
    } catch (err: any) {
      console.log(err.response.data);
      console.log(err);
    }
    return;
  };
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();
      const googleAccessToken = accessToken;
      if (googleAccessToken) {
        const responseGoogle = await loginWithGoogle(googleAccessToken);
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
          setTimeout(() => {
            setIsModalVisible(true);
          }, 500);
        } else if (
          responseGoogle?.success &&
          responseData?.message === "Successfully logged in with Google"
        ) {
          logIn();
          Notifier.showNotification({
            title: "Google Login",
            description: responseGoogle?.data.message,
            Component: NotifierComponents.Alert,
            componentProps: {
              alertType: responseData.success ? "success" : "error",
            },
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: Colors.containerColor,
              borderRadius: 10,
              padding: 20,
              shadowColor: Colors.shadowColor,
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 0.5,
              opacity: 5,
            }}
          >
            <View style={styles.inputContainer}>
              <TextInput
                autoCapitalize="none"
                placeholder={loginDetails.email}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={Colors.darkGrey}
              />
              <View style={styles.inputContainer}>
                <TextInput
                  autoCapitalize="none"
                  placeholder={loginDetails.password}
                  secureTextEntry={passwordHide}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  placeholderTextColor={Colors.darkGrey}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={handlePasswordToggle}
                >
                  <Ionicons
                    name={passwordHide ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.loginBtn]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <AppText style={styles.buttonText}>{loginDetails.login}</AppText>
            </TouchableOpacity>

            <View style={styles.separatorView}>
              <View style={styles.separatorLine} />
              <AppText style={[styles.separatorText, { fontSize: 18 }]}>
                or
              </AppText>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={24} style={styles.btnIcon} />
                <AppText style={styles.btnOutlineText}>
                  {loginDetails.continuewithgoogle}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnOutline}
                onPress={handleFacebookLogin}
              >
                <Ionicons
                  name="logo-facebook"
                  size={24}
                  style={styles.btnIcon}
                />
                <AppText style={styles.btnOutlineText}>
                  {loginDetails.continuewithfacebook}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="person-add" size={24} style={styles.btnIcon} />
                <AppText style={styles.btnOutlineText}>
                  {loginDetails.signUp}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <SignupModal
          isModalVisible={isModalVisible}
          setModalVisible={setIsModalVisible}
          formData={formData}
          setFormData={setFormData}
          steps={steps}
          setSteps={setSteps}
          path={path}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Page;
