import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ProfileHeader from "@/components/ProfileHeader";
import { auth_swr } from "@/hooks/useswr";
import { useAuth } from "@/app/(modals)/context/authContext";
import { useTheme } from "@/app/(modals)/context/themeContext";

interface ProfileNormalUserProps {
  copyToClipboard: () => void;
  formData: [
    {
      firstName: string;
      unique_user_ID: string;
    }
  ];
}
const NormalUser: React.FC<ProfileNormalUserProps> = () => {
  const { colors: Colors } = useTheme();

  const [userData, setUserData] = useState(null);
  const { LoginStatus } = useAuth();
  const { data, error } = auth_swr(
    {
      item: {
        pathname: "main",
        cacheKey: "RoleAndProfile_main",
        loginStatus: LoginStatus,
      },
    },
    {
      revalidateOnFocus: true,
    }
  );
  useEffect(() => {
    if (data) {
      const parsedData =
        typeof data.profileData == "string"
          ? JSON.parse(data.profileData)
          : data.profileData;
      setUserData(Array.isArray(parsedData) ? parsedData[0] : parsedData);
    } else if (error) {
      console.log("Error fetching user data: Pisda", error);
    }
  }, [data, error]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.primary, Colors.backgroundColor]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ProfileHeader userData={userData as any} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    zIndex: -10, // Ensure the background is behind other components",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40, // Adjust for safe area / image space
    marginHorizontal: 15,
    backgroundColor: "transparent", // ✅ make background transparent
    position: "absolute", // ✅ position it on top of the content
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // ✅ ensure it's above the profile image
  },
  saved: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    margin: 10,
    height: 200, // Fixed height, adjust as needed
    borderRadius: 20,
    position: "relative", // Ensures that children are positioned correctly
    elevation: 4,
  },
  savedText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    zIndex: 1,
    position: "absolute", // Ensures that the text is positioned correctly
    bottom: 10, // Adjust as needed
    left: 15, // Adjust as needed
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background overlay
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  savedBackground: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "80%",
    flex: 1, // Ensures the background image fills the parent container
    borderRadius: 20,
    backgroundColor: "#e5f0ff", // Dark background overlay
  },
  savedicon: {
    zIndex: 1,
    position: "relative", // Ensures that the icon is positioned correctly
    justifyContent: "center", // Adjust as needed
    alignItems: "center", // Adjust as needed
    width: 80,
    height: 80,
  },
  adminText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  contractorText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});

export default NormalUser;
