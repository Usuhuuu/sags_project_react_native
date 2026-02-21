import { Redirect } from "expo-router";
import { View } from "react-native";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { useAuthQuery } from "@/hooks/useQuery";
import { useAuth } from "../(modals)/context/authContext";
import React, { useEffect } from "react";
import { queryClient } from "@/hooks/queryClient";

export default function TabsIndex() {
  const { LoginStatus, authInitalizing } = useAuth();

  const {
    data: userData,
    isLoading,
    isFetching,
  } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"],
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  //  Wait for auth bootstrap
  if (authInitalizing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <OwnActivaterIndicator />
      </View>
    );
  }

  // If not logged in
  if (!LoginStatus) {
    console.log("LoginStatus check and move to default");
    return <Redirect href="/(tabs)/(tabs-user)" />;
  }
  // Now wait for role query
  if (isLoading || isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <OwnActivaterIndicator />
      </View>
    );
  }
  //Safety for missing role
  if (!userData?.role) {
    return null;
  }

  // ROLE BASED ROUTING
  switch (userData.role) {
    case "admin":
      return <Redirect href="/(tabs)/(tabs-admin)" />;

    case "contractor":
      return <Redirect href="/(tabs)/(tabs-contractor)" />;

    default:
      return <Redirect href="/(tabs)/(tabs-user)" />;
  }
}
