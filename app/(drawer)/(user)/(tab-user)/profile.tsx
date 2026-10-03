import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContractorPage from "@/components/profile/contractor";
import ProfileAdmin from "@/components/profile/admin";
import NormalUser from "@/components/profile/normal";
import { useAuth } from "@/context/auth_context";
import LoginPage from "@/app/auth/login";

import { useTheme } from "@/context/theme_context";
import { useAuthQuery } from "@/hooks/useQuery";
import ServerErrorScreen from "@/app/server_error";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";

const Profile: React.FC = () => {
  const { colors: Colors } = useTheme();

  const { LoginStatus } = useAuth();

  const { data, error, isLoading } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: [`auth_status`] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
      staleTime: 1_000,
      retry: 0,
    },
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <OwnActivaterIndicator />
      </View>
    );
  }
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors.backgroundColor,
        },
      ]}
      edges={!LoginStatus ? ["top"] : ["top", "left", "right"]}
    >
      {!LoginStatus ? (
        <LoginPage />
      ) : (
        <>
          {error ? (
            <ServerErrorScreen statusCode={500} />
          ) : (
            <>
              {data.role === "admin" && <ProfileAdmin />}

              {data.role === "contractor" && <ContractorPage />}

              {data.role === "user" && <NormalUser />}
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 15,
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

export default Profile;
