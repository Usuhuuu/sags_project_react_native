import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth_context";
import { View } from "react-native";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useAuthQuery } from "@/hooks/useQuery";
import { Redirect } from "expo-router";
import type { Href } from "expo-router";
import { mqttService } from "@/hooks/mqttInstance";

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
  const redirectTarget = useMemo((): Href => {
    if (!data?.role) return "/(drawer)/(user)/(tab-user)" as Href;

    switch (data.role) {
      case "admin":
        return "/(drawer)/(user)/(tab-user)" as Href;
      case "contractor":
        return "/(drawer)/(contractor)/(tab-contractor)" as Href;
      default:
        return "/(drawer)/(user)/(tab-user)" as Href;
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

  return <Redirect href={redirectTarget} />;
}

export default DrawerLayout;
