import { useAuthQuery } from "@/hooks/useQuery";
import { useAuth } from "../(modals)/context/authContext";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

export default function TabsIndex() {
  const [userRole, setUserRole] = useState<
    "user" | "admin" | "contractor" | null
  >(null);
  const { LoginStatus } = useAuth();
  const router = useRouter();

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    isFetching,
  } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      staleTime: 0,
      enabled: LoginStatus,
      retry: 1,
    },
  );

  useEffect(() => {
    if (userData) {
      setUserRole(userData.role);
    } else if (userError) {
      console.log("Error fetching user data:", userError);
    }
  }, [userData, userError]);

  useEffect(() => {
    if (!LoginStatus || userLoading || isFetching) return;
    if (!userRole) return;

    console.log("Redirecting as:", userRole);

    switch (userRole) {
      case "admin":
        router.replace("/(tabs)/(tabs-admin)");
        break;
      case "contractor":
        router.replace("/(tabs)/(tabs-contractor)");
        break;
      default:
        router.replace("/(tabs)/(tabs-user)");
        break;
    }
  }, [userRole, LoginStatus, userLoading, isFetching]);

  // While loading / redirecting, show loader
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <OwnActivaterIndicator />
    </View>
  );
}
