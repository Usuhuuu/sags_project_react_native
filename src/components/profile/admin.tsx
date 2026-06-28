import axiosInstance from "@/hooks/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/theme_context";
import { useNavigation } from "expo-router";
import { DrawerActions } from "expo-router/build/react-navigation";

interface ProfileAdminProps {
  copyToClipboard: () => Promise<void>;
  formData: any;
}
const ProfileAdmin = ({ copyToClipboard, formData }: ProfileAdminProps) => {
  const { colors: Colors } = useTheme();

  const sendNotification = async () => {
    try {
      const response = await axiosInstance.post("/auth/send-notification", {});
      console.log("Notification sent:", response.data);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };
  const navigation = useNavigation();
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer()); // Dispatch the openDrawer action
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: Colors.primary,
          }}
        >
          Admin Dashboard
        </Text>
        <TouchableOpacity onPress={openDrawer}>
          <Image
            style={{
              width: 40,
              height: 40,
              borderColor: Colors.primary,
              borderWidth: 0.5,
              borderRadius: 50,
            }}
            source={require("@/assets/images/profileIcons/profile.png")}
          />
        </TouchableOpacity>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        {/* Send Notification */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={sendNotification}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Send Notification</Text>
        </TouchableOpacity>

        {/* Perform Other Action */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Other Action</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  topContainer: {
    width: "100%",
    height: 100,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  buttonContainer: {
    marginTop: 30,
    width: "80%",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileAdmin;
