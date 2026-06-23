import React from "react";
import { useAuth } from "@/context/auth_context";
import { View } from "react-native";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useAuthQuery } from "@/hooks/useQuery";
import { Redirect, useSegments } from "expo-router";

function DrawerLayout() {
  const { LoginStatus, authInitalizing } = useAuth();
  const segments = useSegments();
  const { data, isLoading, isFetching } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  if (authInitalizing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OwnActivaterIndicator />
      </View>
    );
  }

  const currentPath = segments.join("/");
  if (!LoginStatus) {
    console.log("INVALID LOGIN");
    if (!currentPath.includes("(tabs-user)")) {
      return <Redirect href="/(drawer)/(user)/(tab-user)" />;
    }
    return null;
  }
  if (isLoading || isFetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OwnActivaterIndicator />
      </View>
    );
  }
  if (!data?.role) {
    console.log("INVALID ACCESS");
    if (!currentPath.includes("(tabs-user)")) {
      return <Redirect href="/(drawer)/(user)/(tab-user)" />;
    }
    return null;
  }

  switch (data?.role) {
    case "admin":
      console.log("ADMIN1");
      if (!currentPath.includes("(tabs-admin)")) {
        return <Redirect href="/(drawer)/(admin)/(tab-admin)/overview" />;
      }
      break;
    case "contractor":
      console.log("CONTRACTOR1");
      if (!currentPath.includes("(tabs-contractor)")) {
        return (
          <Redirect href="/(drawer)/(contractor)/(tab-contractor)/overview" />
        );
      }
      break;
    default:
      console.log("USER1");
      if (!currentPath.includes("(tabs-user)")) {
        return <Redirect href="/(drawer)/(user)/(tab-user)" />;
      }
      break;
  }
}

export default DrawerLayout;
