import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Animated,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { useAuth } from "../context/authContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import * as SecureStore from "expo-secure-store";
import { Avatar, TextInput } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import StepIndicator from "react-native-step-indicator";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "../context/themeContext";
import AppText from "@/constants/appTextDefault";

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

const initSteps = [
  {
    steps: 0,
    title: "Name",
    placeholder: {
      placeholderFirstName: "First Name",
      placeholderLastName: "Last Name",
    },
    icons: <MaterialIcons name="email" size={24} color="black" />,
    next: "Next",
  },
  {
    steps: 1,
    title: "Email",
    placeholder: "Enter the email",
    icons: (
      <MaterialCommunityIcons name="account-edit" size={24} color="black" />
    ),
    buttonText: "Check mail",
  },
  {
    steps: 2,
    title: "Username",
    placeholder: "Enter the username",
    icons: <AntDesign name="idcard" size={24} color="black" />,
    buttonText: "Next",
  },
  {
    steps: 3,
    title: "Image",
    placeholder: "Upload the image",
  },
  {
    steps: 4,
    title: "Final",
    placeholder: "Check the personal information",
    buttonText: "Create Account",
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
}: {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  formData: LoginInput;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  path: string;
}) => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      width: "95%",
      height: "100%",
      marginHorizontal: 10,
      backgroundColor: Colors.backgroundColor,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: Colors.white,
    },
    modalInputContainer: {
      gap: 20,
      justifyContent: "center",
      flex: 1,
      backgroundColor: Colors.white,
      marginBottom: 20,
    },
    modalInput: {
      paddingHorizontal: 15,
      marginHorizontal: 20,
      marginVertical: 5,
    },
    IndicatorContainer: {
      height: "40%",
      width: "100%",
      elevation: 10,
      marginTop: 20,
      borderRadius: 20,
      shadowColor: Colors.primary,
      borderWidth: 1,
      borderColor: Colors.primary,
      backgroundColor: Colors.light,
      paddingTop: 10,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 20,
      alignItems: "center",
    },
    modalButtonContainerFirst: {
      alignItems: "center",
    },
    modalNextButton: {
      backgroundColor: Colors.primary,
      padding: 10,
      borderRadius: 20,
      width: "45%",
      alignItems: "center",
    },
    modalButtonText: {
      color: Colors.white,
      fontSize: 20,
    },
  });

  const [disableButton, setDisableButton] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [notificationToken, setNotificationToken] = useState<string>("");

  const fadeCheckUsername = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { logIn } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [timeLeft, setTimeLeft] = useState(600);

  const labels = ["Name", "Email", "Username", "Image", "Final"];

  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: Colors.primary,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: Colors.primary,
    stepStrokeUnFinishedColor: "#bebebe",
    separatorFinishedColor: Colors.primary,
    separatorUnFinishedColor: "#bebebe",
    stepIndicatorFinishedColor: Colors.primary,
    stepIndicatorUnFinishedColor: "#bebebe",
    stepIndicatorCurrentColor: Colors.primary,
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: Colors.light,
    stepIndicatorLabelFinishedColor: Colors.light,
    stepIndicatorLabelUnFinishedColor: "#ffffff",
    labelColor: "#999999",
    labelSize: 14,
    currentStepLabelColor: Colors.primary,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isModalVisible) {
      setTimeLeft(600);
      setSteps(0);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setModalVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isModalVisible]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

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
          }
        );
      }

      if (response?.status === 200 && response?.data.success) {
        await SecureStore.setItemAsync(
          "Tokens",
          JSON.stringify({
            accessToken: response?.data.accessToken,
            refreshToken: response?.data.refreshToken,
          })
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

  useEffect(() => {
    Animated.timing(fadeCheckUsername, {
      toValue: formData.userName.length > 0 ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [formData.userName]);

  const fadeInStep = () => {
    fadeAnim.setValue(0);
    requestAnimationFrame(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
  const getNotificationToken = async () => {
    const notificationtoken = await SecureStore.getItemAsync(
      "notificationToken"
    );
    setNotificationToken(notificationtoken || "");
  };
  useEffect(() => {
    getNotificationToken();
  }, []);

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="formSheet"
      style={{ backgroundColor: Colors.backgroundColor }}
    >
      <View
        style={[
          styles.modalContainer,
          {
            marginBottom: bottom,
            borderBottomWidth: 1,
            borderColor: Colors.primary,
          },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors.dark} />
        <View
          style={[
            styles.modalHeader,
            {
              height: headerHeight,
            },
          ]}
        >
          <TouchableOpacity>
            <Ionicons
              name="arrow-back"
              size={28}
              color={Colors.primary}
              onPress={() => {
                Alert.alert("Are you sure?", "You will lose all your data", [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                  {
                    text: "Yes",
                    onPress: () => {
                      setModalVisible(false);
                      setSteps(0);
                    },
                  },
                ]);
              }}
            />
          </TouchableOpacity>

          <AppText style={{ fontSize: 20, color: Colors.primary }}>
            Буртгэл үүсгэх
          </AppText>
        </View>

        <View
          style={{
            height: "20%",
          }}
        >
          <View style={styles.IndicatorContainer}>
            <StepIndicator
              customStyles={customStyles}
              currentPosition={steps} // convert 1-based to 0-based
              labels={labels}
            />
          </View>
        </View>

        {steps === 0 && (
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              value={formData.firstName}
              mode="outlined"
              label={
                typeof initSteps[0].placeholder === "object" &&
                "placeholderFirstName" in initSteps[0].placeholder
                  ? initSteps[0].placeholder.placeholderFirstName
                  : ""
              }
              onChangeText={(e) => {
                setFormData({ ...formData, firstName: e });
              }}
              theme={{
                colors: {
                  primary: Colors.primary,
                  outline: Colors.darkGrey,
                  placeholder: Colors.darkGrey,
                  background: Colors.white,
                },
              }}
            />
            <TextInput
              style={[styles.modalInput]}
              value={formData.lastName}
              mode="outlined"
              label={
                typeof initSteps[0].placeholder === "object" &&
                "placeholderLastName" in initSteps[0].placeholder
                  ? initSteps[0].placeholder.placeholderLastName
                  : ""
              }
              onChangeText={(e) => {
                setFormData({ ...formData, lastName: e });
              }}
              theme={{
                colors: {
                  primary: Colors.primary,
                  outline: Colors.darkGrey,
                  placeholder: Colors.darkGrey,
                  background: Colors.white,
                },
              }}
            />
            <View style={styles.modalButtonContainerFirst}>
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => {
                  setSteps(steps + 1);
                  fadeInStep();
                }}
              >
                <AppText style={styles.modalButtonText}>Next</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {steps === 1 && (
          <Animated.View
            style={[styles.modalInputContainer, { opacity: fadeAnim }]}
          >
            <TextInput
              style={styles.modalInput}
              label={
                typeof initSteps[1].placeholder === "string"
                  ? initSteps[1].placeholder
                  : ""
              }
              mode="outlined"
              value={formData.email}
              onChangeText={(e) => {
                setFormData({ ...formData, email: e });
              }}
              theme={{
                colors: {
                  primary: Colors.primary,
                  outline: Colors.darkGrey,
                  placeholder: Colors.darkGrey,
                  background: Colors.white,
                },
              }}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => {
                  setSteps(steps - 1);
                  fadeInStep();
                }}
              >
                <AppText style={styles.modalButtonText}>Preview</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => {
                  fadeInStep();
                  setSteps(steps + 1);
                }}
              >
                <AppText style={styles.modalButtonText}>Next</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        {steps === 2 && (
          <Animated.View
            style={[styles.modalInputContainer, { opacity: fadeAnim }]}
          >
            <TextInput
              style={styles.modalInput}
              label={
                typeof initSteps[2].placeholder === "string"
                  ? initSteps[2].placeholder
                  : ""
              }
              mode="outlined"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.nativeEvent.text })
              }
              theme={{
                colors: {
                  primary: Colors.primary,
                  outline: Colors.darkGrey,
                  placeholder: Colors.darkGrey,
                  background: Colors.white,
                },
              }}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => {
                  setSteps(steps - 1);
                  fadeInStep();
                }}
              >
                <AppText style={styles.modalButtonText}>Preview</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalNextButton}
                onPress={() => {
                  if (!disableButton) {
                    setSteps(steps + 1);
                    fadeInStep();
                  } else {
                    Notifier.showNotification({
                      title: "Oops",
                      description: "Please check your username",
                      Component: NotifierComponents.Alert,
                      componentProps: { alertType: "warn" },
                    });
                  }
                }}
              >
                <AppText style={styles.modalButtonText}>Next</AppText>
              </TouchableOpacity>
            </View>
            <Animated.View
              style={{
                opacity: fadeCheckUsername,
                alignItems: "center",
                padding: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setDisableButton(false);
                }}
                style={{
                  backgroundColor: Colors.primary,
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <AppText style={{ color: Colors.white, fontSize: 20 }}>
                  Check User Name
                </AppText>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
        {steps === 3 && (
          <Animated.View
            style={[styles.modalInputContainer, { opacity: fadeAnim }]}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={{}}>
                <TouchableOpacity
                  onPress={() => {
                    launchImageLibrary(
                      { mediaType: "photo", includeBase64: true },
                      (response) => {
                        if (response.assets && response.assets[0].uri) {
                          setImageUrl(response.assets[0].uri);
                        } else {
                          console.warn("No image selected or invalid response");
                        }
                      }
                    );
                  }}
                  style={{}}
                >
                  <Avatar.Image
                    source={
                      imageUrl
                        ? { uri: imageUrl }
                        : require("@/assets/images/profileIcons/profile.png")
                    }
                    size={100}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalNextButton}
                  onPress={() => {
                    setSteps(steps - 1);
                    fadeInStep();
                  }}
                >
                  <AppText style={styles.modalButtonText}>Preview</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalNextButton}
                  onPress={() => {
                    if (!disableButton) {
                      setSteps(steps + 1);
                      fadeInStep();
                    } else {
                      Notifier.showNotification({
                        title: "Oops",
                        description: "Please check your username",
                        Component: NotifierComponents.Alert,
                        componentProps: { alertType: "warn" },
                      });
                    }
                  }}
                >
                  <AppText style={styles.modalButtonText}>Next</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        {steps === 4 && (
          <Animated.View
            style={[styles.modalInputContainer, { opacity: fadeAnim, flex: 1 }]}
          >
            {Object.entries(formData).map(([fields, value]) => (
              <View key={fields} style={styles.modalInputContainer}>
                <Text>{fields}</Text>
                {typeof value === "string" ? (
                  <TextInput
                    value={value}
                    mode="outlined"
                    style={styles.modalInput}
                    theme={{
                      colors: {
                        primary: Colors.primary,
                        outline: Colors.darkGrey,
                        placeholder: Colors.darkGrey,
                        background: Colors.white,
                      },
                    }}
                  />
                ) : (
                  <></>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={() => {
                handleSubmit();
              }}
            >
              <Text>Submit</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

export default SignupModal;
