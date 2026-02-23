import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { axiosInstanceRegular } from "../../../hooks/axiosInstance";
import { useTranslation } from "react-i18next";

const Page = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
    phoneNumber: "",
    verificationCode: "",
    agree_terms: false,
    agree_privacy: false,
    is_adult: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordHide, setPasswordHide] = useState<boolean>(true);
  const [verificationCompleted, setVerificationCompleted] =
    useState<boolean>(false);
  const [isItPossible, setIsItPossible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { t } = useTranslation();
  const registerDetail: any = t("Register", { returnObjects: true });
  const register = registerDetail[0];
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

    // Check if the password matches the regex
    if (!regex.test(password)) {
      setErrorMessage(
        "Password must be 8-16 characters, include at least one letter, one number, and one special character.",
      );
    } else {
      setErrorMessage("");
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirm_password) {
      Alert.alert("Error", "Passwords must match.");
      return;
    }

    if (!formData.agree_terms || !formData.agree_privacy) {
      Alert.alert("Error", "Please agree to the terms and privacy policy.");
      return;
    }

    if (!verificationCompleted) {
      Alert.alert("Error", "Phone number verification required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstanceRegular.post(
        "/auth/signup",
        formData,
      );
      if (response.status === 200) {
        Alert.alert("Success", response.data.message);
      } else if (response.status === 401) {
        Alert.alert("Error", "User already exists.");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setPasswordHide(!passwordHide);
  };

  const handleSendMSJ = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceRegular.post("/auth/verification", {
        phoneNumber: formData.phoneNumber,
      });

      if (response.status == 200) {
        setVerificationCompleted(true);
        Alert.alert("Success", "Verification code sent.");
      } else {
        Alert.alert("Error", "Failed to send verification code.");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "An error occurred while sending verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserID = async () => {
    try {
      const response = await axiosInstanceRegular.post("/checkunique", {
        unique_user_ID: formData.user_id,
      });
      if (response.data.user_id_available) {
        setIsItPossible(true);
      } else {
        Alert.alert("Error", "User ID is already taken.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to check user ID.");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/zurag2.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.formContainer}>
          {/* User ID Section */}
          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              placeholder={register.userID}
              value={formData.user_id}
              onChangeText={(value) => handleInputChange("user_id", value)}
              clearTextOnFocus={true}
              onFocus={() => setIsItPossible(false)}
              style={[styles.inputField]}
              placeholderTextColor={Colors.grey}
            />
            <TouchableOpacity
              onPress={handleUserID}
              style={styles.button}
              disabled={isItPossible}
            >
              <Text style={styles.buttonText}>{register.checkID}</Text>
            </TouchableOpacity>
          </View>

          {/* Name, Email Section */}
          <TextInput
            placeholder={register.lastName}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
            style={styles.inputField}
            placeholderTextColor={Colors.grey}
          />
          <TextInput
            placeholder={register.firstName}
            value={formData.firstName}
            placeholderTextColor={Colors.grey}
            onChangeText={(value) => handleInputChange("firstName", value)}
            style={styles.inputField}
          />
          <TextInput
            placeholder={register.email}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            style={styles.inputField}
            placeholderTextColor={Colors.grey}
          />

          {/* Phone Verification Section */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={register.phoneNum}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              style={styles.inputFieldRightPhone}
              placeholderTextColor={Colors.grey}
            />
            <TouchableOpacity onPress={handleSendMSJ} style={styles.button}>
              <Text style={styles.buttonText}>
                {register.sendVerificationCode}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verification Code Section */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={register.verificationCode}
              value={formData.verificationCode}
              onChangeText={(value) =>
                handleInputChange("verificationCode", value)
              }
              style={styles.inputFieldRight}
              placeholderTextColor={Colors.grey}
            />
            <TouchableOpacity
              onPress={() => setVerificationCompleted(true)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{register.verify}</Text>
            </TouchableOpacity>
          </View>

          {/* Password and Confirm Password */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={register.password}
              secureTextEntry={passwordHide}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              style={styles.inputFieldRight}
              placeholderTextColor={Colors.grey}
            />
            {errorMessage ? (
              <Text style={{ color: "red" }}>{errorMessage}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handlePasswordToggle}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={passwordHide ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={register.confirmPassword}
              secureTextEntry={passwordHide}
              value={formData.confirm_password}
              onChangeText={(value) =>
                handleInputChange("confirm_password", value)
              }
              style={styles.inputFieldRight}
              placeholderTextColor={Colors.grey}
            />
            <TouchableOpacity
              onPress={handlePasswordToggle}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={passwordHide ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy Agreement */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() =>
                handleInputChange("agree_terms", !formData.agree_terms)
              }
              style={styles.checkbox}
            >
              <Ionicons
                name={formData.agree_terms ? "checkbox" : "square-outline"}
                size={24}
                color={formData.agree_terms ? Colors.primary : "red"}
              />
              <Text style={styles.checkboxText}>
                {register.iagreetothe}
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL("https://your-terms-and-conditions-url.com")
                  }
                >
                  {register.termsConditions}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                handleInputChange("agree_privacy", !formData.agree_privacy)
              }
              style={styles.checkbox}
            >
              <Ionicons
                name={formData.agree_privacy ? "checkbox" : "square-outline"}
                size={24}
                color={formData.agree_privacy ? Colors.primary : "red"}
              />
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL("https://your-privacy-policy-url.com")
                  }
                >
                  {register.privacyPolicy}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{register.register}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scrollViewContainer: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: Colors.light, //"rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: 20,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    marginVertical: 10,
    paddingVertical: 8,
    minWidth: "40%",
  },
  inputFieldRight: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    marginVertical: 10,
    paddingVertical: 8,
    minWidth: "40%",
    maxWidth: "80%",
  },
  inputFieldRightPhone: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    marginVertical: 10,
    paddingVertical: 8,
    minWidth: "40%",
    maxWidth: "40%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  checkboxContainer: {
    marginTop: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  checkboxText: {
    marginLeft: 10,
    color: "#333",
  },
  link: {
    color: "red",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 8,
  },
});

export default Page;
