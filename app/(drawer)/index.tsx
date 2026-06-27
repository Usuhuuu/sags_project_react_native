import React, { useMemo } from "react";
import { useAuth } from "@/context/auth_context";
import { View } from "react-native";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useAuthQuery } from "@/hooks/useQuery";
import { Redirect, useSegments } from "expo-router";

function DrawerLayout() {
  const { LoginStatus, authInitalizing } = useAuth();
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
  if (!LoginStatus) {
    return <Redirect href={"/(drawer)/(user)/(tab-user)"} />;
  }
  const redirectTarget = useMemo(() => {
    if (!data?.role) return "/(drawer)/(user)/(tab-user)";

    switch (data.role) {
      case "admin":
        return "/(drawer)/(admin)/(tab-admin)/overview";
      case "contractor":
        return "/(drawer)/(contractor)/(tab-contractor)/overview";
      default:
        return "/(drawer)/(user)/(tab-user)";
    }
  }, [data?.role]);

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
  console.log(redirectTarget);
  return <Redirect href={redirectTarget} />;
}

export default DrawerLayout;
