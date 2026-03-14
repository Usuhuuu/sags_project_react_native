import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useTheme } from "../../context/themeContext";
import { Entypo } from "@expo/vector-icons";
import { LoginInput } from "../signup_modal";

interface SignupOneProps {
  steps: number;
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  formData: Pick<LoginInput, "userName" | "firstName" | "lastName">;
  setFormData: React.Dispatch<React.SetStateAction<LoginInput>>;
}
const SignupOne = ({
  setSteps,
  steps,
  formData,
  setFormData,
}: SignupOneProps) => {
  const { colors } = useTheme();
  console.log(formData);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 25,
      }}
    >
      {/* Title Section */}
      <View
        style={{
          alignItems: "center",
          marginBottom: 50,
        }}
      >
        <Text
          style={{
            color: colors.themeColorTextPure,
            fontSize: 42,
            fontWeight: "500",
            marginBottom: 10,
          }}
        >
          User Identity
        </Text>
      </View>

      {/* Profile Image Picker */}
      <View style={{ alignItems: "center", marginBottom: 60 }}>
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            borderWidth: 1,
            borderColor: colors.themeColorTextPure,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.backgroundColor,
          }}
        >
          {/* Inner Circle Border */}
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              borderWidth: 1,
              borderColor: colors.themeColorTextPure,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Entypo name="camera" size={40} color={colors.themeColorTextPure} />
          </View>

          {/* Plus Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#00E5FF",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#00E5FF",
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Fields */}
      <View style={{ marginBottom: 30 }}>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#1A1A1A",
            color: "#FFF",
            paddingVertical: 10,
            fontSize: 16,
          }}
          placeholderTextColor="#222"
          placeholder="First Name"
        />
      </View>
      <View style={{ marginBottom: 30 }}>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#1A1A1A",
            color: "#FFF",
            paddingVertical: 10,
            fontSize: 16,
          }}
          placeholderTextColor="#222"
          placeholder="Last Name"
        />
      </View>
      <View style={{ marginBottom: 30 }}>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#1A1A1A",
            color: "#FFF",
            paddingVertical: 10,
            fontSize: 16,
          }}
          placeholderTextColor="#222"
          placeholder="User Name"
        />
      </View>

      {/* Bottom Button with Glow */}
      <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 30 }}>
        <TouchableOpacity
          style={{
            height: 55,
            borderRadius: 15,
            borderWidth: 2,
            borderColor: colors.primary,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            // Shadow/Glow effect for iOS
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            // Elevation for Android
            elevation: 10,
          }}
          onPress={() => {
            setSteps?.((steps += 1));
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            CONTINUE
          </Text>
          <Text style={{ color: "#00E5FF", fontSize: 18, marginLeft: 10 }}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupOne;
