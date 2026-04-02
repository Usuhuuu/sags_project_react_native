import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Modal, View, Text, Dimensions } from "react-native";
import { useAuth } from "../../../src/context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import * as SecureStore from "expo-secure-store";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/src/context/themeContext";
import SignupOne from "@/src/utils/auth/signup_steps/step_one";

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

const Signup_Detail = [
  {
    id: 0,
    label: "PROFILE SETUP",
  },
  {
    id: 1,
    label: "INTERESTS",
  },
  {
    id: 2,
    label: "FINAL",
  },
];

const SignupModal = ({
  isModalVisible,
  setModalVisible,
  formData,
  setFormData,
  steps,
  setSteps,
  path,
}: SignUpModal) => {
  const { colors } = useTheme();
  const [notificationToken, setNotificationToken] = useState<string>("");
  const { logIn } = useAuth();

  const handleSubmit = async () => {
    try {
      let response;
      if (path === "signup") {
        response = await axiosInstanceRegular.post(`/api/${path}`, {
          userName: formData.userName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          signUpTimer: formData.signUpTimer,
          userNotificationToken: notificationToken,
          unique_user_ID: formData.userName,
          email: formData.email,
          password: "password",
          userAgreeTerms: formData.userAgreeTerms,
        });
      } else {
        response = await axiosInstanceRegular.post(
          `/api/${path}`,
          {
            fbData: {
              userName: formData.userName,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              signUpTimer: formData.signUpTimer,
              userNotificationToken: notificationToken,
            },
          },
          {
            timeout: 5000,
          },
        );
      }

      if (response?.status === 200 && response?.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response?.data.accessToken,
            refreshToken: response?.data.refreshToken,
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
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const getNotificationToken = async () => {
    const notificationtoken =
      await SecureStore.getItemAsync("notificationToken");
    setNotificationToken(notificationtoken || "");
  };
  useEffect(() => {
    getNotificationToken();
  }, []);

  const stepArray = Array.from({ length: 3 }, (_, i) => i);
  const { width } = Dimensions.get("screen");

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
      style={{ backgroundColor: colors.backgroundColor, flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: colors.backgroundColor,
        }}
      >
        {/* ACTIVITY INDICATOR */}
        <View
          style={{
            backgroundColor: colors.backgroundColor,
            gap: 25,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Feather name="arrow-left" size={24} color={colors.darkGrey} />
            <Text style={{ fontSize: 19, fontWeight: "600" }}>
              {Signup_Detail[steps].label}
            </Text>
            <View style={{ width: 24, height: 24 }} />
          </View>
          <View style={{ flexDirection: "row" }}>
            {stepArray.map((s) => {
              return (
                <View
                  key={s}
                  style={{
                    height: 6,
                    borderRadius: 2,
                    backgroundColor:
                      s === steps ? colors.primary : colors.containerColor,
                    width: width / 3 - 20,
                    marginHorizontal: 4,
                    shadowColor: colors.shadowColor,
                    shadowOpacity: 0.4,
                    shadowOffset: { height: 4, width: 4 },
                  }}
                />
              );
            })}
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                color: colors.darkGrey,
              }}
            >
              STEP {steps + 1} of 3
            </Text>
          </View>
        </View>
        {steps === 0 && (
          <SignupOne
            setSteps={setSteps}
            steps={steps}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default SignupModal;
